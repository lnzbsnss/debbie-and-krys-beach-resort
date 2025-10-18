// resources/js/types/entrance-fee.ts
import type { PaginatedData, FilterOptions, DataTableState } from './datatable';

export interface EntranceFee {
    id: number;
    name: string;
    type: string;
    price: number;
    min_age: number | null;
    max_age: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface EntranceFeeData extends EntranceFee {
    type_label: string;
    status_label: string;
    formatted_price: string;
    age_range: string;
}

export interface EntranceFeeFormData {
    name: string;
    type: string;
    price: number;
    min_age: number | null;
    max_age: number | null;
    is_active: boolean;
}

export interface EntranceFeeIndexData {
    entranceFees: PaginatedData<EntranceFeeData>;
    filterOptions: FilterOptions;
    queryParams: Partial<DataTableState>;
}
