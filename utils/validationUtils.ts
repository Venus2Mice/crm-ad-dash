
import { CustomFieldDefinition } from '../types';

export const validateCustomField = (value: any, definition: CustomFieldDefinition): string | null => {
  const { label, isRequired, type } = definition;

  // 1. Required Check
  if (isRequired) {
    if (type === 'CHECKBOX') {
      if (value !== true) return `${label} is required.`;
    } else if (type === 'NUMBER') {
      if (value === null || value === undefined || value === '') return `${label} is required.`;
    } else {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${label} is required.`;
      }
    }
  }

  // Skip type validation if empty and not required
  if (!value && value !== 0 && value !== false) return null;

  // 2. Type Format Check
  if (type === 'EMAIL') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return `Invalid email format for ${label}.`;
  }

  if (type === 'URL') {
    // Basic URL regex allowing http/https or simple domain structures
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if(!urlRegex.test(value)) return `Invalid URL format for ${label}.`;
  }

  if (type === 'NUMBER') {
      if (isNaN(Number(value))) return `${label} must be a valid number.`;
  }

  return null;
};
