import React from 'react';

interface PaginationButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  skeleton?: boolean;
}

const PaginationButton: React.FC<PaginationButtonProps> = ({
  active,
  disabled,
  onClick,
  children,
  skeleton,
}) => {
  if (skeleton) {
    return <div className="px-6 py-2 rounded-md bg-gray-200 animate-pulse" />;
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-md ${
        active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } disabled:opacity-50`}
    >
      {children}
    </button>
  );
};

export default PaginationButton;
