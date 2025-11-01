import React from 'react';

interface PaginationButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const PaginationButton: React.FC<PaginationButtonProps> = ({
  active,
  disabled,
  onClick,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-md cursor-pointer ${
        active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
    >
      {children}
    </button>
  );
};

export default PaginationButton;
