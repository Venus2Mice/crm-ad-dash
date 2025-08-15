import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { USER_ROLE_OPTIONS } from '../../constants'; 
import UserFormModal from './UserFormModal'; 
import { PlusCircleIcon } from '../ui/Icon'; 
import Pagination, { ITEMS_PER_PAGE_OPTIONS } from '../ui/Pagination'; // Import Pagination

interface UserManagementSettingsProps {
  users: User[];
  currentUser: User; 
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onAddNewUser: (newUserData: Omit<User, 'id' | 'avatarUrl'> & { password?: string }) => void;
}

const UserManagementSettings: React.FC<UserManagementSettingsProps> = ({ users, currentUser, onUpdateUserRole, onAddNewUser }) => {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);

  // Paginated users
  const totalUsers = users.length; // Assuming all users are active and displayed
  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return users.slice(startIndex, startIndex + itemsPerPage);
  }, [users, currentPage, itemsPerPage]);


  const handleEditRoleClick = (user: User) => {
    setEditingUserId(user.id);
    setSelectedRole(user.role);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedRole('');
  };

  const handleSaveRole = (userId: string) => {
    if (selectedRole !== '') { 
      if (userId === currentUser.id && selectedRole !== 'admin') {
         if(!window.confirm("Warning: You are about to change your own role from Admin. This might restrict your access. Are you sure?")) {
            handleCancelEdit();
            return;
         }
      }
      onUpdateUserRole(userId, selectedRole); 
    }
    handleCancelEdit();
  };

  const handleOpenNewUserModal = () => {
    setIsUserFormModalOpen(true);
  };

  const handleSaveNewUser = (newUserData: Omit<User, 'id' | 'avatarUrl'> & { password?: string }) => {
    onAddNewUser(newUserData);
    setIsUserFormModalOpen(false);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const commonThStyle = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
  const commonTdStyle = "px-4 py-3 whitespace-nowrap text-sm";

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <h3 className="text-lg font-semibold leading-6 text-gray-900">User Management</h3>
        <p className="mt-1 text-sm text-gray-500">View and manage user accounts and their roles.</p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleOpenNewUserModal}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md shadow-sm flex items-center space-x-2 transition-colors duration-150"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Add New User</span>
        </button>
      </div>

      <div className="overflow-x-auto mt-4">
        {paginatedUsers.length === 0 && users.length > 0 ? (
            <p className="text-medium-text text-center py-4">No users on this page, adjust pagination or add users.</p>
        ) : users.length === 0 ? (
            <p className="text-medium-text text-center py-4">No users found. Add a new user to get started.</p>
        ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={commonThStyle}>Avatar</th>
              <th className={commonThStyle}>Name</th>
              <th className={commonThStyle}>Email</th>
              <th className={commonThStyle}>Role</th>
              <th className={commonThStyle + " hidden sm:table-cell"}>Phone</th>
              <th className={commonThStyle + " hidden md:table-cell"}>Job Title</th>
              <th className={commonThStyle}>Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className={`${commonTdStyle} text-gray-900`}>
                  <img 
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=40`}
                    alt={`${user.name}'s avatar`}
                    className="h-8 w-8 rounded-full"
                  />
                </td>
                <td className={`${commonTdStyle} font-medium text-gray-900`}>{user.name}</td>
                <td className={`${commonTdStyle} text-gray-500`}>{user.email}</td>
                <td className={`${commonTdStyle} text-gray-500`}>
                  {editingUserId === user.id ? (
                    <select 
                        value={selectedRole} 
                        onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                        className="p-1 border border-gray-300 rounded-md text-xs w-full max-w-[150px]"
                    >
                        {USER_ROLE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-red-100 text-red-800' 
                        : user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'}`}>
                        {USER_ROLE_OPTIONS.find(opt => opt.value === user.role)?.label || user.role}
                    </span>
                  )}
                </td>
                <td className={`${commonTdStyle} text-gray-500 hidden sm:table-cell`}>{user.phone || 'N/A'}</td>
                <td className={`${commonTdStyle} text-gray-500 hidden md:table-cell`}>{user.jobTitle || 'N/A'}</td>
                <td className={`${commonTdStyle} text-gray-500`}>
                  {editingUserId === user.id ? (
                    <div className="flex space-x-2">
                      <button onClick={() => handleSaveRole(user.id)} className="text-xs text-green-600 hover:text-green-800">Save</button>
                      <button onClick={handleCancelEdit} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                    </div>
                  ) : (
                     <button 
                        onClick={() => handleEditRoleClick(user)} 
                        className="text-primary hover:text-primary-dark text-xs font-medium"
                        aria-label={`Edit role for ${user.name}`}
                        disabled={user.id === currentUser.id && user.role === 'admin' && users.filter(u => u.role === 'admin').length <=1 && selectedRole !== 'admin'}
                        title={user.id === currentUser.id && user.role === 'admin' && users.filter(u => u.role === 'admin').length <=1 && selectedRole !== 'admin' ? "Cannot change role of the only admin." : ""}
                    >
                        Edit Role
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
      {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={totalUsers}
            entityName="users"
          />
        )}
      {isUserFormModalOpen && (
        <UserFormModal
          isOpen={isUserFormModalOpen}
          onClose={() => setIsUserFormModalOpen(false)}
          onSaveUser={handleSaveNewUser}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default UserManagementSettings;
