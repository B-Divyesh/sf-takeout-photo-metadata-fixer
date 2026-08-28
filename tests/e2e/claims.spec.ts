import { expect, test, type Page } from '@playwright/test';
import { unzipSync, zipSync } from 'fflate';
import { readFile, readdir, stat } from 'node:fs/promises';

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

function asciiValue(tiff: Uint8Array, entry: IfdEntry) {
  const offset = entry.count <= 4 ? entry.offset + 8 : entry.value;
  return new TextDecoder().decode(tiff.slice(offset, offset + entry.count)).replace(/\0+$/, '');
}

function tiffValues(tiff: Uint8Array) {
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const ifd0 = entriesAt(tiff, view.getUint32(4, true));
  const exif = entriesAt(tiff, ifd0.get(0x8769)!.value);
  const gps = entriesAt(tiff, ifd0.get(0x8825)!.value);
  const rational = (offset: number) => view.getUint32(offset, true) / view.getUint32(offset + 4, true);
  const coordinate = (entry: IfdEntry) => rational(entry.value) + rational(entry.value + 8) / 60 + rational(entry.value + 16) / 3600;
  const latitude = coordinate(gps.get(0x0002)!);
  const longitude = coordinate(gps.get(0x0004)!);
  return {
    modified: asciiValue(tiff, ifd0.get(0x0132)!),
    original: asciiValue(tiff, exif.get(0x9003)!),
    digitized: asciiValue(tiff, exif.get(0x9004)!),
    latitude: tiff[gps.get(0x0001)!.offset + 8] === 83 ? -latitude : latitude,
    longitude: tiff[gps.get(0x0003)!.offset + 8] === 87 ? -longitude : longitude,
    altitude: rational(gps.get(0x0006)!.value) * (tiff[gps.get(0x0005)!.offset + 8] === 1 ? -1 : 1)
  };
}

function tiffDates(tiff: Uint8Array) {
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const ifd0 = entriesAt(tiff, view.getUint32(4, true));
  const exif = entriesAt(tiff, ifd0.get(0x8769)!.value);
  return {
    modified: asciiValue(tiff, ifd0.get(0x0132)!),
    original: asciiValue(tiff, exif.get(0x9003)!),
    digitized: asciiValue(tiff, exif.get(0x9004)!),
    hasGpsDirectory: ifd0.has(0x8825)
  };
}

function jpegTiff(bytes: Uint8Array) {
  expect([...bytes.slice(0, 12)]).toEqual([0xff, 0xd8, 0xff, 0xe1, expect.any(Number), expect.any(Number), 69, 120, 105, 102, 0, 0]);
  return bytes.slice(12);
}

function removeInsertedJpegExif(bytes: Uint8Array) {
  const segmentLength = (bytes[4] << 8) | bytes[5];
  return Uint8Array.from([bytes[0], bytes[1], ...bytes.slice(4 + segmentLength)]);
}

function removePngExif(bytes: Uint8Array) {
  const chunks = [bytes.slice(0, 8)];
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, false);
    const end = offset + length + 12;
    const type = new TextDecoder().decode(bytes.slice(offset + 4, offset + 8));
    if (type !== 'eXIf') chunks.push(bytes.slice(offset, end));
    offset = end;
    if (type === 'IEND') break;
  }
  const size = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(size);
  let cursor = 0;
  for (const chunk of chunks) { result.set(chunk, cursor); cursor += chunk.length; }
  return result;
}

const originalJpeg = Uint8Array.from(Buffer.from('/9j/4AAQSkZJRgABAQAAAAAAAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAACAAIDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAB//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAH/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AewYU3//Z', 'base64'));
const originalPng = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAGUExURVqelv////7Rk0UAAAABYktHRAH/Ai3eAAAAB3RJTUUH6ggcCjEEnRN33wAAAAxJREFUCNdjYGBgAAAABAABJzQnCgAAAABJRU5ErkJggg==', 'base64'));

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

async function importAndDownloadDateOnly(page: Page, type: 'jpeg' | 'png') {
  const extension = type === 'jpeg' ? 'jpg' : 'png';
  const bytes = type === 'jpeg' ? originalJpeg : originalPng;
  const name = `date-only.${extension}`;
  const fixture = zipSync({
    [`Takeout/Google Photos/${name}`]: bytes,
    [`Takeout/Google Photos/${name}.json`]: new TextEncoder().encode(JSON.stringify({
      title: name,
      photoTakenTime: { timestamp: '1700000000' },
      geoData: { latitude: 0, longitude: 0 }
    }))
  });
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#zip-input').setInputFiles({ name: `${type}-date-only.zip`, mimeType: 'application/zip', buffer: Buffer.from(fixture) });
  const row = page.locator('.file-row:not(.file-header)').filter({ hasText: name });
  await expect(row).toContainText('2023-11-14');
  await expect(row).not.toContainText('location found');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download repaired ZIP' }).click();
  const path = await (await pending).path();
  const archive = unzipSync(new Uint8Array(await readFile(path!)));
  return findEntry(archive, `2023-11-14_22-13-20_${name}`);
}

test('@claim:demo-sandbox @claim:local-processing @claim:no-account sample mode is populated, isolated, resettable, and makes no external request', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.setItem('claim-real-marker', 'unchanged');
    const database = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('takeout-tidy', 1); request.onupgradeneeded = () => request.result.createObjectStore('preferences'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const transaction = database.transaction('preferences', 'readwrite');
    transaction.objectStore('preferences').put({ deduplicate: false, rename: true, renamePattern: 'date-original', organize: 'year-month', includeUnmatched: true }, 'options');
    await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
    database.close();
  });
  const before = await storageSnapshot(page);
  const requests: Array<{ url: string; body: string | null }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), body: request.postData() }));
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in|log in|create account/i })).toHaveCount(0);
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

  const fixture = zipSync({
    'Takeout/Google Photos/real.jpg': originalJpeg,
    'Takeout/Google Photos/real.jpg.json': new TextEncoder().encode(JSON.stringify({ title: 'real.jpg', photoTakenTime: { timestamp: '1600000000' } }))
  });
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#zip-input').setInputFiles({ name: 'real.zip', mimeType: 'application/zip', buffer: Buffer.from(fixture) });
  await expect(page.locator('input[name="deduplicate"]')).not.toBeChecked();
  expect(await storageSnapshot(page)).toBe(before);
});

test('@claim:preview-before-write importing files reaches preview without writing output or saved state', async ({ page }) => {
  await page.addInitScript(() => {
    const signals = { pickerCalls: 0, objectUrls: 0, downloadClicks: 0 };
    (window as unknown as { previewWriteSignals: typeof signals }).previewWriteSignals = signals;
    (window as unknown as { showDirectoryPicker: () => Promise<never> }).showDirectoryPicker = async () => {
      signals.pickerCalls += 1;
      throw new DOMException('Unexpected folder picker', 'AbortError');
    };
    const createObjectURL = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (object: Blob | MediaSource) => {
      signals.objectUrls += 1;
      return createObjectURL(object);
    };
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.download) signals.downloadClicks += 1;
      return click.call(this);
    };
  });
  let downloads = 0;
  page.on('download', () => { downloads += 1; });

  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { name: 'Repair your Google Photos Takeout' })).toBeVisible();
  const before = await storageSnapshot(page);
  const fixture = zipSync({
    'Takeout/Google Photos/preview.jpg': originalJpeg,
    'Takeout/Google Photos/preview.jpg.json': new TextEncoder().encode(JSON.stringify({
      title: 'preview.jpg',
      photoTakenTime: { timestamp: '1600000000' }
    }))
  });

  await page.locator('#zip-input').setInputFiles({ name: 'preview.zip', mimeType: 'application/zip', buffer: Buffer.from(fixture) });
  await expect(page.getByRole('heading', { name: 'Inspect the matches' })).toBeVisible();
  await expect(page.getByText('Nothing has been written.')).toBeVisible();
  await expect(page.getByText('preview.jpg', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Repaired export complete.')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Download repaired ZIP' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Write to a folder' })).toBeEnabled();

  expect(await storageSnapshot(page)).toBe(before);
  expect(await page.evaluate(() => (window as unknown as { previewWriteSignals: { pickerCalls: number; objectUrls: number; downloadClicks: number } }).previewWriteSignals)).toEqual({
    pickerCalls: 0,
    objectUrls: 0,
    downloadClicks: 0
  });
  expect(downloads).toBe(0);
});

test('@claim:exact-copy-dedupe @claim:date-rename @claim:copy-only-media @claim:pixel-preservation @claim:export-log @claim:folder-export the sample export has every promised repair result', async ({ page }) => {
  await page.addInitScript(() => {
    const writes: Record<string, number[] | string> = {};
    (window as unknown as { claimFolderWrites: typeof writes }).claimFolderWrites = writes;
    (window as unknown as { claimFolderPickerCalls: number }).claimFolderPickerCalls = 0;
    const directory = (prefix = ''): unknown => ({
      kind: 'directory',
      name: prefix.split('/').pop() || 'chosen-folder',
      getDirectoryHandle: async (name: string) => directory(`${prefix}${prefix ? '/' : ''}${name}`),
      getFileHandle: async (name: string) => ({
        createWritable: async () => ({
          write: async (data: Uint8Array | string) => { writes[`${prefix}${prefix ? '/' : ''}${name}`] = typeof data === 'string' ? data : [...data]; },
          close: async () => undefined
        })
      })
    });
    (window as unknown as { showDirectoryPicker: () => Promise<unknown> }).showDirectoryPicker = async () => {
      (window as unknown as { claimFolderPickerCalls: number }).claimFolderPickerCalls += 1;
      return directory();
    };
  });
  const archive = await downloadDemo(page);
  const jpeg = findEntry(archive, '2022-07-03_07-45-00_Lisbon tram.jpg');
  const png = findEntry(archive, '2022-09-03_14-30-00_Coast walk.png');
  const jpegMetadata = tiffValues(jpegTiff(jpeg));
  const pngMetadata = tiffValues(pngExif(png));
  expect(jpegMetadata).toMatchObject({ modified: '2022:07:03 07:45:00', original: '2022:07:03 07:45:00', digitized: '2022:07:03 07:45:00' });
  expect(jpegMetadata.latitude).toBeCloseTo(38.7139, 5);
  expect(jpegMetadata.longitude).toBeCloseTo(-9.1394, 5);
  expect(jpegMetadata.altitude).toBe(18);
  expect(pngMetadata).toMatchObject({ modified: '2022:09:03 14:30:00', original: '2022:09:03 14:30:00', digitized: '2022:09:03 14:30:00' });
  expect(pngMetadata.latitude).toBeCloseTo(50.1188, 5);
  expect(pngMetadata.longitude).toBeCloseTo(-5.5371, 5);
  expect(pngMetadata.altitude).toBe(18);
  expect(removeInsertedJpegExif(jpeg)).toEqual(originalJpeg);
  expect(removePngExif(png)).toEqual(originalPng);
  expect(new TextDecoder().decode(findEntry(archive, '.mp4'))).toBe('sample-video-container');
  expect(new TextDecoder().decode(findEntry(archive, '.heic'))).toBe('sample-heic-container');
  expect(new TextDecoder().decode(findEntry(archive, '.heif'))).toBe('sample-heif-container');
  const manifest = JSON.parse(new TextDecoder().decode(archive['takeout-tidy-manifest.json'])) as { files: Array<{ status: string; input: string; output?: string }> };
  expect(manifest.files).toHaveLength(7);
  expect(manifest.files.filter((entry) => entry.status === 'skipped-duplicate')).toHaveLength(1);
  expect(manifest.files.filter((entry) => entry.status === 'copied-container-unchanged')).toHaveLength(3);
  expect(manifest.files.every((entry) => Boolean(entry.status && entry.input))).toBe(true);
  expect(manifest.files.find((entry) => entry.input.endsWith('Lisbon tram.jpg'))?.output).toMatch(/^2022\/07\/2022-07-03_07-45-00_/);
  expect(manifest.files.find((entry) => entry.input.endsWith('Coast walk.png'))?.output).toMatch(/^2022\/09\/2022-09-03_14-30-00_/);

  await page.getByRole('button', { name: 'Write to a folder' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { claimFolderPickerCalls: number }).claimFolderPickerCalls)).toBe(1);
  await expect.poll(() => page.evaluate(() => Object.keys((window as unknown as { claimFolderWrites: Record<string, number[] | string> }).claimFolderWrites).some((path) => path.endsWith('/takeout-tidy-manifest.json')))).toBe(true);
  const writes = await page.evaluate(() => (window as unknown as { claimFolderWrites: Record<string, number[] | string> }).claimFolderWrites);
  const manifestPath = Object.keys(writes).find((path) => path.endsWith('/takeout-tidy-manifest.json'));
  expect(manifestPath).toBeTruthy();
  const folderManifest = JSON.parse(writes[manifestPath!] as string) as { files: unknown[] };
  expect(folderManifest.files).toHaveLength(7);
  expect(Object.keys(writes).filter((path) => !path.endsWith('takeout-tidy-manifest.json'))).toHaveLength(6);
});

test('@claim:jpeg-repair writes a JPEG date and only writes GPS when the Google JSON has a location', async ({ page }) => {
  const archive = await downloadDemo(page);
  const located = tiffValues(jpegTiff(findEntry(archive, '2022-07-03_07-45-00_Lisbon tram.jpg')));
  expect(located).toMatchObject({ modified: '2022:07:03 07:45:00', original: '2022:07:03 07:45:00', digitized: '2022:07:03 07:45:00' });
  expect(located.latitude).toBeCloseTo(38.7139, 5);
  expect(located.longitude).toBeCloseTo(-9.1394, 5);

  const dateOnly = jpegTiff(await importAndDownloadDateOnly(page, 'jpeg'));
  expect(tiffDates(dateOnly)).toEqual({
    modified: '2023:11:14 22:13:20',
    original: '2023:11:14 22:13:20',
    digitized: '2023:11:14 22:13:20',
    hasGpsDirectory: false
  });
});

test('@claim:png-repair writes a PNG date and only writes GPS when the Google JSON has a location', async ({ page }) => {
  const archive = await downloadDemo(page);
  const located = tiffValues(pngExif(findEntry(archive, '2022-09-03_14-30-00_Coast walk.png')));
  expect(located).toMatchObject({ modified: '2022:09:03 14:30:00', original: '2022:09:03 14:30:00', digitized: '2022:09:03 14:30:00' });
  expect(located.latitude).toBeCloseTo(50.1188, 5);
  expect(located.longitude).toBeCloseTo(-5.5371, 5);

  const dateOnly = pngExif(await importAndDownloadDateOnly(page, 'png'));
  expect(tiffDates(dateOnly)).toEqual({
    modified: '2023:11:14 22:13:20',
    original: '2023:11:14 22:13:20',
    digitized: '2023:11:14 22:13:20',
    hasGpsDirectory: false
  });
});

test('@claim:google-json-match sample pairs standard, shortened, and duplicate-album Google JSON filenames', async ({ page }) => {
  await page.goto('/demo');
  const rows = page.locator('.file-row:not(.file-header)');
  await expect(rows.filter({ hasText: 'Lisbon tram.jpg' }).first()).toContainText('Lisbon tram.jpg.supplemental-metadata.json');
  await expect(rows.filter({ hasText: 'Lisbon tram (1).jpg' })).toContainText('Lisbon tram (1).jpg.json');
  await expect(rows.filter({ hasText: 'Portrait from the long summer evening by the sea.heic' })).toContainText('Portrait from the long summer evening.json');
  await expect(page.getByText('6', { exact: true }).first()).toBeVisible();
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
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#zip-input').setInputFiles({ name: 'limit.zip', mimeType: 'application/zip', buffer: makeZip(20_000) });
  await expect(page.getByRole('heading', { name: 'Inspect the matches' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download repaired ZIP' })).toBeEnabled();
  await page.getByRole('button', { name: 'Choose other files' }).click();
  await page.locator('#zip-input').setInputFiles({ name: 'over-limit.zip', mimeType: 'application/zip', buffer: makeZip(20_001) });
  await expect(page.getByText('This scan has more than 20,000 files')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download repaired ZIP' })).toBeDisabled();
});

test('@claim:one-time-price shows the exact license price and Sociobot checkout', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.getByText('A $12 one-time unlock removes the file limit. There is no subscription.')).toBeVisible();
  const link = page.getByRole('link', { name: 'Buy the $12 unlock' });
  await expect(link).toHaveAttribute('href', 'https://sociobot.in/buy?product=takeout-photo-metadata-fixer');
});

test('@claim:large-library-unlock a valid Sociobot license enables export above 20,000 files', async ({ page }) => {
  test.setTimeout(90_000);
  const entries: Record<string, Uint8Array> = {};
  for (let index = 0; index < 20_001; index += 1) entries[`Takeout/Google Photos/p${String(index).padStart(5, '0')}.jpg`] = new Uint8Array([0xff, 0xd8, 0xff, 0xd9, index & 255]);
  const fixture = Buffer.from(zipSync(entries, { level: 0 }));
  let verificationBody: unknown;
  await page.route('https://api.sociobot.in/api/v1/licenses/verify', async (route) => {
    verificationBody = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true }) });
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#zip-input').setInputFiles({ name: 'licensed-library.zip', mimeType: 'application/zip', buffer: fixture });
  const exportButton = page.getByRole('button', { name: 'Download repaired ZIP' });
  await expect(exportButton).toBeDisabled();
  await page.getByLabel('License key').fill('test-license-20001');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Large-library license activated in this browser.')).toBeVisible();
  await expect(exportButton).toBeEnabled();
  expect(verificationBody).toEqual({ license_key: 'test-license-20001', product_slug: 'takeout-photo-metadata-fixer' });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('takeout-tidy-license') ?? '{}'))).toMatchObject({ key: 'test-license-20001', valid: true });
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

test('@claim:zip-import imports multiple Takeout ZIP files into one preview', async ({ page }) => {
  const first = zipSync({
    'Takeout/Google Photos/one.jpg': new Uint8Array([0xff, 0xd8, 0xff, 0xd9]),
    'Takeout/Google Photos/one.jpg.json': new TextEncoder().encode(JSON.stringify({ title: 'one.jpg', photoTakenTime: { timestamp: '1600000000' } }))
  });
  const second = zipSync({
    'Takeout/Google Photos/two.png': originalPng,
    'Takeout/Google Photos/two.png.json': new TextEncoder().encode(JSON.stringify({ title: 'two.png', photoTakenTime: { timestamp: '1600000001' } }))
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#zip-input').setInputFiles([
    { name: 'takeout-one.zip', mimeType: 'application/zip', buffer: Buffer.from(first) },
    { name: 'takeout-two.zip', mimeType: 'application/zip', buffer: Buffer.from(second) }
  ]);
  await expect(page.getByRole('heading', { name: 'Inspect the matches' })).toBeVisible();
  await expect(page.getByText('one.jpg', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('two.png', { exact: true }).first()).toBeVisible();
});

test('@claim:settings-transfer @claim:storage-allowlist real settings and last export stay in the documented browser storage', async ({ page }) => {
  const fixture = zipSync({
    'Takeout/Google Photos/settings.jpg': originalJpeg,
    'Takeout/Google Photos/settings.jpg.json': new TextEncoder().encode(JSON.stringify({ title: 'settings.jpg', photoTakenTime: { timestamp: '1600000000' } }))
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#zip-input').setInputFiles({ name: 'settings.zip', mimeType: 'application/zip', buffer: Buffer.from(fixture) });
  await page.locator('input[name="deduplicate"]').uncheck();
  const exportPending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download repaired ZIP' }).click();
  await exportPending;

  const settingsPending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export settings' }).click();
  const settingsDownload = await settingsPending;
  const settingsPath = await settingsDownload.path();
  const settings = await readFile(settingsPath!, 'utf8');
  expect(JSON.parse(settings)).toMatchObject({ version: 1, options: { deduplicate: false }, lastSession: { mediaCount: 1, matchedCount: 1, exportedCount: 1 } });

  const storage = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('takeout-tidy'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const transaction = database.transaction('preferences', 'readonly');
    const keys = await new Promise<IDBValidKey[]>((resolve, reject) => { const request = transaction.objectStore('preferences').getAllKeys(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    database.close();
    return { databases: (await indexedDB.databases()).map((entry) => entry.name), stores: ['preferences'], keys: keys.map(String).sort(), localKeys: Object.keys(localStorage).sort() };
  });
  expect(storage).toEqual({ databases: ['takeout-tidy'], stores: ['preferences'], keys: ['last-session', 'options'], localKeys: [] });

  await page.evaluate(async () => {
    localStorage.clear();
    await new Promise<void>((resolve, reject) => { const request = indexedDB.deleteDatabase('takeout-tidy'); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); });
  });
  await page.locator('#import-settings').setInputFiles({ name: 'takeout-tidy-settings.json', mimeType: 'application/json', buffer: Buffer.from(settings) });
  await expect(page.locator('input[name="deduplicate"]')).not.toBeChecked();
  await expect(page.getByText('Last export')).toBeVisible();
});

test('@claim:node-runtime @claim:build-output @claim:static-host-security @claim:billing-boundary build and integration contracts are explicit and testable', async () => {
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as { engines: { node: string } };
  expect(packageJson.engines.node).toBe('>=20');

  for (const path of [
    'dist/index.html', 'dist/manifest.webmanifest', 'dist/sw.js', 'dist/offline.html',
    'dist/sitemap.xml', 'dist/robots.txt', 'dist/assets/icon-192.png',
    'dist/assets/icon-512.png', 'dist/assets/icon-maskable-512.png',
    'dist/assets/apple-touch-icon.png', 'dist/assets/social-preview.jpg',
    'dist/staticwebapp.config.json'
  ]) expect((await stat(path)).isFile(), path).toBe(true);

  const staticConfig = JSON.parse(await readFile('dist/staticwebapp.config.json', 'utf8')) as {
    globalHeaders: Record<string, string>;
    mimeTypes: Record<string, string>;
    routes: Array<{ route: string; rewrite?: string; headers?: Record<string, string> }>;
    responseOverrides: Record<string, { rewrite: string }>;
  };
  expect(staticConfig.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
  expect(staticConfig.globalHeaders['X-Frame-Options']).toBe('DENY');
  expect(staticConfig.globalHeaders['Permissions-Policy']).toContain('camera=()');
  expect(staticConfig.mimeTypes['.webmanifest']).toBe('application/manifest+json');
  for (const route of ['/demo', '/privacy', '/terms']) {
    expect(staticConfig.routes.find((entry) => entry.route === route)?.rewrite, route).toBe('/index.html');
  }
  expect(new Set(staticConfig.routes.map((entry) => entry.route)).size).toBe(staticConfig.routes.length);
  expect(staticConfig.routes.find((route) => route.route === '/sw.js')?.headers?.['Cache-Control']).toBe('no-store');
  expect(staticConfig.routes.find((route) => route.route === '/manifest.webmanifest')?.headers?.['Cache-Control']).toBe('no-store');
  expect(staticConfig.routes.some((route) => route.headers?.['Cache-Control']?.includes('immutable'))).toBe(true);
  expect(staticConfig.responseOverrides['404'].rewrite).toBe('/index.html');

  const licenseSource = await readFile('src/license.ts', 'utf8');
  expect(licenseSource).toContain('https://api.sociobot.in/api/v1/licenses/verify');
  expect(licenseSource).toContain('https://sociobot.in/buy?product=takeout-photo-metadata-fixer');
  const bundle = (await Promise.all((await readdir('dist/assets')).filter((name) => name.endsWith('.js')).map((name) => readFile(`dist/assets/${name}`, 'utf8')))).join('\n').toLowerCase();
  for (const provider of ['stripe', 'dodo', 'paddle', 'braintree', 'adyen']) expect(bundle).not.toContain(provider);
});
