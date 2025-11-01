import { create } from 'zustand';
import { QueryClient } from '@tanstack/react-query';

import {
  saveCryptoPage,
  getCryptoDataByPage,
  saveTopSnapshot,
  getTopSnapshot,
  hasData,
  getTotalCount,
} from '@/services/indexedDB';
import { fetchCryptocurrenciesPage } from '@/hooks/queries/useFetchCryptocurrenciesPage';
import { Cryptocurrency, CryptoState } from '@/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

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
    try {
      const dbHasData = await hasData();

      const topSnapshot = await getTopSnapshot();
      let cachedTop10: Cryptocurrency[] = [];
      let cachedData: Cryptocurrency[] = [];
      let cachedTotalCount = 0;

      if (topSnapshot && topSnapshot.items.length > 0) {
        cachedTop10 = topSnapshot.items as Cryptocurrency[];
        cachedData = await getCryptoDataByPage(0, get().pageSize);
        if (cachedData.length > 0) {
          const totalCount = await getTotalCount();
          if (totalCount !== null) {
            cachedTotalCount = totalCount;
          }
        }
        set({
          cryptocurrencies: cachedData.length > 0 ? cachedData : cachedTop10,
          initialTop10: cachedTop10,
          filteredCryptos: cachedTop10,
          totalItems: cachedTotalCount,
          loading: false,
          initialLoading: false,
          hasFreshData: false,
          lastUpdated: topSnapshot.timestamp,
        });
      } else {
        const cachedPage = await getCryptoDataByPage(0, 20);
        if (cachedPage.length > 0) {
          cachedTop10 = cachedPage.slice(0, 10);
          cachedData = await getCryptoDataByPage(0, get().pageSize);
          const totalCount = await getTotalCount();
          if (totalCount !== null) {
            cachedTotalCount = totalCount;
          }
          set({
            cryptocurrencies: cachedData,
            initialTop10: cachedTop10,
            filteredCryptos: cachedTop10,
            totalItems: cachedTotalCount,
            loading: false,
            initialLoading: false,
            hasFreshData: false,
          });
        } else {
          set({
            loading: true,
            initialLoading: true,
            filteredCryptos: [],
            cryptocurrencies: [],
          });
        }
      }

      if (!dbHasData || cachedData.length === 0) {
        const { pageSize } = get();

        set({
          loading: true,
          initialLoading: true,
          filteredCryptos: [],
          cryptocurrencies: [],
        });

        const apiResponse = await queryClient.fetchQuery({
          queryKey: ['cryptocurrenciesPage', 1, pageSize, 'rank', 'desc'],
          queryFn: async () => await fetchCryptocurrenciesPage(1, pageSize),
        });
        const freshData = apiResponse.data.cryptoCurrencyList as Cryptocurrency[];
        const freshTop10 = freshData.slice(0, 10);
        const totalCount = parseInt(apiResponse.data.totalCount, 10);

        await saveCryptoPage(freshData, totalCount);

        if (freshTop10.length > 0) {
          await saveTopSnapshot(freshTop10);
        }

        set({
          cryptocurrencies: freshData,
          initialTop10: freshTop10,
          filteredCryptos: freshTop10,
          totalItems: totalCount,
          loading: false,
          initialLoading: false,
          lastUpdated: Date.now(),
          hasFreshData: true,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch cryptocurrency data',
        loading: false,
        initialLoading: false,
        hasFreshData: false,
      });
    }
  },

  goToPage: async (page: number) => {
    set({ loading: true });
    try {
      const { pageSize, displayedCount, initialTop10 } = get();
      const desiredStartIndex = (page - 1) * displayedCount;
      const baseIndex = Math.floor(desiredStartIndex / pageSize);
      const offset = desiredStartIndex % pageSize;

      let baseData = await getCryptoDataByPage(baseIndex, pageSize);
      if (baseData.length === 0) {
        const resp = await queryClient.fetchQuery({
          queryKey: ['cryptocurrenciesPage', baseIndex + 1, pageSize, 'rank', 'desc'],
          queryFn: async () => await fetchCryptocurrenciesPage(baseIndex + 1, pageSize),
        });
        baseData = resp.data.cryptoCurrencyList as Cryptocurrency[];
        const totalCount = parseInt(resp.data.totalCount, 10);
        await saveCryptoPage(baseData, totalCount);
      }

      let combined = baseData as Cryptocurrency[];
      const needed = offset + displayedCount;
      if (needed > pageSize) {
        let nextData = await getCryptoDataByPage(baseIndex + 1, pageSize);
        if (nextData.length === 0) {
          const resp2 = await queryClient.fetchQuery({
            queryKey: ['cryptocurrenciesPage', baseIndex + 2, pageSize, 'rank', 'desc'],
            queryFn: async () => await fetchCryptocurrenciesPage(baseIndex + 2, pageSize),
          });
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

      const apiResponse = await queryClient.fetchQuery({
        queryKey: ['cryptocurrenciesPage', baseIndex + 1, pageSize, 'rank', 'desc'],
        queryFn: async () => await fetchCryptocurrenciesPage(baseIndex + 1, pageSize),
      });
      const freshBaseData = apiResponse.data.cryptoCurrencyList as Cryptocurrency[];
      const totalCount = parseInt(apiResponse.data.totalCount, 10);
      await saveCryptoPage(freshBaseData, totalCount);

      let combined = [...freshBaseData];
      if (offset + displayedCount > pageSize) {
        const nextPageIndex = baseIndex + 2;
        const nextApiResponse = await queryClient.fetchQuery({
          queryKey: ['cryptocurrenciesPage', nextPageIndex, pageSize, 'rank', 'desc'],
          queryFn: async () => await fetchCryptocurrenciesPage(nextPageIndex, pageSize),
        });
        const freshNextData = nextApiResponse.data.cryptoCurrencyList as Cryptocurrency[];
        await saveCryptoPage(freshNextData, parseInt(nextApiResponse.data.totalCount, 10));
        combined = [...combined, ...freshNextData];
      }

      const currentWindow = combined.slice(offset, offset + displayedCount);

      let filteredWindow = currentWindow;
      if (searchTerm) {
        filteredWindow = currentWindow.filter(
          (crypto) =>
            crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      let updatedInitialTop10 = initialTop10;
      if (currentPage === 1 && !searchTerm) {
        const top10 = freshBaseData.slice(0, 10);
        updatedInitialTop10 = top10;
        await saveTopSnapshot(top10);
      }

      set({
        cryptocurrencies: freshBaseData,
        initialTop10: updatedInitialTop10,
        filteredCryptos: filteredWindow,
        totalItems: totalCount,
        lastUpdated: Date.now(),
        hasFreshData: true,
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
