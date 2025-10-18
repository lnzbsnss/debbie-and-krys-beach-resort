<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('global access') || $this->user()->can('room access');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:big_room,small_room'],
            'description' => ['nullable', 'string'],
            'max_pax' => ['required', 'integer', 'min:1'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],
            'has_ac' => ['required', 'boolean'],
            'free_entrance_count' => ['required', 'integer', 'min:0'],
            'excess_entrance_fee' => ['required', 'numeric', 'min:0'],
            'inclusions' => ['nullable', 'array'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpeg,jpg,png,webp'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
