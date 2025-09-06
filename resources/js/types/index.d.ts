// resources/js/types/index.ts (update your existing PageProps interface)

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

// Add Flash interface
export interface Flash {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    google_id?: string;
    avatar?: string;
    email_verified_at: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    roles?: string[];
    permissions?: string[];
    [key: string]: unknown;
}

export interface PageProps extends SharedData {
    flash?: Flash;
    [key: string]: unknown;
}

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

export interface DataTableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    searchable?: boolean;
    filterable?: boolean;
    width?: string;
    className?: string;
}

export interface DataTableFilter {
    column: string;
    values: string[];
}

export interface DataTableState {
    search: string;
    sort: string;
    direction: 'asc' | 'desc';
    perPage: number;
    page: number;
    filters: Record<string, string[]>;
    columnVisibility: Record<string, boolean>;
}

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterOptions {
    [key: string]: FilterOption[] | string[];
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface RoleIndexProps extends PageProps {
    roles: PaginatedData<Role>;
    permissions: PermissionCategory[];
    filterOptions: FilterOptions;
    queryParams: Partial<DataTableState>;
}
