import React from 'react';

interface StatsBarProps {
  totalItems: number;
  showing: number;
  lastUpdated: number | null;
  loading?: boolean;
}

const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
  </div>
);

const StatsBar: React.FC<StatsBarProps> = ({ totalItems, showing, lastUpdated, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-sm font-medium text-gray-600">Total Cryptocurrencies</p>
        <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-sm font-medium text-gray-600">Showing</p>
        <p className="text-2xl font-bold text-gray-900">{showing}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-sm font-medium text-gray-600">Last Updated</p>
        <p className="text-2xl font-bold text-gray-900">
          {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}
        </p>
      </div>
    </div>
  );
};

export default StatsBar;
