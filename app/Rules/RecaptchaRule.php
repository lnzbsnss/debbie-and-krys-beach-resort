<?php

namespace App\Rules;

use App\Services\RecaptchaService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class RecaptchaRule implements ValidationRule
{
    public function __construct(
        private string $action,
        private float $minScore = 0.5
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $recaptchaService = app(RecaptchaService::class);

        if (!$recaptchaService->verify($value, $this->action, $this->minScore)) {
            $fail('reCAPTCHA verification failed. Please try again.');
        }
    }
}
