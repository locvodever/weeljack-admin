// @ts-check
import angular from 'angular-eslint';
import css from '@eslint/css';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

// Class names and custom properties that belong to PrimeNG / OpenNG, never to this repo.
const P_CLASS = String.raw`(^|\s)p-[a-z]`;
const P_VAR = '--p-';
const P_CLASS_MESSAGE =
  'Do not use PrimeNG "p-*" classes; style with plain CSS on --wj-* variables.';
const P_VAR_MESSAGE = 'Do not use PrimeNG "--p-*" custom properties; use --wj-* variables.';

const nodeGlobals = {
  console: 'readonly',
  process: 'readonly',
  URL: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
};

export default defineConfig([
  // `.worktrees/` holds other checkouts of this repo; linting them from here mixes two tsconfig roots.
  globalIgnores(['dist/', '.angular/', 'coverage/', 'node_modules/', 'out-tsc/', '.worktrees/']),
  {
    files: ['src/**/*.ts'],
    extends: [tseslint.configs.recommended, angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      // Template components use `wjt-` (WeeljackNg template); `wj-` belongs to the library.
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'wjt', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'wjt', style: 'camelCase' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@openng/*'],
              message: 'Import from weeljack-ng only, never @openng/* directly.',
            },
            {
              group: ['zone.js', 'zone.js/*'],
              message: 'The app is zoneless; do not import zone.js.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=/${P_CLASS}/]`, message: P_CLASS_MESSAGE },
        { selector: `Literal[value=/${P_VAR}/]`, message: P_VAR_MESSAGE },
        { selector: `TemplateElement[value.raw=/${P_CLASS}/]`, message: P_CLASS_MESSAGE },
        { selector: `TemplateElement[value.raw=/${P_VAR}/]`, message: P_VAR_MESSAGE },
      ],
    },
  },
  {
    files: ['src/app/**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: `TextAttribute[name='class'][value=/${P_CLASS}/]`, message: P_CLASS_MESSAGE },
        { selector: `BoundAttribute[__originalType=2][name=/^p-/]`, message: P_CLASS_MESSAGE },
        {
          selector: `BoundAttribute[name=/^(class|ngClass)$/] LiteralPrimitive[value=/${P_CLASS}/]`,
          message: P_CLASS_MESSAGE,
        },
        {
          selector: `BoundAttribute[name=/^(class|ngClass)$/] LiteralMap[keys.0.key=/^p-/]`,
          message: P_CLASS_MESSAGE,
        },
      ],
    },
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: 'Declaration[property=/^--p-/]', message: P_VAR_MESSAGE },
        { selector: 'Function[name="var"] Identifier[name=/^--p-/]', message: P_VAR_MESSAGE },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'eslint.config.js'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: nodeGlobals },
  },
]);
