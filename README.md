# weeljack-admin

A free admin-app template for Angular, built on [WeeljackNg](https://github.com/locvodever/weeljack-ng).

## Getting started

Needs Node 24.15+ or 26 (`.nvmrc` pins 26).

```sh
npm run setup   # main checkout only: npm ci + Playwright Chromium
npm start       # dev server on http://localhost:4200
npm test        # Vitest browser mode (Chromium), single run
npm run check   # the gate: lint, typecheck, test, build, a11y, licences
```

| Command | What it does |
|---|---|
| `npm run setup` | `npm ci` and `npx playwright install chromium`; refuses inside a git worktree |
| `npm start` | Dev server on 4200 |
| `npm test` / `npm run test:watch` | Vitest browser mode (Chromium) |
| `npm run lint` / `npm run format` | ESLint and Prettier check / Prettier write |
| `npm run typecheck` | Strict TypeScript and template type check |
| `npm run build` | Production build, prerendered to static HTML in `dist/weeljack-admin/browser` |
| `npm run check:a11y` | axe (WCAG 2.2 AA) on every prerendered route, two sizes, light and dark |
| `npm run check:licences` | Fails on a production dependency outside the licence allow-list |
| `npm run check` | All of the above, in order, failing fast |

Right now the app is a walking skeleton: one prerendered page that proves the build, tests, checks, CI and Pages
workflow. The pages below arrive in later steps.

## What it will include

- An app shell with a sidebar, a top bar and a theme configurator (preset, primary colour, surface, light or dark).
- A dashboard with stat cards, recent tickets, agent workload, a chart with a data-table alternative, and an activity
  feed.
- A tickets page with create, edit, delete and CSV export.
- Login, error, access-denied, not-found and empty pages, and a landing page.

The demo is a fictional service desk with made-up data. The default look is WeeljackNg's Police preset (`wjPolice`),
and every other WeeljackNg preset is one click away in the configurator.

## Built with

- Angular 22.3, zoneless and prerendered.
- WeeljackNg from npm, styled with plain CSS on its `--wj-*` variables.
- Public Sans (self-hosted) and Chart.js.
- WCAG 2.2 AA in light and dark, checked with axe on every route.

The live demo will be at <https://locvodever.github.io/weeljack-admin/> once `main` is first deployed.

## Licence

MIT, see [LICENSE](LICENSE). The page structure follows the familiar admin-template layout, but nothing is copied from
another template: the code, markup, styles, art and copy are written for this repo
([ADR 0001](docs/adr/0001-rebuild-never-copy.md)). Third-party art and icons, if any, are listed in
[ASSETS.md](ASSETS.md).
