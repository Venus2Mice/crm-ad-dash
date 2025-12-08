import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getStatusColor, DEAL_STAGE_OPTIONS } from '../constants';
import { Deal, Customer, Lead, DealStage, EntityActivityLog, User, EntityActivityType, Product, CustomFieldDefinition, Task } from '../types';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '../components/ui/Icon';
import DealFormModal from '../components/deals/DealFormModal';
import ConfirmationModal from '../components/ui/ConfirmationModal'; 
import Pagination, { ITEMS_PER_PAGE_OPTIONS } from '../components/ui/Pagination';
import { useSortableData } from '../hooks/useSortableData';
import SortIcon from '../components/ui/SortIcon';


interface DealsPageProps {
  deals: Deal[];
  customers: Customer[];
  leads: Lead[];
  products: Product[];
  onSaveDeal: (dealData: Omit<Deal, 'id' | 'createdAt' | 'attachments' | 'isDeleted' | 'deletedAt' | 'customFields'> & { 
      id?: string;
      newAttachments?: File[];
      removedAttachmentIds?: string[];
      lineItems?: Deal['lineItems'];
      customFields?: Record<string, any>; 
    }) => void;
  onDeleteDeal: (dealId: string) => void;
  activityLogs: EntityActivityLog[];
  currentUser: User | null; 
  addActivityLog: (entityId: string, entityType: 'Deal', activityType: EntityActivityType, description: string, details?: any) => void;
  defaultCurrency: string;
  customFieldDefinitions: CustomFieldDefinition[]; 
  onSaveTask: (taskData: any) => void;
  tasks: Task[];
}

const DealsPage: React.FC<DealsPageProps> = ({ 
    deals, customers, leads, products, onSaveDeal, onDeleteDeal, 
    activityLogs, currentUser, addActivityLog, defaultCurrency, customFieldDefinitions, onSaveTask, tasks
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const location = useLocation();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDeleteDetails, setItemToDeleteDetails] = useState<{ id: string; name: string; type: string } | null>(null);
  const [confirmActionHandler, setConfirmActionHandler] = useState<(() => void) | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<DealStage | ''>('');
  const [selectedOwner, setSelectedOwner] = useState<string>('');

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
  }, [location.search, selectedStage, selectedOwner]);

  const ownerOptions = useMemo(() => {
    const uniqueOwners = Array.from(new Set(deals.filter(d => !d.isDeleted).map(deal => deal.owner))).sort();
    return [{ value: '', label: 'All Owners' }, ...uniqueOwners.map(owner => ({ value: owner, label: owner }))];
  }, [deals]);

  const stageOptions = useMemo(() => {
    return [{ value: '', label: 'All Stages' }, ...DEAL_STAGE_OPTIONS.map(stage => ({ value: stage, label: stage }))];
  }, []);

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      if (deal.isDeleted) return false; 

      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || deal.dealName.toLowerCase().includes(term);
      const matchesStage = !selectedStage || deal.stage === selectedStage;
      const matchesOwner = !selectedOwner || deal.owner === selectedOwner;
      return matchesSearch && matchesStage && matchesOwner;
    });
  }, [deals, searchTerm, selectedStage, selectedOwner]);

  // Sorting
  const { items: sortedDeals, requestSort, sortConfig } = useSortableData<Deal>(filteredDeals);

  // Paginated deals
  const totalDeals = sortedDeals.length;
  const totalPages = Math.ceil(totalDeals / itemsPerPage);
  const paginatedDeals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedDeals.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedDeals, currentPage, itemsPerPage]);


  const handleAddNewDeal = () => {
    setEditingDeal(null);
    setIsModalOpen(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
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

  const handleDeleteDealWithConfirmation = (dealToDelete: Deal) => {
    if (!dealToDelete || typeof dealToDelete.id === 'undefined') {
        console.error('CRITICAL ERROR: dealToDelete is null, undefined, or ID is missing.');
        alert('Critical error: Deal data is missing or malformed for deletion.');
        return;
    }
    const dealNameForConfirmation = typeof dealToDelete.dealName === 'string' && dealToDelete.dealName.trim() !== '' ? dealToDelete.dealName : `Deal (ID: ${dealToDelete.id})`;

    openConfirmationModal(dealToDelete.id, dealNameForConfirmation, "Deal", () => {
        onDeleteDeal(dealToDelete.id);
    });
  };

  const handleSaveDealModal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'attachments' | 'isDeleted' | 'deletedAt' | 'customFields'> & { 
      id?: string;
      newAttachments?: File[];
      removedAttachmentIds?: string[];
      lineItems?: Deal['lineItems'];
      customFields?: Record<string, any>; 
    }) => {
    onSaveDeal(dealData);
    setIsModalOpen(false);
    setEditingDeal(null);
  };

  const getAssociatedName = (deal: Deal): string => {
    if (deal.customerId) {
      const customer = customers.find(c => c.id === deal.customerId && !c.isDeleted);
      return customer ? `${customer.name} (Customer)` : 'Unknown Customer';
    }
    if (deal.leadId) {
      const lead = leads.find(l => l.id === deal.leadId && !l.isDeleted);
      return lead ? `${lead.name} (Lead)` : 'Unknown Lead';
    }
    return 'N/A';
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStage('');
    setSelectedOwner('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const renderSortableHeader = (label: string, sortKey: keyof Deal, hiddenClasses: string = "") => (
    <th 
      scope="col" 
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group select-none ${hiddenClasses}`}
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
        <h2 className="text-2xl font-semibold text-dark-text">Deals Pipeline</h2>
        <button
          onClick={handleAddNewDeal}
          className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-150 w-full sm:w-auto"
          aria-label="Add New Deal"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Add New Deal</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
        <div className="flex-grow md:w-1/3">
          <label htmlFor="searchTermDeals" className="block text-sm font-medium text-gray-700 mb-1">Search Deals</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="searchTermDeals"
              placeholder="Search by deal name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>
        <div className="flex-grow md:w-1/4">
          <label htmlFor="stageFilter" className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
          <select
            id="stageFilter"
            value={selectedStage}
            onChange={(e) => { setSelectedStage(e.target.value as DealStage | ''); setCurrentPage(1); }}
            className="block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            {stageOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-grow md:w-1/4">
          <label htmlFor="ownerFilter" className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
          <select
            id="ownerFilter"
            value={selectedOwner}
            onChange={(e) => { setSelectedOwner(e.target.value); setCurrentPage(1); }}
            className="block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            {ownerOptions.map(option => (
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
            {paginatedDeals.length === 0 ? (
            <p className="text-medium-text text-center py-8 px-4">
                {deals.filter(d => !d.isDeleted).length === 0 ? "No active deals found. Add a new deal to build your pipeline!" : "No deals match your current filters."}
            </p>
            ) : (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    {renderSortableHeader("Deal Name", "dealName")}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Associated With</th>
                    {renderSortableHeader("Stage", "stage")}
                    {renderSortableHeader("Value", "value")}
                    {renderSortableHeader("Close Date", "closeDate", "hidden md:table-cell")}
                    {renderSortableHeader("Owner", "owner", "hidden md:table-cell")}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{deal.dealName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden sm:table-cell">{getAssociatedName(deal)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(deal.stage)}`}>
                        {deal.stage}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">
                        {deal.currency}{deal.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden md:table-cell">{deal.closeDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden md:table-cell">{deal.owner}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onClick={() => handleEditDeal(deal)} className="text-primary hover:text-primary-dark p-1" aria-label={`Edit ${deal.dealName}`}>
                        <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteDealWithConfirmation(deal)} className="text-red-600 hover:text-red-800 p-1" aria-label={`Delete ${deal.dealName}`}>
                        <TrashIcon className="h-5 w-5" />
                        </button>
                    </td>
                    </tr>
                ))}
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
            totalItems={totalDeals}
            entityName="deals"
          />
        )}
      </div>
      {isModalOpen && (
        <DealFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingDeal(null);
          }}
          onSave={handleSaveDealModal}
          initialData={editingDeal}
          customers={customers.filter(c => !c.isDeleted)} 
          leads={leads.filter(l => !l.isDeleted)}
          products={products}
          dealStages={DEAL_STAGE_OPTIONS}
          activityLogs={activityLogs}
          currentUser={currentUser}
          addActivityLog={addActivityLog}
          defaultCurrency={defaultCurrency}
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

export default DealsPage;