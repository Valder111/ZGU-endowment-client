export type FormSnapshot = { values: Record<string, string>; file?: File };

let connection: Promise<IDBDatabase> | undefined;

function openRecovery() {
  connection ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('zgu-editor-recovery', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('forms');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return connection;
}

export async function readRecovery(
  key: string,
): Promise<FormSnapshot | undefined> {
  const database = await openRecovery();
  return new Promise((resolve, reject) => {
    const request = database.transaction('forms').objectStore('forms').get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function writeRecovery(key: string, snapshot?: FormSnapshot) {
  const database = await openRecovery();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction('forms', 'readwrite');
    const store = transaction.objectStore('forms');
    if (snapshot) store.put(snapshot, key);
    else store.delete(key);
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error);
  });
}
