import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';

type DiceResult = 'big' | 'small';

export default function Calculator2() {
    const [sequence, setSequence] = useState([1, 2, 2, 1]);
    const [totalPnL, setTotalPnL] = useState(0);
    const [currentBet, setCurrentBet] = useState(1);
    const [gameHistory, setGameHistory] = useState<Array<{bet: number, result: 'win' | 'lose', pnl: number, sequence: number[], suggestion: DiceResult}>>([]);
    const [isGameComplete, setIsGameComplete] = useState(false);
    
    // 预测系统相关状态
    const [currentSuggestion, setCurrentSuggestion] = useState<DiceResult | null>(null);
    const [isWaitingForResult, setIsWaitingForResult] = useState(false);
    
    // 计算当前下注金额
    const calculateCurrentBet = (seq: number[]) => {
        if (seq.length === 0) return 0;
        if (seq.length === 1) return seq[0];
        return seq[0] + seq[seq.length - 1];
    };

    // 生成随机建议
    const generateSuggestion = (): DiceResult => {
        return Math.random() < 0.5 ? 'big' : 'small';
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

    // 处理输的情况
    const handleLose = () => {
        if (!isWaitingForResult || !currentSuggestion || isGameComplete) return;
        
        const betAmount = currentBet;
        const newPnL = totalPnL - betAmount;
        const newSequence = [...sequence, betAmount];
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
    };

    // 处理赢的情况
    const handleWin = () => {
        if (!isWaitingForResult || !currentSuggestion || isGameComplete) return;
        
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
    };

    // 重置游戏
    const resetGame = () => {
        setSequence([1, 2, 2, 1]);
        setTotalPnL(0);
        setCurrentBet(1);
        setGameHistory([]);
        setIsGameComplete(false);
        setCurrentSuggestion(null);
        setIsWaitingForResult(false);
    };

    // 初始化当前下注
    if (currentBet === 0 && sequence.length > 0) {
        setCurrentBet(calculateCurrentBet(sequence));
    }

    return (
        <FrontendLayout>
            <Head title="猜大小 - 1221投注系统" />
            
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">🎯 猜大小辅助工具</h1>
                        <p className="text-sm text-gray-600 mt-2">
                            1221投注系统 | 系统给预测 | 手动输入结果
                        </p>
                    </div>

                    {/* 总盈亏显示 */}
                    <div className="text-center mb-6">
                        <div className={`text-2xl font-bold ${
                            totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            总盈亏: {totalPnL >= 0 ? '+' : ''}{totalPnL}
                        </div>
                    </div>

                    {/* 系统预测显示 */}
                    {currentSuggestion && isWaitingForResult && (
                        <div className="text-center mb-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm border">
                                <h3 className="text-lg font-semibold mb-4">系统预测</h3>
                                <div className={`inline-block px-8 py-4 rounded-lg text-white font-bold text-2xl ${
                                    currentSuggestion === 'big' ? 'bg-red-500' : 'bg-blue-500'
                                }`}>
                                    {currentSuggestion === 'big' ? '大' : '小'}
                                </div>
                                <div className="text-lg font-semibold text-gray-800 mt-4">
                                    建议投注: <span className="text-blue-600">{currentBet}</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-2">
                                    根据现场开奖结果，点击下方按钮输入结果
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

                    {/* 当前序列显示 */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
                        <h3 className="text-lg font-semibold mb-3">1221投注序列</h3>
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                            {sequence.map((num, index) => (
                                <div
                                    key={index}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                        (index === 0 || index === sequence.length - 1) && sequence.length > 1
                                            ? 'bg-blue-500'
                                            : 'bg-gray-400'
                                    }`}
                                >
                                    {num}
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
                                <div className="text-lg font-semibold text-gray-800">
                                    下次下注: <span className="text-blue-600">{currentBet}</span>
                                </div>
                                {sequence.length > 1 ? (
                                    <div className="text-sm text-gray-600 mt-1">
                                        ({sequence[0]} + {sequence[sequence.length - 1]} = {currentBet})
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-600 mt-1">
                                        (最后一个数字)
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 结果输入按钮 */}
                    {isWaitingForResult && !isGameComplete && (
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={handleWin}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
                            >
                                正确 (+{currentBet})
                            </button>
                            <button
                                onClick={handleLose}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
                            >
                                错误 (-{currentBet})
                            </button>
                        </div>
                    )}

                    {/* 控制按钮 */}
                    <div className="text-center mb-6">
                        {!isWaitingForResult && !isGameComplete && (
                            <button
                                onClick={startNewRound}
                                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors mr-4"
                            >
                                开始新一局
                            </button>
                        )}
                        <button
                            onClick={resetGame}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            重置游戏
                        </button>
                    </div>

                    {/* 游戏历史 */}
                    {gameHistory.length > 0 && (
                        <div className="bg-white rounded-lg p-4 shadow-sm border">
                            <h3 className="text-lg font-semibold mb-3">游戏记录</h3>
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
                                                    {record.result === 'win' ? '预测正确' : '预测错误'}
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
                            <li>• <strong>辅助工具</strong>: 系统随机生成大小预测建议</li>
                            <li>• <strong>手动输入</strong>: 根据现场开奖结果点击"预测正确"或"预测错误"</li>
                            <li>• <strong>1221投注系统</strong>: 初始序列1-2-2-1，下注金额=首+尾</li>
                            <li>• <strong>预测错误</strong>: 将下注金额添加到序列末尾</li>
                            <li>• <strong>预测正确</strong>: 移除序列的首位和末位数字</li>
                            <li>• <strong>目标</strong>: 将所有数字消除完毕即完成盈利</li>
                        </ul>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}