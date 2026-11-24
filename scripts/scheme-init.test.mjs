// public/scheme-init.js sets the dark class on <html> before the app boots (FR-2). It cannot import
// anything, so this test keeps it honest: its key and class must be the ones LayoutService uses, and
// it must behave (stored scheme wins, the OS decides otherwise, bad storage never throws).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const service = read('../src/app/layout/layout.service.ts');
const script = read('../public/scheme-init.js');

function constant(name) {
  const match = new RegExp(`const ${name} = '([^']+)';`).exec(service);
  assert.ok(match, `${name} not found in layout.service.ts`);
  return match[1];
}

const KEY = constant('LAYOUT_STORAGE_KEY');
const DARK_CLASS = constant('DARK_CLASS');

// Runs the script against fake browser globals; returns whether <html> ended up with the dark class.
function run({ stored, osDark, storageThrows = false, matchMediaThrows = false }) {
  const classes = new Set();
  const sandbox = {
    localStorage: {
      getItem(key) {
        if (storageThrows) throw new Error('blocked');
        return key === KEY ? (stored ?? null) : null;
      },
    },
    window: {
      matchMedia(query) {
        if (matchMediaThrows) throw new Error('unsupported');
        return { matches: query === '(prefers-color-scheme: dark)' && osDark };
      },
    },
    document: {
      documentElement: {
        classList: {
          toggle(name, force) {
            if (force) classes.add(name);
            else classes.delete(name);
          },
        },
      },
    },
  };
  vm.runInNewContext(script, sandbox);
  assert.deepEqual(Object.keys(sandbox).sort(), ['document', 'localStorage', 'window']);
  return classes.has(DARK_CLASS);
}

test('reads the storage key and sets the class LayoutService uses; stored scheme beats the OS', () => {
  assert.equal(run({ stored: JSON.stringify({ scheme: 'dark' }), osDark: false }), true);
  assert.equal(run({ stored: JSON.stringify({ scheme: 'light' }), osDark: true }), false);
});

test('with no stored scheme the OS decides', () => {
  assert.equal(run({ osDark: true }), true);
  assert.equal(run({ osDark: false }), false);
  assert.equal(run({ stored: JSON.stringify({ preset: 'police' }), osDark: true }), true);
});

test('an unknown scheme value falls back to the OS', () => {
  assert.equal(run({ stored: JSON.stringify({ scheme: 'sepia' }), osDark: true }), true);
  assert.equal(run({ stored: JSON.stringify({ scheme: 'sepia' }), osDark: false }), false);
});

test('garbage, null or non-object JSON falls back to the OS and does not throw', () => {
  for (const stored of ['{not json', 'null', '42', '"dark"', '[]']) {
    assert.equal(run({ stored, osDark: true }), true, stored);
    assert.equal(run({ stored, osDark: false }), false, stored);
  }
});

test('blocked storage or a missing matchMedia never throws', () => {
  assert.equal(run({ storageThrows: true, osDark: true }), true);
  assert.equal(run({ storageThrows: true, osDark: false }), false);
  assert.doesNotThrow(() => run({ stored: '{}', osDark: true, matchMediaThrows: true }));
  assert.equal(run({ stored: '{}', osDark: true, matchMediaThrows: true }), false);
});
