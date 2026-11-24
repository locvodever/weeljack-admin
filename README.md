# weeljack-admin

A free admin-app template for Angular, built on [WeeljackNg](https://github.com/locvodever/weeljack-ng).

> **Status: seed only.** This commit holds the licence and the rules. The app arrives with the first build step,
> the walking skeleton, so there is nothing to run yet.

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
