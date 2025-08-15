import React, { useState, useMemo, useEffect } from 'react';
import { Lead, Customer, Deal, Task, Attachment, User, EntityActivityLog } from '../types';
import { ArrowUturnLeftIcon, ArchiveBoxXMarkIcon as PermanentDeleteIcon, TrashIcon as SoftDeleteIcon, MagnifyingGlassIcon, PaperClipIcon, DocumentIcon, PhotoIcon, FilePdfIcon, FileWordIcon, FileExcelIcon } from '../components/ui/Icon';
import ConfirmationModal from '../components/ui/ConfirmationModal'; 
import Pagination, { ITEMS_PER_PAGE_OPTIONS } from '../components/ui/Pagination'; // Import Pagination


interface ArchivePageProps {
  leads: Lead[];
  customers: Customer[];
  deals: Deal[];
  tasks: Task[];
  onRestoreLead: (id: string) => void;
  onPermanentDeleteLead: (id: string) => void;
  onRestoreCustomer: (id: string) => void;
  onPermanentDeleteCustomer: (id: string) => void;
  onRestoreDeal: (id: string) => void;
  onPermanentDeleteDeal: (id: string) => void;
  onRestoreTask: (id: string) => void;
  onPermanentDeleteTask: (id: string) => void;
  onRestoreAttachment: (attachmentId: string, entityId: string, entityType: 'Lead' | 'Customer' | 'Deal') => void;
  onPermanentDeleteAttachment: (attachmentId: string, entityId: string, entityType: 'Lead' | 'Customer' | 'Deal') => void;
  currentUser: User | null;
  activityLogs: EntityActivityLog[]; // Added to match usage
}

type ArchiveTab = 'leads' | 'customers' | 'deals' | 'tasks' | 'attachments';

type ItemToDeleteType =
  | { id: string; name: string; type: 'Lead' | 'Customer' | 'Deal' | 'Task'; }
  | { id: string; name: string; type: 'Attachment'; parentEntity: { id: string; type: 'Lead' | 'Customer' | 'Deal'; name: string; } };


const ArchivePage: React.FC<ArchivePageProps> = ({
  leads, customers, deals, tasks,
  onRestoreLead, onPermanentDeleteLead,
  onRestoreCustomer, onPermanentDeleteCustomer,
  onRestoreDeal, onPermanentDeleteDeal,
  onRestoreTask, onPermanentDeleteTask,
  onRestoreAttachment, onPermanentDeleteAttachment,
  currentUser,
  activityLogs // Destructure, though not actively used in component logic yet
}) => {
  const [activeTab, setActiveTab] = useState<ArchiveTab>('leads');
  const [searchTerm, setSearchTerm] = useState('');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDeleteDetails, setItemToDeleteDetails] = useState<ItemToDeleteType | null>(null);
  const [confirmActionHandler, setConfirmActionHandler] = useState<(() => void) | null>(null);

  // Pagination state for each tab - could be combined if tabs switch frequently, but separate for simplicity
  const [paginationState, setPaginationState] = useState({
    leads: { currentPage: 1, itemsPerPage: ITEMS_PER_PAGE_OPTIONS[0] },
    customers: { currentPage: 1, itemsPerPage: ITEMS_PER_PAGE_OPTIONS[0] },
    deals: { currentPage: 1, itemsPerPage: ITEMS_PER_PAGE_OPTIONS[0] },
    tasks: { currentPage: 1, itemsPerPage: ITEMS_PER_PAGE_OPTIONS[0] },
    attachments: { currentPage: 1, itemsPerPage: ITEMS_PER_PAGE_OPTIONS[0] },
  });

  useEffect(() => {
    // Reset current page for the active tab when search term changes
    setPaginationState(prev => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], currentPage: 1 }
    }));
  }, [searchTerm, activeTab]);


  const softDeletedLeads = useMemo(() => leads.filter(l => l.isDeleted && (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.email.toLowerCase().includes(searchTerm.toLowerCase()))), [leads, searchTerm]);
  const softDeletedCustomers = useMemo(() => customers.filter(c => c.isDeleted && (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()))), [customers, searchTerm]);
  const softDeletedDeals = useMemo(() => deals.filter(d => d.isDeleted && d.dealName.toLowerCase().includes(searchTerm.toLowerCase())), [deals, searchTerm]);
  const softDeletedTasks = useMemo(() => tasks.filter(t => t.isDeleted && t.title.toLowerCase().includes(searchTerm.toLowerCase())), [tasks, searchTerm]);
  
  const softDeletedAttachments = useMemo(() => {
    const allSoftDeleted: (Attachment & { parentEntity: { id: string, name: string, type: 'Lead' | 'Customer' | 'Deal' }})[] = [];
    [...leads, ...customers, ...deals].forEach(entity => {
        if (entity.attachments) { 
            entity.attachments.forEach(att => {
                if (att.isDeleted && att.filename.toLowerCase().includes(searchTerm.toLowerCase())) {
                     const entityTypeLabel = 'email' in entity ? 'Lead' : 'accountManager' in entity ? 'Customer' : 'Deal';
                     const entityName = (entity as any).name || (entity as any).dealName || 'Unknown Parent';
                     allSoftDeleted.push({ 
                        ...att, 
                        parentEntity: { 
                            id: entity.id, 
                            name: `${entityName}${entity.isDeleted ? ' (Parent Archived)' : ''}`, 
                            type: entityTypeLabel as 'Lead' | 'Customer' | 'Deal'
                        } 
                    });
                }
            });
        }
    });
    return allSoftDeleted;
  }, [leads, customers, deals, searchTerm]);

  const formatDeletedAt = (isoString?: string) => isoString ? new Date(isoString).toLocaleString() : 'N/A';
  
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <PhotoIcon className="w-5 h-5 text-purple-500" />;
    if (mimeType === 'application/pdf') return <FilePdfIcon className="w-5 h-5" />;
    if (mimeType.includes('wordprocessingml') || mimeType === 'application/msword') return <FileWordIcon className="w-5 h-5" />;
    if (mimeType.includes('spreadsheetml') || mimeType === 'application/vnd.ms-excel') return <FileExcelIcon className="w-5 h-5" />;
    return <DocumentIcon className="w-5 h-5 text-gray-500" />;
  };

  const openConfirmationModal = (
    details: ItemToDeleteType,
    action: () => void
  ) => {
    setItemToDeleteDetails(details);
    setConfirmActionHandler(() => action);
    setIsConfirmModalOpen(true);
  };

  const handlePageChange = (tab: ArchiveTab, page: number) => {
    setPaginationState(prev => ({ ...prev, [tab]: { ...prev[tab], currentPage: page } }));
  };

  const handleItemsPerPageChange = (tab: ArchiveTab, size: number) => {
    setPaginationState(prev => ({ ...prev, [tab]: { currentPage: 1, itemsPerPage: size } }));
  };

  const renderTabs = () => (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {(['leads', 'customers', 'deals', 'tasks', 'attachments'] as ArchiveTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => {
                setActiveTab(tab);
                // Optionally reset search term when switching tabs, or keep it global
                // setSearchTerm(''); // Uncomment to reset search on tab switch
                // No need to reset pagination here, it's tied to the tab state
            }}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize
              ${activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {tab} ({ getCountForTab(tab) })
          </button>
        ))}
      </nav>
    </div>
  );

  const getCountForTab = (tab: ArchiveTab) => {
    switch(tab) {
      case 'leads': return softDeletedLeads.length;
      case 'customers': return softDeletedCustomers.length;
      case 'deals': return softDeletedDeals.length;
      case 'tasks': return softDeletedTasks.length;
      case 'attachments': return softDeletedAttachments.length;
      default: return 0;
    }
  };

  const renderContent = () => {
    const currentPagination = paginationState[activeTab];
    const { currentPage, itemsPerPage } = currentPagination;
    let paginatedItems: any[] = [];
    let totalItems = 0;

    switch (activeTab) {
      case 'leads': 
        totalItems = softDeletedLeads.length;
        paginatedItems = softDeletedLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        return renderTable(paginatedItems, ['Name', 'Email', 'Company', 'Deleted At'], l => [l.name, l.email, l.company || 'N/A', formatDeletedAt(l.deletedAt)], onRestoreLead, onPermanentDeleteLead, "Lead", activeTab);
      case 'customers': 
        totalItems = softDeletedCustomers.length;
        paginatedItems = softDeletedCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        return renderTable(paginatedItems, ['Name', 'Email', 'Company', 'Deleted At'], c => [c.name, c.email, c.company || 'N/A', formatDeletedAt(c.deletedAt)], onRestoreCustomer, onPermanentDeleteCustomer, "Customer", activeTab);
      case 'deals': 
        totalItems = softDeletedDeals.length;
        paginatedItems = softDeletedDeals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        return renderTable(paginatedItems, ['Deal Name', 'Value', 'Stage', 'Deleted At'], d => [d.dealName, `${d.currency}${d.value}`, d.stage, formatDeletedAt(d.deletedAt)], onRestoreDeal, onPermanentDeleteDeal, "Deal", activeTab);
      case 'tasks': 
        totalItems = softDeletedTasks.length;
        paginatedItems = softDeletedTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        return renderTable(paginatedItems, ['Title', 'Status', 'Due Date', 'Deleted At'], t => [t.title, t.status, t.dueDate, formatDeletedAt(t.deletedAt)], onRestoreTask, onPermanentDeleteTask, "Task", activeTab);
      case 'attachments': 
        totalItems = softDeletedAttachments.length;
        paginatedItems = softDeletedAttachments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        return renderAttachmentTable(paginatedItems as (Attachment & { parentEntity: { id: string; name: string; type: "Lead" | "Customer" | "Deal"; }; })[]);
      default: return <p>Select a tab to view archived items.</p>;
    }
  };

  const renderTable = <T extends { id: string; name?: string; dealName?: string; title?: string; }>(
    items: T[],
    headers: string[],
    renderRow: (item: T) => (string | number | undefined)[],
    onRestoreHandler: (id: string) => void,
    onPermanentDeleteHandler: (id: string) => void,
    itemType: 'Lead' | 'Customer' | 'Deal' | 'Task',
    tabKey: ArchiveTab
  ) => {
    const currentPagination = paginationState[tabKey];
    const totalItemsCount = getCountForTab(tabKey); // Get total for this tab before slicing

    if (items.length === 0 && totalItemsCount === 0) {
         return <p className="text-medium-text text-center py-4">No archived {itemType.toLowerCase()}s.</p>;
    }
    if (items.length === 0 && totalItemsCount > 0) {
        return <p className="text-medium-text text-center py-4">No archived {itemType.toLowerCase()}s match your search.</p>;
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map(header => <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>)}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {renderRow(item).map((cell, idx) => <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{String(cell)}</td>)}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                    <button onClick={() => onRestoreHandler(item.id)} className="text-green-600 hover:text-green-800 p-1" title={`Restore ${itemType}`}>
                      <ArrowUturnLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                          const itemName = item.name || item.dealName || item.title || `ID: ${item.id}`;
                          openConfirmationModal(
                              { id: item.id, name: itemName, type: itemType },
                              () => onPermanentDeleteHandler(item.id)
                          );
                      }}
                      className="text-red-600 hover:text-red-800 p-1" title={`Permanently Delete ${itemType}`}>
                      <PermanentDeleteIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {Math.ceil(totalItemsCount / currentPagination.itemsPerPage) > 0 && (
          <Pagination
            currentPage={currentPagination.currentPage}
            totalPages={Math.ceil(totalItemsCount / currentPagination.itemsPerPage)}
            onPageChange={(page) => handlePageChange(tabKey, page)}
            itemsPerPage={currentPagination.itemsPerPage}
            onItemsPerPageChange={(size) => handleItemsPerPageChange(tabKey, size)}
            totalItems={totalItemsCount}
            entityName={`archived ${tabKey}`}
          />
        )}
      </>
    );
  };
  
  const renderAttachmentTable = (paginatedAtts: (Attachment & { parentEntity: { id: string; name: string; type: "Lead" | "Customer" | "Deal"; }; })[]) => {
    const tabKey = 'attachments';
    const currentPagination = paginationState[tabKey];
    const totalItemsCount = getCountForTab(tabKey);
    
    if (paginatedAtts.length === 0 && totalItemsCount === 0) {
        return <p className="text-medium-text text-center py-4">No soft-deleted attachments.</p>;
    }
     if (paginatedAtts.length === 0 && totalItemsCount > 0) {
        return <p className="text-medium-text text-center py-4">No soft-deleted attachments match your search.</p>;
    }

    return (
      <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Parent Entity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAtts.map(att => (
              <tr key={att.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text flex items-center">
                   {getFileIcon(att.mimeType)} <span className="ml-2 truncate" title={att.filename}>{att.filename}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden sm:table-cell">{att.parentEntity.type}: {att.parentEntity.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden md:table-cell">{(att.size / 1024).toFixed(2)} KB</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{formatDeletedAt(att.deletedAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                  <button onClick={() => onRestoreAttachment(att.id, att.parentEntity.id, att.parentEntity.type)} className="text-green-600 hover:text-green-800 p-1" title="Restore Attachment">
                    <ArrowUturnLeftIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => {
                        openConfirmationModal(
                            { id: att.id, name: att.filename, type: 'Attachment', parentEntity: att.parentEntity },
                            () => onPermanentDeleteAttachment(att.id, att.parentEntity.id, att.parentEntity.type)
                        );
                    }} 
                    className="text-red-600 hover:text-red-800 p-1" title="Permanently Delete Attachment">
                    <PermanentDeleteIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {Math.ceil(totalItemsCount / currentPagination.itemsPerPage) > 0 && (
          <Pagination
            currentPage={currentPagination.currentPage}
            totalPages={Math.ceil(totalItemsCount / currentPagination.itemsPerPage)}
            onPageChange={(page) => handlePageChange(tabKey, page)}
            itemsPerPage={currentPagination.itemsPerPage}
            onItemsPerPageChange={(size) => handleItemsPerPageChange(tabKey, size)}
            totalItems={totalItemsCount}
            entityName="archived attachments"
          />
        )}
      </>
    );
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-dark-text flex items-center">
          <SoftDeleteIcon className="h-7 w-7 mr-2 text-gray-600" /> Archive / Trash
        </h2>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center mb-4">
            <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                type="text"
                placeholder={`Search in archived ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
            </div>
            <button onClick={() => setSearchTerm('')} className="ml-3 px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md">Clear Search</button>
        </div>

        {renderTabs()}
        <div className="mt-4">
          {renderContent()}
        </div>
      </div>
      {isConfirmModalOpen && itemToDeleteDetails && confirmActionHandler && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setItemToDeleteDetails(null);
            setConfirmActionHandler(null);
          }}
          onConfirm={confirmActionHandler}
          title={`Confirm Permanent Delete`}
          message={
             <>
              Are you absolutely sure you want to permanently delete{' '}
              {itemToDeleteDetails.type.toLowerCase()} <strong>"{itemToDeleteDetails.name}"</strong>?
              <br />
              <strong className="text-red-700">This action CANNOT be undone.</strong>
            </>
          }
          confirmButtonText="Delete Permanently"
          confirmButtonClass="bg-red-700 hover:bg-red-800"
        />
      )}
    </div>
  );
};

export default ArchivePage;