import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { unzipSync, zipSync } from 'fflate';

type IfdEntry = { offset: number; type: number; count: number; value: number };

function entriesAt(tiff: Uint8Array, offset: number) {
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const count = view.getUint16(offset, true);
  const entries = new Map<number, IfdEntry>();
  for (let index = 0; index < count; index += 1) {
    const entryOffset = offset + 2 + index * 12;
    entries.set(view.getUint16(entryOffset, true), {
      offset: entryOffset,
      type: view.getUint16(entryOffset + 2, true),
      count: view.getUint32(entryOffset + 4, true),
      value: view.getUint32(entryOffset + 8, true)
    });
  }
  return entries;
}

function gpsEntries(tiff: Uint8Array) {
  const ifd0 = entriesAt(tiff, 8);
  const pointer = ifd0.get(0x8825);
  expect(pointer).toBeDefined();
  expect(pointer?.type).toBe(4);
  return entriesAt(tiff, pointer!.value);
}

function jpegTiff(bytes: Uint8Array) {
  expect([...bytes.slice(0, 12)]).toEqual([0xff, 0xd8, 0xff, 0xe1, expect.any(Number), expect.any(Number), 69, 120, 105, 102, 0, 0]);
  return bytes.slice(12);
}

function pngTiff(bytes: Uint8Array) {
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset, 4);
    const length = view.getUint32(0, false);
    const type = new TextDecoder().decode(bytes.slice(offset + 4, offset + 8));
    if (type === 'eXIf') return bytes.slice(offset + 8, offset + 8 + length);
    offset += length + 12;
  }
  throw new Error('PNG did not contain an eXIf chunk');
}

function expectGpsTags(tiff: Uint8Array) {
  const gps = gpsEntries(tiff);
  expect([...gps.keys()].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  expect(gps.get(1)?.count).toBe(2); // GPSLatitudeRef
  expect(gps.get(2)?.count).toBe(3); // GPSLatitude
  expect(gps.get(3)?.count).toBe(2); // GPSLongitudeRef
  expect(gps.get(4)?.count).toBe(3); // GPSLongitude
  expect(gps.get(5)?.count).toBe(1); // GPSAltitudeRef
  expect(gps.get(6)?.count).toBe(1); // GPSAltitude
  expect(tiff[gps.get(1)!.offset + 8]).toBe(78); // N
  expect(tiff[gps.get(3)!.offset + 8]).toBe(87); // W
}

test('home page exposes the complete starting workflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Takeout Tidy/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('button', { name: /Choose extracted folder/ })).toBeVisible();
  await expect(page.locator('#choose-zips')).toBeVisible();
  await expect(page.getByRole('link', { name: /Try it with sample data/ })).toBeVisible();
  await expect(page.getByText('Free for up to 20,000 files.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('390 px first screen names the job, audience, actions, and three facts without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Repair your Google Photos Takeout' })).toBeVisible();
  await expect(page.getByText('For people leaving Google Photos, restore dates and locations, remove exact copies, and rename files on this device.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Try it with sample data/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Choose your Takeout files' })).toBeVisible();
  await expect(page.locator('.hero-facts li')).toHaveCount(3);
  const facts = await page.locator('.hero-facts').boundingBox();
  expect(facts).not.toBeNull();
  expect(facts!.y + facts!.height).toBeLessThanOrEqual(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('has no serious accessibility violations', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy/', '/terms/', '/missing-page']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    const serious = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
    expect(serious, path).toEqual([]);
  }
});

test('app shell reloads offline after installation', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Repair your Google Photos Takeout/ })).toBeVisible();
  await context.setOffline(false);
});

test('announces a newly waiting service-worker update in the open app', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  // A distinct script URL is a real Service Worker update, but lets this
  // static test server provide a deterministic second worker without writes.
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw-update-test.js', { scope: '/' });
  });
  await expect(page.locator('#toast')).toContainText('A new version is ready.');
  await expect(page.getByRole('button', { name: 'Reload now' })).toBeVisible();
});

test('repairs a Takeout ZIP, including GPS EXIF for JPEG and PNG, and downloads an auditable archive', async ({ page }) => {
  const fixture = zipSync({
    'Takeout/Google Photos/Album/IMG_0001.jpg': new Uint8Array([0xff, 0xd8, 0xff, 0xd9]),
    'Takeout/Google Photos/Album/IMG_0001.jpg.supplemental-metadata.json': new TextEncoder().encode(JSON.stringify({
      title: 'IMG_0001.jpg',
      photoTakenTime: { timestamp: '1600000000' },
      geoDataExif: {},
      geoData: { latitude: 51.5, longitude: -0.12, altitude: 16 }
    })),
    'Takeout/Google Photos/Album/IMG_0002.png': new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]),
    'Takeout/Google Photos/Album/IMG_0002.png.supplemental-metadata.json': new TextEncoder().encode(JSON.stringify({
      title: 'IMG_0002.png',
      photoTakenTime: { timestamp: '1600000000' },
      geoDataExif: { latitude: 51.5 },
      geoData: { latitude: 1, longitude: -0.12, altitude: 16 }
    }))
  });
  await page.goto('/');
  await page.locator('#zip-input').setInputFiles({ name: 'takeout.zip', mimeType: 'application/zip', buffer: Buffer.from(fixture) });
  await expect(page.getByRole('heading', { name: 'Inspect the matches' })).toBeVisible();
  await expect(page.getByText('Google JSON files matched')).toBeVisible();
  await expect(page.getByText('Ready', { exact: true }).first()).toBeVisible();

  const accessibility = await new AxeBuilder({ page: page as never }).analyze();
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download repaired ZIP' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const archive = unzipSync(new Uint8Array(await import('node:fs/promises').then((fs) => fs.readFile(path!))));
  const repairedJpeg = archive['2020/09/2020-09-13_12-26-40_IMG_0001.jpg'];
  const repairedPng = archive['2020/09/2020-09-13_12-26-40_IMG_0002.png'];
  expectGpsTags(jpegTiff(repairedJpeg));
  expectGpsTags(pngTiff(repairedPng));
  expect(archive['takeout-tidy-manifest.json']).toBeTruthy();
  await expect(page.getByText('Repaired export complete.')).toBeVisible();
});

test('demo, legal, and not-found routes have distinct metadata and focus', async ({ page }) => {
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Takeout Tidy');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/demo$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-preview\.jpg$/);
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page).toHaveTitle('Privacy — Takeout Tidy');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/privacy\/$/);
  await page.goBack();
  await expect(page).toHaveTitle('Demo — Takeout Tidy');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goto('/definitely-not-a-route');
  await expect(page).toHaveTitle('Page not found — Takeout Tidy');
  await expect(page.getByRole('heading', { name: 'This page is not in the archive' })).toBeFocused();
  await expect(page.getByRole('link', { name: 'Return to repair tool' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/definitely-not-a-route$/);
});

test('legal and offline pages load without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  for (const path of ['/privacy/', '/terms/', '/offline.html']) {
    await page.goto(path);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(245, 235, 216)');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-family', /Georgia/);
  }
  expect(errors).toEqual([]);
});

test('file filters and chooser controls meet the touch target minimum', async ({ page }) => {
  await page.goto('/demo');
  for (const button of await page.locator('.filter').all()) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  for (const button of await page.locator('.demo-banner button').all()) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.goto('/');
  await expect(page.locator('#drop-action')).toBeVisible();
  expect((await page.locator('#drop-action').boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

test('drop action opens the ZIP picker by pointer, Enter, and Space', async ({ page }) => {
  await page.goto('/');
  const action = page.locator('#drop-action');
  for (const activate of [
    () => action.click(),
    async () => { await action.focus(); await page.keyboard.press('Enter'); },
    async () => { await action.focus(); await page.keyboard.press('Space'); }
  ]) {
    const chooser = page.waitForEvent('filechooser');
    await activate();
    await chooser;
  }
});

test('publishes a real sitemap and social assets', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(sitemap.headers()['content-type']).toContain('xml');
  expect(await sitemap.text()).toContain('<loc>https://takeout-photo-metadata-fixer.sociobot.in/demo</loc>');
  const social = await request.get('/assets/social-preview.jpg');
  expect(social.ok()).toBe(true);
  expect((await social.body()).byteLength).toBeGreaterThan(100_000);
});
