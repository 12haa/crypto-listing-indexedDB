import { create } from 'zustand';
import { fetchCryptocurrencies } from '@/services/api';
import { saveCryptoData, getCryptoData, getLastUpdated } from '@/services/indexedDB';
import { Cryptocurrency } from '@/services/api';

interface CryptoState {
  cryptocurrencies: Cryptocurrency[];
  filteredCryptos: Cryptocurrency[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSizes: number[]; // Track different page sizes for each load
  totalItems: number;
  searchTerm: string;
  refreshInterval: number | null;
  lastUpdated: number | null;

  // Actions
  fetchInitialData: () => Promise<void>;
  loadMore: () => Promise<void>;
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
  currentPage: 0,
  pageSizes: [10], // Start with 10, then load 50 more on each click
  totalItems: 0,
  searchTerm: '',
  refreshInterval: null,
  lastUpdated: null,

  fetchInitialData: async () => {
    set({ loading: true, error: null });

    try {
      // First try to get data from IndexedDB
      const [cachedData, cachedUpdatedAt] = await Promise.all([getCryptoData(), getLastUpdated()]);

      if (cachedData.length > 0) {
        // Use cached data initially
        const initialCryptos = cachedData.slice(0, 10); // Only first 10 for initial load
        set({
          cryptocurrencies: cachedData,
          filteredCryptos: initialCryptos,
          totalItems: cachedData.length,
          loading: false,
          lastUpdated: cachedUpdatedAt ?? null,
        });
      }

      // Then fetch fresh data from API
      const apiResponse = await fetchCryptocurrencies(1, 100);
      const freshData = apiResponse.data.cryptoCurrencyList;

      // Save fresh data to IndexedDB
      await saveCryptoData(freshData);

      // Update state with fresh data
      const initialCryptos = freshData.slice(0, 10); // Only first 10 for initial load
      set({
        cryptocurrencies: freshData,
        filteredCryptos: initialCryptos,
        totalItems: freshData.length,
        loading: false,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch cryptocurrency data',
        loading: false,
      });
    }
  },

  loadMore: async () => {
    set({ loading: true });

    try {
      const { cryptocurrencies, filteredCryptos } = get();
      const currentLength = filteredCryptos.length;

      // Load next 50 items
      const nextBatch = cryptocurrencies.slice(currentLength, currentLength + 50);

      set((prev) => ({
        filteredCryptos: [...prev.filteredCryptos, ...nextBatch],
        loading: false,
        currentPage: prev.currentPage + 1,
        pageSizes: [...prev.pageSizes, 50],
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load more cryptocurrency data',
        loading: false,
      });
    }
  },

  setSearchTerm: (term: string) => {
    set((state) => {
      const filtered = state.cryptocurrencies.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(term.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(term.toLowerCase())
      );

      return {
        searchTerm: term,
        filteredCryptos: filtered.slice(0, state.filteredCryptos.length),
      };
    });
  },

  refreshData: async () => {
    set({ loading: true });

    try {
      const apiResponse = await fetchCryptocurrencies(1, 100);
      const freshData = apiResponse.data.cryptoCurrencyList;

      // Save fresh data to IndexedDB
      await saveCryptoData(freshData);

      // Update state with fresh data
      // Keep the same number of items currently displayed
      const currentDisplayCount = get().filteredCryptos.length;
      const currentView = freshData.slice(0, currentDisplayCount);

      set({
        cryptocurrencies: freshData,
        filteredCryptos: currentView,
        totalItems: freshData.length,
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
    if (get().refreshInterval) {
      clearInterval(get().refreshInterval as number);
    }

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
