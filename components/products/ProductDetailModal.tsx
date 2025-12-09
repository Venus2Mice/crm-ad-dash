
import React from 'react';
import { Product, Deal, CustomFieldDefinition } from '../../types';
import { formatCurrency } from '../../services/reportUtils';
import { FunnelIcon, CubeIcon } from '../ui/Icon';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  linkedDeals: Deal[];
  defaultCurrency: string;
  customFieldDefinitions: CustomFieldDefinition[];
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  linkedDeals,
  defaultCurrency,
  customFieldDefinitions
}) => {
  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <CubeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(product.price, product.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="text-gray-900">{product.category || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
            <div className="bg-gray-50 p-4 rounded-lg h-full">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{product.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>

        {/* Custom Fields Display */}
        {customFieldDefinitions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customFieldDefinitions.map(def => (
                <div key={def.id}>
                  <span className="block text-xs font-medium text-gray-500 uppercase">{def.label}</span>
                  <span className="text-sm text-gray-900">{String(product.customFields?.[def.name] ?? 'N/A')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linked Deals Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
            <FunnelIcon className="h-4 w-4 mr-1" />
            Linked Deals ({linkedDeals.length})
          </h3>
          {linkedDeals.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Name</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {linkedDeals.map(deal => {
                    // Find the specific line item for quantity
                    const lineItem = deal.lineItems?.find(li => li.productId === product.id);
                    return (
                      <tr key={deal.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{deal.dealName}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{deal.stage}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{lineItem?.quantity || 1}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-sm text-gray-500">This product is not currently linked to any deals.</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
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

export default ProductDetailModal;
