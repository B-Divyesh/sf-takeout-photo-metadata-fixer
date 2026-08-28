import './styles.css';
import { createDemoScan } from './demo';
import { BUY_URL, hasLargeLibraryLicense, verifyLicense } from './license';
import { exportToDirectory, exportToZip, type DirectoryHandleLike } from './exporter';
import { exportPreferences, importPreferences, loadOptions, loadSession, saveOptions, saveSession } from './storage';
import { filesFromDataTransfer, filesFromDirectory, filesFromInput, filesFromZips, scanSources } from './takeout';
import type { ProgressUpdate, RepairOptions, ScanResult, SessionSummary, SourceFile, SourceKind } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
const FREE_FILE_LIMIT = 20_000;
const BUILD_ID = '1.0.1 · polish 1';
const SITE = 'https://takeout-photo-metadata-fixer.sociobot.in';
const defaults: RepairOptions = { deduplicate: true, rename: true, renamePattern: 'date-original', organize: 'year-month', includeUnmatched: true };
type Route = 'home' | 'demo' | 'privacy' | 'terms' | 'not-found';

let route = routeFromLocation();
let demoMode = route === 'demo';
let options = { ...defaults };
let scan: ScanResult | undefined;
let scanning = false;
let progress: ProgressUpdate | undefined;
let lastSession: SessionSummary | undefined;
let filter: 'all' | 'matched' | 'unmatched' | 'unsupported' = 'all';
let query = '';
let licensed = false;
let completedMessage = '';
let errorMessage = '';
let lastProgressPaint = 0;
let waitingWorker: ServiceWorker | undefined;
let reloadAfterUpdate = false;
let toastTimer: number | undefined;
let pendingOptionsSave: Promise<void> = Promise.resolve();

const icon = (name: 'folder' | 'zip' | 'shield' | 'arrow' | 'check' | 'warning' | 'download' | 'photo') => {
  const paths = {
    folder: '<path d="M3 7.5h6l2-2h4a2 2 0 0 1 2 2v1H3z"/><path d="M3 8.5h16l-2 10H4z"/>',
    zip: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M10 7h2m-2 3h2m-2 3h2m-3 3h4v3H9z"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.7 3.2 8.1 7.5 9.5 4.3-1.4 7.5-4.8 7.5-9.5V6z"/><path d="m8.8 12 2.1 2.1 4.5-4.6"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>', check: '<path d="m5 12 4 4L19 6"/>',
    warning: '<path d="M12 4 3 20h18z"/><path d="M12 9v5m0 3h.01"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>',
    photo: '<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-5 3 3 3-3 5 5"/>'
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
};
const formatNumber = (value: number) => new Intl.NumberFormat().format(value);
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);

function routeFromLocation(): Route {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/demo' || (path === '/' && new URLSearchParams(location.search).get('demo') === '1')) return 'demo';
  if (path === '/') return 'home';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  return 'not-found';
}

const metadata: Record<Route, { title: string; description: string; canonical: string }> = {
  home: { title: 'Takeout Tidy — repair Google Photos dates', description: 'Fix dates and locations in Google Photos exports. Remove exact copies and rename files without uploading photos.', canonical: '/' },
  demo: { title: 'Demo — Takeout Tidy', description: 'Try Takeout Tidy with a private sample Google Photos export.', canonical: '/demo' },
  privacy: { title: 'Privacy — Takeout Tidy', description: 'How Takeout Tidy handles photos, Google JSON files, settings, and license checks.', canonical: '/privacy/' },
  terms: { title: 'Terms — Takeout Tidy', description: 'Terms for repairing a Google Photos Takeout with Takeout Tidy.', canonical: '/terms/' },
  'not-found': { title: 'Page not found — Takeout Tidy', description: 'This paper label does not match a page. Return to the Takeout repair tool.', canonical: location.pathname }
};

function setMetadata() {
  const value = metadata[route];
  document.title = value.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = value.description;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = `${SITE}${value.canonical}`;
  for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) document.querySelector<HTMLMetaElement>(selector)!.content = value.title;
  for (const selector of ['meta[property="og:description"]', 'meta[name="twitter:description"]']) document.querySelector<HTMLMetaElement>(selector)!.content = value.description;
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')!.content = `${SITE}${value.canonical}`;
}

function shell(content: string) {
  return `${demoMode ? `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span><button id="reset-demo" type="button">Reset demo</button><button id="start-real" type="button">Start for real</button></span></aside>` : ''}
    <header class="site-header"><a class="brand" href="/" data-route aria-label="Takeout Tidy home"><span class="brand-mark" aria-hidden="true">${icon('photo')}</span><span>Takeout Tidy</span></a><nav aria-label="Primary navigation"><a href="/demo" data-route>Demo</a><a href="/#how-it-works">Takeout repair</a><a href="/privacy/" data-route>Privacy</a></nav></header>
    ${content}
    <footer class="site-footer"><div><span class="brand-footer">Takeout Tidy</span><p>Repair Google Photos dates on your device.</p></div><nav aria-label="Footer navigation"><a href="/demo" data-route>Demo</a><a href="/privacy/" data-route>Privacy</a><a href="/terms/" data-route>Terms</a>${route === 'home' ? '<button class="text-button" id="export-settings">Export settings</button><label class="text-button file-label">Import settings<input id="import-settings" type="file" accept="application/json" /></label>' : ''}</nav><p class="provenance">Built by Param Factory · Paper archive bench · Build ${BUILD_ID}</p></footer>
    <div class="route-status visually-hidden" role="status" aria-live="polite"></div><div id="toast" class="toast" role="status" aria-live="polite" hidden></div>`;
}

function homeView() {
  return `<main id="main"><section class="hero" aria-labelledby="page-title"><div class="hero-copy"><p class="eyebrow"><span></span> Private photo repair</p><h1 id="page-title" tabindex="-1">Repair your Google Photos Takeout</h1><p class="lede">For people leaving Google Photos, restore dates and locations, remove exact copies, and rename files on this device.</p><div class="hero-actions"><a class="button primary" href="/demo" data-route>Try it with sample data ${icon('arrow')}</a><a class="button quiet" href="#repair">Choose your Takeout files</a></div><p class="action-note">Preview matches before anything is written.</p><ul class="hero-facts"><li>${icon('shield')} Photos stay on this device.</li><li>${icon('check')} Works offline after the first load.</li><li>${icon('check')} Free for up to 20,000 files.</li></ul></div>
    <figure class="hero-art"><picture><source srcset="/assets/hero-paper-archive-640.webp 640w, /assets/hero-paper-archive.webp 1024w" sizes="(max-width: 850px) calc(100vw - 28px), 52vw" type="image/webp"/><img src="/assets/hero-paper-archive.jpg" width="1024" height="683" alt="Paper photos and Google JSON cards enter a sorter and leave in date order." fetchpriority="high" decoding="async"/></picture><figcaption>Takeout files in. Photos sorted by date, with exact copies removed.</figcaption></figure></section>
    ${repairSection()}
    <section class="how" id="how-it-works" aria-labelledby="how-title"><p class="eyebrow"><span></span> Repair in three steps</p><h2 id="how-title">How Takeout repair works</h2><ol><li><span class="paper-number">01</span><div><h3>Match photos to Google JSON files</h3><p>Matches JSON files, shortened Google filenames, and duplicate album filenames.</p></div></li><li><span class="paper-number">02</span><div><h3>Keep the original photo pixels</h3><p>Adds the Google date and location to each supported photo.</p></div></li><li><span class="paper-number">03</span><div><h3>Export repaired files</h3><p>Skips exact copies, renames files by date, and logs each result.</p></div></li></ol></section>
    <section class="privacy-strip" aria-labelledby="privacy-title"><div class="cut-shield">${icon('shield')}</div><div><h2 id="privacy-title">Your photos stay on this device</h2><p>The repair runs in your browser. It needs no account and sends no photo, filename, or Google JSON data to a server.</p></div><a href="/privacy/" data-route>Read the privacy policy</a></section>
    <section class="price-strip" aria-labelledby="price-title"><p class="kicker">Large libraries</p><h2 id="price-title">Repair up to 20,000 files free</h2><p>A $12 one-time unlock removes the file limit. There is no subscription.</p><a class="button secondary" href="${BUY_URL}" rel="external">Buy the $12 unlock</a></section>
    ${lastSession ? `<aside class="last-run"><strong>Last export</strong><span>${new Date(lastSession.at).toLocaleDateString()} · ${formatNumber(lastSession.exportedCount)} files written from “${escapeHtml(lastSession.sourceLabel)}”</span></aside>` : ''}</main>`;
}

function demoView() {
  return `<main id="main" class="demo-main"><section class="demo-intro"><p class="eyebrow"><span></span> Sample repair</p><h1 id="page-title" tabindex="-1">Inspect a sample Google Photos Takeout</h1><p>This in-memory sample includes repaired photos, an exact copy, an unmatched file, and copy-only media.</p></section>${repairSection()}</main>`;
}

function legalView(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy';
  return `<main id="main" class="legal-main"><article class="legal-sheet"><p class="kicker">Takeout Tidy</p><h1 id="page-title" tabindex="-1">${privacy ? 'Privacy, in plain language' : 'Terms of use'}</h1><p><strong>Effective August 28, 2026.</strong> ${privacy ? 'Takeout Tidy processes your library on your device.' : 'By using Takeout Tidy, you agree to these terms.'}</p>
    ${privacy ? `<h2>Selected files</h2><p>Photos, videos, ZIP files, Google JSON files, hashes, repaired files, and export logs stay in your browser. They are not uploaded.</p><h2>Browser storage</h2><p>Real mode stores repair settings, the last export summary, and an activated license. Demo mode reads and writes none of them.</p><h2>Network requests</h2><p>This site loads its own static files. A license key is sent to the Sociobot API only after you choose Verify license.</p><h2>Your control</h2><p>Clear saved settings with your browser’s site controls. Exported ZIP files and folders remain under your control.</p>` : `<h2>Keep your original files</h2><p>Keep an untouched copy of your Takeout. Review the preview and export log before importing repaired files elsewhere.</p><h2>What the tool changes</h2><p>The tool can add dates and locations to JPEG and PNG files. It can skip exact copies, rename files, and copy other media unchanged.</p><h2>No warranty</h2><p>The software is provided “as is.” Google exports and photo software can change, so every Google JSON file may not match.</p><h2>Paid unlock</h2><p>The $12 large-library unlock is a one-time license. Sociobot handles checkout, refunds, and license checks.</p><h2>Liability</h2><p>To the extent allowed by law, Sociobot and contributors are not liable for data loss or indirect damages.</p>`}<p><a href="/${privacy ? 'terms' : 'privacy'}/" data-route>Read the ${privacy ? 'terms' : 'privacy policy'}</a></p></article></main>`;
}

function notFoundView() { return `<main id="main" class="not-found"><section class="lost-label"><span class="paper-number">404</span><p class="kicker">Unmatched label</p><h1 id="page-title" tabindex="-1">This page is not in the archive</h1><p>The address does not match a Takeout Tidy page.</p><a class="button primary" href="/" data-route>Return to repair tool</a></section></main>`; }
function repairSection() { return `<section class="repair-sheet" id="repair" aria-labelledby="repair-title"><div class="sheet-tape" aria-hidden="true"></div><div class="steps" aria-label="Repair progress"><span class="active"><b>1</b> Choose</span><i></i><span class="${scan ? 'active' : ''}"><b>2</b> Inspect</span><i></i><span class="${completedMessage ? 'active' : ''}"><b>3</b> Export</span></div>${scan ? resultsView() : chooserView()}</section>`; }

function chooserView() {
  return `<div class="chooser-heading"><p class="kicker">Step 1</p><h2 id="repair-title">Choose your Takeout files</h2><p>Choose an extracted folder or one or more Takeout ZIP files.</p></div><div class="source-grid" ${scanning ? 'aria-busy="true"' : ''}><button class="source-choice" id="choose-folder" ${scanning ? 'disabled' : ''}><span class="source-icon folder">${icon('folder')}</span><span><strong>Choose extracted folder</strong><small>Read files from a folder you select</small></span>${icon('arrow')}</button><button class="source-choice" id="choose-zips" ${scanning ? 'disabled' : ''}><span class="source-icon zip">${icon('zip')}</span><span><strong>Choose Takeout ZIP files</strong><small>Import one or more ZIP files</small></span>${icon('arrow')}</button><input id="folder-input" class="visually-hidden" type="file" webkitdirectory multiple aria-label="Choose extracted Takeout folder"/><input id="zip-input" class="visually-hidden" type="file" accept=".zip,application/zip" multiple aria-label="Choose Takeout ZIP files"/></div><div class="drop-zone" id="drop-zone"><button type="button" id="drop-action">${icon('download')}<span>Choose ZIP files, or drag a folder here</span></button></div>${progress ? progressView() : ''}${errorMessage ? `<div class="notice error" role="alert">${icon('warning')}<div><strong>We could not scan those files.</strong><p>${escapeHtml(errorMessage)} Choose another folder or ZIP file.</p></div></div>` : ''}<p class="support-note">Repairs dates and locations in JPEG and PNG photos. Copies HEIC, HEIF, and video files without changing their metadata. Photo pixels are not changed.</p>`;
}

function resultsView() {
  const matches = scan!.matchedCount + scan!.unsupportedCount;
  const rate = scan!.mediaCount ? Math.round(matches / scan!.mediaCount * 100) : 0;
  const visible = scan!.items.filter((item) => (filter === 'all' || item.status === filter) && (!query || item.source.path.toLowerCase().includes(query.toLowerCase()))).slice(0, 200);
  const overLimit = scan!.items.length > FREE_FILE_LIMIT && !licensed;
  return `<div class="results-heading"><div><p class="kicker">Step 2</p><h2 id="repair-title">Inspect the matches</h2><p>Nothing has been written. Review each match and choose the repaired export.</p></div><button class="button quiet" id="start-over">${demoMode ? 'Reset sample' : 'Choose other files'}</button></div><div class="inventory" aria-label="Scan summary"><div><strong>${formatNumber(scan!.mediaCount)}</strong><span>media files</span></div><div class="success"><strong>${formatNumber(matches)}</strong><span>Google JSON files matched</span></div><div><strong>${rate}%</strong><span>match rate</span></div><div class="attention"><strong>${formatNumber(scan!.unmatchedCount)}</strong><span>needs review</span></div></div>${scan!.mediaCount === 0 ? `<div class="notice error" role="alert">${icon('warning')}<div><strong>No photos or videos were found.</strong><p>Choose the Google Photos folder inside your Takeout.</p></div></div>` : ''}${scan!.invalidSidecars ? `<div class="notice warning">${icon('warning')}<div><strong>${formatNumber(scan!.invalidSidecars)} Google JSON file could not be read.</strong><p>It was left unmatched.</p></div></div>` : ''}${overLimit ? licenseView() : ''}<div class="work-grid"><section class="preview" aria-labelledby="preview-title"><div class="preview-head"><div><h3 id="preview-title">File preview</h3><p>Showing ${formatNumber(visible.length)} of ${formatNumber(scan!.items.length)}</p></div><label class="search"><span class="visually-hidden">Search files</span><input id="search" type="search" value="${escapeHtml(query)}" placeholder="Search filenames"/></label></div><div class="filters" role="group" aria-label="Filter files">${(['all', 'matched', 'unmatched', 'unsupported'] as const).map((value) => `<button class="filter ${filter === value ? 'active' : ''}" data-filter="${value}" aria-pressed="${filter === value}">${value === 'all' ? 'All' : value === 'unsupported' ? 'Copy-only' : value[0].toUpperCase() + value.slice(1)}</button>`).join('')}</div><div class="file-list" role="table" aria-label="Matched Takeout files"><div class="file-row file-header" role="row"><span role="columnheader">Photo</span><span role="columnheader">Google JSON file</span><span role="columnheader">Repair</span></div>${visible.length ? visible.map((item) => { const date = item.metadata?.timestamp ? new Date(item.metadata.timestamp * 1000).toISOString().slice(0, 10) : '—'; const label = item.status === 'matched' ? 'Ready' : item.status === 'unsupported' ? 'Copy-only' : 'Unmatched'; return `<div class="file-row" role="row"><span role="cell" data-label="Photo"><b>${escapeHtml(item.source.name)}</b><small>${escapeHtml(item.source.path)}</small></span><span role="cell" data-label="Google JSON file">${item.sidecar ? `<b>${escapeHtml(item.sidecar.name)}</b><small>${date}${item.metadata?.latitude !== undefined ? ' · location found' : ''}</small>` : '<b>Not found</b><small>Original can still be copied</small>'}</span><span role="cell" data-label="Repair"><em class="status ${item.status}">${label}</em></span></div>`; }).join('') : '<div class="empty-filter">No files match this filter.</div>'}</div></section><form class="options" id="options-form"><h3>Repaired export</h3><label class="check"><input type="checkbox" name="deduplicate" ${options.deduplicate ? 'checked' : ''}/><span><strong>Skip exact copies</strong><small>Compares file bytes</small></span></label><label class="check"><input type="checkbox" name="rename" ${options.rename ? 'checked' : ''}/><span><strong>Rename files by date</strong><small>Uses the restored date</small></span></label><label><span>Filename pattern</span><select name="renamePattern" ${options.rename ? '' : 'disabled'}><option value="date-original" ${options.renamePattern === 'date-original' ? 'selected' : ''}>2020-08-14_09-32-05_original.jpg</option><option value="date-sequence" ${options.renamePattern === 'date-sequence' ? 'selected' : ''}>2020-08-14_09-32-05_0001.jpg</option></select></label><label><span>Folder structure</span><select name="organize"><option value="year-month" ${options.organize === 'year-month' ? 'selected' : ''}>Year / month</option><option value="year" ${options.organize === 'year' ? 'selected' : ''}>Year only</option><option value="flat" ${options.organize === 'flat' ? 'selected' : ''}>One folder</option></select></label><label class="check"><input type="checkbox" name="includeUnmatched" ${options.includeUnmatched ? 'checked' : ''}/><span><strong>Include unmatched originals</strong><small>Copied without metadata changes</small></span></label><div class="export-actions"><button class="button primary wide" type="button" id="export-folder" ${overLimit || !scan!.mediaCount || progress ? 'disabled' : ''}>${icon('folder')} Write to a folder</button><button class="button secondary wide" type="button" id="export-zip" ${overLimit || !scan!.mediaCount || progress ? 'disabled' : ''}>${icon('download')} Download repaired ZIP</button></div><p class="recipe-note">The export log lists every written, skipped, and failed file.</p></form></div>${progress ? progressView() : ''}${completedMessage ? `<div class="notice complete" role="status">${icon('check')}<div><strong>Repaired export complete.</strong><p>${escapeHtml(completedMessage)}</p></div></div>` : ''}${errorMessage ? `<div class="notice error" role="alert">${icon('warning')}<div><strong>The export stopped.</strong><p>${escapeHtml(errorMessage)}</p></div></div>` : ''}`;
}

function licenseView() { return `<section class="license-note" aria-labelledby="license-title"><div><p class="kicker">Large library</p><h3 id="license-title">This scan has more than ${formatNumber(FREE_FILE_LIMIT)} files</h3><p>The first ${formatNumber(FREE_FILE_LIMIT)} files are free. A $12 one-time license removes the limit.</p></div><div class="license-actions"><a class="button secondary" href="${BUY_URL}" rel="external">Buy the $12 unlock</a><label><span>License key</span><input id="license-key" autocomplete="off"/></label><button type="button" class="button quiet" id="verify-license">Verify license</button></div></section>`; }
function progressView() { const percent = progress!.total ? Math.round(progress!.current / progress!.total * 100) : 0; return `<div class="progress-card" role="status" aria-live="polite"><div><strong>${escapeHtml(progress!.message)}</strong><span>${percent}%</span></div><progress max="100" value="${percent}">${percent}%</progress><p>Keep this tab open. Photo data stays on this device.</p></div>`; }

function render(focusHeading = false) {
  setMetadata();
  const view = route === 'home' ? homeView() : route === 'demo' ? demoView() : route === 'privacy' || route === 'terms' ? legalView(route) : notFoundView();
  app.innerHTML = shell(view); bind();
  document.querySelector('.file-list')?.setAttribute('tabindex', '0');
  if (focusHeading) { const heading = document.querySelector<HTMLElement>('#page-title'); heading?.focus(); const status = document.querySelector<HTMLElement>('.route-status'); if (status && heading) status.textContent = heading.textContent; }
}

function bind() {
  document.querySelectorAll<HTMLAnchorElement>('a[data-route]').forEach((link) => link.addEventListener('click', (event) => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate(new URL(link.href)); }));
  document.querySelector('#reset-demo')?.addEventListener('click', () => void resetDemo());
  document.querySelector('#start-real')?.addEventListener('click', () => void startReal());
  document.querySelector('#choose-folder')?.addEventListener('click', chooseFolder);
  document.querySelector('#choose-zips')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#zip-input')?.click());
  document.querySelector('#drop-action')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#zip-input')?.click());
  document.querySelector<HTMLInputElement>('#zip-input')?.addEventListener('change', async (event) => { const files = [...((event.target as HTMLInputElement).files ?? [])]; if (files.length) await scanZips(files); });
  document.querySelector<HTMLInputElement>('#folder-input')?.addEventListener('change', async (event) => { const files = (event.target as HTMLInputElement).files; if (files?.length) await beginScan(await filesFromInput(files), 'files', files[0].webkitRelativePath?.split('/')[0] || 'Selected folder'); });
  const drop = document.querySelector<HTMLElement>('#drop-zone');
  drop?.addEventListener('dragover', (event) => { event.preventDefault(); drop.classList.add('dragging'); }); drop?.addEventListener('dragleave', () => drop.classList.remove('dragging'));
  drop?.addEventListener('drop', async (event) => { event.preventDefault(); drop.classList.remove('dragging'); const transfer = event.dataTransfer!; const files = [...transfer.files]; if (files.length && files.every((file) => file.name.toLowerCase().endsWith('.zip'))) await scanZips(files); else { const dropped = await filesFromDataTransfer(transfer.items); if (dropped.length) await beginScan(dropped, 'files', dropped[0].path.split('/')[0] || 'Dropped files'); else if (files.length) await beginScan(await filesFromInput(files), 'files', 'Dropped files'); } });
  document.querySelector('#start-over')?.addEventListener('click', () => demoMode ? void resetDemo() : (scan = undefined, progress = undefined, completedMessage = '', errorMessage = '', render(), document.querySelector('#repair')?.scrollIntoView()));
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => { filter = button.dataset.filter as typeof filter; render(); document.querySelector('#repair')?.scrollIntoView(); }));
  document.querySelector<HTMLInputElement>('#search')?.addEventListener('input', (event) => { query = (event.target as HTMLInputElement).value; render(); document.querySelector<HTMLInputElement>('#search')?.focus(); });
  document.querySelector<HTMLFormElement>('#options-form')?.addEventListener('change', updateOptions);
  document.querySelector('#export-folder')?.addEventListener('click', exportFolder); document.querySelector('#export-zip')?.addEventListener('click', exportZip); document.querySelector('#verify-license')?.addEventListener('click', activateLicense); document.querySelector('#export-settings')?.addEventListener('click', downloadSettings); document.querySelector<HTMLInputElement>('#import-settings')?.addEventListener('change', uploadSettings);
}

function navigate(url: URL) { history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`); void enterRoute(routeFromLocation(), true); }
async function enterDemo(focus = false) { route = 'demo'; demoMode = true; options = { ...defaults }; licensed = false; completedMessage = ''; errorMessage = ''; filter = 'all'; query = ''; scan = await createDemoScan(); render(focus); window.scrollTo(0, 0); }

async function enterRoute(next: Route, focus = false) {
  if (next === 'demo') { await enterDemo(focus); return; }
  route = next;
  demoMode = false;
  scan = undefined;
  completedMessage = '';
  errorMessage = '';
  filter = 'all';
  query = '';
  if (route === 'home') {
    const [saved, session] = await Promise.all([loadOptions(), loadSession()]);
    options = { ...defaults, ...saved };
    lastSession = session;
    licensed = hasLargeLibraryLicense();
  }
  render(focus);
  window.scrollTo(0, 0);
}
async function resetDemo() { options = { ...defaults }; completedMessage = ''; errorMessage = ''; filter = 'all'; query = ''; scan = await createDemoScan(); render(); showToast('Sample data reset.'); }
async function startReal() { history.pushState({}, '', '/'); route = 'home'; demoMode = false; scan = undefined; options = { ...defaults }; const [saved, session] = await Promise.all([loadOptions(), loadSession()]); options = { ...defaults, ...saved }; lastSession = session; licensed = hasLargeLibraryLicense(); render(true); window.scrollTo(0, 0); }

async function chooseFolder() { errorMessage = ''; try { if ('showDirectoryPicker' in window) { const handle = await (window as Window & { showDirectoryPicker(): Promise<Parameters<typeof filesFromDirectory>[0]> }).showDirectoryPicker(); await beginScan(await filesFromDirectory(handle), 'folder', handle.name); } else document.querySelector<HTMLInputElement>('#folder-input')!.click(); } catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return; showError(error); } }
async function scanZips(files: File[]) { try { scanning = true; progress = { phase: 'reading', current: 0, total: files.length, message: 'Opening ZIP files' }; render(); const sources = await filesFromZips(files, updateProgress); await beginScan(sources, 'zip', files.length === 1 ? files[0].name : `${files.length} Takeout ZIP files`); } catch (error) { showError(error); } }
async function beginScan(files: SourceFile[], sourceKind: SourceKind, sourceLabel: string) { try { scanning = true; errorMessage = ''; completedMessage = ''; progress = { phase: 'reading', current: 0, total: files.length, message: 'Indexing your Takeout' }; render(); scan = await scanSources(files, sourceKind, sourceLabel, updateProgress); filter = 'all'; query = ''; } catch (error) { showError(error); return; } scanning = false; progress = undefined; render(); document.querySelector('#repair')?.scrollIntoView(); }
function updateProgress(update: ProgressUpdate) { progress = update; const now = performance.now(); if (update.current === update.total || now - lastProgressPaint > 120) { lastProgressPaint = now; render(); } }
function updateOptions(event: Event) { const data = new FormData(event.currentTarget as HTMLFormElement); options = { deduplicate: data.has('deduplicate'), rename: data.has('rename'), includeUnmatched: data.has('includeUnmatched'), renamePattern: data.get('renamePattern') as RepairOptions['renamePattern'], organize: data.get('organize') as RepairOptions['organize'] }; if (!demoMode) pendingOptionsSave = saveOptions(options); render(); document.querySelector('#repair')?.scrollIntoView(); }
async function exportFolder() { if (!scan) return; try { if (!('showDirectoryPicker' in window)) { await exportZip(); return; } const root = await (window as Window & { showDirectoryPicker(options?: { mode?: string }): Promise<DirectoryHandleLike> }).showDirectoryPicker({ mode: 'readwrite' }); const stamp = new Date().toISOString().replace(/[:.]/g, '-'); const destination = await root.getDirectoryHandle(`Takeout Tidy repaired ${stamp}`, { create: true }); const result = await exportToDirectory(scan, options, destination, updateProgress); await finishExport(result.written, result.skippedDuplicates, result.failed.length); } catch (error) { if (error instanceof DOMException && error.name === 'AbortError') { progress = undefined; render(); return; } showError(error); } }
async function exportZip() { if (!scan) return; try { const { blob, result } = await exportToZip(scan, options, updateProgress); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'takeout-tidy-repaired.zip'; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 30_000); await finishExport(result.written, result.skippedDuplicates, result.failed.length); } catch (error) { showError(error); } }
async function finishExport(written: number, duplicates: number, failed: number) { progress = undefined; completedMessage = `${formatNumber(written)} files written${duplicates ? `, ${formatNumber(duplicates)} exact copies skipped` : ''}${failed ? `, ${formatNumber(failed)} errors listed in the export log` : ''}.`; if (!demoMode) { lastSession = { at: Date.now(), sourceLabel: scan!.sourceLabel, mediaCount: scan!.mediaCount, matchedCount: scan!.matchedCount, exportedCount: written, skippedDuplicates: duplicates }; await saveSession(lastSession); } render(); }
async function activateLicense() { const input = document.querySelector<HTMLInputElement>('#license-key')!; const button = document.querySelector<HTMLButtonElement>('#verify-license')!; button.disabled = true; button.textContent = 'Verifying…'; try { await verifyLicense(input.value); licensed = true; completedMessage = 'Large-library license activated in this browser.'; render(); } catch (error) { showError(error); } }
async function downloadSettings() { await pendingOptionsSave; const blob = new Blob([await exportPreferences()], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'takeout-tidy-settings.json'; link.click(); URL.revokeObjectURL(link.href); }
async function uploadSettings(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; try { await importPreferences(await file.text()); options = { ...defaults, ...(await loadOptions()) }; lastSession = await loadSession(); render(); showToast('Settings imported.'); } catch (error) { showError(error); } }
function showError(error: unknown) { scanning = false; progress = undefined; errorMessage = error instanceof Error ? error.message : 'An unexpected browser error occurred.'; render(); }

function showToast(message: string, action?: { label: string; run: () => void }) { const toast = document.querySelector<HTMLElement>('#toast'); if (!toast) return; if (toastTimer) window.clearTimeout(toastTimer); toast.replaceChildren(document.createTextNode(message)); if (action) { const button = document.createElement('button'); button.type = 'button'; button.className = 'toast-action'; button.textContent = action.label; button.addEventListener('click', action.run); toast.append(' ', button); } toast.hidden = false; if (!action) toastTimer = window.setTimeout(() => { toast.hidden = true; }, 6000); }
function showUpdateToast(worker: ServiceWorker) { if (waitingWorker === worker) return; waitingWorker = worker; showToast('A new version is ready.', { label: 'Reload now', run: () => { reloadAfterUpdate = true; showToast('Updating Takeout Tidy…'); worker.postMessage({ type: 'SKIP_WAITING' }); } }); }
async function registerServiceWorker() { if (!('serviceWorker' in navigator)) return; try { const registration = await navigator.serviceWorker.register('/sw.js'); const notify = () => { if (registration.waiting && navigator.serviceWorker.controller) showUpdateToast(registration.waiting); }; notify(); registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed') notify(); }); }); navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloadAfterUpdate) window.location.reload(); }); } catch { /* Online use remains available. */ } }

window.addEventListener('popstate', () => { void enterRoute(routeFromLocation(), true); });
window.addEventListener('offline', () => showToast('You are offline. Local repair still works.')); window.addEventListener('online', () => showToast('You are back online.'));
async function initialise() { if (demoMode) await enterDemo(true); else { licensed = hasLargeLibraryLicense(); if (route === 'home') { const [saved, session] = await Promise.all([loadOptions(), loadSession()]); options = { ...defaults, ...saved }; lastSession = session; } render(route !== 'home'); } void registerServiceWorker(); }
void initialise();
