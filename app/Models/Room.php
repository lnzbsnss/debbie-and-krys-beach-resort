<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'description',
        'max_pax',
        'base_price',
        'quantity',
        'has_ac',
        'free_entrance_count',
        'excess_entrance_fee',
        'inclusions',
        'images',
        'is_active',
    ];

    protected $casts = [
        'max_pax' => 'integer',
        'base_price' => 'decimal:2',
        'quantity' => 'integer',
        'has_ac' => 'boolean',
        'free_entrance_count' => 'integer',
        'excess_entrance_fee' => 'decimal:2',
        'inclusions' => 'array',
        'images' => 'array',
        'is_active' => 'boolean',
    ];
}
