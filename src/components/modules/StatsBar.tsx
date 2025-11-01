import React from 'react';

interface StatsBarProps {
  totalItems: number;
  showing: number;
  lastUpdated: number | null;
  loading?: boolean;
}

const StatCardSkeleton = () => (
  <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
    <div className="h-4 w-3/4 bg-indigo-100 rounded mb-3" />
    <div className="h-6 w-1/2 bg-indigo-200 rounded" />
  </div>
);

const StatsBar: React.FC<StatsBarProps> = ({ totalItems, showing, lastUpdated, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
        <p className="text-sm font-medium text-indigo-600 mb-1">Total Cryptocurrencies</p>
        <p className="text-2xl font-bold text-gray-800">{totalItems.toLocaleString()}</p>
      </div>
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
        <p className="text-sm font-medium text-blue-600 mb-1">Showing</p>
        <p className="text-2xl font-bold text-gray-800">{showing.toLocaleString()}</p>
      </div>
      <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
        <p className="text-sm font-medium text-purple-600 mb-1">Last Updated</p>
        <p className="text-2xl font-bold text-gray-800">
          {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}
        </p>
      </div>
    </div>
  );
};

export default StatsBar;
