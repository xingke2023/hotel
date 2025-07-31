<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SellerApplicationController extends Controller
{
    /**
     * 申请成为卖家
     */
    public function apply(Request $request)
    {
        $user = Auth::user();
        
        // 检查用户是否已经是卖家或正在申请中
        if ($user->user_type === 'seller') {
            return response()->json([
                'success' => false,
                'message' => '您已经是卖家了'
            ], 400);
        }
        
        if ($user->user_type === 'pending_seller') {
            return response()->json([
                'success' => false,
                'message' => '您已经提交了申请，请等待审核'
            ], 400);
        }
        
        // 更新用户状态为申请中
        $user->update(['user_type' => 'pending_seller']);
        
        return response()->json([
            'success' => true,
            'message' => '申请已提交，请等待管理员审核'
        ]);
    }
    
    /**
     * 获取申请状态
     */
    public function status()
    {
        $user = Auth::user();
        
        return response()->json([
            'user_type' => $user->user_type,
            'can_apply' => $user->user_type === 'buyer',
            'is_pending' => $user->user_type === 'pending_seller',
            'is_seller' => $user->user_type === 'seller'
        ]);
    }
    
    /**
     * 管理员审核通过申请（这里简化为自动通过，实际项目中应该有管理员界面）
     */
    public function approve($userId)
    {
        // 这个方法暂时保留，实际项目中需要管理员权限验证
        $user = \App\Models\User::find($userId);
        
        if (!$user || $user->user_type !== 'pending_seller') {
            return response()->json([
                'success' => false,
                'message' => '用户不存在或状态不正确'
            ], 400);
        }
        
        $user->update(['user_type' => 'seller']);
        
        return response()->json([
            'success' => true,
            'message' => '申请已通过'
        ]);
    }
}