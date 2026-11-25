// Fails when a production dependency carries a licence outside the allow-list (19 Q3).
//
// Source: package-lock.json entries not marked `dev`. npm writes each package's `license` into the
// lockfile, so the check needs no install and sees exactly what `npm ci` would ship; the lockfile
// is the committed record of the closure.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const ALLOWED = new Set([
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  '0BSD',
]);
// OFL-1.1 is allowed for font packages only.
const FONT_PACKAGE = /^@fontsource(-variable)?\//;

function tokenise(expression) {
  return expression.match(/\(|\)|[^\s()]+/g) ?? [];
}

/** True when an SPDX expression is acceptable for the package. AND needs all, OR needs any. */
export function isLicenceAllowed(expression, packageName) {
  if (typeof expression !== 'string' || expression.trim() === '') return false;
  const tokens = tokenise(expression);
  let position = 0;

  const isAllowedId = (id) =>
    ALLOWED.has(id) || (id === 'OFL-1.1' && FONT_PACKAGE.test(packageName));

  function parseOr() {
    let result = parseAnd();
    while (tokens[position] === 'OR') {
      position++;
      const right = parseAnd();
      result = result || right;
    }
    return result;
  }

  function parseAnd() {
    let result = parseAtom();
    while (tokens[position] === 'AND') {
      position++;
      const right = parseAtom();
      result = result && right;
    }
    return result;
  }

  function parseAtom() {
    const token = tokens[position++];
    if (token === undefined) return false;
    if (token === '(') {
      const inner = parseOr();
      if (tokens[position] === ')') position++;
      else return false;
      return inner;
    }
    // `WITH` exceptions and any other unknown operator make the expression fail.
    return isAllowedId(token);
  }

  const result = parseOr();
  return result && position === tokens.length;
}

function licenceText(entry) {
  const { license } = entry;
  if (typeof license === 'string') return license;
  if (license && typeof license === 'object' && typeof license.type === 'string')
    return license.type;
  return undefined;
}

/** Walks the production closure of a parsed lockfile. */
export function checkLockfile(lockfile) {
  const failures = [];
  const seen = new Set();
  let checked = 0;
  for (const [path, entry] of Object.entries(lockfile.packages ?? {})) {
    if (path === '' || entry.dev) continue;
    const name =
      entry.name ?? path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length);
    const licence = licenceText(entry);
    checked++;
    if (licence !== undefined) seen.add(licence);
    if (!isLicenceAllowed(licence, name)) {
      failures.push({ name, licence: licence ?? '(missing)' });
    }
  }
  return { checked, seen: [...seen].sort(), failures };
}

function main() {
  const lockfile = JSON.parse(
    readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'),
  );
  const { checked, seen, failures } = checkLockfile(lockfile);
  console.log(`check:licences: ${checked} production packages; licences seen: ${seen.join(', ')}`);
  if (failures.length > 0) {
    for (const { name, licence } of failures) {
      console.error(`  NOT ALLOWED: ${name} (${licence})`);
    }
    console.error(`check:licences failed: ${failures.length} package(s) outside the allow-list.`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
