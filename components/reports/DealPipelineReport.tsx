
import React, { useMemo } from 'react';
import { Deal, DealStage, ChartType } from '../../types';
import ReportSection from './ReportSection';
import ChartComponent from '../dashboard/ChartComponent';
import { formatCurrency } from '../../services/reportUtils';
import { getStatusColor } from '../../constants';

interface DealPipelineReportProps {
  deals: Deal[];
}

const DealPipelineReport: React.FC<DealPipelineReportProps> = ({ deals }) => {
  const pipelineData = useMemo(() => {
    const stageValues: { [key in DealStage]?: number } = {};
    deals.forEach(deal => {
      // Exclude Closed Won/Lost from active pipeline value for some views, or include for total overview
      // For this report, let's show all stages including closed ones to see full picture
      stageValues[deal.stage] = (stageValues[deal.stage] || 0) + deal.value;
    });

    const orderedStages: DealStage[] = Object.values(DealStage);

    return orderedStages.map(stage => ({
      name: stage,
      value: stageValues[stage] || 0,
    })).filter(item => item.value > 0); // Filter out stages with 0 value for cleaner chart
  }, [deals]);

  const totalPipelineValue = useMemo(() => {
    return deals.filter(d => d.stage !== DealStage.CLOSED_LOST && d.stage !== DealStage.CLOSED_WON)
                .reduce((sum, deal) => sum + deal.value, 0);
  }, [deals]);
  
  const totalClosedWonValue = useMemo(() => {
    return deals.filter(d => d.stage === DealStage.CLOSED_WON)
                .reduce((sum, deal) => sum + deal.value, 0);
  }, [deals]);


  const barColors = ['#A855F7', '#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#6B7280', '#EC4899'];

  return (
    <ReportSection title="Deal Pipeline Analysis">
      {deals.length === 0 ? (
        <p className="text-medium-text text-center py-4">No deal data available for pipeline analysis.</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700">Active Pipeline Value</h4>
                <p className="text-2xl font-semibold text-blue-600">{formatCurrency(totalPipelineValue)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-700">Total Closed Won Value (All Time)</h4>
                <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalClosedWonValue)}</p>
            </div>
          </div>
          { pipelineData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
               <div>
                <h4 className="text-md font-semibold text-dark-text mb-2">Total Value by Stage:</h4>
                 <ChartComponent
                    data={pipelineData}
                    type={ChartType.BAR}
                    xAxisKey="name"
                    dataKeys={[{ key: 'value', color: '#8B5CF6' }]} // Using a single color for stages
                    height={400}
                />
               </div>
               <div className="overflow-x-auto">
                 <h4 className="text-md font-semibold text-dark-text mb-2">Pipeline Summary Table:</h4>
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Count</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pipelineData.map(item => {
                            const dealCount = deals.filter(d => d.stage === item.name).length;
                            return (
                                <tr key={item.name}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-dark-text">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.name as DealStage)}`}>
                                        {item.name}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-medium-text">{formatCurrency(item.value)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-medium-text">{dealCount}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
               </div>
            </div>
             ) : (
                 <p className="text-medium-text text-center py-4">No deals with value found in pipeline stages.</p>
             )}
        </>
      )}
    </ReportSection>
  );
};

export default DealPipelineReport;
