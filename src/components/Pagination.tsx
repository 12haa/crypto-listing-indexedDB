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
  loading,
}) => {
  const maxVisible = 10;
  const current = currentPage + 1; // convert to 1-based for math

  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const renderPageButton = (page: number) => (
    <button
      key={page}
      onClick={() => onPageChange(page - 1)}
      className={`px-3 py-1 rounded-md ${
        current === page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {page}
    </button>
  );

  return (
    <div className="flex flex-col items-center py-6">
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={() => onPageChange(0)}
          disabled={current === 1}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          First
        </button>
        <button
          onClick={() => onPageChange(Math.max(0, current - 2))}
          disabled={current === 1}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Prev
        </button>

        {start > 1 && (
          <>
            {renderPageButton(1)}
            {start > 2 && <span className="px-1">…</span>}
          </>
        )}

        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) =>
          renderPageButton(p)
        )}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1">…</span>}
            {renderPageButton(totalPages)}
          </>
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, current))}
          disabled={current === totalPages}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={current === totalPages}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Last
        </button>
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
