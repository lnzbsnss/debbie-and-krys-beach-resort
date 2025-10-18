// resources/js/types/room.ts
import type { PaginatedData, FilterOptions, DataTableState } from './datatable';

export interface Room {
    id: number;
    name: string;
    type: string;
    description: string | null;
    max_pax: number;
    base_price: number;
    quantity: number;
    has_ac: boolean;
    free_entrance_count: number;
    excess_entrance_fee: number;
    inclusions: RoomInclusions | null;
    images: string[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface RoomInclusions {
    free_cottage?: string;
    free_entrance?: number;
}

export interface RoomData extends Room {
    available_quantity: number;
    type_label: string;
    status_label: string;
    formatted_base_price: string;
    formatted_excess_fee: string;
}

export interface RoomFormData {
    name: string;
    type: string;
    description: string | null;
    max_pax: number;
    base_price: number;
    quantity: number;
    has_ac: boolean;
    free_entrance_count: number;
    excess_entrance_fee: number;
    inclusions: RoomInclusions | null;
    images: string[] | null;
    is_active: boolean;
}

export interface RoomIndexData {
    rooms: PaginatedData<RoomData>;
    filterOptions: FilterOptions;
    queryParams: Partial<DataTableState>;
}
