import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';

const root = new URL('../dist/', import.meta.url).pathname;
const publicWorker = new URL('../public/sw.js', import.meta.url).pathname;

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const shell = walk(root)
  .filter((path) => !path.endsWith('.map') && !path.endsWith('/sw.js'))
  .map((path) => `/${relative(root, path).split(sep).join('/')}`);
const version = createHash('sha256').update(JSON.stringify(shell)).digest('hex').slice(0, 12);

const source = readFileSync(publicWorker, 'utf8')
  .replace("const VERSION = 'takeout-tidy-v1';", `const VERSION = 'takeout-tidy-${version}';`)
  .replace(/const SHELL = \[[^;]+;/, `const SHELL = ${JSON.stringify(['/', ...shell])};`);

writeFileSync(join(root, 'sw.js'), source);
