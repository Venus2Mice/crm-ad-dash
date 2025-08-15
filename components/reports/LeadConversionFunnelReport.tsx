
import React, { useMemo } from 'react';
import { Lead, LeadStatus, ChartType } from '../../types';
import ReportSection from './ReportSection';
import ChartComponent from '../dashboard/ChartComponent';

interface LeadConversionFunnelReportProps {
  leads: Lead[];
}

const LeadConversionFunnelReport: React.FC<LeadConversionFunnelReportProps> = ({ leads }) => {
  const funnelData = useMemo(() => {
    const statusCounts: { [key in LeadStatus]?: number } = {};
    leads.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });

    // Define order for funnel appearance
    const orderedStatuses: LeadStatus[] = [
      LeadStatus.NEW,
      LeadStatus.CONTACTED,
      LeadStatus.QUALIFIED,
      LeadStatus.PROPOSAL_SENT,
      LeadStatus.NEGOTIATION,
      LeadStatus.WON,
      LeadStatus.LOST,
    ];

    return orderedStatuses
      .map(status => ({
        name: status,
        value: statusCounts[status] || 0,
      }))
      .filter(item => item.value > 0); // Optionally filter out stages with 0 leads

  }, [leads]);

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6EE7B7', '#F87171'];


  return (
    <ReportSection title="Lead Conversion Funnel">
      {leads.length === 0 ? (
        <p className="text-medium-text text-center py-4">No lead data available to display funnel.</p>
      ) : funnelData.length === 0 ? (
         <p className="text-medium-text text-center py-4">No leads in defined funnel stages.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
             <ChartComponent
                data={funnelData}
                type={ChartType.PIE} // Using Pie chart to represent funnel stages distribution
                dataKeys={[{ key: 'value', color: pieColors }]}
                height={400}
            />
          </div>
          <div className="overflow-x-auto">
            <h4 className="text-md font-semibold text-dark-text mb-2">Lead Counts by Stage:</h4>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Count</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {funnelData.map(item => (
                        <tr key={item.name}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-dark-text">{item.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-medium-text">{item.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>
      )}
    </ReportSection>
  );
};

export default LeadConversionFunnelReport;
