<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEntranceFeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('global access') || $this->user()->can('entrance fee access');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'min_age' => ['nullable', 'integer', 'min:0'],
            'max_age' => ['nullable', 'integer', 'min:0', 'gt:min_age'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
