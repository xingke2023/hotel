<?php

return [
    'base_url'           => env('SSO_BASE_URL', 'https://mo.xingke888.com'),
    'jwt_secret'         => env('SSO_JWT_SECRET'),
    'cookie_access_ttl'  => env('SSO_COOKIE_ACCESS_TTL', 15),    // minutes
    'cookie_refresh_ttl' => env('SSO_COOKIE_REFRESH_TTL', 10080), // minutes (7 days)
];
