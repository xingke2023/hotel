import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet, DollarSign, Loader2 } from 'lucide-react';
import axios from '@/lib/axios';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, WeChatPayElement, PaymentElement } from '@stripe/react-stripe-js';

interface PaymentDialogProps {
    open: boolean;
    onClose: () => void;
    orderId: number;
    amount: number;
    onPaymentSuccess: () => void;
}

// Stripe 卡片支付组件
function StripeCardForm({ clientSecret, onSuccess, onError }: { clientSecret: string; onSuccess: () => void; onError: (error: string) => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            onError('卡片信息无效');
            return;
        }

        setProcessing(true);

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                }
            });

            if (error) {
                onError(error.message || '支付失败');
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                onSuccess();
            }
        } catch (err: any) {
            onError(err.message || '支付处理失败');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">信用卡信息</Label>
                <div className="p-3 border rounded-lg">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    请输入您的信用卡或借记卡信息
                </p>
            </div>

            <Button
                type="submit"
                disabled={!stripe || processing}
                className="w-full"
            >
                {processing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        处理中...
                    </>
                ) : (
                    '确认支付'
                )}
            </Button>
        </form>
    );
}

// Stripe 微信支付组件
function StripeWeChatPayForm({ clientSecret, orderId, onSuccess, onError }: { clientSecret: string; orderId: number; onSuccess: () => void; onError: (error: string) => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [pollingPayment, setPollingPayment] = useState(false);

    useEffect(() => {
        if (!stripe || !elements) {
            return;
        }

        // 自动确认微信支付，显示二维码
        handleWeChatPay();
    }, [stripe, elements]);

    // 轮询支付状态 - 直接查询 Stripe
    useEffect(() => {
        if (!checkingPayment || !stripe || !clientSecret) {
            return;
        }

        setPollingPayment(true);

        // 使用 Stripe 客户端直接检查支付状态
        const checkStripePaymentStatus = async () => {
            try {
                // 使用 Stripe 的 retrievePaymentIntent 方法
                const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

                if (paymentIntent && paymentIntent.status === 'succeeded') {
                    // 支付成功 - 更新后端订单状态
                    await axios.post(`/api/orders/${orderId}/confirm-payment`);
                    clearInterval(pollInterval);
                    setPollingPayment(false);
                    onSuccess();
                }
            } catch (err) {
                console.error('查询支付状态失败:', err);
            }
        };

        // 立即检查一次
        checkStripePaymentStatus();

        // 每3秒检查一次
        const pollInterval = setInterval(checkStripePaymentStatus, 3000);

        // 5分钟后停止轮询
        const timeout = setTimeout(() => {
            clearInterval(pollInterval);
            setPollingPayment(false);
        }, 300000);

        return () => {
            clearInterval(pollInterval);
            clearTimeout(timeout);
        };
    }, [checkingPayment, orderId, stripe, clientSecret, onSuccess]);

    const handleWeChatPay = async () => {
        if (!stripe) {
            return;
        }

        setProcessing(true);

        try {
            const { error } = await stripe.confirmWechatPayPayment(clientSecret, {
                payment_method_options: {
                    wechat_pay: {
                        client: 'web',
                    },
                },
            });

            if (error) {
                onError(error.message || '微信支付失败');
                setProcessing(false);
            } else {
                // 二维码已生成，等待用户扫码支付
                setProcessing(false);
                setCheckingPayment(true);
            }
        } catch (err: any) {
            onError(err.message || '微信支付处理失败');
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-center py-8">
                <Wallet className="h-16 w-16 text-green-600 mx-auto mb-4" />

                {processing ? (
                    <>
                        <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">正在生成支付二维码...</p>
                        <p className="text-sm text-gray-500">请稍候</p>
                    </>
                ) : checkingPayment ? (
                    <>
                        <p className="text-lg font-medium mb-2">请使用微信扫描二维码支付</p>
                        <p className="text-sm text-gray-500 mb-4">
                            {pollingPayment ? '正在检测支付状态，支付成功后会自动提示...' : '支付完成后，请在"我的购买"页面查看订单状态'}
                        </p>

                        {/* 微信扫码提示 */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                            <p className="text-sm text-green-800">
                                💡 提示：如果在微信中，可以长按二维码点击"识别图中的二维码"
                            </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                {pollingPayment && <Loader2 className="h-4 w-4 animate-spin text-yellow-600 mt-0.5 flex-shrink-0" />}
                                <p className="text-sm text-yellow-800">
                                    💡 温馨提示：扫码支付后，系统会自动检测并提示支付成功。
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-lg font-medium mb-2">请使用微信扫描二维码支付</p>
                        <p className="text-sm text-gray-500">二维码加载中...</p>
                    </>
                )}
            </div>
        </div>
    );
}

// Stripe 支付宝支付组件
function StripeAlipayForm({ clientSecret, orderId, onSuccess, onError }: { clientSecret: string; orderId: number; onSuccess: () => void; onError: (error: string) => void }) {
    const stripe = useStripe();
    const [processing, setProcessing] = useState(false);

    const handleAlipay = async () => {
        if (!stripe) {
            return;
        }

        setProcessing(true);

        try {
            // 用户将被重定向到支付宝
            // 注意：这个调用会导致页面跳转，所以不会执行后续代码
            const { error } = await stripe.confirmAlipayPayment(clientSecret, {
                return_url: window.location.origin + '/profile/my-orders?payment=alipay&order_id=' + orderId,
            });

            if (error) {
                onError(error.message || '支付宝支付失败');
                setProcessing(false);
            }
            // 注意：不调用 onSuccess()，因为用户会被重定向到支付宝
            // 支付完成后会返回到 return_url
        } catch (err: any) {
            onError(err.message || '支付宝支付处理失败');
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-center py-8">
                <DollarSign className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">支付宝支付</p>
                <p className="text-sm text-gray-500 mb-4">点击下方按钮跳转到支付宝完成支付</p>

                <Button
                    onClick={handleAlipay}
                    disabled={!stripe || processing}
                    className="w-full max-w-xs mx-auto"
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            跳转中...
                        </>
                    ) : (
                        '前往支付宝支付'
                    )}
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-800">
                        💡 温馨提示：支付完成后会自动返回到订单页面，系统会检测支付状态并提示。
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PaymentDialog({ open, onClose, orderId, amount, onPaymentSuccess }: PaymentDialogProps) {
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'wechat' | 'alipay' | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    const handlePaymentMethodSelect = async (method: 'stripe' | 'wechat' | 'alipay') => {
        setPaymentMethod(method);
        setError(null);
        // 初始化支付
        await initializePayment(method);
    };

    const initializePayment = async (method: 'stripe' | 'wechat' | 'alipay') => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`/api/orders/${orderId}/payment`, {
                payment_method: method,
            });

            const { payment_data } = response.data;

            // 加载 Stripe
            const stripe = loadStripe(payment_data.publishable_key);
            setStripePromise(stripe);
            setClientSecret(payment_data.client_secret);
            setShowPaymentForm(true);
            setLoading(false);
        } catch (err: any) {
            console.error('初始化支付失败:', err);
            setError(err.response?.data?.message || '初始化支付失败，请重试');
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        onPaymentSuccess();
        onClose();
    };

    const handlePaymentError = (errorMessage: string) => {
        setError(errorMessage);
    };

    const getPaymentTitle = () => {
        if (!showPaymentForm) return '选择支付方式';

        switch (paymentMethod) {
            case 'stripe':
                return 'Stripe 信用卡支付';
            case 'wechat':
                return '微信支付';
            case 'alipay':
                return '支付宝支付';
            default:
                return '选择支付方式';
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{getPaymentTitle()}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-2">支付金额</p>
                        <p className="text-3xl font-bold text-green-600">
                            ¥{amount.toLocaleString()}
                        </p>
                    </div>

                    {!showPaymentForm ? (
                        <>
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">选择支付方式</Label>

                                {/* Stripe */}
                                <button
                                    onClick={() => handlePaymentMethodSelect('stripe')}
                                    disabled={loading}
                                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                                        paymentMethod === 'stripe'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-6 w-6 text-blue-600" />
                                        <div className="text-left flex-1">
                                            <p className="font-medium">Stripe</p>
                                            <p className="text-xs text-gray-500">信用卡/借记卡支付</p>
                                        </div>
                                        {paymentMethod === 'stripe' && !loading && (
                                            <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                        {loading && paymentMethod === 'stripe' && (
                                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                        )}
                                    </div>
                                </button>

                                {/* 微信支付 */}
                                <button
                                    onClick={() => handlePaymentMethodSelect('wechat')}
                                    disabled={loading}
                                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                                        paymentMethod === 'wechat'
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Wallet className="h-6 w-6 text-green-600" />
                                        <div className="text-left flex-1">
                                            <p className="font-medium">微信支付</p>
                                            <p className="text-xs text-gray-500">使用微信扫码支付</p>
                                        </div>
                                        {paymentMethod === 'wechat' && !loading && (
                                            <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                        {loading && paymentMethod === 'wechat' && (
                                            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                                        )}
                                    </div>
                                </button>

                                {/* 支付宝 */}
                                <button
                                    onClick={() => handlePaymentMethodSelect('alipay')}
                                    disabled={loading}
                                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                                        paymentMethod === 'alipay'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="h-6 w-6 text-blue-600" />
                                        <div className="text-left flex-1">
                                            <p className="font-medium">支付宝</p>
                                            <p className="text-xs text-gray-500">跳转支付宝支付</p>
                                        </div>
                                        {paymentMethod === 'alipay' && !loading && (
                                            <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                        {loading && paymentMethod === 'alipay' && (
                                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                        )}
                                    </div>
                                </button>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    取消
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            {stripePromise && clientSecret && (
                                <Elements stripe={stripePromise}>
                                    {paymentMethod === 'stripe' && (
                                        <StripeCardForm
                                            clientSecret={clientSecret}
                                            onSuccess={handlePaymentSuccess}
                                            onError={handlePaymentError}
                                        />
                                    )}
                                    {paymentMethod === 'wechat' && (
                                        <StripeWeChatPayForm
                                            clientSecret={clientSecret}
                                            orderId={orderId}
                                            onSuccess={handlePaymentSuccess}
                                            onError={handlePaymentError}
                                        />
                                    )}
                                    {paymentMethod === 'alipay' && (
                                        <StripeAlipayForm
                                            clientSecret={clientSecret}
                                            orderId={orderId}
                                            onSuccess={handlePaymentSuccess}
                                            onError={handlePaymentError}
                                        />
                                    )}
                                </Elements>
                            )}

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowPaymentForm(false);
                                    setPaymentMethod(null);
                                    setClientSecret(null);
                                    setError(null);
                                }}
                                className="w-full mt-2"
                            >
                                返回选择其他支付方式
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
