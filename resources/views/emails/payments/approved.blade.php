{{-- resources/views/emails/payments/approved.blade.php --}}
<x-mail::message>
# Payment Approved

Dear **{{ $payment->booking->guest_name }}**,

Your payment has been approved and processed successfully.

## Payment Details

**Payment Number:** {{ $payment->payment_number }}

**Amount:** ₱{{ number_format($payment->amount, 2) }}

**Payment Date:** {{ $payment->payment_date->format('F d, Y') }}

**Payment Method:** {{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}

@if($payment->reference_number)
**Reference Number:** {{ $payment->reference_number }}
@endif

@if($payment->is_down_payment)
**Type:** Down Payment
@endif

## Booking Information

**Booking Number:** {{ $payment->booking->booking_number }}

**Total Amount:** ₱{{ number_format($payment->booking->total_amount, 2) }}

**Paid Amount:** ₱{{ number_format($payment->booking->paid_amount, 2) }}

**Balance:** ₱{{ number_format($payment->booking->balance, 2) }}

<x-mail::button :url="route('bookings.show', $payment->booking)">
View Booking Details
</x-mail::button>

Thank you for your payment!

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
