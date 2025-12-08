<?php
// app/Http/Controllers/PublicBookingController.php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Accommodation;
use App\Models\Booking;
use App\Models\BookingAccommodation;
use App\Models\BookingEntranceFee;
use App\Models\AccommodationRate;
use App\Services\AccommodationAvailabilityService;
use App\Mail\BookingCreated;
use App\Mail\Admin\NewBookingNotification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class PublicBookingController extends Controller
{
    public function create(Request $request): Response
    {
        $selectedDate = $request->query('date', Carbon::today()->format('Y-m-d'));
        $date = Carbon::parse($selectedDate);

        $accommodations = Accommodation::with(['rates' => function ($query) {
            $query->active();
        }])
            ->active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        // Get availability for selected date
        $accommodationsWithAvailability = $accommodations->map(function ($accommodation) use ($date) {
            $dayTourAvailable = $this->isAvailableForBookingType($accommodation->id, $date, 'day_tour');
            $overnightAvailable = $this->isAvailableForBookingType($accommodation->id, $date, 'overnight');

            $dayTourRate = $accommodation->rates->where('booking_type', 'day_tour')->where('is_active', true)->first();
            $overnightRate = $accommodation->rates->where('booking_type', 'overnight')->where('is_active', true)->first();

            return [
                'id' => $accommodation->id,
                'name' => $accommodation->name,
                'type' => $accommodation->type,
                'size' => $accommodation->size,
                'is_air_conditioned' => $accommodation->is_air_conditioned,
                'min_capacity' => $accommodation->min_capacity,
                'max_capacity' => $accommodation->max_capacity,
                'first_image_url' => $accommodation->first_image_url,
                'description' => $accommodation->description,
                'rates' => $accommodation->rates,
                'day_tour_available' => $dayTourAvailable,
                'overnight_available' => $overnightAvailable,
                'day_tour_rate' => $dayTourRate,
                'overnight_rate' => $overnightRate,
            ];
        });

        return Inertia::render('booking/public-create', [
            'accommodations' => $accommodationsWithAvailability,
            'selectedDate' => $selectedDate,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // Validation rules
        $rules = [
            // User auth fields
            'user_type' => ['required', 'in:guest,register'],
            'register_name' => ['required_if:user_type,register', 'string', 'max:255'],
            'register_email' => ['required_if:user_type,register', 'email', 'max:255', 'unique:users,email'],
            'register_phone' => ['nullable', 'string', 'max:20'],
            'register_address' => ['nullable', 'string', 'max:500'],
            'register_password' => ['required_if:user_type,register', 'string', 'min:8'],
            'register_password_confirmation' => ['required_if:user_type,register', 'same:register_password'],

            // Booking fields
            'source' => ['required', 'in:guest,registered'],
            'booking_type' => ['required', 'in:day_tour,overnight'],
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['required', 'email', 'max:255'],
            'guest_phone' => ['required', 'string', 'max:20'],
            'guest_address' => ['required', 'string', 'max:500'],
            'check_in_date' => ['required', 'date', 'after_or_equal:today'],
            'total_adults' => ['required', 'integer', 'min:1'],
            'total_children' => ['required', 'integer', 'min:0'],
            'down_payment_required' => ['boolean'],
            'down_payment_amount' => ['nullable', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'accommodations' => ['required', 'array', 'min:1', 'max:1'],
            'accommodations.*.accommodation_id' => ['required', 'exists:accommodations,id'],
            'accommodations.*.accommodation_rate_id' => ['required', 'exists:accommodation_rates,id'],
            'accommodations.*.guests' => ['required', 'integer', 'min:1'],
        ];

        if ($request->input('booking_type') === 'overnight') {
            $rules['check_out_date'] = ['required', 'date', 'after:check_in_date'];
        }

        if ($request->input('down_payment_required')) {
            $rules['down_payment_amount'] = ['required', 'numeric', 'min:0.01'];
        }

        // Custom messages
        $messages = [
            'check_out_date.required' => 'Check-out date is required for overnight bookings.',
            'check_out_date.after' => 'Check-out date must be after check-in date.',
            'accommodations.max' => 'You can only select one accommodation at a time.',
            'register_email.unique' => 'This email is already registered.',
            'register_password_confirmation.same' => 'Passwords do not match.',
        ];

        $validated = $request->validate($rules, $messages);

        // Additional validation for booking
        $totalGuests = $validated['total_adults'] + $validated['total_children'];
        $accommodationGuests = collect($validated['accommodations'])->sum('guests');

        // For guest capacity validation
        if ($accommodationGuests !== $totalGuests) {
            throw ValidationException::withMessages([
                'total_adults' => "Total guests ({$totalGuests}) must match the accommodation capacity ({$accommodationGuests})."
            ]);
        }

        // For max capacity validation
        foreach ($validated['accommodations'] as $accommodationData) {
            $accommodation = Accommodation::find($accommodationData['accommodation_id']);

            if ($accommodation && $accommodation->max_capacity) {
                $guests = (int) $accommodationData['guests'];

                if ($guests > $accommodation->max_capacity) {
                    throw ValidationException::withMessages([
                        'accommodations' => "The number of guests ({$guests}) exceeds the maximum capacity ({$accommodation->max_capacity}) for {$accommodation->name}."
                    ]);
                }
            }
        }

        // Check availability
        $availabilityService = app(AccommodationAvailabilityService::class);
        $accommodationIds = collect($validated['accommodations'])
            ->pluck('accommodation_id')
            ->unique()
            ->toArray();

        $conflicts = $availabilityService->checkAvailability(
            $accommodationIds,
            $validated['check_in_date'],
            $validated['check_out_date'] ?? null
        );

        // For availability conflicts
        if (!empty($conflicts)) {
            $messages = $availabilityService->formatConflictMessages($conflicts);
            throw ValidationException::withMessages([
                'check_in_date' => implode(' ', $messages)
            ]);
        }

        // START SINGLE TRANSACTION FOR BOTH USER AND BOOKING
        DB::beginTransaction();

        try {
            $user = null;

            // Handle user registration
            if ($validated['user_type'] === 'register') {
                $user = User::create([
                    'name' => $validated['register_name'],
                    'email' => $validated['register_email'],
                    'phone' => $validated['register_phone'] ?? null,
                    'address' => $validated['register_address'] ?? null,
                    'password' => Hash::make($validated['register_password']),
                    'email_verified_at' => now(),
                    'password_changed_at' => now(),
                ]);

                // Assign customer role
                $user->assignRole('customer');

                // Login the user
                Auth::login($user);
            }

            // Create booking
            $booking = Booking::create([
                'source' => $user ? 'registered' : 'guest',
                'booking_type' => $validated['booking_type'],
                'guest_name' => $validated['guest_name'],
                'guest_email' => $validated['guest_email'],
                'guest_phone' => $validated['guest_phone'],
                'guest_address' => $validated['guest_address'],
                'check_in_date' => $validated['check_in_date'],
                'check_out_date' => $validated['check_out_date'] ?? null,
                'total_adults' => $validated['total_adults'],
                'total_children' => $validated['total_children'],
                'down_payment_required' => $validated['down_payment_required'] ?? false,
                'down_payment_amount' => $validated['down_payment_amount'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $user?->id,
                'status' => 'pending',
            ]);

            $accommodationTotal = 0;
            $entranceFeeTotal = 0;
            $totalFreeEntrances = 0;

            $numberOfNights = 1;
            if ($booking->booking_type === 'overnight' && $booking->check_out_date) {
                $checkIn = Carbon::parse($booking->check_in_date);
                $checkOut = Carbon::parse($booking->check_out_date);
                $numberOfNights = max(1, $checkOut->diffInDays($checkIn));
            }

            foreach ($validated['accommodations'] as $item) {
                $accommodation = Accommodation::findOrFail($item['accommodation_id']);
                $rate = AccommodationRate::findOrFail($item['accommodation_rate_id']);

                $baseRate = $rate->rate;
                if ($booking->booking_type === 'overnight') {
                    $baseRate = $rate->rate * $numberOfNights;
                }

                $subtotal = $baseRate;
                $additionalPaxCharge = 0;

                if ($accommodation->min_capacity && $item['guests'] > $accommodation->min_capacity) {
                    $additionalGuests = $item['guests'] - $accommodation->min_capacity;
                    $additionalPaxRate = $rate->additional_pax_rate ?? 0;

                    if ($booking->booking_type === 'overnight') {
                        $additionalPaxRate = $additionalPaxRate * $numberOfNights;
                    }

                    $additionalPaxCharge = $additionalGuests * $additionalPaxRate;
                    $subtotal += $additionalPaxCharge;
                }

                BookingAccommodation::create([
                    'booking_id' => $booking->id,
                    'accommodation_id' => $accommodation->id,
                    'accommodation_rate_id' => $rate->id,
                    'guests' => $item['guests'],
                    'rate' => $rate->rate,
                    'additional_pax_charge' => $additionalPaxCharge,
                    'subtotal' => $subtotal,
                    'free_entrance_used' => $rate->includes_free_entrance
                        ? min($item['guests'], $accommodation->min_capacity ?? 0)
                        : 0,
                ]);

                $accommodationTotal += $subtotal;

                if ($rate->includes_free_entrance) {
                    $totalFreeEntrances += min($item['guests'], $accommodation->min_capacity ?? 0);
                }
            }

            $adultsNeedingEntrance = max(0, $validated['total_adults'] - $totalFreeEntrances);
            $childrenNeedingEntrance = $validated['total_children'];

            $firstSelectedRate = AccommodationRate::find($validated['accommodations'][0]['accommodation_rate_id']);

            if ($adultsNeedingEntrance > 0 && $firstSelectedRate?->adult_entrance_fee) {
                $adultFee = $adultsNeedingEntrance * $firstSelectedRate->adult_entrance_fee;
                BookingEntranceFee::create([
                    'booking_id' => $booking->id,
                    'type' => 'adult',
                    'quantity' => $adultsNeedingEntrance,
                    'rate' => $firstSelectedRate->adult_entrance_fee,
                    'subtotal' => $adultFee,
                ]);
                $entranceFeeTotal += $adultFee;
            }

            if ($childrenNeedingEntrance > 0 && $firstSelectedRate?->child_entrance_fee) {
                $childFee = $childrenNeedingEntrance * $firstSelectedRate->child_entrance_fee;
                BookingEntranceFee::create([
                    'booking_id' => $booking->id,
                    'type' => 'child',
                    'quantity' => $childrenNeedingEntrance,
                    'rate' => $firstSelectedRate->child_entrance_fee,
                    'subtotal' => $childFee,
                ]);
                $entranceFeeTotal += $childFee;
            }

            $totalAmount = $accommodationTotal + $entranceFeeTotal;

            $booking->update([
                'accommodation_total' => $accommodationTotal,
                'entrance_fee_total' => $entranceFeeTotal,
                'total_amount' => $totalAmount,
            ]);

            $booking->load(['accommodations.accommodation', 'createdBy']);

            // COMMIT EVERYTHING AT ONCE
            DB::commit();

            // Send emails AFTER successful commit
            try {
                if ($booking->guest_email) {
                    Mail::to($booking->guest_email)->send(new BookingCreated($booking));
                }

                $adminEmails = NotificationService::getAdminStaffEmails();
                if (!empty($adminEmails)) {
                    Mail::to($adminEmails)->send(new NewBookingNotification($booking));
                }
            } catch (\Exception $e) {
                Log::error('Booking email failed: ' . $e->getMessage());
                // Don't fail the booking if email fails
            }

            $successMessage = 'Booking created successfully! Your booking code is: ' . $booking->booking_code;

            if ($validated['user_type'] === 'register') {
                $successMessage .= ' Your account has been created and you are now logged in.';
            }

            $successMessage .= ' Please check your email for confirmation.';

            return redirect()->route('home')->with('success', $successMessage);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Public booking creation failed: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->withInput()->with('error', 'Failed to create booking. Please try again.');
        }
    }

    private function isAvailableForBookingType(int $accommodationId, Carbon $date, string $bookingType): bool
    {
        $bookingAccom = \App\Models\BookingAccommodation::where('accommodation_id', $accommodationId)
            ->whereHas('booking', function ($query) use ($date, $bookingType) {
                $query->where('booking_type', $bookingType)
                    ->whereIn('status', ['pending', 'confirmed', 'checked_in'])
                    ->where(function ($q) use ($date) {
                        $q->where('check_in_date', '<=', $date)
                            ->where(function ($sub) use ($date) {
                                $sub->whereNull('check_out_date')
                                    ->orWhere('check_out_date', '>=', $date);
                            });
                    });
            })
            ->exists();

        return !$bookingAccom;
    }
}
