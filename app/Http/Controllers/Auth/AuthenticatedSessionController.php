<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\SsoAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function __construct(private SsoAuthService $sso) {}

    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'login'    => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        try {
            $tokens = $this->sso->login($request->login, $request->password);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['login' => $e->getMessage()])->withInput();
        }

        $payload = $this->sso->decodeToken($tokens['accessToken']);
        $user    = $this->sso->resolveLocalUser($payload);

        Auth::login($user, false);

        return $this->attachCookies(
            redirect()->intended('/'),
            $tokens['accessToken'],
            $tokens['refreshToken']
        );
    }

    public function destroy(Request $request): RedirectResponse
    {
        $refreshToken = $request->cookie('refresh_token');

        if ($refreshToken) {
            $this->sso->logout($refreshToken);
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')
            ->withCookie(Cookie::forget('access_token'))
            ->withCookie(Cookie::forget('refresh_token'));
    }

    private function attachCookies(RedirectResponse $response, string $access, string $refresh): RedirectResponse
    {
        $secure = config('app.env') === 'production';

        return $response
            ->cookie('access_token',  $access,  config('sso.cookie_access_ttl'),  '/', null, $secure, true, false, 'Lax')
            ->cookie('refresh_token', $refresh, config('sso.cookie_refresh_ttl'), '/', null, $secure, true, false, 'Lax');
    }
}
