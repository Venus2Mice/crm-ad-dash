
import React, { useState } from 'react';
import { CustomFieldDefinition, CustomFieldType, CustomFieldEntityType } from '../../types';
import { CUSTOM_FIELD_TYPES_OPTIONS, SUPPORTED_CUSTOM_FIELD_ENTITIES } from '../../constants';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon } from '../ui/Icon';
import ConfirmationModal from '../ui/ConfirmationModal';

interface CustomFieldsSettingsProps {
  definitions: CustomFieldDefinition[];
  onAddDefinition: (definition: CustomFieldDefinition) => void;
  onUpdateDefinition: (definition: CustomFieldDefinition) => void;
  onDeleteDefinition: (definitionId: string) => void;
}

const CustomFieldsSettings: React.FC<CustomFieldsSettingsProps> = ({
  definitions,
  onAddDefinition,
  onUpdateDefinition,
  onDeleteDefinition,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<CustomFieldDefinition | null>(null);
  const [formData, setFormData] = useState<Omit<CustomFieldDefinition, 'id'>>({
    entityType: 'Lead',
    name: '',
    label: '',
    type: 'TEXT',
    options: [],
    isRequired: false,
    placeholder: '',
  });
  const [optionsString, setOptionsString] = useState(''); // For SELECT type options input
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [definitionToDelete, setDefinitionToDelete] = useState<CustomFieldDefinition | null>(null);

  const commonInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const errorTextStyle = "text-red-500 text-xs mt-1";

  const generateNameFromLabel = (label: string): string => {
    return label
      .toLowerCase()
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[^a-z0-9_]/g, '') // Remove non-alphanumeric characters except underscore
      .slice(0, 50); // Limit length
  };
  
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setFormData(prev => ({
      ...prev,
      label: newLabel,
      name: generateNameFromLabel(newLabel) // Auto-generate name from label
    }));
     if (formErrors.label) setFormErrors(prev => ({ ...prev, label: undefined }));
     if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === 'name') { // Manual edit of 'name'
        const sanitizedName = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 50);
        setFormData(prev => ({ ...prev, [name]: sanitizedName }));
    } else {
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value,
        }));
    }

    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptionsString(e.target.value);
    setFormData(prev => ({ ...prev, options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean) }));
    if (formErrors.options) setFormErrors(prev => ({ ...prev, options: undefined }));
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.label.trim()) errors.label = "Label is required.";
    if (!formData.name.trim()) errors.name = "Programmatic Name is required.";
    else if (!/^[a-z0-9_]+$/.test(formData.name)) errors.name = "Programmatic Name must be lowercase alphanumeric with underscores.";
    else {
        const existing = definitions.find(def => def.name === formData.name && def.entityType === formData.entityType && def.id !== editingDefinition?.id);
        if (existing) errors.name = "This Programmatic Name is already in use for this entity type.";
    }
    if (formData.type === 'SELECT' && (!formData.options || formData.options.length === 0)) {
      errors.options = "At least one option is required for Dropdown type.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingDefinition) {
      onUpdateDefinition({ ...editingDefinition, ...formData });
    } else {
      onAddDefinition({ ...formData, id: `cfd-${Date.now()}-${Math.random().toString(16).slice(2)}` });
    }
    closeForm();
  };

  const openEditForm = (definition: CustomFieldDefinition) => {
    setEditingDefinition(definition);
    setFormData(definition);
    setOptionsString(definition.options?.join(', ') || '');
    setIsFormOpen(true);
    setFormErrors({});
  };

  const openNewForm = () => {
    setEditingDefinition(null);
    setFormData({
      entityType: 'Lead', name: '', label: '', type: 'TEXT',
      options: [], isRequired: false, placeholder: '',
    });
    setOptionsString('');
    setIsFormOpen(true);
    setFormErrors({});
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDefinition(null);
  };

  const handleDeleteClick = (definition: CustomFieldDefinition) => {
    // Future: Check if field is in use before allowing deletion.
    // For now, allow direct deletion with confirmation.
    setDefinitionToDelete(definition);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (definitionToDelete) {
      onDeleteDefinition(definitionToDelete.id);
    }
    setIsConfirmDeleteOpen(false);
    setDefinitionToDelete(null);
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold leading-6 text-gray-900">Custom Field Definitions</h3>
          <p className="mt-1 text-sm text-gray-500">Define custom fields for your CRM entities.</p>
        </div>
        <button
          onClick={openNewForm}
          className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-150"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Add New Field</span>
        </button>
      </div>

      {isFormOpen && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
            onClick={(e) => { e.stopPropagation(); closeForm(); }}
        >
            <div 
                className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-semibold text-dark-text mb-4">
                    {editingDefinition ? 'Edit Custom Field' : 'Create New Custom Field'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="entityType" className="block text-sm font-medium text-gray-700">Entity Type <span className="text-red-500">*</span></label>
                    <select name="entityType" id="entityType" value={formData.entityType} onChange={handleInputChange} className={commonInputStyle} required>
                        {SUPPORTED_CUSTOM_FIELD_ENTITIES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="label" className="block text-sm font-medium text-gray-700">Display Label <span className="text-red-500">*</span></label>
                    <input type="text" name="label" id="label" value={formData.label} onChange={handleLabelChange} className={commonInputStyle} required />
                    {formErrors.label && <p className={errorTextStyle}>{formErrors.label}</p>}
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Programmatic Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className={commonInputStyle} required 
                           title="Auto-generated from label. Can be edited (lowercase, numbers, underscores only)."
                    />
                    <p className="text-xs text-gray-500 mt-1">Lowercase, numbers, underscores. Used internally. Max 50 chars.</p>
                    {formErrors.name && <p className={errorTextStyle}>{formErrors.name}</p>}
                </div>
                 <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Field Type <span className="text-red-500">*</span></label>
                    <select name="type" id="type" value={formData.type} onChange={handleInputChange} className={commonInputStyle} required>
                        {CUSTOM_FIELD_TYPES_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>

                {formData.type === 'SELECT' && (
                    <div>
                        <label htmlFor="optionsString" className="block text-sm font-medium text-gray-700">Options (comma-separated) <span className="text-red-500">*</span></label>
                        <input type="text" name="optionsString" id="optionsString" value={optionsString} onChange={handleOptionsChange} className={commonInputStyle} placeholder="e.g., Option A, Option B, Option C"/>
                        {formErrors.options && <p className={errorTextStyle}>{formErrors.options}</p>}
                    </div>
                )}
                
                {(formData.type === 'TEXT' || formData.type === 'TEXTAREA' || formData.type === 'NUMBER') && (
                    <div>
                        <label htmlFor="placeholder" className="block text-sm font-medium text-gray-700">Placeholder</label>
                        <input type="text" name="placeholder" id="placeholder" value={formData.placeholder || ''} onChange={handleInputChange} className={commonInputStyle} />
                    </div>
                )}

                <div className="flex items-center">
                    <input type="checkbox" name="isRequired" id="isRequired" checked={formData.isRequired || false} onChange={handleInputChange} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
                    <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900">Required Field</label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={closeForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md shadow-sm">{editingDefinition ? 'Save Changes' : 'Create Field'}</button>
                </div>
                </form>
            </div>
        </div>
      )}
      
      <div className="overflow-x-auto mt-6">
        {definitions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No custom fields defined yet. Click "Add New Field" to get started.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Programmatic Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Field Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Required</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {definitions.map((def) => (
                <tr key={def.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{def.label}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell font-mono text-xs">{def.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{def.entityType}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{def.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{def.isRequired ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => openEditForm(def)} className="text-primary hover:text-primary-dark p-1" title="Edit Field">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDeleteClick(def)} className="text-red-600 hover:text-red-800 p-1" title="Delete Field">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {isConfirmDeleteOpen && definitionToDelete && (
        <ConfirmationModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => {
            setIsConfirmDeleteOpen(false);
            setDefinitionToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Confirm Delete Custom Field"
          message={
            <>
              Are you sure you want to delete the custom field{' '}
              <strong>"{definitionToDelete.label}"</strong> for <strong>{definitionToDelete.entityType}</strong>?
              <br />
              <strong className="text-red-600">This will also remove any data stored in this field for all associated records. This action CANNOT be undone.</strong>
            </>
          }
          confirmButtonText="Delete Permanently"
          confirmButtonClass="bg-red-700 hover:bg-red-800"
        />
      )}
    </div>
  );
};

export default CustomFieldsSettings;
