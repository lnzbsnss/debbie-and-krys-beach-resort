<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EntranceFee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'price',
        'min_age',
        'max_age',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'min_age' => 'integer',
        'max_age' => 'integer',
        'is_active' => 'boolean',
    ];
}
