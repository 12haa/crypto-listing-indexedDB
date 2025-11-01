

import { Cryptocurrency } from "../cryptoTypes/cryptoTypes";



export interface CryptoState {
  cryptocurrencies: Cryptocurrency[];
  initialTop10: Cryptocurrency[];
  filteredCryptos: Cryptocurrency[];
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  displayedCount: number;
  searchTerm: string;
  refreshInterval: number | null;
  lastUpdated: number | null;
  hasFreshData: boolean;

  fetchInitialData: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  setPageSize: (size: number) => Promise<void>;
  showMore: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  refreshData: () => Promise<void>;
  startAutoRefresh: (intervalMs: number) => void;
  stopAutoRefresh: () => void;
}

export type { Cryptocurrency };
