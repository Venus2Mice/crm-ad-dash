export interface StatsCardData {
  id: string;
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: any; // For additional properties like 'uv', 'pv' in Recharts examples
}

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  action: string;
  target?: string;
  timestamp: string;
  icon: React.ReactNode;
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
}

export interface NavItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

// Custom Field Types
export type CustomFieldEntityType = 'Lead' | 'Customer' | 'Deal' | 'Task' | 'Product';

export type CustomFieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'TEXTAREA' | 'CHECKBOX';

export interface CustomFieldDefinition {
  id: string; // Unique ID for the definition
  entityType: CustomFieldEntityType; 
  name: string; // Programmatic name (e.g., "lead_source_details_c"), unique per entityType
  label: string; // User-friendly display label (e.g., "Lead Source Details")
  type: CustomFieldType;
  options?: string[]; // For SELECT type (comma-separated string or array)
  isRequired?: boolean;
  placeholder?: string; // For text-based inputs
  // order?: number; // For display order (optional future enhancement)
}


// CRM Entity Types

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number; // in bytes
  url: string; // For mock, can be placeholder e.g., #/file/id or data URL for small images
  uploadedAt: string; // ISO date string
  uploadedBy: string; // User's name or ID
  isDeleted?: boolean;
  deletedAt?: string; // ISO date string
}

export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  QUALIFIED = 'Qualified',
  PROPOSAL_SENT = 'Proposal Sent',
  NEGOTIATION = 'Negotiation',
  LOST = 'Lost',
  WON = 'Converted to Customer', // Renamed for clarity, implies a Deal might be created.
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  source?: string;
  assignedTo?: string; // User name or ID
  lastContacted: string; // ISO date string or human-readable
  createdAt: string; // ISO date string
  notes?: string;
  attachments?: Attachment[];
  customFields?: Record<string, any>; // Key is CustomFieldDefinition.name
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  createdAt: string; // Date of becoming a customer
  lastPurchaseDate?: string; // ISO date string
  totalRevenue?: number;
  accountManager?: string; // User name or ID
  notes?: string;
  attachments?: Attachment[];
  customFields?: Record<string, any>; // Key is CustomFieldDefinition.name
  isDeleted?: boolean;
  deletedAt?: string;
}

export enum DealStage {
  PROSPECTING = 'Prospecting',
  QUALIFICATION = 'Qualification',
  NEEDS_ANALYSIS = 'Needs Analysis',
  PROPOSAL = 'Value Proposition',
  NEGOTIATION = 'Negotiation/Review',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost',
}

export interface DealLineItem {
  id: string; // Unique ID for the line item itself (e.g., uuid or `pli-${Date.now()}`)
  productId: string;
  productName: string; // Denormalized for display
  quantity: number;
  unitPrice: number; // Price at the time of adding to deal
  currency: string; // Currency at the time of adding
  totalPrice: number; // quantity * unitPrice
}

export interface Deal {
  id: string;
  dealName: string;
  customerId?: string; // Link to Customer
  leadId?: string; // Link to originating Lead
  stage: DealStage;
  value: number;
  currency: string;
  closeDate: string; // Expected close date (ISO string)
  owner: string; // User name or ID
  description?: string;
  createdAt: string; // ISO date string
  notes?: string;
  attachments?: Attachment[];
  lineItems?: DealLineItem[]; // Added for products/services
  customFields?: Record<string, any>; // Key is CustomFieldDefinition.name
  isDeleted?: boolean;
  deletedAt?: string;
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  DEFERRED = 'Deferred',
  CANCELLED = 'Cancelled',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO date string
  status: TaskStatus;
  priority?: 'Low' | 'Medium' | 'High';
  assignedTo?: string; // User name or ID
  createdBy?: { // Who created/assigned the task
    id: string;
    name: string;
  };
  relatedTo?: {
    type: 'Lead' | 'Customer' | 'Deal' | 'General';
    id?: string; // ID of the related entity
    name?: string; // Name of the related entity for display
  };
  createdAt: string; // ISO date string
  completedAt?: string; // ISO date string
  notes?: string; // Added notes field
  customFields?: Record<string, any>; // Key is CustomFieldDefinition.name
  isDeleted?: boolean;
  deletedAt?: string;
}

// Product Catalog Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  currency: string; // Should ideally be consistent or allow conversion (e.g. system default)
  sku?: string; // Stock Keeping Unit
  isActive: boolean; // For soft delete/availability
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  customFields?: Record<string, any>; // Key is CustomFieldDefinition.name
}

export interface ProductEditConfirmDetails {
  productDataToSave: Product;
  oldName: string;
  oldSku: string;
}


// Report Specific Types
export interface ReportFilterOption {
  value: string;
  label: string;
}

export type ReportPeriod = 'all_time' | 'today' | 'this_month' | 'last_month' | 'last_90_days' | 'year_to_date';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export type ReportType = 'sales_performance' | 'lead_conversion_funnel' | 'deal_pipeline' | 'customer_activity' | 'lead_source_effectiveness';

export const REPORT_TYPE_OPTIONS: ReportFilterOption[] = [
    { value: 'sales_performance', label: 'Sales Performance Report' },
    { value: 'lead_conversion_funnel', label: 'Lead Conversion Funnel' },
    { value: 'deal_pipeline', label: 'Deal Pipeline Analysis' },
    { value: 'customer_activity', label: 'Customer Activity Summary' },
    { value: 'lead_source_effectiveness', label: 'Lead Source Effectiveness' },
];

// Global Search Result Type
export interface GlobalSearchResult {
  id: string; // Unique key for the result, e.g., `lead-${lead.id}`
  type: 'Lead' | 'Customer' | 'Deal' | 'Task' | 'Product'; // Added Product
  name: string; // Primary display name
  link: string; // URL to navigate to, including search query
  details?: string; // Secondary details, e.g., company name, email, status
}

// Entity Activity Log Types
export enum EntityActivityType {
  CREATED = 'CREATED',
  FIELD_UPDATED = 'FIELD_UPDATED',
  CUSTOM_FIELD_UPDATED = 'CUSTOM_FIELD_UPDATED', // New for custom fields
  STATUS_UPDATED = 'STATUS_UPDATED',
  STAGE_UPDATED = 'STAGE_UPDATED',
  NOTE_ADDED = 'NOTE_ADDED',
  NOTE_UPDATED = 'NOTE_UPDATED',
  TASK_CREATED_LINKED = 'TASK_CREATED_LINKED',
  TASK_STATUS_CHANGED_LINKED = 'TASK_STATUS_CHANGED_LINKED',
  TASK_UPDATED_LINKED = 'TASK_UPDATED_LINKED',
  FILE_ATTACHED = 'FILE_ATTACHED',
  FILE_REMOVED = 'FILE_REMOVED', 
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  SOFT_DELETED = 'SOFT_DELETED', // Generic soft delete
  RESTORED = 'RESTORED', // Generic restore
  PERMANENTLY_DELETED = 'PERMANENTLY_DELETED', // Generic permanent delete
  // User specific for settings
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED', 
  ROLE_CHANGED = 'ROLE_CHANGED', 
  LOGIN = 'LOGIN', 
  LOGOUT = 'LOGOUT', 
  SYSTEM_SETTINGS_UPDATED = 'SYSTEM_SETTINGS_UPDATED', 
  // Product specific
  PRODUCT_ACTIVATED = 'PRODUCT_ACTIVATED',
  PRODUCT_DEACTIVATED = 'PRODUCT_DEACTIVATED',
  // Custom Field Definitions
  CUSTOM_FIELD_DEFINITION_CREATED = 'CUSTOM_FIELD_DEFINITION_CREATED',
  CUSTOM_FIELD_DEFINITION_UPDATED = 'CUSTOM_FIELD_DEFINITION_UPDATED',
  CUSTOM_FIELD_DEFINITION_DELETED = 'CUSTOM_FIELD_DEFINITION_DELETED',
}

export interface EntityActivityLog {
  id: string;
  timestamp: string; // ISO Date string
  entityId: string; // ID of the Lead, Customer, Deal, Task, User, Product or 'system' for system settings or CustomFieldDefinition ID
  entityType: CustomFieldEntityType | 'User' | 'System' | 'CustomFieldDefinition' | 'Attachment';
  userId: string; 
  userName: string; 
  activityType: EntityActivityType;
  description: string; // e.g., "Status changed from New to Contacted"
  details?: { // Optional structured details
    field?: string; // e.g., 'status', 'stage', 'value', 'notes', 'role', 'companyName', 'defaultCurrency', or custom field name
    oldValue?: string | number | boolean | undefined; 
    newValue?: string | number | boolean | undefined; 
    taskTitle?: string; 
    taskStatus?: TaskStatus; 
    fileName?: string; 
    fileSize?: number; 
    maxFileSize?: number; 
    parentEntityType?: CustomFieldEntityType; 
    parentEntityId?: string; 
    parentEntityName?: string; 
    targetUserId?: string; 
    targetUserName?: string;
    customFieldLabel?: string; // For CUSTOM_FIELD_UPDATED log
    customFieldDefinitionEntityType?: CustomFieldEntityType; // For CUSTOM_FIELD_DEFINITION_* logs
  };
}

export interface ActivityLogIconProps {
  activityType: EntityActivityType;
  className?: string;
}

// User Authentication and Authorization Types
export type UserRole = 'admin' | 'manager' | 'sales_rep';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string; // Added for profile
  jobTitle?: string; // Added for profile
}

// Settings specific types
export interface CompanySettings {
    name: string;
    logoUrl?: string; // For future use
    defaultCurrency: string; // Changed to non-optional
}

// Notification System Types
export enum NotificationType {
  INFO = 'INFO', // General information
  SUCCESS = 'SUCCESS', // Successful operation
  WARNING = 'WARNING', // Potential issue
  ERROR = 'ERROR', // Error occurred
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED', // e.g. status change, due date change
  TASK_COMPLETED = 'TASK_COMPLETED',
  LEAD_ASSIGNED = 'LEAD_ASSIGNED',
  LEAD_UPDATED = 'LEAD_UPDATED',
  DEAL_ASSIGNED = 'DEAL_ASSIGNED',
  DEAL_UPDATED = 'DEAL_UPDATED', // e.g. stage change
  MENTION = 'MENTION', // If @mentions are implemented
  REMINDER = 'REMINDER', // For tasks due soon, etc.
}

export interface NotificationItem {
  id: string;
  timestamp: string; // ISO Date string
  userId: string; // The user this notification is for
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string; // Optional link to navigate to (e.g., /tasks?search=task_id)
  icon?: React.ReactNode; // Optional: specific icon for the notification type
  actor?: { // Optional: who performed the action causing the notification
    id: string;
    name: string;
  };
}

// AI Sales Forecast Types
export interface SalesForecastInputData {
  historicalWonDeals: Array<{ value: number; closeDate: string; currency: string; }>;
  openDeals: Array<{ value: number; stage: DealStage; expectedCloseDate: string; currency: string; }>;
  recentLeadVolume: number; // e.g., new leads in the last 30 days
  forecastPeriod: string; // e.g., "next quarter", "next month"
  // Additional context like average deal cycle, team size etc. could be added
}

export interface SalesForecastResult {
  forecastText: string; // This will store the formatted text response from Gemini
  // Potentially break down further in future:
  // forecastedValueRange?: string;
  // confidenceLevel?: 'High' | 'Medium' | 'Low' | string;
  // keyFactors?: string[]; 
}