import { openDB, IDBPDatabase } from 'idb';
import type {
  Cryptocurrency,
  StoredCrypto,
  SnapshotRecord,
  MetaTotalCount,
  CacheEntry,
} from '@/app/types/services/indexedDBTypes';

const DB_NAME = process.env.DB_NAME || 'CryptoDB';
const DB_VERSION = Number(process.env.DB_VERSION) || 4;
const STORE_NAME = process.env.STORE_NAME || 'cryptocurrencies';
const META_STORE = process.env.META_STORE || 'meta';


// Simple in-memory cache to prevent repeated DB calls for the same data
const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 30000; // 30 seconds TTL

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
          // If upgrading to version 4, add indexes for efficient queries
          // Note: Indexes will be automatically available on next database creation
          // This upgrade path is optional - existing data will work without indexes
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

export const saveCryptoPage = async (cryptos: Cryptocurrency[], totalCount?: number) => {
  const db = await initDB();
  const now = Date.now();

  // Save crypto data
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const itemsToSave = cryptos.map((crypto) => ({ ...(crypto as StoredCrypto), timestamp: now }));
  await Promise.all(itemsToSave.map((item) => store.put(item)));
  await tx.done;

  // Save total count if provided
  if (typeof totalCount === 'number' && !Number.isNaN(totalCount)) {
    const metaTx = db.transaction(META_STORE, 'readwrite');
    const metaStore = metaTx.objectStore(META_STORE);
    await metaStore.put({
      key: 'total-count',
      value: totalCount,
      timestamp: now,
    } as MetaTotalCount);
    await metaTx.done;
  }

  // Invalidate related caches
  invalidateCache('getCryptoDataByPage');
  invalidateCache('getTopSnapshot');
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
  const index = tx.objectStore(STORE_NAME).index('rank');

  // Use getAll() with range for better performance than manual cursor iteration
  const start = pageIndex * pageSize;
  const end = start + pageSize;
  const results = await index.getAll();
  const page = results.slice(start, end) as Cryptocurrency[];

  setCached(cacheKey, page);
  return page;
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
