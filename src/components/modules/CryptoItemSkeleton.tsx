import React from 'react';

const CryptoItemSkeleton: React.FC = () => {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-4 px-4 text-center">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center">
          <div className="flex flex-col space-y-2">
            <div className="h-4 bg-indigo-100 rounded w-24 animate-pulse"></div>
            <div className="h-3 bg-indigo-50 rounded w-12 animate-pulse"></div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-indigo-100 rounded w-20 ml-auto animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-6 w-16 ml-auto">
          <div className="inline-flex items-center justify-center w-full h-full bg-indigo-100 rounded-full animate-pulse"></div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-indigo-100 rounded w-24 ml-auto animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-indigo-100 rounded w-24 ml-auto animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-indigo-100 rounded w-20 ml-auto animate-pulse"></div>
      </td>
    </tr>
  );
};

export default CryptoItemSkeleton;