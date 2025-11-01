import { openDB, IDBPDatabase } from 'idb';
import type { Cryptocurrency } from '@/services/api';

type StoredCrypto = Cryptocurrency & { timestamp?: number };

const DB_NAME = 'CryptoDB';
const DB_VERSION = 4;
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

// Simple in-memory cache to prevent repeated DB calls for the same data
const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 30000; // 30 seconds TTL

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

// Cache helper functions
const getCacheKey = (operation: string, ...args: unknown[]): string => {
  return `${operation}:${JSON.stringify(args)}`;
};

const getCached = <T>(key: string): T | null => {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return null;
};

const setCached = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

const invalidateCache = (operationPrefix: string): void => {
  for (const key of cache.keys()) {
    if (key.startsWith(operationPrefix)) {
      cache.delete(key);
    }
  }
};

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('rank', 'cmcRank', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        } else if (oldVersion < 4) {
          // If upgrading to version 4, add additional index for efficient range queries
          // During upgrade, we can access object stores through the upgrade transaction
          // Note: idb wraps the database, so we access the underlying native API
          try {
            // Access the native IDBDatabase during upgrade
            const nativeDb = db as unknown as IDBDatabase;
            // During upgrade, we're already in a versionchange transaction
            // Access the store through the upgrade context
            const upgradeTx = nativeDb.transaction?.call(nativeDb, STORE_NAME, 'versionchange');
            const store = upgradeTx?.objectStore?.(STORE_NAME);

            if (store) {
              try {
                if (!store.indexNames.contains('rank')) {
                  store.createIndex('rank', 'cmcRank', { unique: false });
                }
              } catch {
                // Index might already exist, ignore
              }
              try {
                if (!store.indexNames.contains('timestamp')) {
                  store.createIndex('timestamp', 'timestamp', { unique: false });
                }
              } catch {
                // Index might already exist, ignore
              }
            }
          } catch {
            // Cannot access store during upgrade or indexes already exist, ignore
            // Indexes will be available on next fresh database creation
          }
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

  // Use Promise.all for better performance
  const itemsToSave = cryptos.map((crypto) => ({ ...(crypto as StoredCrypto), timestamp: now }));
  await Promise.all(itemsToSave.map((item) => store.put(item)));

  // Invalidate related cache entries
  invalidateCache('getCryptoDataByPage');
  invalidateCache('getCryptoData');
  invalidateCache('getTopCryptos');
  invalidateCache('getLastUpdated');

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

  // Invalidate total count cache
  invalidateCache('getCachedTotalCount');
};

export const getCryptoData = async (): Promise<Cryptocurrency[]> => {
  const cacheKey = getCacheKey('getCryptoData');
  const cached = getCached<Cryptocurrency[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('rank');

  // Get all records sorted by rank efficiently using the index
  const result = await index.getAll();
  setCached(cacheKey, result);
  return result;
};

export const getCryptoDataByPage = async (
  pageIndex: number,
  pageSize: number
): Promise<Cryptocurrency[]> => {
  const cacheKey = getCacheKey('getCryptoDataByPage', pageIndex, pageSize);
  const cached = getCached<Cryptocurrency[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('rank');

  // Use cursor to efficiently retrieve only the needed records
  const start = pageIndex * pageSize;
  const results: StoredCrypto[] = [];

  // Open cursor to iterate through records in rank order
  const cursor = await index.openCursor();
  let currentIndex = 0;
  let resultIndex = 0;

  if (cursor) {
    // Skip to the starting position
    while (currentIndex < start) {
      await cursor.continue();
      if (!cursor.key) break; // End of records
      currentIndex++;
    }

    // Collect the required number of records
    while (resultIndex < pageSize) {
      if (!cursor.key) break; // End of records
      results.push(cursor.value as StoredCrypto);
      await cursor.continue();
      resultIndex++;
    }
  }

  const cryptoList = results.map((item) => item as Cryptocurrency);
  setCached(cacheKey, cryptoList);
  return cryptoList;
};

export const getCryptoCount = async (): Promise<number> => {
  const cacheKey = getCacheKey('getCryptoCount');
  const cached = getCached<number>(cacheKey);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const result = await store.count();
  setCached(cacheKey, result);
  return result;
};

export const getTopCryptos = async (limit: number): Promise<Cryptocurrency[]> => {
  const cacheKey = getCacheKey('getTopCryptos', limit);
  const cached = getCached<Cryptocurrency[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('rank');

  // Use cursor to get only the top N records efficiently
  const results: StoredCrypto[] = [];
  const cursor = await index.openCursor();

  let count = 0;
  if (cursor) {
    while (count < limit) {
      if (!cursor.key) break; // End of records
      results.push(cursor.value as StoredCrypto);
      await cursor.continue();
      count++;
    }
  }

  const cryptoList = results.map((item) => item as Cryptocurrency);
  setCached(cacheKey, cryptoList);
  return cryptoList;
};

export const getLastUpdated = async (): Promise<number | null> => {
  const cacheKey = getCacheKey('getLastUpdated');
  const cached = getCached<number | null>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const timestampIndex = store.index('timestamp');

  // Get the record with the highest timestamp using cursor (last updated)
  const cursor = await timestampIndex.openCursor(null, 'prevunique');
  let result: number | null = null;
  if (cursor && typeof cursor.value.timestamp === 'number') {
    result = cursor.value.timestamp;
  }

  setCached(cacheKey, result);
  return result;
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

  // Invalidate the top snapshot cache
  invalidateCache('getTopSnapshot');
};

export const getTopSnapshot = async (): Promise<{
  items: Cryptocurrency[];
  timestamp: number;
} | null> => {
  const cacheKey = getCacheKey('getTopSnapshot');
  const cached = getCached<{ items: Cryptocurrency[]; timestamp: number } | null>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const db = await initDB();
  const tx = db.transaction(META_STORE, 'readonly');
  const store = tx.objectStore(META_STORE);
  const record = (await store.get('snapshot-top10')) as SnapshotRecord | undefined;
  let result = null;
  if (record) {
    result = { items: record.items, timestamp: record.timestamp };
  }
  setCached(cacheKey, result);
  return result;
};

export const getCachedTotalCount = async (): Promise<number | null> => {
  const cacheKey = getCacheKey('getCachedTotalCount');
  const cached = getCached<number | null>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const db = await initDB();
  const tx = db.transaction(META_STORE, 'readonly');
  const store = tx.objectStore(META_STORE);
  const record = (await store.get('total-count')) as MetaTotalCount | undefined;
  const result = record?.value ?? null;
  setCached(cacheKey, result);
  return result;
};
