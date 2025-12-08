import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getStatusColor, LEAD_STATUS_OPTIONS } from '../constants';
import { Lead, LeadStatus, EntityActivityLog, User, EntityActivityType, CustomFieldDefinition, Task } from '../types';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, EnvelopeIcon } from '../components/ui/Icon';
import LeadFormModal from '../components/leads/LeadFormModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { canPerformAction } from '../utils/permissions'; 
import Pagination, { ITEMS_PER_PAGE_OPTIONS } from '../components/ui/Pagination';
import { useSortableData } from '../hooks/useSortableData';
import SortIcon from '../components/ui/SortIcon';

interface LeadsPageProps {
  leads: Lead[];
  onSaveLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastContacted' | 'attachments' | 'isDeleted' | 'deletedAt'> & { 
      id?: string;
      newAttachments?: File[];
      removedAttachmentIds?: string[];
      customFields?: Record<string, any>;
    }) => void;
  onDeleteLead: (leadId: string) => void;
  activityLogs: EntityActivityLog[];
  currentUser: User | null; 
  addActivityLog: (entityId: string, entityType: 'Lead', activityType: EntityActivityType, description: string, details?: any) => void;
  customFieldDefinitions: CustomFieldDefinition[];
  onSaveTask: (taskData: any) => void;
  tasks: Task[];
}

const LeadsPage: React.FC<LeadsPageProps> = ({ leads, onSaveLead, onDeleteLead, activityLogs, currentUser, addActivityLog, customFieldDefinitions, onSaveTask, tasks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const location = useLocation();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDeleteDetails, setItemToDeleteDetails] = useState<{ id: string; name: string; type: string } | null>(null);
  const [confirmActionHandler, setConfirmActionHandler] = useState<(() => void) | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | ''>('');
  const [selectedAssignedTo, setSelectedAssignedTo] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    setCurrentPage(1); // Reset page on filter change
  }, [location.search, selectedStatus, selectedAssignedTo]);

  const assigneeOptions = useMemo(() => {
    const uniqueAssignees = Array.from(new Set(leads.filter(l => !l.isDeleted).map(lead => lead.assignedTo).filter(Boolean as any as (value: string | undefined) => value is string))).sort();
    return [{ value: '', label: 'All Assignees' }, ...uniqueAssignees.map(assignee => ({ value: assignee, label: assignee }))];
  }, [leads]);

  const statusOptions = useMemo(() => {
    return [{ value: '', label: 'All Statuses' }, ...LEAD_STATUS_OPTIONS.map(status => ({ value: status, label: status }))];
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (lead.isDeleted) return false;

      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        lead.name.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        (lead.company && lead.company.toLowerCase().includes(term));
      
      const matchesStatus = !selectedStatus || lead.status === selectedStatus;
      const matchesAssignedTo = !selectedAssignedTo || lead.assignedTo === selectedAssignedTo;

      return matchesSearch && matchesStatus && matchesAssignedTo;
    });
  }, [leads, searchTerm, selectedStatus, selectedAssignedTo]);

  // Sorting
  const { items: sortedLeads, requestSort, sortConfig } = useSortableData<Lead>(filteredLeads);

  // Paginated leads
  const totalLeads = sortedLeads.length;
  const totalPages = Math.ceil(totalLeads / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedLeads, currentPage, itemsPerPage]);


  const handleAddNewLead = () => {
    if (!canPerformAction(currentUser, 'CREATE', 'Lead')) { alert("Permission Denied."); return; }
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    if (!canPerformAction(currentUser, 'UPDATE', 'Lead', lead)) { alert("Permission Denied."); return; }
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const openConfirmationModal = (
    itemId: string,
    itemName: string,
    itemType: string,
    action: () => void
  ) => {
    setItemToDeleteDetails({ id: itemId, name: itemName, type: itemType });
    setConfirmActionHandler(() => action);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteLeadWithConfirmation = (leadToDelete: Lead) => {
    if (!canPerformAction(currentUser, 'DELETE', 'Lead', leadToDelete)) { alert("Permission Denied."); return; }
    
    if (!leadToDelete || typeof leadToDelete.id === 'undefined') {
        console.error('CRITICAL ERROR: leadToDelete is null, undefined, or ID is missing.');
        alert('Critical error: Lead data is missing or malformed for deletion.');
        return;
    }
    const leadNameForConfirmation = typeof leadToDelete.name === 'string' && leadToDelete.name.trim() !== '' ? leadToDelete.name : `Lead (ID: ${leadToDelete.id})`;

    openConfirmationModal(leadToDelete.id, leadNameForConfirmation, "Lead", () => {
        onDeleteLead(leadToDelete.id);
    });
  };

  const handleSaveLeadModal = (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastContacted' | 'attachments' | 'isDeleted' | 'deletedAt' | 'customFields'> & { 
      id?: string;
      newAttachments?: File[];
      removedAttachmentIds?: string[];
      customFields?: Record<string, any>;
    }) => {
    onSaveLead(leadData);
    setIsModalOpen(false);
    setEditingLead(null);
  };
  
  const handleEmailLead = (lead: Lead) => {
    const subject = encodeURIComponent(`Following up on your interest: ${lead.name}`);
    window.location.href = `mailto:${lead.email}?subject=${subject}`;
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedAssignedTo('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const renderSortableHeader = (label: string, sortKey: keyof Lead) => (
    <th 
      scope="col" 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group select-none"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center">
        {label}
        <SortIcon columnKey={sortKey as string} sortConfig={sortConfig} />
      </div>
    </th>
  );


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-dark-text">Leads Management</h2>
        <button
          onClick={handleAddNewLead}
          className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-150 w-full sm:w-auto"
          aria-label="Add New Lead"
          disabled={!canPerformAction(currentUser, 'CREATE', 'Lead')}
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Add New Lead</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
        <div className="flex-grow md:w-1/3">
          <label htmlFor="searchTermLeads" className="block text-sm font-medium text-gray-700 mb-1">Search Leads</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="searchTermLeads"
              placeholder="Search by name, email, company..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>
        <div className="flex-grow md:w-1/4">
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="statusFilter"
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value as LeadStatus | ''); setCurrentPage(1); }}
            className="block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-grow md:w-1/4">
          <label htmlFor="assigneeFilter" className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <select
            id="assigneeFilter"
            value={selectedAssignedTo}
            onChange={(e) => { setSelectedAssignedTo(e.target.value); setCurrentPage(1); }}
            className="block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            {assigneeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={resetFilters}
          className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-150 h-10"
        >
          Reset Filters
        </button>
      </div>

      <div className="bg-white p-0 sm:p-6 rounded-lg shadow">
        <div className="overflow-x-auto">
            {paginatedLeads.length === 0 ? (
            <p className="text-medium-text text-center py-8 px-4">
                {leads.filter(l => !l.isDeleted).length === 0 ? "No active leads found. Add a new lead to get started!" : "No leads match your current filters."}
            </p>
            ) : (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    {renderSortableHeader('Name', 'name')}
                    {renderSortableHeader('Status', 'status')}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:bg-gray-100 group select-none" onClick={() => requestSort('email')}>
                      <div className="flex items-center">Email <SortIcon columnKey="email" sortConfig={sortConfig} /></div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell cursor-pointer hover:bg-gray-100 group select-none" onClick={() => requestSort('company')}>
                      <div className="flex items-center">Company <SortIcon columnKey="company" sortConfig={sortConfig} /></div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:bg-gray-100 group select-none" onClick={() => requestSort('assignedTo')}>
                      <div className="flex items-center">Assigned To <SortIcon columnKey="assignedTo" sortConfig={sortConfig} /></div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell cursor-pointer hover:bg-gray-100 group select-none" onClick={() => requestSort('lastContacted')}>
                      <div className="flex items-center">Last Contacted <SortIcon columnKey="lastContacted" sortConfig={sortConfig} /></div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLeads.map((lead) => {
                  const canUpdateCurrent = canPerformAction(currentUser, 'UPDATE', 'Lead', lead);
                  const canDeleteCurrent = canPerformAction(currentUser, 'DELETE', 'Lead', lead);
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{lead.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                            {lead.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden sm:table-cell">{lead.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden md:table-cell">{lead.company || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden lg:table-cell">{lead.assignedTo || 'Unassigned'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden xl:table-cell">{lead.lastContacted}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                            <button 
                                onClick={() => handleEmailLead(lead)} 
                                className="text-blue-600 hover:text-blue-800 p-1" 
                                aria-label={`Email ${lead.name}`}
                                title="Opens your default email client."
                            >
                            <EnvelopeIcon className="h-5 w-5" />
                            </button>
                            <button 
                                onClick={() => handleEditLead(lead)} 
                                className="text-primary hover:text-primary-dark p-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                                aria-label={`Edit ${lead.name}`}
                                disabled={!canUpdateCurrent}
                            >
                            <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button 
                                onClick={() => handleDeleteLeadWithConfirmation(lead)} 
                                className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                                aria-label={`Delete ${lead.name}`}
                                disabled={!canDeleteCurrent}
                            >
                            <TrashIcon className="h-5 w-5" />
                            </button>
                        </td>
                    </tr>
                )})}
                </tbody>
            </table>
            )}
        </div>
        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={totalLeads}
            entityName="leads"
          />
        )}
      </div>
      {isModalOpen && (
        <LeadFormModal
            isOpen={isModalOpen}
            onClose={() => {
                setIsModalOpen(false);
                setEditingLead(null);
            }}
            onSave={handleSaveLeadModal}
            initialData={editingLead}
            leadStatuses={LEAD_STATUS_OPTIONS}
            activityLogs={activityLogs}
            currentUser={currentUser}
            addActivityLog={addActivityLog}
            customFieldDefinitions={customFieldDefinitions}
            onSaveTask={onSaveTask}
            tasks={tasks}
        />
      )}
      {isConfirmModalOpen && itemToDeleteDetails && confirmActionHandler && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setItemToDeleteDetails(null);
            setConfirmActionHandler(null);
          }}
          onConfirm={confirmActionHandler}
          title={`Confirm Delete ${itemToDeleteDetails.type}`}
          message={
             <>
              Are you sure you want to move {itemToDeleteDetails.type.toLowerCase()}{' '}
              <strong>"{itemToDeleteDetails.name}"</strong> to the trash?
              <br />
              This action can be undone from the Archive page.
            </>
          }
          confirmButtonText="Move to Trash"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}
    </div>
  );
};

export default LeadsPage;