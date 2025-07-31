<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Earning;
use App\Models\House;
use App\Models\Order;

class WalletController extends Controller
{
    public function getEarnings(Request $request)
    {
        $user = auth()->user();
        
        $earnings = Earning::where('user_id', $user->id)
            ->with(['relatedOrder.house', 'relatedHouse'])
            ->orderBy('earned_at', 'desc')
            ->paginate(20);

        $totalEarnings = Earning::where('user_id', $user->id)
            ->where('status', 'completed')
            ->sum('amount');

        $pendingEarnings = Earning::where('user_id', $user->id)
            ->where('status', 'pending')
            ->sum('amount');

        return response()->json([
            'earnings' => $earnings,
            'total_earnings' => $totalEarnings,
            'pending_earnings' => $pendingEarnings,
            'balance' => $totalEarnings
        ]);
    }

    public function sellHouseToPlatform(Request $request)
    {
        $request->validate([
            'house_id' => 'required|exists:houses,id',
        ]);

        $user = auth()->user();
        $house = House::where('id', $request->house_id)
            ->where('user_id', $user->id)
            ->where('status', 'available')
            ->first();

        if (!$house) {
            return response()->json(['error' => '房屋不存在或不可销售'], 404);
        }

        // 创建平台回购订单
        $platformOrder = Order::create([
            'house_id' => $house->id,
            'buyer_id' => 1, // 假设平台用户ID为1
            'seller_id' => $user->id,
            'price' => $house->price * 0.95, // 平台回购价格为95%
            'status' => 'received', // 直接完成
            'customer_message' => '平台回购',
            'created_at' => now(),
            'confirmed_at' => now(),
            'shipped_at' => now(),
        ]);

        // 更新房屋状态
        $house->update(['status' => 'sold']);

        // 创建收益记录
        Earning::create([
            'user_id' => $user->id,
            'type' => 'platform_sale',
            'amount' => $platformOrder->price,
            'title' => '平台回购：' . $house->title,
            'description' => '房屋已成功出售给平台',
            'related_order_id' => $platformOrder->id,
            'related_house_id' => $house->id,
            'status' => 'completed',
            'earned_at' => now(),
        ]);

        return response()->json([
            'message' => '房屋已成功出售给平台',
            'order' => $platformOrder,
            'earning_amount' => $platformOrder->price
        ]);
    }

    public function getMyHousesForSale(Request $request)
    {
        $user = auth()->user();
        
        $houses = House::where('user_id', $user->id)
            ->where('status', 'available')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($houses);
    }
}
