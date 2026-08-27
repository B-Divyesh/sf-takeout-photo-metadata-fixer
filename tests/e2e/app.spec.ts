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
  await expect(page.getByRole('button', { name: /Choose Takeout ZIPs/ })).toBeVisible();
  await expect(page.getByText('0 bytes', { exact: false })).toBeVisible();
  expect(errors).toEqual([]);
});

test('has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
  expect(serious).toEqual([]);
});

test('app shell reloads offline after installation', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Put the dates back/ })).toBeVisible();
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
    await navigator.serviceWorker.register('/sw.js?update-test', { scope: '/' });
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
  await expect(page.getByText('sidecars matched')).toBeVisible();
  await expect(page.getByText('Ready', { exact: true }).first()).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download ZIP' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const archive = unzipSync(new Uint8Array(await import('node:fs/promises').then((fs) => fs.readFile(path!))));
  const repairedJpeg = archive['2020/09/2020-09-13_12-26-40_IMG_0001.jpg'];
  const repairedPng = archive['2020/09/2020-09-13_12-26-40_IMG_0002.png'];
  expectGpsTags(jpegTiff(repairedJpeg));
  expectGpsTags(pngTiff(repairedPng));
  expect(archive['takeout-tidy-manifest.json']).toBeTruthy();
  await expect(page.getByText('Archive complete.')).toBeVisible();
});
