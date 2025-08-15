
import React, { useState } from 'react';

const SecuritySettings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setMessage({ type: 'error', text: 'All password fields are required.'});
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.'});
      return;
    }
    // Mock password change
    console.log('Attempting to change password (mock):', { currentPassword, newPassword });
    setMessage({type: 'success', text: 'Password change functionality is not fully implemented in this mock version. Data logged to console.'});
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };
  
  const commonInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const commonLabelStyle = "block text-sm font-medium text-gray-700";

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <h3 className="text-lg font-semibold leading-6 text-gray-900">Password Settings</h3>
        <p className="mt-1 text-sm text-gray-500">Change your account password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="currentPassword" className={commonLabelStyle}>Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={commonInputStyle}
            required
            autoComplete="current-password"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className={commonLabelStyle}>New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={commonInputStyle}
            required
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="confirmNewPassword" className={commonLabelStyle}>Confirm New Password</label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className={commonInputStyle}
            required
            autoComplete="new-password"
          />
        </div>
        
        {message && (
          <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white font-semibold rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Update Password
          </button>
        </div>
      </form>

       <div className="mt-8 border-t pt-6">
          <h4 className="text-md font-semibold text-gray-800">Two-Factor Authentication (2FA)</h4>
          <p className="mt-1 text-sm text-gray-500">Enhance your account security by enabling 2FA.</p>
          <button
            type="button"
            disabled
            className="mt-3 px-4 py-2 bg-gray-200 text-gray-500 font-semibold rounded-md shadow-sm cursor-not-allowed"
          >
            Enable 2FA (Coming Soon)
          </button>
        </div>
    </div>
  );
};

export default SecuritySettings;
