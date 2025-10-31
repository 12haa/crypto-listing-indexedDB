import { openDB, IDBPDatabase } from 'idb';
import type { Cryptocurrency } from '@/services/api';

type StoredCrypto = Cryptocurrency & { timestamp?: number };

const DB_NAME = 'CryptoDB';
const DB_VERSION = 3;
const STORE_NAME = 'cryptocurrencies';
const META_STORE = 'meta';

type SnapshotRecord = {
  key: 'snapshot-top10';
  items: Cryptocurrency[];
  timestamp: number;
};

type MetaTotalCount = {
  key: 'total-count';
  value: number;
  timestamp: number;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('rank', 'cmcRank', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains(META_STORE)) {
            db.createObjectStore(META_STORE, { keyPath: 'key' });
          }
        }
      },
    });
  }
  return dbPromise;
};

export const saveCryptoData = async (cryptos: Cryptocurrency[]) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  // Upsert records with a fresh timestamp, do not clear existing to support paging cache
  const now = Date.now();
  for (const crypto of cryptos) {
    await store.put({ ...(crypto as StoredCrypto), timestamp: now } as StoredCrypto);
  }

  await tx.done;
};

export const saveCryptoPage = async (cryptos: Cryptocurrency[], totalCount?: number) => {
  await saveCryptoData(cryptos);
  if (typeof totalCount === 'number' && !Number.isNaN(totalCount)) {
    const db = await initDB();
    const tx = db.transaction(META_STORE, 'readwrite');
    const store = tx.objectStore(META_STORE);
    const record: MetaTotalCount = {
      key: 'total-count',
      value: totalCount,
      timestamp: Date.now(),
    };
    await store.put(record);
    await tx.done;
  }
};

export const getCryptoData = async (): Promise<Cryptocurrency[]> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  // Get all records and sort by rank
  const allRecords = await store.getAll();
  return allRecords
    .sort((a, b) => (a as StoredCrypto).cmcRank - (b as StoredCrypto).cmcRank)
    .map((item) => item as Cryptocurrency);
};

export const getCryptoDataByPage = async (
  pageIndex: number,
  pageSize: number
): Promise<Cryptocurrency[]> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('rank');

  // Get all records sorted by rank
  const allRecords = await index.getAll();
  const start = pageIndex * pageSize;
  const end = start + pageSize;

  return allRecords.slice(start, end).map((item) => item as unknown as Cryptocurrency);
};

export const getCryptoCount = async (): Promise<number> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return store.count();
};

export const getTopCryptos = async (limit: number): Promise<Cryptocurrency[]> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const index = tx.store.index('rank');
  const ranked = await index.getAll();
  return ranked.slice(0, limit).map((item) => item as unknown as Cryptocurrency);
};

export const getLastUpdated = async (): Promise<number | null> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const all = await tx.store.getAll();
  if (!all.length) return null;
  let maxTs = 0;
  for (const item of all) {
    if (typeof item.timestamp === 'number' && item.timestamp > maxTs) {
      maxTs = item.timestamp;
    }
  }
  return maxTs || null;
};

export const saveTopSnapshot = async (items: Cryptocurrency[]) => {
  const db = await initDB();
  const tx = db.transaction(META_STORE, 'readwrite');
  const store = tx.objectStore(META_STORE);
  const record: SnapshotRecord = {
    key: 'snapshot-top10',
    items,
    timestamp: Date.now(),
  };
  await store.put(record);
  await tx.done;
};

export const getTopSnapshot = async (): Promise<{
  items: Cryptocurrency[];
  timestamp: number;
} | null> => {
  const db = await initDB();
  const tx = db.transaction(META_STORE, 'readonly');
  const store = tx.objectStore(META_STORE);
  const record = (await store.get('snapshot-top10')) as SnapshotRecord | undefined;
  if (!record) return null;
  return { items: record.items, timestamp: record.timestamp };
};

export const getCachedTotalCount = async (): Promise<number | null> => {
  const db = await initDB();
  const tx = db.transaction(META_STORE, 'readonly');
  const store = tx.objectStore(META_STORE);
  const record = (await store.get('total-count')) as MetaTotalCount | undefined;
  return record?.value ?? null;
};
