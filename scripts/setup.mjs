// Main-checkout setup: `npm ci` + Playwright Chromium. Refuses inside a linked git worktree (29 Q4).
import { spawnSync } from 'node:child_process';

function gitPath(...args) {
  const result = spawnSync('git', ['rev-parse', ...args], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}

function normalise(dir) {
  return dir
    .replace(/[\\/]+/g, '/')
    .replace(/\/$/, '')
    .toLowerCase();
}

// In a linked worktree the git dir (.git/worktrees/<name>) differs from the common git dir (.git).
const gitDir = gitPath('--absolute-git-dir');
const commonDir = gitPath('--path-format=absolute', '--git-common-dir');
if (gitDir && commonDir && normalise(gitDir) !== normalise(commonDir)) {
  console.error(
    'npm run setup refuses to run inside a git worktree.\n' +
      'Install once in the main checkout; worktrees never run npm ci or npm install (CLAUDE.md section 4).',
  );
  process.exit(1);
}

for (const [command, args] of [
  ['npm', ['ci']],
  ['npx', ['playwright', 'install', 'chromium']],
]) {
  // shell: true so `npm` / `npx` resolve to their .cmd shims on Windows.
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    console.error(`setup failed: "${command} ${args.join(' ')}" exited with ${result.status}`);
    process.exit(result.status ?? 1);
  }
}
