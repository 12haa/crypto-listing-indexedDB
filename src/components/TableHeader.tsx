import React from 'react';

const TableHeader: React.FC = () => (
  <thead className="bg-gray-50">
    <tr>
      <th
        scope="col"
        className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        #
      </th>
      <th
        scope="col"
        className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        Name
      </th>
      <th
        scope="col"
        className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        Price
      </th>
      <th
        scope="col"
        className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        24h %
      </th>
      <th
        scope="col"
        className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        Market Cap
      </th>
      <th
        scope="col"
        className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        Volume (24h)
      </th>
      <th
        scope="col"
        className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        Circulating Supply
      </th>
    </tr>
  </thead>
);

export default TableHeader;
