<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Booking;
use App\Models\PaymentAccount;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Requests\Payment\UpdatePaymentRequest;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Mail;
use App\Services\NotificationService;
use App\Mail\PaymentReceived;
use App\Mail\Admin\NewPaymentNotification;
use App\Mail\PaymentApproved;
use App\Mail\PaymentRejected;

class PaymentController extends Controller
{
    use HandlesImageUpload;

    public function __construct()
    {
        $this->middleware('permission:payment show|global access')->only(['index', 'show', 'showReferenceImage']);
        $this->middleware('permission:payment create|global access')->only(['create', 'store']);
        $this->middleware('permission:payment edit|global access')->only(['edit', 'update']);
        $this->middleware('permission:payment delete|global access')->only('destroy');
    }

    public function index(): Response
    {
        $query = Payment::with(['booking', 'rebooking', 'paymentAccount', 'receivedByUser', 'createdBy']);

        // Customers can only see payments for their own bookings
        if (auth()->user()->hasRole('customer')) {
            $query->whereHas('booking', function ($q) {
                $q->where('created_by', auth()->id());
            });
        }

        $payments = $query->latest('payment_date')->paginate(100);

        return Inertia::render('payment/index', [
            'payments' => $payments,
        ]);
    }

    public function create(): Response
    {
        // Allow customers to create payments
        $query = Booking::query();

        if (auth()->user()->hasRole('customer')) {
            $query->where('created_by', auth()->id());
        }

        $bookings = $query->get()
            ->filter(function ($booking) {
                return $booking->balance > 0;
            })
            ->values();

        $paymentAccounts = PaymentAccount::active()
            ->ordered()
            ->get();

        return Inertia::render('payment/create', [
            'bookings' => $bookings,
            'payment_accounts' => $paymentAccounts,
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();

            if ($request->hasFile('reference_image')) {
                $data['reference_image'] = $this->uploadImageToPrivate(
                    $request->file('reference_image'),
                    'payments'
                );
            }

            // Set status based on role
            if (auth()->user()->hasRole('customer')) {
                $data['status'] = 'pending';
                $data['created_by'] = auth()->id();
            } else {
                // Admin/Staff can create approved payments directly
                $data['status'] = 'approved';
                $data['received_by'] = auth()->id();
                $data['created_by'] = auth()->id();
            }

            $payment = Payment::create($data);
            $payment->load(['booking', 'paymentAccount', 'receivedByUser', 'createdBy']);

            DB::commit();

            // Send email notifications
            try {
                if (auth()->user()->hasRole('customer')) {
                    // Notify admins about new customer payment
                    $adminEmails = NotificationService::getAdminStaffEmails();
                    if (!empty($adminEmails)) {
                        Mail::to($adminEmails)->send(new NewPaymentNotification($payment));
                    }
                } else {
                    // Send to customer for admin-created payment
                    if ($payment->booking->guest_email) {
                        Mail::to($payment->booking->guest_email)->send(new PaymentReceived($payment));
                    }
                }
            } catch (\Exception $e) {
                Log::error('Payment email failed: ' . $e->getMessage());
            }

            return redirect()->route('bookings.show', $payment->booking)
                ->with('success', auth()->user()->hasRole('customer')
                    ? 'Payment submitted for approval.'
                    : 'Payment recorded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(Payment $payment): Response
    {
        // Check if customer is trying to view someone else's payment
        if (auth()->user()->hasRole('customer') && $payment->booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $payment->load(['booking', 'rebooking', 'paymentAccount', 'receivedByUser', 'createdBy', 'refunds']);

        return Inertia::render('payment/show', [
            'payment' => $payment,
        ]);
    }

    public function edit(Payment $payment): Response
    {
        // Customers can only edit pending payments they created
        if (auth()->user()->hasRole('customer')) {
            if ($payment->booking->created_by !== auth()->id()) {
                abort(403, 'Unauthorized action.');
            }
            if ($payment->status !== 'pending') {
                abort(403, 'Cannot edit approved or rejected payment.');
            }
        }

        $payment->load(['rebooking']);

        $paymentAccounts = PaymentAccount::active()
            ->ordered()
            ->get();

        return Inertia::render('payment/edit', [
            'payment' => $payment,
            'payment_accounts' => $paymentAccounts,
        ]);
    }

    public function update(UpdatePaymentRequest $request, Payment $payment): RedirectResponse
    {
        // Customers can only edit pending payments they created
        if (auth()->user()->hasRole('customer')) {
            if ($payment->booking->created_by !== auth()->id()) {
                abort(403, 'Unauthorized action.');
            }
            if ($payment->status !== 'pending') {
                abort(403, 'Cannot edit approved or rejected payment.');
            }
        }

        DB::beginTransaction();
        try {
            $data = $request->validated();

            if ($request->hasFile('reference_image')) {
                if ($payment->reference_image) {
                    $this->deleteImageFromPrivate($payment->reference_image);
                }

                $data['reference_image'] = $this->uploadImageToPrivate(
                    $request->file('reference_image'),
                    'payments'
                );
            } elseif ($request->input('remove_reference_image')) {
                if ($payment->reference_image) {
                    $this->deleteImageFromPrivate($payment->reference_image);
                }
                $data['reference_image'] = null;
            }

            // Keep status pending for customer edits
            if (auth()->user()->hasRole('customer')) {
                $data['status'] = 'pending';
            }

            $payment->update($data);

            DB::commit();

            return redirect()->route('bookings.show', $payment->booking)
                ->with('success', 'Payment updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        // Customers can only delete pending payments they created
        if (auth()->user()->hasRole('customer')) {
            if ($payment->booking->created_by !== auth()->id()) {
                abort(403, 'Unauthorized action.');
            }
            if ($payment->status !== 'pending') {
                abort(403, 'Cannot delete approved or rejected payment.');
            }
        }

        DB::beginTransaction();
        try {
            $booking = $payment->booking;

            if ($payment->reference_image) {
                $this->deleteImageFromPrivate($payment->reference_image);
            }

            $payment->delete();

            DB::commit();

            return redirect()->route('bookings.show', $booking)
                ->with('success', 'Payment deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function approve(Payment $payment): RedirectResponse
    {
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        DB::beginTransaction();
        try {
            $payment->update([
                'status' => 'approved',
                'received_by' => auth()->id(),
            ]);

            $payment->load('booking');

            DB::commit();

            // Send approval email
            try {
                if ($payment->booking->guest_email) {
                    Mail::to($payment->booking->guest_email)->send(new PaymentApproved($payment));
                }
            } catch (\Exception $e) {
                Log::error('Payment approval email failed: ' . $e->getMessage());
            }

            return back()->with('success', 'Payment approved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function reject(Payment $payment): RedirectResponse
    {
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        DB::beginTransaction();
        try {
            $payment->update(['status' => 'rejected']);

            $payment->load('booking');

            DB::commit();

            // Send rejection email
            try {
                if ($payment->booking->guest_email) {
                    Mail::to($payment->booking->guest_email)->send(new PaymentRejected($payment));
                }
            } catch (\Exception $e) {
                Log::error('Payment rejection email failed: ' . $e->getMessage());
            }

            return back()->with('success', 'Payment rejected successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function showReferenceImage(Payment $payment): StreamedResponse
    {
        if (!$payment->reference_image || !Storage::disk('public')->exists($payment->reference_image)) {
            abort(404);
        }

        return Storage::disk('public')->response($payment->reference_image);
    }

    protected function uploadImageToPrivate($file, string $folder): string
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $sanitizedName = \Illuminate\Support\Str::slug($originalName);
        $timestamp = now()->timestamp;
        $filename = "{$sanitizedName}_{$timestamp}.{$extension}";

        return $file->storeAs($folder, $filename, 'public');
    }

    protected function deleteImageFromPrivate(?string $path): bool
    {
        if ($path && Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }

        return false;
    }
}
