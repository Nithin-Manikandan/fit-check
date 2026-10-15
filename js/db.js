// Tiny IndexedDB wrapper. Everything lives on the phone, nothing is uploaded.
const NAME = 'fitcheck', VERSION = 1;
let dbp;

function open() {
  return (dbp ||= new Promise((resolve, reject) => {
    const r = indexedDB.open(NAME, VERSION);
    r.onupgradeneeded = () => {
      r.result.createObjectStore('items', { keyPath: 'id' });
      r.result.createObjectStore('looks', { keyPath: 'id' });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  }));
}

function tx(store, mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => resolve(req && req.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

export const all = (store) => tx(store, 'readonly', (o) => o.getAll());
export const put = (store, v) => tx(store, 'readwrite', (o) => o.put(v));
export const putMany = (store, arr) => tx(store, 'readwrite', (o) => { arr.forEach((v) => o.put(v)); });
export const del = (store, id) => tx(store, 'readwrite', (o) => o.delete(id));
export const clear = (store) => tx(store, 'readwrite', (o) => o.clear());

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

export async function askPersist() {
  try { if (navigator.storage?.persist) await navigator.storage.persist(); } catch { /* ignore */ }
}
