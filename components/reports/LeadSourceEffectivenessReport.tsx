import React, { useMemo } from 'react';
import { Lead, Deal, DealStage, ChartType } from '../../types';
import ReportSection from './ReportSection';
import ChartComponent from '../dashboard/ChartComponent';
import { formatCurrency } from '../../services/reportUtils';

interface LeadSourceEffectivenessReportProps {
  leads: Lead[];
  deals: Deal[];
}

interface SourceEffectivenessData {
  source: string;
  totalLeads: number;
  dealsCreated: number;
  leadToDealRate: number;
  wonDeals: number;
  leadToWonDealRate: number;
  totalWonValue: number;
}

const LeadSourceEffectivenessReport: React.FC<LeadSourceEffectivenessReportProps> = ({ leads, deals }) => {
  const effectivenessData = useMemo(() => {
    const sourceMap: Map<string, SourceEffectivenessData> = new Map();

    leads.forEach(lead => {
      const sourceName = lead.source || 'Unknown';
      if (!sourceMap.has(sourceName)) {
        sourceMap.set(sourceName, {
          source: sourceName,
          totalLeads: 0,
          dealsCreated: 0,
          leadToDealRate: 0,
          wonDeals: 0,
          leadToWonDealRate: 0,
          totalWonValue: 0,
        });
      }
      const data = sourceMap.get(sourceName)!;
      data.totalLeads += 1;
    });

    deals.forEach(deal => {
      if (deal.leadId) {
        const originatingLead = leads.find(l => l.id === deal.leadId);
        if (originatingLead) {
          const sourceName = originatingLead.source || 'Unknown';
          const data = sourceMap.get(sourceName);
          if (data) {
            data.dealsCreated += 1;
            if (deal.stage === DealStage.CLOSED_WON) {
              data.wonDeals += 1;
              data.totalWonValue += deal.value;
            }
          }
        }
      }
    });

    sourceMap.forEach(data => {
      data.leadToDealRate = data.totalLeads > 0 ? (data.dealsCreated / data.totalLeads) * 100 : 0;
      data.leadToWonDealRate = data.totalLeads > 0 ? (data.wonDeals / data.totalLeads) * 100 : 0;
    });
    
    return Array.from(sourceMap.values()).sort((a, b) => b.totalLeads - a.totalLeads);
  }, [leads, deals]);

  const leadsBySourceChartData = useMemo(() => {
    return effectivenessData.map(item => ({
      name: item.source,
      value: item.totalLeads,
    })).filter(item => item.value > 0);
  }, [effectivenessData]);

  return (
    <ReportSection title="Lead Source Effectiveness">
      {leads.length === 0 ? (
        <p className="text-medium-text text-center py-4">No lead data available for this report.</p>
      ) : (
        <div className="space-y-6">
          {leadsBySourceChartData.length > 0 && (
            <ReportSection title="Leads by Source">
                <ChartComponent
                    data={leadsBySourceChartData}
                    type={ChartType.BAR}
                    xAxisKey="name"
                    dataKeys={[{ key: 'value', color: '#10B981' }]}
                    height={300}
                />
            </ReportSection>
          )}

          <ReportSection title="Source Performance Details">
            {effectivenessData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Leads</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deals Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead to Deal %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Won Deals</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead to Won %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value of Won Deals</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {effectivenessData.map(item => (
                    <tr key={item.source} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dark-text">{item.source}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-medium-text">{item.totalLeads}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-medium-text">{item.dealsCreated}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-medium-text">{item.leadToDealRate.toFixed(1)}%</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-medium-text">{item.wonDeals}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-medium-text">{item.leadToWonDealRate.toFixed(1)}%</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-medium-text">{formatCurrency(item.totalWonValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            ) : (
                <p className="text-medium-text text-center py-4">No effectiveness data to display based on current leads and deals.</p>
            )}
          </ReportSection>
        </div>
      )}
    </ReportSection>
  );
};

export default LeadSourceEffectivenessReport;