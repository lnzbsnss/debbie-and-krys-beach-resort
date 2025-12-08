{{-- resources/views/emails/payments/rejected.blade.php --}}
<x-mail::message>
# Payment Rejected

Dear **{{ $payment->booking->guest_name }}**,

We regret to inform you that your submitted payment has been rejected.

## Payment Details

**Payment Number:** {{ $payment->payment_number }}

**Amount:** ₱{{ number_format($payment->amount, 2) }}

**Payment Date:** {{ $payment->payment_date->format('F d, Y') }}

**Payment Method:** {{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}

@if($payment->reference_number)
**Reference Number:** {{ $payment->reference_number }}
@endif

## Booking Information

**Booking Number:** {{ $payment->booking->booking_number }}

**Outstanding Balance:** ₱{{ number_format($payment->booking->balance, 2) }}

## Next Steps

Please review your payment details and submit a new payment with correct information. If you have any questions, please contact our staff.

<x-mail::button :url="route('bookings.show', $payment->booking)">
View Booking Details
</x-mail::button>

If you believe this rejection was made in error, please contact us immediately.

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
