import React from 'react';
import PaginationButton from '@/components/PaginationButton';

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
    <div className="flex flex-col items-center py-6">
      <div className="flex items-center space-x-2 mb-4">
        <PaginationButton onClick={() => onPageChange(0)} disabled={current === 1 || loading}>
          First
        </PaginationButton>
        <PaginationButton
          onClick={() => onPageChange(Math.max(0, current - 2))}
          disabled={current === 1 || loading}
        >
          Prev
        </PaginationButton>

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

        <PaginationButton
          onClick={() => onPageChange(Math.min(totalPages - 1, current))}
          disabled={current === totalPages || loading}
        >
          Next
        </PaginationButton>
        <PaginationButton
          onClick={() => onPageChange(totalPages - 1)}
          disabled={current === totalPages || loading}
        >
          Last
        </PaginationButton>
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
