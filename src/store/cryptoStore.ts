import { create } from 'zustand';
import { fetchCryptocurrenciesPage, type Cryptocurrency } from '@/services/api';
import {
  saveCryptoPage,
  getCryptoDataByPage,
  getLastUpdated,
  getCachedTotalCount,
} from '@/services/indexedDB';

interface CryptoState {
  cryptocurrencies: Cryptocurrency[];
  filteredCryptos: Cryptocurrency[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number; // server fetch size per page (we will fetch up to 200)
  totalItems: number;
  displayedCount: number;
  searchTerm: string;
  refreshInterval: number | null;
  lastUpdated: number | null;

  fetchInitialData: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  setPageSize: (size: number) => Promise<void>;
  showMore: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  refreshData: () => Promise<void>;
  startAutoRefresh: (intervalMs: number) => void;
  stopAutoRefresh: () => void;
}

export const useCryptoStore = create<CryptoState>((set, get) => ({
  cryptocurrencies: [],
  filteredCryptos: [],
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 200,
  totalItems: 0,
  displayedCount: 10,
  searchTerm: '',
  refreshInterval: null,
  lastUpdated: null,

  fetchInitialData: async () => {
    set({ loading: true, error: null });
    try {
      const { pageSize } = get();
      const [cachedPage, cachedUpdatedAt, cachedTotal] = await Promise.all([
        getCryptoDataByPage(0, pageSize),
        getLastUpdated(),
        getCachedTotalCount(),
      ]);
      if (cachedPage.length > 0) {
        set({
          cryptocurrencies: cachedPage as Cryptocurrency[],
          filteredCryptos: (cachedPage as Cryptocurrency[]).slice(0, 10),
          totalItems: cachedTotal ?? cachedPage.length,
          loading: false,
          lastUpdated: cachedUpdatedAt ?? null,
          displayedCount: 10,
        });
        return;
      }
      const apiResponse = await fetchCryptocurrenciesPage(1, pageSize);
      const freshData = apiResponse.data.cryptoCurrencyList as Cryptocurrency[];
      const totalCount = parseInt(apiResponse.data.totalCount, 10);
      await saveCryptoPage(freshData, totalCount);
      set({
        cryptocurrencies: freshData,
        filteredCryptos: freshData.slice(0, 10),
        totalItems: totalCount,
        loading: false,
        lastUpdated: Date.now(),
        displayedCount: 10,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch cryptocurrency data',
        loading: false,
      });
    }
  },

  goToPage: async (page: number) => {
    set({ loading: true });
    try {
      const { pageSize } = get();
      const cached = await getCryptoDataByPage(page - 1, pageSize);
      if (cached.length > 0) {
        set({
          cryptocurrencies: cached as Cryptocurrency[],
          filteredCryptos: (cached as Cryptocurrency[]).slice(0, 10),
          currentPage: page,
          loading: false,
          displayedCount: 10,
        });
        return;
      }
      const apiResponse = await fetchCryptocurrenciesPage(page, pageSize);
      const freshData = apiResponse.data.cryptoCurrencyList as Cryptocurrency[];
      const totalCount = parseInt(apiResponse.data.totalCount, 10);
      await saveCryptoPage(freshData, totalCount);
      set({
        cryptocurrencies: freshData,
        filteredCryptos: freshData.slice(0, 10),
        totalItems: totalCount,
        currentPage: page,
        loading: false,
        lastUpdated: Date.now(),
        displayedCount: 10,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to change page',
        loading: false,
      });
    }
  },

  setPageSize: async (size: number) => {
    set({ pageSize: size });
    await get().goToPage(1);
  },

  showMore: async () => {
    const { cryptocurrencies, displayedCount } = get();
    const newCount = Math.min(displayedCount + 50, 200, cryptocurrencies.length);
    set({
      filteredCryptos: cryptocurrencies.slice(0, newCount),
      displayedCount: newCount,
    });
    // Ensure IndexedDB also has these expanded rows persisted
    await saveCryptoPage(cryptocurrencies.slice(0, newCount));
  },

  setSearchTerm: (term: string) => {
    set((state) => {
      const filtered = state.cryptocurrencies.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(term.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(term.toLowerCase())
      );
      return { searchTerm: term, filteredCryptos: filtered };
    });
  },

  refreshData: async () => {
    set({ loading: true });
    try {
      const { currentPage, pageSize, displayedCount } = get();
      const apiResponse = await fetchCryptocurrenciesPage(currentPage, pageSize);
      const freshData = apiResponse.data.cryptoCurrencyList as Cryptocurrency[];
      const totalCount = parseInt(apiResponse.data.totalCount, 10);
      await saveCryptoPage(freshData, totalCount);
      set({
        cryptocurrencies: freshData,
        filteredCryptos: freshData.slice(0, Math.min(displayedCount, freshData.length)),
        totalItems: totalCount,
        loading: false,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh cryptocurrency data',
        loading: false,
      });
    }
  },

  startAutoRefresh: (intervalMs: number) => {
    if (get().refreshInterval) clearInterval(get().refreshInterval as number);
    const intervalId = window.setInterval(() => {
      get().refreshData();
    }, intervalMs);
    set({ refreshInterval: intervalId });
  },

  stopAutoRefresh: () => {
    if (get().refreshInterval) {
      clearInterval(get().refreshInterval as number);
      set({ refreshInterval: null });
    }
  },
}));
