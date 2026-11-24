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
| `npm run build` | Production build, prerendered to static HTML in `dist/weeljack-admin/browser`, then `404.html` copied from the prerendered `/notfound` |
| `npm run check:a11y` | axe (WCAG 2.2 AA) on every prerendered route and an unknown URL (served as Pages does, status 404), two sizes, light and dark |
| `npm run check:licences` | Fails on a production dependency outside the licence allow-list |
| `npm run check` | All of the above, in order, failing fast |

The app has its shell, the dashboard, the tickets page, the small pages and a landing page.

## What is here

- An app shell with a skip link, a top bar, a sidebar (docked from 960 px, a drawer below) and a footer.
- A theme configurator: preset, surface, light or dark, and a Static or Overlay menu. Choices apply at once and are
  remembered in the browser. Police is the default preset, and the first visit follows your OS light or dark setting.
- A dashboard at `/`: stat cards, recent tickets, agent workload, a stacked bar chart of tickets by status per week
  (Chart.js, themed from the active preset, with a "Show data table" alternative), and an activity feed.
- A tickets page at `/tickets`: search, sortable columns, paging with its own "Showing 1 to 10 of 32" report,
  multiple selection, a form dialog to create and edit, a confirm before every delete, toasts, and CSV export of the
  filtered and sorted list (all pages). Edits live in memory and reset on reload. The export quotes every field and
  neutralises a leading `=`, `+`, `-`, `@`, tab or carriage return with a single quote, so a spreadsheet opens it as
  text and never runs it as a formula.

- A mock login at `/auth/login`: a demo, nothing is sent or stored. Sign in checks both fields (an email address and a
  password, with a show-password button), shows each error beside its field, and opens the dashboard.
- Error (`/auth/error`), access-denied (`/auth/access`) and not-found (`/notfound`) pages, and an empty page at `/empty`
  inside the shell. The login and these three are full pages, outside the shell, and still open in your stored theme.
  An unknown address shows the not-found page and keeps what you typed.
- A landing page at `/landing`: a product page for the made-up service desk, outside the shell, with a topbar (a Menu
  toggle below 960 px), a hero, six features, two highlights, three pricing tiers and a footer. Its section links use
  `routerLink` with a `fragment` (not a bare `#id`, which the app's base href would send to the dashboard), so they
  also work with JavaScript off, and choosing one moves focus to that section. Its art is drawn for this template
  ([ASSETS.md](ASSETS.md)).
- `404.html`: `npm run build` copies the prerendered not-found page to `404.html`, which GitHub Pages serves for any
  unknown address.

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
