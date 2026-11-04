export type NewsDraft = {
  title: string;
  summary: string;
  body: string;
  photo: File | null;
};

export type PaymentDraft = { amount: string; date: string; direction: string };

type Drafts = { news: NewsDraft; payment: PaymentDraft };

async function draftStore<K extends keyof Drafts>(
  key: K,
  draft?: Drafts[K],
): Promise<Drafts[K] | undefined> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('zgu-editorial-drafts', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(
        'drafts',
        draft ? 'readwrite' : 'readonly',
      );
      const store = transaction.objectStore('drafts');
      const request = draft ? store.put(draft, key) : store.get(key);
      transaction.oncomplete = () =>
        resolve(draft ? undefined : request.result);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export function loadDraft<K extends keyof Drafts>(key: K) {
  return draftStore(key);
}

export function saveDraft<K extends keyof Drafts>(key: K, draft: Drafts[K]) {
  return draftStore(key, draft);
}
