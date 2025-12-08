import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import CustomersPage from './pages/CustomersPage';
import SettingsPage from './pages/SettingsPage';
import DealsPage from './pages/DealsPage';
import TasksPage from './pages/TasksPage';
import ReportsPage from './pages/ReportsPage';
import ProductsPage from './pages/ProductsPage'; 
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ArchivePage from './pages/ArchivePage'; 
import ActivityLogPage from './pages/ActivityLogPage';
import ConfirmationModal from './components/ui/ConfirmationModal';
import { Lead, Customer, Deal, Task, Product, LeadStatus, DealStage, TaskStatus, GlobalSearchResult, EntityActivityLog, EntityActivityType, User, Attachment, UserRole, NotificationItem, CompanySettings, DealLineItem, NotificationType, ProductEditConfirmDetails, CustomFieldDefinition, CustomFieldEntityType } from './types'; // Added CustomFieldDefinition
import { MOCK_LEADS, MOCK_CUSTOMERS, MOCK_DEALS, MOCK_TASKS, MOCK_PRODUCTS, MOCK_USERS } from './constants'; 
import { canPerformAction } from './utils/permissions'; 

// Default system settings
const DEFAULT_SYSTEM_SETTINGS: CompanySettings = {
  name: "CRM Dashboard",
  defaultCurrency: "USD",
  logoUrl: undefined,
};

// Helper to load state from local storage or use default
const loadState = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error(`Error parsing ${key} from local storage`, e);
    return defaultValue;
  }
};

const App: React.FC = () => {
  // Initialize state from Local Storage or Mock Data
  const [leads, setLeads] = useState<Lead[]>(() => loadState('crm_leads', MOCK_LEADS));
  const [customers, setCustomers] = useState<Customer[]>(() => loadState('crm_customers', MOCK_CUSTOMERS));
  const [deals, setDeals] = useState<Deal[]>(() => loadState('crm_deals', MOCK_DEALS));
  const [tasks, setTasks] = useState<Task[]>(() => loadState('crm_tasks', MOCK_TASKS));
  const [products, setProducts] = useState<Product[]>(() => loadState('crm_products', MOCK_PRODUCTS)); 
  const [activityLogs, setActivityLogs] = useState<EntityActivityLog[]>(() => loadState('crm_activity_logs', []));
  const [users, setUsers] = useState<User[]>(() => loadState('crm_users', MOCK_USERS));
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  const [systemSettings, setSystemSettings] = useState<CompanySettings>(() => loadState('systemSettings', DEFAULT_SYSTEM_SETTINGS));
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<CustomFieldDefinition[]>(() => loadState('customFieldDefinitions', []));


  // State for product edit confirmation
  const [isProductEditConfirmModalOpen, setIsProductEditConfirmModalOpen] = useState(false);
  const [productEditConfirmDetails, setProductEditConfirmDetails] = useState<ProductEditConfirmDetails | null>(null);

  // State for specific access denied modal
  const [isAccessDeniedModalOpen, setIsAccessDeniedModalOpen] = useState(false);
  const [accessDeniedModalMessage, setAccessDeniedModalMessage] = useState('');


  const todayDateString = () => new Date().toISOString().split('T')[0];
  const nowISO = () => new Date().toISOString();
  
  // Persistence Effects
  useEffect(() => { localStorage.setItem('crm_leads', JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem('crm_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('crm_deals', JSON.stringify(deals)); }, [deals]);
  useEffect(() => { localStorage.setItem('crm_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('crm_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('crm_activity_logs', JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem('crm_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('systemSettings', JSON.stringify(systemSettings)); }, [systemSettings]);
  useEffect(() => { localStorage.setItem('customFieldDefinitions', JSON.stringify(customFieldDefinitions)); }, [customFieldDefinitions]);


  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        const storedNotifications = localStorage.getItem(`notifications_${parsedUser.id}`);
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        }
      } catch (error) {
        console.error("Failed to parse stored user or notifications:", error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const notificationsForCurrentUser = notifications.filter(n => n.userId === currentUser.id);
      localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(notificationsForCurrentUser));
    }
  }, [notifications, currentUser]);


  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all application data to defaults? This cannot be undone.")) {
        localStorage.removeItem('crm_leads');
        localStorage.removeItem('crm_customers');
        localStorage.removeItem('crm_deals');
        localStorage.removeItem('crm_tasks');
        localStorage.removeItem('crm_products');
        localStorage.removeItem('crm_activity_logs');
        localStorage.removeItem('crm_users');
        localStorage.removeItem('systemSettings');
        localStorage.removeItem('customFieldDefinitions');
        // We do NOT remove currentUser to keep them logged in
        
        window.location.reload();
    }
  };


  const addActivityLog = useCallback((
      entityId: string,
      entityType: EntityActivityLog['entityType'],
      activityType: EntityActivityType,
      description: string,
      details?: EntityActivityLog['details']
  ) => {
      const newLog: EntityActivityLog = {
          id: `log-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          timestamp: nowISO(),
          entityId,
          entityType,
          userId: currentUser?.id || 'system-user',
          userName: currentUser?.name || 'System', 
          activityType,
          description,
          details,
      };
      setActivityLogs(prevLogs => [newLog, ...prevLogs]);
  }, [currentUser]);


  const handleLogin = useCallback((email: string, password?: string): User | null => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && password) { 
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
       const newLog: EntityActivityLog = {
          id: `log-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          timestamp: nowISO(),
          entityId: user.id,
          entityType: 'User',
          userId: user.id, 
          userName: user.name, 
          activityType: EntityActivityType.LOGIN,
          description: `${user.name} logged in.`,
      };
      setActivityLogs(prevLogs => [newLog, ...prevLogs]);
      const storedNotifications = localStorage.getItem(`notifications_${user.id}`);
      if (storedNotifications) {
        try { setNotifications(JSON.parse(storedNotifications)); } catch(e) { console.error("Parse error login notif:", e); setNotifications([]);}
      } else { setNotifications([]); }
      return user;
    }
    return null;
  }, [users]); 

  const handleLogout = useCallback(() => {
    if (currentUser) { addActivityLog(currentUser.id, 'User', EntityActivityType.LOGOUT, `${currentUser.name} logged out.`); }
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setNotifications([]); 
  }, [currentUser, addActivityLog]);


  const addNotification = useCallback((
    targetUserId: string, type: NotificationType, title: string, message: string, link?: string
  ) => {
    if (!targetUserId) return;
    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: nowISO(), userId: targetUserId, type, title, message, isRead: false, link,
      actor: currentUser ? { id: currentUser.id, name: currentUser.name } : undefined,
    };
    const storageKey = `notifications_${targetUserId}`;
    let existingTargetNotifications: NotificationItem[] = [];
    const storedNotificationsStr = localStorage.getItem(storageKey);
    if (storedNotificationsStr) {
      try { existingTargetNotifications = JSON.parse(storedNotificationsStr); } catch (e) { console.error("Parse error add notif:", e);}
    }
    const isDuplicate = existingTargetNotifications.some(
      (n) => n.type === type && n.title === title && n.message === message && n.link === link && n.actor?.id === newNotification.actor?.id &&
      (new Date(n.timestamp).getTime() > new Date().getTime() - 5000) 
    );
    if (isDuplicate) {
      if (currentUser && currentUser.id === targetUserId) { setNotifications(existingTargetNotifications); }
      return;
    }
    const updatedTargetNotifications = [newNotification, ...existingTargetNotifications];
    localStorage.setItem(storageKey, JSON.stringify(updatedTargetNotifications));
    if (currentUser && currentUser.id === targetUserId) { setNotifications(updatedTargetNotifications); }
  }, [currentUser]); 

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    if (currentUser) { setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, isRead: true } : n)); }
  }, [currentUser]);


  const handleUpdateUserProfile = (updatedProfileData: Partial<Pick<User, 'name' | 'phone' | 'jobTitle' | 'avatarUrl'>>) => {
    if (!canPerformAction(currentUser, 'UPDATE', 'User', currentUser)) { alert("Permission Denied."); return; }
    if (currentUser) {
      const oldAvatarUrl = currentUser.avatarUrl;
      const newAvatarUrl = updatedProfileData.avatarUrl === undefined && 'avatarUrl' in updatedProfileData 
                           ? null : updatedProfileData.avatarUrl || currentUser.avatarUrl;
      const updatedUser = { ...currentUser, ...updatedProfileData, avatarUrl: newAvatarUrl || undefined };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
      addActivityLog(currentUser.id, 'User', EntityActivityType.PROFILE_UPDATED, `${currentUser.name} updated their profile.`);
      if (newAvatarUrl !== oldAvatarUrl) {
        if (newAvatarUrl && newAvatarUrl.startsWith('data:image')) { addActivityLog(currentUser.id, 'User', EntityActivityType.PROFILE_UPDATED, `${currentUser.name} changed their avatar.`);
        } else if (!newAvatarUrl && oldAvatarUrl) { addActivityLog(currentUser.id, 'User', EntityActivityType.PROFILE_UPDATED, `${currentUser.name} removed their custom avatar.`);}
      }
      addNotification(currentUser.id, NotificationType.INFO, "Profile Updated", "Your profile information has been successfully updated.");
      alert('Profile updated successfully!'); 
    }
  };

  const handleUpdateUserRole = (userIdToUpdate: string, newRole: UserRole) => {
    const targetUserForPermCheck = users.find(u => u.id === userIdToUpdate);
    if (!canPerformAction(currentUser, 'UPDATE', 'User', targetUserForPermCheck)) { alert("Permission Denied."); return; }
    if (currentUser && currentUser.role === 'admin') {
      const targetUser = users.find(u => u.id === userIdToUpdate);
      setUsers(prevUsers => prevUsers.map(user => user.id === userIdToUpdate ? { ...user, role: newRole } : user));
      if (currentUser.id === userIdToUpdate) {
        const updatedCurrentUser = { ...currentUser, role: newRole };
        setCurrentUser(updatedCurrentUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
      }
      addActivityLog(currentUser.id, 'User', EntityActivityType.ROLE_CHANGED, 
        `Role of user ${targetUser?.name || userIdToUpdate} changed to ${newRole} by ${currentUser.name}.`,
        { targetUserId: userIdToUpdate, targetUserName: targetUser?.name, field: 'role', newValue: newRole }
      );
       if (targetUser) { addNotification(targetUser.id, NotificationType.INFO, "Your Role Has Changed", `Your role was updated to "${newRole}" by ${currentUser.name}.`); }
      alert(`Role for user ${targetUser?.name || userIdToUpdate} updated to ${newRole}.`);
    } else { alert("You don't have permission."); }
  };

  const handleAddNewUser = (newUserData: Omit<User, 'id' | 'avatarUrl'> & { password?: string }) => {
    if (!canPerformAction(currentUser, 'CREATE', 'User')) { alert("Permission Denied."); return; }
    if (currentUser && currentUser.role === 'admin') {
        const { password, ...coreUserData } = newUserData; 
        const newUserId = `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const newUser: User = {
            ...coreUserData, id: newUserId,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(coreUserData.name)}&background=random&color=fff&size=128`,
        };
        setUsers(prevUsers => [newUser, ...prevUsers]);
        addActivityLog(currentUser.id, 'User', EntityActivityType.CREATED, `New user '${newUser.name}' created by ${currentUser.name}.`, { targetUserId: newUser.id, targetUserName: newUser.name });
        addNotification(currentUser.id, NotificationType.SUCCESS, "User Created", `You successfully created user: ${newUser.name}.`);
        addNotification(newUser.id, NotificationType.INFO, "Welcome!", `Your account has been created by ${currentUser.name}. Your role is ${newUser.role}.`);
        alert(`User ${newUser.name} created successfully!`);
    } else { alert("You don't have permission."); }
  };
  
  const handleSaveSystemSettings = (newSettings: CompanySettings) => {
    if (!canPerformAction(currentUser, 'UPDATE', 'System')) { 
      alert("Permission Denied: You cannot update system settings.");
      return;
    }
    const changes: {field: string, oldValue: string, newValue: string}[] = [];
    if (systemSettings.name !== newSettings.name) {
        changes.push({field: 'Company Name', oldValue: systemSettings.name, newValue: newSettings.name});
    }
    if (systemSettings.defaultCurrency !== newSettings.defaultCurrency) {
        changes.push({field: 'Default Currency', oldValue: systemSettings.defaultCurrency, newValue: newSettings.defaultCurrency});
    }
    setSystemSettings(newSettings); 
    
    if (changes.length > 0) {
        const changeDescriptions = changes.map(c => `${c.field} from '${c.oldValue}' to '${c.newValue}'`).join(', ');
        addActivityLog('system', 'System', EntityActivityType.SYSTEM_SETTINGS_UPDATED, `System settings updated: ${changeDescriptions}.`);
    } else {
        addActivityLog('system', 'System', EntityActivityType.SYSTEM_SETTINGS_UPDATED, 'System settings saved (no changes detected).');
    }
    alert('System settings updated successfully!');
  };

  const processMentions = (notes: string | undefined, entityName: string, entityTypeLabel: 'Lead' | 'Customer' | 'Deal' | 'Task', entityLink: string) => {
    if (!notes || !currentUser) return;
    const mentionRegex = /@([\w-]+)/g; 
    let match;
    const mentionedUserIds = new Set<string>();

    while ((match = mentionRegex.exec(notes)) !== null) {
        const username = match[1].toLowerCase();
        const mentionedUser = users.find(u => 
            u.name.toLowerCase() === username || 
            u.email.split('@')[0].toLowerCase() === username
        );
        
        if (mentionedUser && mentionedUser.id !== currentUser.id) {
            mentionedUserIds.add(mentionedUser.id);
        }
    }

    mentionedUserIds.forEach(userId => {
        addNotification(
            userId,
            NotificationType.MENTION,
            `You were mentioned in ${entityTypeLabel}: ${entityName}`,
            `${currentUser.name} mentioned you in the notes for ${entityTypeLabel.toLowerCase()} "${entityName}".`,
            entityLink
        );
    });
  };
  
  const logCustomFieldChanges = (
    entityId: string,
    entityType: CustomFieldEntityType,
    entityName: string,
    oldCustomFields: Record<string, any> | undefined,
    newCustomFields: Record<string, any> | undefined,
    fieldDefinitions: CustomFieldDefinition[]
  ) => {
    const allFieldNames = new Set([
      ...Object.keys(oldCustomFields || {}),
      ...Object.keys(newCustomFields || {}),
    ]);

    allFieldNames.forEach(fieldName => {
      const oldValue = oldCustomFields?.[fieldName];
      const newValue = newCustomFields?.[fieldName];
      const fieldDef = fieldDefinitions.find(def => def.name === fieldName && def.entityType === entityType);
      const fieldLabel = fieldDef?.label || fieldName;

      if (oldValue !== newValue) {
        addActivityLog(
          entityId,
          entityType,
          EntityActivityType.CUSTOM_FIELD_UPDATED,
          `Custom field '${fieldLabel}' for ${entityType.toLowerCase()} '${entityName}' updated.`,
          { customFieldLabel: fieldLabel, oldValue: String(oldValue ?? ''), newValue: String(newValue ?? '') }
        );
      }
    });
  };


  const handleSaveLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastContacted' | 'attachments' | 'isDeleted' | 'deletedAt'> & { id?: string; newAttachments?: File[]; removedAttachmentIds?: string[]; customFields?: Record<string, any>; }) => {
    const { newAttachments, removedAttachmentIds, customFields, ...coreLeadData } = leadData;
    if (coreLeadData.id) { 
      const oldLead = leads.find(l => l.id === coreLeadData.id && !l.isDeleted);
      if (!oldLead) return;
      if (!canPerformAction(currentUser, 'UPDATE', 'Lead', oldLead)) { alert("Permission Denied."); return; }
      let updatedAttachments = [...(oldLead.attachments || [])];
      if (removedAttachmentIds?.length) {
        updatedAttachments = updatedAttachments.map(att => removedAttachmentIds.includes(att.id) ? { ...att, isDeleted: true, deletedAt: nowISO() } : att);
        removedAttachmentIds.forEach(id => { const att = oldLead.attachments?.find(a=>a.id===id); if(att && !att.isDeleted) addActivityLog(coreLeadData.id!, 'Lead', EntityActivityType.FILE_REMOVED, `File '${att.filename}' removed from lead '${oldLead.name}'.`, { fileName: att.filename }); });
      }
      if (newAttachments?.length && currentUser) {
        const newlyAddedAttachments: Attachment[] = newAttachments.map(file => ({ id: `att-${Date.now()}-${Math.random().toString(16).slice(2)}`, filename: file.name, mimeType: file.type, size: file.size, url: `#mock-url/${file.name}`, uploadedAt: nowISO(), uploadedBy: currentUser.name, isDeleted: false, }));
        updatedAttachments = [...updatedAttachments, ...newlyAddedAttachments];
        newlyAddedAttachments.forEach(att => addActivityLog(coreLeadData.id!, 'Lead', EntityActivityType.FILE_ATTACHED, `File '${att.filename}' attached to lead '${oldLead.name}'.`,{ fileName: att.filename, fileSize: att.size }));
      }
      const updatedLead: Lead = { ...oldLead, ...coreLeadData, customFields, attachments: updatedAttachments, lastContacted: todayDateString() };
      setLeads(currentLeads => currentLeads.map(lead => lead.id === coreLeadData.id ? updatedLead : lead));
      
      if (oldLead.status !== coreLeadData.status) { addActivityLog(coreLeadData.id, 'Lead', EntityActivityType.STATUS_UPDATED, `Status from '${oldLead.status}' to '${coreLeadData.status}'.`, { field: 'status', oldValue: oldLead.status, newValue: coreLeadData.status }); }
      if (oldLead.notes !== coreLeadData.notes) { addActivityLog(coreLeadData.id, 'Lead', EntityActivityType.NOTE_UPDATED, `Notes updated for lead '${coreLeadData.name}'.`); }
      logCustomFieldChanges(updatedLead.id, 'Lead', updatedLead.name, oldLead.customFields, updatedLead.customFields, customFieldDefinitions);
      
      processMentions(coreLeadData.notes, coreLeadData.name, 'Lead', `/leads?search=${encodeURIComponent(coreLeadData.name)}`);
      
      const assignedUser = users.find(u => u.name === coreLeadData.assignedTo);
      if (assignedUser && assignedUser.id !== currentUser?.id) { 
         if (oldLead.assignedTo !== coreLeadData.assignedTo) { addNotification(assignedUser.id, NotificationType.LEAD_ASSIGNED, `Lead Assigned: ${coreLeadData.name}`, `Lead: "${coreLeadData.name}".`, `/leads?search=${encodeURIComponent(coreLeadData.name)}`);}
         else if (oldLead.status !== coreLeadData.status) { addNotification(assignedUser.id, NotificationType.LEAD_UPDATED, `Lead Updated: ${coreLeadData.name}`, `Status of "${coreLeadData.name}" to ${coreLeadData.status}.`, `/leads?search=${encodeURIComponent(coreLeadData.name)}`);}
      }
    } else { 
      if (!canPerformAction(currentUser, 'CREATE', 'Lead')) { alert("Permission Denied."); return; }
      const newLeadId = `lead-${Date.now()}`;
      let leadAttachments: Attachment[] = [];
      if (newAttachments?.length && currentUser) { leadAttachments = newAttachments.map(file => ({ id: `att-${Date.now()}-${Math.random().toString(16).slice(2)}`, filename: file.name, mimeType: file.type, size: file.size, url: `#mock-url/${file.name}`, uploadedAt: nowISO(), uploadedBy: currentUser.name, isDeleted: false, })); }
      const newLead: Lead = { ...(coreLeadData as Omit<Lead, 'id' | 'createdAt' | 'lastContacted' | 'attachments' | 'isDeleted' | 'deletedAt' | 'customFields'>), id: newLeadId, createdAt: todayDateString(), lastContacted: todayDateString(), status: coreLeadData.status || LeadStatus.NEW, assignedTo: coreLeadData.assignedTo || currentUser?.name || 'Unassigned', attachments: leadAttachments, customFields, isDeleted: false, };
      setLeads(currentLeads => [newLead, ...currentLeads]);
      addActivityLog(newLead.id, 'Lead', EntityActivityType.CREATED, `Lead '${newLead.name}' created.`);
      if (newLead.notes) { addActivityLog(newLead.id, 'Lead', EntityActivityType.NOTE_ADDED, `Note added to lead '${newLead.name}'.`); }
      logCustomFieldChanges(newLead.id, 'Lead', newLead.name, {}, newLead.customFields, customFieldDefinitions);
      
      processMentions(newLead.notes, newLead.name, 'Lead', `/leads?search=${encodeURIComponent(newLead.name)}`);

      leadAttachments.forEach(att => addActivityLog(newLead.id, 'Lead', EntityActivityType.FILE_ATTACHED, `File '${att.filename}' attached to lead '${newLead.name}'.`, { fileName: att.filename, fileSize: att.size }));
      const assignedUser = users.find(u => u.name === newLead.assignedTo);
      if (assignedUser && assignedUser.id !== currentUser?.id) { addNotification(assignedUser.id, NotificationType.LEAD_ASSIGNED, `New Lead: ${newLead.name}`, `Assigned new lead: "${newLead.name}".`, `/leads?search=${encodeURIComponent(newLead.name)}`); }
    }
  };

  const handleDeleteLead = (leadId: string) => {
    const leadToSoftDelete = leads.find(l => l.id === leadId && !l.isDeleted);
    if (leadToSoftDelete) {
        if (!canPerformAction(currentUser, 'DELETE', 'Lead', leadToSoftDelete)) { alert("Permission Denied."); return; }
        setLeads(currentLeads => currentLeads.map(lead => lead.id === leadId ? { ...lead, isDeleted: true, deletedAt: nowISO() } : lead));
        addActivityLog(leadId, 'Lead', EntityActivityType.SOFT_DELETED, `Lead '${leadToSoftDelete.name}' moved to trash.`);
    }
  };

  const handleRestoreLead = (leadId: string) => {
    const leadToRestore = leads.find(l => l.id === leadId && l.isDeleted);
    if(leadToRestore){
        setLeads(currentLeads => currentLeads.map(lead => lead.id === leadId ? { ...lead, isDeleted: false, deletedAt: undefined } : lead));
        addActivityLog(leadId, 'Lead', EntityActivityType.RESTORED, `Lead '${leadToRestore.name}' restored from trash.`);
    }
  };

  const handlePermanentDeleteLead = (leadId: string) => {
    const leadToDelete = leads.find(l => l.id === leadId && l.isDeleted);
     if (leadToDelete) {
        if (currentUser?.role !== 'admin') { alert("Permission Denied."); return; }
        setLeads(currentLeads => currentLeads.filter(lead => lead.id !== leadId));
        addActivityLog(leadId, 'Lead', EntityActivityType.PERMANENTLY_DELETED, `Lead '${leadToDelete.name}' permanently deleted.`);
     }
  };

  const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'lastPurchaseDate' | 'totalRevenue' | 'attachments' | 'isDeleted' | 'deletedAt'> & { id?: string; newAttachments?: File[]; removedAttachmentIds?: string[]; customFields?: Record<string, any>; }) => {
    const { newAttachments, removedAttachmentIds, customFields, ...coreCustomerData } = customerData;
    if (coreCustomerData.id) { 
      const oldCustomer = customers.find(c => c.id === coreCustomerData.id && !c.isDeleted);
      if (!oldCustomer) return;
      
      if (!canPerformAction(currentUser, 'UPDATE', 'Customer', oldCustomer)) {
        if (currentUser?.role === 'sales_rep' && oldCustomer?.accountManager !== currentUser?.name) {
          setAccessDeniedModalMessage(`Access Denied: You can only update customers assigned to you. This customer, "${oldCustomer.name}", is managed by ${oldCustomer?.accountManager || 'another user'}.`);
        } else {
          setAccessDeniedModalMessage("Permission Denied: You do not have the necessary permissions to update this customer.");
        }
        setIsAccessDeniedModalOpen(true);
        return;
      }

      let updatedAttachments = [...(oldCustomer.attachments || [])];
      if (removedAttachmentIds?.length) {
        updatedAttachments = updatedAttachments.map(att => removedAttachmentIds.includes(att.id) ? { ...att, isDeleted: true, deletedAt: nowISO() } : att);
        removedAttachmentIds.forEach(id => { const att = oldCustomer.attachments?.find(a=>a.id===id); if(att && !att.isDeleted) addActivityLog(coreCustomerData.id!, 'Customer', EntityActivityType.FILE_REMOVED, `File '${att.filename}' removed from customer '${oldCustomer.name}'.`, { fileName: att.filename }); });
      }
      if (newAttachments?.length && currentUser) {
        const newlyAddedAttachments: Attachment[] = newAttachments.map(file => ({ id: `att-${Date.now()}-${Math.random().toString(16).slice(2)}`, filename: file.name, mimeType: file.type, size: file.size, url: `#mock-url/${file.name}`, uploadedAt: nowISO(), uploadedBy: currentUser.name, isDeleted: false, }));
        updatedAttachments = [...updatedAttachments, ...newlyAddedAttachments];
        newlyAddedAttachments.forEach(att => addActivityLog(coreCustomerData.id!, 'Customer', EntityActivityType.FILE_ATTACHED, `File '${att.filename}' attached to customer '${oldCustomer.name}'.`,{ fileName: att.filename, fileSize: att.size }));
      }
      const updatedCustomer: Customer = { ...oldCustomer, ...coreCustomerData, customFields, attachments: updatedAttachments };
      setCustomers(currentCustomers => currentCustomers.map(customer => customer.id === coreCustomerData.id ? updatedCustomer : customer));
      
      if (oldCustomer.notes !== coreCustomerData.notes) { addActivityLog(coreCustomerData.id, 'Customer', EntityActivityType.NOTE_UPDATED, `Notes updated for customer '${coreCustomerData.name}'.`); }
      logCustomFieldChanges(updatedCustomer.id, 'Customer', updatedCustomer.name, oldCustomer.customFields, updatedCustomer.customFields, customFieldDefinitions);
      
      processMentions(coreCustomerData.notes, coreCustomerData.name, 'Customer', `/customers?search=${encodeURIComponent(coreCustomerData.name)}`);

      const assignedManager = users.find(u => u.name === coreCustomerData.accountManager);
      if (assignedManager && assignedManager.id !== currentUser?.id) { 
          if(oldCustomer.accountManager !== coreCustomerData.accountManager) { addNotification(assignedManager.id, NotificationType.INFO, `New Customer Assignment: ${coreCustomerData.name}`, `You are now the account manager for "${coreCustomerData.name}".`, `/customers?search=${encodeURIComponent(coreCustomerData.name)}`); }
          else { addNotification(assignedManager.id, NotificationType.INFO, `Customer Updated: ${coreCustomerData.name}`, `Details for customer "${coreCustomerData.name}" were updated by ${currentUser?.name || 'a user'}.`, `/customers?search=${encodeURIComponent(coreCustomerData.name)}`);}
      }
    } else { 
      if (!canPerformAction(currentUser, 'CREATE', 'Customer')) { alert("Permission Denied."); return; }
      const newCustomerId = `cust-${Date.now()}`;
      let customerAttachments: Attachment[] = [];
      if (newAttachments?.length && currentUser) { customerAttachments = newAttachments.map(file => ({ id: `att-${Date.now()}-${Math.random().toString(16).slice(2)}`, filename: file.name, mimeType: file.type, size: file.size, url: `#mock-url/${file.name}`, uploadedAt: nowISO(), uploadedBy: currentUser.name, isDeleted: false, })); }
      const newCustomer: Customer = { ...(coreCustomerData as Omit<Customer, 'id' | 'createdAt' | 'lastPurchaseDate' | 'totalRevenue' | 'attachments' | 'isDeleted' | 'deletedAt' | 'customFields'>), id: newCustomerId, createdAt: todayDateString(), accountManager: coreCustomerData.accountManager || currentUser?.name || 'Unassigned', attachments: customerAttachments, customFields, isDeleted: false, };
      setCustomers(currentCustomers => [newCustomer, ...currentCustomers]);
      addActivityLog(newCustomer.id, 'Customer', EntityActivityType.CREATED, `Customer '${newCustomer.name}' created.`);
      if (newCustomer.notes) { addActivityLog(newCustomer.id, 'Customer', EntityActivityType.NOTE_ADDED, `Note added for customer '${newCustomer.name}'.`); }
      logCustomFieldChanges(newCustomer.id, 'Customer', newCustomer.name, {}, newCustomer.customFields, customFieldDefinitions);
      
      processMentions(newCustomer.notes, newCustomer.name, 'Customer', `/customers?search=${encodeURIComponent(newCustomer.name)}`);
      
      customerAttachments.forEach(att => addActivityLog(newCustomer.id, 'Customer', EntityActivityType.FILE_ATTACHED, `File '${att.filename}' attached to customer '${newCustomer.name}'.`, { fileName: att.filename, fileSize: att.size }));
       const assignedManager = users.find(u => u.name === newCustomer.accountManager);
       if (assignedManager && assignedManager.id !== currentUser?.id) { addNotification(assignedManager.id, NotificationType.INFO, `New Customer Assignment: ${newCustomer.name}`, `You have been assigned as the account manager for new customer "${newCustomer.name}".`, `/customers?search=${encodeURIComponent(newCustomer.name)}`);}
    }
  };

  const handleDeleteCustomer = (customerId: string) => {
    const customerToSoftDelete = customers.find(c => c.id === customerId && !c.isDeleted);
    if(customerToSoftDelete){
        if (!canPerformAction(currentUser, 'DELETE', 'Customer', customerToSoftDelete)) { alert("Permission Denied."); return; }
        setCustomers(currentCustomers => currentCustomers.map(customer => customer.id === customerId ? { ...customer, isDeleted: true, deletedAt: nowISO() } : customer));
        addActivityLog(customerId, 'Customer', EntityActivityType.SOFT_DELETED, `Customer '${customerToSoftDelete.name}' moved to trash.`);
    }
  };

  const handleRestoreCustomer = (customerId: string) => {
    const customerToRestore = customers.find(c => c.id === customerId && c.isDeleted);
    if(customerToRestore){
        setCustomers(currentCustomers => currentCustomers.map(customer => customer.id === customerId ? { ...customer, isDeleted: false, deletedAt: undefined } : customer));
        addActivityLog(customerId, 'Customer', EntityActivityType.RESTORED, `Customer '${customerToRestore.name}' restored from trash.`);
    }
  };

  const handlePermanentDeleteCustomer = (customerId: string) => {
    const customerToDelete = customers.find(c => c.id === customerId && c.isDeleted);
    if (customerToDelete) {
        if (currentUser?.role !== 'admin') { alert("Permission Denied."); return; }
        setCustomers(currentCustomers => currentCustomers.filter(customer => customer.id !== customerId));
        addActivityLog(customerId, 'Customer', EntityActivityType.PERMANENTLY_DELETED, `Customer '${customerToDelete.name}' permanently deleted.`);
    }
  };

  const handleSaveDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'attachments' | 'isDeleted' | 'deletedAt'> & { id?: string; newAttachments?: File[]; removedAttachmentIds?: string[]; lineItems?: DealLineItem[]; customFields?: Record<string, any>; }) => {
    const { newAttachments, removedAttachmentIds, lineItems, customFields, ...coreDealData } = dealData;
    
    let finalValue = coreDealData.value;
    let finalCurrency = coreDealData.currency || systemSettings.defaultCurrency;

    if (lineItems && lineItems.length > 0) {
        finalValue = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
        finalCurrency = lineItems[0].currency || systemSettings.defaultCurrency;
    }


    if (coreDealData.id) { 
      const oldDeal = deals.find(d => d.id === coreDealData.id && !d.isDeleted);
      if (!oldDeal) return;
      if (!canPerformAction(currentUser, 'UPDATE', 'Deal', oldDeal)) { alert("Permission Denied."); return; }
      
      let updatedAttachments = [...(oldDeal.attachments || [])];
      if (removedAttachmentIds?.length) {
        updatedAttachments = updatedAttachments.map(att => removedAttachmentIds.includes(att.id) ? { ...att, isDeleted: true, deletedAt: nowISO() } : att);
        removedAttachmentIds.forEach(id => { const att = oldDeal.attachments?.find(a=>a.id===id); if(att && !att.isDeleted) addActivityLog(coreDealData.id!, 'Deal', EntityActivityType.FILE_REMOVED, `File '${att.filename}' removed from deal '${oldDeal.dealName}'.`, { fileName: att.filename }); });
      }
      if (newAttachments?.length && currentUser) {
        const newlyAddedAttachments: Attachment[] = newAttachments.map(file => ({ id: `att-${Date.now()}-${Math.random().toString(16).slice(2)}`, filename: file.name, mimeType: file.type, size: file.size, url: `#mock-url/${file.name}`, uploadedAt: nowISO(), uploadedBy: currentUser.name, isDeleted: false, }));
        updatedAttachments = [...updatedAttachments, ...newlyAddedAttachments];
        newlyAddedAttachments.forEach(att => addActivityLog(coreDealData.id!, 'Deal', EntityActivityType.FILE_ATTACHED, `File '${att.filename}' attached to deal '${oldDeal.dealName}'.`,{ fileName: att.filename, fileSize: att.size }));
      }
      
      const updatedDeal: Deal = { 
          ...oldDeal, 
          ...coreDealData, 
          value: finalValue, 
          currency: finalCurrency, 
          attachments: updatedAttachments, 
          lineItems: lineItems || oldDeal.lineItems,
          customFields,
        };
      setDeals(currentDeals => currentDeals.map(deal => deal.id === coreDealData.id ? updatedDeal : deal));

      if (oldDeal.stage !== updatedDeal.stage) { addActivityLog(updatedDeal.id, 'Deal', EntityActivityType.STAGE_UPDATED, `Stage from '${oldDeal.stage}' to '${updatedDeal.stage}'.`, { field: 'stage', oldValue: oldDeal.stage, newValue: updatedDeal.stage }); }
      if (oldDeal.value !== updatedDeal.value || oldDeal.currency !== updatedDeal.currency) { addActivityLog(updatedDeal.id, 'Deal', EntityActivityType.FIELD_UPDATED, `Value from ${oldDeal.currency}${oldDeal.value} to ${updatedDeal.currency}${updatedDeal.value}.`, { field: 'value', oldValue: `${oldDeal.currency}${oldDeal.value}`, newValue: `${updatedDeal.currency}${updatedDeal.value}` }); }
      if (oldDeal.notes !== updatedDeal.notes) { addActivityLog(updatedDeal.id, 'Deal', EntityActivityType.NOTE_UPDATED, `Notes updated for deal '${updatedDeal.dealName}'.`); }
      logCustomFieldChanges(updatedDeal.id, 'Deal', updatedDeal.dealName, oldDeal.customFields, updatedDeal.customFields, customFieldDefinitions);
      
      processMentions(updatedDeal.notes, updatedDeal.dealName, 'Deal', `/deals?search=${encodeURIComponent(updatedDeal.dealName)}`);
      
      const dealOwner = users.find(u => u.name === updatedDeal.owner);
      if (dealOwner && dealOwner.id !== currentUser?.id) { 
          if (oldDeal.owner !== updatedDeal.owner) { addNotification(dealOwner.id, NotificationType.DEAL_ASSIGNED, `Deal Reassigned: ${updatedDeal.dealName}`, `You are owner of: "${updatedDeal.dealName}".`, `/deals?search=${encodeURIComponent(updatedDeal.dealName)}`); }
          else if (oldDeal.stage !== updatedDeal.stage) { addNotification(dealOwner.id, NotificationType.DEAL_UPDATED, `Deal Stage: ${updatedDeal.dealName}`, `Stage of "${updatedDeal.dealName}" to ${updatedDeal.stage}.`, `/deals?search=${encodeURIComponent(updatedDeal.dealName)}`);}
      }
    } else { 
      if (!canPerformAction(currentUser, 'CREATE', 'Deal')) { alert("Permission Denied."); return; }
      const newDealId = `deal-${Date.now()}`;
      let dealAttachments: Attachment[] = [];
      if (newAttachments?.length && currentUser) { dealAttachments = newAttachments.map(file => ({ id: `att-${Date.now()}-${Math.random().toString(16).slice(2)}`, filename: file.name, mimeType: file.type, size: file.size, url: `#mock-url/${file.name}`, uploadedAt: nowISO(), uploadedBy: currentUser.name, isDeleted: false, }));}
      
      const newDeal: Deal = { 
          ...(coreDealData as Omit<Deal, 'id' | 'createdAt' | 'attachments' | 'isDeleted' | 'deletedAt' | 'customFields'>), 
          id: newDealId, 
          createdAt: todayDateString(), 
          stage: coreDealData.stage || DealStage.PROSPECTING, 
          value: finalValue,
          currency: finalCurrency, 
          owner: coreDealData.owner || currentUser?.name || 'Unassigned', 
          attachments: dealAttachments, 
          lineItems: lineItems,
          customFields,
          isDeleted: false, 
        };
      setDeals(currentDeals => [newDeal, ...currentDeals]);
      addActivityLog(newDeal.id, 'Deal', EntityActivityType.CREATED, `Deal '${newDeal.dealName}' created with value ${newDeal.currency}${newDeal.value}.`);
       if (newDeal.notes) { addActivityLog(newDeal.id, 'Deal', EntityActivityType.NOTE_ADDED, `Note added for deal '${newDeal.dealName}'.`); }
       logCustomFieldChanges(newDeal.id, 'Deal', newDeal.dealName, {}, newDeal.customFields, customFieldDefinitions);
      
      processMentions(newDeal.notes, newDeal.dealName, 'Deal', `/deals?search=${encodeURIComponent(newDeal.dealName)}`);

      dealAttachments.forEach(att => addActivityLog(newDeal.id, 'Deal', EntityActivityType.FILE_ATTACHED, `File '${att.filename}' attached to deal '${newDeal.dealName}'.`, { fileName: att.filename, fileSize: att.size }));
      const dealOwner = users.find(u => u.name === newDeal.owner);
      if (dealOwner && dealOwner.id !== currentUser?.id) { addNotification(dealOwner.id, NotificationType.DEAL_ASSIGNED, `New Deal: ${newDeal.dealName}`, `Assigned new deal: "${newDeal.dealName}".`, `/deals?search=${encodeURIComponent(newDeal.dealName)}`); }
    }
  };

  const handleDeleteDeal = (dealId: string) => {
    const dealToSoftDelete = deals.find(d => d.id === dealId && !d.isDeleted);
    if (dealToSoftDelete) {
        if (!canPerformAction(currentUser, 'DELETE', 'Deal', dealToSoftDelete)) { alert("Permission Denied."); return; }
        setDeals(currentDeals => currentDeals.map(deal => deal.id === dealId ? { ...deal, isDeleted: true, deletedAt: nowISO() } : deal));
        addActivityLog(dealId, 'Deal', EntityActivityType.SOFT_DELETED, `Deal '${dealToSoftDelete.dealName}' moved to trash.`);
    }
  };

  const handleRestoreDeal = (dealId: string) => {
    const dealToRestore = deals.find(d => d.id === dealId && d.isDeleted);
    if(dealToRestore){
        setDeals(currentDeals => currentDeals.map(deal => deal.id === dealId ? { ...deal, isDeleted: false, deletedAt: undefined } : deal));
        addActivityLog(dealId, 'Deal', EntityActivityType.RESTORED, `Deal '${dealToRestore.dealName}' restored from trash.`);
    }
  };

  const handlePermanentDeleteDeal = (dealId: string) => {
    const dealToDelete = deals.find(d => d.id === dealId && d.isDeleted);
    if (dealToDelete) {
        if (currentUser?.role !== 'admin') { alert("Permission Denied."); return; }
        setDeals(currentDeals => currentDeals.filter(deal => deal.id !== dealId));
        addActivityLog(dealId, 'Deal', EntityActivityType.PERMANENTLY_DELETED, `Deal '${dealToDelete.dealName}' permanently deleted.`);
    }
  };

  const sendTaskReminder = (task: Task, assignedUser: User) => {
    if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED) return;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dueDateDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    let remind = false; let reminderMessage = "";
    if (dueDateDay.getTime() === todayDay.getTime()) { remind = true; reminderMessage = `Task "${task.title}" is due today.`; } 
    else if (dueDateDay.getTime() === tomorrowDay.getTime()) { remind = true; reminderMessage = `Task "${task.title}" is due tomorrow.`; }
    if (remind) {
        const existingNotificationsForThisUser = JSON.parse(localStorage.getItem(`notifications_${assignedUser.id}`) || '[]') as NotificationItem[];
        const recentReminders = existingNotificationsForThisUser.filter( n => n.type === NotificationType.REMINDER && n.link === `/tasks?search=${encodeURIComponent(task.title)}` && (new Date(n.timestamp).getTime() > new Date().getTime() - (60 * 60 * 1000)));
        if (recentReminders.length === 0) { addNotification( assignedUser.id, NotificationType.REMINDER, `Task Reminder: ${task.title}`, reminderMessage, `/tasks?search=${encodeURIComponent(task.title)}`); }
    }
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'isDeleted' | 'deletedAt' | 'createdBy'> & { id?: string; customFields?: Record<string, any>; }) => {
    let entityForLog: { id: string, type: EntityActivityLog['entityType'], name: string } | null = null;
    let originalAssignedToId: string | undefined = undefined; let originalStatus: TaskStatus | undefined = undefined;
    if (!currentUser) return;
    let savedTask: Task | undefined;
    const { customFields, ...coreTaskData } = taskData;


    if (coreTaskData.id) { 
      const oldTask = tasks.find(t => t.id === coreTaskData.id && !t.isDeleted);
      if (!oldTask) return;
      if (!canPerformAction(currentUser, 'UPDATE', 'Task', oldTask)) { alert("Permission Denied."); return; }
      const oldAssignedUser = users.find(u => u.name === oldTask.assignedTo); originalAssignedToId = oldAssignedUser?.id; originalStatus = oldTask.status;
      const updatedTask: Task = { ...oldTask, ...coreTaskData, customFields, completedAt: coreTaskData.status === TaskStatus.COMPLETED && !oldTask.completedAt ? todayDateString() : oldTask.completedAt, };
      setTasks(currentTasks => currentTasks.map(task => task.id === coreTaskData.id ? updatedTask : task));
      savedTask = updatedTask;
      if (coreTaskData.relatedTo?.id && coreTaskData.relatedTo?.type !== 'General') {
        entityForLog = { id: coreTaskData.relatedTo.id, type: coreTaskData.relatedTo.type, name: coreTaskData.relatedTo.name || coreTaskData.title };
        if (oldTask.status !== coreTaskData.status) { addActivityLog(entityForLog.id, entityForLog.type, EntityActivityType.TASK_STATUS_CHANGED_LINKED, `Status of task '${coreTaskData.title}' for ${entityForLog.type} '${entityForLog.name}' to '${coreTaskData.status}'.`, { taskTitle: coreTaskData.title, taskStatus: coreTaskData.status, oldValue: oldTask.status, newValue: coreTaskData.status });
        } else { addActivityLog(entityForLog.id, entityForLog.type, EntityActivityType.TASK_UPDATED_LINKED, `Task '${coreTaskData.title}' for ${entityForLog.type} '${entityForLog.name}' updated.`, { taskTitle: coreTaskData.title });}
      }
      logCustomFieldChanges(savedTask.id, 'Task', savedTask.title, oldTask.customFields, savedTask.customFields, customFieldDefinitions);
      
      processMentions(updatedTask.notes, updatedTask.title, 'Task', `/tasks?search=${encodeURIComponent(updatedTask.title)}`);
      
      const assignedUser = users.find(u => u.name === coreTaskData.assignedTo);
      if (assignedUser && assignedUser.id !== currentUser.id) { 
          if (originalAssignedToId !== assignedUser.id) { addNotification(assignedUser.id, NotificationType.TASK_ASSIGNED, `Task Reassigned: ${coreTaskData.title}`, `Task "${coreTaskData.title}" reassigned to you. Due: ${coreTaskData.dueDate}.`, `/tasks?search=${encodeURIComponent(coreTaskData.title)}`);
          } else if (originalStatus !== coreTaskData.status) { addNotification(assignedUser.id, NotificationType.TASK_UPDATED, `Task Updated: ${coreTaskData.title}`, `Status of task "${coreTaskData.title}" to ${coreTaskData.status}.`, `/tasks?search=${encodeURIComponent(coreTaskData.title)}`);}
      }
    } else { 
      if (!canPerformAction(currentUser, 'CREATE', 'Task')) { alert("Permission Denied."); return; }
      const newTask: Task = { ...(coreTaskData as Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'isDeleted' | 'deletedAt' | 'createdBy' | 'customFields'>), id: `task-${Date.now()}`, createdAt: todayDateString(), createdBy: { id: currentUser.id, name: currentUser.name }, status: coreTaskData.status || TaskStatus.PENDING, dueDate: coreTaskData.dueDate || todayDateString(), completedAt: coreTaskData.status === TaskStatus.COMPLETED ? todayDateString() : undefined, assignedTo: coreTaskData.assignedTo || currentUser?.name || 'Unassigned', customFields, isDeleted: false, };
      setTasks(currentTasks => [newTask, ...currentTasks]);
      savedTask = newTask;
      if (newTask.relatedTo?.id && newTask.relatedTo?.type !== 'General') {
         entityForLog = { id: newTask.relatedTo.id, type: newTask.relatedTo.type, name: newTask.relatedTo.name || newTask.title };
         addActivityLog(entityForLog.id, entityForLog.type, EntityActivityType.TASK_CREATED_LINKED, `Task '${newTask.title}' created for ${entityForLog.type} '${entityForLog.name}'.`, { taskTitle: newTask.title });
      }
      logCustomFieldChanges(savedTask.id, 'Task', savedTask.title, {}, savedTask.customFields, customFieldDefinitions);
      
      processMentions(newTask.notes, newTask.title, 'Task', `/tasks?search=${encodeURIComponent(newTask.title)}`);

      const assignedUser = users.find(u => u.name === newTask.assignedTo);
      if (assignedUser && assignedUser.id !== currentUser.id) { addNotification(assignedUser.id, NotificationType.TASK_ASSIGNED, `New Task: ${newTask.title}`, `Assigned new task: "${newTask.title}". Due: ${newTask.dueDate}.`, `/tasks?search=${encodeURIComponent(newTask.title)}`);}
    }

    if (savedTask) {
        const assignedUserForReminder = users.find(u => u.name === savedTask!.assignedTo);
        if (assignedUserForReminder) { sendTaskReminder(savedTask, assignedUserForReminder); }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToSoftDelete = tasks.find(t => t.id === taskId && !t.isDeleted);
    if(taskToSoftDelete){
        if (!canPerformAction(currentUser, 'DELETE', 'Task', taskToSoftDelete)) { alert("Permission Denied."); return; }
        setTasks(currentTasks => currentTasks.map(task => task.id === taskId ? { ...task, isDeleted: true, deletedAt: nowISO() } : task));
        let logEntityType: EntityActivityLog['entityType'] = 'Task'; let logEntityId = taskId; let description = `Task '${taskToSoftDelete.title}' moved to trash.`;
        if (taskToSoftDelete.relatedTo?.id && taskToSoftDelete.relatedTo.type !== 'General') { logEntityType = taskToSoftDelete.relatedTo.type; logEntityId = taskToSoftDelete.relatedTo.id; description = `Task '${taskToSoftDelete.title}' for ${logEntityType} '${taskToSoftDelete.relatedTo.name || taskToSoftDelete.title}' moved to trash.`;}
        addActivityLog(logEntityId, logEntityType, EntityActivityType.SOFT_DELETED, description, {taskTitle: taskToSoftDelete.title});
    }
  };

  const handleRestoreTask = (taskId: string) => {
    const taskToRestore = tasks.find(t => t.id === taskId && t.isDeleted);
    if(taskToRestore){
        setTasks(currentTasks => currentTasks.map(task => task.id === taskId ? { ...task, isDeleted: false, deletedAt: undefined } : task));
        let logEntityType: EntityActivityLog['entityType'] = 'Task'; let logEntityId = taskId; let description = `Task '${taskToRestore.title}' restored from trash.`;
        if (taskToRestore.relatedTo?.id && taskToRestore.relatedTo.type !== 'General') { logEntityType = taskToRestore.relatedTo.type; logEntityId = taskToRestore.relatedTo.id; description = `Task '${taskToRestore.title}' for ${logEntityType} '${taskToRestore.relatedTo.name || taskToRestore.title}' restored.`; }
        addActivityLog(logEntityId, logEntityType, EntityActivityType.RESTORED, description, {taskTitle: taskToRestore.title});
    }
  };

  const handlePermanentDeleteTask = (taskId: string) => {
     const taskToDelete = tasks.find(t => t.id === taskId && t.isDeleted);
     if (taskToDelete) {
        if (currentUser?.role !== 'admin') { alert("Permission Denied."); return; }
        setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
        let logEntityType: EntityActivityLog['entityType'] = 'Task'; let logEntityId = taskId; let description = `Task '${taskToDelete.title}' permanently deleted.`;
        if (taskToDelete.relatedTo?.id && taskToDelete.relatedTo.type !== 'General') { logEntityType = taskToDelete.relatedTo.type; logEntityId = taskToDelete.relatedTo.id; description = `Task '${taskToDelete.title}' for ${logEntityType} '${taskToDelete.relatedTo.name || taskToDelete.title}' permanently deleted.`;}
        addActivityLog(logEntityId, logEntityType, EntityActivityType.PERMANENTLY_DELETED, description, {taskTitle: taskToDelete.title});
     }
  };

  const handleRestoreAttachment = (attachmentId: string, entityId: string, entityType: 'Lead' | 'Customer' | 'Deal') => {
    const updateEntityAttachments = (prevEntities: any[], entityIdToUpdate: string, attachmentIdToUpdate: string) => {
        return prevEntities.map(entity => {
            if (entity.id === entityIdToUpdate) {
                const updatedAttachments = (entity.attachments || []).map((att: Attachment) => {
                    if (att.id === attachmentIdToUpdate) { addActivityLog(entity.id, entityType, EntityActivityType.RESTORED, `Attachment '${att.filename}' restored for ${entityType.toLowerCase()} '${entity.name || entity.dealName}'.`, { fileName: att.filename, parentEntityType: entityType, parentEntityId: entity.id, parentEntityName: entity.name || entity.dealName}); return { ...att, isDeleted: false, deletedAt: undefined };}
                    return att;
                });
                return { ...entity, attachments: updatedAttachments };
            }
            return entity;
        });
    };
    switch(entityType) {
        case 'Lead': setLeads(prev => updateEntityAttachments(prev, entityId, attachmentId)); break;
        case 'Customer': setCustomers(prev => updateEntityAttachments(prev, entityId, attachmentId)); break;
        case 'Deal': setDeals(prev => updateEntityAttachments(prev, entityId, attachmentId)); break;
    }
  };

  const handlePermanentDeleteAttachment = (attachmentId: string, entityId: string, entityType: 'Lead' | 'Customer' | 'Deal') => {
     const updateEntityAttachments = (prevEntities: any[], entityIdToUpdate: string, attachmentIdToUpdate: string) => {
        return prevEntities.map(entity => {
            if (entity.id === entityIdToUpdate) {
                const attachmentToDelete = (entity.attachments || []).find((att: Attachment) => att.id === attachmentIdToUpdate);
                if (attachmentToDelete && currentUser?.role !== 'admin') { alert("Permission Denied."); return entity; }
                if (attachmentToDelete) { addActivityLog(entity.id, entityType, EntityActivityType.PERMANENTLY_DELETED, `Attachment '${attachmentToDelete.filename}' deleted from ${entityType.toLowerCase()} '${entity.name || entity.dealName}'.`, {fileName: attachmentToDelete.filename, parentEntityType: entityType, parentEntityId: entity.id, parentEntityName: entity.name || entity.dealName});}
                const updatedAttachments = (entity.attachments || []).filter((att: Attachment) => att.id !== attachmentIdToUpdate);
                return { ...entity, attachments: updatedAttachments };
            }
            return entity;
        });
    };
    switch(entityType) {
        case 'Lead': setLeads(prev => updateEntityAttachments(prev, entityId, attachmentId)); break;
        case 'Customer': setCustomers(prev => updateEntityAttachments(prev, entityId, attachmentId)); break;
        case 'Deal': setDeals(prev => updateEntityAttachments(prev, entityId, attachmentId)); break;
    }
  };

  // Internal helper for saving products after confirmation or directly
  const executeSaveProduct = (productToSave: Product) => {
      setProducts(currentProducts => 
          currentProducts.map(p => p.id === productToSave.id ? productToSave : p)
      );
      addActivityLog(productToSave.id, 'Product', EntityActivityType.FIELD_UPDATED, `Product '${productToSave.name}' updated.`);
      // Log custom field changes for products
      const oldProduct = products.find(p => p.id === productToSave.id);
      if(oldProduct) {
        logCustomFieldChanges(productToSave.id, 'Product', productToSave.name, oldProduct.customFields, productToSave.customFields, customFieldDefinitions);
      }
  };

  const handleSaveProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; customFields?: Record<string, any>; }) => {
      const { customFields, ...coreProductData } = productData;
      
      if (coreProductData.sku && coreProductData.sku.trim() !== "") {
        const skuToCheck = coreProductData.sku.trim().toLowerCase();
        const existingProductWithSku = products.find(p => 
            p.sku?.trim().toLowerCase() === skuToCheck &&
            p.id !== coreProductData.id // Exclude the current product if updating
        );

        if (existingProductWithSku) {
            alert(`SKU "${coreProductData.sku}" already exists for product "${existingProductWithSku.name}". Please use a unique SKU.`);
            return; 
        }
      }
      
      if (coreProductData.id) { // Existing product
          const oldProduct = products.find(p => p.id === coreProductData.id);
          if (!oldProduct) return;
          if (!canPerformAction(currentUser, 'UPDATE', 'Product', oldProduct)) { alert("Permission Denied."); return; }
          
          const updatedProduct: Product = { ...oldProduct, ...coreProductData, customFields, updatedAt: nowISO() };

          const nameOrSkuChanged = oldProduct.name !== updatedProduct.name || oldProduct.sku !== updatedProduct.sku;
          if (nameOrSkuChanged) {
              const isLinkedToDeal = deals.some(deal => 
                  !deal.isDeleted && deal.lineItems?.some(item => item.productId === updatedProduct.id)
              );

              if (isLinkedToDeal) {
                  setProductEditConfirmDetails({
                      productDataToSave: updatedProduct,
                      oldName: oldProduct.name,
                      oldSku: oldProduct.sku || ''
                  });
                  setIsProductEditConfirmModalOpen(true);
                  return; 
              }
          }
          executeSaveProduct(updatedProduct);
      } else { // New product
          if (!canPerformAction(currentUser, 'CREATE', 'Product')) { alert("Permission Denied."); return; }
          const newProduct: Product = {
              ...(coreProductData as Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'customFields'>),
              id: `prod-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              createdAt: nowISO(),
              updatedAt: nowISO(),
              customFields,
          };
          setProducts(currentProducts => [newProduct, ...currentProducts]);
          addActivityLog(newProduct.id, 'Product', EntityActivityType.CREATED, `Product '${newProduct.name}' created.`);
          logCustomFieldChanges(newProduct.id, 'Product', newProduct.name, {}, newProduct.customFields, customFieldDefinitions);
      }
  };
  
  const confirmProductEditWithWarning = () => {
      if (productEditConfirmDetails) {
          executeSaveProduct(productEditConfirmDetails.productDataToSave);
      }
      setIsProductEditConfirmModalOpen(false);
      setProductEditConfirmDetails(null);
  };


  const handleToggleProductActiveState = (productId: string) => {
      const productToToggle = products.find(p => p.id === productId);
      if (!productToToggle) return;

      if (!canPerformAction(currentUser, 'UPDATE', 'Product', productToToggle)) {
          alert("Permission Denied: You cannot change this product's status.");
          return;
      }

      if (productToToggle.isActive) {
          const activeDealsWithProduct = deals.filter(deal =>
              !deal.isDeleted &&
              deal.stage !== DealStage.CLOSED_WON &&
              deal.stage !== DealStage.CLOSED_LOST &&
              deal.lineItems?.some(item => item.productId === productId)
          );

          if (activeDealsWithProduct.length > 0) {
              const dealNames = activeDealsWithProduct.map(d => d.dealName).join(', ');
              alert(`This product cannot be deactivated as it is part of one or more active deals: ${dealNames}. Please remove it from these deals first or close/lose the deals.`);
              return; 
          }
      }
      const updatedProduct = { ...productToToggle, isActive: !productToToggle.isActive, updatedAt: nowISO() };
      setProducts(currentProducts => currentProducts.map(p => p.id === productId ? updatedProduct : p));
      
      const activityType = updatedProduct.isActive ? EntityActivityType.PRODUCT_ACTIVATED : EntityActivityType.PRODUCT_DEACTIVATED;
      const description = `Product '${updatedProduct.name}' ${updatedProduct.isActive ? 'activated' : 'deactivated'}.`;
      addActivityLog(productId, 'Product', activityType, description);
  };

  const handleBulkToggleProductActiveState = (productIds: string[], activate: boolean) => {
    if (!canPerformAction(currentUser, 'UPDATE', 'Product')) {
        alert("Permission Denied: You cannot change product statuses.");
        return;
    }

    let productsUpdatedCount = 0;
    const productsNotDeactivatedDueToDeals: string[] = [];

    const updatedProducts = products.map(p => {
        if (productIds.includes(p.id)) {
            if (p.isActive === activate) return p; // No change needed

            if (!activate) { // If deactivating
                const activeDealsWithProduct = deals.filter(deal =>
                    !deal.isDeleted &&
                    deal.stage !== DealStage.CLOSED_WON &&
                    deal.stage !== DealStage.CLOSED_LOST &&
                    deal.lineItems?.some(item => item.productId === p.id)
                );
                if (activeDealsWithProduct.length > 0) {
                    productsNotDeactivatedDueToDeals.push(p.name);
                    return p; // Don't change this product
                }
            }
            // If activating, or deactivating and no blocking deals
            productsUpdatedCount++;
            const activityType = activate ? EntityActivityType.PRODUCT_ACTIVATED : EntityActivityType.PRODUCT_DEACTIVATED;
            const description = `Product '${p.name}' ${activate ? 'activated' : 'deactivated'} (Bulk Action).`;
            addActivityLog(p.id, 'Product', activityType, description);
            return { ...p, isActive: activate, updatedAt: nowISO() };
        }
        return p;
    });

    setProducts(updatedProducts);

    let message = "";
    if (productsUpdatedCount > 0) {
        message += `${productsUpdatedCount} product(s) ${activate ? 'activated' : 'deactivated'} successfully.`;
    }
    if (productsNotDeactivatedDueToDeals.length > 0) {
        message += (message ? "\n" : "") + `The following products were not deactivated because they are part of active deals: ${productsNotDeactivatedDueToDeals.join(', ')}.`;
    }
    if (!message) {
        message = "No products required a status change or matched the selection.";
    }
    alert(message);
  };


  const performGlobalSearch = (term: string): GlobalSearchResult[] => {
    const results: GlobalSearchResult[] = []; const lowerTerm = term.toLowerCase().trim(); if (!lowerTerm) return [];
    leads.filter(l => !l.isDeleted).forEach(lead => { if (lead.name.toLowerCase().includes(lowerTerm) || lead.email.toLowerCase().includes(lowerTerm) || (lead.company && lead.company.toLowerCase().includes(lowerTerm))) { results.push({ id: `lead-${lead.id}`, type: 'Lead', name: lead.name, link: `/leads?search=${encodeURIComponent(lead.name)}`, details: `${lead.company || lead.email} - ${lead.status}`, }); } });
    customers.filter(c => !c.isDeleted).forEach(customer => { if (customer.name.toLowerCase().includes(lowerTerm) || customer.email.toLowerCase().includes(lowerTerm) || (customer.company && customer.company.toLowerCase().includes(lowerTerm))) { results.push({ id: `customer-${customer.id}`, type: 'Customer', name: customer.name, link: `/customers?search=${encodeURIComponent(customer.name)}`, details: customer.company || customer.email, }); } });
    deals.filter(d => !d.isDeleted).forEach(deal => { if (deal.dealName.toLowerCase().includes(lowerTerm) || (deal.owner && deal.owner.toLowerCase().includes(lowerTerm))) { results.push({ id: `deal-${deal.id}`, type: 'Deal', name: deal.dealName, link: `/deals?search=${encodeURIComponent(deal.dealName)}`, details: `Stage: ${deal.stage} - Value: ${deal.currency}${deal.value}`, }); } });
    tasks.filter(t => !t.isDeleted).forEach(task => { if (task.title.toLowerCase().includes(lowerTerm) || (task.description && task.description.toLowerCase().includes(lowerTerm)) || (task.assignedTo && task.assignedTo.toLowerCase().includes(lowerTerm))) { results.push({ id: `task-${task.id}`, type: 'Task', name: task.title, link: `/tasks?search=${encodeURIComponent(task.title)}`, details: `Status: ${task.status} - Due: ${task.dueDate}`, }); } });
    products.filter(p => p.isActive).forEach(product => { if (product.name.toLowerCase().includes(lowerTerm) || (product.sku && product.sku.toLowerCase().includes(lowerTerm)) || (product.category && product.category.toLowerCase().includes(lowerTerm))) { results.push({ id: `product-${product.id}`, type: 'Product', name: product.name, link: `/products?search=${encodeURIComponent(product.name)}`, details: `${product.category || 'N/A Category'} - ${systemSettings.defaultCurrency}${product.price}`, }); } });
    return results.slice(0, 10); 
  };

  // Custom Field Definition Management
  const handleAddCustomFieldDefinition = (definition: CustomFieldDefinition) => {
    setCustomFieldDefinitions(prev => [...prev, definition]);
    addActivityLog(definition.id, 'CustomFieldDefinition', EntityActivityType.CUSTOM_FIELD_DEFINITION_CREATED, `Custom field '${definition.label}' for ${definition.entityType} created.`);
  };

  const handleUpdateCustomFieldDefinition = (definition: CustomFieldDefinition) => {
    setCustomFieldDefinitions(prev => prev.map(def => def.id === definition.id ? definition : def));
    addActivityLog(definition.id, 'CustomFieldDefinition', EntityActivityType.CUSTOM_FIELD_DEFINITION_UPDATED, `Custom field '${definition.label}' for ${definition.entityType} updated.`);
  };

  const handleDeleteCustomFieldDefinition = (definitionId: string) => {
    const defToDelete = customFieldDefinitions.find(d => d.id === definitionId);
    if (defToDelete) {
      // Add warning logic here if field is in use before actual deletion
      setCustomFieldDefinitions(prev => prev.filter(def => def.id !== definitionId));
      addActivityLog(definitionId, 'CustomFieldDefinition', EntityActivityType.CUSTOM_FIELD_DEFINITION_DELETED, `Custom field '${defToDelete.label}' for ${defToDelete.entityType} deleted.`);
    }
  };
  
  if (isAuthLoading) { return <div className="flex items-center justify-center h-screen"><p>Loading application...</p></div>; }

  const appName = systemSettings.name || DEFAULT_SYSTEM_SETTINGS.name;

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} currentUser={currentUser} appName={appName} />} />
        
        <Route element={<ProtectedRoute currentUser={currentUser} />}>
          <Route element={
            <DashboardLayout 
                performGlobalSearch={performGlobalSearch} 
                currentUser={currentUser} 
                onLogout={handleLogout}
                notifications={notifications.filter(n => n.userId === currentUser?.id)} 
                onMarkNotificationAsRead={markNotificationAsRead}
                onMarkAllNotificationsAsRead={markAllNotificationsAsRead}
                appName={appName}
            />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage leads={leads.filter(l => !l.isDeleted)} customers={customers.filter(c => !c.isDeleted)} deals={deals.filter(d => !d.isDeleted)} tasks={tasks.filter(t => !t.isDeleted)} activityLogs={activityLogs} currentUser={currentUser} />} />
            
            <Route path="/leads" element={<LeadsPage leads={leads} onSaveLead={handleSaveLead} onDeleteLead={handleDeleteLead} activityLogs={activityLogs} currentUser={currentUser} addActivityLog={addActivityLog} customFieldDefinitions={customFieldDefinitions.filter(cfd => cfd.entityType === 'Lead')} onSaveTask={handleSaveTask} tasks={tasks.filter(t => !t.isDeleted)} />} />
            
            <Route path="/customers" element={<CustomersPage customers={customers} onSaveCustomer={handleSaveCustomer} onDeleteCustomer={handleDeleteCustomer} activityLogs={activityLogs} currentUser={currentUser} addActivityLog={addActivityLog} customFieldDefinitions={customFieldDefinitions.filter(cfd => cfd.entityType === 'Customer')} />} />
            
            <Route path="/deals" element={<DealsPage deals={deals} customers={customers.filter(c => !c.isDeleted)} leads={leads.filter(l => !l.isDeleted)} products={products.filter(p => p.isActive)} onSaveDeal={handleSaveDeal} onDeleteDeal={handleDeleteDeal} activityLogs={activityLogs} currentUser={currentUser} addActivityLog={addActivityLog} defaultCurrency={systemSettings.defaultCurrency} customFieldDefinitions={customFieldDefinitions.filter(cfd => cfd.entityType === 'Deal')} onSaveTask={handleSaveTask} tasks={tasks.filter(t => !t.isDeleted)} />} />
            
            <Route path="/tasks" element={<TasksPage tasks={tasks} leads={leads.filter(l => !l.isDeleted)} customers={customers.filter(c => !c.isDeleted)} deals={deals.filter(d => !d.isDeleted)} onSaveTask={handleSaveTask} onDeleteTask={handleDeleteTask} currentUser={currentUser} customFieldDefinitions={customFieldDefinitions.filter(cfd => cfd.entityType === 'Task')} />} />
            <Route path="/products" element={<ProductsPage products={products} onSaveProduct={handleSaveProduct} onToggleActiveState={handleToggleProductActiveState} onBulkToggleProductActiveState={handleBulkToggleProductActiveState} currentUser={currentUser} defaultCurrency={systemSettings.defaultCurrency} customFieldDefinitions={customFieldDefinitions.filter(cfd => cfd.entityType === 'Product')} />} />
            <Route path="/reports" element={<ReportsPage leads={leads.filter(l => !l.isDeleted)} customers={customers.filter(c => !c.isDeleted)} deals={deals.filter(d => !d.isDeleted)} tasks={tasks.filter(t => !t.isDeleted)} />} />
            <Route path="/activity-log" element={<ActivityLogPage activityLogs={activityLogs} users={users} />} />
            <Route path="/archive" element={<ArchivePage leads={leads} customers={customers} deals={deals} tasks={tasks} onRestoreLead={handleRestoreLead} onPermanentDeleteLead={handlePermanentDeleteLead} onRestoreCustomer={handleRestoreCustomer} onPermanentDeleteCustomer={handlePermanentDeleteCustomer} onRestoreDeal={handleRestoreDeal} onPermanentDeleteDeal={handlePermanentDeleteDeal} onRestoreTask={handleRestoreTask} onPermanentDeleteTask={handlePermanentDeleteTask} onRestoreAttachment={handleRestoreAttachment} onPermanentDeleteAttachment={handlePermanentDeleteAttachment} currentUser={currentUser} activityLogs={activityLogs} />} />
            <Route path="/settings" element={ <SettingsPage currentUser={currentUser} users={users} onUpdateUserProfile={handleUpdateUserProfile} onUpdateUserRole={handleUpdateUserRole} onAddNewUser={handleAddNewUser} systemSettings={systemSettings} onSaveSystemSettings={handleSaveSystemSettings} customFieldDefinitions={customFieldDefinitions} onAddCustomFieldDefinition={handleAddCustomFieldDefinition} onUpdateCustomFieldDefinition={handleUpdateCustomFieldDefinition} onDeleteCustomFieldDefinition={handleDeleteCustomFieldDefinition} onResetData={handleResetData} />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
      </Routes>
      {/* Product Edit Confirmation Modal */}
      {isProductEditConfirmModalOpen && productEditConfirmDetails && (
        <ConfirmationModal
          isOpen={isProductEditConfirmModalOpen}
          onClose={() => {
            setIsProductEditConfirmModalOpen(false);
            setProductEditConfirmDetails(null);
          }}
          onConfirm={confirmProductEditWithWarning}
          title="Confirm Product Update"
          message={
            <>
              You are about to change the name/SKU of product <strong>"{productEditConfirmDetails.productDataToSave.name}"</strong>
              (Old Name: "{productEditConfirmDetails.oldName}", Old SKU: "{productEditConfirmDetails.oldSku || 'N/A'}").
              <br /><br />
              This product is currently linked to one or more existing deals. Changing its name or SKU here will
              <strong> not update these historical deal records</strong>, which will retain the old product name/SKU.
              <br /><br />
              This may affect historical reporting if you rely on the current product catalog for past deal information.
              <br /><br />
              Are you sure you want to proceed with this change?
            </>
          }
          confirmButtonText="Proceed with Update"
          confirmButtonClass="bg-yellow-500 hover:bg-yellow-600 text-black"
        />
      )}
      {/* Access Denied Informational Modal */}
      {isAccessDeniedModalOpen && (
        <ConfirmationModal
          isOpen={isAccessDeniedModalOpen}
          onClose={() => setIsAccessDeniedModalOpen(false)}
          onConfirm={() => setIsAccessDeniedModalOpen(false)}
          title="Access Denied"
          message={accessDeniedModalMessage}
          confirmButtonText="OK"
          confirmButtonClass="bg-primary hover:bg-primary-dark" 
        />
      )}
    </HashRouter>
  );
};

export default App;