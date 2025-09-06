<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- SEO Meta Tags -->
        <meta name="description" content="Debbie & Krys Beach Resort, Sampaguita, Bauan, Batangas, Philippines">
        <meta name="keywords" content="debbie, krys, beach, resort, sampaguita, bauan, batangas, philippines">
        <meta name="author" content="Debbie & Krys Beach Resort">
        <meta name="robots" content="index, follow">

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

        <script src="https://www.google.com/recaptcha/api.js"></script>
    </body>
</html>
