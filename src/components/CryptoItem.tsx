import React from 'react';
import Image from 'next/image';
import { Cryptocurrency } from '@/services/api';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';

interface CryptoItemProps {
  crypto: Cryptocurrency;
}

const CryptoItem: React.FC<CryptoItemProps> = ({ crypto }) => {
  // Extract USD quote data from the quotes array
  const usdQuote = crypto.quotes.find((quote) => quote.name === 'USD');
  const btcQuote = crypto.quotes.find((quote) => quote.name === 'BTC');

  const price = usdQuote?.price || 0;
  const change24h = usdQuote?.percentChange24h;
  const marketCap = usdQuote?.marketCap;
  const volume24h = usdQuote?.volume24h;
  const circulatingSupply = crypto.circulatingSupply;

  // Create a URL for the cryptocurrency logo using a placeholder service
  const logoUrl = `https://cryptologos.cc/logos/${crypto.slug}-${crypto.id}.png`;

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4 text-center">
        <span className="font-medium text-gray-900">#{crypto.cmcRank}</span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center">
          {/* <div className="relative w-8 h-8 mr-3">
            <Image
              src={logoUrl}
              alt={crypto.name}
              width={32}
              height={32}
              className="object-contain"
              onError={(e) => {
                // Fallback to a generic crypto icon if the logo fails to load
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${crypto.name}&background=random`;
              }}
              loading="lazy"
            />
          </div> */}
          <div>
            <div className="font-medium text-gray-900">{crypto.name}</div>
            <div className="text-sm text-gray-500">{crypto.symbol}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-right font-medium">{formatCurrency(price)}</td>
      <td
        className={`py-4 px-4 text-right ${
          change24h !== undefined && change24h >= 0 ? 'text-green-500' : 'text-red-500'
        }`}
      >
        {change24h !== undefined ? formatPercent(Math.abs(change24h)) : 'N/A'}
        <span
          className={`ml-1 ${
            change24h !== undefined && change24h >= 0 ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {change24h !== undefined && change24h >= 0 ? '↑' : '↓'}
        </span>
      </td>
      <td className="py-4 px-4 text-right">{marketCap ? formatCurrency(marketCap) : 'N/A'}</td>
      <td className="py-4 px-4 text-right">{volume24h ? formatCurrency(volume24h) : 'N/A'}</td>
      <td className="py-4 px-4 text-right">
        {circulatingSupply ? formatNumber(circulatingSupply) + ' ' + crypto.symbol : 'N/A'}
      </td>
    </tr>
  );
};

export default CryptoItem;
