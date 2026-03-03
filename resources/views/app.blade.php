<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="referrer" content="never">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', '澳门酒店特价房间') }}</title>

        {{-- SEO Meta Tags --}}
        <meta name="description" content="澳门酒店特价房间预订平台，提供澳门各大酒店优惠房间、特价房源信息。澳门住宿、酒店预订、投资工具一站式服务。">
        <meta name="keywords" content="澳门酒店,特价房间,澳门住宿,酒店预订,澳门房源,澳门旅游,酒店优惠,澳门投资">
        <meta name="author" content="aomen.chat">

        {{-- Open Graph / Facebook --}}
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ config('app.name', '澳门酒店特价房间') }}">
        <meta property="og:description" content="澳门酒店特价房间预订平台，提供澳门各大酒店优惠房间、特价房源信息。">
        <meta property="og:image" content="{{ asset('images/og-image.jpg') }}">

        {{-- Twitter --}}
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url()->current() }}">
        <meta property="twitter:title" content="{{ config('app.name', '澳门酒店特价房间') }}">
        <meta property="twitter:description" content="澳门酒店特价房间预订平台，提供澳门各大酒店优惠房间、特价房源信息。">
        <meta property="twitter:image" content="{{ asset('images/og-image.jpg') }}">

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
