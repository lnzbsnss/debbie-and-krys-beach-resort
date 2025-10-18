<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();

        // Check if account is inactive
        if ($user->status === 'inactive') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('error', 'Your account is inactive. Please contact an administrator.');
        }

        // Check if account is locked
        if ($user->is_locked) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('error', 'Your account has been locked. Please contact an administrator.');
        }

        // Check if first time login (password not changed yet)
        if (is_null($user->password_changed_at)) {
            return redirect()->route('password.first-time');
        }

        return $next($request);
    }
}
