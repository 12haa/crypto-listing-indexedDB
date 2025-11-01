import React from 'react';

const CryptoItemSkeleton: React.FC = () => {
  return (
    <tr className="border-b border-gray-200">
      <td className="py-4 px-4 text-center">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 mr-3 animate-pulse" />
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-20 ml-auto animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-16 ml-auto animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-24 ml-auto animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-24 ml-auto animate-pulse"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-20 ml-auto animate-pulse"></div>
      </td>
    </tr>
  );
};

export default CryptoItemSkeleton;