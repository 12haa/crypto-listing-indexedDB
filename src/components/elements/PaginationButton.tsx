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
      className={`flex items-center justify-center min-w-[36px] h-9 rounded-lg cursor-pointer transition-all duration-200 ${
        active
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
    >
      {children}
    </button>
  );
};

export default PaginationButton;
