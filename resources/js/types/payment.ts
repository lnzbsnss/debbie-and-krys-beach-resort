// resources/js/types/payment.ts
import type { PaginatedData } from './datatable';
import type { User } from './user';

// Update Payment interface in booking.ts
export interface Payment {
    id: number;
    booking_id: number;
    rebooking_id: number | null;
    payment_number: string;
    amount: string;
    is_down_payment: boolean;
    is_rebooking_payment: boolean;
    payment_account_id: number | null;
    reference_number: string | null;
    reference_image: string | null;
    reference_image_url: string | null;
    notes: string | null;
    received_by: number | null;
    created_by: number | null;
    status: 'pending' | 'approved' | 'rejected';
    payment_date: string;
    created_at: string;
    updated_at: string;
    payment_method: string;
    refunded_amount: string;
    remaining_amount: string;
    booking?: import('./booking').Booking;
    rebooking?: import('./booking').Rebooking;
    payment_account?: import('./payment-account').PaymentAccount;
    received_by_user?: User;
    created_by_user?: User;
    refunds?: import('./booking').Refund[];
}

export interface PaymentFormData {
    booking_id: string;
    rebooking_id?: string;
    amount: string;
    payment_account_id?: string;
    is_down_payment?: boolean;
    is_rebooking_payment?: boolean;
    reference_number?: string;
    reference_image?: File | null;
    remove_reference_image?: boolean;
    notes?: string;
    payment_date: string;
    status?: 'pending' | 'approved' | 'rejected';
}
