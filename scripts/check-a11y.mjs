// Audits every prerendered route with axe (WCAG 2.2 AA) at two sizes in light and dark (28 Q3), plus
// what the pages open: the menu drawer open at 390 x 844, the configurator open at 1440 x 900, the
// dashboard's first agent menu open at 1440 x 900, its chart's data table shown at both sizes and, on
// the tickets page at both sizes, the New ticket dialog open, a row's delete confirm open and the
// "deleted" toast on screen, and on the login page at both sizes the form with its errors shown and
// with the password shown.
// Serves dist/weeljack-admin/browser under /weeljack-admin/ with a built-in http server, so the audit
// sees exactly what GitHub Pages serves: an unknown path is answered with status 404 and the body of
// 404.html (the run fails when 404.html is missing). One unknown, nested URL is audited at both sizes
// in both schemes: it must answer 404 and show the "Page not found" heading. Only that main
// document's own 404 console message is tolerated there. Any violation, missing CSP tag, CSP
// violation, other console error, request outside the local server, or empty route list fails the run.
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
// A nested address no route matches: Pages answers it with 404.html at any depth.
const UNKNOWN_ROUTE = `${BASE}no/such/page`;

// Opens an overlay and waits until it is visible and has stopped moving, so axe measures the settled
// state. Each state runs on the routes in `routes` at one size, in both schemes.
async function settle(page, dialog) {
  await dialog.waitFor({ state: 'visible' });
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running' && a.playState !== 'pending'),
  );
}

const STATES = [
  {
    name: 'drawer-open',
    size: SIZES[1],
    routes: [BASE],
    async prepare(page) {
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await settle(page, page.getByRole('dialog', { name: 'Menu' }));
    },
  },
  {
    name: 'configurator-open',
    size: SIZES[0],
    routes: [BASE],
    async prepare(page) {
      await page.getByRole('button', { name: 'Theme settings' }).click();
      await settle(page, page.getByRole('dialog', { name: 'Theme' }));
    },
  },
  {
    name: 'agent-menu-open',
    size: SIZES[0],
    routes: [BASE],
    async prepare(page) {
      await page
        .getByRole('button', { name: /^Actions for / })
        .first()
        .click();
      await settle(page, page.getByRole('menu', { name: /^Actions for / }));
    },
  },
  ...SIZES.map((size) => ({
    name: 'data-table-shown',
    size,
    routes: [BASE],
    async prepare(page) {
      await page.getByRole('button', { name: 'Show data table' }).click();
      await settle(page, page.getByRole('table', { name: /Tickets by status/ }));
    },
  })),
  ...SIZES.flatMap((size) => [
    {
      name: 'ticket-dialog-open',
      size,
      routes: [`${BASE}tickets`],
      async prepare(page) {
        await page.getByRole('button', { name: 'New', exact: true }).click();
        await settle(page, page.getByRole('dialog', { name: 'New ticket' }));
      },
    },
    {
      name: 'delete-confirm-open',
      size,
      routes: [`${BASE}tickets`],
      async prepare(page) {
        await page.getByRole('button', { name: 'Delete ticket WJ-1032' }).click();
        await settle(page, page.getByRole('alertdialog', { name: 'Delete tickets' }));
      },
    },
    {
      name: 'toast-shown',
      size,
      routes: [`${BASE}tickets`],
      async prepare(page) {
        await page.getByRole('button', { name: 'Delete ticket WJ-1032' }).click();
        const confirm = page.getByRole('alertdialog', { name: 'Delete tickets' });
        await settle(page, confirm);
        await confirm.getByRole('button', { name: 'Delete', exact: true }).click();
        const toast = page.getByText('Ticket WJ-1032 deleted');
        await toast.waitFor({ state: 'visible' });
        // A hovered toast keeps its place: pointing at it stops its 3 s timer, so axe sees it.
        await toast.hover();
        await settle(page, toast);
      },
    },
  ]),
  ...SIZES.flatMap((size) => [
    {
      name: 'login-errors-shown',
      size,
      routes: [`${BASE}auth/login`],
      async prepare(page) {
        await page.getByRole('button', { name: 'Sign in', exact: true }).click();
        await settle(page, page.getByText('Enter your email'));
        await settle(page, page.getByText('Enter your password'));
      },
    },
    {
      name: 'password-shown',
      size,
      routes: [`${BASE}auth/login`],
      async prepare(page) {
        await page.getByRole('button', { name: 'Show Password' }).click();
        await settle(page, page.getByRole('button', { name: 'Hide Password' }));
      },
    },
  ]),
];
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.woff2': 'font/woff2',
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
  const notFoundPage = join(SITE, '404.html');
  const server = createServer((request, response) => {
    const { pathname } = new URL(request.url ?? '/', 'http://localhost');
    const file = resolveFile(pathname);
    if (!file) {
      // As GitHub Pages does: status 404 with the body of 404.html.
      response.writeHead(404, { 'content-type': TYPES['.html'] }).end(readFileSync(notFoundPage));
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

// `unknown` marks the unknown-URL audit: the document must answer 404 and show the not-found heading.
async function audit(browser, origin, route, size, scheme, prepare, unknown = false) {
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
      if (message.type() !== 'error') return;
      // Chromium logs the main document's own 404 as a console error; nothing else is let through.
      if (unknown && message.location().url === `${origin}${route}` && /404/.test(message.text())) {
        return;
      }
      problems.push(`console error: ${message.text()}`);
    });
    page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
    page.on('request', (request) => {
      if (!request.url().startsWith(origin)) problems.push(`external request: ${request.url()}`);
    });

    const response = await page.goto(`${origin}${route}`, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');

    if (unknown) {
      if (response?.status() !== 404) {
        problems.push(`unknown URL answered ${response?.status()}, expected 404`);
      }
      const heading = page.getByRole('heading', { level: 1, name: 'Page not found' });
      if (!(await heading.isVisible())) problems.push('"Page not found" heading is not visible');
      if (new URL(page.url()).pathname !== route) {
        problems.push(`the typed URL changed to ${new URL(page.url()).pathname}`);
      }
    }

    if (prepare) {
      try {
        await prepare(page);
      } catch (error) {
        problems.push(`could not open the state: ${String(error.message).split(/\r?\n/, 1)[0]}`);
      }
    }

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
  if (!existsSync(join(SITE, '404.html'))) {
    console.error('check:a11y failed: 404.html is missing. Run `npm run build` first.');
    return 1;
  }

  const server = await startServer();
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });
  let total = 0;
  let stateCount = 0;
  let unknownCount = 0;
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
      for (const state of STATES.filter((item) => item.routes.includes(route))) {
        for (const scheme of SCHEMES) {
          const { count, details } = await audit(
            browser,
            origin,
            route,
            state.size,
            scheme,
            state.prepare,
          );
          total += count;
          stateCount += 1;
          console.log(
            `${route}  ${state.size.name}  ${scheme}  ${state.name}  violations: ${count}`,
          );
          for (const detail of details) {
            failures.push(`${route} ${state.size.name} ${scheme} ${state.name}: ${detail}`);
          }
        }
      }
    }
    // The unknown URL, served the way Pages serves it.
    for (const size of SIZES) {
      for (const scheme of SCHEMES) {
        const { count, details } = await audit(
          browser,
          origin,
          UNKNOWN_ROUTE,
          size,
          scheme,
          undefined,
          true,
        );
        total += count;
        unknownCount += 1;
        console.log(
          `${UNKNOWN_ROUTE}  ${size.name}  ${scheme}  unknown URL (404)  violations: ${count}`,
        );
        for (const detail of details) {
          failures.push(`${UNKNOWN_ROUTE} ${size.name} ${scheme} unknown URL: ${detail}`);
        }
      }
    }
  } finally {
    await browser.close();
    await new Promise((done) => server.close(done));
  }

  const combinations = routes.length * SIZES.length * SCHEMES.length + stateCount + unknownCount;
  console.log(
    `check:a11y: ${routes.length} route(s), ${combinations} combination(s) (${stateCount} overlay state(s), ${unknownCount} unknown-URL row(s)), ${total} violation(s) in total`,
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
