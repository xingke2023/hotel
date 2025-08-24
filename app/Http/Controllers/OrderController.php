<?php

namespace App\Http\Controllers;

use App\Models\House;
use App\Models\Order;
use App\Models\OrderMessage;
use App\Models\Earning;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'house_id' => 'required|exists:houses,id',
            'customer_message' => 'nullable|string|max:500',
        ]);

        $house = House::findOrFail($request->house_id);

        if ($house->status !== 'available') {
            return response()->json(['error' => '房屋已售出或不可用'], 400);
        }

        if ($house->user_id === auth()->id()) {
            return response()->json(['error' => '不能购买自己的房屋'], 400);
        }

        // 检查用户是否完善了个人资料
        $user = auth()->user();
        if (empty($user->real_name) || empty($user->phone)) {
            return response()->json([
                'error' => '请先完善个人资料',
                'message' => '购买房源前，请先在个人中心填写真实姓名和电话号码',
                'redirect' => '/profile?tab=my-profile'
            ], 422);
        }

        $order = Order::create([
            'house_id' => $house->id,
            'buyer_id' => auth()->id(),
            'seller_id' => $house->user_id,
            'price' => $house->price,
            'status' => 'pending',
            'auto_confirm_at' => Carbon::now()->addHours(24),
        ]);

        // Create order message for buyer placing order
        OrderMessage::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'action' => 'placed_order',
            'message' => $request->customer_message,
        ]);

        $house->update(['status' => 'suspended']);

        return response()->json($order->load(['house', 'buyer', 'seller', 'messages.user']));
    }

    public function confirm(Request $request, Order $order)
    {
        $request->validate([
            'seller_message' => 'nullable|string|max:500',
        ]);

        if ($order->seller_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['error' => '订单状态不正确'], 400);
        }

        $order->update([
            'status' => 'confirmed',
            'confirmed_at' => Carbon::now(),
        ]);

        // Create order message for seller confirming order
        OrderMessage::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'action' => 'confirmed',
            'message' => $request->seller_message,
        ]);

        $order->house->update(['status' => 'suspended']);

        return response()->json($order->load(['house', 'buyer', 'seller', 'messages.user']));
    }

    public function deliver(Request $request, Order $order)
    {
        if ($order->seller_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        if ($order->status !== 'confirmed') {
            return response()->json(['error' => '订单状态不正确'], 400);
        }

        $order->update([
            'status' => 'delivered',
            'delivered_at' => Carbon::now(),
        ]);

        return response()->json($order->load(['house', 'buyer', 'seller']));
    }

    public function complete(Request $request, Order $order)
    {
        if ($order->buyer_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        if ($order->status !== 'delivered') {
            return response()->json(['error' => '订单状态不正确'], 400);
        }

        $order->update([
            'status' => 'completed',
            'completed_at' => Carbon::now(),
        ]);

        $order->house->update(['status' => 'suspended']);

        return response()->json($order->load(['house', 'buyer', 'seller']));
    }

    public function myOrders(Request $request)
    {
        $query = Order::with(['house', 'buyer', 'seller', 'messages.user'])
            ->where(function ($q) {
                $q->where('buyer_id', auth()->id())
                  ->orWhere('seller_id', auth()->id());
            })
            ->orderBy('created_at', 'desc');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('house', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $orders = $query->paginate($perPage);

        return response()->json($orders);
    }

    public function myPurchases(Request $request)
    {
        $query = Order::with(['house', 'buyer', 'seller', 'messages.user'])
            ->where('buyer_id', auth()->id())
            ->orderBy('created_at', 'desc');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('house', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $orders = $query->paginate($perPage);

        return response()->json($orders);
    }

    public function mySales(Request $request)
    {
        // 获取可售房源 (houses表中status='available'且seller是自己的房源)
        $availableHousesQuery = House::where('user_id', auth()->id())
            ->where('status', 'available');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $availableHousesQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $availableHouses = $availableHousesQuery->orderBy('created_at', 'desc')->get();

        // 获取历史订单 (orders表中seller_id是自己的所有订单)
        $ordersQuery = Order::with(['house', 'buyer', 'seller', 'messages.user'])
            ->where('seller_id', auth()->id())
            ->orderBy('created_at', 'desc');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $ordersQuery->whereHas('house', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $orders = $ordersQuery->paginate($perPage);

        return response()->json([
            'available_houses' => $availableHouses,
            'orders' => $orders
        ]);
    }

    public function getPendingOrderForHouse(House $house)
    {
        if ($house->user_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        $order = Order::with(['house', 'buyer', 'seller', 'messages.user'])
            ->where('house_id', $house->id)
            ->where('status', 'pending')
            ->first();

        return response()->json($order);
    }

    public function getConfirmedOrderForHouse(House $house)
    {
        if ($house->user_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        $order = Order::with(['house', 'buyer', 'seller', 'messages.user'])
            ->where('house_id', $house->id)
            ->where('status', 'confirmed')
            ->first();

        return response()->json($order);
    }

    public function reject(Request $request, Order $order)
    {
        $request->validate([
            'seller_message' => 'required|string|max:500',
        ]);

        if ($order->seller_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['error' => '订单状态不正确'], 400);
        }

        $order->update([
            'status' => 'rejected',
        ]);

        // Create order message for seller rejecting order
        OrderMessage::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'action' => 'rejected',
            'message' => $request->seller_message,
        ]);

        $order->house->update(['status' => 'available']);

        return response()->json($order->load(['house', 'buyer', 'seller', 'messages.user']));
    }

    public function ship(Request $request, Order $order)
    {
        if ($order->seller_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        if ($order->status !== 'confirmed') {
            return response()->json(['error' => '订单状态不正确'], 400);
        }

        $request->validate([
            'message' => 'nullable|string|max:500',
        ]);

        $order->update([
            'status' => 'shipped',
            'shipped_at' => Carbon::now(),
        ]);

        // Create order message for seller shipping
        OrderMessage::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'action' => 'shipped',
            'message' => $request->message,
        ]);

        $order->house->update(['status' => 'suspended']);

        return response()->json($order->load(['house', 'buyer', 'seller', 'messages.user']));
    }

    public function receive(Request $request, Order $order)
    {
        if ($order->buyer_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        if ($order->status !== 'shipped') {
            return response()->json(['error' => '订单状态不正确'], 400);
        }

        $request->validate([
            'message' => 'nullable|string|max:500',
            'rating' => 'required|in:好,中,差',
        ]);

        $order->update([
            'status' => 'received',
            'completed_at' => Carbon::now(),
            'buyer_review' => $request->message,
            'buyer_rating' => $request->rating,
            'buyer_reviewed' => true,
        ]);

        // Create order message for buyer receiving order (不再存储评价和评分)
        OrderMessage::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'action' => 'received',
            'message' => '买家已确认收房',
        ]);

        $order->house->update(['status' => 'suspended']);

        // 生成卖家收益记录
        Earning::create([
            'user_id' => $order->seller_id,
            'type' => 'house_sale',
            'amount' => $order->price,
            'title' => '房屋销售：' . $order->house->title,
            'description' => '买家已确认收房，交易完成',
            'related_order_id' => $order->id,
            'related_house_id' => $order->house_id,
            'status' => 'completed',
            'earned_at' => Carbon::now(),
        ]);

        // 生成推荐佣金（如果买家是被推荐的）
        $buyer = User::find($order->buyer_id);
        if ($buyer && $buyer->referred_by) {
            $commissionAmount = $order->price * 0.10; // 10% 佣金
            Earning::create([
                'user_id' => $buyer->referred_by,
                'type' => 'referral_commission',
                'amount' => $commissionAmount,
                'title' => '推荐佣金：' . $buyer->name . ' 购买 ' . $order->house->title,
                'description' => '推荐用户完成房屋购买，获得10%佣金',
                'related_order_id' => $order->id,
                'related_house_id' => $order->house_id,
                'status' => 'completed',
                'earned_at' => Carbon::now(),
            ]);
        }

        return response()->json($order->load(['house', 'buyer', 'seller', 'messages.user']));
    }

    public function sellerReview(Request $request, Order $order)
    {
        if ($order->seller_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        if ($order->status !== 'received') {
            return response()->json(['error' => '只能对已完成的订单进行评价'], 400);
        }

        if ($order->seller_reviewed) {
            return response()->json(['error' => '您已经评价过了'], 400);
        }

        $request->validate([
            'message' => 'nullable|string|max:500',
            'rating' => 'required|in:好,中,差',
        ]);

        $order->update([
            'seller_review' => $request->message,
            'seller_rating' => $request->rating,
            'seller_reviewed' => true,
        ]);

        // Create order message for seller reviewing buyer
        OrderMessage::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'action' => 'reviewed',
            'message' => '卖家已对买家进行评价',
        ]);

        return response()->json($order->load(['house', 'buyer', 'seller', 'messages.user']));
    }

    public function buyerReview(Request $request, Order $order)
    {
        if ($order->buyer_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        if ($order->status !== 'received') {
            return response()->json(['error' => '只能对已完成的订单进行评价'], 400);
        }

        if ($order->buyer_reviewed) {
            return response()->json(['error' => '您已经评价过了'], 400);
        }

        $request->validate([
            'message' => 'nullable|string|max:500',
            'rating' => 'required|in:好,中,差',
        ]);

        $order->update([
            'buyer_review' => $request->message,
            'buyer_rating' => $request->rating,
            'buyer_reviewed' => true,
        ]);

        // Create order message for buyer reviewing seller
        OrderMessage::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'action' => 'reviewed',
            'message' => '买家已对卖家进行评价',
        ]);

        return response()->json($order->load(['house', 'buyer', 'seller', 'messages.user']));
    }

    public function cancel(Request $request, Order $order)
    {
        // Allow both buyer and seller to cancel
        if ($order->buyer_id !== auth()->id() && $order->seller_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        // Can cancel pending or confirmed orders
        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json(['error' => '订单状态不允许取消'], 400);
        }

        $request->validate([
            'message' => 'required|string|max:500',
        ]);

        // 区分买家取消和卖家取消
        $isBuyerCancelling = $order->buyer_id === auth()->id();
        $orderStatus = $isBuyerCancelling ? 'user_cancelled' : 'seller_cancelled';

        $order->update([
            'status' => $orderStatus,
        ]);

        // Create order message for cancelling order
        OrderMessage::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'action' => 'cancelled',
            'message' => $request->message,
        ]);

        // 取消订单后房屋重新上架
        $order->house->update(['status' => 'available']);

        return response()->json($order->load(['house', 'buyer', 'seller', 'messages.user']));
    }

    public function rejectDelivery(Request $request, Order $order)
    {
        if ($order->buyer_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        if ($order->status !== 'shipped') {
            return response()->json(['error' => '订单状态不正确'], 400);
        }

        $request->validate([
            'message' => 'required|string|max:500',
        ]);

        $order->update([
            'status' => 'rejected_delivery',
        ]);

        // Create order message for buyer rejecting delivery
        OrderMessage::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'action' => 'rejected_delivery',
            'message' => $request->message,
        ]);

        // House status should remain as shipped since delivery was rejected
        $order->house->update(['status' => 'suspended']);

        return response()->json($order->load(['house', 'buyer', 'seller', 'messages.user']));
    }

    public function relistHouseFromOrder(Request $request, Order $order)
    {
        // 验证权限：只有卖家才能重新上架
        if ($order->seller_id !== auth()->id()) {
            return response()->json(['error' => '无权限操作'], 403);
        }

        // 验证订单状态：只有被拒绝或取消的订单才能重新上架
        if (!in_array($order->status, ['rejected', 'cancelled', 'user_cancelled', 'seller_cancelled'])) {
            return response()->json(['error' => '只有被拒绝或取消的订单才能重新上架'], 400);
        }

        // 检查房屋状态
        $house = $order->house;
        if (!in_array($house->status, ['suspended', 'available'])) {
            return response()->json(['error' => '房屋状态不允许重新上架'], 400);
        }

        // 重新上架房屋
        $house->update([
            'status' => 'available',
            'updated_at' => now()
        ]);

        return response()->json([
            'message' => '房屋重新上架成功！',
            'house' => $house
        ]);
    }

    public function getPendingSalesCount(Request $request)
    {
        // 获取当前登录用户作为卖家的待处理订单数量
        $pendingCount = Order::where('seller_id', auth()->id())
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'pending_count' => $pendingCount
        ]);
    }
}
