import type { RepairOptions, SessionSummary } from './types';

const DB_NAME = 'takeout-tidy';
const STORE = 'preferences';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function databaseExists() {
  if (typeof indexedDB.databases !== 'function') return true;
  return (await indexedDB.databases()).some((database) => database.name === DB_NAME);
}

async function get<T>(key: string): Promise<T | undefined> {
  if (!(await databaseExists())) return undefined;
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readonly');
    const request = transaction.objectStore(STORE).get(key);
    request.onsuccess = () => {
      const value = request.result as T | undefined;
      transaction.oncomplete = () => { database.close(); resolve(value); };
    };
    request.onerror = () => { database.close(); reject(request.error); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

async function set<T>(key: string, value: T): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(value, key);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

export const loadOptions = () => get<RepairOptions>('options');
export const saveOptions = (options: RepairOptions) => set('options', options);
export const loadSession = () => get<SessionSummary>('last-session');
export const saveSession = (summary: SessionSummary) => set('last-session', summary);

export async function exportPreferences() {
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    options: await loadOptions(),
    lastSession: await loadSession()
  }, null, 2);
}

export async function importPreferences(contents: string) {
  const parsed = JSON.parse(contents) as { version?: number; options?: RepairOptions; lastSession?: SessionSummary };
  if (parsed.version !== 1) throw new Error('This settings file version is not supported.');
  if (parsed.options) await saveOptions(parsed.options);
  if (parsed.lastSession) await saveSession(parsed.lastSession);
}
