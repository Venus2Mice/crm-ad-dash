
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Product, User, CustomFieldDefinition } from '../types';
import { PlusCircleIcon, PencilSquareIcon, CheckCircleIcon, XCircleIcon as ToggleOffIcon } from '../components/ui/Icon'; // Removed TrashIcon as products are toggled
import ProductFormModal from '../components/products/ProductFormModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Pagination, { ITEMS_PER_PAGE_OPTIONS } from '../components/ui/Pagination';
import { canPerformAction } from '../utils/permissions';
import { formatCurrency } from '../services/reportUtils';
import { MagnifyingGlassIcon } from '../components/ui/Icon'; // Ensure MagnifyingGlassIcon is imported

interface ProductsPageProps {
  products: Product[];
  onSaveProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'customFields'> & { 
    id?: string;
    customFields?: Record<string, any>; 
  }) => void;
  onToggleActiveState: (productId: string) => void;
  onBulkToggleProductActiveState: (productIds: string[], activate: boolean) => void; // New prop
  currentUser: User | null;
  defaultCurrency: string;
  customFieldDefinitions: CustomFieldDefinition[]; 
}

const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  onSaveProduct,
  onToggleActiveState,
  onBulkToggleProductActiveState, // Destructure new prop
  currentUser,
  defaultCurrency,
  customFieldDefinitions
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const location = useLocation();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToToggleDetails, setItemToToggleDetails] = useState<{ id: string; name: string; currentStatus: boolean } | null>(null);
  const [confirmActionHandler, setConfirmActionHandler] = useState<(() => void) | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | ''>('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);

  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [isBulkConfirmModalOpen, setIsBulkConfirmModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'activate' | 'deactivate' | null>(null);


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    setCurrentPage(1);
    setSelectedProductIds(new Set()); // Clear selection when filters change
  }, [location.search, selectedCategory, selectedStatus]);

  const categoryOptions = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();
    return [{ value: '', label: 'All Categories' }, ...uniqueCategories.map(cat => ({ value: cat, label: cat! }))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        product.name.toLowerCase().includes(term) ||
        (product.sku && product.sku.toLowerCase().includes(term)) ||
        (product.description && product.description.toLowerCase().includes(term));

      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesStatus = !selectedStatus || (selectedStatus === 'active' && product.isActive) || (selectedStatus === 'inactive' && !product.isActive);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const canCreateProducts = useMemo(() => canPerformAction(currentUser, 'CREATE', 'Product'), [currentUser]);
  const canUpdateProductsGlobal = useMemo(() => canPerformAction(currentUser, 'UPDATE', 'Product'), [currentUser]);
 
  const handleAddNewProduct = () => {
    if (!canCreateProducts) {
        alert("Permission Denied: You cannot create new products.");
        return;
    }
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
     if (!canPerformAction(currentUser, 'UPDATE', 'Product', product)) {
        alert("Permission Denied: You cannot edit this product.");
        return;
    }
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openConfirmationModal = (
    itemId: string,
    itemName: string,
    currentStatus: boolean,
    action: () => void
  ) => {
    setItemToToggleDetails({ id: itemId, name: itemName, currentStatus });
    setConfirmActionHandler(() => action);
    setIsConfirmModalOpen(true);
  };

  const handleToggleActiveStateWithConfirmation = (productToToggle: Product) => {
     if (!canPerformAction(currentUser, 'UPDATE', 'Product', productToToggle)) {
        alert("Permission Denied: You cannot change this product's status.");
        return;
    }
    openConfirmationModal(
      productToToggle.id,
      productToToggle.name,
      productToToggle.isActive,
      () => onToggleActiveState(productToToggle.id)
    );
  };
  
  const handleSaveProductModal = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'customFields'> & { 
    id?: string;
    customFields?: Record<string, any>; 
  }) => {
    onSaveProduct(productData);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setCurrentPage(1);
    setSelectedProductIds(new Set());
  };
  
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
    // It's usually good practice to clear selection when items per page change
    // as the displayed items will be different.
    setSelectedProductIds(new Set());
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProductIds(prev => {
        const newSet = new Set(prev);
        if (checked) {
            newSet.add(productId);
        } else {
            newSet.delete(productId);
        }
        return newSet;
    });
  };

  const handleSelectAllDisplayedProducts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setSelectedProductIds(prev => {
        const newSet = new Set(prev); // Start with current global selection
        if (isChecked) {
            paginatedProducts.forEach(p => newSet.add(p.id));
        } else {
            paginatedProducts.forEach(p => newSet.delete(p.id));
        }
        return newSet;
    });
  };

  const isAllDisplayedSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProductIds.has(p.id));
  const isSomeDisplayedSelected = paginatedProducts.some(p => selectedProductIds.has(p.id));
  
  const handleBulkActivateClick = () => {
    if (!canUpdateProductsGlobal || selectedProductIds.size === 0) return;
    setBulkActionType('activate');
    setIsBulkConfirmModalOpen(true);
  };

  const handleBulkDeactivateClick = () => {
    if (!canUpdateProductsGlobal || selectedProductIds.size === 0) return;
    setBulkActionType('deactivate');
    setIsBulkConfirmModalOpen(true);
  };

  const confirmBulkAction = () => {
    if (bulkActionType && selectedProductIds.size > 0) {
        onBulkToggleProductActiveState(Array.from(selectedProductIds), bulkActionType === 'activate');
        setSelectedProductIds(new Set()); // Clear selection after action
    }
    setIsBulkConfirmModalOpen(false);
    setBulkActionType(null);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-dark-text">Product Catalog</h2>
        <button
          onClick={handleAddNewProduct}
          disabled={!canCreateProducts}
          className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-150 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add New Product"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 items-end">
        <div className="lg:col-span-1">
          <label htmlFor="searchTermProducts" className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="searchTermProducts"
              placeholder="Name, SKU, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="statusFilterProducts" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="statusFilterProducts"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as '' | 'active' | 'inactive')}
            className="block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          onClick={resetFilters}
          className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-150 h-10"
        >
          Reset Filters
        </button>
      </div>

      {selectedProductIds.size > 0 && canUpdateProductsGlobal && (
        <div className="bg-blue-50 p-3 rounded-md shadow-sm my-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-blue-700 font-medium">
                {selectedProductIds.size} product(s) selected.
            </p>
            <div className="flex space-x-2">
                <button
                    onClick={handleBulkActivateClick}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm disabled:opacity-50"
                    disabled={selectedProductIds.size === 0}
                >
                    Activate Selected
                </button>
                <button
                    onClick={handleBulkDeactivateClick}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm disabled:opacity-50"
                    disabled={selectedProductIds.size === 0}
                >
                    Deactivate Selected
                </button>
            </div>
        </div>
      )}


      <div className="bg-white p-0 sm:p-6 rounded-lg shadow">
        <div className="overflow-x-auto">
            {paginatedProducts.length === 0 ? (
            <p className="text-medium-text text-center py-8 px-4">
                {products.length === 0 ? "No products found. Add a new product to get started!" : "No products match your current filters."}
            </p>
            ) : (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-4 py-3 text-left">
                      <input 
                        type="checkbox"
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={isAllDisplayedSelected}
                        ref={input => { // For indeterminate state
                            if (input) {
                                input.indeterminate = isSomeDisplayedSelected && !isAllDisplayedSelected;
                            }
                        }}
                        onChange={handleSelectAllDisplayedProducts}
                        aria-label="Select all displayed products"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">SKU</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts.map((product) => {
                    const canEditCurrent = canPerformAction(currentUser, 'UPDATE', 'Product', product);
                    return (
                    <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${selectedProductIds.has(product.id) ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-4">
                           <input 
                             type="checkbox"
                             className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                             checked={selectedProductIds.has(product.id)}
                             onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                             aria-label={`Select product ${product.name}`}
                           />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden md:table-cell">{product.category || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{formatCurrency(product.price, product.currency)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden sm:table-cell">{product.sku || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                            <button 
                                onClick={() => handleEditProduct(product)} 
                                disabled={!canEditCurrent}
                                className="text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed p-1" 
                                aria-label={`Edit ${product.name}`}
                            >
                                <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button 
                                onClick={() => handleToggleActiveStateWithConfirmation(product)}
                                disabled={!canUpdateProductsGlobal}
                                className={`p-1 disabled:opacity-50 disabled:cursor-not-allowed ${product.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                                title={product.isActive ? 'Deactivate Product' : 'Activate Product'}
                                aria-label={product.isActive ? `Deactivate ${product.name}` : `Activate ${product.name}`}
                            >
                                {product.isActive ? <ToggleOffIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
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
            totalItems={totalProducts}
            entityName="products"
          />
        )}
      </div>
      {isModalOpen && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProductModal}
          initialData={editingProduct}
          currentUser={currentUser}
          defaultCurrency={defaultCurrency}
          customFieldDefinitions={customFieldDefinitions} 
        />
      )}
      {isConfirmModalOpen && itemToToggleDetails && confirmActionHandler && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setItemToToggleDetails(null);
            setConfirmActionHandler(null);
          }}
          onConfirm={confirmActionHandler}
          title={`Confirm ${itemToToggleDetails.currentStatus ? 'Deactivation' : 'Activation'}`}
          message={
            <>
              Are you sure you want to {itemToToggleDetails.currentStatus ? 'deactivate' : 'activate'} the product{' '}
              <strong>"{itemToToggleDetails.name}"</strong>?
              <br />
              {itemToToggleDetails.currentStatus 
                ? "Deactivated products cannot be added to new deals." 
                : "Activated products will be available for selection."}
            </>
          }
          confirmButtonText={itemToToggleDetails.currentStatus ? 'Deactivate' : 'Activate'}
          confirmButtonClass={itemToToggleDetails.currentStatus ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
        />
      )}
       {isBulkConfirmModalOpen && bulkActionType && (
        <ConfirmationModal
            isOpen={isBulkConfirmModalOpen}
            onClose={() => {
                setIsBulkConfirmModalOpen(false);
                setBulkActionType(null);
            }}
            onConfirm={confirmBulkAction}
            title={`Confirm Bulk ${bulkActionType === 'activate' ? 'Activation' : 'Deactivation'}`}
            message={
                <>
                    Are you sure you want to {bulkActionType} <strong>{selectedProductIds.size} selected product(s)</strong>?
                    {bulkActionType === 'deactivate' && (
                        <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded-md">
                            Note: Products currently part of active deals will not be deactivated.
                        </div>
                    )}
                </>
            }
            confirmButtonText={bulkActionType === 'activate' ? 'Activate Selected' : 'Deactivate Selected'}
            confirmButtonClass={bulkActionType === 'activate' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
        />
      )}
    </div>
  );
};

export default ProductsPage;
