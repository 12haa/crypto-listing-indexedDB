import { create } from 'zustand';
import { fetchCryptocurrenciesPage } from '@/services/api';
import type { CryptoState, Cryptocurrency } from '@/app/types/store/cryptoStoreTypes';
import {
  saveCryptoPage,
  getCryptoDataByPage,
  saveTopSnapshot,
  getTopSnapshot,
} from '@/services/indexedDB';

export const useCryptoStore = create<CryptoState>((set, get) => ({
  cryptocurrencies: [],
  initialTop10: [],
  filteredCryptos: [],
  loading: true,
  initialLoading: true,
  error: null,
  currentPage: 1,
  pageSize: 200,
  totalItems: 0,
  displayedCount: 10,
  searchTerm: '',
  refreshInterval: null,
  lastUpdated: null,
  hasFreshData: false,
  fetchInitialData: async () => {
    // Snapshot-first approach: Show cached data immediately for instant UI
    try {
      // First, get the cached top 10 to show immediately
      const topSnapshot = await getTopSnapshot();
      let cachedTop10: Cryptocurrency[] = [];

      if (topSnapshot && topSnapshot.items.length > 0) {
        cachedTop10 = topSnapshot.items as Cryptocurrency[];
        set({
          initialTop10: cachedTop10,
          filteredCryptos: cachedTop10,
          loading: true, // Still loading fresh data in background
          initialLoading: true, // We're showing initial cached data
          hasFreshData: false, // Will be set to true once fresh data loads
        });
      } else {
        // If no cached top 10 snapshot, try to get from first page
        const cachedPage = await getCryptoDataByPage(0, 20);
        if (cachedPage.length > 0) {
          cachedTop10 = cachedPage.slice(0, 10);
          set({
            initialTop10: cachedTop10,
            filteredCryptos: cachedTop10,
            loading: true, // Still loading fresh data in background
            initialLoading: true, // We're showing initial cached data
            hasFreshData: false, // Will be set to true once fresh data loads
          });
        }
      }

      // Background sync: Fetch fresh data from API
      const { pageSize } = get();

      // Fetch fresh data from API in the background
      const apiResponse = await fetchCryptocurrenciesPage(1, pageSize);
      const freshData = apiResponse.data.cryptoCurrencyList as Cryptocurrency[];
      const freshTop10 = freshData.slice(0, 10);
      const totalCount = parseInt(apiResponse.data.totalCount, 10);

      // Save fresh data to IndexedDB
      await saveCryptoPage(freshData, totalCount);

      // Update the top 10 snapshot with fresh data
      if (freshTop10.length > 0) {
        await saveTopSnapshot(freshTop10);
      }

      // Update state with fresh data
      set({
        cryptocurrencies: freshData,
        initialTop10: cachedTop10,
        filteredCryptos: freshTop10,
        totalItems: totalCount,
        loading: false,
        initialLoading: false,
        lastUpdated: Date.now(),
        hasFreshData: true,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch cryptocurrency data',
        loading: false,
        initialLoading: false, // Make sure to reset this on error too
        hasFreshData: false,
      });
    }
  },

  goToPage: async (page: number) => {
    set({ loading: true });
    try {
      const { pageSize, displayedCount, initialTop10 } = get();
      const desiredStartIndex = (page - 1) * displayedCount;
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
        initialTop10,
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
    const { currentPage, displayedCount, cryptocurrencies, initialTop10 } = get();
    const newCount = Math.min(displayedCount + 50, 200);

    // Calculate the starting index based on the current page
    // This ensures we're expanding items from the same page context
    const startIndex = (currentPage - 1) * displayedCount;
    const newEndIndex = Math.min(startIndex + newCount, cryptocurrencies.length);
    const window = cryptocurrencies.slice(startIndex, newEndIndex);

    set({
      initialTop10,
      filteredCryptos: window,
      displayedCount: newCount,
    });
  },

  setSearchTerm: (term: string) => {
    set((state) => {
      // If there's a search term, filter the full dataset
      if (term) {
        const filtered = state.cryptocurrencies.filter(
          (crypto) =>
            crypto.name.toLowerCase().includes(term.toLowerCase()) ||
            crypto.symbol.toLowerCase().includes(term.toLowerCase())
        );
        return {
          searchTerm: term,
          filteredCryptos: filtered.slice(0, state.displayedCount),
        };
      } else {
        // When search is cleared, show the current page of data
        const startIndex = (state.currentPage - 1) * state.displayedCount;
        const endIndex = Math.min(startIndex + state.displayedCount, state.cryptocurrencies.length);
        return {
          searchTerm: term,
          filteredCryptos: state.cryptocurrencies.slice(startIndex, endIndex),
        };
      }
    });
  },

  refreshData: async () => {
    try {
      const { currentPage, pageSize, displayedCount, searchTerm, initialTop10 } = get();
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

      // Update the top 10 snapshot if we're on the first page
      let updatedInitialTop10 = initialTop10;
      if (currentPage === 1 && !searchTerm) {
        const top10 = freshBaseData.slice(0, 10);
        updatedInitialTop10 = top10;
        await saveTopSnapshot(top10);
      }

      set({
        cryptocurrencies: freshBaseData, // Update with the fresh base page data
        initialTop10: updatedInitialTop10, // Preserve or update initialTop10
        filteredCryptos: filteredWindow,
        totalItems: totalCount,
        lastUpdated: Date.now(),
        hasFreshData: true, // Mark that we now have fresh data
      });
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
