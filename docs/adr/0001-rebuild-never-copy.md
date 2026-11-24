# Rebuild, never copy; consume only the published weeljack-ng

Status: accepted

`weeljack-admin` rebuilds the *structure* of a familiar admin template (OpenNG's Sparked, itself a port of PrimeTek's Sakai) in WeeljackNg's API: which pages there are, and what each page holds. It copies nothing from them. No code, markup, styles, art, demo data or copy is taken from Sakai, Sparked or any PrimeTek or OpenNG demo; a contributor may read them to learn what a page has, then writes it fresh against `wj-*` components and `--wj-*` variables. Every image is CC0 or made for the template, with one line per file in `ASSETS.md`. That keeps the repo MIT under one copyright holder with no third-party notice to carry, and keeps it free of any client's name, data or code.

The template depends on WeeljackNg only through its **published** npm package, `weeljack-ng`, imported through `weeljack-ng` and its `weeljack-ng/*` entries, never through `@openng/*` directly. `package.json` and the lockfile never hold a tarball, `file:` or git dependency. A step that needs an unreleased WeeljackNg feature waits for that release; trying one locally (`npm run pack:local` in weeljack-ng, then `npm install --no-save <tgz>` here) is never committed. So a fresh clone always installs, CI always matches what a user gets, and the template shows WeeljackNg exactly as it ships.

## Considered Options

Forking Sakai or Sparked and swapping its components would be faster, but it would carry PrimeTek's code, art and copy under their notices, tie the template to PrimeNG's classes and variables, and blur what is WeeljackNg's. Depending on weeljack-ng's git `dev` branch, or on a tarball, would let the template use a feature the day it merges, but a clone would then build only on a machine that has that tarball or that commit, and the template would stop showing what users can actually install.

Provenance: WeeljackNg admin-template planning effort, tickets 18, 27 and 03 (November 2026).
