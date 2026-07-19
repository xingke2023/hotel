<?php

namespace App\Http\Middleware;

use App\Services\SsoAuthService;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

class VerifySsoToken
{
    public function __construct(private SsoAuthService $sso) {}

    public function handle(Request $request, \Closure $next): Response
    {
        $accessToken  = $request->cookie('access_token');
        $refreshToken = $request->cookie('refresh_token');

        if (! $accessToken) {
            return $next($request);
        }

        try {
            $payload = $this->sso->decodeToken($accessToken);
            $user    = $this->sso->resolveLocalUser($payload);
            Auth::login($user, false);
            return $next($request);

        } catch (ExpiredException) {
            if (! $refreshToken) {
                return $this->clearAndRedirect($request);
            }

            $tokens = $this->sso->refresh($refreshToken);

            if (! $tokens) {
                return $this->clearAndRedirect($request);
            }

            try {
                $payload = $this->sso->decodeToken($tokens['accessToken']);
            } catch (\Throwable) {
                return $this->clearAndRedirect($request);
            }

            $user = $this->sso->resolveLocalUser($payload);
            Auth::login($user, false);

            $response = $next($request);

            return $this->attachCookies($response, $tokens['accessToken'], $tokens['refreshToken']);

        } catch (SignatureInvalidException | \UnexpectedValueException) {
            return $this->clearAndRedirect($request);
        }
    }

    private function clearAndRedirect(Request $request): Response
    {
        $response = redirect()->route('login')
            ->with('status', '登录已过期，请重新登录');

        $response->withCookie(Cookie::forget('access_token'));
        $response->withCookie(Cookie::forget('refresh_token'));

        return $response;
    }

    private function attachCookies(Response $response, string $accessToken, string $refreshToken): Response
    {
        $response->cookie(
            'access_token', $accessToken,
            config('sso.cookie_access_ttl'),
            '/', null, config('app.env') === 'production', true, false, 'Lax'
        );
        $response->cookie(
            'refresh_token', $refreshToken,
            config('sso.cookie_refresh_ttl'),
            '/', null, config('app.env') === 'production', true, false, 'Lax'
        );

        return $response;
    }
}
