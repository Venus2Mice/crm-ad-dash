import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Customer, EntityActivityLog, User, EntityActivityType, CustomFieldDefinition } from '../types';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, EnvelopeIcon } from '../components/ui/Icon';
import CustomerFormModal from '../components/customers/CustomerFormModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Pagination, { ITEMS_PER_PAGE_OPTIONS } from '../components/ui/Pagination'; // Import Pagination


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

  // Paginated customers
  const totalCustomers = filteredCustomers.length;
  const totalPages = Math.ceil(totalCustomers / itemsPerPage);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);


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
        <div className="overflow-x-auto">
            {paginatedCustomers.length === 0 ? (
            <p className="text-medium-text text-center py-8 px-4">
                {customers.filter(c => !c.isDeleted).length === 0 ? "No active customers found. Add a new customer or convert leads!" : "No customers match your current filters."}
            </p>
            ) : (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Company</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Phone</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Total Revenue</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Account Manager</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Created At</th>
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
            )}
        </div>
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