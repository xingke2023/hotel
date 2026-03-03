import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';

type DiceResult = 'big' | 'small';

interface LadderLevel {
    level: number;
    bets: [number, number, number];
    total: number;
    name: string;
}

const ladderLevels: LadderLevel[] = [
    { level: 0, bets: [200, 100, 100], total: 400, name: '第1层' },
    { level: 1, bets: [300, 100, 100], total: 500, name: '第2层' },
    { level: 2, bets: [300, 200, 200], total: 700, name: '第3层' },
    { level: 3, bets: [500, 200, 200], total: 900, name: '第4层' },
    { level: 4, bets: [600, 300, 300], total: 1200, name: '第5层' },
    { level: 5, bets: [800, 400, 400], total: 1600, name: '第6层' },
    { level: 6, bets: [1000, 500, 500], total: 2000, name: '第7层' },
    { level: 7, bets: [1300, 700, 700], total: 2700, name: '第8层' }
];

export default function Calculator4() {
    // 基础状态
    const [currentLevel, setCurrentLevel] = useState(0); // 当前层级 (0-7)
    const [currentStep, setCurrentStep] = useState(0); // 当前步骤 (0-2，对应第1/2/3个数字)
    const [totalPnL, setTotalPnL] = useState(0);
    const [currentBet, setCurrentBet] = useState(200);
    const [currentLevelLoss, setCurrentLevelLoss] = useState(0); // 当前层级累计损失
    const [currentLevelPnL, setCurrentLevelPnL] = useState(0); // 当前层级累计盈亏
    const [firstNumberWon, setFirstNumberWon] = useState(false); // 第一个数字是否赢了
    
    // 游戏状态
    const [gameHistory, setGameHistory] = useState<Array<{
        bet: number, 
        result: 'win' | 'lose', 
        pnl: number, 
        level: number,
        step: number,
        suggestion: DiceResult,
        levelLoss: number,
        levelPnL: number
    }>>([]);
    const [isGameComplete, setIsGameComplete] = useState(false);
    const [isBusted, setIsBusted] = useState(false);
    
    // 预测系统相关状态
    const [currentSuggestion, setCurrentSuggestion] = useState<DiceResult | null>(null);
    const [isWaitingForResult, setIsWaitingForResult] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [displayValue, setDisplayValue] = useState<DiceResult | null>(null);

    // 初始化
    useEffect(() => {
        setCurrentBet(ladderLevels[0].bets[0]);
    }, []);

    // 生成随机建议 - 红(大)50.66%, 蓝(小)49.34%
    const generateSuggestion = (): DiceResult => {
        return Math.random() < 0.5066 ? 'big' : 'small';
    };

    // 动画效果函数
    const startPredictionAnimation = (finalSuggestion: DiceResult) => {
        setIsAnimating(true);
        setDisplayValue('big');
        
        // 每100ms切换大小
        let switchCount = 0;
        const maxSwitches = 10; // 1秒内切换10次
        
        const switchInterval = setInterval(() => {
            switchCount++;
            setDisplayValue(prev => prev === 'big' ? 'small' : 'big');
            
            if (switchCount >= maxSwitches) {
                clearInterval(switchInterval);
                setDisplayValue(finalSuggestion);
                setIsAnimating(false);
            }
        }, 100);
    };

    // 开始新一局
    const startNewRound = () => {
        if (isGameComplete || isBusted) return;
        
        const newSuggestion = generateSuggestion();
        setCurrentSuggestion(newSuggestion);
        setIsWaitingForResult(true);
        
        // 开始动画
        startPredictionAnimation(newSuggestion);
    };

    // 生成初始建议
    if (!currentSuggestion && !isGameComplete && !isWaitingForResult && !isBusted) {
        const initialSuggestion = generateSuggestion();
        setCurrentSuggestion(initialSuggestion);
        setIsWaitingForResult(true);
        
        // 开始动画
        startPredictionAnimation(initialSuggestion);
    }

    // 处理楼梯分层平注的输赢逻辑
    const handleLadderResult = (isWin: boolean, betAmount: number) => {
        const newPnL = isWin ? totalPnL + betAmount : totalPnL - betAmount;
        let newLevel = currentLevel;
        let newStep = currentStep;
        let newCurrentBet = currentBet;
        let newLevelLoss = currentLevelLoss;
        let newLevelPnL = isWin ? currentLevelPnL + betAmount : currentLevelPnL - betAmount;
        let gameComplete = false;
        let busted = false;

        if (isWin) {
            // 赢了的处理逻辑
            if (currentStep === 0) {
                // 第一个数字赢了：下第二个数字，并标记第一个数字赢了
                newStep = 1;
                newCurrentBet = ladderLevels[currentLevel].bets[1];
                setFirstNumberWon(true);
            } else if (currentStep === 1) {
                // 第二个数字赢了
                if (firstNumberWon) {
                    // 如果第一个数字也赢了，直接退回上一层
                    newLevel = Math.max(0, currentLevel - 1);
                    newStep = 0;
                    newCurrentBet = ladderLevels[newLevel].bets[0];
                    newLevelLoss = 0; // 重置当前层级损失
                    newLevelPnL = 0; // 重置当前层级盈亏
                    setFirstNumberWon(false); // 重置第一个数字标记
                } else {
                    // 第一个数字输了，检查本层累计盈亏是否≥0
                    if (newLevelPnL >= 0) {
                        // 本层累计盈亏≥0，返回第一个数字，本层盈利和损失都归零
                        newStep = 0;
                        newCurrentBet = ladderLevels[currentLevel].bets[0];
                        newLevelLoss = 0; // 本层损失归零
                        newLevelPnL = 0; // 本层盈利归零
                        setFirstNumberWon(false); // 重置第一个数字标记
                    } else {
                        // 本层累计盈亏<0，继续第二个数字
                        newStep = 1;
                        newCurrentBet = ladderLevels[currentLevel].bets[1];
                    }
                }
            } else {
                // 第三个数字赢了：退回上一层（第1层保持第1层）
                newLevel = Math.max(0, currentLevel - 1);
                newStep = 0;
                newCurrentBet = ladderLevels[newLevel].bets[0];
                newLevelLoss = 0; // 重置当前层级损失
                newLevelPnL = 0; // 重置当前层级盈亏
                setFirstNumberWon(false); // 重置第一个数字标记
            }
        } else {
            // 输了的处理逻辑
            newLevelLoss = currentLevelLoss + betAmount;
            
            if (currentStep === 0) {
                // 第一个数字输了：持续下第二个数字
                newStep = 1;
                newCurrentBet = ladderLevels[currentLevel].bets[1];
                setFirstNumberWon(false); // 标记第一个数字输了
                
                // 检查本层累计损失是否超过总计金额
                if (newLevelLoss >= ladderLevels[currentLevel].total) {
                    if (currentLevel >= 7) {
                        // 已经是第8层，爆缆
                        busted = true;
                        gameComplete = true;
                    } else {
                        // 进入下一层
                        newLevel = currentLevel + 1;
                        newStep = 0;
                        newCurrentBet = ladderLevels[newLevel].bets[0];
                        newLevelLoss = 0; // 重置新层级损失
                        newLevelPnL = 0; // 重置新层级盈亏
                        setFirstNumberWon(false); // 重置第一个数字标记
                    }
                }
            } else if (currentStep === 1) {
                // 第二个数字输了
                if (firstNumberWon) {
                    // 如果第一个数字赢了，第二个数字输了：返回第一个数字，本层盈利和损失都归零
                    newStep = 0;
                    newCurrentBet = ladderLevels[currentLevel].bets[0];
                    newLevelLoss = 0; // 本层损失归零
                    newLevelPnL = 0; // 本层盈利归零
                    setFirstNumberWon(false); // 重置第一个数字标记
                } else {
                    // 如果第一个数字输了，检查本层累计损失是否超过总计金额
                    if (newLevelLoss >= ladderLevels[currentLevel].total) {
                        if (currentLevel >= 7) {
                            // 已经是第8层，爆缆
                            busted = true;
                            gameComplete = true;
                        } else {
                            // 进入下一层
                            newLevel = currentLevel + 1;
                            newStep = 0;
                            newCurrentBet = ladderLevels[newLevel].bets[0];
                            newLevelLoss = 0; // 重置新层级损失
                            newLevelPnL = 0; // 重置新层级盈亏
                            setFirstNumberWon(false); // 重置第一个数字标记
                        }
                    } else {
                        // 继续第二个数字  
                        newStep = 1;
                        newCurrentBet = ladderLevels[currentLevel].bets[1];
                    }
                }
            } else {
                // 第三个数字输了：重新下第一个数字
                newStep = 0;
                newCurrentBet = ladderLevels[currentLevel].bets[0];
                setFirstNumberWon(false); // 重置第一个数字标记
                
                // 检查本层累计损失是否超过总计金额
                if (newLevelLoss >= ladderLevels[currentLevel].total) {
                    if (currentLevel >= 7) {
                        // 已经是第8层，爆缆
                        busted = true;
                        gameComplete = true;
                    } else {
                        // 进入下一层
                        newLevel = currentLevel + 1;
                        newStep = 0;
                        newCurrentBet = ladderLevels[newLevel].bets[0];
                        newLevelLoss = 0; // 重置新层级损失
                        newLevelPnL = 0; // 重置新层级盈亏
                        setFirstNumberWon(false); // 重置第一个数字标记
                    }
                }
            }
        }

        // 更新状态
        setTotalPnL(newPnL);
        setCurrentLevel(newLevel);
        setCurrentStep(newStep);
        setCurrentBet(newCurrentBet);
        setCurrentLevelLoss(newLevelLoss);
        setCurrentLevelPnL(newLevelPnL);
        setIsGameComplete(gameComplete);
        setIsBusted(busted);

        return { 
            newPnL, 
            newLevel, 
            newStep, 
            newCurrentBet,
            newLevelLoss,
            newLevelPnL,
            gameComplete, 
            busted 
        };
    };

    // 处理赢的情况
    const handleWin = () => {
        if (!isWaitingForResult || !currentSuggestion || isGameComplete || isBusted) return;
        
        const betAmount = currentBet;
        const result = handleLadderResult(true, betAmount);
        
        // 记录历史
        setGameHistory(prev => [...prev, {
            bet: betAmount,
            result: 'win',
            pnl: result.newPnL,
            level: currentLevel,
            step: currentStep,
            suggestion: currentSuggestion,
            levelLoss: result.newLevelLoss,
            levelPnL: result.newLevelPnL
        }]);
        
        // 如果游戏未完成，生成下一轮建议
        if (!result.gameComplete) {
            const nextSuggestion = generateSuggestion();
            setCurrentSuggestion(nextSuggestion);
            setIsWaitingForResult(true);
            
            // 开始动画
            startPredictionAnimation(nextSuggestion);
        } else {
            setIsWaitingForResult(false);
        }
    };

    // 处理输的情况
    const handleLose = () => {
        if (!isWaitingForResult || !currentSuggestion || isGameComplete || isBusted) return;
        
        const betAmount = currentBet;
        const result = handleLadderResult(false, betAmount);
        
        // 记录历史
        setGameHistory(prev => [...prev, {
            bet: betAmount,
            result: 'lose',
            pnl: result.newPnL,
            level: currentLevel,
            step: currentStep,
            suggestion: currentSuggestion,
            levelLoss: result.newLevelLoss,
            levelPnL: result.newLevelPnL
        }]);
        
        // 如果游戏未完成，生成下一轮建议
        if (!result.gameComplete) {
            const nextSuggestion = generateSuggestion();
            setCurrentSuggestion(nextSuggestion);
            setIsWaitingForResult(true);
            
            // 开始动画
            startPredictionAnimation(nextSuggestion);
        } else {
            setIsWaitingForResult(false);
        }
    };

    // 重置游戏
    const resetGame = () => {
        setCurrentLevel(0);
        setCurrentStep(0);
        setTotalPnL(0);
        setCurrentBet(200);
        setCurrentLevelLoss(0);
        setCurrentLevelPnL(0);
        setFirstNumberWon(false);
        setGameHistory([]);
        setIsGameComplete(false);
        setIsBusted(false);
        setCurrentSuggestion(null);
        setIsWaitingForResult(false);
        setIsAnimating(false);
        setDisplayValue(null);
    };

    return (
        <FrontendLayout>
            <Head title="楼梯分层平注系统" />
            
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">🏢 楼梯分层平注</h1>
                        <p className="text-sm text-gray-600 mt-2">
                            8层楼梯投注 | 系统给预测 | 手动输入结果
                        </p>
                    </div>

                    {/* 总盈亏显示 */}
                    <div className="text-center mb-6">
                        <div className={` font-bold ${
                            totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            战绩: {totalPnL >= 0 ? '+' : ''}{totalPnL}
                        </div>
                    </div>

                    {/* 系统预测显示 */}
                    {currentSuggestion && isWaitingForResult && !isGameComplete && !isBusted && (
                        <div className="mb-6">
                            <div className={`px-4 py-2 rounded-lg font-bold border-2 border-gray-300 text-gray-800 bg-white shadow-sm`}>
                                <div className="flex items-center gap-2">
                                    <span>系统预测,仅供参考 </span>
                                    <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-white transition-all duration-150 ${
                                        isAnimating
                                            ? displayValue === 'big' ? 'bg-red-600 scale-110' : 'bg-blue-600 scale-110'
                                            : currentSuggestion === 'big' ? 'bg-red-600' : 'bg-blue-600'
                                    } ${isAnimating ? 'animate-pulse' : ''}`}>
                                    </div>
                                    {currentBet}

                                </div>
                                <div className="text-xs mt-1">
                                    {isAnimating ? '系统运算中...' : '根据现场开奖结果，点击下方按钮输入结果'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 游戏结束提示 */}
                    {(isGameComplete || isBusted) && (
                        <div className="text-center mb-6">
                            {isBusted ? (
                                <div className="bg-red-50 rounded-lg p-6 shadow-sm border border-red-200">
                                    <div className="text-red-600 font-bold text-xl mb-2">💥 楼梯分层平注爆缆！</div>
                                    <div className="text-red-700">第8层累计损失达到上限，请重新开始</div>
                                </div>
                            ) : (
                                <div className="bg-green-50 rounded-lg p-6 shadow-sm border border-green-200">
                                    <div className="text-green-600 font-bold text-xl mb-2">🎉 恭喜完成！</div>
                                    <div className="text-green-700">楼梯分层平注完成一轮盈利！</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 当前状态显示 */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
                        
                        
                        {/* 结果输入按钮 - 放在标题下面 */}
                        {currentSuggestion && isWaitingForResult && !isGameComplete && !isBusted && (
                            <div className="mb-4">
                                <div className="flex gap-2 mb-2">
                                    <button
                                        onClick={handleWin}
                                        disabled={isAnimating}
                                        className={`flex-1 font-bold py-2 px-3 rounded-lg text-sm shadow transition-all ${
                                            isAnimating
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md active:scale-95'
                                        }`}
                                    >
                                        胜利
                                    </button>
                                    <button
                                        onClick={handleLose}
                                        disabled={isAnimating}
                                        className={`flex-1 font-bold py-2 px-3 rounded-lg text-sm shadow transition-all ${
                                            isAnimating
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-500 text-white hover:bg-gray-600 hover:shadow-md active:scale-95'
                                        }`}
                                    >
                                        失败
                                    </button>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-gray-700">
                                        {ladderLevels[currentLevel].name} | 第{currentStep + 1}个数字 | 下注: <span className="text-blue-600">{currentBet}</span>
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        当前层损失: {currentLevelLoss} / {ladderLevels[currentLevel].total} | 当前层盈亏: {currentLevelPnL >= 0 ? '+' : ''}{currentLevelPnL}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* 显示所有层级 */}
                        <div className="mb-4">
                            <div className="text-sm text-gray-600 mb-2">8层楼梯总览:</div>
                            <div className="grid grid-cols-1 gap-2">
                                {ladderLevels.map((levelData, index) => (
                                    <div key={index} className={`p-3 rounded border ${
                                        index === currentLevel 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : index < currentLevel 
                                                ? 'border-gray-300 bg-gray-100'
                                                : 'border-gray-200 bg-white'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-700">{levelData.name}:</span>
                                            <div className="flex gap-1">
                                                {levelData.bets.map((bet, betIndex) => (
                                                    <span key={betIndex} className={`px-2 py-1 rounded text-xs font-bold ${
                                                        index === currentLevel && betIndex === currentStep
                                                            ? 'bg-blue-500 text-white'
                                                            : index === currentLevel
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                        {bet}
                                                    </span>
                                                ))}
                                                <span className="text-xs text-gray-500 ml-2">
                                                    (总计{levelData.total})
                                                </span>
                                            </div>
                                        </div>
                                        {index === currentLevel && (
                                            <div className="text-xs text-blue-600 mt-1">
                                                当前层损失: {currentLevelLoss} / {levelData.total} | 当前层盈亏: {currentLevelPnL >= 0 ? '+' : ''}{currentLevelPnL}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* 当没有预测按钮时显示当前状态 */}
                        {(!currentSuggestion || !isWaitingForResult || isGameComplete || isBusted) && (
                            <div className="text-center mb-4">
                                <div className="text-sm font-semibold text-gray-700">
                                    {ladderLevels[currentLevel].name} | 第{currentStep + 1}个数字 | 下注: <span className="text-blue-600">{currentBet}</span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    当前层累计损失: {currentLevelLoss} / {ladderLevels[currentLevel].total} | 当前层盈亏: {currentLevelPnL >= 0 ? '+' : ''}{currentLevelPnL}
                                </div>
                            </div>
                        )}
                        
                        <div className="text-center">
                            <div className="text-xs text-gray-500 mt-1">
                                {currentStep === 0 
                                    ? '第一个数字：输了→下第二个数字，赢了→下第二个数字'
                                    : currentStep === 1
                                        ? firstNumberWon 
                                            ? '第二个数字：第一个数字已赢，赢了退层，输了返回第一个数字+盈亏都归零'
                                            : '第二个数字：持续下注直到累计盈亏≥0(返回第一个数字+盈亏都归零)或累计损失≥总额(升级)'
                                        : '第三个数字：输了→重新第一个数字，赢了→退回上一层'
                                }
                            </div>
                        </div>
                    </div>


                    {/* 控制按钮 */}
                    <div className="text-center mb-6">
                        {!isWaitingForResult && !isGameComplete && !isBusted && (
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
                                                    {record.result === 'win' ? '正确' : '错误'}
                                                </span>
                                                <span className={`px-1 py-0.5 rounded text-xs ${
                                                    record.suggestion === 'big' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {record.suggestion === 'big' ? '大' : '小'}
                                                </span>
                                                <span className="text-xs">下注: {record.bet}</span>
                                                <span className="text-xs text-purple-600">第{record.level + 1}层</span>
                                                <span className="text-xs text-orange-600">数字{record.step + 1}</span>
                                                <span className="text-xs text-gray-500">损失: {record.levelLoss}</span>
                                                <span className={`text-xs ${record.levelPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>层盈亏: {record.levelPnL >= 0 ? '+' : ''}{record.levelPnL}</span>
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
                        <h4 className="font-semibold text-blue-800 mb-2">楼梯分层平注说明</h4>
                        <div className="text-sm text-blue-700 space-y-2">
                            <div>
                                <strong>8层结构:</strong>
                                <ul className="list-disc list-inside ml-4 text-xs">
                                    <li>第1层: [200, 100, 100] 总计400</li>
                                    <li>第2层: [300, 100, 100] 总计500</li>
                                    <li>第3层: [300, 200, 200] 总计700</li>
                                    <li>第4层: [500, 200, 200] 总计900</li>
                                    <li>第5层: [600, 300, 300] 总计1200</li>
                                    <li>第6层: [800, 400, 400] 总计1600</li>
                                    <li>第7层: [1000, 500, 500] 总计2000</li>
                                    <li>第8层: [1300, 700, 700] 总计2700</li>
                                </ul>
                            </div>
                            <div>
                                <strong>游戏规则:</strong>
                                <ul className="list-disc list-inside ml-4 text-xs">
                                    <li>第一个数字输了: 下第二个数字</li>
                                    <li>第一个数字赢了: 下第二个数字</li>
                                    <li>第二个数字阶段: 根据第一个数字结果决定</li>
                                    <li>- 如果第一个数字赢了，第二个数字也赢了: 直接退回上一层</li>
                                    <li>- 如果第一个数字赢了，第二个数字输了: 返回第一个数字，本层盈利和损失都归零</li>
                                    <li>- 如果第一个数字输了，第二个数字输了: 继续第二个数字</li>
                                    <li>- 如果第一个数字输了，第二个数字赢了: 检查累计盈亏≥0则返回第一个数字+盈利损失都归零，否则继续第二个数字</li>
                                    <li>- 本层累计损失≥该层总金额: 升级到下一层</li>
                                    <li>第三个数字输了: 重新下第一个数字</li>
                                    <li>第三个数字赢了: 退回上一层（第1层保持第1层）</li>
                                    <li>第8层损失达到上限: 爆缆游戏结束</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}