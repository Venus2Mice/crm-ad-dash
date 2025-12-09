# CRM Admin Dashboard - AI Agent Instructions

## Architecture Overview

This is a **React 19 + TypeScript CRM dashboard** using Vite, with client-side state management and localStorage persistence. No backend server—all data lives in browser storage.

### Core Data Flow
- **`App.tsx`** is the central state hub (~1000 lines). All entity state (`leads`, `customers`, `deals`, `tasks`, `products`, `users`) and CRUD handlers live here.
- State flows down via props through `DashboardLayout` → page components → form modals.
- Data persists to localStorage via `useEffect` hooks keyed by `crm_*` prefixes (e.g., `crm_leads`, `crm_customers`).

### Key Entity Types (see `types.ts`)
- `Lead`, `Customer`, `Deal`, `Task`, `Product` - all support soft delete (`isDeleted`, `deletedAt`) and custom fields (`customFields: Record<string, any>`).
- `User` with roles: `admin`, `manager`, `sales_rep` - permissions enforced via `utils/permissions.ts`.
- Entities link together: `Deal.customerId`, `Deal.leadId`, `Task.relatedTo`.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run preview      # Preview production build
```

**Environment:** Set `GEMINI_API_KEY` in `.env.local` for AI insights feature.

## Component Patterns

### Page Structure
Pages in `pages/` follow this pattern:
1. Receive entity arrays and handlers as props from `App.tsx`
2. Implement filtering/search with `useState` + `useMemo`
3. Use `useSortableData` hook for table sorting
4. Include `Pagination` component for large lists
5. Permission checks via `canPerformAction(currentUser, action, entityType, entity)`

Example: `LeadsPage.tsx`, `CustomersPage.tsx`, `DealsPage.tsx`

### Modal Forms
Form modals in `components/{entity}/` (e.g., `LeadFormModal.tsx`):
- Accept `initialData` prop for edit mode, `null` for create
- Handle file attachments with `filesToUpload`/`attachmentsToRemove` state
- Render custom fields using `<CustomFieldRenderer>` component
- Validate custom fields with `utils/validationUtils.ts`

### Layout
- `DashboardLayout.tsx` wraps authenticated routes with `Sidebar` + `Header`
- Uses React Router `<Outlet>` for nested route rendering
- `HashRouter` used for compatibility (not `BrowserRouter`)

## Permissions System

```typescript
// utils/permissions.ts
canPerformAction(currentUser, 'CREATE' | 'READ' | 'UPDATE' | 'DELETE', entityType, entity?)
```

- **admin**: Full access to everything including User/System management
- **manager**: CRUD on Leads/Customers/Deals/Tasks/Products, no User/System
- **sales_rep**: Create Leads/Customers/Deals/Tasks; Update/Delete only entities assigned to them

## AI Integration (Gemini)

- **Service:** `services/geminiService.ts` - calls `@google/genai` SDK
- **Dashboard Widget:** `SmartInsights.tsx` passes CRM summary data for AI-generated insights
- **Sales Forecasting:** `fetchSalesForecast()` function for predictive analytics
- API key injected via Vite's `define` config from `GEMINI_API_KEY` env var

## Activity Logging

Every entity change logs to `activityLogs` state via `addActivityLog()`:
```typescript
addActivityLog(entityId, entityType, EntityActivityType.STATUS_UPDATED, description, details?)
```
Log types defined in `types.ts` as `EntityActivityType` enum. Logs displayed in entity modals and `ActivityLogPage`.

## Custom Fields System

- Definitions stored in `customFieldDefinitions` state (persisted to `customFieldDefinitions` localStorage key)
- Configured in `SettingsPage` → `CustomFieldsSettings.tsx`
- Each definition specifies: `entityType`, `name`, `label`, `type` (TEXT, NUMBER, DATE, SELECT, etc.), `options`, `isRequired`
- Rendered dynamically via `components/shared/CustomFieldRenderer.tsx`

## Styling Conventions

- **Tailwind CSS** utility classes throughout
- Color tokens: `primary`, `primary-dark`, `light-bg`, `dark-text`, `medium-text`
- Common patterns: `bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow`
- Icons from `components/ui/Icon.tsx` (Heroicons-style SVG components)

## File Organization

```
components/
  auth/          # ProtectedRoute
  customers/     # CustomerFormModal
  dashboard/     # Charts, Stats, SmartInsights, MyTasksWidget
  deals/         # DealFormModal
  layout/        # DashboardLayout, Header, Sidebar
  leads/         # LeadFormModal
  shared/        # CustomFieldRenderer (reusable across entities)
  ui/            # Generic: Spinner, Pagination, ConfirmationModal, Icon, SortIcon
services/        # geminiService, csvExporter, reportUtils
utils/           # permissions, validationUtils, dateUtils
hooks/           # useSortableData
```

## When Adding New Entities

1. Define interface in `types.ts` with `isDeleted`, `deletedAt`, `customFields` fields
2. Add mock data to `constants.ts`
3. Create state + handlers in `App.tsx` (follow existing patterns like `handleSaveLead`)
4. Add localStorage persistence effect in `App.tsx`
5. Create page component in `pages/`
6. Create form modal in `components/{entity}/`
7. Add route in `App.tsx` routes
8. Add to `NAVIGATION_ITEMS` in `constants.ts`
9. Update `GlobalSearchResult` type and search handler in `App.tsx`
