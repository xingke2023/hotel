<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Update the user's password.
     * 密码管理已迁移到 SSO 统一认证中心，本地不再支持修改密码。
     */
    public function update(Request $request): RedirectResponse
    {
        return back()->withErrors([
            'current_password' => '密码管理请前往统一认证中心：' . config('sso.base_url'),
        ]);
    }
}
