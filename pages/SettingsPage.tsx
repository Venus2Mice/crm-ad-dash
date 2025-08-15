
import React, { useState } from 'react';
import { User, UserRole, CompanySettings, CustomFieldDefinition } from '../types'; // Added CustomFieldDefinition
import UserProfileSettings from '../components/settings/UserProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import UserManagementSettings from '../components/settings/UserManagementSettings';
import SystemSettings from '../components/settings/SystemSettings';
import CustomFieldsSettings from '../components/settings/CustomFieldsSettings'; // Added
import { UserCircleIcon, ShieldCheckIcon, UsersIcon as UsersGroupIcon, CogIcon as Cog8ToothIcon, WrenchScrewdriverIcon } from '../components/ui/Icon'; // Added WrenchScrewdriverIcon


interface SettingsPageProps {
    currentUser: User | null;
    users: User[]; 
    onUpdateUserProfile: (updatedProfileData: Partial<Pick<User, 'name' | 'phone' | 'jobTitle' | 'avatarUrl'>>) => void;
    onUpdateUserRole: (userId: string, newRole: UserRole) => void;
    onAddNewUser: (newUserData: Omit<User, 'id' | 'avatarUrl'> & { password?: string }) => void;
    systemSettings: CompanySettings;
    onSaveSystemSettings: (settings: CompanySettings) => void;
    customFieldDefinitions: CustomFieldDefinition[];
    onAddCustomFieldDefinition: (definition: CustomFieldDefinition) => void;
    onUpdateCustomFieldDefinition: (definition: CustomFieldDefinition) => void;
    onDeleteCustomFieldDefinition: (definitionId: string) => void;
}

type SettingsTab = 'profile' | 'security' | 'userManagement' | 'systemSettings' | 'customFields'; // Added customFields

const SettingsPage: React.FC<SettingsPageProps> = ({ 
    currentUser, 
    users, 
    onUpdateUserProfile, 
    onUpdateUserRole,
    onAddNewUser,
    systemSettings,
    onSaveSystemSettings,
    customFieldDefinitions,
    onAddCustomFieldDefinition,
    onUpdateCustomFieldDefinition,
    onDeleteCustomFieldDefinition
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  if (!currentUser) {
    return <p className="text-center text-red-500">User not found. Please log in again.</p>;
  }

  const isAdmin = currentUser.role === 'admin';

  const tabs = [
    { id: 'profile', name: 'My Profile', icon: <UserCircleIcon className="h-5 w-5 mr-2" />, component: <UserProfileSettings currentUser={currentUser} onSave={onUpdateUserProfile} /> },
    { id: 'security', name: 'Security', icon: <ShieldCheckIcon className="h-5 w-5 mr-2" />, component: <SecuritySettings /> },
  ];

  if (isAdmin) {
    tabs.push({ 
        id: 'userManagement', 
        name: 'User Management', 
        icon: <UsersGroupIcon className="h-5 w-5 mr-2" />, 
        component: <UserManagementSettings 
                        users={users} 
                        onUpdateUserRole={onUpdateUserRole} 
                        currentUser={currentUser}
                        onAddNewUser={onAddNewUser}
                    /> 
    });
    tabs.push({ 
        id: 'systemSettings', 
        name: 'System Settings', 
        icon: <Cog8ToothIcon className="h-5 w-5 mr-2" />, 
        component: <SystemSettings 
                        currentSettings={systemSettings}
                        onSave={onSaveSystemSettings}
                    /> 
    });
    tabs.push({
        id: 'customFields',
        name: 'Custom Fields',
        icon: <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />,
        component: <CustomFieldsSettings
                        definitions={customFieldDefinitions}
                        onAddDefinition={onAddCustomFieldDefinition}
                        onUpdateDefinition={onUpdateCustomFieldDefinition}
                        onDeleteDefinition={onDeleteCustomFieldDefinition}
                   />
    });
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow min-h-[calc(100vh-150px)]">
      <h2 className="text-2xl font-semibold text-dark-text mb-6">Application Settings</h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs Navigation */}
        <div className="md:w-1/4">
          <nav className="space-y-1" aria-label="Settings tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150
                  ${activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="md:w-3/4">
          <div className="p-1 md:p-0">
            {tabs.find(tab => tab.id === activeTab)?.component}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
