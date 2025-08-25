import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';

type DiceResult = 'big' | 'small';

export default function Calculator2() {
    const [baseCode, setBaseCode] = useState(20);
    const [baseCodeInput, setBaseCodeInput] = useState('20');
    const [sequence, setSequence] = useState([1, 2, 2, 1]);
    const [totalPnL, setTotalPnL] = useState(0);
    const [currentBet, setCurrentBet] = useState(40);
    const [gameHistory, setGameHistory] = useState<Array<{bet: number, result: 'win' | 'lose', pnl: number, sequence: number[], suggestion: DiceResult, playerChoice?: 'red' | 'blue', gameResult?: 'red' | 'blue'}>>([]);
    const [isGameComplete, setIsGameComplete] = useState(false);
    
    // 预测系统相关状态
    const [currentSuggestion, setCurrentSuggestion] = useState<DiceResult | null>(null);
    const [isWaitingForResult, setIsWaitingForResult] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationColor, setAnimationColor] = useState<'red' | 'blue'>('red');
    const [isPredictionVisible, setIsPredictionVisible] = useState(true);
    const [circlePositions, setCirclePositions] = useState<{left: 'red' | 'blue', right: 'red' | 'blue'}>({left: 'red', right: 'blue'});
    const [gameResult, setGameResult] = useState<{isWin: boolean, playerChoice: 'red' | 'blue', systemResult: 'red' | 'blue'} | null>(null);
    const [showResult, setShowResult] = useState(false);
    
    // 自动模拟相关状态
    const [isAutoMode, setIsAutoMode] = useState(false);
    const [autoRounds, setAutoRounds] = useState(50);
    const [autoRoundsInput, setAutoRoundsInput] = useState('50');
    const [currentAutoRound, setCurrentAutoRound] = useState(0);
    const [autoSpeed, setAutoSpeed] = useState(500); // 每局间隔ms
    const [isAutoPaused, setIsAutoPaused] = useState(false);
    const autoModeRef = useRef(false);
    const autoPausedRef = useRef(false);
    
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

    // 开始新一局
    const startNewRound = () => {
        if (isGameComplete) return;
        
        setCurrentSuggestion(null);
        setIsWaitingForResult(true);
    };

    // 开始游戏（首次进入）
    if (!isWaitingForResult && !isGameComplete && !isAutoMode && gameHistory.length === 0) {
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
        
        // 1秒后停止动画，立即显示结果并执行游戏逻辑
        setTimeout(() => {
            clearInterval(colorInterval);
            // 先执行游戏逻辑，再同时更新UI状态
            callback();
            setIsAnimating(false);
            setShowResult(true);
        }, 1000);
    };

    // 处理红色按钮点击
    const handleRedClick = () => {
        if (!isWaitingForResult || isGameComplete || isAnimating) return;
        
        // 清理上一轮结果显示
        setShowResult(false);
        setGameResult(null);
        
        const betAmount = currentBet;
        const playerChoice = 'red';
        // 用户预测后，系统生成结果
        const systemResult = generateSuggestion(); // 生成大或小
        const systemColor = systemResult === 'big' ? 'red' : 'blue'; // 大=红，小=蓝
        const isWin = playerChoice === systemColor;
        
        // 设置结果用于显示
        setGameResult({
            isWin,
            playerChoice,
            systemResult: systemColor
        });
        
        startPredictionAnimation(() => {
            
            if (isWin) {
                // 预测正确：+分，消除首尾数字
                // 如果结果是红色且赢了，需要扣除5%抽水
                const winAmount = systemColor === 'red' ? 
                    betAmount * 0.95 : betAmount;
                const newPnL = totalPnL + winAmount;
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
                    suggestion: systemResult,
                    playerChoice,
                    gameResult: systemColor
                }]);
                
                // 如果游戏未完成，生成下一轮建议
                if (!gameComplete) {
                    const nextSuggestion = generateSuggestion();
                    setCurrentSuggestion(nextSuggestion);
                    setIsWaitingForResult(true);
                } else {
                    setIsWaitingForResult(false);
                }
            } else {
                // 预测错误：-分，添加数字到序列末尾
                const newPnL = totalPnL - betAmount;
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
                    suggestion: systemResult,
                    playerChoice,
                    gameResult: systemColor
                }]);
                
                // 继续下一轮，但不清理结果显示
                setCurrentSuggestion(null);
                setIsWaitingForResult(true);
            }
        });
    };

    // 处理蓝色按钮点击
    const handleBlueClick = () => {
        if (!isWaitingForResult || isGameComplete || isAnimating) return;
        
        // 清理上一轮结果显示
        setShowResult(false);
        setGameResult(null);
        
        const betAmount = currentBet;
        const playerChoice = 'blue';
        // 用户预测后，系统生成结果
        const systemResult = generateSuggestion(); // 生成大或小
        const systemColor = systemResult === 'big' ? 'red' : 'blue'; // 大=红，小=蓝
        const isWin = playerChoice === systemColor;
        
        // 设置结果用于显示
        setGameResult({
            isWin,
            playerChoice,
            systemResult: systemColor
        });
        
        startPredictionAnimation(() => {
            
            if (isWin) {
                // 预测正确：+分，消除首尾数字
                // 如果结果是红色且赢了，需要扣除5%抽水
                const winAmount = systemColor === 'red' ? 
                    betAmount * 0.95 : betAmount;
                const newPnL = totalPnL + winAmount;
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
                    suggestion: systemResult,
                    playerChoice,
                    gameResult: systemColor
                }]);
                
                // 如果游戏未完成，生成下一轮建议
                if (!gameComplete) {
                    const nextSuggestion = generateSuggestion();
                    setCurrentSuggestion(nextSuggestion);
                    setIsWaitingForResult(true);
                } else {
                    setIsWaitingForResult(false);
                }
            } else {
                // 预测错误：-分，添加数字到序列末尾
                const newPnL = totalPnL - betAmount;
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
                    suggestion: systemResult,
                    playerChoice,
                    gameResult: systemColor
                }]);
                
                // 继续下一轮，但不清理结果显示
                setCurrentSuggestion(null);
                setIsWaitingForResult(true);
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
        setGameResult(null);
        setShowResult(false);
        // 重置基码输入但保持当前基码值
    };

    // 重置游戏（带动画效果）
    const handleResetGame = () => {
        // 先重置游戏状态
        resetGame();
        
        // 停止自动模拟
        setIsAutoMode(false);
        setIsAutoPaused(false);
        autoModeRef.current = false;
        autoPausedRef.current = false;
        setCurrentAutoRound(0);
        
        // 直接开始等待用户预测
        setIsWaitingForResult(true);
    };

    // 自动模拟游戏逻辑
    const simulateOneRound = (sequence: number[], totalPnL: number, gameHistory: any[]) => {
        if (sequence.length === 0) return null;
        
        const betAmount = calculateCurrentBet(sequence);
        // 随机选择红色或蓝色
        const playerChoice: 'red' | 'blue' = Math.random() < 0.5 ? 'red' : 'blue';
        // 系统生成结果
        const systemResult = generateSuggestion();
        const systemColor = systemResult === 'big' ? 'red' : 'blue';
        const isWin = playerChoice === systemColor;
        
        if (isWin) {
            // 预测正确：+分，消除首尾数字
            // 如果结果是红色且赢了，需要扣除5%抽水
            const winAmount = systemColor === 'red' ? 
                betAmount * 0.95 : betAmount;
            const newPnL = totalPnL + winAmount;
            let newSequence = [...sequence];
            
            // 移除首位和末位数字
            if (newSequence.length > 1) {
                newSequence = newSequence.slice(1, -1);
            } else if (newSequence.length === 1) {
                newSequence = [];
            }
            
            const newHistory = [...gameHistory, {
                bet: betAmount,
                result: 'win' as const,
                pnl: newPnL,
                sequence: [...newSequence],
                suggestion: systemResult,
                playerChoice,
                gameResult: systemColor
            }];
            
            return {
                sequence: newSequence,
                totalPnL: newPnL,
                gameHistory: newHistory,
                isComplete: newSequence.length === 0
            };
        } else {
            // 预测错误：-分，添加数字到序列末尾
            const newPnL = totalPnL - betAmount;
            const baseValueToAdd = betAmount / baseCode;
            const newSequence = [...sequence, baseValueToAdd];
            
            const newHistory = [...gameHistory, {
                bet: betAmount,
                result: 'lose' as const,
                pnl: newPnL,
                sequence: [...newSequence],
                suggestion: systemResult,
                playerChoice,
                gameResult: systemColor
            }];
            
            return {
                sequence: newSequence,
                totalPnL: newPnL,
                gameHistory: newHistory,
                isComplete: false
            };
        }
    };

    // 开始自动模拟
    const startAutoSimulation = async () => {
        if (autoModeRef.current) return;
        
        setIsAutoMode(true);
        setIsAutoPaused(false);
        autoModeRef.current = true;
        autoPausedRef.current = false;
        
        // 如果是首次开始，重置轮数计数
        if (currentAutoRound === 0) {
            setIsWaitingForResult(false);
        }
        
        let currentSequence = [...sequence];
        let currentPnL = totalPnL;
        let currentHistory = [...gameHistory];
        let roundCount = currentAutoRound; // 从当前轮数继续
        
        while (roundCount < autoRounds && currentSequence.length > 0 && autoModeRef.current) {
            // 检查是否暂停
            while (autoPausedRef.current && autoModeRef.current) {
                await new Promise<void>(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, 100);
                });
            }
            
            // 如果已经停止，退出循环
            if (!autoModeRef.current) break;
            
            const result = simulateOneRound(currentSequence, currentPnL, currentHistory);
            if (!result) break;
            
            currentSequence = result.sequence;
            currentPnL = result.totalPnL;
            currentHistory = result.gameHistory;
            roundCount++;
            
            // 更新UI状态
            setSequence([...currentSequence]);
            setTotalPnL(currentPnL);
            setGameHistory([...currentHistory]);
            setCurrentBet(calculateCurrentBet(currentSequence));
            setCurrentAutoRound(roundCount);
            
            if (result.isComplete) {
                setIsGameComplete(true);
                break;
            }
            
            // 等待指定时间间隔
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, autoSpeed);
            });
        }
        
        // 如果完成了所有轮次或游戏完成，重置状态
        if (roundCount >= autoRounds || isGameComplete || currentSequence.length === 0) {
            setIsAutoMode(false);
            setIsAutoPaused(false);
            autoModeRef.current = false;
            autoPausedRef.current = false;
            if (currentSequence.length > 0 && !isGameComplete) {
                setIsWaitingForResult(true);
            }
        }
    };

    // 暂停自动模拟
    const pauseAutoSimulation = () => {
        setIsAutoPaused(true);
        autoPausedRef.current = true;
    };

    // 继续自动模拟
    const resumeAutoSimulation = () => {
        setIsAutoPaused(false);
        autoPausedRef.current = false;
    };

    // 停止自动模拟
    const stopAutoSimulation = () => {
        setIsAutoMode(false);
        setIsAutoPaused(false);
        autoModeRef.current = false;
        autoPausedRef.current = false;
        setCurrentAutoRound(0); // 完全停止时重置轮数
        if (sequence.length > 0 && !isGameComplete) {
            setIsWaitingForResult(true);
        }
    };

    // 更新自动轮数
    const handleAutoRoundsChange = (inputValue: string) => {
        setAutoRoundsInput(inputValue);
        const newRounds = inputValue === '' ? 50 : Number(inputValue);
        if (newRounds > 0) {
            setAutoRounds(newRounds);
        }
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
            <Head title="🎯 猜红蓝颜色小游戏 - 1221消数法" />
            
            <div className="min-h-screen p-4">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="relative mb-6">
                        <div className="text-center">
                            
                            <h1 className="text-xl font-bold ">🎯 猜红蓝颜色小游戏</h1>
                            <p className="text-sm text-gray-600 mt-2">
                                1221消数法 + 红蓝预测挑战
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



                    

                    {/* 系统生成结果动画和结果显示 */}
                    {(isAnimating || showResult) && (
                        <div className="text-center mb-4">
                            <div className="bg-white rounded-lg px-3 py-2 shadow-sm border relative">
                                <div className="flex items-center justify-center gap-3">
                                    {gameResult && (
                                        isAnimating ? (
                                            /* 动画阶段：同一行显示 */
                                            <div className="flex items-center justify-center gap-2 text-sm">
                                                <span className="text-gray-500">你选</span>
                                                <span className={gameResult.playerChoice === 'red' ? 'text-red-600' : 'text-blue-600'}>
                                                    {gameResult.playerChoice === 'red' ? '红' : '蓝'}
                                                </span>
                                                <span className="text-gray-500">结果</span>
                                                
                                                {/* 动画圆圈 */}
                                                <div className="flex gap-1">
                                                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-white font-bold text-xs transition-all duration-100 ${
                                                        circlePositions.left === 'red' ? 'bg-red-500' : 'bg-blue-500'
                                                    } ${
                                                        animationColor === circlePositions.left 
                                                            ? `border-2 ${circlePositions.left === 'red' ? 'border-red-700' : 'border-blue-700'} animate-pulse` 
                                                            : `border ${circlePositions.left === 'red' ? 'border-red-300' : 'border-blue-300'}`
                                                    }`}>
                                                        ?
                                                    </div>
                                                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-white font-bold text-xs transition-all duration-100 ${
                                                        circlePositions.right === 'red' ? 'bg-red-500' : 'bg-blue-500'
                                                    } ${
                                                        animationColor === circlePositions.right 
                                                            ? `border-2 ${circlePositions.right === 'red' ? 'border-red-700' : 'border-blue-700'} animate-pulse` 
                                                            : `border ${circlePositions.right === 'red' ? 'border-red-300' : 'border-blue-300'}`
                                                    }`}>
                                                        ?
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                        /* 结果显示：简洁显示 */
                                        <div className="flex items-center justify-center gap-2 text-sm">
                                            <span className="text-gray-500">你选</span>
                                            <span className={gameResult.playerChoice === 'red' ? 'text-red-600' : 'text-blue-600'}>
                                                {gameResult.playerChoice === 'red' ? '红' : '蓝'}
                                            </span>
                                            <span className="text-gray-500">结果</span>
                                            <span className={gameResult.systemResult === 'red' ? 'text-red-600' : 'text-blue-600'}>
                                                {gameResult.systemResult === 'red' ? '红' : '蓝'}
                                            </span>
                                            <span className={`font-bold ${gameResult.isWin ? 'text-green-600' : 'text-red-600'}`}>
                                                {gameResult.isWin ? '成功' : '失败'}
                                            </span>
                                        </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 游戏记录 - 简洁显示 */}
                    {gameHistory.length > 0 && (showResult || isAnimating || isAutoMode || isGameComplete) && (
                        <div className="text-center mb-2">
                            <div className="flex flex-wrap gap-1 justify-center">
                                {gameHistory.slice(-20).map((record, index) => (
                                    <span key={index} className={`text-lg ${
                                        record.result === 'win' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {record.result === 'win' ? '✓' : '✗'}
                                    </span>
                                ))}
                            </div>
                            {(isAutoMode || isGameComplete) && gameHistory.length > 0 && (
                                <div className="text-xs text-gray-600 mt-1">
                                    最后一局: 选择{gameHistory[gameHistory.length - 1].playerChoice === 'red' ? '红色' : '蓝色'} → 
                                    结果{gameHistory[gameHistory.length - 1].gameResult === 'red' ? '红色' : '蓝色'} → 
                                    {gameHistory[gameHistory.length - 1].result === 'win' ? '成功' : '失败'}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 游戏完成提示 */}
                    {isGameComplete && (
                        <div className="text-center mb-6">
                            <div className="bg-green-50 rounded-lg p-6 shadow-sm border border-green-200">
                                <div className="text-green-600 font-bold text-xl mb-4">🎉 恭喜完成！</div>
                                <div className="text-green-700 mb-4">所有序列已消除，投注系统完成一轮</div>
                                
                                {/* 运行统计数据 */}
                                <div className="bg-white rounded-lg p-4 mt-4 border">
                                    <h4 className="text-gray-800 font-semibold mb-3">📊 运行统计</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="text-center">
                                            <div className="text-gray-600">总轮数</div>
                                            <div className="text-lg font-bold text-blue-600">{gameHistory.length}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-gray-600">最终得分</div>
                                            <div className={`text-lg font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {totalPnL >= 0 ? '+' : ''}{totalPnL}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-gray-600">成功次数</div>
                                            <div className="text-lg font-bold text-green-600">
                                                {gameHistory.filter(record => record.result === 'win').length}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-gray-600">失败次数</div>
                                            <div className="text-lg font-bold text-red-600">
                                                {gameHistory.filter(record => record.result === 'lose').length}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-gray-600">最大亏损</div>
                                            <div className="text-lg font-bold text-red-600">
                                                {gameHistory.length > 0 ? 
                                                    Math.min(...gameHistory.map(record => record.pnl), 0)
                                                    : 0}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-gray-600">最大下注</div>
                                            <div className="text-lg font-bold text-orange-600">
                                                {gameHistory.length > 0 ? 
                                                    Math.max(...gameHistory.map(record => record.bet))
                                                    : 0}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="text-center">
                                            <div className="text-gray-600 text-sm">成功率</div>
                                            <div className="text-lg font-bold text-purple-600">
                                                {gameHistory.length > 0 ? 
                                                    Math.round((gameHistory.filter(record => record.result === 'win').length / gameHistory.length) * 100)
                                                    : 0}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 重新开始按钮 */}
                                <div className="mt-4">
                                    <button
                                        onClick={handleResetGame}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                                    >
                                        🎮 重新开始游戏
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* 控制按钮 */}
                    <div className="text-center mb-6">
                        {!isWaitingForResult && !isGameComplete && !isAutoMode && (
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
                            <h3 className="text-lg font-semibold"></h3>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-3">
                            基础数学序列: {sequence.join('-')}，基码: {baseCode}{baseCodeInput === '' ? ' (默认)' : ''}
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
                                <div className={`text-md font-bold mb-2 ${
                                    totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    总得分: {totalPnL >= 0 ? '+' : ''}{totalPnL}
                                </div>
                                <div className="text-md text-gray-800">
                                    下次分值: <span className="text-blue-600">{currentBet}</span>
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
                        

                        {/* 自动模拟进度 */}
                        {isAutoMode && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-700">
                                        {isAutoPaused ? '已暂停' : '自动模拟中...'}
                                    </span>
                                    <div className="flex gap-2">
                                        {isAutoPaused ? (
                                            <button
                                                onClick={resumeAutoSimulation}
                                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                            >
                                                继续
                                            </button>
                                        ) : (
                                            <button
                                                onClick={pauseAutoSimulation}
                                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                            >
                                                暂停
                                            </button>
                                        )}
                                        <button
                                            onClick={stopAutoSimulation}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                        >
                                            停止
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-200 rounded-full h-2 mb-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            isAutoPaused ? 'bg-orange-500' : 'bg-purple-500'
                                        }`}
                                        style={{ width: `${(currentAutoRound / autoRounds) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-600 text-center">
                                    第 {currentAutoRound} / {autoRounds} 轮
                                    {isAutoPaused && <span className="text-orange-600 ml-2">⏸️ 暂停中</span>}
                                </div>
                            </div>
                        )}

                        {/* 红蓝预测按钮 */}
                        {isWaitingForResult && !isGameComplete && !isAutoMode && (
                            <div className="mt-4">
                                <div className="text-center mb-3">
                                    <div className="text-sm text-gray-700 font-medium mb-2">🎯 选择你的预测</div>
                                    
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleRedClick}
                                        disabled={isAnimating}
                                        className={`group relative flex-1 font-bold py-2 px-6 rounded-2xl text-lg shadow-xl transition-all duration-300 transform hover:scale-105 ${
                                            isAnimating
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-2xl active:scale-95'
                                        }`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative z-10 flex items-center justify-center gap-2">
                                            
                                            <span>红色</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleBlueClick}
                                        disabled={isAnimating}
                                        className={`group relative flex-1 font-bold py-2 px-6 rounded-2xl text-lg shadow-xl transition-all duration-300 transform hover:scale-105 ${
                                            isAnimating
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-2xl active:scale-95'
                                        }`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative z-10 flex items-center justify-center gap-2">
                                            
                                            <span>蓝色</span>
                                        </div>
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 text-center mt-2">
                                    正确 {gameHistory.filter(record => record.result === 'win').length} 次 | 
                                    错误 {gameHistory.filter(record => record.result === 'lose').length} 次
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 自动模拟控制 */}
                    {!isAutoMode && !isGameComplete && (
                        <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
                            <h4 className="text-gray-800 font-semibold mb-3">🤖 自动模拟</h4>
                            
                            {/* 基数设置 */}
                            <div className="flex items-center gap-2 mb-3">
                                <label className="text-sm text-gray-700">基数</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={baseCodeInput}
                                    onChange={(e) => handleBaseCodeChange(e.target.value)}
                                    placeholder="20"
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                />
                                <span className="text-xs text-gray-500">
                                    当前基码: {baseCode}{baseCodeInput === '' ? ' (默认)' : ''}
                                </span>
                            </div>
                            
                            {/* 模拟设置 */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <label className="text-sm text-gray-700">轮数</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={autoRoundsInput}
                                    onChange={(e) => handleAutoRoundsChange(e.target.value)}
                                    placeholder="50"
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                />
                                <label className="text-sm text-gray-700">速度</label>
                                <select
                                    value={autoSpeed}
                                    onChange={(e) => setAutoSpeed(Number(e.target.value))}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                    <option value={100}>极快 (0.1s)</option>
                                    <option value={300}>快 (0.3s)</option>
                                    <option value={500}>正常 (0.5s)</option>
                                    <option value={1000}>慢 (1s)</option>
                                    <option value={2000}>极慢 (2s)</option>
                                </select>
                            </div>
                            
                            {/* 开始按钮 */}
                            <div className="text-center">
                                <button
                                    onClick={startAutoSimulation}
                                    disabled={sequence.length === 0}
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded text-sm transition-colors disabled:bg-gray-300 font-medium"
                                >
                                    {currentAutoRound > 0 ? '继续自动' : '开始自动'}
                                </button>
                            </div>
                            {currentAutoRound > 0 && (
                                <div className="text-xs text-gray-600 mb-2">
                                    已完成 {currentAutoRound} / {autoRounds} 轮，点击继续完成剩余轮次
                                </div>
                            )}
                        </div>
                    )}

                    


                    {/* 使用说明 */}
                    <div className="mt-6 bg-gradient-to-r from-red-50 via-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-2">🎮 游戏说明</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <span className="text-red-600 font-medium">红蓝预测游戏结合1221消数法，用户先预测，系统后生成结果。</span>
                            <li>• <strong>🎯 预测流程</strong>: 先点击红色或蓝色按钮预测，然后系统生成结果对比</li>
                            <li>• <strong>🔮 系统结果</strong>: 系统随机生成大小结果(大=红色，小=蓝色)</li>
                            <li>• <strong>✅ 预测正确</strong>: 你的预测与系统结果一致，得分+下注金额，消除序列首尾数字</li>
                            <li>• <strong>❌ 预测错误</strong>: 你的预测与系统结果不一致，得分-下注金额，序列末尾添加数字</li>
                            <li>• <strong>💰 基码设置</strong>: 可设置基码(如20)，基础序列1-2-2-1变成20-40-40-20</li>
                            <li>• <strong>🔢 1221消数缆法</strong>: 初始序列1-2-2-1，下注金额=(首+尾)×基码</li>
                            <li>• <strong>🏆 游戏目标</strong>: 将所有数字消除完毕即获得胜利，实现6个基码的盈利</li>
                            <li>• <strong>📊 策略思考</strong>: 纯随机结果，重点体验1221消数法的注码管理</li>
                        </ul>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}