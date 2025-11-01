import React, { useEffect, useState } from 'react';

import { formatCurrency, formatNumber } from '@/utils/formatters';

import CryptoItemSkeleton from './CryptoItemSkeleton';
import { Cryptocurrency } from '@/types';

interface CryptoItemProps {
  crypto: Cryptocurrency;
  isSticky?: boolean;
  cachedCrypto?: Cryptocurrency;
  hasFreshData?: boolean;
  isLoading?: boolean;
}

const NameCell: React.FC<{ name: string; symbol: string }> = ({ name, symbol }) => (
  <div className="flex flex-col">
    <div className="font-semibold text-gray-900">{name}</div>
    <div className="text-sm text-gray-500 font-mono">{symbol}</div>
  </div>
);

const ChangeCell: React.FC<{ change24h?: number }> = ({ change24h }) => {
  const isPositive = change24h !== undefined && change24h >= 0;
  const changeValue = change24h !== undefined ? Math.abs(change24h) : null;

  return (
    <td className="py-4 px-4 text-right">
      <div
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {changeValue !== null ? `${isPositive ? '+' : '-'}${changeValue.toFixed(2)}%` : 'N/A'}
        <span className={`ml-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {changeValue !== null && (isPositive ? '↑' : '↓')}
        </span>
      </div>
    </td>
  );
};

const CryptoItem: React.FC<CryptoItemProps> = ({
  crypto,
  isSticky = false,
  cachedCrypto,
  hasFreshData = false,
  isLoading = false,
}) => {
  // Determine if we should initially show cached data
  const shouldShowCachedInitially = isSticky && cachedCrypto && (!hasFreshData || isLoading);
  const [showCached, setShowCached] = useState(shouldShowCachedInitially);

  useEffect(() => {
    // Reset state when props change
    const newShouldShowCached = isSticky && cachedCrypto && (!hasFreshData || isLoading);
    if (!isSticky) {
      setShowCached(false);
    } else if (newShouldShowCached && !showCached) {
      setShowCached(true);
    } else if (isSticky && hasFreshData && showCached && !isLoading) {
      // Show cached data for a brief moment before transitioning to fresh
      const timer = setTimeout(() => {
        setShowCached(false);
      }, 100); // Small delay to make the transition smooth

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSticky, hasFreshData, isLoading, cachedCrypto]);

  // Determine which crypto data to display
  // Show cached if in sticky mode, we want to show cached, and we have cached data
  // Otherwise show fresh crypto data
  const displayCrypto = isSticky && showCached && cachedCrypto ? cachedCrypto : crypto;

  // Extract USD quote data from the quotes array
  const usdQuote = displayCrypto.quotes.find((quote) => quote.name === 'USD');

  const price = usdQuote?.price || 0;
  const change24h = usdQuote?.percentChange24h;
  const marketCap = usdQuote?.marketCap;
  const volume24h = usdQuote?.volume24h;
  const circulatingSupply = displayCrypto.circulatingSupply;

  // Show skeleton if sticky mode and loading with no cached data
  if (isSticky && isLoading && !cachedCrypto) {
    return <CryptoItemSkeleton />;
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-indigo-50/50 transition-colors duration-200">
      <td className="py-4 px-4 text-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 text-sm font-bold">
          {displayCrypto.cmcRank}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center">
          <NameCell name={displayCrypto.name} symbol={displayCrypto.symbol} />
        </div>
      </td>
      <td className="py-4 px-4 text-right font-medium text-gray-900">{formatCurrency(price)}</td>
      <ChangeCell change24h={change24h} />
      <td className="py-4 px-4 text-right text-gray-700">
        {marketCap ? formatCurrency(marketCap) : 'N/A'}
      </td>
      <td className="py-4 px-4 text-right text-gray-700">
        {volume24h ? formatCurrency(volume24h) : 'N/A'}
      </td>
      <td className="py-4 px-4 text-right text-gray-700">
        {circulatingSupply ? formatNumber(circulatingSupply) + ' ' + displayCrypto.symbol : 'N/A'}
      </td>
    </tr>
  );
};

export default CryptoItem;
