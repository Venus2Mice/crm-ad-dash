
import React, { useState, useEffect, useMemo } from 'react';
import { Lead, LeadStatus, EntityActivityLog, User, Attachment, EntityActivityType, CustomFieldDefinition, Task, TaskStatus } from '../../types';
import { ActivityLogTypeIcon, PaperClipIcon, DocumentIcon, PhotoIcon, XCircleIcon, QuestionMarkCircleIcon, FilePdfIcon, FileWordIcon, FileExcelIcon, ClipboardDocumentListIcon, PlusIcon } from '../ui/Icon';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, ATTACHMENT_HINTS_LEAD, TASK_STATUS_OPTIONS } from '../../constants';
import CustomFieldRenderer from '../shared/CustomFieldRenderer';
import TaskFormModal from '../tasks/TaskFormModal';
import { validateCustomField } from '../../utils/validationUtils';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastContacted' | 'attachments' | 'isDeleted' | 'deletedAt' | 'customFields'> & { 
    id?: string;
    newAttachments?: File[];
    removedAttachmentIds?: string[];
    customFields?: Record<string, any>; 
  }) => void;
  initialData: Lead | null;
  leadStatuses: LeadStatus[];
  activityLogs: EntityActivityLog[];
  currentUser: User | null;
  addActivityLog: (entityId: string, entityType: 'Lead', activityType: EntityActivityType, description: string, details?: any) => void;
  customFieldDefinitions: CustomFieldDefinition[];
  // New props for tasks
  onSaveTask: (taskData: any) => void;
  tasks: Task[];
}

const LeadFormModal: React.FC<LeadFormModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData, 
    leadStatuses, 
    activityLogs, 
    currentUser,
    addActivityLog,
    customFieldDefinitions,
    onSaveTask,
    tasks
}) => {
  const [formData, setFormData] = useState<Omit<Lead, 'id' | 'createdAt' | 'lastContacted' | 'attachments' | 'customFields' | 'isDeleted' | 'deletedAt'> & { customFields?: Record<string, any> }>({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: LeadStatus.NEW,
    source: '',
    assignedTo: currentUser?.name || '',
    notes: '',
    customFields: {},
  });

  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [attachmentsToRemove, setAttachmentsToRemove] = useState<string[]>([]);
  const [showAttachmentHints, setShowAttachmentHints] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});

  // State for Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);


  useEffect(() => {
    if (initialData) {
      const { id, createdAt, lastContacted, attachments, isDeleted, deletedAt, customFields, ...editableData } = initialData;
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
        status: LeadStatus.NEW,
        source: '',
        assignedTo: currentUser?.name || '',
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
      .filter(log => log.entityId === initialData.id && log.entityType === 'Lead')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [initialData, activityLogs]);

  // Filter tasks related to this lead
  const relatedTasks = useMemo(() => {
    if (!initialData || !tasks) return [];
    return tasks.filter(t => !t.isDeleted && t.relatedTo?.type === 'Lead' && t.relatedTo.id === initialData.id);
  }, [initialData, tasks]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
             if(initialData?.id && addActivityLog) {
                addActivityLog(initialData.id, 'Lead', EntityActivityType.FILE_TOO_LARGE,
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
        alert("Name and Email are required.");
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

  // Task Management Handlers
  const handleAddTask = () => {
    if (!initialData) return;
    setEditingTask({
        id: '', // Will be ignored for new
        title: '',
        dueDate: new Date().toISOString().split('T')[0],
        status: TaskStatus.PENDING,
        relatedTo: { type: 'Lead', id: initialData.id, name: initialData.name },
        assignedTo: currentUser?.name || '',
        createdAt: '', // Ignored
        isDeleted: false,
    } as Task);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTaskModal = (taskData: any) => {
    onSaveTask(taskData);
    setIsTaskModalOpen(false);
    setEditingTask(null);
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
          {initialData ? `Edit Lead: ${initialData.name}` : 'Add New Lead'}
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
            <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleChange} className={commonInputStyle}/>
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
            <input type="text" name="company" id="company" value={formData.company || ''} onChange={handleChange} className={commonInputStyle} />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
            <select name="status" id="status" value={formData.status} onChange={handleChange} required className={commonInputStyle} >
              {leadStatuses.map(status => ( <option key={status} value={status}>{status}</option> ))}
            </select>
          </div>
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label>
            <input type="text" name="source" id="source" value={formData.source || ''} onChange={handleChange} className={commonInputStyle} />
          </div>
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assigned To</label>
            <input type="text" name="assignedTo" id="assignedTo" value={formData.assignedTo || ''} onChange={handleChange} className={commonInputStyle}/>
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
                            <p className="font-semibold mb-1">Suggested attachments for Leads:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                            {ATTACHMENT_HINTS_LEAD.map((hint, i) => <li key={i}>{hint}</li>)}
                            </ul>
                             <button 
                                onClick={() => setShowAttachmentHints(false)} 
                                className="mt-2 text-xs text-gray-300 hover:text-white float-right"
                                >Close</button>
                        </div>
                        )}
                    </div>
                </h3>
                <label htmlFor="lead-attachments" className="cursor-pointer text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-1.5 px-3 rounded-md transition-colors">
                    Add Files
                </label>
                <input type="file" id="lead-attachments" multiple onChange={handleFileSelect} className="hidden" accept="*/*"/>
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
                <p className="text-xs text-gray-500 text-center py-2">No attachments for this lead.</p>
            )}
          </div>

          {/* Related Tasks Section */}
          {initialData && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-md font-semibold text-dark-text flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-yellow-600" /> Related Tasks
                </h3>
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="text-sm bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium py-1.5 px-3 rounded-md transition-colors flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-1" /> Add Task
                </button>
              </div>
              
              {relatedTasks.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {relatedTasks.map(task => (
                    <div 
                        key={task.id} 
                        className="flex items-center justify-between p-2 border border-gray-200 rounded text-sm bg-white hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEditTask(task)}
                    >
                      <div className="flex-grow">
                        <p className="font-medium text-gray-800">{task.title}</p>
                        <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                      </div>
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-gray-100 text-gray-800`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-2">No tasks linked to this lead.</p>
              )}
            </div>
          )}


          {initialData && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-dark-text mb-3">Activity Log</h3>
              {entityActivities.length > 0 ? (
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {entityActivities.map(activity => (
                    <li key={activity.id} className="text-xs text-gray-600 border-l-2 border-blue-200 pl-3 py-1.5 bg-gray-50 rounded-r-md">
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
                <p className="text-xs text-gray-500">No activities recorded for this lead yet.</p>
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
              {initialData ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Nested Task Modal */}
      {isTaskModalOpen && (
        <TaskFormModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onSave={handleSaveTaskModal}
            initialData={editingTask}
            leads={initialData ? [initialData] : []} // Only expose current lead for validation safety
            customers={[]} // Can't select others
            deals={[]} // Can't select others
            taskStatuses={TASK_STATUS_OPTIONS}
            taskPriorities={['Low', 'Medium', 'High']}
            currentUser={currentUser}
            customFieldDefinitions={customFieldDefinitions}
        />
      )}
    </div>
  );
};

export default LeadFormModal;
