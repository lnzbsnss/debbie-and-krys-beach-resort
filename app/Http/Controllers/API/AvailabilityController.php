<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class AvailabilityController extends Controller
{
    public function check(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
            'booking_type' => 'required|in:day_tour,overnight',
        ]);

        $date = Carbon::parse($request->date);
        $bookingType = $request->booking_type;

        $accommodations = Accommodation::with(['rates' => function ($query) {
            $query->active();
        }])
            ->active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $accommodationsWithAvailability = $accommodations->map(function ($accommodation) use ($date, $bookingType) {
            // Check availability for each booking type using the same logic as CalendarController
            $dayTourAvailable = $this->isAvailableForBookingType($accommodation->id, $date, 'day_tour');
            $overnightAvailable = $this->isAvailableForBookingType($accommodation->id, $date, 'overnight');

            // Get rates
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
                'day_tour_available' => $dayTourAvailable,
                'overnight_available' => $overnightAvailable,
                'day_tour_rate' => $dayTourRate ? [
                    'id' => $dayTourRate->id,
                    'rate' => $dayTourRate->rate,
                    'additional_pax_rate' => $dayTourRate->additional_pax_rate,
                    'adult_entrance_fee' => $dayTourRate->adult_entrance_fee,
                    'child_entrance_fee' => $dayTourRate->child_entrance_fee,
                    'child_max_age' => $dayTourRate->child_max_age,
                    'includes_free_cottage' => $dayTourRate->includes_free_cottage,
                    'includes_free_entrance' => $dayTourRate->includes_free_entrance,
                ] : null,
                'overnight_rate' => $overnightRate ? [
                    'id' => $overnightRate->id,
                    'rate' => $overnightRate->rate,
                    'additional_pax_rate' => $overnightRate->additional_pax_rate,
                    'adult_entrance_fee' => $overnightRate->adult_entrance_fee,
                    'child_entrance_fee' => $overnightRate->child_entrance_fee,
                    'child_max_age' => $overnightRate->child_max_age,
                    'includes_free_cottage' => $overnightRate->includes_free_cottage,
                    'includes_free_entrance' => $overnightRate->includes_free_entrance,
                ] : null,
                'rates' => $accommodation->rates,
            ];
        })->values();

        return response()->json([
            'accommodations' => $accommodationsWithAvailability,
        ]);
    }

    public function checkMonth(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'booking_type' => 'required|in:day_tour,overnight',
        ]);

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $bookingType = $request->booking_type;

        $accommodations = Accommodation::active()->get();
        $totalAccommodations = $accommodations->count();

        $availability = [];
        $period = CarbonPeriod::create($startDate, $endDate);

        foreach ($period as $date) {
            $availableCount = 0;

            foreach ($accommodations as $accommodation) {
                // Check if accommodation has a rate for this booking type
                $hasRate = $accommodation->rates()
                    ->where('booking_type', $bookingType)
                    ->where('is_active', true)
                    ->exists();

                // Use the same availability check as CalendarController
                if ($hasRate && $this->isAvailableForBookingType($accommodation->id, $date, $bookingType)) {
                    $availableCount++;
                }
            }

            $bookedCount = $totalAccommodations - $availableCount;

            $status = 'available';
            if ($availableCount === 0) {
                $status = 'full';
            } elseif ($bookedCount > 0) {
                $status = 'partial';
            }

            $availability[$date->format('Y-m-d')] = [
                'total' => $totalAccommodations,
                'available' => $availableCount,
                'booked' => $bookedCount,
                'status' => $status,
            ];
        }

        return response()->json([
            'availability' => $availability,
        ]);
    }

    /**
     * Same logic as CalendarController::isAvailableForBookingType
     */
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
