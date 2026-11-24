import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkLockfile, isLicenceAllowed } from './check-licences.mjs';

test('fails a stubbed non-allowed licence and names the package and licence', () => {
  const { failures } = checkLockfile({
    packages: {
      '': {},
      'node_modules/fine': { version: '1.0.0', license: 'MIT' },
      'node_modules/copyleft': { version: '1.0.0', license: 'GPL-3.0-only' },
    },
  });
  assert.deepEqual(failures, [{ name: 'copyleft', licence: 'GPL-3.0-only' }]);
});

test('fails a package with no licence', () => {
  const { failures } = checkLockfile({
    packages: { 'node_modules/nolicence': { version: '1.0.0' } },
  });
  assert.deepEqual(failures, [{ name: 'nolicence', licence: '(missing)' }]);
});

test('ignores dev-only packages', () => {
  const { checked, failures } = checkLockfile({
    packages: { 'node_modules/tool': { version: '1.0.0', license: 'GPL-3.0-only', dev: true } },
  });
  assert.equal(checked, 0);
  assert.equal(failures.length, 0);
});

test('allows OFL-1.1 on font packages only', () => {
  assert.equal(isLicenceAllowed('OFL-1.1', '@fontsource-variable/public-sans'), true);
  assert.equal(isLicenceAllowed('OFL-1.1', '@fontsource/inter'), true);
  assert.equal(isLicenceAllowed('OFL-1.1', 'some-library'), false);
});

test('handles SPDX OR and AND', () => {
  assert.equal(isLicenceAllowed('(MIT OR GPL-3.0-only)', 'x'), true);
  assert.equal(isLicenceAllowed('GPL-3.0-only OR LGPL-3.0-only', 'x'), false);
  assert.equal(isLicenceAllowed('MIT AND ISC', 'x'), true);
  assert.equal(isLicenceAllowed('MIT AND GPL-3.0-only', 'x'), false);
  assert.equal(isLicenceAllowed('MIT AND (ISC OR GPL-3.0-only)', 'x'), true);
  assert.equal(isLicenceAllowed('MIT WITH Classpath-exception-2.0', 'x'), false);
});
