import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, loading }) => {
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mb-8">
        <div className="h-14 w-full bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div className="relative group">
        <input
          type="text"
          placeholder="Search cryptocurrencies..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 pl-14 pr-6 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          <svg
            className="h-6 w-6 text-indigo-400 group-focus-within:text-indigo-600 transition-colors"
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
  );
};

export default SearchBar;
