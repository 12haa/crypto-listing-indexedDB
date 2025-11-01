import React from 'react';
import { Cryptocurrency } from '@/services/api';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface CryptoItemProps {
  crypto: Cryptocurrency;
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
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {changeValue !== null ? `${isPositive ? '+' : '-'}${changeValue.toFixed(2)}%` : 'N/A'}
        <span className={`ml-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {changeValue !== null && (isPositive ? '↑' : '↓')}
        </span>
      </div>
    </td>
  );
};

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
    <tr className="border-b border-gray-100 hover:bg-indigo-50/50 transition-colors duration-200">
      <td className="py-4 px-4 text-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 text-sm font-bold">
          {crypto.cmcRank}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center">
          <NameCell name={crypto.name} symbol={crypto.symbol} />
        </div>
      </td>
      <td className="py-4 px-4 text-right font-medium text-gray-900">{formatCurrency(price)}</td>
      <ChangeCell change24h={change24h} />
      <td className="py-4 px-4 text-right text-gray-700">{marketCap ? formatCurrency(marketCap) : 'N/A'}</td>
      <td className="py-4 px-4 text-right text-gray-700">{volume24h ? formatCurrency(volume24h) : 'N/A'}</td>
      <td className="py-4 px-4 text-right text-gray-700">
        {circulatingSupply ? formatNumber(circulatingSupply) + ' ' + crypto.symbol : 'N/A'}
      </td>
    </tr>
  );
};

export default CryptoItem;
