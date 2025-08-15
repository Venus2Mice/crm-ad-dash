import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Lead, Customer, Deal, User, CustomFieldDefinition } from '../../types';
import CustomFieldRenderer from '../shared/CustomFieldRenderer'; // Import CustomFieldRenderer

type RelatedToType = 'Lead' | 'Customer' | 'Deal' | 'General';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'createdBy' | 'isDeleted' | 'deletedAt' | 'customFields'> & { 
    id?: string;
    customFields?: Record<string, any>; 
  }) => void;
  initialData: Task | null;
  leads: Lead[];
  customers: Customer[];
  deals: Deal[];
  taskStatuses: TaskStatus[];
  taskPriorities: Array<Task['priority']>;
  currentUser: User | null; // Added for context
  customFieldDefinitions: CustomFieldDefinition[]; 
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  leads,
  customers,
  deals,
  taskStatuses,
  taskPriorities,
  currentUser,
  customFieldDefinitions
}) => {
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'createdBy' | 'customFields' | 'isDeleted' | 'deletedAt'> & { customFields?: Record<string, any> }>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: TaskStatus.PENDING,
    priority: 'Medium',
    assignedTo: currentUser?.name || '', // Default to current user
    relatedTo: { type: 'General' },
    notes: '',
    customFields: {},
  });
  const [selectedRelatedType, setSelectedRelatedType] = useState<RelatedToType>('General');
  const [isAssignedToEditable, setIsAssignedToEditable] = useState(true);

  useEffect(() => {
    if (initialData) {
      const { id, createdAt, completedAt, createdBy, isDeleted, deletedAt, customFields, ...editableData } = initialData;
      setFormData({
        ...editableData,
        dueDate: editableData.dueDate || new Date().toISOString().split('T')[0],
        relatedTo: editableData.relatedTo || { type: 'General' },
        assignedTo: editableData.assignedTo || currentUser?.name || '',
        customFields: customFields || {},
      });
      setSelectedRelatedType(editableData.relatedTo?.type || 'General');
      // Determine if 'Assigned To' is editable
      setIsAssignedToEditable(!createdBy || createdBy.id === currentUser?.id);
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        status: TaskStatus.PENDING,
        priority: 'Medium',
        assignedTo: currentUser?.name || '',
        relatedTo: { type: 'General' },
        notes: '',
        customFields: {},
      });
      setSelectedRelatedType('General');
      setIsAssignedToEditable(true); // Editable for new tasks
    }
  }, [initialData, isOpen, currentUser]);

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
  };

  const handleRelatedTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as RelatedToType;
    setSelectedRelatedType(newType);
    setFormData(prev => ({
      ...prev,
      relatedTo: { type: newType }, // Reset related ID and name when type changes
    }));
  };

  const handleRelatedEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const entityId = e.target.value;
    let entityName = '';
    if (entityId) {
        switch (selectedRelatedType) {
            case 'Lead':
                entityName = leads.find(l => l.id === entityId)?.name || '';
                break;
            case 'Customer':
                entityName = customers.find(c => c.id === entityId)?.name || '';
                break;
            case 'Deal':
                entityName = deals.find(d => d.id === entityId)?.dealName || '';
                break;
        }
    }

    setFormData(prev => ({
      ...prev,
      relatedTo: {
        type: selectedRelatedType,
        id: entityId || undefined, // Store undefined if empty
        name: entityName || undefined,
      },
    }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate || !formData.status) {
      alert('Title, Due Date, and Status are required for a task.');
      return;
    }
    // Ensure relatedTo object is correctly structured
    const finalRelatedTo = selectedRelatedType === 'General' || !formData.relatedTo?.id
        ? { type: selectedRelatedType }
        : { type: selectedRelatedType, id: formData.relatedTo.id, name: formData.relatedTo.name };

    onSave(initialData ? 
        { ...formData, relatedTo: finalRelatedTo, id: initialData.id } : 
        { ...formData, relatedTo: finalRelatedTo }
    );
  };

  if (!isOpen) return null;

  const commonInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const disabledInputStyle = "bg-gray-100 cursor-not-allowed";


  const renderRelatedToEntitySelect = () => {
    let options: { id: string, name: string }[] = [];
    switch (selectedRelatedType) {
      case 'Lead':
        options = leads.map(l => ({ id: l.id, name: `${l.name} (${l.company || 'Individual'})` }));
        break;
      case 'Customer':
        options = customers.map(c => ({ id: c.id, name: `${c.name} (${c.company || 'Individual'})` }));
        break;
      case 'Deal':
        options = deals.map(d => ({ id: d.id, name: d.dealName }));
        break;
      default:
        return null;
    }
    return (
      <div>
        <label htmlFor="relatedToEntity" className="block text-sm font-medium text-gray-700">Select {selectedRelatedType}</label>
        <select
          name="relatedToEntity"
          id="relatedToEntity"
          value={formData.relatedTo?.id || ''}
          onChange={handleRelatedEntityChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        >
          <option value="">-- Select {selectedRelatedType} --</option>
          {options.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-dark-text mb-4">
          {initialData ? `Edit Task: ${initialData.title}` : 'Add New Task'}
        </h2>
        {initialData?.createdBy && (
            <p className="text-xs text-gray-500 mb-3">
                Task created by: <span className="font-medium">{initialData.createdBy.name}</span>
            </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
            <input
              type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
              className={commonInputStyle}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={3}
              className={commonInputStyle}
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date <span className="text-red-500">*</span></label>
              <input
                type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} required
                className={commonInputStyle}
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
              <select
                name="status" id="status" value={formData.status} onChange={handleChange} required
                className={`${commonInputStyle} bg-white`}
              >
                {taskStatuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                name="priority" id="priority" value={formData.priority || 'Medium'} onChange={handleChange}
                className={`${commonInputStyle} bg-white`}
              >
                {taskPriorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assigned To</label>
              <input
                type="text" name="assignedTo" id="assignedTo" value={formData.assignedTo || ''} 
                onChange={isAssignedToEditable ? handleChange : undefined}
                readOnly={!isAssignedToEditable}
                className={`${commonInputStyle} ${!isAssignedToEditable ? disabledInputStyle : ''}`}
                placeholder="e.g., User Name"
                aria-describedby={!isAssignedToEditable ? "assignedTo-readonly-description" : undefined}
              />
              {!isAssignedToEditable && initialData?.createdBy && (
                <p id="assignedTo-readonly-description" className="mt-1 text-xs text-gray-500">
                  Only {initialData.createdBy.name} can change the assignee.
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="relatedToType" className="block text-sm font-medium text-gray-700">Related To Type</label>
            <select
              name="relatedToType"
              id="relatedToType"
              value={selectedRelatedType}
              onChange={handleRelatedTypeChange}
              className={`${commonInputStyle} bg-white`}
            >
              <option value="General">General Task</option>
              <option value="Lead">Lead</option>
              <option value="Customer">Customer</option>
              <option value="Deal">Deal</option>
            </select>
          </div>

          {selectedRelatedType !== 'General' && renderRelatedToEntitySelect()}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={3}
              className={commonInputStyle}
            ></textarea>
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

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {initialData ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;