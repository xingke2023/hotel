import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';

type DiceResult = 'big' | 'small';

export default function Calculator2() {
    const [baseCode, setBaseCode] = useState(20);
    const [baseCodeInput, setBaseCodeInput] = useState('20');
    const [sequence, setSequence] = useState([1, 2, 2, 1]);
    const [totalPnL, setTotalPnL] = useState(0);
    const [currentBet, setCurrentBet] = useState(40);
    const [gameHistory, setGameHistory] = useState<Array<{bet: number, result: 'win' | 'lose', pnl: number, sequence: number[], suggestion: DiceResult}>>([]);
    const [isGameComplete, setIsGameComplete] = useState(false);
    
    // 预测系统相关状态
    const [currentSuggestion, setCurrentSuggestion] = useState<DiceResult | null>(null);
    const [isWaitingForResult, setIsWaitingForResult] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationColor, setAnimationColor] = useState<'red' | 'blue'>('red');
    const [isPredictionVisible, setIsPredictionVisible] = useState(true);
    const [circlePositions, setCirclePositions] = useState<{left: 'red' | 'blue', right: 'red' | 'blue'}>({left: 'red', right: 'blue'});
    
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
        
        // 1秒后停止动画并执行回调
        setTimeout(() => {
            clearInterval(colorInterval);
            setIsAnimating(false);
            callback();
        }, 1000);
    };

    // 处理输的情况
    const handleLose = () => {
        if (!isWaitingForResult || !currentSuggestion || isGameComplete || isAnimating) return;
        
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
            
            // 生成下一轮建议
            const nextSuggestion = generateSuggestion();
            setCurrentSuggestion(nextSuggestion);
            setIsWaitingForResult(true);
        });
    };

    // 处理赢的情况
    const handleWin = () => {
        if (!isWaitingForResult || !currentSuggestion || isGameComplete || isAnimating) return;
        
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
            
            // 如果游戏未完成，生成下一轮建议
            if (!gameComplete) {
                const nextSuggestion = generateSuggestion();
                setCurrentSuggestion(nextSuggestion);
                setIsWaitingForResult(true);
            } else {
                setIsWaitingForResult(false);
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
        setIsPredictionVisible(true);
        setCirclePositions({left: 'red', right: 'blue'});
        // 重置基码输入但保持当前基码值
    };

    // 重置游戏（带动画效果）
    const handleResetGame = () => {
        // 先重置游戏状态
        resetGame();
        
        // 然后显示预测动画并生成新建议
        startPredictionAnimation(() => {
            const newSuggestion = generateSuggestion();
            setCurrentSuggestion(newSuggestion);
            setIsWaitingForResult(true);
        });
    };

    // 更新基码
    const handleBaseCodeChange = (inputValue: string) => {
        setBaseCodeInput(inputValue);
        
        // 如果输入为空，使用默认值20
        const newBaseCode = inputValue === '' ? 20 : Number(inputValue);
        
        if (newBaseCode > 0) {
            setBaseCode(newBaseCode);
        }
    };

    // 初始化当前下注
    useEffect(() => {
        setCurrentBet(calculateCurrentBet(sequence));
    }, [sequence, baseCode]);

    return (
        <FrontendLayout>
            <Head title="1221注码系统" />
            
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="relative mb-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-800">🎯 1221缆法游戏</h1>
                            <p className="text-sm text-gray-600 mt-2">
                                1221缆法系统
                            </p>
                        </div>
                        
                        {/* 重置游戏按钮 - 右上角，默认显示 */}
                        <button
                            onClick={handleResetGame}
                            className="absolute -top-6 -right-6 border border-gray-400 bg-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-800 px-2 py-1 rounded transition-colors text-xs"
                        >
                            重新开始游戏
                        </button>
                    </div>



                    {/* 显示预测按钮（当预测被隐藏时） */}
                    {currentSuggestion && isWaitingForResult && !isPredictionVisible && (
                        <div className="text-center mb-6">
                            <button
                                onClick={() => setIsPredictionVisible(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                            >
                                显示随机预测
                            </button>
                        </div>
                    )}

                    {/* 系统预测显示 */}
                    {currentSuggestion && isWaitingForResult && isPredictionVisible && (
                        <div className="text-center mb-4">
                            <div className="bg-white rounded-lg px-3 py-2 shadow-sm border relative">
                                {/* 隐藏按钮 - 右上角叉号 */}
                                <button
                                    onClick={() => setIsPredictionVisible(false)}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                                >
                                    ✕
                                </button>
                                
                                <div className="flex items-center justify-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">随机数预测器，仅供参考</span>
                                        
                                    </div>
                                    
                                    {isAnimating ? (
                                        // 动画状态：显示两个圆圈，交替加粗边框，位置随机
                                        <div className="flex gap-2">
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-xs transition-all duration-100 ${
                                                circlePositions.left === 'red' ? 'bg-red-500' : 'bg-blue-500'
                                            } ${
                                                animationColor === circlePositions.left 
                                                    ? `border-2 ${circlePositions.left === 'red' ? 'border-red-700' : 'border-blue-700'} animate-pulse` 
                                                    : `border ${circlePositions.left === 'red' ? 'border-red-300' : 'border-blue-300'}`
                                            }`}>
                                                {currentBet}
                                            </div>
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-xs transition-all duration-100 ${
                                                circlePositions.right === 'red' ? 'bg-red-500' : 'bg-blue-500'
                                            } ${
                                                animationColor === circlePositions.right 
                                                    ? `border-2 ${circlePositions.right === 'red' ? 'border-red-700' : 'border-blue-700'} animate-pulse` 
                                                    : `border ${circlePositions.right === 'red' ? 'border-red-300' : 'border-blue-300'}`
                                            }`}>
                                                {currentBet}
                                            </div>
                                        </div>
                                    ) : (
                                        // 静态状态：显示最终预测结果带边框
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-xs transition-all duration-300 ${
                                            currentSuggestion === 'big' 
                                                ? 'bg-red-500 border-2 border-red-700' 
                                                : 'bg-blue-500 border-2 border-blue-700'
                                        }`}>
                                            {currentBet}
                                        </div>
                                    )}
                                    
                                    <div className="text-xs text-gray-500 min-w-0 flex-1">
                                        {isAnimating ? "运算中..." : "点击隐藏"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 游戏完成提示 */}
                    {isGameComplete && (
                        <div className="text-center mb-6">
                            <div className="bg-green-50 rounded-lg p-6 shadow-sm border border-green-200">
                                <div className="text-green-600 font-bold text-xl mb-2">🎉 恭喜完成！</div>
                                <div className="text-green-700">所有序列已消除，投注系统完成一轮</div>
                            </div>
                        </div>
                    )}


                    {/* 控制按钮 */}
                    <div className="text-center mb-6">
                        {!isWaitingForResult && !isGameComplete && (
                            <button
                                onClick={startNewRound}
                                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                开始新一局
                            </button>
                        )}
                    </div>

                    {/* 当前序列显示 */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">1221消数缆法</h3>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-semibold text-gray-700">基码:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={baseCodeInput}
                                    onChange={(e) => handleBaseCodeChange(e.target.value)}
                                    placeholder="20"
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center font-bold text-sm"
                                />
                            </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-3">
                            基础序列: {sequence.join('-')}，基码: {baseCode}{baseCodeInput === '' ? ' (默认)' : ''}
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
                        
                        {sequence.length === 0 ? (
                            <div className="text-center">
                                <div className="text-green-600 font-bold text-lg mb-2">🎉 序列完成！</div>
                                <div className="text-sm text-gray-600">所有数字已消除</div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className={`text-lg font-bold mb-2 ${
                                    totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    总得分: {totalPnL >= 0 ? '+' : ''}{totalPnL}
                                </div>
                                <div className="text-lg font-semibold text-gray-800">
                                    下局注码: <span className="text-blue-600">{currentBet}</span>
                                </div>
                                {sequence.length > 1 ? (
                                    <div className="text-sm text-gray-600 mt-1">
                                        ({sequence[0]} + {sequence[sequence.length - 1]}) × {baseCode} = {currentBet}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-600 mt-1">
                                        {sequence[0]} × {baseCode} = {currentBet} (最后一个数字)
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* 结果输入按钮 - 移动到1221消数缆法div内 */}
                        {isWaitingForResult && !isGameComplete && (
                            <div className="mt-4">
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleWin}
                                        disabled={isAnimating}
                                        className={`flex-1 font-bold py-2 px-4 rounded-lg text-sm shadow transition-all ${
                                            isAnimating
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md active:scale-95'
                                        }`}
                                    >
                                        正确
                                    </button>
                                    <button
                                        onClick={handleLose}
                                        disabled={isAnimating}
                                        className={`flex-1 font-bold py-2 px-4 rounded-lg text-sm shadow transition-all ${
                                            isAnimating
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-500 text-white hover:bg-gray-600 hover:shadow-md active:scale-95'
                                        }`}
                                    >
                                        错误
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 text-center mt-2">
                                    正确 {gameHistory.filter(record => record.result === 'win').length} 次 | 
                                    错误 {gameHistory.filter(record => record.result === 'lose').length} 次
                                </div>
                            </div>
                        )}
                    </div>

                    

                    {/* 游戏历史 */}
                    {gameHistory.length > 0 && (
                        <div className="bg-white rounded-lg p-4 shadow-sm border">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold">游戏记录</h3>
                                <div className="text-xs text-gray-500">
                                    正确 {gameHistory.filter(record => record.result === 'win').length} 条 | 
                                    错误 {gameHistory.filter(record => record.result === 'lose').length} 条
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
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    record.result === 'win' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {record.result === 'win' ? '正确' : '错误'}
                                                </span>
                                                <span className={`px-1 py-0.5 rounded text-xs ${
                                                    record.suggestion === 'big' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {record.suggestion === 'big' ? '大' : '小'}
                                                </span>
                                                <span className="text-xs">下注: {record.bet}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-semibold ${
                                                    record.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
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
                    <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">使用说明</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <span className="text-red-600">科学的注码分配方法是投资成败的关键，本工具提供了一个科学的注码分配方法，帮助用户根据当前局势做出更明智的注码分配决策，实现在错误次数大于正确次数的情况下获得6个基码的赢利。</span>
                            <li>• <strong>随机数生成器</strong>: 系统提供了一个随机数预测的建议，这是一个完全随机的结果预测，如果您有更好的切入点，可以自行选择是否采用</li>
                            <li>• <strong>系统会根据上一局输赢自动提示下一局的科学投注金额</strong>: 根据现场游戏结果点击"正确"或"错误"，系统会提示下一局的投资金额，防止盲目投资导致上头</li>
                            <li>• <strong>基码设置</strong>: 可设置基码(如20)，基础序列1-2-2-1变成20-40-40-20</li>
                            <li>• <strong>1221消数缆法系统介绍</strong>: 初始序列1-2-2-1，下注金额=(首+尾)×基码</li>
                            <li>• <strong>预测错误</strong>: 将上次下注数字添加到序列末尾，错误加一个数字</li>
                            <li>• <strong>预测正确</strong>: 移除序列的首位和末位数字，正确消两个数字</li>
                            <li>• <strong>目标</strong>: 将所有数字消除完毕即完成目标6个基码的盈利</li>
                        </ul>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}