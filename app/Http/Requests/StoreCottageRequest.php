<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCottageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('global access') || $this->user()->can('cottage access');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'size' => ['required', 'string', 'in:big,small'],
            'description' => ['nullable', 'string'],
            'max_pax' => ['required', 'integer', 'min:1'],
            'day_tour_price' => ['required', 'numeric', 'min:0'],
            'overnight_price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpeg,jpg,png,webp'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
