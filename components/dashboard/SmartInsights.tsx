
import React, { useState, useEffect, useCallback } from 'react';
import { fetchDashboardInsights } from '../../services/geminiService';
import Spinner from '../ui/Spinner';
import { LightBulbIcon } from '../ui/Icon';
import { ChartDataItem } from '../../types';

// Define a more specific type for the crmData prop
interface SmartInsightsCrmData {
  salesData: ChartDataItem[];
  leadSources: ChartDataItem[];
  dealStats?: {
    totalDeals: number;
    openDeals: number;
    averageDealValue: number;
  };
  // Potentially add more summarized data structures as needed
  // customerStats?: any;
  // taskStats?: any;
}

interface SmartInsightsProps {
  crmData: SmartInsightsCrmData; // Use the more specific type
}

const SmartInsights: React.FC<SmartInsightsProps> = ({ crmData }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInsights(null); 
    try {
      // Pass the structured crmData directly
      const fetchedInsights = await fetchDashboardInsights(crmData);
      setInsights(fetchedInsights);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to load insights. ${errorMessage}`);
      console.error("Error in SmartInsights component:", err);
    } finally {
      setIsLoading(false);
    }
  }, [crmData]); 
  
  useEffect(() => {
    // Only load insights if crmData is available and seems meaningful
    // For example, check if there's sales data or lead source data
    if (crmData && (crmData.salesData?.length > 0 || crmData.leadSources?.length > 0 || crmData.dealStats)) {
        loadInsights();
    } else {
        setInsights("Not enough data available to generate insights. Please add more leads, deals, etc.");
        setIsLoading(false);
    }
  }, [loadInsights, crmData]); // Call loadInsights when crmData changes

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-4">
        <LightBulbIcon className="h-6 w-6 text-yellow-400 mr-2" />
        <h3 className="text-lg font-semibold text-dark-text">Smart Insights (AI Powered)</h3>
      </div>
      <div className="flex-grow p-4 bg-blue-50 border border-blue-200 rounded-md overflow-y-auto min-h-[200px]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full">
            <Spinner size="md" color="text-primary" />
            <p className="mt-2 text-medium-text">Generating insights from AI...</p>
          </div>
        )}
        {error && (
            <div className="text-red-600 bg-red-50 p-3 rounded-md">
                <p className="font-semibold">Error:</p>
                <p className="text-sm">{error}</p>
            </div>
        )}
        {!isLoading && !error && insights && (
          <div className="space-y-3">
            {insights.split('\n').filter(para => para.trim() !== '').map((paragraph, index) => (
              <p key={index} className="text-sm text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        )}
         {!isLoading && !error && !insights && (
          <p className="text-medium-text text-center">No insights available or AI did not return specific advice.</p>
        )}
      </div>
      <button
        onClick={loadInsights}
        disabled={isLoading || !(crmData && (crmData.salesData?.length > 0 || crmData.leadSources?.length > 0 || crmData.dealStats))}
        className="mt-4 w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Refreshing AI Insights...' : 'Refresh AI Insights'}
      </button>
    </div>
  );
};

export default SmartInsights;
