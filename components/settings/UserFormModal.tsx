
import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { USER_ROLE_OPTIONS } from '../../constants';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUser: (userData: Omit<User, 'id' | 'avatarUrl'> & { password?: string }) => void;
  currentUser: User | null; // For context or future validation
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSaveUser, currentUser }) => {
  const [formData, setFormData] = useState<Omit<User, 'id' | 'avatarUrl'> & { password?: string }>({
    name: '',
    email: '',
    role: 'sales_rep', // Default role
    phone: '',
    jobTitle: '',
    password: '', // Mock password field
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Name, Email, and Password are required.');
      return;
    }
    // Basic email validation (can be more robust)
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setFormError('Please enter a valid email address.');
        return;
    }
    // Mock password length (can be expanded)
    if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters long.');
        return;
    }
    
    onSaveUser(formData);
    // Reset form for next use if needed, or handled by parent re-opening
    setFormData({
        name: '',
        email: '',
        role: 'sales_rep',
        phone: '',
        jobTitle: '',
        password: '',
    });
  };

  if (!isOpen) return null;

  const commonInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
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
        <h2 className="text-xl font-semibold text-dark-text mb-4">Add New User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className={commonLabelStyle}>Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={commonInputStyle} />
          </div>
          <div>
            <label htmlFor="email" className={commonLabelStyle}>Email Address <span className="text-red-500">*</span></label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={commonInputStyle} />
          </div>
          <div>
            <label htmlFor="password" className={commonLabelStyle}>Password <span className="text-red-500">*</span></label>
            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required className={commonInputStyle} autoComplete="new-password" />
            <p className="mt-1 text-xs text-gray-500">Min. 6 characters. This is a mock password field.</p>
          </div>
          <div>
            <label htmlFor="role" className={commonLabelStyle}>Role <span className="text-red-500">*</span></label>
            <select name="role" id="role" value={formData.role} onChange={handleChange} required className={`${commonInputStyle} bg-white`}>
              {USER_ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="phone" className={commonLabelStyle}>Phone Number (Optional)</label>
            <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleChange} className={commonInputStyle} />
          </div>
          <div>
            <label htmlFor="jobTitle" className={commonLabelStyle}>Job Title (Optional)</label>
            <input type="text" name="jobTitle" id="jobTitle" value={formData.jobTitle || ''} onChange={handleChange} className={commonInputStyle} />
          </div>

          {formError && (
            <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
              {formError}
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
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
