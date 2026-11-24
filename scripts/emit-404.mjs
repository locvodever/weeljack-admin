// Copies the prerendered /notfound page to 404.html, which GitHub Pages serves for any unknown address
// (at any depth). The prerendered HTML carries the base href, so its assets still resolve; the app
// re-renders the `**` route's not-found page over it. Run after `ng build` by `npm run build`.
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = fileURLToPath(new URL('../dist/weeljack-admin/browser/', import.meta.url));
const source = join(SITE, 'notfound', 'index.html');
const target = join(SITE, '404.html');

if (!existsSync(source)) {
  console.error(
    `emit-404 failed: ${source} is missing. /notfound must be a prerendered route (see app.routes.server.ts and prerendered-routes.json).`,
  );
  process.exit(1);
}
copyFileSync(source, target);
console.log(`emit-404: wrote ${target}`);
