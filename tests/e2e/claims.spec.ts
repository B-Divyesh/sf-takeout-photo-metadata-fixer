import { expect, test, type Page } from '@playwright/test';
import { unzipSync, zipSync } from 'fflate';
import { readFile } from 'node:fs/promises';

async function downloadDemo(page: Page) {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Inspect the matches' })).toBeVisible();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download repaired ZIP' }).click();
  const path = await (await pending).path();
  return unzipSync(new Uint8Array(await readFile(path!)));
}

function findEntry(archive: Record<string, Uint8Array>, ending: string) {
  const name = Object.keys(archive).find((path) => path.endsWith(ending));
  expect(name, `archive entry ending in ${ending}`).toBeTruthy();
  return archive[name!];
}

function pngExif(bytes: Uint8Array) {
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, false);
    const type = new TextDecoder().decode(bytes.slice(offset + 4, offset + 8));
    if (type === 'eXIf') return bytes.slice(offset + 8, offset + 8 + length);
    offset += length + 12;
  }
  throw new Error('missing PNG eXIf chunk');
}

function hasGpsDirectory(tiff: Uint8Array) {
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const count = view.getUint16(8, true);
  for (let index = 0; index < count; index += 1) if (view.getUint16(10 + index * 12, true) === 0x8825) return true;
  return false;
}

async function storageSnapshot(page: Page) {
  return page.evaluate(async () => {
    const local = Object.fromEntries(Object.keys(localStorage).sort().map((key) => [key, localStorage.getItem(key)]));
    const databases = await indexedDB.databases();
    const indexed: Record<string, unknown> = {};
    for (const info of databases.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))) {
      if (!info.name) continue;
      const database = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open(info.name!); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
      indexed[info.name] = {};
      for (const storeName of [...database.objectStoreNames]) {
        const transaction = database.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const keys = await new Promise<IDBValidKey[]>((resolve, reject) => { const request = store.getAllKeys(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
        const values = await new Promise<unknown[]>((resolve, reject) => { const request = store.getAll(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
        (indexed[info.name] as Record<string, unknown>)[storeName] = { keys, values };
      }
      database.close();
    }
    return JSON.stringify({ local, indexed });
  });
}

test('@claim:demo-sandbox @claim:local-processing sample mode is populated, isolated, resettable, and makes no external request', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.setItem('claim-real-marker', 'unchanged');
    const database = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('takeout-tidy', 1); request.onupgradeneeded = () => request.result.createObjectStore('preferences'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const transaction = database.transaction('preferences', 'readwrite');
    transaction.objectStore('preferences').put({ deduplicate: false }, 'claim-real-options');
    await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
    database.close();
  });
  const before = await storageSnapshot(page);
  const requests: Array<{ url: string; body: string | null }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), body: request.postData() }));
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Lisbon tram.jpg', { exact: true }).first()).toBeVisible();
  await expect(page.locator('input[name="deduplicate"]')).toBeChecked();
  await page.locator('input[name="deduplicate"]').uncheck();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('input[name="deduplicate"]')).toBeChecked();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download repaired ZIP' }).click();
  expect(await (await pending).path()).toBeTruthy();
  expect(await storageSnapshot(page)).toBe(before);
  expect(requests.every(({ url }) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(requests.every(({ body }) => body === null)).toBe(true);
});

test('@claim:jpeg-repair @claim:png-repair @claim:exact-copy-dedupe @claim:date-rename @claim:copy-only-media @claim:pixel-preservation @claim:export-log the sample export has every promised repair result', async ({ page }) => {
  const archive = await downloadDemo(page);
  const jpeg = findEntry(archive, '2022-07-03_07-45-00_Lisbon tram.jpg');
  const png = findEntry(archive, '2022-09-03_14-30-00_Coast walk.png');
  const jpegText = new TextDecoder().decode(jpeg);
  const pngTiff = pngExif(png);
  expect(jpegText).toContain('2022:07:03 07:45:00');
  expect(new TextDecoder().decode(pngTiff)).toContain('2022:09:03 14:30:00');
  expect(hasGpsDirectory(jpeg.slice(12))).toBe(true);
  expect(hasGpsDirectory(pngTiff)).toBe(true);
  expect([...jpeg.slice(-2)]).toEqual([0xff, 0xd9]);
  expect(new TextDecoder().decode(png.slice(-8, -4))).toBe('IEND');
  expect(new TextDecoder().decode(findEntry(archive, '.mp4'))).toBe('sample-video-container');
  expect(new TextDecoder().decode(findEntry(archive, '.heic'))).toBe('sample-heic-container');
  const manifest = JSON.parse(new TextDecoder().decode(archive['takeout-tidy-manifest.json'])) as { files: Array<{ status: string; input: string; output?: string }> };
  expect(manifest.files).toHaveLength(6);
  expect(manifest.files.filter((entry) => entry.status === 'skipped-duplicate')).toHaveLength(1);
  expect(manifest.files.filter((entry) => entry.status === 'copied-container-unchanged')).toHaveLength(2);
  expect(manifest.files.every((entry) => Boolean(entry.status && entry.input))).toBe(true);
});

test('@claim:google-json-match sample matches standard and duplicate-album Google JSON filenames', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Lisbon tram.jpg.supplemental-metadata.json', { exact: true })).toBeVisible();
  await expect(page.getByText('Lisbon tram (1).jpg.json', { exact: true })).toBeVisible();
  await expect(page.getByText('5', { exact: true }).first()).toBeVisible();
});

test('@claim:offline-reload repairs and exports the sample after the connection is disabled', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Inspect the matches' })).toBeVisible();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download repaired ZIP' }).click();
  expect(await (await pending).path()).toBeTruthy();
  await context.setOffline(false);
});

test('@claim:free-file-limit allows 20,000 files and gates 20,001 files', async ({ page }) => {
  test.setTimeout(90_000);
  const makeZip = (count: number) => {
    const entries: Record<string, Uint8Array> = {};
    for (let index = 0; index < count; index += 1) entries[`Takeout/Google Photos/p${String(index).padStart(5, '0')}.jpg`] = new Uint8Array([0xff, 0xd8, 0xff, 0xd9, index & 255]);
    return Buffer.from(zipSync(entries, { level: 0 }));
  };
  await page.goto('/');
  await page.locator('#zip-input').setInputFiles({ name: 'limit.zip', mimeType: 'application/zip', buffer: makeZip(20_000) });
  await expect(page.getByRole('heading', { name: 'Inspect the matches' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download repaired ZIP' })).toBeEnabled();
  await page.getByRole('button', { name: 'Choose other files' }).click();
  await page.locator('#zip-input').setInputFiles({ name: 'over-limit.zip', mimeType: 'application/zip', buffer: makeZip(20_001) });
  await expect(page.getByText('This scan has more than 20,000 files')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download repaired ZIP' })).toBeDisabled();
});

test('@claim:one-time-price shows the exact license price and Sociobot checkout', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('A $12 one-time unlock removes the file limit. There is no subscription.')).toBeVisible();
  const link = page.getByRole('link', { name: 'Buy the $12 unlock' });
  await expect(link).toHaveAttribute('href', 'https://sociobot.in/buy?product=takeout-photo-metadata-fixer');
});

test('@claim:folder-picker imports a selected folder and requests access only after the folder action', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { pickerCalls: number }).pickerCalls = 0;
    (window as unknown as { showDirectoryPicker: () => Promise<unknown> }).showDirectoryPicker = async () => {
      (window as unknown as { pickerCalls: number }).pickerCalls += 1;
      const photo = { kind: 'file', name: 'folder-photo.jpg', getFile: async () => new File([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], 'folder-photo.jpg') };
      const sidecar = { kind: 'file', name: 'folder-photo.jpg.json', getFile: async () => new File([JSON.stringify({ title: 'folder-photo.jpg', photoTakenTime: { timestamp: '1600000000' } })], 'folder-photo.jpg.json') };
      return { kind: 'directory', name: 'Takeout folder', values: async function* () { yield photo; yield sidecar; } };
    };
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start for real' }).click();
  expect(await page.evaluate(() => (window as unknown as { pickerCalls: number }).pickerCalls)).toBe(0);
  await page.getByRole('button', { name: /Choose extracted folder/ }).click();
  expect(await page.evaluate(() => (window as unknown as { pickerCalls: number }).pickerCalls)).toBe(1);
  await expect(page.getByRole('heading', { name: 'Inspect the matches' })).toBeVisible();
  await expect(page.getByText('folder-photo.jpg', { exact: true }).first()).toBeVisible();
});

test('@claim:zip-import imports a Takeout ZIP and reaches the preview', async ({ page }) => {
  const fixture = zipSync({
    'Takeout/Google Photos/one.jpg': new Uint8Array([0xff, 0xd8, 0xff, 0xd9]),
    'Takeout/Google Photos/one.jpg.json': new TextEncoder().encode(JSON.stringify({ title: 'one.jpg', photoTakenTime: { timestamp: '1600000000' } }))
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#zip-input').setInputFiles({ name: 'takeout.zip', mimeType: 'application/zip', buffer: Buffer.from(fixture) });
  await expect(page.getByRole('heading', { name: 'Inspect the matches' })).toBeVisible();
  await expect(page.getByText('one.jpg', { exact: true }).first()).toBeVisible();
});
