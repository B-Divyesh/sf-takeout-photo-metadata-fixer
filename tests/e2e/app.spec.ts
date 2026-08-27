import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { unzipSync, zipSync } from 'fflate';

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

test('repairs a Takeout ZIP and downloads an auditable archive', async ({ page }) => {
  const fixture = zipSync({
    'Takeout/Google Photos/Album/IMG_0001.jpg': new Uint8Array([0xff, 0xd8, 0xff, 0xd9]),
    'Takeout/Google Photos/Album/IMG_0001.jpg.supplemental-metadata.json': new TextEncoder().encode(JSON.stringify({
      title: 'IMG_0001.jpg',
      photoTakenTime: { timestamp: '1600000000' },
      geoData: { latitude: 51.5, longitude: -0.12, altitude: 16 }
    }))
  });
  await page.goto('/');
  await page.locator('#zip-input').setInputFiles({ name: 'takeout.zip', mimeType: 'application/zip', buffer: Buffer.from(fixture) });
  await expect(page.getByRole('heading', { name: 'Inspect the matches' })).toBeVisible();
  await expect(page.getByText('sidecars matched')).toBeVisible();
  await expect(page.getByText('Ready', { exact: true })).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download ZIP' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const archive = unzipSync(new Uint8Array(await import('node:fs/promises').then((fs) => fs.readFile(path!))));
  const repaired = archive['2020/09/2020-09-13_12-26-40_IMG_0001.jpg'];
  expect([...repaired.slice(0, 4)]).toEqual([0xff, 0xd8, 0xff, 0xe1]);
  expect(archive['takeout-tidy-manifest.json']).toBeTruthy();
  await expect(page.getByText('Archive complete.')).toBeVisible();
});
