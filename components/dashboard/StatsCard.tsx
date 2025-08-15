
import React from 'react';
import { StatsCardData } from '../../types';

const StatsCard: React.FC<StatsCardData> = ({ title, value, icon, trend, trendDirection }) => {
  const trendColor = trendDirection === 'up' ? 'text-green-500' : trendDirection === 'down' ? 'text-red-500' : 'text-gray-500';
  const trendIcon = trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '';

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-medium-text uppercase tracking-wider">{title}</h3>
        <div className="text-primary">{icon}</div>
      </div>
      <div>
        <p className="text-3xl font-semibold text-dark-text mb-1">{value}</p>
        {trend && (
          <p className={`text-sm ${trendColor}`}>
            {trendIcon} {trend}
            <span className="text-gray-500"> vs last month</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
    