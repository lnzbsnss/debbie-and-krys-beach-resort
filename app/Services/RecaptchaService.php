<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RecaptchaService
{
    public function verify(string $token, string $action, float $minScore = 0.5): bool
    {
        if (app()->environment('local') && !config('services.recaptcha.secret_key')) {
            return true;
        }

        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => config('services.recaptcha.secret_key'),
            'response' => $token,
        ]);

        $result = $response->json();

        return $result['success'] &&
            $result['score'] >= $minScore &&
            $result['action'] === $action;
    }
}
