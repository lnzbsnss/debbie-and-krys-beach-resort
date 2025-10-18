<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;
use App\Models\Cottage;
use App\Models\EntranceFee;

class BeachResortSeeder extends Seeder
{
    public function run(): void
    {
        // Rooms
        Room::create([
            'name' => 'Big Room (AC)',
            'type' => 'big_room',
            'description' => 'Air-conditioned big room with free small cottage and entrance',
            'max_pax' => 6,
            'base_price' => 4500.00,
            'quantity' => 2,
            'has_ac' => true,
            'free_entrance_count' => 6,
            'excess_entrance_fee' => 150.00,
            'inclusions' => json_encode([
                'free_cottage' => 'small',
                'free_entrance' => 6
            ]),
            'is_active' => true,
        ]);

        Room::create([
            'name' => 'Small Room (AC)',
            'type' => 'small_room',
            'description' => 'Air-conditioned small room with free small cottage and entrance',
            'max_pax' => 4,
            'base_price' => 3500.00,
            'quantity' => 1,
            'has_ac' => true,
            'free_entrance_count' => 4,
            'excess_entrance_fee' => 150.00,
            'inclusions' => json_encode([
                'free_cottage' => 'small',
                'free_entrance' => 4
            ]),
            'is_active' => true,
        ]);

        // Cottages
        Cottage::create([
            'name' => 'Big Cottage',
            'size' => 'big',
            'description' => 'Big cottage for day tour or overnight',
            'max_pax' => 15, // max for overnight
            'day_tour_price' => 800.00,
            'overnight_price' => 1000.00,
            'quantity' => 3,
            'is_active' => true,
        ]);

        Cottage::create([
            'name' => 'Small Cottage',
            'size' => 'small',
            'description' => 'Small cottage for 8-10 pax day tour or 8 pax overnight',
            'max_pax' => 10, // max for day tour
            'day_tour_price' => 400.00,
            'overnight_price' => 600.00,
            'quantity' => 0, // adjust based on how many you have
            'is_active' => true,
        ]);

        // Entrance Fees
        EntranceFee::create([
            'name' => 'Day Tour - Adult',
            'type' => 'day_tour_adult',
            'price' => 100.00,
            'min_age' => 6,
            'max_age' => null,
            'is_active' => true,
        ]);

        EntranceFee::create([
            'name' => 'Day Tour - Child (5 years & below)',
            'type' => 'day_tour_child',
            'price' => 50.00,
            'min_age' => 0,
            'max_age' => 5,
            'is_active' => true,
        ]);

        EntranceFee::create([
            'name' => 'Overnight - Per Head',
            'type' => 'overnight',
            'price' => 150.00,
            'min_age' => null,
            'max_age' => null,
            'is_active' => true,
        ]);
    }
}
