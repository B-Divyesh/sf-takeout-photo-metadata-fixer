import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';

const root = new URL('../dist/', import.meta.url).pathname;
const publicWorker = new URL('../public/sw.js', import.meta.url).pathname;
const publicRoot = new URL('../public/', import.meta.url).pathname;

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
const publicFiles = new Set(walk(publicRoot).map((path) => `/${relative(publicRoot, path).split(sep).join('/')}`));
const hashedAssets = shell.filter((path) => /^\/assets\/.+-[a-z0-9_-]{8,}\.(?:css|js|mjs|map|woff2?|png|jpe?g|webp|avif|svg)$/i.test(path) && !publicFiles.has(path));

const source = readFileSync(publicWorker, 'utf8')
  .replace("const VERSION = 'takeout-tidy-v1';", `const VERSION = 'takeout-tidy-${version}';`)
  .replace(/const SHELL = \[[^;]+;/, `const SHELL = ${JSON.stringify(['/', ...shell])};`);

writeFileSync(join(root, 'sw.js'), source);

// Azure Static Web Apps reads this file from the deployed static root. Keeping
// it build-generated lets its exact immutable routes follow Vite's hashes.
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self' https://api.sociobot.in; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' blob: data:; manifest-src 'self'; media-src 'self' blob:; object-src 'none'; script-src 'self'; style-src 'self'; worker-src 'self'",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};
const staticConfig = {
  navigationFallback: {
    rewrite: '/index.html',
    exclude: ['/assets/*', '/sw.js', '/manifest.webmanifest', '/offline.html', '/privacy/*', '/terms/*']
  },
  globalHeaders: securityHeaders,
  mimeTypes: { '.webmanifest': 'application/manifest+json' },
  routes: [
    ...hashedAssets.map((route) => ({ route, headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } })),
    { route: '/sw.js', headers: { 'Cache-Control': 'no-store', 'Service-Worker-Allowed': '/' } },
    { route: '/manifest.webmanifest', headers: { 'Cache-Control': 'no-store' } }
  ]
};
writeFileSync(join(root, 'staticwebapp.config.json'), `${JSON.stringify(staticConfig, null, 2)}\n`);
