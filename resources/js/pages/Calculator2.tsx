import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import axios from '@/lib/axios';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

type DiceResult = 'big' | 'small';

// Stripe 卡片支付表单
function DonationStripeCardForm({ clientSecret, onSuccess, onError }: { clientSecret: string; onSuccess: () => void; onError: (error: string) => void }) {
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">信用卡信息</label>
                <div className="p-3 border rounded-lg bg-white">
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
                    支付信息通过Stripe加密处理，安全可靠
                </p>
            </div>

            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {processing ? '处理中...' : '确认支付 ¥100'}
            </button>
        </form>
    );
}

// 微信支付表单
function DonationWeChatPayForm({ clientSecret, onSuccess, onError }: { clientSecret: string; onSuccess: () => void; onError: (error: string) => void }) {
    const stripe = useStripe();
    const [processing, setProcessing] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }
        handleWeChatPay();
    }, [stripe]);

    // 轮询支付状态
    useEffect(() => {
        if (!checkingPayment || !stripe || !clientSecret) {
            return;
        }

        const checkStripePaymentStatus = async () => {
            try {
                const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

                if (paymentIntent && paymentIntent.status === 'succeeded') {
                    clearInterval(pollInterval);
                    onSuccess();
                }
            } catch (err) {
                console.error('查询支付状态失败:', err);
            }
        };

        checkStripePaymentStatus();
        const pollInterval = setInterval(checkStripePaymentStatus, 3000);

        const timeout = setTimeout(() => {
            clearInterval(pollInterval);
        }, 300000); // 5分钟后停止

        return () => {
            clearInterval(pollInterval);
            clearTimeout(timeout);
        };
    }, [checkingPayment, stripe, clientSecret, onSuccess]);

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
                setProcessing(false);
                setCheckingPayment(true);
            }
        } catch (err: any) {
            onError(err.message || '微信支付处理失败');
            setProcessing(false);
        }
    };

    return (
        <div className="text-center py-8">
            {processing ? (
                <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium mb-2">正在生成支付二维码...</p>
                </>
            ) : checkingPayment ? (
                <>
                    <p className="text-lg font-medium mb-2">请使用微信扫描二维码支付</p>
                    <p className="text-sm text-gray-500 mb-4">支付完成后会自动提示</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            💡 提示：在微信中可以长按二维码识别
                        </p>
                    </div>
                </>
            ) : (
                <p className="text-sm text-gray-500">二维码加载中...</p>
            )}
        </div>
    );
}

export default function Calculator2() {
    const [baseCode, setBaseCode] = useState(50);
    const [baseCodeInput, setBaseCodeInput] = useState('50');
    const [sequence, setSequence] = useState([1, 2, 2, 1]);
    const [totalPnL, setTotalPnL] = useState(0);
    const [currentBet, setCurrentBet] = useState(100);
    const [stopLoss, setStopLoss] = useState(10000); // 默认是基数(50) * 200 = 10000
    const [stopLossInput, setStopLossInput] = useState('10000');
    const [gameHistory, setGameHistory] = useState<Array<{bet: number, result: 'win' | 'lose', pnl: number, sequence: number[], suggestion: DiceResult}>>([]);
    const [isGameComplete, setIsGameComplete] = useState(false);
    
    // 预测系统相关状态
    const [currentSuggestion, setCurrentSuggestion] = useState<DiceResult | null>(null);
    const [isWaitingForResult, setIsWaitingForResult] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationColor, setAnimationColor] = useState<'red' | 'blue'>('red');
    const [isPredictionVisible, setIsPredictionVisible] = useState(false);
    const [circlePositions, setCirclePositions] = useState<{left: 'red' | 'blue', right: 'red' | 'blue'}>({left: 'red', right: 'blue'});
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(true);
    const [isBaseCodeModalOpen, setIsBaseCodeModalOpen] = useState(false);
    const [tempBaseCodeInput, setTempBaseCodeInput] = useState('50');
    const [isStopLossModalOpen, setIsStopLossModalOpen] = useState(false);
    const [tempStopLossInput, setTempStopLossInput] = useState('1500');
    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
    const [donationPaymentMethod, setDonationPaymentMethod] = useState<'stripe' | 'wechat' | null>(null);
    const [donationLoading, setDonationLoading] = useState(false);
    const [donationError, setDonationError] = useState<string | null>(null);
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    const [donationClientSecret, setDonationClientSecret] = useState<string | null>(null);
    const [showDonationPaymentForm, setShowDonationPaymentForm] = useState(false);
    const [isGoalVisible, setIsGoalVisible] = useState(true);
    const [isSequenceVisible, setIsSequenceVisible] = useState(false);
    const [clickedButton, setClickedButton] = useState<'win' | 'lose' | 'tie' | 'reset' | null>(null);

    // 计算当前下注金额
    const calculateCurrentBet = (seq: number[]) => {
        if (seq.length === 0) return 0;
        if (seq.length === 1) return seq[0] * baseCode;
        // 基码直接替换基础数值：(首位 + 末位) * 基码
        return (seq[0] + seq[seq.length - 1]) * baseCode;
    };

    // 生成随机建议 - 红(大)50.66%, 蓝(小)49.34%
    const generateSuggestion = (): DiceResult => {
        return Math.random() < 0.5066 ? 'big' : 'small';
    };

    // 开始新一局，生成预测建议
    const startNewRound = () => {
        if (isGameComplete) return;
        
        const newSuggestion = generateSuggestion();
        setCurrentSuggestion(newSuggestion);
        setIsWaitingForResult(true);
    };

    // 生成初始建议（游戏开始时）
    if (!currentSuggestion && !isGameComplete && !isWaitingForResult) {
        const initialSuggestion = generateSuggestion();
        setCurrentSuggestion(initialSuggestion);
        setIsWaitingForResult(true);
    }

    // 开始动画效果
    const startPredictionAnimation = (callback: () => void) => {
        setIsAnimating(true);
        setAnimationColor('red');
        
        // 随机初始化圆圈位置
        const randomizePositions = () => {
            const isRedLeft = Math.random() < 0.5;
            setCirclePositions({
                left: isRedLeft ? 'red' : 'blue',
                right: isRedLeft ? 'blue' : 'red'
            });
        };
        
        randomizePositions();
        
        // 每100ms切换颜色和随机交换位置
        let colorToggle = true;
        const colorInterval = setInterval(() => {
            setAnimationColor(colorToggle ? 'blue' : 'red');
            colorToggle = !colorToggle;
            
            // 30%的概率交换位置
            if (Math.random() < 0.3) {
                setCirclePositions(prev => ({
                    left: prev.right,
                    right: prev.left
                }));
            }
        }, 100);
        
        // 0.1秒后停止动画并执行回调
        setTimeout(() => {
            clearInterval(colorInterval);
            setIsAnimating(false);
            callback();
        }, 100);
    };

    // 处理持平的情况
    const handleTie = () => {
        if (!isWaitingForResult || !currentSuggestion || isGameComplete || isAnimating) return;

        // 震动反馈
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // 设置按钮点击状态
        setClickedButton('tie');

        startPredictionAnimation(() => {
            // 持平不改变任何数据，只重新生成建议
            // 延迟700ms后生成建议（加上动画100ms，总共800ms）
            setTimeout(() => {
                const nextSuggestion = generateSuggestion();
                setCurrentSuggestion(nextSuggestion);
                setIsWaitingForResult(true);
                setClickedButton(null);
            }, 700);
        });
    };

    // 处理输的情况
    const handleLose = () => {
        if (!isWaitingForResult || !currentSuggestion || isGameComplete || isAnimating) return;

        // 震动反馈
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // 设置按钮点击状态
        setClickedButton('lose');

        startPredictionAnimation(() => {
            const betAmount = currentBet;
            const newPnL = totalPnL - betAmount;
            // 添加到序列的值应该是基础值（下注金额除以基码）
            const baseValueToAdd = betAmount / baseCode;
            const newSequence = [...sequence, baseValueToAdd];
            const newCurrentBet = calculateCurrentBet(newSequence);

            setTotalPnL(newPnL);
            setSequence(newSequence);
            setCurrentBet(newCurrentBet);

            // 记录历史
            setGameHistory(prev => [...prev, {
                bet: betAmount,
                result: 'lose',
                pnl: newPnL,
                sequence: [...newSequence],
                suggestion: currentSuggestion
            }]);

            // 延迟700ms后生成下一轮建议（加上动画100ms，总共800ms）
            setTimeout(() => {
                const nextSuggestion = generateSuggestion();
                setCurrentSuggestion(nextSuggestion);
                setIsWaitingForResult(true);
                setClickedButton(null);
            }, 700);
        });
    };

    // 处理赢的情况
    const handleWin = () => {
        if (!isWaitingForResult || !currentSuggestion || isGameComplete || isAnimating) return;

        // 震动反馈
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // 设置按钮点击状态
        setClickedButton('win');

        startPredictionAnimation(() => {
            const betAmount = currentBet;
            const newPnL = totalPnL + betAmount;

            let newSequence = [...sequence];

            // 移除首位和末位数字
            if (newSequence.length > 1) {
                newSequence = newSequence.slice(1, -1);
            } else if (newSequence.length === 1) {
                newSequence = [];
            }

            const newCurrentBet = calculateCurrentBet(newSequence);
            const gameComplete = newSequence.length === 0;

            setTotalPnL(newPnL);
            setSequence(newSequence);
            setCurrentBet(newCurrentBet);
            setIsGameComplete(gameComplete);

            // 记录历史
            setGameHistory(prev => [...prev, {
                bet: betAmount,
                result: 'win',
                pnl: newPnL,
                sequence: [...newSequence],
                suggestion: currentSuggestion
            }]);

            // 如果游戏未完成，延迟700ms后生成下一轮建议（加上动画100ms，总共800ms）
            if (!gameComplete) {
                setTimeout(() => {
                    const nextSuggestion = generateSuggestion();
                    setCurrentSuggestion(nextSuggestion);
                    setIsWaitingForResult(true);
                    setClickedButton(null);
                }, 700);
            } else {
                setIsWaitingForResult(false);
                setClickedButton(null);
            }
        });
    };

    // 重置游戏（内部函数，不显示动画）
    const resetGame = () => {
        setSequence([1, 2, 2, 1]);
        setTotalPnL(0);
        setGameHistory([]);
        setIsGameComplete(false);
        setCurrentSuggestion(null);
        setIsWaitingForResult(false);
        setIsAnimating(false);
        setAnimationColor('red');
        setIsPredictionVisible(false);
        setCirclePositions({left: 'red', right: 'blue'});
        // 重置基码输入但保持当前基码值
    };

    // 重置游戏（带动画效果）
    const handleResetGame = () => {
        // 震动反馈
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // 设置按钮点击状态
        setClickedButton('reset');

        // 先重置游戏状态
        resetGame();

        // 然后显示预测动画并生成新建议
        startPredictionAnimation(() => {
            // 延迟700ms后生成建议（加上动画100ms，总共800ms）
            setTimeout(() => {
                const newSuggestion = generateSuggestion();
                setCurrentSuggestion(newSuggestion);
                setIsWaitingForResult(true);
                setClickedButton(null);
            }, 700);
        });
    };

    // 更新基码
    const handleBaseCodeChange = (inputValue: string) => {
        setBaseCodeInput(inputValue);

        // 如果输入为空，使用默认值50
        const newBaseCode = inputValue === '' ? 50 : Number(inputValue);

        if (newBaseCode > 0) {
            setBaseCode(newBaseCode);
        }
    };

    // 更新止损
    const handleStopLossChange = (inputValue: string) => {
        setStopLossInput(inputValue);

        // 如果输入为空，使用默认值（基数*200）
        const newStopLoss = inputValue === '' ? baseCode * 200 : Number(inputValue);

        if (newStopLoss > 0) {
            setStopLoss(newStopLoss);
        }
    };

    // 打开基码修改模态框
    const openBaseCodeModal = () => {
        setTempBaseCodeInput(String(baseCode));
        setIsBaseCodeModalOpen(true);
    };

    // 确认修改基码
    const confirmBaseCodeChange = () => {
        const newBaseCode = tempBaseCodeInput === '' ? 50 : Number(tempBaseCodeInput);
        if (newBaseCode > 0) {
            setBaseCode(newBaseCode);
            setBaseCodeInput(String(newBaseCode));
            // 自动设置止损为新基码的200倍
            const newStopLoss = newBaseCode * 200;
            setStopLoss(newStopLoss);
            setStopLossInput(String(newStopLoss));
        }
        setIsBaseCodeModalOpen(false);
    };

    // 模态框内调整基码
    const adjustTempBaseCode = (delta: number) => {
        const currentValue = Number(tempBaseCodeInput) || 50;
        const newValue = Math.max(10, currentValue + delta);
        setTempBaseCodeInput(String(newValue));
    };

    // 打开止损修改模态框
    const openStopLossModal = () => {
        setTempStopLossInput(String(stopLoss));
        setIsStopLossModalOpen(true);
    };

    // 确认修改止损
    const confirmStopLossChange = () => {
        const newStopLoss = tempStopLossInput === '' ? baseCode * 200 : Number(tempStopLossInput);
        if (newStopLoss > 0) {
            setStopLoss(newStopLoss);
            setStopLossInput(String(newStopLoss));
        }
        setIsStopLossModalOpen(false);
    };

    // 模态框内调整止损
    const adjustTempStopLoss = (delta: number) => {
        const currentValue = Number(tempStopLossInput) || baseCode * 200;
        const newValue = Math.max(100, currentValue + delta);
        setTempStopLossInput(String(newValue));
    };

    // 处理支付方式选择
    const handleDonationPaymentSelect = async (method: 'stripe' | 'wechat') => {
        setDonationPaymentMethod(method);
        setDonationError(null);
        await initializeDonationPayment(method);
    };

    // 初始化打赏支付
    const initializeDonationPayment = async (method: 'stripe' | 'wechat') => {
        setDonationLoading(true);
        setDonationError(null);

        try {
            const response = await axios.post('/api/donation/create', {
                payment_method: method,
                amount: 100, // 固定金额100元
            });

            const { payment_data } = response.data;

            // 加载 Stripe
            const stripe = loadStripe(payment_data.publishable_key);
            setStripePromise(stripe);
            setDonationClientSecret(payment_data.client_secret);
            setShowDonationPaymentForm(true);
            setDonationLoading(false);
        } catch (err: any) {
            console.error('初始化打赏支付失败:', err);
            setDonationError(err.response?.data?.message || '初始化支付失败，请重试');
            setDonationLoading(false);
        }
    };

    // 打赏支付成功
    const handleDonationSuccess = () => {
        alert('感谢您的支持！💖');
        setIsDonationModalOpen(false);
        // 重置状态
        setShowDonationPaymentForm(false);
        setDonationPaymentMethod(null);
        setDonationClientSecret(null);
        setDonationError(null);
    };

    // 打赏支付错误
    const handleDonationError = (errorMessage: string) => {
        setDonationError(errorMessage);
    };

    // 初始化当前下注
    useEffect(() => {
        setCurrentBet(calculateCurrentBet(sequence));
    }, [sequence, baseCode]);

    return (
        <FrontendLayout>
            <Head title="AI直播机助手(策略1)" />
            
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="text-center">
                            <h1 className="text-2xl text-gray-800">AI直播机助手<span className="text-sm">(策略1)</span></h1>
                            <p className="text-sm text-gray-600 mt-2">

                            </p>
                        </div>
                    </div>



                    {/* 控制按钮 */}
                    <div className="text-center mb-6">
                        {!isWaitingForResult && !isGameComplete && (
                            <button
                                onClick={startNewRound}
                                className="bg-transparent border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 hover:text-purple-700 px-6 py-2 rounded-lg transition-all duration-150 shadow-md active:scale-90 active:shadow-sm active:bg-purple-100 font-semibold"
                            >
                                开始新一局
                            </button>
                        )}
                    </div>

                    {/* 打赏支付模态框 */}
                    {isDonationModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">❤️ 感谢支持</h3>
                                    <p className="text-gray-600 text-sm">您的支持是我们持续创作的动力</p>
                                </div>

                                {/* 金额显示 */}
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg py-6 mb-6 border-2 border-orange-200">
                                    <div className="text-center">
                                        <div className="text-gray-600 text-sm mb-1">打赏金额</div>
                                        <div className="text-5xl font-bold text-orange-600">¥100</div>
                                    </div>
                                </div>

                                {!showDonationPaymentForm ? (
                                    <>
                                        {/* 支付方式选择 */}
                                        <div className="space-y-3 mb-6">
                                            <button
                                                onClick={() => handleDonationPaymentSelect('wechat')}
                                                disabled={donationLoading}
                                                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-4 rounded-lg font-bold transition-all shadow hover:shadow-md flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M9.5 7.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5S7.17 6 8 6s1.5.67 1.5 1.5zM21 12c-.55 0-1-.45-1-1V8c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1v3c0 .55-.45 1-1 1s-1-.45-1-1V8c0-1.66 1.34-3 3-3h3c1.66 0 3 1.34 3 3v3c0 .55-.45 1-1 1zm-9 8c-.55 0-1-.45-1-1v-7c0-.55.45-1 1-1s1 .45 1 1v7c0 .55-.45 1-1 1zM7 20c-.55 0-1-.45-1-1v-7c0-.55.45-1 1-1s1 .45 1 1v7c0 .55-.45 1-1 1zm-4-8c-.55 0-1-.45-1-1V8c0-1.66 1.34-3 3-3h3c1.66 0 3 1.34 3 3v3c0 .55-.45 1-1 1s-1-.45-1-1V8c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v3c0 .55-.45 1-1 1z"/>
                                                </svg>
                                                <span>{donationLoading && donationPaymentMethod === 'wechat' ? '加载中...' : '微信支付'}</span>
                                            </button>

                                            <button
                                                onClick={() => handleDonationPaymentSelect('stripe')}
                                                disabled={donationLoading}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-4 rounded-lg font-bold transition-all shadow hover:shadow-md flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M20 8H4V6h16m0 12H4v-6h16m0-8H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2z"/>
                                                </svg>
                                                <span>{donationLoading && donationPaymentMethod === 'stripe' ? '加载中...' : 'Stripe 支付'}</span>
                                            </button>
                                        </div>

                                        {donationError && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-600">{donationError}</p>
                                            </div>
                                        )}

                                        {/* 关闭按钮 */}
                                        <button
                                            onClick={() => setIsDonationModalOpen(false)}
                                            disabled={donationLoading}
                                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                                        >
                                            取消
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* 支付表单 */}
                                        {stripePromise && donationClientSecret && (
                                            <Elements stripe={stripePromise}>
                                                {donationPaymentMethod === 'stripe' && (
                                                    <DonationStripeCardForm
                                                        clientSecret={donationClientSecret}
                                                        onSuccess={handleDonationSuccess}
                                                        onError={handleDonationError}
                                                    />
                                                )}
                                                {donationPaymentMethod === 'wechat' && (
                                                    <DonationWeChatPayForm
                                                        clientSecret={donationClientSecret}
                                                        onSuccess={handleDonationSuccess}
                                                        onError={handleDonationError}
                                                    />
                                                )}
                                            </Elements>
                                        )}

                                        {donationError && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-600">{donationError}</p>
                                            </div>
                                        )}

                                        {/* 返回按钮 */}
                                        <button
                                            onClick={() => {
                                                setShowDonationPaymentForm(false);
                                                setDonationPaymentMethod(null);
                                                setDonationClientSecret(null);
                                                setDonationError(null);
                                            }}
                                            className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                                        >
                                            返回选择其他支付方式
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 止损修改模态框 */}
                    {isStopLossModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">修改止损</h3>
                                <p className="text-xs text-gray-500 mb-4 text-center">建议设置为基数的200倍（当前基数: {baseCode}）</p>

                                {/* 当前值显示 */}
                                <div className="bg-red-50 rounded-lg py-6 mb-6 border-2 border-red-200">
                                    <div className="text-5xl font-bold text-center text-red-600">
                                        {tempStopLossInput}
                                    </div>
                                </div>

                                {/* 数字选择器 */}
                                <div className="mb-6">
                                    {/* 200倍基数快捷按钮 */}
                                    <div className="mb-3">
                                        <button
                                            onClick={() => setTempStopLossInput(String(baseCode * 200))}
                                            className="w-full bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-700 py-3 rounded-lg font-bold transition-colors active:scale-95"
                                        >
                                            基数×200 = {baseCode * 200}
                                        </button>
                                    </div>

                                    {/* 默认快捷数字 */}
                                    <div className="mb-4">
                                        <div className="text-xs text-gray-500 mb-2 text-center">快捷设置</div>
                                        <div className="grid grid-cols-4 gap-2">
                                            <button
                                                onClick={() => setTempStopLossInput('5000')}
                                                className="bg-purple-50 hover:bg-purple-100 text-purple-600 py-3 rounded-lg font-bold transition-colors active:scale-95"
                                            >
                                                5000
                                            </button>
                                            <button
                                                onClick={() => setTempStopLossInput('10000')}
                                                className="bg-purple-50 hover:bg-purple-100 text-purple-600 py-3 rounded-lg font-bold transition-colors active:scale-95"
                                            >
                                                10000
                                            </button>
                                            <button
                                                onClick={() => setTempStopLossInput('15000')}
                                                className="bg-purple-50 hover:bg-purple-100 text-purple-600 py-3 rounded-lg font-bold transition-colors active:scale-95"
                                            >
                                                15000
                                            </button>
                                            <button
                                                onClick={() => setTempStopLossInput('20000')}
                                                className="bg-purple-50 hover:bg-purple-100 text-purple-600 py-3 rounded-lg font-bold transition-colors active:scale-95"
                                            >
                                                20000
                                            </button>
                                        </div>
                                    </div>

                                    {/* 大幅调整 */}
                                    <div className="flex gap-3 mb-3">
                                        <button
                                            onClick={() => adjustTempStopLoss(-500)}
                                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-4 rounded-lg font-bold text-xl transition-colors active:scale-95"
                                        >
                                            -500
                                        </button>
                                        <button
                                            onClick={() => adjustTempStopLoss(500)}
                                            className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 py-4 rounded-lg font-bold text-xl transition-colors active:scale-95"
                                        >
                                            +500
                                        </button>
                                    </div>

                                    {/* 中幅调整 */}
                                    <div className="flex gap-3 mb-3">
                                        <button
                                            onClick={() => adjustTempStopLoss(-100)}
                                            className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-600 py-3 rounded-lg font-bold text-lg transition-colors active:scale-95"
                                        >
                                            -100
                                        </button>
                                        <button
                                            onClick={() => adjustTempStopLoss(100)}
                                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 rounded-lg font-bold text-lg transition-colors active:scale-95"
                                        >
                                            +100
                                        </button>
                                    </div>

                                    {/* 小幅调整 */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => adjustTempStopLoss(-50)}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-bold transition-colors active:scale-95"
                                        >
                                            -50
                                        </button>
                                        <button
                                            onClick={() => adjustTempStopLoss(50)}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-bold transition-colors active:scale-95"
                                        >
                                            +50
                                        </button>
                                    </div>
                                </div>

                                {/* 确认/取消按钮 */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsStopLossModalOpen(false)}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={confirmStopLossChange}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        确定
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 基码修改模态框 */}
                    {isBaseCodeModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">修改基数</h3>

                                {/* 当前值显示 */}
                                <div className="bg-blue-50 rounded-lg py-6 mb-6 border-2 border-blue-200">
                                    <div className="text-5xl font-bold text-center text-blue-600">
                                        {tempBaseCodeInput}
                                    </div>
                                </div>

                                {/* 数字选择器 */}
                                <div className="mb-6">
                                    {/* 默认快捷数字 */}
                                    <div className="mb-4">
                                        <div className="text-xs text-gray-500 mb-2 text-center">快捷设置</div>
                                        <div className="grid grid-cols-4 gap-2">
                                            <button
                                                onClick={() => setTempBaseCodeInput('10')}
                                                className="bg-purple-50 hover:bg-purple-100 text-purple-600 py-3 rounded-lg font-bold transition-colors active:scale-95"
                                            >
                                                10
                                            </button>
                                            <button
                                                onClick={() => setTempBaseCodeInput('50')}
                                                className="bg-purple-50 hover:bg-purple-100 text-purple-600 py-3 rounded-lg font-bold transition-colors active:scale-95"
                                            >
                                                50
                                            </button>
                                            <button
                                                onClick={() => setTempBaseCodeInput('100')}
                                                className="bg-purple-50 hover:bg-purple-100 text-purple-600 py-3 rounded-lg font-bold transition-colors active:scale-95"
                                            >
                                                100
                                            </button>
                                            <button
                                                onClick={() => setTempBaseCodeInput('200')}
                                                className="bg-purple-50 hover:bg-purple-100 text-purple-600 py-3 rounded-lg font-bold transition-colors active:scale-95"
                                            >
                                                200
                                            </button>
                                        </div>
                                    </div>

                                    {/* 大幅调整 */}
                                    <div className="flex gap-3 mb-3">
                                        <button
                                            onClick={() => adjustTempBaseCode(-100)}
                                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-4 rounded-lg font-bold text-xl transition-colors active:scale-95"
                                        >
                                            -100
                                        </button>
                                        <button
                                            onClick={() => adjustTempBaseCode(100)}
                                            className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 py-4 rounded-lg font-bold text-xl transition-colors active:scale-95"
                                        >
                                            +100
                                        </button>
                                    </div>

                                    {/* 中幅调整 */}
                                    <div className="flex gap-3 mb-3">
                                        <button
                                            onClick={() => adjustTempBaseCode(-50)}
                                            className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-600 py-3 rounded-lg font-bold text-lg transition-colors active:scale-95"
                                        >
                                            -50
                                        </button>
                                        <button
                                            onClick={() => adjustTempBaseCode(50)}
                                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 rounded-lg font-bold text-lg transition-colors active:scale-95"
                                        >
                                            +50
                                        </button>
                                    </div>

                                    {/* 小幅调整 */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => adjustTempBaseCode(-10)}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-bold transition-colors active:scale-95"
                                        >
                                            -10
                                        </button>
                                        <button
                                            onClick={() => adjustTempBaseCode(10)}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-bold transition-colors active:scale-95"
                                        >
                                            +10
                                        </button>
                                    </div>
                                </div>

                                {/* 确认/取消按钮 */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsBaseCodeModalOpen(false)}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={confirmBaseCodeChange}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        确定
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 当前序列显示 */}
                    {isGoalVisible ? (
                        <div className="bg-white rounded-lg p-4 shadow-sm border mb-6 relative h-[300px] overflow-y-auto overflow-x-hidden">
                            {/* 隐藏按钮 - 右上角叉号 */}
                            <button
                                onClick={() => setIsGoalVisible(false)}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center text-xs transition-colors z-10"
                            >
                                ✕
                            </button>
                            <div className="text-left text-sm text-gray-600 mb-3">
                                投资目标是获利6个单位的投资
                            </div>
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                <h3 className="text-lg font-semibold"></h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-700">单位投资</label>
                                        <button
                                            onClick={openBaseCodeModal}
                                            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold transition-colors text-sm"
                                        >
                                            {baseCode}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-700">仓位止损</label>
                                        <button
                                            onClick={openStopLossModal}
                                            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold transition-colors text-sm"
                                        >
                                            {stopLoss}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 系统预测显示 */}
                            {(currentSuggestion && isWaitingForResult) || isGameComplete ? (
                                <div className="text-center mb-3 mt-4">
                                    <div className={`rounded-lg px-3 shadow-sm border relative h-[56px] flex items-center justify-center ${
                                        isGameComplete ? 'bg-green-50 border-green-200' : 'bg-white'
                                    }`}>
                                        {/* 隐藏按钮 - 右上角叉号 (仅在非完成状态显示) */}
                                        {!isGameComplete && (
                                            <button
                                                onClick={() => setIsPredictionVisible(!isPredictionVisible)}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                                            >
                                                ✕
                                            </button>
                                        )}

                                        <div className="flex items-center justify-center gap-3 w-full">
                                            <div className="flex items-center gap-2">
                                                {isGameComplete ? (
                                                    <span className="text-sm font-semibold text-green-600">🎉 恭喜完成！</span>
                                                ) : (
                                                    <span className="text-sm font-semibold">投资金额仅供参考</span>
                                                )}
                                            </div>

                                            {isGameComplete ? (
                                                // 游戏完成：显示重新开始按钮
                                                <button
                                                    onClick={handleResetGame}
                                                    className="bg-transparent border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 hover:text-green-700 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 shadow-md active:scale-90 active:shadow-sm active:bg-green-100"
                                                >
                                                    重新开始
                                                </button>
                                            ) : isAnimating ? (
                                                // 动画状态：显示两个圆圈，交替加粗边框，位置随机
                                                <div className="flex gap-2">
                                                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-sm transition-all duration-100 ${
                                                        isPredictionVisible
                                                            ? (circlePositions.left === 'red' ? 'bg-red-300' : 'bg-blue-300')
                                                            : 'bg-gray-400'
                                                    } ${
                                                        animationColor === circlePositions.left
                                                            ? `border-2 ${circlePositions.left === 'red' ? 'border-red-400' : 'border-blue-400'} animate-pulse`
                                                            : `border ${circlePositions.left === 'red' ? 'border-red-200' : 'border-blue-200'}`
                                                    }`}>
                                                        {currentBet}
                                                    </div>
                                                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-sm transition-all duration-100 ${
                                                        isPredictionVisible
                                                            ? (circlePositions.right === 'red' ? 'bg-red-300' : 'bg-blue-300')
                                                            : 'bg-gray-400'
                                                    } ${
                                                        animationColor === circlePositions.right
                                                            ? `border-2 ${circlePositions.right === 'red' ? 'border-red-400' : 'border-blue-400'} animate-pulse`
                                                            : `border ${circlePositions.right === 'red' ? 'border-red-200' : 'border-blue-200'}`
                                                    }`}>
                                                        {currentBet}
                                                    </div>
                                                </div>
                                            ) : (
                                                // 静态状态：显示最终预测结果带边框
                                                <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-sm transition-all duration-300 ${
                                                    isPredictionVisible
                                                        ? (currentSuggestion === 'big'
                                                            ? 'bg-red-300 border-2 border-red-400'
                                                            : 'bg-blue-300 border-2 border-blue-400')
                                                        : 'bg-gray-400 border-2 border-gray-500'
                                                }`}>
                                                    {currentBet}
                                                </div>
                                            )}

                                            {!isGameComplete && (
                                                <div
                                                    onClick={() => setIsPredictionVisible(!isPredictionVisible)}
                                                    className="text-xs text-gray-500 min-w-0 flex-1 cursor-pointer hover:text-gray-700"
                                                >
                                                    {isAnimating ? "运算中..." : (isPredictionVisible ? "点击隐藏" : "已隐藏推荐")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* 结果输入按钮 */}
                            {(isWaitingForResult || isGameComplete) && (
                                <div className="mb-3">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleWin}
                                            disabled={isAnimating || totalPnL <= -stopLoss || isGameComplete}
                                            className={`flex-1 font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-all duration-150 border-2 ${
                                                isAnimating || totalPnL <= -stopLoss || isGameComplete
                                                    ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                                                    : clickedButton === 'win'
                                                        ? 'bg-green-100 border-green-300 text-green-700 scale-90'
                                                        : isPredictionVisible
                                                            ? 'bg-transparent border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 hover:text-green-700 active:scale-90 active:shadow-sm active:bg-green-100'
                                                            : 'bg-transparent border-gray-400 text-gray-600 hover:bg-gray-100 hover:border-gray-500 hover:text-gray-800 active:scale-90 active:shadow-sm active:bg-gray-200'
                                            }`}
                                        >
                                        盈利
                                        </button>
                                        <button
                                            onClick={handleLose}
                                            disabled={isAnimating || totalPnL <= -stopLoss || isGameComplete}
                                            className={`flex-1 font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-all duration-150 border-2 ${
                                                isAnimating || totalPnL <= -stopLoss || isGameComplete
                                                    ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                                                    : clickedButton === 'lose'
                                                        ? 'bg-red-100 border-red-300 text-red-700 scale-90'
                                                        : isPredictionVisible
                                                            ? 'bg-transparent border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 hover:text-red-700 active:scale-90 active:shadow-sm active:bg-red-100'
                                                            : 'bg-transparent border-gray-400 text-gray-600 hover:bg-gray-100 hover:border-gray-500 hover:text-gray-800 active:scale-90 active:shadow-sm active:bg-gray-200'
                                            }`}
                                        >
                                        亏损
                                        </button>
                                        <button
                                            onClick={handleTie}
                                            disabled={isAnimating || totalPnL <= -stopLoss || isGameComplete}
                                            className={`flex-1 font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-all duration-150 border-2 ${
                                                isAnimating || totalPnL <= -stopLoss || isGameComplete
                                                    ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                                                    : clickedButton === 'tie'
                                                        ? 'bg-gray-200 border-gray-400 text-gray-700 scale-90'
                                                        : 'bg-transparent border-gray-400 text-gray-600 hover:bg-gray-100 hover:border-gray-500 hover:text-gray-800 active:scale-90 active:shadow-sm active:bg-gray-200'
                                            }`}
                                        >
                                        持平(和)
                                        </button>
                                        <button
                                            onClick={handleResetGame}
                                            className={`flex-1 font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-all duration-150 border-2 ${
                                                clickedButton === 'reset'
                                                    ? 'bg-gray-200 border-gray-400 text-gray-700 scale-90'
                                                    : 'border-gray-400 bg-transparent hover:bg-gray-100 hover:border-gray-500 text-gray-600 hover:text-gray-800 active:scale-90 active:shadow-sm active:bg-gray-200'
                                            }`}
                                        >
                                        重新开始
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500 text-center mt-2">
                                        盈利 {gameHistory.filter(record => record.result === 'win').length} 次 | 亏损 {gameHistory.filter(record => record.result === 'lose').length} 次 | <span>投资收益 {totalPnL >= 0 ? '+' : ''}{totalPnL}</span> | <span>下次 {currentBet}</span>
                                    </div>
                                    {/* 胜负路显示 */}
                                    {gameHistory.length > 0 && (
                                        <div className="flex items-center justify-center gap-0.5 mt-2 overflow-x-auto">
                                            {gameHistory.slice(-20).map((record, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs font-bold text-gray-800 flex-shrink-0"
                                                >
                                                    {record.result === 'win' ? '✓' : '✗'}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {isSequenceVisible && (
                                <>
                                    <div className="text-xs text-gray-500 mb-3 flex items-center justify-between">
                                        <span>基础数学序列: {sequence.join('-')}，单位投资: {baseCode}{baseCodeInput === '' ? ' (默认)' : ''}</span>
                                        <button
                                            onClick={() => setIsSequenceVisible(false)}
                                            className="ml-2 text-blue-600 hover:text-blue-700 underline"
                                        >
                                            隐藏
                                        </button>
                                    </div>
                                    {/* <div className="text-xs text-gray-500 mb-3">
                                        实际序列: {sequence.map(n => n * baseCode).join('-')}
                                    </div> */}

                                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                                        {sequence.map((num, index) => (
                                            <div
                                                key={index}
                                                className={`min-w-10 h-10 px-2 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                                    (index === 0 || index === sequence.length - 1) && sequence.length > 1
                                                        ? 'bg-blue-500'
                                                        : 'bg-gray-400'
                                                }`}
                                            >
                                                {num * baseCode}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center mb-6">
                            <button
                                onClick={() => setIsGoalVisible(true)}
                                className="bg-transparent border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700 px-6 py-2 rounded-lg transition-all duration-150 text-sm font-semibold shadow-md active:scale-90 active:shadow-sm active:bg-blue-100"
                            >
                                显示投资操作区
                            </button>
                        </div>
                    )}

                    {/* 止损提示 */}
                    {totalPnL <= -stopLoss && !isGameComplete && (
                        <div className="text-center mb-6">
                            <div className="bg-red-50 rounded-lg py-3 px-6 shadow-sm border border-red-200">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="text-red-600 font-bold text-lg">⚠️ 已达止损点</div>
                                    <div className="text-red-700 text-sm">建议停止游戏，出去走一圈散散心~</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 游戏历史 */}
                    {gameHistory.length > 0 && (
                        <div className="bg-white rounded-lg p-4 shadow-sm border">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold">投资记录</h3>
                                <div className="text-xs text-gray-500">
                                    盈利 {gameHistory.filter(record => record.result === 'win').length} 条 |
                                    亏损 {gameHistory.filter(record => record.result === 'lose').length} 条
                                </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                <div className="space-y-2">
                                    {gameHistory.slice(-10).reverse().map((record, index) => (
                                        <div key={gameHistory.length - index} className="flex items-center justify-between text-sm border-b pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                                                    {gameHistory.length - index}
                                                </span>
                                                <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">
                                                    {record.result === 'win' ? '盈利' : '亏损'}
                                                </span>
                                                <span className="px-1 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                                                    {record.suggestion === 'big' ? '大' : '小'}
                                                </span>
                                                <span className="text-xs">下注: {record.bet}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-gray-700">
                                                    {record.pnl >= 0 ? '+' : ''}{record.pnl}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {gameHistory.length > 10 && (
                                <div className="text-xs text-gray-500 text-center mt-2">
                                    显示最近10条记录，共{gameHistory.length}条
                                </div>
                            )}
                        </div>
                    )}

                    {/* 使用说明 */}
                    <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200">
                        <button
                            onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
                            className="w-full p-4 flex items-center justify-between hover:bg-blue-100 transition-colors rounded-lg"
                        >
                            <h4 className="font-semibold text-blue-800">如何做到理性投资</h4>
                            <span className={`text-blue-800 transition-transform duration-200 ${isInstructionsOpen ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>
                        {isInstructionsOpen && (
                            <div className="px-4 pb-4">
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>•<span>任何的投资都有风险，任何投资都要做到理性投资，盲目投资失败的概率是99%。我们的投资策略拯救两类人，一类是在行情好的时候获得的收益太少，另一类是在行情不好的时候损失惨重。想要理性投资但又不知如何下手的人群。本工具基于随机理论和数学序列，提供了一种科学的资金分配方法，帮助用户在投资过程中实现理性投资，从而在投资亏损次数多于投资收益次数的情况下依然能够获得6个单位的投资收益。</span></li>
                                    <li>•科学的资金分配方法是投资成败的关键，本工具提供了一个科学的资金分配方法，帮助用户根据当前投资环境做出更明智的投资决策，实现最优化的理性投资，在猜错次数大于猜对次数的情况下获得6个单位的投资收益。</li>
                                    <li>• <strong>人工智能建议</strong>: 系统提供了一个人工智能的建议，这是一个在随机理论基础上的人工智能分析结果预测，如果您有更好预期方式，可以自行选择是否采用</li>
                                    <li>• <strong>系统会根据上一局的结果自动提示下一局的科学资金分配</strong>: 根据投资现场结果点击"盈利"或"亏损"，系统会提示下一局的投资金额，防止盲目投资导致投资冲动带来的严重后果，投资要记住一点留的青山在不怕没柴烧</li>
                                    <li>• <strong>投资单位设置</strong>: 可设置单位数字(默认50)</li>
                                    <li>• <strong>投资止损设置</strong>: 建议设置为基数的200倍单位资金(默认10000)，亏损达到止损点时系统会提示您停止游戏，除非您重新修改止损点</li>
                                    <li>• <strong>投资策略介绍</strong>: 初始序列1-2-2-1，投资金额=(首+尾)×单位投资</li>                                    
                                    <li>• <strong>目标</strong>: 将所有数字消除完毕即完成目标6个投资单位的盈利</li>
                                    {/* <li>• <strong>亏损</strong>: 将上次投资金额添加到序列末尾，错误加一个数字</li>
                                    <li>• <strong>盈利</strong>: 移除序列的首位和末位数字，正确消两个数字</li> */}
                                </ul>

                                {/* 打赏按钮 */}
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <button
                                        onClick={() => setIsDonationModalOpen(true)}
                                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95"
                                    >
                                        ❤️ 觉得有用？请作者喝杯咖啡
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}