
import React, { useMemo } from 'react';
import { Deal, Customer, Lead, EntityActivityLog, CustomFieldDefinition, DealLineItem } from '../../types';
import { ActivityLogTypeIcon, FunnelIcon, XMarkIcon } from '../ui/Icon';
import { formatCurrency } from '../../services/reportUtils';
import { getStatusColor } from '../../constants';

interface DealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
  customers: Customer[];
  leads: Lead[];
  activityLogs: EntityActivityLog[];
  customFieldDefinitions: CustomFieldDefinition[];
  defaultCurrency: string;
}

const DealDetailModal: React.FC<DealDetailModalProps> = ({
  isOpen,
  onClose,
  deal,
  customers,
  leads,
  activityLogs,
  customFieldDefinitions,
  defaultCurrency
}) => {
  if (!isOpen || !deal) return null;

  const associatedEntityName = useMemo(() => {
    if (deal.customerId) {
      const customer = customers.find(c => c.id === deal.customerId);
      return customer ? `${customer.name} (Customer)` : 'Unknown Customer';
    }
    if (deal.leadId) {
      const lead = leads.find(l => l.id === deal.leadId);
      return lead ? `${lead.name} (Lead)` : 'Unknown Lead';
    }
    return 'None';
  }, [deal, customers, leads]);

  const dealActivities = useMemo(() => {
    return activityLogs
      .filter(log => log.entityId === deal.id && log.entityType === 'Deal')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [deal, activityLogs]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <FunnelIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{deal.dealName}</h2>
              <div className="flex items-center mt-1 space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deal.stage)}`}>
                  {deal.stage}
                </span>
                <span className="text-sm text-gray-500">• {associatedEntityName}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none p-1 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase">Total Value</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {formatCurrency(deal.value, deal.currency || defaultCurrency)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase">Expected Close Date</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase">Owner</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{deal.owner}</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Description & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 bg-white border border-gray-200 p-3 rounded-md min-h-[80px]">
                {deal.description || <span className="text-gray-400 italic">No description provided.</span>}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 bg-white border border-gray-200 p-3 rounded-md min-h-[80px]">
                {deal.notes || <span className="text-gray-400 italic">No notes added.</span>}
              </p>
            </div>
          </div>

          {/* Line Items */}
          {deal.lineItems && deal.lineItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Products/Services ({deal.lineItems.length})</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {deal.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice, item.currency)}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.totalPrice, item.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Custom Fields */}
          {customFieldDefinitions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Additional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {customFieldDefinitions.map(def => (
                  <div key={def.id}>
                    <span className="block text-xs font-medium text-gray-500 uppercase mb-1">{def.label}</span>
                    <span className="text-sm text-gray-900">{String(deal.customFields?.[def.name] ?? 'N/A')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Logs Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h3>
            {dealActivities.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {dealActivities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== dealActivities.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div className="bg-white rounded-full border border-gray-300 flex items-center justify-center h-8 w-8 ring-8 ring-white">
                            <ActivityLogTypeIcon activityType={activity.activityType} className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-800">
                                <span className="font-medium text-gray-900">{activity.userName}</span>{' '}
                                {activity.description}
                              </p>
                              {activity.details && (
                                <div className="mt-1 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 inline-block">
                                   {activity.details.customFieldLabel && <div>Field: {activity.details.customFieldLabel}</div>}
                                   {!activity.details.customFieldLabel && activity.details.field && <div>Field: {activity.details.field}</div>}
                                   
                                   {(activity.details.oldValue !== undefined || activity.details.newValue !== undefined) && (
                                      <div className="flex items-center gap-1 mt-0.5">
                                          <span className="line-through opacity-70">{String(activity.details.oldValue ?? 'Empty')}</span>
                                          <span>→</span>
                                          <span className="font-medium text-blue-600">{String(activity.details.newValue ?? 'Empty')}</span>
                                      </div>
                                   )}
                                   {activity.details.taskTitle && <div>Task: {activity.details.taskTitle}</div>}
                                   {activity.details.fileName && <div>File: {activity.details.fileName} {activity.details.fileSize ? `(${formatFileSize(activity.details.fileSize)})` : ''}</div>}
                                </div>
                              )}
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-sm text-gray-500">No activity recorded for this deal yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealDetailModal;
