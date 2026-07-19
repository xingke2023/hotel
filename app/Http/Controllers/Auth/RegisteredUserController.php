<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\SsoAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function __construct(private SsoAuthService $sso) {}

    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'                  => ['required', 'string', 'min:3', 'max:50', 'regex:/^[a-zA-Z0-9_]+$/'],
            'password'              => ['required', 'string', 'min:8', 'max:100'],
            'password_confirmation' => ['required', 'same:password'],
        ]);

        try {
            $tokens = $this->sso->register($request->name, $request->password);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['name' => $e->getMessage()])->withInput();
        }

        $payload = $this->sso->decodeToken($tokens['accessToken']);
        $user    = $this->sso->resolveLocalUser($payload);

        Auth::login($user, false);

        $secure = config('app.env') === 'production';

        return redirect()->intended(route('profile', absolute: false))
            ->cookie('access_token',  $tokens['accessToken'],  config('sso.cookie_access_ttl'),  '/', null, $secure, true, false, 'Lax')
            ->cookie('refresh_token', $tokens['refreshToken'], config('sso.cookie_refresh_ttl'), '/', null, $secure, true, false, 'Lax');
    }
}
