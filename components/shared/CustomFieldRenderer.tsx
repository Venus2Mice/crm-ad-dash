
import React from 'react';
import { CustomFieldDefinition } from '../../types';

interface CustomFieldRendererProps {
  definition: CustomFieldDefinition;
  value: any; // Current value of the field
  onChange: (fieldName: string, value: any) => void;
  error?: string; // Optional error message for this field
}

const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = ({
  definition,
  value,
  onChange,
  error,
}) => {
  const { name, label, type, options, isRequired, placeholder } = definition;

  const commonInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const errorTextStyle = "text-red-500 text-xs mt-1";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name: fieldName, value: fieldValue, type: fieldType } = e.target;
    if (fieldType === 'checkbox') {
      onChange(fieldName, (e.target as HTMLInputElement).checked);
    } else if (fieldType === 'number') {
      onChange(fieldName, parseFloat(fieldValue) || 0);
    } else {
      onChange(fieldName, fieldValue);
    }
  };

  const renderField = () => {
    switch (type) {
      case 'TEXT':
        return (
          <input
            type="text"
            id={name}
            name={name}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            required={isRequired}
            className={commonInputStyle}
            aria-describedby={`${name}-error`}
          />
        );
      case 'TEXTAREA':
        return (
          <textarea
            id={name}
            name={name}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            required={isRequired}
            rows={3}
            className={commonInputStyle}
            aria-describedby={`${name}-error`}
          />
        );
      case 'NUMBER':
        return (
          <input
            type="number"
            id={name}
            name={name}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            required={isRequired}
            step="any" // Allows decimals
            className={commonInputStyle}
            aria-describedby={`${name}-error`}
          />
        );
      case 'DATE':
        return (
          <input
            type="date"
            id={name}
            name={name}
            value={value || ''} // Expects YYYY-MM-DD format
            onChange={handleChange}
            required={isRequired}
            className={commonInputStyle}
            aria-describedby={`${name}-error`}
          />
        );
      case 'EMAIL':
        return (
          <input
            type="email"
            id={name}
            name={name}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            required={isRequired}
            className={commonInputStyle}
            aria-describedby={`${name}-error`}
          />
        );
      case 'URL':
        return (
          <input
            type="url"
            id={name}
            name={name}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            required={isRequired}
            className={commonInputStyle}
            aria-describedby={`${name}-error`}
          />
        );
      case 'SELECT':
        return (
          <select
            id={name}
            name={name}
            value={value || ''}
            onChange={handleChange}
            required={isRequired}
            className={`${commonInputStyle} bg-white`}
            aria-describedby={`${name}-error`}
          >
            <option value="">-- Select {label} --</option>
            {options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case 'CHECKBOX':
        return (
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={Boolean(value)}
              onChange={handleChange}
              required={isRequired}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              aria-describedby={`${name}-error`}
            />
            {/* Checkbox doesn't usually have a separate label text here, it's the main label */}
          </div>
        );
      default:
        return <p className="text-sm text-red-500">Unsupported field type: {type}</p>;
    }
  };

  return (
    <div className="col-span-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>
      {renderField()}
      {error && <p id={`${name}-error`} className={errorTextStyle}>{error}</p>}
    </div>
  );
};

export default CustomFieldRenderer;
