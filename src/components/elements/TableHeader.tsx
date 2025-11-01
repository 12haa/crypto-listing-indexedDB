import React from 'react';

const TableHeader: React.FC = () => (
  <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
    <tr>
      <th
        scope="col"
        className="py-4 px-4 text-left text-sm font-semibold text-indigo-700 uppercase tracking-wider"
      >
        #
      </th>
      <th
        scope="col"
        className="py-4 px-4 text-left text-sm font-semibold text-indigo-700 uppercase tracking-wider"
      >
        Name
      </th>
      <th
        scope="col"
        className="py-4 px-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider"
      >
        Price
      </th>
      <th
        scope="col"
        className="py-4 px-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider"
      >
        24h %
      </th>
      <th
        scope="col"
        className="py-4 px-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider"
      >
        Market Cap
      </th>
      <th
        scope="col"
        className="py-4 px-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider"
      >
        Volume (24h)
      </th>
      <th
        scope="col"
        className="py-4 px-4 text-right text-sm font-semibold text-indigo-700 uppercase tracking-wider"
      >
        Circulating Supply
      </th>
    </tr>
  </thead>
);

export default TableHeader;
