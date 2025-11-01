import React from 'react';
import { Cryptocurrency } from '@/services/api';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface CryptoItemProps {
  crypto: Cryptocurrency;
}

const NameCell: React.FC<{ name: string; symbol: string }> = ({ name, symbol }) => (
  <div>
    <div className="font-medium text-gray-900">{name}</div>
    <div className="text-sm text-gray-500">{symbol}</div>
  </div>
);

const ChangeCell: React.FC<{ change24h?: number }> = ({ change24h }) => (
  <td
    className={`py-4 px-4 text-right ${
      change24h !== undefined && change24h >= 0 ? 'text-green-500' : 'text-red-500'
    }`}
  >
    {change24h !== undefined ? Math.abs(change24h).toFixed(2) + '%' : 'N/A'}
    <span
      className={`ml-1 ${
        change24h !== undefined && change24h >= 0 ? 'text-green-500' : 'text-red-500'
      }`}
    >
      {change24h !== undefined && change24h >= 0 ? '↑' : '↓'}
    </span>
  </td>
);

const CryptoItem: React.FC<CryptoItemProps> = ({ crypto }) => {
  // Extract USD quote data from the quotes array
  const usdQuote = crypto.quotes.find((quote) => quote.name === 'USD');

  const price = usdQuote?.price || 0;
  const change24h = usdQuote?.percentChange24h;
  const marketCap = usdQuote?.marketCap;
  const volume24h = usdQuote?.volume24h;
  const circulatingSupply = crypto.circulatingSupply;

  // Logo handling removed for now to avoid unused vars

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4 text-center">
        <span className="font-medium text-gray-900">#{crypto.cmcRank}</span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center">
          <NameCell name={crypto.name} symbol={crypto.symbol} />
        </div>
      </td>
      <td className="py-4 px-4 text-right font-medium">{formatCurrency(price)}</td>
      <ChangeCell change24h={change24h} />
      <td className="py-4 px-4 text-right">{marketCap ? formatCurrency(marketCap) : 'N/A'}</td>
      <td className="py-4 px-4 text-right">{volume24h ? formatCurrency(volume24h) : 'N/A'}</td>
      <td className="py-4 px-4 text-right">
        {circulatingSupply ? formatNumber(circulatingSupply) + ' ' + crypto.symbol : 'N/A'}
      </td>
    </tr>
  );
};

export default CryptoItem;
