# weeljack-admin — engineering rules

The repo-level contract every executor reads before its first line.

## 1. About

**What this is.** `weeljack-admin` is a free, public admin-app template built on WeeljackNg (`weeljack-ng`, Loc's
Angular UI library over OpenNG's Optimus UI). It has:
- an app shell with a theme configurator;
- a dashboard and a tickets CRUD page;
- login, error, access-denied, not-found and empty pages;
- a landing page.

The demo is a fictional service desk with made-up data. The default look is the Police preset (`wjPolice`).
**"WeeljackNg" / `weeljack-ng` has no "h" on purpose — never "fix" it.**

**Decisions.** Planning lives on the effort map in Loc's Second Brain
(`SecondBrain/projects/weeljack-ng/efforts/weeljack-ng-admin-template/map.md`, with the roadmap beside it). A number in
parentheses below is a ticket there (`questions/NN-*.md`), and nothing here is re-decided in code. `docs/adr/` holds
only the choices that are hard to reverse (27). Read ADR 0001 before adding any code, art or copy.

**Status.** The seed commit holds this file, the licence and ADR 0001. Step T0, the walking skeleton, adds the
Angular app, `npm run check`, CI and Pages. Until it lands, none of the commands below exist.

## 2. Rebuild, never copy (18, 17, ADR 0001)

- Rebuild the *structure* of OpenNG's Sparked (a port of PrimeTek's Sakai) in WeeljackNg's API. Never copy code,
  markup, styles, art, demo data or copy from Sakai, Sparked, or any PrimeTek or OpenNG demo. Read them to learn what a
  page has, then write it fresh.
- Every image is CC0 or made for the template, with one line per file in `ASSETS.md`. That includes inline icons
  copied from an icon set, such as Lucide (ISC).
- Generic and public: no client name, no client data, and no link to a client repo.
- MIT, copyright Loc Vo (`LICENSE`).

## 3. WeeljackNg from npm only (03, 25 Q5, 10)

- Depend on the **published** `weeljack-ng` only, at the first version that has what the step uses. Never put a
  tarball, `file:` or git dependency in `package.json` or the lockfile.
- Import only from `weeljack-ng` and its `weeljack-ng/*` entries, never from `@openng/*` directly (lint bans it). Use no
  `p-*` classes and no `--p-*` variables. Style with plain CSS on `--wj-*`.
- A step that needs an unreleased WeeljackNg feature waits for Loc's publish. To try one locally, run
  `npm run pack:local` in weeljack-ng, then `npm install --no-save <tgz>` here. `npm install` reverts it, and it is
  never merged (29 Q3).
- Every `weeljack-ng` release, and every `dev` → `main` promotion here, is Loc's.

## 4. Commands and definition of done (28, 29)

T0 creates these:

| Command | What it does |
|---|---|
| `npm run setup` | Main checkout only: `npm ci` + `npx playwright install chromium` |
| `npm start` | Dev server on 4200 |
| `npm test` / `npm run test:watch` | Vitest browser mode (Chromium) |
| `npm run lint` / `format` | `eslint . --max-warnings 0 && prettier --check .` / `prettier --write .` |
| `npm run check` | **The gate**, failing fast: lint → typecheck → test → build (prerender) → `check:a11y` → `check:licences` |

- Never run `npm ci`, `npm install` or `setup` inside a worktree (29 Q4).
- Iterate on focused specs, then run `npm run check` once at the end, saved to a log.
- **Done** means:
  - `npm run check` passes;
  - the PR body records the initial bundle and the axe result in light and dark over every route;
  - one draft PR goes into `dev`.

## 5. Branches, commits, releases (26, 31)

- The integration branch is `dev`. Steps branch from it with short-lived `feat/`, `fix/` and `chore/<slug>`
  branches, and open **draft** PRs into `dev`.
- Squash merge only. The PR title is a Conventional Commit subject, and branches are deleted on merge.
- `main` receives `dev` only when Loc promotes it. Its ruleset requires a PR and the `check` and `pr-title` checks,
  and blocks force-push and deletion.
- No npm package and no semver: each promotion gets a dated tag, `v2026.MM.DD`. Pages deploys `main` to
  `https://locvodever.github.io/weeljack-admin/`, and a revert on `main` rolls it back.
- Agents never push to `dev` or `main`, never merge, and never publish or promote anything.

## 6. Disciplines every executor follows

The Second Brain contracts, at `E:/Projects/second-brain/.claude/docs/`:
- `type-discipline.md`: no `any` or `@ts-ignore` escapes without a `// type-escape:` marker.
- `motion-discipline.md`.
- `spec-timing-discipline.md`: `vi.useFakeTimers()` lines carry `// spec-timing:`.
- `test-run-discipline.md`.
- `component-folder-discipline.md`: each component in its own folder.
- `angular-hygiene-discipline.md`.
- `ci-wait.md`.

## 7. Engineering baseline

Copied from the roadmap's engineering baseline. The numbers are the effort map's tickets.

- **B01 Stack and version pins:**
  - `@angular/*` `~22.3.0`, TypeScript `~6.0.3`;
  - `.nvmrc` 26, `engines` `^24.15.0 || ^26.0.0`, `engine-strict`;
  - Vitest `^5.1.0` in browser mode;
  - `chart.js` `^4.6.1`, `@fontsource-variable/public-sans` `^5.3.0`;
  - `weeljack-ng` from npm only;
  - executor `quick-angular-dev`.
  - Source: 24, 23.
- **B02 Repo layout and conventions:**
  - one Angular CLI app on npm, with the seed and app layouts of 25;
  - ESLint 10 plus Prettier 3, OnPush-only, zoneless, banning `@openng/*`, `p-*` and `--p-*`;
  - `CLAUDE.md` with "rebuild, never copy" and "published `weeljack-ng` only".
  - Source: 25.
- **B03 Source control and release:**
  - `dev` integration, with `main` promoted by Loc;
  - squash with Conventional Commit titles;
  - a `main` ruleset;
  - no semver: dated tags on promotion.
  - Source: 26.
- **B04 Decision log:** the effort map plus `docs/adr/`. ADR 0001 is "rebuild, never copy; consume only the published
  weeljack-ng". Source: 27.
- **B05 Testing and definition of done:**
  - Vitest browser mode;
  - strict types and templates;
  - `check:a11y` (axe `wcag22aa`, every route, light and dark, the drawer open);
  - `check:licences`;
  - the gate `npm run check`.
  - Source: 28.
- **B06 Local dev experience:**
  - `setup`, `start`, `test`, `check`;
  - an unreleased `weeljack-ng` only through an unmerged `pack:local` tarball;
  - no installs in worktrees.
  - Source: 29.
- **B08 Dependency policy:**
  - follow WeeljackNg minors, with a Dependabot PR per release;
  - weekly groups;
  - allow-list MIT, Apache-2.0, BSD-2/3, ISC and 0BSD, plus OFL-1.1 for fonts;
  - committed lockfile and `npm ci`.
  - Source: 19.
- **B09 Security baseline:**
  - no auth (a UI-only login) and no secrets;
  - no third-party requests;
  - a CSP meta tag;
  - no `innerHTML` of data, and CSV injection guards;
  - hardened Actions.
  - Source: 30.
- **B12 Path to production:**
  - CI runs `npm run check`;
  - Pages deploys `main` to `https://locvodever.github.io/weeljack-admin/`;
  - a revert rolls back.
  - Source: 31.
- **B14 NFRs and failure modes:**
  - Angular's default budgets;
  - Chart.js and the non-default presets lazy;
  - zoneless and OnPush;
  - no run-time dependency.
  - Source: 32.
- **B16 UI system:**
  - WeeljackNg with `wjPolice` as the default;
  - 44 px controls at a 16 px root;
  - Public Sans;
  - plain CSS on `--wj-*`;
  - WCAG 2.2 AA in both schemes;
  - no i18n in v1.
  - Source: S1, 09, 10.
- **B17 Walking skeleton:** the seed, done by the coordinator after Loc's yes, then T0, which every other template step
  depends on. Source: 33.
- **B18 App flow:** `/`, `/tickets`, `/empty`, `/auth/login`, `/auth/error`, `/auth/access`, `/notfound` and
  `/landing`, with the exits of 21 Q9. Source: 21.

Not applicable: B07 (no runtime config or secret), B10 (no stored data), B11 (no network boundary), B13 (no running
service) and B15 (no PII and no paid service).
