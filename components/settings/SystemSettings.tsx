
import React, { useState, useEffect } from 'react';
import { CompanySettings } from '../../types';

interface SystemSettingsProps {
  currentSettings: CompanySettings;
  onSave: (settings: CompanySettings) => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ currentSettings, onSave }) => {
  const [companyName, setCompanyName] = useState<string>(currentSettings.name);
  const [defaultCurrency, setDefaultCurrency] = useState<string>(currentSettings.defaultCurrency);
  // const [logoUrl, setLogoUrl] = useState<string | undefined>(currentSettings.logoUrl); // For future use

  useEffect(() => {
    setCompanyName(currentSettings.name);
    setDefaultCurrency(currentSettings.defaultCurrency);
    // setLogoUrl(currentSettings.logoUrl);
  }, [currentSettings]);

  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: companyName,
      defaultCurrency: defaultCurrency,
      logoUrl: currentSettings.logoUrl, // Preserve existing logoUrl if not editable yet
    });
  };

  const commonInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const commonLabelStyle = "block text-sm font-medium text-gray-700";

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <h3 className="text-lg font-semibold leading-6 text-gray-900">System Configuration</h3>
        <p className="mt-1 text-sm text-gray-500">Manage global settings for the CRM application.</p>
      </div>

      <form onSubmit={handleSaveSystemSettings} className="space-y-6">
        <div>
          <label htmlFor="companyName" className={commonLabelStyle}>Company Name</label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={commonInputStyle}
            required
          />
           <p className="mt-1 text-xs text-gray-500">This name will appear in communications and reports.</p>
        </div>

        <div>
          <label htmlFor="defaultCurrency" className={commonLabelStyle}>Default Currency</label>
          <select
            id="defaultCurrency"
            value={defaultCurrency}
            onChange={(e) => setDefaultCurrency(e.target.value)}
            className={commonInputStyle}
            required
          >
            <option value="USD">USD - United States Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">Default currency for new deals and financial reporting.</p>
        </div>
        
        {/* Logo Upload - Future
        <div>
          <label htmlFor="logoUrl" className={commonLabelStyle}>Company Logo URL (Optional)</label>
          <input
            type="text"
            id="logoUrl"
            value={logoUrl || ''}
            onChange={(e) => setLogoUrl(e.target.value)}
            className={commonInputStyle}
            placeholder="https://example.com/logo.png"
          />
          <p className="mt-1 text-xs text-gray-500">URL of your company logo for branding.</p>
        </div>
        */}
        
        <div className="pt-2">
            <button
                type="submit"
                className="px-4 py-2 bg-primary text-white font-semibold rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
                Save System Settings
            </button>
        </div>
      </form>

      <div className="mt-8 border-t pt-6">
        <h4 className="text-md font-semibold text-gray-800">Advanced Configuration</h4>
        <p className="mt-1 text-sm text-gray-500">
          Further system-level configurations will be available here in the future.
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-500 space-y-1">
            <li>Custom Fields Management (Leads, Customers, Deals)</li>
            <li>Integration Settings (e.g., Email Server, Calendar)</li>
            <li>Workflow Automation Rules</li>
            <li>Data Import/Export Management</li>
            <li>Security Policies (e.g., Password complexity)</li>
        </ul>
         <button
            type="button"
            disabled
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-500 font-semibold rounded-md shadow-sm cursor-not-allowed"
          >
            Access Advanced Settings (Coming Soon)
          </button>
      </div>
    </div>
  );
};

export default SystemSettings;
