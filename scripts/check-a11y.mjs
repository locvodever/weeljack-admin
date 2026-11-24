// Audits every prerendered route with axe (WCAG 2.2 AA) at two sizes in light and dark (28 Q3).
// Serves dist/weeljack-admin/browser under /weeljack-admin/ with a built-in http server, so the audit
// sees exactly what GitHub Pages serves. Any violation, missing CSP tag, CSP violation, request
// outside the local server, or empty route list fails the run.
import AxeBuilder from '@axe-core/playwright';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const BASE = '/weeljack-admin/';
const ROOT = fileURLToPath(new URL('../dist/weeljack-admin/', import.meta.url));
const SITE = join(ROOT, 'browser');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const SIZES = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '390x844', width: 390, height: 844 },
];
const SCHEMES = ['light', 'dark'];
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function loadRoutes() {
  const file = join(ROOT, 'prerendered-routes.json');
  if (!existsSync(file)) return [];
  const { routes } = JSON.parse(readFileSync(file, 'utf8'));
  // Keys carry the base href and no trailing slash: "/weeljack-admin" is the home route.
  return Object.keys(routes ?? {}).map((route) => (route === BASE.slice(0, -1) ? BASE : route));
}

function resolveFile(urlPath) {
  if (!urlPath.startsWith(BASE.slice(0, -1))) return undefined;
  const relative = normalize(decodeURIComponent(urlPath.slice(BASE.length - 1)));
  const target = resolve(SITE, `.${sep}${relative}`);
  if (target !== SITE && !target.startsWith(SITE + sep)) return undefined;
  const candidates = [target, join(target, 'index.html')];
  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

function startServer() {
  const server = createServer((request, response) => {
    const { pathname } = new URL(request.url ?? '/', 'http://localhost');
    const file = resolveFile(pathname);
    if (!file) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    response.end(readFileSync(file));
  });
  return new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolvePromise(server));
  });
}

async function audit(browser, origin, route, size, scheme) {
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    colorScheme: scheme,
  });
  try {
    const page = await context.newPage();
    const problems = [];
    await page.addInitScript(() => {
      globalThis.__cspViolations = [];
      document.addEventListener('securitypolicyviolation', (event) => {
        globalThis.__cspViolations.push(`${event.violatedDirective} ${event.blockedURI}`);
      });
    });
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(`console error: ${message.text()}`);
    });
    page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
    page.on('request', (request) => {
      if (!request.url().startsWith(origin)) problems.push(`external request: ${request.url()}`);
    });

    await page.goto(`${origin}${route}`, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');

    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').count();
    if (csp !== 1) problems.push(`CSP meta tag count is ${csp}, expected 1`);
    const violations = await page.evaluate(() => globalThis.__cspViolations ?? []);
    for (const violation of violations) problems.push(`CSP violation: ${violation}`);

    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    const details = results.violations.map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.nodes.length} node(s), e.g. ${violation.nodes[0]?.target.join(' ')}`,
    );
    return {
      count: results.violations.length + problems.length,
      details: [...details, ...problems],
    };
  } finally {
    await context.close();
  }
}

async function main() {
  const routes = loadRoutes();
  if (routes.length === 0) {
    console.error('check:a11y failed: no prerendered routes found. Run `npm run build` first.');
    return 1;
  }

  const server = await startServer();
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });
  let total = 0;
  const failures = [];
  try {
    for (const route of routes) {
      for (const size of SIZES) {
        for (const scheme of SCHEMES) {
          const { count, details } = await audit(browser, origin, route, size, scheme);
          total += count;
          console.log(`${route}  ${size.name}  ${scheme}  violations: ${count}`);
          for (const detail of details) failures.push(`${route} ${size.name} ${scheme}: ${detail}`);
        }
      }
    }
  } finally {
    await browser.close();
    await new Promise((done) => server.close(done));
  }

  const combinations = routes.length * SIZES.length * SCHEMES.length;
  console.log(
    `check:a11y: ${routes.length} route(s), ${combinations} combination(s), ${total} violation(s) in total`,
  );
  for (const failure of failures) console.error(`  ${failure}`);
  return total === 0 ? 0 : 1;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
