<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Debbie & Krys Beach Resort') }}</title>

        <style>
            html {
                background-color: oklch(1 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Debbie & Krys Beach Resort') }}</title>

        <link rel="icon" href="/dk-logo.png" type="image/png">
        <link rel="icon" href="/dk-logo.png" sizes="32x32" type="image/png">
        <link rel="icon" href="/dk-logo.png" sizes="16x16" type="image/png">
        <link rel="apple-touch-icon" href="/dk-logo.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
        <div class="min-h-screen bg-gray-50">
            <header class="border-b border-gray-200 bg-white">
                <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div class="flex h-16 items-center justify-between">
                        <a
                            href="/dashboard"
                            class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Back to Dashboard
                        </a>
                    </div>
                </div>
            </header>

            <!-- Pulse Dashboard -->
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <x-pulse>
                    <livewire:pulse.servers cols="full" />
                    <livewire:pulse.usage cols="4" rows="2" />
                    <livewire:pulse.queues cols="4" />
                    <livewire:pulse.cache cols="4" />
                    <livewire:pulse.slow-queries cols="8" />
                    <livewire:pulse.exceptions cols="6" />
                    <livewire:pulse.slow-requests cols="6" />
                    <livewire:pulse.slow-jobs cols="6" />
                    <livewire:pulse.slow-outgoing-requests cols="6" />
                </x-pulse>
            </div>
        </div>
    </body>
</html>
