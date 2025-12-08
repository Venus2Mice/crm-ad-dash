
import React, { useState, useEffect } from 'react';
import { Product, User, CustomFieldDefinition } from '../../types';
import CustomFieldRenderer from '../shared/CustomFieldRenderer';
import { validateCustomField } from '../../utils/validationUtils';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'customFields'> & { 
    id?: string;
    customFields?: Record<string, any>; 
  }) => void;
  initialData: Product | null;
  currentUser: User | null; // For context or future validation
  defaultCurrency: string;
  customFieldDefinitions: CustomFieldDefinition[]; 
}

interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  price?: string;
  currency?: string;
  sku?: string;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currentUser,
  defaultCurrency,
  customFieldDefinitions
}) => {
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'customFields'> & { customFields?: Record<string, any> }>({
    name: '',
    description: '',
    category: '',
    price: 0,
    currency: defaultCurrency,
    sku: '',
    isActive: true,
    customFields: {},
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    if (initialData) {
      const { id, createdAt, updatedAt, customFields, ...editableData } = initialData;
      setFormData({
        ...editableData,
        currency: editableData.currency || defaultCurrency, // Ensure currency if not set
        customFields: customFields || {},
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        price: 0,
        currency: defaultCurrency,
        sku: '',
        isActive: true,
        customFields: {},
      });
    }
    setErrors({}); // Reset errors when modal opens or initialData changes
    setCustomFieldErrors({});
  }, [initialData, isOpen, defaultCurrency]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Product Name is required.';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Product Name cannot exceed 255 characters.';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price must be a non-negative number.';
    }

    if (!formData.currency.trim()) {
        newErrors.currency = 'Currency is required.';
    } else if (!/^[A-Z]{3}$/.test(formData.currency)) {
      newErrors.currency = 'Currency must be 3 uppercase letters (e.g., USD).';
    }
    
    if (formData.description && formData.description.length > 1000) {
        newErrors.description = 'Description cannot exceed 1000 characters.';
    }
    
    if (formData.category && formData.category.length > 100) {
        newErrors.category = 'Category cannot exceed 100 characters.';
    }

    if (formData.sku) {
        if (formData.sku.length > 50) {
            newErrors.sku = 'SKU cannot exceed 50 characters.';
        } else if (!/^[a-zA-Z0-9_-]*$/.test(formData.sku)) {
            newErrors.sku = 'SKU can only contain letters, numbers, hyphens (-), and underscores (_).';
        }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) : value, // Ensure price is stored as number
        }));
    }
    // Clear error for the field being changed
    if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
        ...prev,
        customFields: {
            ...(prev.customFields || {}),
            [fieldName]: value,
        }
    }));
    if (customFieldErrors[fieldName]) {
        setCustomFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isStandardFormValid = validateForm();

    const newCustomFieldErrors: Record<string, string> = {};
    customFieldDefinitions.forEach(def => {
        const value = formData.customFields?.[def.name];
        const error = validateCustomField(value, def);
        if (error) {
            newCustomFieldErrors[def.name] = error;
        }
    });

    if (Object.keys(newCustomFieldErrors).length > 0) {
        setCustomFieldErrors(newCustomFieldErrors);
    }

    if (isStandardFormValid && Object.keys(newCustomFieldErrors).length === 0) {
      onSave(initialData ? { ...formData, id: initialData.id } : formData);
    }
  };

  if (!isOpen) return null;

  const commonInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const errorTextStyle = "text-red-500 text-xs mt-1";
  const commonLabelStyle = "block text-sm font-medium text-gray-700";

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
        aria-modal="true" 
        role="dialog"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-dark-text mb-6">
          {initialData ? `Edit Product: ${formData.name || initialData.name}` : 'Add New Product'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className={commonLabelStyle}>Product Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} maxLength={255} required className={commonInputStyle} aria-describedby="name-error"/>
            {errors.name && <p id="name-error" className={errorTextStyle}>{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="description" className={commonLabelStyle}>Description</label>
            <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={3} maxLength={1000} className={commonInputStyle} aria-describedby="description-error"></textarea>
            {errors.description && <p id="description-error" className={errorTextStyle}>{errors.description}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className={commonLabelStyle}>Category</label>
              <input type="text" name="category" id="category" value={formData.category || ''} onChange={handleChange} maxLength={100} className={commonInputStyle} placeholder="e.g., Subscription, Hardware" aria-describedby="category-error" />
              {errors.category && <p id="category-error" className={errorTextStyle}>{errors.category}</p>}
            </div>
            <div>
              <label htmlFor="sku" className={commonLabelStyle}>SKU (Stock Keeping Unit)</label>
              <input type="text" name="sku" id="sku" value={formData.sku || ''} onChange={handleChange} maxLength={50} className={commonInputStyle} placeholder="e.g., PROD-001" aria-describedby="sku-error"/>
              {errors.sku && <p id="sku-error" className={errorTextStyle}>{errors.sku}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className={commonLabelStyle}>Price <span className="text-red-500">*</span></label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className={commonInputStyle} aria-describedby="price-error" />
              {errors.price && <p id="price-error" className={errorTextStyle}>{errors.price}</p>}
            </div>
            <div>
              <label htmlFor="currency" className={commonLabelStyle}>Currency <span className="text-red-500">*</span></label>
              <input type="text" name="currency" id="currency" value={formData.currency} onChange={handleChange} required maxLength={3} pattern="[A-Z]{3}" title="Enter 3 uppercase letters (e.g., USD)" className={commonInputStyle} placeholder="e.g., USD" aria-describedby="currency-error"/>
              {errors.currency && <p id="currency-error" className={errorTextStyle}>{errors.currency}</p>}
            </div>
          </div>
          <div className="flex items-center mt-4">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Product is Active (available for new deals)
            </label>
          </div>

           {/* Custom Fields Section */}
           {customFieldDefinitions && customFieldDefinitions.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-md font-semibold text-dark-text mb-3">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customFieldDefinitions.map(fieldDef => (
                        <CustomFieldRenderer
                            key={fieldDef.id}
                            definition={fieldDef}
                            value={formData.customFields?.[fieldDef.name] ?? ''}
                            onChange={handleCustomFieldChange}
                            error={customFieldErrors[fieldDef.name]}
                        />
                    ))}
                </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {initialData ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
