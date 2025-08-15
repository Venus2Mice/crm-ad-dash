
import React from 'react';
import { ChartDataItem, ActivityItem, Lead, Customer, Deal, Task, LeadStatus, DealStage, TaskStatus, NavItem, ReportFilterOption, User, UserRole, EntityActivityType, EntityActivityLog, Product, CustomFieldType, CustomFieldEntityType } from './types';
import { UsersIcon, BriefcaseIcon, ChartBarIcon, CurrencyDollarIcon, ChatBubbleLeftEllipsisIcon, CogIcon, DocumentChartBarIcon, UserPlusIcon, FunnelIcon, ClipboardDocumentListIcon, ArchiveBoxXMarkIcon, ListBulletIcon, CubeIcon, WrenchScrewdriverIcon } from './components/ui/Icon'; // Added CubeIcon, WrenchScrewdriverIcon

// APP_NAME is now managed by systemSettings in App.tsx
// export const APP_NAME = "CRM Dashboard"; 

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_FILE_SIZE_MB = MAX_FILE_SIZE_BYTES / (1024 * 1024);

export const ATTACHMENT_HINTS_LEAD: string[] = [
  "Product/Service Brochures, Presentations, Case Studies.",
  "Lead's Initial Requirements (Notes, Emails).",
  "Non-Disclosure Agreements (NDAs).",
  "Lead's Company Profile (if applicable).",
  "Key Email Correspondences (as .eml, .msg, or PDF).",
];

export const ATTACHMENT_HINTS_DEAL: string[] = [
  "Proposals and Quotations.",
  "Presentations tailored to the deal.",
  "Technical Specifications or Scope of Work documents.",
  "Meeting Minutes relevant to the deal.",
  "Draft Contracts or Agreements.",
  "Competitor Analysis related to this deal.",
];

export const ATTACHMENT_HINTS_CUSTOMER: string[] = [
  "Signed Contracts and Agreements.",
  "Service Level Agreements (SLAs).",
  "Important Invoices or Purchase Orders.",
  "Customer Feedback Forms or Surveys.",
  "Support Case Documentation.",
  "Onboarding Checklists or Materials.",
];


export const MOCK_SALES_DATA: ChartDataItem[] = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
];

export const MOCK_LEAD_SOURCES_DATA: ChartDataItem[] = [
  { name: 'Organic Search', value: 400 },
  { name: 'Referral', value: 300 },
  { name: 'Social Media', value: 200 },
  { name: 'Paid Ads', value: 278 },
  { name: 'Email Marketing', value: 189 },
];

export const MOCK_RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    user: { name: 'Alice Wonderland', avatarUrl: 'https://picsum.photos/seed/alice/40/40' },
    action: 'Added new lead',
    target: 'John Doe',
    timestamp: '2 hours ago',
    icon: React.createElement(UserPlusIcon, { className: "h-5 w-5 text-blue-500" })
  },
  {
    id: '2',
    user: { name: 'Bob The Builder', avatarUrl: 'https://picsum.photos/seed/bob/40/40' },
    action: 'Closed deal',
    target: 'Acme Corp Q3 Contract',
    timestamp: '5 hours ago',
    icon: React.createElement(CurrencyDollarIcon, { className: "h-5 w-5 text-green-500" })
  },
  {
    id: '3',
    user: { name: 'Charlie Brown', avatarUrl: 'https://picsum.photos/seed/charlie/40/40' },
    action: 'Logged a call with',
    target: 'Jane Smith',
    timestamp: '1 day ago',
    icon: React.createElement(ChatBubbleLeftEllipsisIcon, { className: "h-5 w-5 text-yellow-500" })
  },
  {
    id: '4',
    user: { name: 'Diana Prince', avatarUrl: 'https://picsum.photos/seed/diana/40/40' },
    action: 'Updated customer profile',
    target: 'Bruce Wayne',
    timestamp: '2 days ago',
    icon: React.createElement(CogIcon, { className: "h-5 w-5 text-purple-500" })
  },
];

export const NAVIGATION_ITEMS: NavItem[] = [
  { path: '/dashboard', name: 'Dashboard', icon: React.createElement(ChartBarIcon, { className: "h-6 w-6" }) },
  { path: '/leads', name: 'Leads', icon: React.createElement(UsersIcon, { className: "h-6 w-6" }) },
  { path: '/customers', name: 'Customers', icon: React.createElement(BriefcaseIcon, { className: "h-6 w-6" }) },
  { path: '/deals', name: 'Deals', icon: React.createElement(FunnelIcon, {className: "h-6 w-6"})},
  { path: '/tasks', name: 'Tasks', icon: React.createElement(ClipboardDocumentListIcon, {className: "h-6 w-6"})},
  { path: '/products', name: 'Products', icon: React.createElement(CubeIcon, {className: "h-6 w-6"})}, // Added Products
  { path: '/reports', name: 'Reports', icon: React.createElement(DocumentChartBarIcon, { className: "h-6 w-6" }) },
];

export const ACTIVITY_LOG_NAV_ITEM: NavItem = { path: '/activity-log', name: 'Activity Log', icon: React.createElement(ListBulletIcon, {className: "h-6 w-6"}) };
export const SETTINGS_NAV_ITEM: NavItem = { path: '/settings', name: 'Settings', icon: React.createElement(CogIcon, { className: "h-6 w-6" }) };
export const ARCHIVE_NAV_ITEM: NavItem = { path: '/archive', name: 'Archive (Trash)', icon: React.createElement(ArchiveBoxXMarkIcon, { className: "h-6 w-6" }) };


// CRM Mock Data
const today = new Date();
const daysAgo = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const nowISO = () => new Date().toISOString();

export const MOCK_USERS: User[] = [
  { id: 'user-admin-01', name: 'Admin User', email: 'admin@example.com', role: 'admin', avatarUrl: 'https://picsum.photos/seed/admin/40/40', phone: '555-0100', jobTitle: 'System Administrator' },
  { id: 'user-sales-01', name: 'Alice Sales', email: 'alice@example.com', role: 'sales_rep', avatarUrl: 'https://picsum.photos/seed/alice/40/40', phone: '555-0101', jobTitle: 'Sales Representative' },
  { id: 'user-manager-01', name: 'Bob Manager', email: 'bob@example.com', role: 'manager', avatarUrl: 'https://picsum.photos/seed/bob/40/40', phone: '555-0102', jobTitle: 'Sales Manager' },
  { id: 'user-sales-02', name: 'Charlie Sales', email: 'charlie@example.com', role: 'sales_rep', avatarUrl: 'https://picsum.photos/seed/charlie/40/40', phone: '555-0103', jobTitle: 'Account Executive' },
  { id: 'user-sales-03', name: 'Diana Sales', email: 'diana@example.com', role: 'sales_rep', avatarUrl: 'https://picsum.photos/seed/diana/40/40', phone: '555-0104', jobTitle: 'Sales Associate' }
];


export const MOCK_LEADS: Lead[] = [
  { id: 'lead-1', name: 'John Doe', email: 'john.doe@example.com', company: 'Doe Industries', status: LeadStatus.NEW, source: 'Website Form', assignedTo: MOCK_USERS[1].name, lastContacted: daysAgo(1), createdAt: daysAgo(2), phone: '555-1234', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-2', name: 'Jane Smith', email: 'jane.smith@example.com', company: 'Smith Solutions', status: LeadStatus.CONTACTED, source: 'Referral', assignedTo: MOCK_USERS[2].name, lastContacted: daysAgo(0), createdAt: daysAgo(5), phone: '555-5678', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-3', name: 'Robert Brown', email: 'robert.brown@example.com', company: 'Brown & Co.', status: LeadStatus.QUALIFIED, source: 'Cold Call', assignedTo: MOCK_USERS[3].name, lastContacted: daysAgo(3), createdAt: daysAgo(7), phone: '555-0011', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-4', name: 'Emily White', email: 'emily.white@example.com', company: 'White Enterprises', status: LeadStatus.PROPOSAL_SENT, source: 'Conference', assignedTo: MOCK_USERS[4].name, lastContacted: daysAgo(2), createdAt: daysAgo(10), phone: '555-0022', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-5', name: 'Michael Green', email: 'michael.green@example.com', company: 'Green Tech', status: LeadStatus.NEGOTIATION, source: 'Website Form', assignedTo: MOCK_USERS[1].name, lastContacted: daysAgo(1), createdAt: daysAgo(12), phone: '555-0033', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-6', name: 'Sarah Black', email: 'sarah.black@example.com', company: 'Blackwood Corp', status: LeadStatus.LOST, source: 'Referral', assignedTo: MOCK_USERS[2].name, lastContacted: daysAgo(5), createdAt: daysAgo(15), phone: '555-0044', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-7', name: 'David King', email: 'david.king@example.com', company: 'Kingfisher Ltd', status: LeadStatus.NEW, source: 'Social Media', assignedTo: MOCK_USERS[3].name, lastContacted: daysAgo(0), createdAt: daysAgo(1), phone: '555-0055', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-8', name: 'Laura Hill', email: 'laura.hill@example.com', company: 'Hilltop Inc.', status: LeadStatus.CONTACTED, source: 'Advertisement', assignedTo: MOCK_USERS[4].name, lastContacted: daysAgo(1), createdAt: daysAgo(3), phone: '555-0066', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-9', name: 'Kevin Scott', email: 'kevin.scott@example.com', company: 'Scott Innovations', status: LeadStatus.QUALIFIED, source: 'Website Form', assignedTo: MOCK_USERS[1].name, lastContacted: daysAgo(4), createdAt: daysAgo(8), phone: '555-0077', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-10', name: 'Linda Adams', email: 'linda.adams@example.com', company: 'Adams Group', status: LeadStatus.PROPOSAL_SENT, source: 'Email Marketing', assignedTo: MOCK_USERS[2].name, lastContacted: daysAgo(2), createdAt: daysAgo(11), phone: '555-0088', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-11', name: 'Brian Clark', email: 'brian.clark@example.com', company: 'Clark & Partners', status: LeadStatus.NEGOTIATION, source: 'Referral', assignedTo: MOCK_USERS[3].name, lastContacted: daysAgo(1), createdAt: daysAgo(13), phone: '555-0099', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-12', name: 'Karen Rodriguez', email: 'karen.rodriguez@example.com', company: 'Rodriguez Exports', status: LeadStatus.NEW, source: 'Trade Show', assignedTo: MOCK_USERS[4].name, lastContacted: daysAgo(0), createdAt: daysAgo(2), phone: '555-0100', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-13', name: 'Steven Walker', email: 'steven.walker@example.com', company: 'Walker Logistics', status: LeadStatus.CONTACTED, source: 'Website Form', assignedTo: MOCK_USERS[1].name, lastContacted: daysAgo(1), createdAt: daysAgo(4), phone: '555-0111', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-14', name: 'Nancy Allen', email: 'nancy.allen@example.com', company: 'Allen Systems', status: LeadStatus.QUALIFIED, source: 'Cold Call', assignedTo: MOCK_USERS[2].name, lastContacted: daysAgo(3), createdAt: daysAgo(9), phone: '555-0122', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-15', name: 'Paul Young', email: 'paul.young@example.com', company: 'Young Solutions', status: LeadStatus.PROPOSAL_SENT, source: 'Conference', assignedTo: MOCK_USERS[3].name, lastContacted: daysAgo(2), createdAt: daysAgo(14), phone: '555-0133', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-16', name: 'Jessica Hall', email: 'jessica.hall@example.com', company: 'Hall Imports', status: LeadStatus.NEGOTIATION, source: 'Social Media', assignedTo: MOCK_USERS[4].name, lastContacted: daysAgo(1), createdAt: daysAgo(16), phone: '555-0144', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-17', name: 'Mark Lee', email: 'mark.lee@example.com', company: 'Lee Electronics', status: LeadStatus.LOST, source: 'Advertisement', assignedTo: MOCK_USERS[1].name, lastContacted: daysAgo(6), createdAt: daysAgo(18), phone: '555-0155', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-18', name: 'Betty Lewis', email: 'betty.lewis@example.com', company: 'Lewis & Sons', status: LeadStatus.NEW, source: 'Email Marketing', assignedTo: MOCK_USERS[2].name, lastContacted: daysAgo(0), createdAt: daysAgo(1), phone: '555-0166', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-19', name: 'Donald Harris', email: 'donald.harris@example.com', company: 'Harris Hardware', status: LeadStatus.CONTACTED, source: 'Referral', assignedTo: MOCK_USERS[3].name, lastContacted: daysAgo(1), createdAt: daysAgo(5), phone: '555-0177', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-20', name: 'Sandra Turner', email: 'sandra.turner@example.com', company: 'Turner Goods', status: LeadStatus.QUALIFIED, source: 'Trade Show', assignedTo: MOCK_USERS[4].name, lastContacted: daysAgo(4), createdAt: daysAgo(10), phone: '555-0188', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-21', name: 'George Martin', email: 'george.martin@example.com', company: 'Martin Services', status: LeadStatus.NEW, source: 'Website Form', assignedTo: MOCK_USERS[1].name, lastContacted: daysAgo(0), createdAt: daysAgo(1), phone: '555-0199', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-22', name: 'Amanda Nelson', email: 'amanda.nelson@example.com', company: 'Nelson Group', status: LeadStatus.CONTACTED, source: 'Cold Call', assignedTo: MOCK_USERS[2].name, lastContacted: daysAgo(1), createdAt: daysAgo(3), phone: '555-0200', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-23', name: 'Frank Miller', email: 'frank.miller@example.com', company: 'Miller Co.', status: LeadStatus.QUALIFIED, source: 'Conference', assignedTo: MOCK_USERS[3].name, lastContacted: daysAgo(2), createdAt: daysAgo(6), phone: '555-0211', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-24', name: 'Cynthia Davis', email: 'cynthia.davis@example.com', company: 'Davis Consulting', status: LeadStatus.PROPOSAL_SENT, source: 'Social Media', assignedTo: MOCK_USERS[4].name, lastContacted: daysAgo(3), createdAt: daysAgo(8), phone: '555-0222', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-25', name: 'Daniel Wilson', email: 'daniel.wilson@example.com', company: 'Wilson Inc.', status: LeadStatus.NEGOTIATION, source: 'Advertisement', assignedTo: MOCK_USERS[1].name, lastContacted: daysAgo(1), createdAt: daysAgo(12), phone: '555-0233', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-26', name: 'Mary Garcia', email: 'mary.garcia@example.com', company: 'Garcia Ltd.', status: LeadStatus.NEW, source: 'Email Marketing', assignedTo: MOCK_USERS[2].name, lastContacted: daysAgo(0), createdAt: daysAgo(1), phone: '555-0244', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-27', name: 'Joseph Martinez', email: 'joseph.martinez@example.com', company: 'Martinez Holdings', status: LeadStatus.LOST, source: 'Referral', assignedTo: MOCK_USERS[3].name, lastContacted: daysAgo(7), createdAt: daysAgo(20), phone: '555-0255', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-28', name: 'Patricia Thompson', email: 'patricia.thompson@example.com', company: 'Thompson Solutions', status: LeadStatus.CONTACTED, source: 'Trade Show', assignedTo: MOCK_USERS[4].name, lastContacted: daysAgo(1), createdAt: daysAgo(4), phone: '555-0266', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-29', name: 'James Anderson', email: 'james.anderson@example.com', company: 'Anderson Corp', status: LeadStatus.QUALIFIED, source: 'Website Form', assignedTo: MOCK_USERS[1].name, lastContacted: daysAgo(2), createdAt: daysAgo(7), phone: '555-0277', attachments: [], isDeleted: false, customFields: {} },
  { id: 'lead-30', name: 'Jennifer Thomas', email: 'jennifer.thomas@example.com', company: 'Thomas Tech', status: LeadStatus.PROPOSAL_SENT, source: 'Cold Call', assignedTo: MOCK_USERS[2].name, lastContacted: daysAgo(3), createdAt: daysAgo(9), phone: '555-0288', attachments: [], isDeleted: false, customFields: {} },
];
MOCK_LEADS.forEach(lead => { if(lead.customFields === undefined) lead.customFields = {}; });


export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Acme Corp', email: 'contact@acme.com', company: 'Acme Corporation', createdAt: daysAgo(100), lastPurchaseDate: daysAgo(10), totalRevenue: 15000, accountManager: MOCK_USERS[1].name, phone: '555-0001', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-2', name: 'Beta Solutions', email: 'info@beta.com', company: 'Beta Solutions LLC', createdAt: daysAgo(200), lastPurchaseDate: daysAgo(30), totalRevenue: 25000, accountManager: MOCK_USERS[2].name, phone: '555-0002', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-3', name: 'Gamma Inc', email: 'sales@gamma.com', company: 'Gamma Incorporated', createdAt: daysAgo(50), lastPurchaseDate: daysAgo(5), totalRevenue: 8000, accountManager: MOCK_USERS[3].name, phone: '555-0003', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-4', name: 'Delta Co', email: 'support@delta.co', company: 'Delta Company', createdAt: daysAgo(300), lastPurchaseDate: daysAgo(60), totalRevenue: 32000, accountManager: MOCK_USERS[4].name, phone: '555-0004', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-5', name: 'Epsilon Ltd', email: 'contact@epsilon.ltd', company: 'Epsilon Limited', createdAt: daysAgo(150), lastPurchaseDate: daysAgo(15), totalRevenue: 12500, accountManager: MOCK_USERS[1].name, phone: '555-0005', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-6', name: 'Zeta Group', email: 'hello@zetagroup.com', company: 'The Zeta Group', createdAt: daysAgo(20), lastPurchaseDate: daysAgo(2), totalRevenue: 5000, accountManager: MOCK_USERS[2].name, phone: '555-0006', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-7', name: 'Eta Services', email: 'accounts@etaservices.net', company: 'Eta Professional Services', createdAt: daysAgo(400), lastPurchaseDate: daysAgo(90), totalRevenue: 45000, accountManager: MOCK_USERS[3].name, phone: '555-0007', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-8', name: 'Theta LLC', email: 'admin@theta.llc', company: 'Theta LLC International', createdAt: daysAgo(250), lastPurchaseDate: daysAgo(45), totalRevenue: 22000, accountManager: MOCK_USERS[4].name, phone: '555-0008', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-9', name: 'Iota Industries', email: 'info@iotaindustries.com', company: 'Iota Industries Global', createdAt: daysAgo(80), lastPurchaseDate: daysAgo(8), totalRevenue: 9500, accountManager: MOCK_USERS[1].name, phone: '555-0009', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-10', name: 'Kappa Corp', email: 'ceo@kappacorp.com', company: 'Kappa Corporation', createdAt: daysAgo(10), lastPurchaseDate: daysAgo(1), totalRevenue: 3000, accountManager: MOCK_USERS[2].name, phone: '555-0010', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-11', name: 'Lambda Holdings', email: 'contact@lambda.holdings', company: 'Lambda Holdings Ltd', createdAt: daysAgo(120), lastPurchaseDate: daysAgo(20), totalRevenue: 18000, accountManager: MOCK_USERS[3].name, phone: '555-0011', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-12', name: 'Mu Systems', email: 'info@musystems.com', company: 'Mu Systems Inc.', createdAt: daysAgo(180), lastPurchaseDate: daysAgo(25), totalRevenue: 14000, accountManager: MOCK_USERS[4].name, phone: '555-0012', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-13', name: 'Nu Tech', email: 'sales@nutech.io', company: 'Nu Technologies', createdAt: daysAgo(90), lastPurchaseDate: daysAgo(7), totalRevenue: 7000, accountManager: MOCK_USERS[1].name, phone: '555-0013', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-14', name: 'Xi Enterprises', email: 'support@xienterprises.com', company: 'Xi Enterprises Global', createdAt: daysAgo(350), lastPurchaseDate: daysAgo(80), totalRevenue: 38000, accountManager: MOCK_USERS[2].name, phone: '555-0014', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-15', name: 'Omicron Group', email: 'contact@omicrongroup.com', company: 'The Omicron Group', createdAt: daysAgo(60), lastPurchaseDate: daysAgo(4), totalRevenue: 6000, accountManager: MOCK_USERS[3].name, phone: '555-0015', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-16', name: 'Pi Solutions', email: 'info@pisolutions.com', company: 'Pi Solutions Ltd', createdAt: daysAgo(220), lastPurchaseDate: daysAgo(40), totalRevenue: 28000, accountManager: MOCK_USERS[4].name, phone: '555-0016', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-17', name: 'Rho Industries', email: 'admin@rhoindustries.com', company: 'Rho Industries Inc.', createdAt: daysAgo(70), lastPurchaseDate: daysAgo(6), totalRevenue: 8500, accountManager: MOCK_USERS[1].name, phone: '555-0017', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-18', name: 'Sigma Corp', email: 'sales@sigmacorp.io', company: 'Sigma Corporation', createdAt: daysAgo(30), lastPurchaseDate: daysAgo(3), totalRevenue: 4000, accountManager: MOCK_USERS[2].name, phone: '555-0018', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-19', name: 'Tau Services', email: 'support@tauservices.net', company: 'Tau Professional Services', createdAt: daysAgo(450), lastPurchaseDate: daysAgo(100), totalRevenue: 50000, accountManager: MOCK_USERS[3].name, phone: '555-0019', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-20', name: 'Upsilon LLC', email: 'contact@upsilon.llc', company: 'Upsilon LLC International', createdAt: daysAgo(280), lastPurchaseDate: daysAgo(50), totalRevenue: 20000, accountManager: MOCK_USERS[4].name, phone: '555-0020', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-21', name: 'Phi Innovations', email: 'info@phiinnovations.com', company: 'Phi Innovations Global', createdAt: daysAgo(110), lastPurchaseDate: daysAgo(12), totalRevenue: 11000, accountManager: MOCK_USERS[1].name, phone: '555-0021', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-22', name: 'Chi Corp', email: 'ceo@chicorp.com', company: 'Chi Corporation', createdAt: daysAgo(40), lastPurchaseDate: daysAgo(2), totalRevenue: 5500, accountManager: MOCK_USERS[2].name, phone: '555-0022', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-23', name: 'Psi Holdings', email: 'contact@psiholdings.com', company: 'Psi Holdings Ltd', createdAt: daysAgo(140), lastPurchaseDate: daysAgo(22), totalRevenue: 16000, accountManager: MOCK_USERS[3].name, phone: '555-0023', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-24', name: 'Omega Systems', email: 'info@omegasystems.com', company: 'Omega Systems Inc.', createdAt: daysAgo(190), lastPurchaseDate: daysAgo(28), totalRevenue: 13000, accountManager: MOCK_USERS[4].name, phone: '555-0024', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-25', name: 'Alpha Prime Tech', email: 'sales@alphaprimetech.io', company: 'Alpha Prime Technologies', createdAt: daysAgo(100), lastPurchaseDate: daysAgo(9), totalRevenue: 7500, accountManager: MOCK_USERS[1].name, phone: '555-0025', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-26', name: 'Bravo Next Gen', email: 'support@bravonextgen.com', company: 'Bravo Next Gen Global', createdAt: daysAgo(320), lastPurchaseDate: daysAgo(70), totalRevenue: 35000, accountManager: MOCK_USERS[2].name, phone: '555-0026', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-27', name: 'Charlie Sierra Group', email: 'contact@charliesierra.com', company: 'The Charlie Sierra Group', createdAt: daysAgo(55), lastPurchaseDate: daysAgo(5), totalRevenue: 6500, accountManager: MOCK_USERS[3].name, phone: '555-0027', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-28', name: 'Delta Foxtrot Ltd', email: 'info@deltafoxtrot.com', company: 'Delta Foxtrot Ltd', createdAt: daysAgo(240), lastPurchaseDate: daysAgo(35), totalRevenue: 26000, accountManager: MOCK_USERS[4].name, phone: '555-0028', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-29', name: 'Echo Global Industries', email: 'admin@echoglobal.com', company: 'Echo Global Industries Inc.', createdAt: daysAgo(75), lastPurchaseDate: daysAgo(7), totalRevenue: 9000, accountManager: MOCK_USERS[1].name, phone: '555-0029', attachments: [], isDeleted: false, customFields: {} },
  { id: 'cust-30', name: 'Foxtrot United Corp', email: 'sales@foxtrotunited.io', company: 'Foxtrot United Corporation', createdAt: daysAgo(35), lastPurchaseDate: daysAgo(3), totalRevenue: 4500, accountManager: MOCK_USERS[2].name, phone: '555-0030', attachments: [], isDeleted: false, customFields: {} },
];
MOCK_CUSTOMERS.forEach(customer => { if(customer.customFields === undefined) customer.customFields = {}; });


export const MOCK_DEALS: Deal[] = [
  { id: 'deal-1', dealName: 'Q4 Acme Renewal', customerId: 'cust-1', stage: DealStage.NEGOTIATION, value: 12000, currency: 'USD', closeDate: daysAgo(-30), owner: MOCK_USERS[1].name, createdAt: daysAgo(45), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-2', dealName: 'Beta New Project', customerId: 'cust-2', stage: DealStage.PROPOSAL, value: 8500, currency: 'USD', closeDate: daysAgo(-15), owner: MOCK_USERS[2].name, createdAt: daysAgo(30), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-3', dealName: 'Gamma Expansion', leadId: 'lead-3', stage: DealStage.QUALIFICATION, value: 15000, currency: 'USD', closeDate: daysAgo(-45), owner: MOCK_USERS[3].name, createdAt: daysAgo(10), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-4', dealName: 'Delta Tech Upgrade', customerId: 'cust-4', stage: DealStage.CLOSED_WON, value: 22000, currency: 'USD', closeDate: daysAgo(5), owner: MOCK_USERS[4].name, createdAt: daysAgo(60), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-5', dealName: 'Epsilon Consulting', leadId: 'lead-5', stage: DealStage.NEEDS_ANALYSIS, value: 6000, currency: 'USD', closeDate: daysAgo(-20), owner: MOCK_USERS[1].name, createdAt: daysAgo(25), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-6', dealName: 'Zeta Software License', customerId: 'cust-6', stage: DealStage.PROSPECTING, value: 3000, currency: 'USD', closeDate: daysAgo(-60), owner: MOCK_USERS[2].name, createdAt: daysAgo(5), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-7', dealName: 'Eta Support Contract', customerId: 'cust-7', stage: DealStage.NEGOTIATION, value: 18000, currency: 'USD', closeDate: daysAgo(-25), owner: MOCK_USERS[3].name, createdAt: daysAgo(50), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-8', dealName: 'Theta Hardware Sale', leadId: 'lead-8', stage: DealStage.PROPOSAL, value: 11000, currency: 'USD', closeDate: daysAgo(-10), owner: MOCK_USERS[4].name, createdAt: daysAgo(20), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-9', dealName: 'Iota Development Services', customerId: 'cust-9', stage: DealStage.QUALIFICATION, value: 7500, currency: 'USD', closeDate: daysAgo(-35), owner: MOCK_USERS[1].name, createdAt: daysAgo(15), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-10', dealName: 'Kappa Training Package', leadId: 'lead-10', stage: DealStage.CLOSED_LOST, value: 4000, currency: 'USD', closeDate: daysAgo(10), owner: MOCK_USERS[2].name, createdAt: daysAgo(40), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-11', dealName: 'Lambda Cloud Migration', customerId: 'cust-11', stage: DealStage.NEEDS_ANALYSIS, value: 25000, currency: 'USD', closeDate: daysAgo(-50), owner: MOCK_USERS[3].name, createdAt: daysAgo(35), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-12', dealName: 'Mu System Integration', customerId: 'cust-12', stage: DealStage.PROSPECTING, value: 13000, currency: 'USD', closeDate: daysAgo(-70), owner: MOCK_USERS[4].name, createdAt: daysAgo(8), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-13', dealName: 'Nu Security Audit', leadId: 'lead-13', stage: DealStage.NEGOTIATION, value: 9000, currency: 'USD', closeDate: daysAgo(-5), owner: MOCK_USERS[1].name, createdAt: daysAgo(18), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-14', dealName: 'Xi Managed Services', customerId: 'cust-14', stage: DealStage.PROPOSAL, value: 30000, currency: 'USD', closeDate: daysAgo(-40), owner: MOCK_USERS[2].name, createdAt: daysAgo(55), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-15', dealName: 'Omicron Website Redesign', leadId: 'lead-15', stage: DealStage.QUALIFICATION, value: 5500, currency: 'USD', closeDate: daysAgo(-28), owner: MOCK_USERS[3].name, createdAt: daysAgo(12), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-16', dealName: 'Pi Data Analytics', customerId: 'cust-16', stage: DealStage.CLOSED_WON, value: 19000, currency: 'USD', closeDate: daysAgo(1), owner: MOCK_USERS[4].name, createdAt: daysAgo(70), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-17', dealName: 'Rho Marketing Campaign', leadId: 'lead-17', stage: DealStage.NEEDS_ANALYSIS, value: 6500, currency: 'USD', closeDate: daysAgo(-18), owner: MOCK_USERS[1].name, createdAt: daysAgo(22), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-18', dealName: 'Sigma App Development', customerId: 'cust-18', stage: DealStage.PROSPECTING, value: 4500, currency: 'USD', closeDate: daysAgo(-55), owner: MOCK_USERS[2].name, createdAt: daysAgo(3), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-19', dealName: 'Tau Enterprise Solution', customerId: 'cust-19', stage: DealStage.NEGOTIATION, value: 50000, currency: 'USD', closeDate: daysAgo(-32), owner: MOCK_USERS[3].name, createdAt: daysAgo(65), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-20', dealName: 'Upsilon IoT Project', leadId: 'lead-20', stage: DealStage.PROPOSAL, value: 16000, currency: 'USD', closeDate: daysAgo(-12), owner: MOCK_USERS[4].name, createdAt: daysAgo(28), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-21', dealName: 'Phi Blockchain Initiative', customerId: 'cust-21', stage: DealStage.QUALIFICATION, value: 10000, currency: 'USD', closeDate: daysAgo(-38), owner: MOCK_USERS[1].name, createdAt: daysAgo(17), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-22', dealName: 'Chi AI Integration', leadId: 'lead-22', stage: DealStage.CLOSED_LOST, value: 7000, currency: 'USD', closeDate: daysAgo(15), owner: MOCK_USERS[2].name, createdAt: daysAgo(48), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-23', dealName: 'Psi VR Experience', customerId: 'cust-23', stage: DealStage.NEEDS_ANALYSIS, value: 14000, currency: 'USD', closeDate: daysAgo(-48), owner: MOCK_USERS[3].name, createdAt: daysAgo(33), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-24', dealName: 'Omega Platform Upgrade', customerId: 'cust-24', stage: DealStage.PROSPECTING, value: 12500, currency: 'USD', closeDate: daysAgo(-65), owner: MOCK_USERS[4].name, createdAt: daysAgo(6), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-25', dealName: 'Alpha Prime Customization', customerId: 'cust-25', stage: DealStage.NEGOTIATION, value: 8000, currency: 'USD', closeDate: daysAgo(-8), owner: MOCK_USERS[1].name, createdAt: daysAgo(24), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-26', dealName: 'Bravo Next Gen Rollout', customerId: 'cust-26', stage: DealStage.PROPOSAL, value: 28000, currency: 'USD', closeDate: daysAgo(-42), owner: MOCK_USERS[2].name, createdAt: daysAgo(58), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-27', dealName: 'Charlie Sierra Training', leadId: 'lead-27', stage: DealStage.QUALIFICATION, value: 5000, currency: 'USD', closeDate: daysAgo(-22), owner: MOCK_USERS[3].name, createdAt: daysAgo(11), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-28', dealName: 'Delta Foxtrot Support Plan', customerId: 'cust-28', stage: DealStage.CLOSED_WON, value: 20000, currency: 'USD', closeDate: daysAgo(2), owner: MOCK_USERS[4].name, createdAt: daysAgo(75), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-29', dealName: 'Echo Global Partnership', leadId: 'lead-29', stage: DealStage.NEEDS_ANALYSIS, value: 9500, currency: 'USD', closeDate: daysAgo(-16), owner: MOCK_USERS[1].name, createdAt: daysAgo(26), attachments: [], isDeleted: false, customFields: {} },
  { id: 'deal-30', dealName: 'Foxtrot United Expansion', customerId: 'cust-30', stage: DealStage.PROSPECTING, value: 3500, currency: 'USD', closeDate: daysAgo(-52), owner: MOCK_USERS[2].name, createdAt: daysAgo(4), attachments: [], isDeleted: false, customFields: {} },
];
MOCK_DEALS.forEach(deal => { if(deal.customFields === undefined) deal.customFields = {}; });

export const MOCK_TASKS: Task[] = [
  { id: 'task-1', title: 'Follow up with John Doe', dueDate: daysAgo(-2), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[1].name, createdBy: {id: MOCK_USERS[0].id, name: MOCK_USERS[0].name}, relatedTo: { type: 'Lead', id: 'lead-1', name: 'John Doe' }, createdAt: daysAgo(1), priority: 'High', isDeleted: false, customFields: {} },
  { id: 'task-2', title: 'Prepare proposal for Beta Solutions', dueDate: daysAgo(-5), status: TaskStatus.IN_PROGRESS, assignedTo: MOCK_USERS[2].name, createdBy: {id: MOCK_USERS[0].id, name: MOCK_USERS[0].name}, relatedTo: { type: 'Customer', id: 'cust-2', name: 'Beta Solutions' }, createdAt: daysAgo(3), priority: 'High', isDeleted: false, customFields: {} },
  { id: 'task-3', title: 'Schedule demo for Gamma Inc', dueDate: daysAgo(-1), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[3].name, createdBy: {id: MOCK_USERS[1].name, name: MOCK_USERS[1].name}, relatedTo: { type: 'Deal', id: 'deal-3', name: 'Gamma Expansion' }, createdAt: daysAgo(2), priority: 'Medium', isDeleted: false, customFields: {} },
  { id: 'task-4', title: 'Finalize Delta Tech Upgrade contract', dueDate: daysAgo(0), status: TaskStatus.COMPLETED, assignedTo: MOCK_USERS[4].name, createdBy: {id: MOCK_USERS[1].name, name: MOCK_USERS[1].name}, relatedTo: { type: 'Deal', id: 'deal-4', name: 'Delta Tech Upgrade' }, createdAt: daysAgo(4), completedAt: daysAgo(0), priority: 'High', isDeleted: false, customFields: {} },
  { id: 'task-5', title: 'Research Epsilon Consulting needs', dueDate: daysAgo(-3), status: TaskStatus.IN_PROGRESS, assignedTo: MOCK_USERS[1].name, createdBy: {id: MOCK_USERS[2].name, name: MOCK_USERS[2].name}, relatedTo: { type: 'Lead', id: 'lead-5', name: 'Epsilon Consulting' }, createdAt: daysAgo(2), priority: 'Medium', isDeleted: false, customFields: {} },
  { id: 'task-6', title: 'Call Zeta Group for initial contact', dueDate: daysAgo(-7), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[2].name, createdBy: {id: MOCK_USERS[2].name, name: MOCK_USERS[2].name}, relatedTo: { type: 'Customer', id: 'cust-6', name: 'Zeta Group' }, createdAt: daysAgo(1), priority: 'Low', isDeleted: false, customFields: {} },
  { id: 'task-7', title: 'Review Eta Support Contract terms', dueDate: daysAgo(-4), status: TaskStatus.DEFERRED, assignedTo: MOCK_USERS[3].name, createdBy: {id: MOCK_USERS[3].name, name: MOCK_USERS[3].name}, relatedTo: { type: 'Deal', id: 'deal-7', name: 'Eta Support Contract' }, createdAt: daysAgo(5), priority: 'Medium', isDeleted: false, customFields: {} },
  { id: 'task-8', title: 'Send quote to Theta Hardware Sale', dueDate: daysAgo(-1), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[4].name, createdBy: {id: MOCK_USERS[3].name, name: MOCK_USERS[3].name}, relatedTo: { type: 'Lead', id: 'lead-8', name: 'Theta Hardware Sale' }, createdAt: daysAgo(1), priority: 'High', isDeleted: false, customFields: {} },
  { id: 'task-9', title: 'Plan Iota Development Services kickoff', dueDate: daysAgo(-6), status: TaskStatus.IN_PROGRESS, assignedTo: MOCK_USERS[1].name, createdBy: {id: MOCK_USERS[4].name, name: MOCK_USERS[4].name}, relatedTo: { type: 'Customer', id: 'cust-9', name: 'Iota Industries' }, createdAt: daysAgo(3), priority: 'Medium', isDeleted: false, customFields: {} },
  { id: 'task-10', title: 'Kappa Training follow-up (Lost Deal)', dueDate: daysAgo(2), status: TaskStatus.CANCELLED, assignedTo: MOCK_USERS[2].name, createdBy: {id: MOCK_USERS[4].name, name: MOCK_USERS[4].name}, relatedTo: { type: 'Deal', id: 'deal-10', name: 'Kappa Training Package' }, createdAt: daysAgo(2), priority: 'Low', isDeleted: false, customFields: {} },
  { id: 'task-11', title: 'Draft SOW for Lambda Cloud Migration', dueDate: daysAgo(-8), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[3].name, createdBy: {id: MOCK_USERS[0].name, name: MOCK_USERS[0].name}, relatedTo: { type: 'Deal', id: 'deal-11', name: 'Lambda Cloud Migration' }, createdAt: daysAgo(4), priority: 'High', isDeleted: false, customFields: {} },
  { id: 'task-12', title: 'Onboard Mu Systems', dueDate: daysAgo(-10), status: TaskStatus.IN_PROGRESS, assignedTo: MOCK_USERS[4].name, createdBy: {id: MOCK_USERS[0].name, name: MOCK_USERS[0].name}, relatedTo: { type: 'Customer', id: 'cust-12', name: 'Mu Systems' }, createdAt: daysAgo(5), priority: 'Medium', isDeleted: false, customFields: {} },
  { id: 'task-13', title: 'Negotiate Nu Security Audit terms', dueDate: daysAgo(-2), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[1].name, createdBy: {id: MOCK_USERS[1].name, name: MOCK_USERS[1].name}, relatedTo: { type: 'Deal', id: 'deal-13', name: 'Nu Security Audit' }, createdAt: daysAgo(2), priority: 'High', isDeleted: false, customFields: {} },
  { id: 'task-14', title: 'Present to Xi Managed Services', dueDate: daysAgo(-5), status: TaskStatus.COMPLETED, assignedTo: MOCK_USERS[2].name, createdBy: {id: MOCK_USERS[1].name, name: MOCK_USERS[1].name}, relatedTo: { type: 'Customer', id: 'cust-14', name: 'Xi Enterprises' }, createdAt: daysAgo(6), completedAt: daysAgo(-1), priority: 'High', isDeleted: false, customFields: {} },
  { id: 'task-15', title: 'Gather requirements for Omicron Website Redesign', dueDate: daysAgo(-3), status: TaskStatus.IN_PROGRESS, assignedTo: MOCK_USERS[3].name, createdBy: {id: MOCK_USERS[2].name, name: MOCK_USERS[2].name}, relatedTo: { type: 'Lead', id: 'lead-15', name: 'Omicron Website Redesign' }, createdAt: daysAgo(3), priority: 'Medium', isDeleted: false, customFields: {} },
  { id: 'task-16', title: 'Internal Project Alpha', dueDate: daysAgo(-1), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[1].name, createdBy: {id: MOCK_USERS[0].name, name: MOCK_USERS[0].name}, relatedTo: { type: 'General' }, createdAt: daysAgo(1), priority: 'Low', isDeleted: false, customFields: {} },
  { id: 'task-17', title: 'Team Meeting Prep', dueDate: daysAgo(0), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[2].name, createdBy: {id: MOCK_USERS[0].name, name: MOCK_USERS[0].name}, relatedTo: { type: 'General' }, createdAt: daysAgo(0), priority: 'Medium', isDeleted: false, customFields: {} },
  { id: 'task-18', title: 'Sales Report Analysis', dueDate: daysAgo(-4), status: TaskStatus.IN_PROGRESS, assignedTo: MOCK_USERS[3].name, createdBy: {id: MOCK_USERS[0].name, name: MOCK_USERS[0].name}, relatedTo: { type: 'General' }, createdAt: daysAgo(2), priority: 'High', isDeleted: false, customFields: {} },
  { id: 'task-19', title: 'Client Check-in Calls', dueDate: daysAgo(-2), status: TaskStatus.DEFERRED, assignedTo: MOCK_USERS[4].name, createdBy: {id: MOCK_USERS[1].name, name: MOCK_USERS[1].name}, relatedTo: { type: 'General' }, createdAt: daysAgo(3), priority: 'Low', isDeleted: false, customFields: {} },
  { id: 'task-20', title: 'Update CRM Training Materials', dueDate: daysAgo(-7), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[1].name, createdBy: {id: MOCK_USERS[0].name, name: MOCK_USERS[0].name}, relatedTo: { type: 'General' }, createdAt: daysAgo(1), priority: 'Medium', isDeleted: false, customFields: {} },
  { id: 'task-21', title: 'Invoice Pi Data Analytics', dueDate: daysAgo(1), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[4].name, createdBy: {id: MOCK_USERS[1].name, name: MOCK_USERS[1].name}, relatedTo: { type: 'Deal', id: 'deal-16', name: 'Pi Data Analytics' }, createdAt: daysAgo(0), priority: 'High', isDeleted: false, customFields: {} },
  { id: 'task-22', title: 'Send Thank You to Delta Co', dueDate: daysAgo(3), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[4].name, createdBy: {id: MOCK_USERS[1].name, name: MOCK_USERS[1].name}, relatedTo: { type: 'Customer', id: 'cust-4', name: 'Delta Co' }, createdAt: daysAgo(1), priority: 'Low', isDeleted: false, customFields: {} },
  { id: 'task-23', title: 'Review contract for Rho Marketing Campaign', dueDate: daysAgo(-3), status: TaskStatus.IN_PROGRESS, assignedTo: MOCK_USERS[1].name, createdBy: {id: MOCK_USERS[2].name, name: MOCK_USERS[2].name}, relatedTo: { type: 'Deal', id: 'deal-17', name: 'Rho Marketing Campaign' }, createdAt: daysAgo(2), priority: 'High', isDeleted: false, customFields: {} },
  { id: 'task-24', title: 'Initial call with Sigma App Development', dueDate: daysAgo(-6), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[2].name, createdBy: {id: MOCK_USERS[2].name, name: MOCK_USERS[2].name}, relatedTo: { type: 'Customer', id: 'cust-18', name: 'Sigma Corp' }, createdAt: daysAgo(1), priority: 'Medium', isDeleted: false, customFields: {} },
  { id: 'task-25', title: 'Discuss Tau Enterprise Solution requirements', dueDate: daysAgo(-4), status: TaskStatus.IN_PROGRESS, assignedTo: MOCK_USERS[3].name, createdBy: {id: MOCK_USERS[3].name, name: MOCK_USERS[3].name}, relatedTo: { type: 'Deal', id: 'deal-19', name: 'Tau Enterprise Solution' }, createdAt: daysAgo(3), priority: 'High', isDeleted: false, customFields: {} },
  { id: 'task-26', title: 'Prepare Upsilon IoT Project proposal', dueDate: daysAgo(-2), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[4].name, createdBy: {id: MOCK_USERS[3].name, name: MOCK_USERS[3].name}, relatedTo: { type: 'Lead', id: 'lead-20', name: 'Upsilon IoT Project' }, createdAt: daysAgo(1), priority: 'High', isDeleted: false, customFields: {} },
  { id: 'task-27', title: 'Qualify Phi Blockchain Initiative', dueDate: daysAgo(-5), status: TaskStatus.IN_PROGRESS, assignedTo: MOCK_USERS[1].name, createdBy: {id: MOCK_USERS[4].name, name: MOCK_USERS[4].name}, relatedTo: { type: 'Customer', id: 'cust-21', name: 'Phi Innovations' }, createdAt: daysAgo(2), priority: 'Medium', isDeleted: false, customFields: {} },
  { id: 'task-28', title: 'Debrief Chi AI Integration (Lost)', dueDate: daysAgo(5), status: TaskStatus.CANCELLED, assignedTo: MOCK_USERS[2].name, createdBy: {id: MOCK_USERS[4].name, name: MOCK_USERS[4].name}, relatedTo: { type: 'Deal', id: 'deal-22', name: 'Chi AI Integration' }, createdAt: daysAgo(3), priority: 'Low', isDeleted: false, customFields: {} },
  { id: 'task-29', title: 'Scope Psi VR Experience project', dueDate: daysAgo(-7), status: TaskStatus.PENDING, assignedTo: MOCK_USERS[3].name, createdBy: {id: MOCK_USERS[0].name, name: MOCK_USERS[0].name}, relatedTo: { type: 'Customer', id: 'cust-23', name: 'Psi Holdings' }, createdAt: daysAgo(4), priority: 'High', isDeleted: false, customFields: {} },
  { id: 'task-30', title: 'Follow up on Omega Platform Upgrade interest', dueDate: daysAgo(-9), status: TaskStatus.IN_PROGRESS, assignedTo: MOCK_USERS[4].name, createdBy: {id: MOCK_USERS[0].name, name: MOCK_USERS[0].name}, relatedTo: { type: 'Customer', id: 'cust-24', name: 'Omega Systems' }, createdAt: daysAgo(5), priority: 'Medium', isDeleted: false, customFields: {} },
];
MOCK_TASKS.forEach(task => { if(task.customFields === undefined) task.customFields = {}; });


export const MOCK_PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'Basic Subscription', description: 'Monthly access to basic features.', category: 'Subscription', price: 29.99, currency: 'USD', sku: 'SUB-BAS-M', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-2', name: 'Pro Subscription', description: 'Monthly access to pro features and support.', category: 'Subscription', price: 79.99, currency: 'USD', sku: 'SUB-PRO-M', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-3', name: 'Enterprise Plan', description: 'Annual access for large teams with premium support.', category: 'Subscription', price: 999.00, currency: 'USD', sku: 'SUB-ENT-Y', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-4', name: 'Standard Widget', description: 'A high-quality standard widget.', category: 'Hardware', price: 19.95, currency: 'USD', sku: 'HW-WID-STD', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-5', name: 'Premium Widget', description: 'Our top-of-the-line premium widget with extra features.', category: 'Hardware', price: 49.95, currency: 'USD', sku: 'HW-WID-PRM', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-6', name: 'Basic Setup Service', description: 'One-time setup fee for basic configuration.', category: 'Service', price: 150.00, currency: 'USD', sku: 'SVC-SETUP-BAS', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-7', name: 'Advanced Setup Service', description: 'Comprehensive setup and integration service.', category: 'Service', price: 500.00, currency: 'USD', sku: 'SVC-SETUP-ADV', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-8', name: 'Hourly Consulting', description: 'Expert consulting services, billed per hour.', category: 'Service', price: 120.00, currency: 'USD', sku: 'SVC-CONS-HR', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-9', name: 'Support Package - Basic', description: 'Monthly basic support package.', category: 'Support', price: 50.00, currency: 'USD', sku: 'SUP-BAS-M', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-10', name: 'Support Package - Premium', description: 'Monthly premium support with faster response times.', category: 'Support', price: 150.00, currency: 'USD', sku: 'SUP-PRM-M', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-11', name: 'Software Add-on A', description: 'Enhances functionality of core software.', category: 'Software', price: 99.00, currency: 'USD', sku: 'SW-ADD-A', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-12', name: 'Software Add-on B', description: 'Provides additional tools and integrations.', category: 'Software', price: 149.00, currency: 'USD', sku: 'SW-ADD-B', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-13', name: 'Training Course - Online', description: 'Access to online training materials.', category: 'Training', price: 299.00, currency: 'USD', sku: 'TRN-ONL', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-14', name: 'Training Course - On-site (per day)', description: 'On-site training session for your team.', category: 'Training', price: 1200.00, currency: 'USD', sku: 'TRN-ONSITE-DAY', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-15', name: 'Gadget Pro X', description: 'The latest professional gadget.', category: 'Hardware', price: 299.99, currency: 'USD', sku: 'HW-GAD-PROX', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-16', name: 'Starter Kit Bundle', description: 'Includes Basic Subscription and Standard Widget.', category: 'Bundle', price: 45.00, currency: 'USD', sku: 'BNDL-START', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-17', name: 'Pro Kit Bundle', description: 'Includes Pro Subscription, Premium Widget, and Basic Setup.', category: 'Bundle', price: 250.00, currency: 'USD', sku: 'BNDL-PRO', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-18', name: 'Accessory Pack', description: 'A pack of essential accessories for widgets.', category: 'Hardware', price: 24.99, currency: 'USD', sku: 'HW-ACC-PK', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-19', name: 'License Key - Single User', description: 'Perpetual license for one user.', category: 'Software', price: 499.00, currency: 'USD', sku: 'SW-LIC-SU', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-20', name: 'License Key - Team (5 Users)', description: 'Perpetual license for a team of five.', category: 'Software', price: 1999.00, currency: 'USD', sku: 'SW-LIC-TM5', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-21', name: 'Small Component Alpha', description: 'A small, replaceable component.', category: 'Parts', price: 5.99, currency: 'USD', sku: 'PART-ALPHA', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-22', name: 'Large Component Beta', description: 'A large, critical component.', category: 'Parts', price: 89.50, currency: 'USD', sku: 'PART-BETA', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-23', name: 'Extended Warranty - 1 Year', description: 'Extends product warranty by one year.', category: 'Service', price: 39.99, currency: 'USD', sku: 'SVC-WARR-1Y', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-24', name: 'Extended Warranty - 3 Years', description: 'Extends product warranty by three years.', category: 'Service', price: 99.99, currency: 'USD', sku: 'SVC-WARR-3Y', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-25', name: 'Data Migration Service', description: 'Service to migrate data from old systems.', category: 'Service', price: 750.00, currency: 'USD', sku: 'SVC-DATA-MIG', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-26', name: 'Analytics Module', description: 'Advanced analytics and reporting module.', category: 'Software', price: 249.00, currency: 'USD', sku: 'SW-MOD-ANL', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-27', name: 'Custom API Access', description: 'Access to custom API endpoints for integration.', category: 'Subscription', price: 199.00, currency: 'USD', sku: 'SUB-API-CUS', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-28', name: 'Repair Kit', description: 'Kit for minor repairs on hardware products.', category: 'Parts', price: 29.00, currency: 'USD', sku: 'PART-REPKIT', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
  { id: 'prod-29', name: 'Special Edition Widget', description: 'Limited run special edition widget.', category: 'Hardware', price: 99.00, currency: 'USD', sku: 'HW-WID-SE', isActive: false, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} }, // Example of inactive
  { id: 'prod-30', name: 'Consulting Retainer - Monthly', description: 'Monthly retainer for ongoing consulting.', category: 'Service', price: 1000.00, currency: 'USD', sku: 'SVC-RETAIN-M', isActive: true, createdAt: nowISO(), updatedAt: nowISO(), customFields: {} },
];
MOCK_PRODUCTS.forEach(product => { if(product.customFields === undefined) product.customFields = {}; });



export const LEAD_STATUS_OPTIONS = Object.values(LeadStatus);
export const DEAL_STAGE_OPTIONS = Object.values(DealStage);
export const TASK_STATUS_OPTIONS = Object.values(TaskStatus);

// Helper for status colors
export const getStatusColor = (status: LeadStatus | DealStage | TaskStatus): string => {
  switch (status) {
    // Lead Status
    case LeadStatus.NEW: return 'bg-blue-100 text-blue-700';
    case LeadStatus.CONTACTED: return 'bg-yellow-100 text-yellow-700';
    case LeadStatus.QUALIFIED: return 'bg-teal-100 text-teal-700';
    case LeadStatus.PROPOSAL_SENT: return 'bg-indigo-100 text-indigo-700';
    case LeadStatus.NEGOTIATION: return 'bg-purple-100 text-purple-700';
    case LeadStatus.WON: return 'bg-green-100 text-green-700';
    case LeadStatus.LOST: return 'bg-red-100 text-red-700';
    // Deal Stage
    case DealStage.PROSPECTING: return 'bg-gray-100 text-gray-700';
    case DealStage.QUALIFICATION: return 'bg-blue-100 text-blue-700';
    case DealStage.NEEDS_ANALYSIS: return 'bg-yellow-100 text-yellow-700';
    case DealStage.PROPOSAL: return 'bg-indigo-100 text-indigo-700';
    // case DealStage.NEGOTIATION: return 'bg-purple-100 text-purple-700'; // duplicate handled by LeadStatus
    case DealStage.CLOSED_WON: return 'bg-green-100 text-green-700';
    case DealStage.CLOSED_LOST: return 'bg-red-100 text-red-700';
    // Task Status
    case TaskStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
    case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
    case TaskStatus.COMPLETED: return 'bg-green-100 text-green-700';
    case TaskStatus.DEFERRED: return 'bg-gray-100 text-gray-700';
    case TaskStatus.CANCELLED: return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

// Report Specific Constants
export const REPORT_PERIOD_OPTIONS: ReportFilterOption[] = [
  { value: 'all_time', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_90_days', label: 'Last 90 Days' },
  { value: 'year_to_date', label: 'Year to Date' },
];

export const ALL_SALES_REPS_OPTION: ReportFilterOption = { value: 'all', label: 'All Representatives' };
export const ALL_ACCOUNT_MANAGERS_OPTION: ReportFilterOption = { value: 'all', label: 'All Account Managers' };

export const getSalesRepresentativeOptions = (deals: Deal[]): ReportFilterOption[] => {
  const uniqueOwners = Array.from(new Set(deals.map(deal => deal.owner))).sort();
  return [ALL_SALES_REPS_OPTION, ...uniqueOwners.map(owner => ({ value: owner, label: owner }))];
};

export const getAccountManagerOptions = (customers: Customer[]): ReportFilterOption[] => {
  const uniqueManagers = Array.from(new Set(customers.filter(c => c.accountManager).map(c => c.accountManager!))).sort();
  return [ALL_ACCOUNT_MANAGERS_OPTION, ...uniqueManagers.map(manager => ({ value: manager, label: manager }))];
};

// User Roles for dropdowns or selection
export const USER_ROLE_OPTIONS: { value: UserRole, label: string }[] = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'sales_rep', label: 'Sales Representative' },
];

// For Activity Log Page Filters
export const ENTITY_TYPE_FILTER_OPTIONS: { value: EntityActivityLog['entityType'] | '', label: string }[] = [
    { value: '', label: 'All Entity Types' },
    { value: 'Lead', label: 'Lead' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Deal', label: 'Deal' },
    { value: 'Task', label: 'Task' },
    { value: 'Product', label: 'Product' },
    { value: 'User', label: 'User' },
    { value: 'Attachment', label: 'Attachment' },
    { value: 'System', label: 'System' },
    { value: 'CustomFieldDefinition', label: 'Custom Field Definition'},
];

export const ACTIVITY_TYPE_FILTER_OPTIONS: { value: EntityActivityType | '', label: string }[] = [
    { value: '', label: 'All Activity Types' },
    ...Object.values(EntityActivityType).map(type => ({ value: type, label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
];

// Custom Field Constants
export const CUSTOM_FIELD_TYPES_OPTIONS: { value: CustomFieldType, label: string }[] = [
    { value: 'TEXT', label: 'Text (Single Line)' },
    { value: 'TEXTAREA', label: 'Text (Multi-Line)' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'DATE', label: 'Date' },
    { value: 'SELECT', label: 'Dropdown (Select)' },
    { value: 'CHECKBOX', label: 'Checkbox (Yes/No)'},
];

export const SUPPORTED_CUSTOM_FIELD_ENTITIES: {value: CustomFieldEntityType, label: string}[] = [
    { value: 'Lead', label: 'Lead' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Deal', label: 'Deal' },
    { value: 'Task', label: 'Task' },
    { value: 'Product', label: 'Product' },
];
