<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DonationController extends Controller
{
    /**
     * 创建打赏支付
     */
    public function createDonation(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|in:stripe,wechat',
            'amount' => 'required|numeric|min:1',
        ]);

        $amount = $request->amount;
        $paymentMethod = $request->payment_method;

        try {
            // 根据支付方式调用不同的支付接口
            $paymentData = match($paymentMethod) {
                'stripe' => $this->createStripePayment($amount),
                'wechat' => $this->createWechatPayment($amount),
            };

            return response()->json([
                'message' => '支付创建成功',
                'payment_data' => $paymentData,
            ]);
        } catch (\Exception $e) {
            Log::error('创建打赏支付失败: ' . $e->getMessage());
            return response()->json(['message' => '创建支付失败：' . $e->getMessage()], 500);
        }
    }

    /**
     * 创建 Stripe 支付（信用卡）
     */
    private function createStripePayment($amount)
    {
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));

        $paymentIntent = $stripe->paymentIntents->create([
            'amount' => $amount * 100, // Stripe 使用分为单位
            'currency' => 'cny', // 人民币
            'payment_method_types' => ['card'],
            'metadata' => [
                'type' => 'donation',
                'user_id' => auth()->id() ?? 'guest',
            ],
        ]);

        return [
            'client_secret' => $paymentIntent->client_secret,
            'publishable_key' => config('services.stripe.key'),
            'payment_method_type' => 'card',
            'payment_id' => $paymentIntent->id,
        ];
    }

    /**
     * 创建微信支付（通过 Stripe WeChat Pay）
     */
    private function createWechatPayment($amount)
    {
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));

        // 创建 PaymentIntent 使用 WeChat Pay
        $paymentIntent = $stripe->paymentIntents->create([
            'amount' => $amount * 100, // Stripe 使用分为单位
            'currency' => 'cny', // 微信支付需要使用人民币
            'payment_method_types' => ['wechat_pay'],
            'payment_method_options' => [
                'wechat_pay' => [
                    'client' => 'web', // 'web' 显示二维码
                ],
            ],
            'metadata' => [
                'type' => 'donation',
                'user_id' => auth()->id() ?? 'guest',
            ],
        ]);

        return [
            'client_secret' => $paymentIntent->client_secret,
            'publishable_key' => config('services.stripe.key'),
            'payment_method_type' => 'wechat_pay',
            'payment_id' => $paymentIntent->id,
        ];
    }

    /**
     * Stripe 打赏支付回调
     */
    public function donationWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sigHeader,
                $webhookSecret
            );

            Log::info('Donation webhook event', [
                'type' => $event->type,
                'id' => $event->id,
            ]);

            if ($event->type === 'payment_intent.succeeded') {
                $paymentIntent = $event->data->object;

                // 记录成功的打赏
                if (isset($paymentIntent->metadata->type) && $paymentIntent->metadata->type === 'donation') {
                    Log::info('Donation payment succeeded', [
                        'payment_intent_id' => $paymentIntent->id,
                        'amount' => $paymentIntent->amount / 100,
                        'user_id' => $paymentIntent->metadata->user_id ?? 'guest',
                    ]);

                    // TODO: 可以在这里保存打赏记录到数据库
                    // 或者发送感谢邮件等
                }
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Donation webhook error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * 确认打赏支付状态
     */
    public function confirmDonation(Request $request)
    {
        $request->validate([
            'payment_id' => 'required|string',
        ]);

        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            $paymentIntent = $stripe->paymentIntents->retrieve($request->payment_id);

            if ($paymentIntent->status === 'succeeded') {
                Log::info('Donation confirmed', [
                    'payment_id' => $request->payment_id,
                    'amount' => $paymentIntent->amount / 100,
                ]);

                return response()->json([
                    'message' => '感谢您的打赏支持！',
                    'status' => 'succeeded',
                ]);
            }

            return response()->json([
                'message' => '支付未完成',
                'status' => $paymentIntent->status,
            ]);
        } catch (\Exception $e) {
            Log::error('Error confirming donation: ' . $e->getMessage());
            return response()->json(['message' => '确认支付失败：' . $e->getMessage()], 500);
        }
    }
}
