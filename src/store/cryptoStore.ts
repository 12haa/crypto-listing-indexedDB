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
  loading: true,
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
      const { pageSize, displayedCount } = get();
      const desiredStartIndex = (page - 1) * Math.max(displayedCount, 1);
      const baseIndex = Math.floor(desiredStartIndex / pageSize); // 0-based server page index
      const offset = desiredStartIndex % pageSize;

      let baseData = await getCryptoDataByPage(baseIndex, pageSize);
      if (baseData.length === 0) {
        const resp = await fetchCryptocurrenciesPage(baseIndex + 1, pageSize);
        baseData = resp.data.cryptoCurrencyList as Cryptocurrency[];
        const totalCount = parseInt(resp.data.totalCount, 10);
        await saveCryptoPage(baseData, totalCount);
      }

      // If window spans into next server page, merge in next page
      let combined = baseData as Cryptocurrency[];
      const needed = offset + displayedCount;
      if (needed > pageSize) {
        let nextData = await getCryptoDataByPage(baseIndex + 1, pageSize);
        if (nextData.length === 0) {
          const resp2 = await fetchCryptocurrenciesPage(baseIndex + 2, pageSize);
          nextData = resp2.data.cryptoCurrencyList as Cryptocurrency[];
          const totalCount2 = parseInt(resp2.data.totalCount, 10);
          await saveCryptoPage(nextData, totalCount2);
        }
        combined = [...combined, ...(nextData as Cryptocurrency[])];
      }

      const window = combined.slice(offset, offset + displayedCount);
      set({
        cryptocurrencies: baseData as Cryptocurrency[],
        filteredCryptos: window,
        currentPage: page,
        loading: false,
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
    const { currentPage, pageSize, displayedCount } = get();
    const newCount = Math.min(displayedCount + 50, 200);
    const desiredStartIndex = (currentPage - 1) * newCount;
    const baseIndex = Math.floor(desiredStartIndex / pageSize);
    const offset = desiredStartIndex % pageSize;

    let baseData = await getCryptoDataByPage(baseIndex, pageSize);
    if (baseData.length === 0) {
      const resp = await fetchCryptocurrenciesPage(baseIndex + 1, pageSize);
      baseData = resp.data.cryptoCurrencyList as Cryptocurrency[];
      const totalCount = parseInt(resp.data.totalCount, 10);
      await saveCryptoPage(baseData, totalCount);
    }
    let combined = baseData as Cryptocurrency[];
    const needed = offset + newCount;
    if (needed > pageSize) {
      let nextData = await getCryptoDataByPage(baseIndex + 1, pageSize);
      if (nextData.length === 0) {
        const resp2 = await fetchCryptocurrenciesPage(baseIndex + 2, pageSize);
        nextData = resp2.data.cryptoCurrencyList as Cryptocurrency[];
        const totalCount2 = parseInt(resp2.data.totalCount, 10);
        await saveCryptoPage(nextData, totalCount2);
      }
      combined = [...combined, ...(nextData as Cryptocurrency[])];
    }

    const window = combined.slice(offset, offset + newCount);
    set({ filteredCryptos: window, displayedCount: newCount });
  },

  setSearchTerm: (term: string) => {
    set((state) => {
      const filtered = state.cryptocurrencies.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(term.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(term.toLowerCase())
      );
      return { searchTerm: term, filteredCryptos: filtered.slice(0, state.displayedCount) };
    });
  },

  refreshData: async () => {
    try {
      const { currentPage, pageSize, displayedCount, searchTerm } = get();
      const desiredStartIndex = (currentPage - 1) * Math.max(displayedCount, 1);
      const baseIndex = Math.floor(desiredStartIndex / pageSize);
      const offset = desiredStartIndex % pageSize;

      // Always fetch and update the base page with fresh data
      const apiResponse = await fetchCryptocurrenciesPage(baseIndex + 1, pageSize);
      const freshBaseData = apiResponse.data.cryptoCurrencyList as Cryptocurrency[];
      const totalCount = parseInt(apiResponse.data.totalCount, 10);
      await saveCryptoPage(freshBaseData, totalCount);

      // Check if current display window requires data from the next page
      let combined = [...freshBaseData];
      if (offset + displayedCount > pageSize) {
        // Fetch next page if needed
        const nextPageIndex = baseIndex + 2;
        const nextApiResponse = await fetchCryptocurrenciesPage(nextPageIndex, pageSize);
        const freshNextData = nextApiResponse.data.cryptoCurrencyList as Cryptocurrency[];
        await saveCryptoPage(freshNextData, parseInt(nextApiResponse.data.totalCount, 10));
        combined = [...combined, ...freshNextData];
      }

      // Get the current window of data from the combined fresh data
      const currentWindow = combined.slice(offset, offset + displayedCount);

      // Apply search filter if there's a search term
      let filteredWindow = currentWindow;
      if (searchTerm) {
        filteredWindow = currentWindow.filter(
          (crypto) =>
            crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      set({
        cryptocurrencies: freshBaseData, // Update with the fresh base page data
        filteredCryptos: filteredWindow,
        totalItems: totalCount,
        lastUpdated: Date.now(),
      });

      // If the current page is not page 1, ensure the currentPage is preserved in state
      if (currentPage !== 1) {
        set({ currentPage });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh cryptocurrency data',
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
