<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/auth/google', [GoogleController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('google.callback');

Route::middleware(['auth', 'verified', 'check.user.status'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class)->except(['create', 'show', 'edit']);
});

// In web.php
Route::get('/test-google-config', function() {
    return [
        'client_id' => config('services.google.client_id'),
        'client_secret' => config('services.google.client_secret') ? 'Set' : 'Not set',
        'redirect' => config('services.google.redirect'),
    ];
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
