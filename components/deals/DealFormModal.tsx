import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Deal, Customer, Lead, DealStage, EntityActivityLog, User, Attachment, EntityActivityType, Product, DealLineItem, CustomFieldDefinition } from '../../types';
import { ActivityLogTypeIcon, PaperClipIcon, DocumentIcon, PhotoIcon, XCircleIcon, FilePdfIcon, FileWordIcon, FileExcelIcon, QuestionMarkCircleIcon, PlusIcon, TrashIcon as LineItemTrashIcon } from '../ui/Icon';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, ATTACHMENT_HINTS_DEAL } from '../../constants';
import CustomFieldRenderer from '../shared/CustomFieldRenderer'; // Import CustomFieldRenderer


interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    dealData: Omit<Deal, 'id' | 'createdAt' | 'attachments' | 'isDeleted' | 'deletedAt' | 'customFields'> & { 
      id?: string; 
      newAttachments?: File[];
      removedAttachmentIds?: string[];
      lineItems?: DealLineItem[]; 
      customFields?: Record<string, any>; 
    }
  ) => void;
  initialData: Deal | null;
  customers: Customer[];
  leads: Lead[];
  products: Product[]; // Active products
  dealStages: DealStage[];
  activityLogs: EntityActivityLog[];
  currentUser: User | null;
  addActivityLog: (entityId: string, entityType: 'Deal', activityType: EntityActivityType, description: string, details?: any) => void;
  defaultCurrency: string;
  customFieldDefinitions: CustomFieldDefinition[]; 
}

const DealFormModal: React.FC<DealFormModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData, 
    customers, 
    leads, 
    products, 
    dealStages,
    activityLogs,
    currentUser,
    addActivityLog,
    defaultCurrency,
    customFieldDefinitions
}) => {
  const [formData, setFormData] = useState<Omit<Deal, 'id' | 'createdAt' | 'attachments' | 'isDeleted' | 'deletedAt' | 'lineItems' | 'customFields'> & { customFields?: Record<string, any> }>({
    dealName: '',
    customerId: undefined,
    leadId: undefined,
    stage: DealStage.PROSPECTING,
    value: 0,
    currency: defaultCurrency,
    closeDate: new Date().toISOString().split('T')[0],
    owner: currentUser?.name || '',
    description: '',
    notes: '',
    customFields: {},
  });

  const [currentLineItems, setCurrentLineItems] = useState<DealLineItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);

  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [attachmentsToRemove, setAttachmentsToRemove] = useState<string[]>([]);
  const [showAttachmentHints, setShowAttachmentHints] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);

  const activeProducts = useMemo(() => products.filter(p => p.isActive), [products]);

  const calculateTotalValueFromLineItems = useCallback((items: DealLineItem[]): number => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  }, []);

  useEffect(() => {
    if (initialData) {
      const { id, createdAt, attachments, lineItems, isDeleted, deletedAt, customFields, ...editableData } = initialData;
      setFormData({
        ...editableData,
        value: lineItems && lineItems.length > 0 ? calculateTotalValueFromLineItems(lineItems) : (editableData.value || 0),
        currency: editableData.currency || defaultCurrency,
        closeDate: editableData.closeDate || new Date().toISOString().split('T')[0],
        owner: editableData.owner || currentUser?.name || '',
        customFields: customFields || {},
      });
      setCurrentAttachments(attachments?.filter(att => !att.isDeleted) || []);
      setCurrentLineItems(lineItems || []);
    } else {
      setFormData({
        dealName: '',
        customerId: undefined,
        leadId: undefined,
        stage: DealStage.PROSPECTING,
        value: 0,
        currency: defaultCurrency,
        closeDate: new Date().toISOString().split('T')[0],
        owner: currentUser?.name || '',
        description: '',
        notes: '',
        customFields: {},
      });
      setCurrentAttachments([]);
      setCurrentLineItems([]);
    }
    setFilesToUpload([]);
    setAttachmentsToRemove([]);
    setFileSizeError(null);
    setShowAttachmentHints(false);
    setSelectedProductId('');
    setCurrentQuantity(1);
  }, [initialData, isOpen, currentUser, defaultCurrency, calculateTotalValueFromLineItems]);

  // Effect to update deal value when line items change
  useEffect(() => {
    if (currentLineItems.length > 0) {
      const totalValue = calculateTotalValueFromLineItems(currentLineItems);
      setFormData(prev => ({
        ...prev,
        value: totalValue,
        // Currency can be set from the first line item or system default
        currency: currentLineItems[0]?.currency || defaultCurrency 
      }));
    } else if (initialData && initialData.lineItems && initialData.lineItems.length === 0) {
        // If initial data had no line items, keep its original value or allow manual input
        setFormData(prev => ({...prev, value: initialData.value || 0, currency: initialData.currency || defaultCurrency}));
    } else if (!initialData) {
        // For new deals with no line items yet, set value to 0
        setFormData(prev => ({...prev, value: 0, currency: defaultCurrency}));
    }
  }, [currentLineItems, defaultCurrency, initialData, calculateTotalValueFromLineItems]);


  const entityActivities = useMemo(() => {
    if (!initialData || !activityLogs) return [];
    return activityLogs
      .filter(log => log.entityId === initialData.id && log.entityType === 'Deal')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [initialData, activityLogs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "customerId" && value === "") {
        setFormData(prev => ({ ...prev, customerId: undefined, leadId: prev.leadId }));
    } else if (name === "leadId" && value === "") {
        setFormData(prev => ({ ...prev, leadId: undefined, customerId: prev.customerId }));
    } else {
        const isValueField = name === 'value';
        const newDealValue = isValueField ? parseFloat(value) || 0 : value;
        
        // Allow manual value input only if no line items
        if (isValueField && currentLineItems.length > 0) return;

        setFormData(prev => ({
            ...prev,
            [name]: newDealValue,
            ...(name === 'customerId' && value !== '' ? { leadId: undefined } : {}),
            ...(name === 'leadId' && value !== '' ? { customerId: undefined } : {}),
        }));
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
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileSizeError(null);
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      let oversizedFilesExist = false;

      selectedFiles.forEach(file => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          oversizedFilesExist = true;
          const errorMsg = `File '${file.name}' (${formatFileSize(file.size)}) exceeds the ${MAX_FILE_SIZE_MB}MB limit and was not added.`;
          setFileSizeError(prev => prev ? `${prev}\n${errorMsg}` : errorMsg);
          if(initialData?.id && addActivityLog) {
            addActivityLog(initialData.id, 'Deal', EntityActivityType.FILE_TOO_LARGE, 
            `Attempted to attach oversized file '${file.name}'.`,
            { fileName: file.name, fileSize: file.size, maxFileSize: MAX_FILE_SIZE_BYTES });
          }
        } else {
          validFiles.push(file);
        }
      });
      setFilesToUpload(prev => [...prev, ...validFiles]);
      if(oversizedFilesExist) {
        alert(`Some files exceeded the ${MAX_FILE_SIZE_MB}MB limit and were not added. See error message below file list.`);
      }
    }
  };

  const removeNewFile = (fileNameToRemove: string) => {
    setFilesToUpload(prev => prev.filter(file => file.name !== fileNameToRemove));
  };

  const removeExistingAttachment = (attachmentIdToRemove: string) => {
    setAttachmentsToRemove(prev => [...prev, attachmentIdToRemove]);
    setCurrentAttachments(prev => prev.filter(att => att.id !== attachmentIdToRemove));
  };

  const handleAddLineItem = () => {
    if (!selectedProductId || currentQuantity <= 0) {
      alert("Please select a product and specify a valid quantity.");
      return;
    }
    const product = activeProducts.find(p => p.id === selectedProductId);
    if (!product) {
      alert("Selected product not found.");
      return;
    }

    const newLineItem: DealLineItem = {
      id: `dli-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      productId: product.id,
      productName: product.name,
      quantity: currentQuantity,
      unitPrice: product.price, // Price from product catalog
      currency: product.currency || defaultCurrency, // Currency from product or default
      totalPrice: product.price * currentQuantity,
    };
    setCurrentLineItems(prev => [...prev, newLineItem]);
    setSelectedProductId(''); // Reset for next entry
    setCurrentQuantity(1);
  };

  const handleRemoveLineItem = (lineItemId: string) => {
    setCurrentLineItems(prev => prev.filter(item => item.id !== lineItemId));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dealName || formData.value < 0 || !formData.closeDate || !formData.owner) { // Value can be 0 if items are free
        alert("Deal Name, Close Date, and Owner are required. Value must be zero or positive.");
        return;
    }
    onSave({
        ...(initialData ? { ...formData, id: initialData.id } : formData),
        newAttachments: filesToUpload,
        removedAttachmentIds: attachmentsToRemove,
        lineItems: currentLineItems,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string, fileName: string) => {
    if (mimeType.startsWith('image/')) return <PhotoIcon className="w-5 h-5 text-purple-500" />;
    if (mimeType === 'application/pdf') return <FilePdfIcon className="w-5 h-5" />;
    if (mimeType.includes('wordprocessingml') || mimeType === 'application/msword') return <FileWordIcon className="w-5 h-5" />;
    if (mimeType.includes('spreadsheetml') || mimeType === 'application/vnd.ms-excel') return <FileExcelIcon className="w-5 h-5" />;
    return <DocumentIcon className="w-5 h-5 text-gray-500" />;
  };


  if (!isOpen) return null;

  const commonInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const isValueCalculated = currentLineItems.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-dark-text mb-4">
          {initialData ? `Edit Deal: ${initialData.dealName}` : 'Add New Deal'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="dealName" className="block text-sm font-medium text-gray-700">Deal Name <span className="text-red-500">*</span></label>
            <input type="text" name="dealName" id="dealName" value={formData.dealName} onChange={handleChange} required className={commonInputStyle}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">Associated Customer</label>
              <select name="customerId" id="customerId" value={formData.customerId || ''} onChange={handleChange} className={commonInputStyle}>
                <option value="">None (or select a Lead)</option>
                {customers.map(customer => (<option key={customer.id} value={customer.id}>{customer.name} {customer.company ? `(${customer.company})` : ''}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="leadId" className="block text-sm font-medium text-gray-700">Associated Lead</label>
              <select name="leadId" id="leadId" value={formData.leadId || ''} onChange={handleChange} className={commonInputStyle}>
                <option value="">None (or select a Customer)</option>
                {leads.map(lead => (<option key={lead.id} value={lead.id}>{lead.name} {lead.company ? `(${lead.company})` : ''}</option>))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700">Stage <span className="text-red-500">*</span></label>
            <select name="stage" id="stage" value={formData.stage} onChange={handleChange} required className={commonInputStyle}>
              {dealStages.map(stage => (<option key={stage} value={stage}>{stage}</option>))}
            </select>
          </div>

          {/* Line Items Section */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-md font-semibold text-dark-text mb-2">Products/Services in this Deal</h3>
            {/* Form to add a new line item */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-3 border border-gray-200 rounded-md mb-4 bg-gray-50">
              <div className="md:col-span-2">
                <label htmlFor="product-select" className="block text-xs font-medium text-gray-700">Product</label>
                <select 
                  id="product-select" 
                  value={selectedProductId} 
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className={`${commonInputStyle} text-sm py-1.5`}
                >
                  <option value="">-- Select Product --</option>
                  {activeProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.currency} {p.price.toFixed(2)})</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="quantity-input" className="block text-xs font-medium text-gray-700">Quantity</label>
                <input 
                  type="number" 
                  id="quantity-input"
                  value={currentQuantity}
                  onChange={(e) => setCurrentQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  className={`${commonInputStyle} text-sm py-1.5`}
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddLineItem}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 px-3 rounded-md text-sm flex items-center justify-center h-9"
              >
                <PlusIcon className="h-4 w-4 mr-1" /> Add
              </button>
            </div>

            {/* Display current line items */}
            {currentLineItems.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {currentLineItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 border border-gray-200 rounded text-sm bg-white">
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800">{item.productName}</p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} x {item.currency}{item.unitPrice.toFixed(2)} = <span className="font-semibold">{item.currency}{item.totalPrice.toFixed(2)}</span>
                      </p>
                    </div>
                    <button type="button" onClick={() => handleRemoveLineItem(item.id)} className="text-red-500 hover:text-red-700 ml-2 p-1">
                      <LineItemTrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-2">No products added to this deal yet.</p>
            )}
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                Total Deal Value <span className="text-red-500">*</span>
                {isValueCalculated && <span className="text-xs text-gray-500"> (Calculated from products)</span>}
              </label>
              <input 
                type="number" name="value" id="value" 
                value={formData.value.toFixed(2)} 
                onChange={handleChange} 
                required 
                min="0" step="0.01" 
                className={`${commonInputStyle} ${isValueCalculated ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                readOnly={isValueCalculated}
              />
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency <span className="text-red-500">*</span></label>
              <input 
                type="text" name="currency" id="currency" 
                value={formData.currency} 
                onChange={handleChange} 
                required maxLength={3} 
                className={`${commonInputStyle} ${isValueCalculated ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="e.g., USD"
                readOnly={isValueCalculated}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="closeDate" className="block text-sm font-medium text-gray-700">Expected Close Date <span className="text-red-500">*</span></label>
            <input type="date" name="closeDate" id="closeDate" value={formData.closeDate} onChange={handleChange} required className={commonInputStyle}/>
          </div>

          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-gray-700">Owner (Sales Rep) <span className="text-red-500">*</span></label>
            <input type="text" name="owner" id="owner" value={formData.owner} onChange={handleChange} required className={commonInputStyle} placeholder="e.g., Your Name"/>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={2} className={commonInputStyle}></textarea>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className={commonInputStyle}></textarea>
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
                        />
                    ))}
                </div>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-md font-semibold text-dark-text flex items-center">
                    <PaperClipIcon className="w-5 h-5 mr-2 text-gray-600"/> Attachments
                    <div className="relative ml-2">
                        <QuestionMarkCircleIcon 
                            className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer"
                            onClick={() => setShowAttachmentHints(!showAttachmentHints)}
                        />
                        {showAttachmentHints && (
                        <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-md shadow-lg z-10">
                            <p className="font-semibold mb-1">Suggested attachments for Deals:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                            {ATTACHMENT_HINTS_DEAL.map((hint, i) => <li key={i}>{hint}</li>)}
                            </ul>
                             <button 
                                onClick={() => setShowAttachmentHints(false)} 
                                className="mt-2 text-xs text-gray-300 hover:text-white float-right"
                                >Close</button>
                        </div>
                        )}
                    </div>
                </h3>
                <label htmlFor="deal-attachments" className="cursor-pointer text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-1.5 px-3 rounded-md transition-colors">
                    Add Files
                </label>
                <input type="file" id="deal-attachments" multiple onChange={handleFileSelect} className="hidden" accept="*/*"/>
            </div>
             {fileSizeError && (
              <p className="text-xs text-red-500 mt-1 whitespace-pre-line">{fileSizeError}</p>
            )}

            {filesToUpload.length > 0 && (
              <div className="my-3">
                <p className="text-xs font-medium text-gray-600 mb-1">New files to upload:</p>
                <ul className="space-y-1.5">
                  {filesToUpload.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-1.5 bg-blue-50 rounded text-xs">
                      <div className="flex items-center truncate">
                        {getFileIcon(file.type, file.name)}
                        <span className="ml-1.5 truncate" title={file.name}>{file.name}</span>
                        <span className="ml-2 text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <button type="button" onClick={() => removeNewFile(file.name)} className="text-red-500 hover:text-red-700">
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {currentAttachments.filter(att => !att.isDeleted).length > 0 && (
              <div className="my-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Current attachments:</p>
                <ul className="space-y-1.5">
                  {currentAttachments.filter(att => !att.isDeleted).map(att => (
                    <li key={att.id} className="flex items-center justify-between p-1.5 bg-gray-100 rounded text-xs">
                      <div className="flex items-center truncate">
                        {getFileIcon(att.mimeType, att.filename)}
                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="ml-1.5 truncate hover:underline" title={`Download ${att.filename}`}>{att.filename}</a>
                        <span className="ml-2 text-gray-500">({formatFileSize(att.size)})</span>
                      </div>
                      <button type="button" onClick={() => removeExistingAttachment(att.id)} className="text-red-500 hover:text-red-700">
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {filesToUpload.length === 0 && currentAttachments.filter(att => !att.isDeleted).length === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">No attachments for this deal.</p>
            )}
          </div>

          {initialData && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-dark-text mb-3">Activity Log</h3>
              {entityActivities.length > 0 ? (
                 <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {entityActivities.map(activity => (
                    <li key={activity.id} className="text-xs text-gray-600 border-l-2 border-purple-200 pl-3 py-1.5 bg-gray-50 rounded-r-md">
                       <div className="flex items-start">
                         <ActivityLogTypeIcon activityType={activity.activityType} className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                         <div>
                            <p className="font-medium text-gray-700 leading-tight">{activity.description}</p>
                            <p className="text-gray-500 text-[11px] mt-0.5">
                                {new Date(activity.timestamp).toLocaleString()} by {activity.userName}
                            </p>
                            {activity.details && (activity.details.oldValue !== undefined || activity.details.newValue !== undefined || activity.details.taskTitle || activity.details.fileName || activity.details.customFieldLabel) && (
                                <p className="text-gray-400 text-[11px] mt-0.5 italic">
                                {activity.details.customFieldLabel && `Field: ${activity.details.customFieldLabel} `}
                                {activity.details.field && !activity.details.customFieldLabel && `Field: ${activity.details.field} `}
                                {activity.details.oldValue !== undefined && `Old: ${String(activity.details.oldValue)} `}
                                {activity.details.newValue !== undefined && `New: ${String(activity.details.newValue)}`}
                                {activity.details.taskTitle && `Task: ${activity.details.taskTitle}`}
                                {activity.details.taskStatus && ` (Status: ${activity.details.taskStatus})`}
                                {activity.details.fileName && `File: ${activity.details.fileName}`}
                                {activity.details.fileSize && ` (Size: ${formatFileSize(activity.details.fileSize)})`}
                                </p>
                            )}
                         </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">No activities recorded for this deal yet.</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
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
                {initialData ? 'Save Changes' : 'Add Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealFormModal;