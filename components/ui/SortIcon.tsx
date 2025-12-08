
import React from 'react';

interface SortIconProps {
  columnKey: string;
  sortConfig: { key: any; direction: 'ascending' | 'descending' } | null;
}

const SortIcon: React.FC<SortIconProps> = ({ columnKey, sortConfig }) => {
  if (!sortConfig || sortConfig.key !== columnKey) {
    return <span className="ml-2 text-gray-300 opacity-0 group-hover:opacity-50">↕</span>;
  }

  return (
    <span className="ml-2 text-primary">
      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
    </span>
  );
};

export default SortIcon;
