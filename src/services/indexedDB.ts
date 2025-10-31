import { openDB, IDBPDatabase } from 'idb';
import { Cryptocurrency } from './api';

const DB_NAME = 'CryptoDB';
const DB_VERSION = 1;
const STORE_NAME = 'cryptocurrencies';

let dbPromise: Promise<IDBPDatabase> | null = null;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('rank', 'cmcRank', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
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

  // Clear existing data
  await store.clear();

  // Add timestamp to each cryptocurrency record
  const dataWithTimestamp = cryptos.map((crypto) => ({
    ...crypto,
    timestamp: Date.now(),
  }));

  // Add all cryptocurrency records
  for (const crypto of dataWithTimestamp) {
    await store.add(crypto);
  }

  await tx.done;
};

export const getCryptoData = async (): Promise<Cryptocurrency[]> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  // Get all records and sort by rank
  const allRecords = await store.getAll();
  return allRecords
    .sort((a, b) => a.cmcRank - b.cmcRank)
    .map((item) => item as unknown as Cryptocurrency);
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
