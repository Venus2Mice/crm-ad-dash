import React, { useState, useCallback, useMemo } from 'react';
import { ReportType, REPORT_TYPE_OPTIONS, Lead, Deal, Customer, Task, SalesForecastInputData, SalesForecastResult, DealStage } from '../types';
import SalesPerformanceReport from '../components/reports/SalesPerformanceReport';
import LeadConversionFunnelReport from '../components/reports/LeadConversionFunnelReport';
import DealPipelineReport from '../components/reports/DealPipelineReport';
import CustomerActivityReport from '../components/reports/CustomerActivityReport';
import LeadSourceEffectivenessReport from '../components/reports/LeadSourceEffectivenessReport'; // Added
import ReportSection from '../components/reports/ReportSection';
import Spinner from '../components/ui/Spinner';
import { LightBulbIcon, DocumentChartBarIcon, ExclamationTriangleIcon } from '../components/ui/Icon';
import { fetchSalesForecast } from '../services/geminiService';

interface ReportsPageProps {
  leads: Lead[];
  customers: Customer[];
  deals: Deal[];
  tasks: Task[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ leads, customers, deals, tasks }) => {
  const [selectedReport, setSelectedReport] = useState<ReportType | ''>('');
  const [salesForecast, setSalesForecast] = useState<SalesForecastResult | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState<boolean>(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  const handleGenerateForecast = useCallback(async () => {
    setIsForecastLoading(true);
    setForecastError(null);
    setSalesForecast(null);

    try {
      // Prepare data for the forecast
      const today = new Date();
      const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());

      const historicalWonDeals = deals
        .filter(d => d.stage === DealStage.CLOSED_WON && new Date(d.closeDate) >= sixMonthsAgo && new Date(d.closeDate) <= today)
        .map(d => ({ value: d.value, closeDate: d.closeDate, currency: d.currency }))
        .sort((a,b) => new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime()); // Most recent first

      const openDeals = deals
        .filter(d => d.stage !== DealStage.CLOSED_WON && d.stage !== DealStage.CLOSED_LOST)
        .map(d => ({ value: d.value, stage: d.stage, expectedCloseDate: d.closeDate, currency: d.currency }));
      
      const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
      const recentLeadVolume = leads.filter(l => new Date(l.createdAt) >= thirtyDaysAgo).length;

      const forecastInput: SalesForecastInputData = {
        historicalWonDeals: historicalWonDeals.slice(0, 50), // Limit for prompt size
        openDeals: openDeals.slice(0, 50), // Limit for prompt size
        recentLeadVolume,
        forecastPeriod: "next quarter",
      };
      
      const result = await fetchSalesForecast(forecastInput);
      setSalesForecast(result);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setForecastError(`Failed to generate forecast. ${errorMessage}`);
      console.error("Error generating sales forecast:", err);
    } finally {
      setIsForecastLoading(false);
    }
  }, [deals, leads]);


  const renderSelectedReport = () => {
    switch (selectedReport) {
      case 'sales_performance':
        return <SalesPerformanceReport deals={deals} />;
      case 'lead_conversion_funnel':
        return <LeadConversionFunnelReport leads={leads} />;
      case 'deal_pipeline':
        return <DealPipelineReport deals={deals} />;
      case 'customer_activity':
        return <CustomerActivityReport customers={customers} deals={deals} tasks={tasks} />;
      case 'lead_source_effectiveness': // Added case
        return <LeadSourceEffectivenessReport leads={leads} deals={deals} />;
      default:
        return (
          <div className="text-center py-10 bg-white p-6 rounded-lg shadow">
            <DocumentChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-medium-text">Select a report type from the dropdown to view analytics.</p>
            <p className="text-sm text-gray-400 mt-2">
                Available reports include Sales Performance, Lead Conversion Funnel, Deal Pipeline, Customer Activity, and Lead Source Effectiveness.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h2 className="text-2xl font-semibold text-dark-text">CRM Reports</h2>
          <div className="w-full sm:w-auto">
            <label htmlFor="reportType" className="sr-only">Select Report Type</label>
            <select
              id="reportType"
              name="reportType"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as ReportType | '')}
              className="block w-full sm:w-72 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-dark-text"
            >
              <option value="" disabled>Select a report...</option>
              {REPORT_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* AI Sales Forecast Section */}
      <ReportSection title="AI Sales Forecast" className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center mb-3">
          <LightBulbIcon className="h-6 w-6 text-yellow-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-indigo-700">
            Get an AI-powered sales forecast based on your current CRM data. 
            This can help anticipate future revenue and identify key influencing factors.
          </p>
        </div>
        {isForecastLoading && (
          <div className="flex flex-col items-center justify-center h-40">
            <Spinner size="md" color="text-primary" />
            <p className="mt-3 text-medium-text">Generating forecast from AI...</p>
          </div>
        )}
        {forecastError && !isForecastLoading && (
           <div className="my-4 p-4 bg-red-100 border border-red-300 rounded-md text-red-700 flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
                <p className="font-semibold">Error Generating Forecast:</p>
                <p className="text-sm">{forecastError}</p>
            </div>
          </div>
        )}
        {!isForecastLoading && !forecastError && salesForecast && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md shadow">
            <h4 className="text-md font-semibold text-primary mb-2">Forecast Results:</h4>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
              {salesForecast.forecastText.split('\n').map((line, index, array) => {
                if (line.startsWith('Forecasted Revenue:') || line.startsWith('Confidence Level:') || line.startsWith('Key Factors:')) {
                  return <strong key={index} className="block mt-2 first:mt-0">{line}</strong>;
                }
                if (line.startsWith('- ')) {
                    return <p key={index} className="ml-4 my-0.5">{line}</p>;
                }
                return <p key={index} className="my-1">{line || (index < array.length -1 ? <br /> : '')}</p>; // Add line break for empty lines to maintain spacing
              })}
            </div>
          </div>
        )}
        {!isForecastLoading && (
          <button
            onClick={handleGenerateForecast}
            disabled={isForecastLoading}
            className="mt-4 w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{salesForecast ? 'Refresh Forecast' : "Generate Next Quarter's Forecast"}</span>
          </button>
        )}
      </ReportSection>

      {renderSelectedReport()}
    </div>
  );
};

export default ReportsPage;