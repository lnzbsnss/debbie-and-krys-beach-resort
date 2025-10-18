import type { PaginatedData, FilterOptions, DataTableState } from './datatable';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    roles: string[];
    permissions: string[];
}

export interface UserData extends User {
    status_label: string;
    email_verified: string;
    email_verified_status: 'verified' | 'unverified';
    roles_text: string;
    roles_count: number;
    can_edit: boolean;
    can_delete: boolean;
    is_admin: boolean;
}

export interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    status: string;
    email_verified_at: boolean;
    roles: string[];
}

export interface UserRole {
    id: number;
    name: string;
    label: string;
}

export interface UserIndexData {
    users: PaginatedData<UserData>;
    availableRoles: UserRole[];
    filterOptions: FilterOptions;
    queryParams: Partial<DataTableState>;
}
