import React from 'react';
import PaginationButton from '@/components/elements/PaginationButton';

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
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const renderPageButton = (page: number) => (
    <PaginationButton
      key={page}
      active={current === page}
      onClick={() => onPageChange(page - 1)}
      disabled={loading}
    >
      {page}
    </PaginationButton>
  );

  return (
    <div className="flex flex-col items-center py-8">
      <div className="flex items-center space-x-1 mb-6 flex-wrap justify-center">
        <PaginationButton onClick={() => onPageChange(0)} disabled={current === 1 || loading}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </PaginationButton>
        <PaginationButton
          onClick={() => onPageChange(Math.max(0, current - 2))}
          disabled={current === 1 || loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </PaginationButton>

        {start > 1 && (
          <>
            {renderPageButton(1)}
            {start > 2 && <span className="px-2 text-gray-400">…</span>}
          </>
        )}

        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) =>
          renderPageButton(p)
        )}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-2 text-gray-400">…</span>}
            {renderPageButton(totalPages)}
          </>
        )}

        <PaginationButton
          onClick={() => onPageChange(Math.min(totalPages - 1, current))}
          disabled={current === totalPages || loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </PaginationButton>
        <PaginationButton
          onClick={() => onPageChange(totalPages - 1)}
          disabled={current === totalPages || loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </PaginationButton>
      </div>

      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="px-6 cursor-pointer py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </span>
          ) : (
            'Load More Cryptocurrencies'
          )}
        </button>
      )}
    </div>
  );
};

export default Pagination;
