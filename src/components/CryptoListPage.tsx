'use client';

import React, { useEffect, useState } from 'react';
import { useCryptoStore } from '../store/cryptoStore';
import CryptoItem from '@/components/CryptoItem';
import Pagination from '@/components/Pagination';
import { Cryptocurrency } from '@/services/api';

const CryptoListPage = () => {
  const {
    filteredCryptos,
    cryptocurrencies,
    error,
    totalItems,
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
  } = useCryptoStore();

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
    startAutoRefresh(60000); // Refresh every minute

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

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-600">Total Cryptocurrencies</p>
            <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-600">Showing</p>
            <p className="text-2xl font-bold text-gray-900">{filteredCryptos.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-600">Last Updated</p>
            <p className="text-2xl font-bold text-gray-900">
              {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}
            </p>
          </div>
        </div>

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
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  24h %
                </th>
                <th
                  scope="col"
                  className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Market Cap
                </th>
                <th
                  scope="col"
                  className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Volume (24h)
                </th>
                <th
                  scope="col"
                  className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Circulating Supply
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCryptos.map((crypto: Cryptocurrency) => (
                <CryptoItem key={crypto.id} crypto={crypto} />
              ))}
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
