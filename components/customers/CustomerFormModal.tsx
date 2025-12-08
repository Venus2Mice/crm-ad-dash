
import React, { useState, useEffect, useMemo } from 'react';
import { Customer, EntityActivityLog, User, Attachment, EntityActivityType, CustomFieldDefinition } from '../../types';
import { ActivityLogTypeIcon, PaperClipIcon, DocumentIcon, PhotoIcon, XCircleIcon, QuestionMarkCircleIcon, FilePdfIcon, FileWordIcon, FileExcelIcon } from '../ui/Icon';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, ATTACHMENT_HINTS_CUSTOMER } from '../../constants';
import CustomFieldRenderer from '../shared/CustomFieldRenderer';
import { validateCustomField } from '../../utils/validationUtils';


interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: Omit<Customer, 'id' | 'createdAt' | 'lastPurchaseDate' | 'totalRevenue' | 'attachments' | 'isDeleted' | 'deletedAt' | 'customFields'> & { 
    id?: string;
    newAttachments?: File[];
    removedAttachmentIds?: string[];
    customFields?: Record<string, any>; 
  }) => void;
  initialData: Customer | null;
  activityLogs: EntityActivityLog[];
  currentUser: User | null;
  addActivityLog?: (entityId: string, entityType: 'Customer', activityType: EntityActivityType, description: string, details?: any) => void;
  customFieldDefinitions: CustomFieldDefinition[]; 
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData, 
    activityLogs, 
    currentUser,
    addActivityLog,
    customFieldDefinitions
}) => {
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'createdAt' | 'lastPurchaseDate' | 'totalRevenue' | 'attachments' | 'customFields' | 'isDeleted' | 'deletedAt'> & { customFields?: Record<string, any> }>({
    name: '',
    email: '',
    phone: '',
    company: '',
    accountManager: currentUser?.name || '',
    notes: '',
    customFields: {},
  });

  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [attachmentsToRemove, setAttachmentsToRemove] = useState<string[]>([]);
  const [showAttachmentHints, setShowAttachmentHints] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    if (initialData) {
      const { id, createdAt, lastPurchaseDate, totalRevenue, attachments, isDeleted, deletedAt, customFields, ...editableData } = initialData;
      setFormData({
        ...editableData,
        customFields: customFields || {}
      });
      setCurrentAttachments(attachments?.filter(att => !att.isDeleted) || []);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        accountManager: currentUser?.name || '',
        notes: '',
        customFields: {},
      });
      setCurrentAttachments([]);
    }
    setFilesToUpload([]);
    setAttachmentsToRemove([]);
    setFileSizeError(null);
    setShowAttachmentHints(false);
    setCustomFieldErrors({});
  }, [initialData, isOpen, currentUser]);

  const entityActivities = useMemo(() => {
    if (!initialData || !activityLogs) return [];
    return activityLogs
      .filter(log => log.entityId === initialData.id && log.entityType === 'Customer')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [initialData, activityLogs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileSizeError(null);
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      const validFiles: File[] = [];
      let oversizedFilesExist = false;

      selectedFiles.forEach(file => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            oversizedFilesExist = true;
            const errorMsg = `File '${file.name}' (${formatFileSize(file.size)}) exceeds the ${MAX_FILE_SIZE_MB}MB limit and was not added.`;
            setFileSizeError(prev => prev ? `${prev}\n${errorMsg}`: errorMsg);
            if(initialData?.id && addActivityLog) { // Ensure addActivityLog is callable
                addActivityLog(initialData.id, 'Customer', EntityActivityType.FILE_TOO_LARGE,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
        alert("Name and Email are required for a customer.");
        return;
    }

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
        return;
    }

    onSave({
        ...(initialData ? { ...formData, id: initialData.id } : formData),
        newAttachments: filesToUpload,
        removedAttachmentIds: attachmentsToRemove,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-dark-text mb-4">
          {initialData ? `Edit Customer: ${initialData.name}` : 'Add New Customer'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={commonInputStyle} />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={commonInputStyle} />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleChange} className={commonInputStyle} />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
            <input type="text" name="company" id="company" value={formData.company || ''} onChange={handleChange} className={commonInputStyle} />
          </div>
           <div>
            <label htmlFor="accountManager" className="block text-sm font-medium text-gray-700">Account Manager</label>
            <input type="text" name="accountManager" id="accountManager" value={formData.accountManager || ''} onChange={handleChange} className={commonInputStyle} placeholder="e.g., Alice Wonderland" />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className={commonInputStyle} ></textarea>
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

         {/* Attachments Section */}
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
                            <p className="font-semibold mb-1">Suggested attachments for Customers:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                            {ATTACHMENT_HINTS_CUSTOMER.map((hint, i) => <li key={i}>{hint}</li>)}
                            </ul>
                             <button 
                                onClick={() => setShowAttachmentHints(false)} 
                                className="mt-2 text-xs text-gray-300 hover:text-white float-right"
                                >Close</button>
                        </div>
                        )}
                    </div>
                </h3>
                <label htmlFor="customer-attachments" className="cursor-pointer text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-1.5 px-3 rounded-md transition-colors">
                    Add Files
                </label>
                <input type="file" id="customer-attachments" multiple onChange={handleFileSelect} className="hidden" accept="*/*"/>
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
                <p className="text-xs text-gray-500 text-center py-2">No attachments for this customer.</p>
            )}
          </div>


          {initialData && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-dark-text mb-3">Activity Log</h3>
              {entityActivities.length > 0 ? (
                 <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {entityActivities.map(activity => (
                    <li key={activity.id} className="text-xs text-gray-600 border-l-2 border-green-200 pl-3 py-1.5 bg-gray-50 rounded-r-md">
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
                <p className="text-xs text-gray-500">No activities recorded for this customer yet.</p>
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
              {initialData ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;
