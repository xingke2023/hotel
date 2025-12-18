<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * 创建支付
     */
    public function createPayment(Request $request, $orderId)
    {
        $request->validate([
            'payment_method' => 'required|in:stripe,wechat,alipay',
        ]);

        $order = Order::with(['house', 'buyer', 'seller'])->findOrFail($orderId);

        // 验证订单状态和用户权限
        if ($order->buyer_id !== auth()->id()) {
            return response()->json(['message' => '无权访问此订单'], 403);
        }

        if ($order->status !== 'confirmed') {
            return response()->json(['message' => '订单状态不允许支付'], 400);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => '订单已支付'], 400);
        }

        $paymentMethod = $request->payment_method;

        try {
            DB::beginTransaction();

            // 根据支付方式调用不同的支付接口
            $paymentData = match($paymentMethod) {
                'stripe' => $this->createStripePayment($order),
                'wechat' => $this->createWechatPayment($order),
                'alipay' => $this->createAlipayPayment($order),
            };

            // 更新订单支付方式
            $order->update([
                'payment_method' => $paymentMethod,
            ]);

            DB::commit();

            return response()->json([
                'message' => '支付创建成功',
                'payment_data' => $paymentData,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('创建支付失败: ' . $e->getMessage());
            return response()->json(['message' => '创建支付失败：' . $e->getMessage()], 500);
        }
    }

    /**
     * 创建 Stripe 支付（信用卡）
     */
    private function createStripePayment(Order $order)
    {
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));

        $paymentIntent = $stripe->paymentIntents->create([
            'amount' => $order->price * 100, // Stripe 使用分为单位
            'currency' => 'cny', // 人民币
            'payment_method_types' => ['card'],
            'metadata' => [
                'order_id' => $order->id,
            ],
        ]);

        // 保存 payment_id
        $order->update(['payment_id' => $paymentIntent->id]);

        return [
            'client_secret' => $paymentIntent->client_secret,
            'publishable_key' => config('services.stripe.key'),
            'payment_method_type' => 'card',
        ];
    }

    /**
     * 创建微信支付（通过 Stripe WeChat Pay）
     */
    private function createWechatPayment(Order $order)
    {
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));

        // 创建 PaymentIntent 使用 WeChat Pay
        $paymentIntent = $stripe->paymentIntents->create([
            'amount' => $order->price * 100, // Stripe 使用分为单位
            'currency' => 'cny', // 微信支付需要使用人民币
            'payment_method_types' => ['wechat_pay'],
            'payment_method_options' => [
                'wechat_pay' => [
                    'client' => 'web', // 'web' 显示二维码，'android' 或 'ios' 用于移动端
                ],
            ],
            'metadata' => [
                'order_id' => $order->id,
            ],
        ]);

        // 保存 payment_id
        $order->update(['payment_id' => $paymentIntent->id]);

        return [
            'client_secret' => $paymentIntent->client_secret,
            'publishable_key' => config('services.stripe.key'),
            'payment_method_type' => 'wechat_pay',
        ];
    }

    /**
     * 创建支付宝支付（通过 Stripe Alipay）
     */
    private function createAlipayPayment(Order $order)
    {
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));

        // 创建 PaymentIntent 使用 Alipay
        $paymentIntent = $stripe->paymentIntents->create([
            'amount' => $order->price * 100, // Stripe 使用分为单位
            'currency' => 'cny', // 支付宝需要使用人民币
            'payment_method_types' => ['alipay'],
            'metadata' => [
                'order_id' => $order->id,
            ],
        ]);

        // 保存 payment_id
        $order->update(['payment_id' => $paymentIntent->id]);

        return [
            'client_secret' => $paymentIntent->client_secret,
            'publishable_key' => config('services.stripe.key'),
            'payment_method_type' => 'alipay',
        ];
    }

    /**
     * Stripe 支付回调
     */
    public function stripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        Log::info('Stripe webhook received', [
            'has_signature' => !empty($sigHeader),
            'payload_length' => strlen($payload),
        ]);

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sigHeader,
                $webhookSecret
            );

            Log::info('Stripe webhook event', [
                'type' => $event->type,
                'id' => $event->id,
            ]);

            if ($event->type === 'payment_intent.succeeded') {
                $paymentIntent = $event->data->object;
                Log::info('Payment intent succeeded', [
                    'payment_intent_id' => $paymentIntent->id,
                ]);
                $this->handleSuccessfulPayment($paymentIntent->id, 'stripe');
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Stripe webhook error: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * 微信支付回调
     */
    public function wechatCallback(Request $request)
    {
        // TODO: 处理微信支付回调
        // 验证签名、更新订单状态

        return response()->json(['status' => 'success']);
    }

    /**
     * 支付宝回调
     */
    public function alipayCallback(Request $request)
    {
        // TODO: 处理支付宝回调
        // 验证签名、更新订单状态

        return response()->json(['status' => 'success']);
    }

    /**
     * 处理成功的支付
     */
    private function handleSuccessfulPayment($paymentId, $paymentMethod)
    {
        Log::info('Handling successful payment', [
            'payment_id' => $paymentId,
            'payment_method' => $paymentMethod,
        ]);

        $order = Order::where('payment_id', $paymentId)->first();

        if (!$order) {
            Log::warning('Order not found for payment', [
                'payment_id' => $paymentId,
            ]);
            return;
        }

        if ($order->payment_status !== 'paid') {
            $order->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);

            Log::info('Order payment status updated', [
                'order_id' => $order->id,
                'payment_status' => 'paid',
            ]);

            // TODO: 可以在这里发送支付成功通知给买卖双方
        } else {
            Log::info('Order already paid', [
                'order_id' => $order->id,
            ]);
        }
    }

    /**
     * 确认支付（由前端调用，验证 Stripe 支付状态）
     */
    public function confirmPayment(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);

        // 检查订单权限
        if (auth()->check() && $order->buyer_id !== auth()->id()) {
            return response()->json(['message' => '无权访问此订单'], 403);
        }

        if ($order->payment_status === 'paid') {
            return response()->json([
                'message' => '订单已支付',
                'payment_status' => 'paid',
            ]);
        }

        // 验证 Stripe PaymentIntent 状态
        if ($order->payment_id) {
            try {
                $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
                $paymentIntent = $stripe->paymentIntents->retrieve($order->payment_id);

                Log::info('Confirming payment from client', [
                    'order_id' => $order->id,
                    'payment_intent_id' => $paymentIntent->id,
                    'status' => $paymentIntent->status,
                ]);

                if ($paymentIntent->status === 'succeeded') {
                    // 更新订单状态
                    $order->update([
                        'payment_status' => 'paid',
                        'paid_at' => now(),
                    ]);

                    Log::info('Payment confirmed successfully', [
                        'order_id' => $order->id,
                    ]);

                    return response()->json([
                        'message' => '支付确认成功',
                        'payment_status' => 'paid',
                    ]);
                }

                return response()->json([
                    'message' => '支付未完成',
                    'payment_status' => $order->payment_status,
                    'stripe_status' => $paymentIntent->status,
                ]);
            } catch (\Exception $e) {
                Log::error('Error confirming payment: ' . $e->getMessage());
                return response()->json(['message' => '确认支付失败：' . $e->getMessage()], 500);
            }
        }

        return response()->json(['message' => '未找到支付信息'], 404);
    }

    /**
     * 查询支付状态
     */
    public function getPaymentStatus($orderId)
    {
        $order = Order::findOrFail($orderId);

        // 检查用户权限（如果已登录）
        if (auth()->check()) {
            if ($order->buyer_id !== auth()->id() && $order->seller_id !== auth()->id()) {
                return response()->json(['message' => '无权访问此订单'], 403);
            }
        }

        return response()->json([
            'payment_status' => $order->payment_status,
            'payment_method' => $order->payment_method,
            'paid_at' => $order->paid_at,
        ]);
    }

    /**
     * 测试端点：手动标记订单为已支付（仅用于开发测试）
     */
    public function markAsPaidForTesting($orderId)
    {
        // 仅在开发环境启用
        if (!app()->environment('local')) {
            return response()->json(['message' => '此端点仅在开发环境可用'], 403);
        }

        $order = Order::findOrFail($orderId);

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => '订单已支付'], 400);
        }

        $order->update([
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        return response()->json([
            'message' => '订单已标记为已支付（测试）',
            'order' => $order,
        ]);
    }

    /**
     * 测试 Webhook 连接
     */
    public function testWebhook(Request $request)
    {
        Log::info('Test webhook called', [
            'method' => $request->method(),
            'headers' => $request->headers->all(),
            'body' => $request->all(),
            'raw_body' => $request->getContent(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Webhook endpoint is reachable',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
