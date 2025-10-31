'use client';

import React, { useEffect, useState } from 'react';
import { useCryptoStore } from '../store/cryptoStore';
import CryptoItem from '@/components/CryptoItem';
import CryptoItemSkeleton from '@/components/CryptoItemSkeleton';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import StatsBar from '@/components/StatsBar';
import TableHeader from '@/components/TableHeader';
import StickyTop10 from '@/components/StickyTop10';
import { Cryptocurrency } from '@/services/api';

const CryptoListPage = () => {
  const {
    filteredCryptos,
    initialTop10,
    cryptocurrencies,
    error,
    totalItems,
    searchTerm,
    currentPage,
    pageSize,
    displayedCount,
    setSearchTerm,
    fetchInitialData,
    startAutoRefresh,
    stopAutoRefresh,
    lastUpdated,
    goToPage,
    showMore,
    loading,
    initialLoading,
    hasFreshData,
  } = useCryptoStore();

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
    startAutoRefresh(30000); // Refresh every minute

    return () => {
      stopAutoRefresh();
    };
  }, [fetchInitialData, startAutoRefresh, stopAutoRefresh]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300); // Debounce search

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchTerm, setSearchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(displayedCount || 1, 1)));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Cryptocurrency Prices</h1>
          <p className="mt-3 text-lg text-gray-500">
            Real-time cryptocurrency market cap rankings and prices
          </p>
        </div>

        <SearchBar value={localSearchTerm} onChange={setLocalSearchTerm} loading={initialLoading} />

        <StatsBar
          totalItems={totalItems}
          showing={filteredCryptos.length}
          lastUpdated={lastUpdated}
          loading={initialLoading}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Crypto Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader />
            <tbody className="bg-white divide-y divide-gray-200">
              {searchTerm ? ( // If there's a search term, show search results normally
                initialLoading ? (
                  Array.from({ length: 10 }).map((_, i) => <CryptoItemSkeleton key={`s-${i}`} />)
                ) : (
                  filteredCryptos.map((crypto: Cryptocurrency) => (
                    <CryptoItem key={crypto.id} crypto={crypto} />
                  ))
                )
              ) : (
                // If no search term, use sticky top 10 for first 10 items
                <>
                  <StickyTop10
                    cachedTop10={initialTop10}
                    isLoading={initialLoading}
                    hasFreshData={hasFreshData}
                    freshTop10={filteredCryptos.slice(0, 10)}
                  />
                  {filteredCryptos.length > 10 &&
                    filteredCryptos
                      .slice(10)
                      .map((crypto: Cryptocurrency) => (
                        <CryptoItem key={crypto.id} crypto={crypto} />
                      ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage - 1}
          totalPages={totalPages}
          onPageChange={(pageIdx) => goToPage(pageIdx + 1)}
          hasMore={displayedCount < Math.min(200, cryptocurrencies.length)}
          onLoadMore={showMore}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CryptoListPage;
