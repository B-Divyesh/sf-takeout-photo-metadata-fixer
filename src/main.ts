import './styles.css';
import { BUY_URL, hasLargeLibraryLicense, verifyLicense } from './license';
import { exportToDirectory, exportToZip, type DirectoryHandleLike } from './exporter';
import { exportPreferences, importPreferences, loadOptions, loadSession, saveOptions, saveSession } from './storage';
import { filesFromDataTransfer, filesFromDirectory, filesFromInput, filesFromZips, scanSources } from './takeout';
import type { ProgressUpdate, RepairOptions, ScanResult, SessionSummary, SourceFile, SourceKind } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
const FREE_FILE_LIMIT = 20_000;

const defaults: RepairOptions = {
  deduplicate: true,
  rename: true,
  renamePattern: 'date-original',
  organize: 'year-month',
  includeUnmatched: true
};

let options = { ...defaults };
let scan: ScanResult | undefined;
let scanning = false;
let progress: ProgressUpdate | undefined;
let lastSession: SessionSummary | undefined;
let filter: 'all' | 'matched' | 'unmatched' | 'unsupported' = 'all';
let query = '';
let licensed = hasLargeLibraryLicense();
let completedMessage = '';
let errorMessage = '';
let lastProgressPaint = 0;

const icon = (name: 'folder' | 'zip' | 'shield' | 'arrow' | 'check' | 'warning' | 'download' | 'photo') => {
  const paths = {
    folder: '<path d="M3 7.5h6l2-2h4a2 2 0 0 1 2 2v1H3z"/><path d="M3 8.5h16l-2 10H4z"/>',
    zip: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M10 7h2m-2 3h2m-2 3h2m-3 3h4v3H9z"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.7 3.2 8.1 7.5 9.5 4.3-1.4 7.5-4.8 7.5-9.5V6z"/><path d="m8.8 12 2.1 2.1 4.5-4.6"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    warning: '<path d="M12 4 3 20h18z"/><path d="M12 9v5m0 3h.01"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>',
    photo: '<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-5 3 3 3-3 5 5"/>'
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
};

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);

function shell(content: string) {
  return `
    <header class="site-header">
      <a class="brand" href="/" aria-label="Takeout Tidy home">
        <span class="brand-mark" aria-hidden="true">${icon('photo')}</span>
        <span>Takeout Tidy</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#how-it-works">How it works</a>
        <a href="/privacy/">Privacy</a>
      </nav>
    </header>
    ${content}
    <footer class="site-footer">
      <div><span class="brand-footer">Takeout Tidy</span><p>Made for leaving the cloud, not joining another one.</p></div>
      <nav aria-label="Footer navigation"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><button class="text-button" id="export-settings">Export settings</button><label class="text-button file-label">Import settings<input id="import-settings" type="file" accept="application/json" /></label></nav>
      <p class="provenance">Original paper-cut imagery generated for this product.</p>
    </footer>
    <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
  `;
}

function render() {
  app.innerHTML = shell(`
    <main id="main">
      <section class="hero" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="eyebrow"><span></span> Private photo repair, in your browser</p>
          <h1 id="page-title">Put the dates back<br/>where they belong.</h1>
          <p class="lede">Match Google Takeout sidecars, restore dates and GPS to JPEGs and PNGs, remove exact duplicates, and rename the result—without uploading a single photo.</p>
          <a class="button primary" href="#repair">Start with your Takeout ${icon('arrow')}</a>
          <p class="privacy-note">${icon('shield')} Runs locally. Works offline after the first visit.</p>
        </div>
        <figure class="hero-art">
          <picture>
            <source srcset="/assets/hero-paper-archive-640.webp 640w, /assets/hero-paper-archive.webp 1024w" sizes="(max-width: 850px) calc(100vw - 28px), 52vw" type="image/webp" />
            <img src="/assets/hero-paper-archive.jpg" width="1024" height="683" alt="Paper-cut photo prints and sidecar cards moving through an archive sorter into a neat stack" fetchpriority="high" decoding="async" />
          </picture>
          <figcaption>Loose Takeout files in. A dated, deduplicated archive out.</figcaption>
        </figure>
      </section>

      <section class="repair-sheet" id="repair" aria-labelledby="repair-title">
        <div class="sheet-tape" aria-hidden="true"></div>
        <div class="steps" aria-label="Repair progress">
          <span class="active"><b>1</b> Choose</span><i></i><span class="${scan ? 'active' : ''}"><b>2</b> Inspect</span><i></i><span class="${completedMessage ? 'active' : ''}"><b>3</b> Export</span>
        </div>
        ${scan ? resultsView() : chooserView()}
      </section>

      <section class="privacy-strip" aria-label="Privacy promise">
        <div class="cut-shield">${icon('shield')}</div>
        <div><h2>Your photos stay yours.</h2><p>There is no upload step, account, tracking script, or hidden cloud process. Turn off Wi-Fi after loading the app—it still works.</p></div>
        <span class="zero-stamp">0 bytes<br/><small>uploaded</small></span>
      </section>

      <section class="how" id="how-it-works" aria-labelledby="how-title">
        <p class="eyebrow"><span></span> A careful three-step pass</p>
        <h2 id="how-title">What happens on the repair bench</h2>
        <ol>
          <li><span class="paper-number">01</span><div><h3>Match the sidecars</h3><p>We account for <code>.json</code>, supplemental metadata, truncated names, and album-copy suffixes.</p></div></li>
          <li><span class="paper-number">02</span><div><h3>Repair without re-encoding</h3><p>Dates and available GPS coordinates are inserted into JPEG or PNG metadata. Pixel data is untouched.</p></div></li>
          <li><span class="paper-number">03</span><div><h3>Write a clean archive</h3><p>Exact copies are skipped, names become chronological, and every decision is recorded in a manifest.</p></div></li>
        </ol>
      </section>
      ${lastSession ? `<aside class="last-run"><strong>Last export</strong><span>${new Date(lastSession.at).toLocaleDateString()} · ${formatNumber(lastSession.exportedCount)} files written from “${escapeHtml(lastSession.sourceLabel)}”</span></aside>` : ''}
    </main>
  `);
  bind();
}

function chooserView() {
  return `
    <div class="chooser-heading"><p class="kicker">Step 1</p><h2 id="repair-title">Choose your Takeout</h2><p>Select the extracted folder for the lowest-memory route. If your browser does not support folder access, choose one or more Takeout ZIPs.</p></div>
    <div class="source-grid" ${scanning ? 'aria-busy="true"' : ''}>
      <button class="source-choice" id="choose-folder" ${scanning ? 'disabled' : ''}>
        <span class="source-icon folder">${icon('folder')}</span><span><strong>Choose extracted folder</strong><small>Best for large libraries · Chromium</small></span>${icon('arrow')}
      </button>
      <button class="source-choice" id="choose-zips" ${scanning ? 'disabled' : ''}>
        <span class="source-icon zip">${icon('zip')}</span><span><strong>Choose Takeout ZIPs</strong><small>Works in every modern browser</small></span>${icon('arrow')}
      </button>
      <input id="folder-input" class="visually-hidden" type="file" webkitdirectory multiple aria-label="Choose extracted Takeout folder" />
      <input id="zip-input" class="visually-hidden" type="file" accept=".zip,application/zip" multiple aria-label="Choose Takeout ZIP files" />
    </div>
    <div class="drop-zone" id="drop-zone" tabindex="0" role="button">${icon('download')}<span>Or drag a folder or ZIP files onto this paper</span></div>
    ${progress ? progressView() : ''}
    ${errorMessage ? `<div class="notice error" role="alert">${icon('warning')}<div><strong>We could not scan that source.</strong><p>${escapeHtml(errorMessage)}</p></div></div>` : ''}
    <p class="support-note"><strong>Supported repair:</strong> JPEG and PNG date + GPS. HEIC, HEIF, and video are included unchanged and clearly marked. No pixel data is re-encoded.</p>
  `;
}

function resultsView() {
  const sidecarMatches = scan!.matchedCount + scan!.unsupportedCount;
  const rate = scan!.mediaCount ? Math.round(sidecarMatches / scan!.mediaCount * 100) : 0;
  const visible = scan!.items.filter((item) => (filter === 'all' || item.status === filter) && (!query || item.source.path.toLowerCase().includes(query.toLowerCase()))).slice(0, 200);
  const overLimit = scan!.items.length > FREE_FILE_LIMIT && !licensed;
  return `
    <div class="results-heading">
      <div><p class="kicker">Step 2</p><h2 id="repair-title">Inspect the matches</h2><p>Nothing has been written yet. Review the summary and choose how the clean archive should look.</p></div>
      <button class="button quiet" id="start-over">Choose another source</button>
    </div>
    <div class="inventory" aria-label="Scan summary">
      <div><strong>${formatNumber(scan!.mediaCount)}</strong><span>media files</span></div>
      <div class="success"><strong>${formatNumber(sidecarMatches)}</strong><span>sidecars matched</span></div>
      <div><strong>${rate}%</strong><span>match rate</span></div>
      <div class="attention"><strong>${formatNumber(scan!.unmatchedCount)}</strong><span>need review</span></div>
    </div>
    ${scan!.mediaCount === 0 ? `<div class="notice error" role="alert">${icon('warning')}<div><strong>No photos or videos were found.</strong><p>Choose the “Google Photos” folder inside your extracted Takeout, or ZIP files that contain media.</p></div></div>` : ''}
    ${scan!.invalidSidecars ? `<div class="notice warning">${icon('warning')}<div><strong>${formatNumber(scan!.invalidSidecars)} sidecar${scan!.invalidSidecars === 1 ? '' : 's'} could not be read.</strong><p>They are invalid JSON and were left unmatched.</p></div></div>` : ''}
    ${overLimit ? licenseView() : ''}
    <div class="work-grid">
      <section class="preview" aria-labelledby="preview-title">
        <div class="preview-head"><div><h3 id="preview-title">File preview</h3><p>Showing ${formatNumber(visible.length)} of ${formatNumber(scan!.items.length)}</p></div><label class="search"><span class="visually-hidden">Search files</span><input id="search" type="search" value="${escapeHtml(query)}" placeholder="Search filenames" /></label></div>
        <div class="filters" role="group" aria-label="Filter files">
          ${(['all', 'matched', 'unmatched', 'unsupported'] as const).map((value) => `<button class="filter ${filter === value ? 'active' : ''}" data-filter="${value}" aria-pressed="${filter === value}">${value === 'all' ? 'All' : value === 'unsupported' ? 'Copy-only' : value[0].toUpperCase() + value.slice(1)}</button>`).join('')}
        </div>
        <div class="file-list" role="table" aria-label="Matched Takeout files">
          <div class="file-row file-header" role="row"><span role="columnheader">Photo</span><span role="columnheader">Sidecar</span><span role="columnheader">Repair</span></div>
          ${visible.length ? visible.map((item) => {
            const date = item.metadata?.timestamp ? new Date(item.metadata.timestamp * 1000).toISOString().slice(0, 10) : '—';
            const label = item.status === 'matched' ? 'Ready' : item.status === 'unsupported' ? 'Copy-only' : 'Unmatched';
            return `<div class="file-row" role="row"><span role="cell" data-label="Photo"><b>${escapeHtml(item.source.name)}</b><small>${escapeHtml(item.source.path)}</small></span><span role="cell" data-label="Sidecar">${item.sidecar ? `<b>${escapeHtml(item.sidecar.name)}</b><small>${date}${item.metadata?.latitude !== undefined ? ' · GPS' : ''}</small>` : '<b>Not found</b><small>Original can still be copied</small>'}</span><span role="cell" data-label="Repair"><em class="status ${item.status}">${label}</em></span></div>`;
          }).join('') : `<div class="empty-filter">No files match this filter.</div>`}
        </div>
      </section>
      <form class="options" id="options-form">
        <h3>Output recipe</h3>
        <label class="check"><input type="checkbox" name="deduplicate" ${options.deduplicate ? 'checked' : ''}/><span><strong>Skip exact duplicates</strong><small>SHA-256 compares bytes, not filenames</small></span></label>
        <label class="check"><input type="checkbox" name="rename" ${options.rename ? 'checked' : ''}/><span><strong>Rename chronologically</strong><small>Uses the restored date</small></span></label>
        <label><span>Filename pattern</span><select name="renamePattern" ${options.rename ? '' : 'disabled'}><option value="date-original" ${options.renamePattern === 'date-original' ? 'selected' : ''}>2020-08-14_09-32-05_original.jpg</option><option value="date-sequence" ${options.renamePattern === 'date-sequence' ? 'selected' : ''}>2020-08-14_09-32-05_0001.jpg</option></select></label>
        <label><span>Folder structure</span><select name="organize"><option value="year-month" ${options.organize === 'year-month' ? 'selected' : ''}>Year / month</option><option value="year" ${options.organize === 'year' ? 'selected' : ''}>Year only</option><option value="flat" ${options.organize === 'flat' ? 'selected' : ''}>One folder</option></select></label>
        <label class="check"><input type="checkbox" name="includeUnmatched" ${options.includeUnmatched ? 'checked' : ''}/><span><strong>Include unmatched originals</strong><small>Copied without metadata changes</small></span></label>
        <div class="export-actions">
          <button class="button primary wide" type="button" id="export-folder" ${overLimit || !scan!.mediaCount || progress ? 'disabled' : ''}>${icon('folder')} Write to a folder</button>
          <button class="button secondary wide" type="button" id="export-zip" ${overLimit || !scan!.mediaCount || progress ? 'disabled' : ''}>${icon('download')} Download ZIP</button>
        </div>
        <p class="recipe-note">Folder export creates a new timestamped subfolder, so originals are never overwritten. A JSON manifest records every match, skip, and error.</p>
      </form>
    </div>
    ${progress ? progressView() : ''}
    ${completedMessage ? `<div class="notice complete" role="status">${icon('check')}<div><strong>Archive complete.</strong><p>${escapeHtml(completedMessage)}</p></div></div>` : ''}
    ${errorMessage ? `<div class="notice error" role="alert">${icon('warning')}<div><strong>The export stopped.</strong><p>${escapeHtml(errorMessage)}</p></div></div>` : ''}
  `;
}

function licenseView() {
  return `<section class="license-note" aria-labelledby="license-title"><div><p class="kicker">Large library</p><h3 id="license-title">Your scan has more than ${formatNumber(FREE_FILE_LIMIT)} files.</h3><p>The repair is free up to ${formatNumber(FREE_FILE_LIMIT)} files. A one-time license unlocks this browser for larger libraries—no subscription.</p></div><div class="license-actions"><a class="button secondary" href="${BUY_URL}" target="_blank" rel="noopener">Buy one-time unlock</a><label><span>License key</span><input id="license-key" autocomplete="off" /></label><button class="button quiet" id="verify-license">Verify license</button></div></section>`;
}

function progressView() {
  const percent = progress!.total ? Math.round(progress!.current / progress!.total * 100) : 0;
  return `<div class="progress-card" role="status" aria-live="polite"><div><strong>${escapeHtml(progress!.message)}</strong><span>${percent}%</span></div><progress max="100" value="${percent}">${percent}%</progress><p>Keep this tab open. Photo bytes remain on this device.</p></div>`;
}

function bind() {
  document.querySelector('#choose-folder')?.addEventListener('click', chooseFolder);
  document.querySelector('#choose-zips')?.addEventListener('click', () => (document.querySelector<HTMLInputElement>('#zip-input')!).click());
  document.querySelector<HTMLInputElement>('#zip-input')?.addEventListener('change', async (event) => {
    const files = [...((event.target as HTMLInputElement).files ?? [])];
    if (files.length) await scanZips(files);
  });
  document.querySelector<HTMLInputElement>('#folder-input')?.addEventListener('change', async (event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files?.length) await beginScan(await filesFromInput(files), 'files', files[0].webkitRelativePath?.split('/')[0] || 'Selected folder');
  });
  const drop = document.querySelector<HTMLElement>('#drop-zone');
  drop?.addEventListener('dragover', (event) => { event.preventDefault(); drop.classList.add('dragging'); });
  drop?.addEventListener('dragleave', () => drop.classList.remove('dragging'));
  drop?.addEventListener('drop', async (event) => {
    event.preventDefault(); drop.classList.remove('dragging');
    const transfer = event.dataTransfer!;
    const files = [...transfer.files];
    if (files.length && files.every((file) => file.name.toLowerCase().endsWith('.zip'))) await scanZips(files);
    else {
      const dropped = await filesFromDataTransfer(transfer.items);
      if (dropped.length) await beginScan(dropped, 'files', dropped[0].path.split('/')[0] || 'Dropped files');
      else if (files.length) await beginScan(await filesFromInput(files), 'files', 'Dropped files');
    }
  });
  drop?.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); document.querySelector<HTMLButtonElement>('#choose-zips')?.click(); } });
  document.querySelector('#start-over')?.addEventListener('click', () => { scan = undefined; progress = undefined; completedMessage = ''; errorMessage = ''; render(); location.hash = 'repair'; });
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => { filter = button.dataset.filter as typeof filter; render(); location.hash = 'repair'; }));
  document.querySelector<HTMLInputElement>('#search')?.addEventListener('input', (event) => { query = (event.target as HTMLInputElement).value; render(); document.querySelector<HTMLInputElement>('#search')?.focus(); });
  document.querySelector<HTMLFormElement>('#options-form')?.addEventListener('change', updateOptions);
  document.querySelector('#export-folder')?.addEventListener('click', exportFolder);
  document.querySelector('#export-zip')?.addEventListener('click', exportZip);
  document.querySelector('#verify-license')?.addEventListener('click', activateLicense);
  document.querySelector('#export-settings')?.addEventListener('click', downloadSettings);
  document.querySelector<HTMLInputElement>('#import-settings')?.addEventListener('change', uploadSettings);
}

async function chooseFolder() {
  errorMessage = '';
  try {
    if ('showDirectoryPicker' in window) {
      const handle = await (window as Window & { showDirectoryPicker(): Promise<Parameters<typeof filesFromDirectory>[0]> }).showDirectoryPicker();
      await beginScan(await filesFromDirectory(handle), 'folder', handle.name);
    } else {
      document.querySelector<HTMLInputElement>('#folder-input')!.click();
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    showError(error);
  }
}

async function scanZips(files: File[]) {
  try {
    scanning = true; progress = { phase: 'reading', current: 0, total: files.length, message: 'Opening ZIP files' }; render();
    const sources = await filesFromZips(files, updateProgress);
    await beginScan(sources, 'zip', files.length === 1 ? files[0].name : `${files.length} Takeout ZIPs`);
  } catch (error) { showError(error); }
}

async function beginScan(files: SourceFile[], sourceKind: SourceKind, sourceLabel: string) {
  try {
    scanning = true; errorMessage = ''; completedMessage = '';
    progress = { phase: 'reading', current: 0, total: files.length, message: 'Indexing your Takeout' }; render();
    scan = await scanSources(files, sourceKind, sourceLabel, updateProgress);
    filter = 'all'; query = '';
  } catch (error) { showError(error); return; }
  scanning = false; progress = undefined; render(); location.hash = 'repair';
}

function updateProgress(update: ProgressUpdate) {
  progress = update;
  const now = performance.now();
  if (update.current === update.total || now - lastProgressPaint > 120) {
    lastProgressPaint = now;
    render();
  }
}

function updateOptions(event: Event) {
  const form = event.currentTarget as HTMLFormElement;
  const data = new FormData(form);
  options = {
    deduplicate: data.has('deduplicate'), rename: data.has('rename'), includeUnmatched: data.has('includeUnmatched'),
    renamePattern: data.get('renamePattern') as RepairOptions['renamePattern'], organize: data.get('organize') as RepairOptions['organize']
  };
  void saveOptions(options);
  render(); location.hash = 'repair';
}

async function exportFolder() {
  if (!scan) return;
  try {
    if (!('showDirectoryPicker' in window)) { await exportZip(); return; }
    const root = await (window as Window & { showDirectoryPicker(options?: { mode?: string }): Promise<DirectoryHandleLike> }).showDirectoryPicker({ mode: 'readwrite' });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const destination = await root.getDirectoryHandle(`Takeout Tidy clean ${stamp}`, { create: true });
    const result = await exportToDirectory(scan, options, destination, updateProgress);
    finishExport(result.written, result.skippedDuplicates, result.failed.length);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') { progress = undefined; render(); return; }
    showError(error);
  }
}

async function exportZip() {
  if (!scan) return;
  try {
    const { blob, result } = await exportToZip(scan, options, updateProgress);
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'takeout-tidy-clean-archive.zip'; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 30_000);
    finishExport(result.written, result.skippedDuplicates, result.failed.length);
  } catch (error) { showError(error); }
}

function finishExport(written: number, duplicates: number, failed: number) {
  progress = undefined;
  completedMessage = `${formatNumber(written)} files written${duplicates ? `, ${formatNumber(duplicates)} exact duplicates skipped` : ''}${failed ? `, ${formatNumber(failed)} errors listed in the manifest` : ''}.`;
  lastSession = { at: Date.now(), sourceLabel: scan!.sourceLabel, mediaCount: scan!.mediaCount, matchedCount: scan!.matchedCount, exportedCount: written, skippedDuplicates: duplicates };
  void saveSession(lastSession); render();
}

async function activateLicense() {
  const input = document.querySelector<HTMLInputElement>('#license-key')!;
  const button = document.querySelector<HTMLButtonElement>('#verify-license')!;
  button.disabled = true; button.textContent = 'Verifying…';
  try { await verifyLicense(input.value); licensed = true; completedMessage = 'Large-library license activated on this browser.'; render(); }
  catch (error) { showError(error); }
}

async function downloadSettings() {
  const blob = new Blob([await exportPreferences()], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'takeout-tidy-settings.json'; link.click(); URL.revokeObjectURL(link.href);
}

async function uploadSettings(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
  try { await importPreferences(await file.text()); options = { ...defaults, ...(await loadOptions()) }; lastSession = await loadSession(); showToast('Settings imported.'); render(); }
  catch (error) { showError(error); }
}

function showError(error: unknown) { scanning = false; progress = undefined; errorMessage = error instanceof Error ? error.message : 'An unexpected browser error occurred.'; render(); }
function showToast(message: string) { const toast = document.querySelector<HTMLElement>('#toast'); if (!toast) return; toast.textContent = message; toast.hidden = false; setTimeout(() => { toast.hidden = true; }, 6000); }

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showToast('An update is ready. Reload to use it.'); });
    });
  } catch { /* The app still works without offline installation. */ }
}

window.addEventListener('offline', () => showToast('You are offline. Local repair still works.'));
window.addEventListener('online', () => showToast('You are back online.'));

Promise.all([loadOptions(), loadSession()]).then(([saved, session]) => {
  options = { ...defaults, ...saved }; lastSession = session; render(); void registerServiceWorker();
}).catch(() => { render(); void registerServiceWorker(); });
