
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Customer, EntityActivityLog, User, EntityActivityType, CustomFieldDefinition } from '../types';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, EnvelopeIcon } from '../components/ui/Icon';
import CustomerFormModal from '../components/customers/CustomerFormModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Pagination, { ITEMS_PER_PAGE_OPTIONS } from '../components/ui/Pagination';
import { useSortableData } from '../hooks/useSortableData';
import SortIcon from '../components/ui/SortIcon';


interface CustomersPageProps {
  customers: Customer[];
  onSaveCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'lastPurchaseDate' | 'totalRevenue' | 'attachments' | 'isDeleted' | 'deletedAt' | 'customFields'> & { 
    id?: string;
    newAttachments?: File[];
    removedAttachmentIds?: string[];
    customFields?: Record<string, any>; 
  }) => void;
  onDeleteCustomer: (customerId: string) => void;
  activityLogs: EntityActivityLog[];
  currentUser: User | null; 
  addActivityLog: (entityId: string, entityType: 'Customer', activityType: EntityActivityType, description: string, details?: any) => void;
  customFieldDefinitions: CustomFieldDefinition[]; 
}

const CustomersPage: React.FC<CustomersPageProps> = ({ customers, onSaveCustomer, onDeleteCustomer, activityLogs, currentUser, addActivityLog, customFieldDefinitions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const location = useLocation();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDeleteDetails, setItemToDeleteDetails] = useState<{ id: string; name: string; type: string } | null>(null);
  const [confirmActionHandler, setConfirmActionHandler] = useState<(() => void) | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountManager, setSelectedAccountManager] = useState<string>('');

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
  }, [location.search, selectedAccountManager]);

  const accountManagerOptions = useMemo(() => {
    const uniqueManagers = Array.from(new Set(customers.filter(c => !c.isDeleted).map(c => c.accountManager).filter(Boolean as any as (value: string | undefined) => value is string))).sort();
    return [{ value: '', label: 'All Account Managers' }, ...uniqueManagers.map(manager => ({ value: manager, label: manager }))];
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      if (customer.isDeleted) return false; 

      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        (customer.company && customer.company.toLowerCase().includes(term));
      
      const matchesAccountManager = !selectedAccountManager || customer.accountManager === selectedAccountManager;

      return matchesSearch && matchesAccountManager;
    });
  }, [customers, searchTerm, selectedAccountManager]);

  // Sorting
  const { items: sortedCustomers, requestSort, sortConfig } = useSortableData<Customer>(filteredCustomers);

  // Paginated customers
  const totalCustomers = sortedCustomers.length;
  const totalPages = Math.ceil(totalCustomers / itemsPerPage);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCustomers, currentPage, itemsPerPage]);


  const handleAddNewCustomer = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
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

  const handleDeleteCustomerWithConfirmation = (customerToDelete: Customer) => {
    if (!customerToDelete || typeof customerToDelete.id === 'undefined') {
      console.error('CRITICAL ERROR: customerToDelete is null, undefined, or ID is missing.');
      alert('Critical error: Customer data is missing or malformed for deletion.');
      return;
    }
    const customerNameForConfirmation = typeof customerToDelete.name === 'string' && customerToDelete.name.trim() !== '' ? customerToDelete.name : `Customer (ID: ${customerToDelete.id})`;

    openConfirmationModal(customerToDelete.id, customerNameForConfirmation, "Customer", () => {
        onDeleteCustomer(customerToDelete.id);
    });
  };

  const handleSaveCustomerModal = (customerData: Omit<Customer, 'id' | 'createdAt' | 'lastPurchaseDate' | 'totalRevenue' | 'attachments' | 'isDeleted' | 'deletedAt' | 'customFields'> & { 
      id?: string;
      newAttachments?: File[];
      removedAttachmentIds?: string[];
      customFields?: Record<string, any>;
    }) => {
    onSaveCustomer(customerData);
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleEmailCustomer = (customer: Customer) => {
    const subject = encodeURIComponent(`Regarding your account: ${customer.name}`);
    window.location.href = `mailto:${customer.email}?subject=${subject}`;
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedAccountManager('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const renderSortableHeader = (label: string, sortKey: keyof Customer, hiddenClasses: string = "") => (
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
        <h2 className="text-2xl font-semibold text-dark-text">Customer Directory</h2>
        <button
          onClick={handleAddNewCustomer}
          className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-150 w-full sm:w-auto"
          aria-label="Add New Customer"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Add New Customer</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
        <div className="flex-grow md:w-1/2">
          <label htmlFor="searchTermCustomers" className="block text-sm font-medium text-gray-700 mb-1">Search Customers</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="searchTermCustomers"
              placeholder="Search by name, email, company..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>
        <div className="flex-grow md:w-1/3">
          <label htmlFor="accountManagerFilter" className="block text-sm font-medium text-gray-700 mb-1">Account Manager</label>
          <select
            id="accountManagerFilter"
            value={selectedAccountManager}
            onChange={(e) => { setSelectedAccountManager(e.target.value); setCurrentPage(1); }}
            className="block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            {accountManagerOptions.map(option => (
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
        {paginatedCustomers.length === 0 ? (
            <p className="text-medium-text text-center py-8 px-4">
                {customers.filter(c => !c.isDeleted).length === 0 ? "No active customers found. Add a new customer or convert leads!" : "No customers match your current filters."}
            </p>
        ) : (
            <>
            {/* Mobile View: Cards */}
            <div className="sm:hidden space-y-4 p-4">
                {paginatedCustomers.map(customer => (
                    <div key={customer.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-semibold text-dark-text">{customer.name}</h3>
                                {customer.company && <p className="text-sm text-gray-500 font-medium">{customer.company}</p>}
                            </div>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => handleEmailCustomer(customer)} 
                                    className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 rounded-full"
                                    aria-label={`Email ${customer.name}`}
                                >
                                    <EnvelopeIcon className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => handleEditCustomer(customer)} 
                                    className="text-primary hover:text-primary-dark p-1.5 bg-blue-50 rounded-full"
                                    aria-label={`Edit ${customer.name}`}
                                >
                                    <PencilSquareIcon className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteCustomerWithConfirmation(customer)} 
                                    className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 rounded-full"
                                    aria-label={`Delete ${customer.name}`}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                                <span className="font-medium w-16 text-gray-500">Email:</span>
                                <span className="truncate">{customer.email}</span>
                            </div>
                            {customer.phone && (
                                <div className="flex items-center">
                                    <span className="font-medium w-16 text-gray-500">Phone:</span>
                                    <span>{customer.phone}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                            <div className="flex flex-col">
                                <span className="text-gray-400 mb-0.5">Total Revenue</span>
                                <span className="font-semibold text-green-600 text-sm">
                                    {customer.totalRevenue ? `$${customer.totalRevenue.toLocaleString()}` : 'N/A'}
                                </span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-gray-400 mb-0.5">Manager</span>
                                <span className="font-medium text-gray-700">{customer.accountManager || 'Unassigned'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        {renderSortableHeader("Name", "name")}
                        {renderSortableHeader("Email", "email")}
                        {renderSortableHeader("Company", "company", "hidden md:table-cell")}
                        {renderSortableHeader("Phone", "phone", "hidden lg:table-cell")}
                        {renderSortableHeader("Total Revenue", "totalRevenue", "hidden lg:table-cell")}
                        {renderSortableHeader("Account Manager", "accountManager", "hidden md:table-cell")}
                        {renderSortableHeader("Created At", "createdAt", "hidden xl:table-cell")}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{customer.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{customer.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden md:table-cell">{customer.company || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden lg:table-cell">{customer.phone || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden lg:table-cell">
                            {customer.totalRevenue ? `$${customer.totalRevenue.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden md:table-cell">{customer.accountManager || 'Unassigned'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden xl:table-cell">{customer.createdAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                            <button 
                                onClick={() => handleEmailCustomer(customer)} 
                                className="text-blue-600 hover:text-blue-800 p-1" 
                                aria-label={`Email ${customer.name}`}
                                title="Opens your default email client."
                            >
                            <EnvelopeIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleEditCustomer(customer)} className="text-primary hover:text-primary-dark p-1" aria-label={`Edit ${customer.name}`}>
                            <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleDeleteCustomerWithConfirmation(customer)} className="text-red-600 hover:text-red-800 p-1" aria-label={`Delete ${customer.name}`}>
                            <TrashIcon className="h-5 w-5" />
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            </>
        )}
        
        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={totalCustomers}
            entityName="customers"
          />
        )}
      </div>
      {isModalOpen && (
        <CustomerFormModal
            isOpen={isModalOpen}
            onClose={() => {
                setIsModalOpen(false);
                setEditingCustomer(null);
            }}
            onSave={handleSaveCustomerModal}
            initialData={editingCustomer}
            activityLogs={activityLogs}
            currentUser={currentUser}
            addActivityLog={addActivityLog} 
            customFieldDefinitions={customFieldDefinitions} 
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

export default CustomersPage;
