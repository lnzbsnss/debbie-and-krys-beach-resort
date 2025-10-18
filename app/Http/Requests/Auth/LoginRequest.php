<?php

namespace App\Http\Requests\Auth;

use App\Rules\RecaptchaRule;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'recaptcha_token' => ['required', 'string', new RecaptchaRule('login')],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        // Clear timeout count on successful login
        Cache::forget($this->timeoutCountKey());

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        // Check if this is the 5th timeout (25 failed attempts total)
        $timeoutCount = Cache::get($this->timeoutCountKey(), 0);

        if ($timeoutCount >= 4) { // 4 previous timeouts + this one = 5 timeouts
            $this->lockUserAccount();
        } else {
            Cache::put($this->timeoutCountKey(), $timeoutCount + 1, now()->addDay());
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    protected function lockUserAccount(): void
    {
        $user = \App\Models\User::where('email', $this->email)->first();

        if ($user) {
            $user->update(['is_locked' => true]);
            Cache::forget($this->timeoutCountKey());

            throw ValidationException::withMessages([
                'email' => 'Your account has been locked due to multiple failed login attempts. Please contact an administrator.',
            ]);
        }
    }

    protected function timeoutCountKey(): string
    {
        return 'login.timeout.count:' . Str::transliterate(Str::lower($this->string('email')));
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return $this->string('email')
            ->lower()
            ->append('|'.$this->ip())
            ->transliterate()
            ->value();
    }
}
