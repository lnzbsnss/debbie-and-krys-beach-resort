import type { PaginatedData, FilterOptions, DataTableState } from './datatable';

export interface Role {
    id: number;
    name: string;
    display_name: string;
    users_count: number;
    users_count_text: string;
    permissions: string[];
    permissions_count: number;
    permissions_text: string;
    can_edit: boolean;
    can_delete: boolean;
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: number;
    name: string;
    label: string;
}

export interface PermissionCategory {
    category: string;
    permissions: Permission[];
}

export interface RoleFormData {
    name: string;
    permissions: string[];
}

// Export this interface
export interface RoleIndexData {
    roles: PaginatedData<Role>;
    permissions: PermissionCategory[];
    filterOptions: FilterOptions;
    queryParams: Partial<DataTableState>;
}
