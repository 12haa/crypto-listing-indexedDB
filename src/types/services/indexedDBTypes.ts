import type { Cryptocurrency } from '../cryptoTypes/cryptoTypes';

export type StoredCrypto = Cryptocurrency & { timestamp?: number };

export type DBName = 'CryptoDB';
export type DBVersion = 4;
export type CryptoStoreName = 'cryptocurrencies';
export type MetaStoreName = 'meta';

export type SnapshotRecord = {
  key: 'snapshot-top10';
  items: Cryptocurrency[];
  timestamp: number;
};

export type MetaTotalCount = {
  key: 'total-count';
  value: number;
  timestamp: number;
};

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
