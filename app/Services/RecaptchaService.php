<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecaptchaService
{
    public function verify(string $token, string $action, float $minScore = 0.5): bool
    {
        // Skip verification in local environment if no secret key is configured
        if (app()->environment('local') && !config('services.recaptcha.secret_key')) {
            Log::info('reCAPTCHA verification skipped in local environment');
            return true;
        }

        // If no secret key is configured in any environment, fail
        if (!config('services.recaptcha.secret_key')) {
            Log::error('reCAPTCHA secret key not configured');
            return false;
        }

        try {
            $response = Http::withOptions([
                'verify' => $this->shouldVerifySSL(),
                'timeout' => 30,
                'connect_timeout' => 10,
            ])->asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => config('services.recaptcha.secret_key'),
                'response' => $token,
                'remoteip' => request()->ip(), // Optional but recommended
            ]);

            if (!$response->successful()) {
                Log::error('reCAPTCHA API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return false;
            }

            $result = $response->json();

            // Log the response for debugging
            Log::info('reCAPTCHA verification response', [
                'success' => $result['success'] ?? false,
                'score' => $result['score'] ?? null,
                'action' => $result['action'] ?? null,
                'error_codes' => $result['error-codes'] ?? null
            ]);

            // Check for API errors
            if (!($result['success'] ?? false)) {
                Log::warning('reCAPTCHA verification failed', [
                    'error_codes' => $result['error-codes'] ?? []
                ]);
                return false;
            }

            // For v3, check score and action
            if (isset($result['score'])) {
                $scoreCheck = $result['score'] >= $minScore;
                $actionCheck = $result['action'] === $action;

                Log::info('reCAPTCHA v3 verification', [
                    'score' => $result['score'],
                    'min_score' => $minScore,
                    'score_passed' => $scoreCheck,
                    'action_expected' => $action,
                    'action_received' => $result['action'],
                    'action_passed' => $actionCheck
                ]);

                return $scoreCheck && $actionCheck;
            }

            // For v2, just check success
            return true;

        } catch (\Exception $e) {
            Log::error('reCAPTCHA verification exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // In production, you might want to return false here
            // In development, you might want to return true to avoid blocking
            return app()->environment('local');
        }
    }

    /**
     * Determine if SSL verification should be enabled
     */
    private function shouldVerifySSL(): bool
    {
        // Check if SSL verification is explicitly disabled
        if (config('app.disable_ssl_verify', false)) {
            return false;
        }

        // In local environment, you might want to disable SSL verification
        if (app()->environment('local') && config('app.local_disable_ssl', false)) {
            return false;
        }

        // Default to true (verify SSL)
        return true;
    }
}
