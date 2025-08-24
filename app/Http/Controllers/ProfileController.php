<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = auth()->user();
        
        // 获取用户统计信息
        $housesCount = $user->houses()->count();
        $ordersCount = $user->orders()->where('status', 'received')->count();
        $totalEarnings = $user->earnings()->where('status', 'completed')->sum('amount');
        
        $userData = $user->toArray();
        $userData['stats'] = [
            'houses_count' => $housesCount,
            'orders_count' => $ordersCount,
            'total_earnings' => $totalEarnings,
        ];
        
        return response()->json($userData);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        
        // 调试：记录请求数据
        \Log::info('Profile update request data: ', $request->all());
        
        $request->validate([
            'name' => 'required|string|max:255',
            'real_name' => 'nullable|string|max:255',
            'nickname' => 'nullable|string|max:255',
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'birth_date' => 'nullable|date',
            'wechat' => 'nullable|string|max:255',
            'whatsapp' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:25|regex:/^\+?(86|853|852)?-?[0-9]{8,11}$/',
            'bio' => 'nullable|string|max:1000',
        ]);

        $user->update($request->only([
            'name',
            'real_name',
            'nickname', 
            'gender',
            'birth_date',
            'wechat',
            'whatsapp',
            'phone',
            'bio'
        ]));

        return response()->json([
            'message' => '个人资料更新成功',
            'user' => $user
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $user = auth()->user();

        // 删除旧头像
        if ($user->avatar && Storage::exists($user->avatar)) {
            Storage::delete($user->avatar);
        }

        // 存储新头像
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => '头像上传成功',
            'avatar_url' => Storage::url($path)
        ]);
    }

    public function getAvatarUrl(Request $request)
    {
        $user = auth()->user();
        
        if ($user->avatar) {
            return response()->json([
                'avatar_url' => Storage::url($user->avatar)
            ]);
        }

        return response()->json([
            'avatar_url' => null
        ]);
    }
}
