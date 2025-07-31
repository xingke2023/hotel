<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class SettingsController extends Controller
{
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ], [
            'current_password.required' => '请输入当前密码',
            'new_password.required' => '请输入新密码',
            'new_password.min' => '新密码至少需要8个字符',
            'new_password.confirmed' => '新密码确认不匹配',
        ]);

        $user = auth()->user();

        // 验证当前密码
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['当前密码不正确'],
            ]);
        }

        // 更新密码
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => '密码修改成功',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => '已成功退出登录',
            'redirect' => route('login')
        ]);
    }

    public function getAccountInfo(Request $request)
    {
        $user = auth()->user();
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
                'email_verified_at' => $user->email_verified_at,
            ],
            'stats' => [
                'houses_count' => $user->houses()->count(),
                'orders_count' => $user->orders()->count(),
                'earnings_count' => $user->earnings()->count(),
                'referrals_count' => $user->referredUsers()->count(),
            ]
        ]);
    }
}
