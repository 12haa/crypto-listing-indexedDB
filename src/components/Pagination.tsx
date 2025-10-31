import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  hasMore, 
  onLoadMore,
  loading
}) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col items-center py-6">
      <div className="flex space-x-2 mb-4">
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page - 1)}
            className={`px-3 py-1 rounded-md ${
              currentPage === page - 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Loading...' : 'Show More'}
        </button>
      )}
    </div>
  );
};

export default Pagination;