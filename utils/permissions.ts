
import { User, Lead, Customer, Deal, Task, Product, UserRole } from '../types'; // Added Product

export type ActionType = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
export type EntityType = 'Lead' | 'Customer' | 'Deal' | 'Task' | 'User' | 'System' | 'Product'; // User, System, Product added

// Helper to get the owner/assignee field name for each entity
const getOwnerField = (entityType: Exclude<EntityType, 'User' | 'System' | 'Product'>): keyof Lead | keyof Customer | keyof Deal | keyof Task | null => {
    switch (entityType) {
        case 'Lead': return 'assignedTo';
        case 'Customer': return 'accountManager';
        case 'Deal': return 'owner';
        case 'Task': return 'assignedTo';
        default: return null; // Should not happen with Exclude
    }
};

export const canPerformAction = (
    currentUser: User | null,
    action: ActionType,
    entityType: EntityType,
    entity?: Lead | Customer | Deal | Task | User | Product | null, 
): boolean => {
    if (!currentUser) return false;

    const { role, name: currentUserName, id: currentUserId } = currentUser;

    // Admins can do anything, including updating system settings and managing products
    if (role === 'admin') return true;

    // Managers
    if (role === 'manager') {
        switch (entityType) {
            case 'Lead':
            case 'Customer':
            case 'Deal':
            case 'Task':
            case 'Product': // Managers can manage products
                return true; 
            case 'User': 
            case 'System': // Managers cannot manage users or system settings by default
                return false;
            default:
                return false;
        }
    }

    // Sales Reps
    if (role === 'sales_rep') {
        if (entityType === 'User' || entityType === 'System') return false; // Reps cannot manage users or system

        switch (action) {
            case 'CREATE':
                return entityType === 'Lead' || entityType === 'Customer' || entityType === 'Deal' || entityType === 'Task'; // Reps cannot create Products directly from Product page
            case 'READ':
                 // Reps can read products (e.g. to add to deals)
                return entityType === 'Lead' || entityType === 'Customer' || entityType === 'Deal' || entityType === 'Task' || entityType === 'Product';
            case 'UPDATE':
            case 'DELETE':
                if (entityType === 'Product') return false; // Reps cannot update/delete products

                if (!entity) return false; 

                const ownerField = getOwnerField(entityType as Exclude<EntityType, 'User' | 'System' | 'Product'>); 
                if (!ownerField) return false;

                const genericEntity = entity as any; 
                const entityOwnerName = genericEntity[ownerField];
                
                if (entityType === 'Task') {
                    const task = entity as Task;
                    if (task.createdBy?.id === currentUserId) return true;
                }

                return entityOwnerName === currentUserName;
            default:
                return false;
        }
    }

    return false; 
};
