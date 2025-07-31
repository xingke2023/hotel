<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ReferralCommission;
use App\Models\Order;

class ReferralController extends Controller
{
    public function getMyReferrals(Request $request)
    {
        $user = auth()->user();
        
        // Ensure user has a referral code
        if (!$user->referral_code) {
            $user->update(['referral_code' => $user->generateReferralCode()]);
        }

        // Get referred users with their order statistics
        $referredUsers = User::where('referred_by', $user->id)
            ->withCount(['orders as completed_orders_count' => function ($query) {
                $query->where('status', 'received');
            }])
            ->with(['orders' => function ($query) {
                $query->where('status', 'received');
            }])
            ->get()
            ->map(function ($referredUser) use ($user) {
                $completedOrders = $referredUser->orders;
                $totalOrderAmount = $completedOrders->sum('price');
                $commissionAmount = $totalOrderAmount * 0.10; // 10% commission
                
                return [
                    'id' => $referredUser->id,
                    'name' => $referredUser->name,
                    'email' => $referredUser->email,
                    'registered_at' => $referredUser->created_at,
                    'completed_orders_count' => $referredUser->completed_orders_count,
                    'total_order_amount' => $totalOrderAmount,
                    'commission_amount' => $commissionAmount,
                    'orders' => $completedOrders
                ];
            });

        // Get total commission statistics
        $totalCommissions = ReferralCommission::where('referrer_id', $user->id)->sum('commission_amount');
        $pendingCommissions = ReferralCommission::where('referrer_id', $user->id)
            ->where('status', 'pending')
            ->sum('commission_amount');

        return response()->json([
            'referral_code' => $user->referral_code,
            'referral_link' => url("/register?ref={$user->referral_code}"),
            'referred_users' => $referredUsers,
            'total_commissions' => $totalCommissions,
            'pending_commissions' => $pendingCommissions,
            'commission_rate' => 10.0
        ]);
    }

    public function getReferredUserDetails(Request $request, $userId)
    {
        $user = auth()->user();
        
        // Verify the user is referred by the current user
        $referredUser = User::where('id', $userId)
            ->where('referred_by', $user->id)
            ->first();

        if (!$referredUser) {
            return response()->json(['error' => '用户不存在或非您推荐'], 404);
        }

        // Get completed orders
        $orders = Order::where('buyer_id', $referredUser->id)
            ->where('status', 'received')
            ->with(['house', 'seller'])
            ->get();

        $totalOrderAmount = $orders->sum('price');
        $commissionAmount = $totalOrderAmount * 0.10;

        return response()->json([
            'user' => [
                'id' => $referredUser->id,
                'name' => $referredUser->name,
                'email' => $referredUser->email,
                'registered_at' => $referredUser->created_at,
            ],
            'orders' => $orders,
            'total_order_amount' => $totalOrderAmount,
            'commission_amount' => $commissionAmount,
            'commission_rate' => 10.0
        ]);
    }
}
