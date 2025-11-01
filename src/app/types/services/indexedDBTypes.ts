// Types extracted from src/services/indexedDB.ts
// Centralized type definitions for the IndexedDB service layer

import type { Cryptocurrency } from './apiTypes';

// Mirrors: type StoredCrypto = Cryptocurrency & { timestamp?: number };
export type StoredCrypto = Cryptocurrency & { timestamp?: number };

// Mirrors: const DB_NAME/DB_VERSION/STORE_NAME/META_STORE
// Expose as literal type aliases for consumers that want to type constants elsewhere
export type DBName = 'CryptoDB';
export type DBVersion = 4;
export type CryptoStoreName = 'cryptocurrencies';
export type MetaStoreName = 'meta';

// Mirrors: SnapshotRecord used for meta store snapshots
export type SnapshotRecord = {
  key: 'snapshot-top10';
  items: Cryptocurrency[];
  timestamp: number;
};

// Mirrors: MetaTotalCount used to store the count
export type MetaTotalCount = {
  key: 'total-count';
  value: number;
  timestamp: number;
};

// Mirrors: interface CacheEntry<T>
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export type { Cryptocurrency };
