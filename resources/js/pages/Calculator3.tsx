import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';

type DiceResult = 'big' | 'small';
type BettingMethod = '1221' | 'ladder' | 'jiushi' | '1324';

interface BettingSystem {
    name: string;
    description: string;
    initialSequence: number[];
    targetWins?: number;
}

const bettingSystems: Record<BettingMethod, BettingSystem> = {
    '1221': {
        name: '1221投注法',
        description: '初始序列1-2-2-1，下注=首+尾，赢了消除首尾，输了添加到末尾',
        initialSequence: [1, 2, 2, 1]
    },
    'ladder': {
        name: '勝退輸進樓梯纜',
        description: '1,2,3,5,7,9,12,16,21,28十級，目標贏10注，赢了退一级，输了进一级',
        initialSequence: [1, 2, 3, 5, 7, 9, 12, 16, 21, 28],
        targetWins: 10
    },
    'jiushi': {
        name: '九式寶纜',
        description: '九级纜法，前三手中一手盈利，后面每级中两手回本，适用各种路型',
        initialSequence: [1, 2, 4] // 这里只显示第一级
    },
    '1324': {
        name: '1324缆法',
        description: '四级循环缆法，赢则前进，输则归零，第四级不论输赢都归零',
        initialSequence: [1, 3, 2, 4]
    }
};

// 九式寶纜的级别定义
const jiushiLevels = [
    { level: 0, bets: [1, 2, 4], name: '第一级' },
    { level: 1, bets: [6, 2, 4], name: '第二级' },
    { level: 2, bets: [11, 3, 6], name: '第三级' },
    { level: 3, bets: [19, 6, 12], name: '第四级' },
    { level: 4, bets: [33, 11, 22], name: '第五级' },
    { level: 5, bets: [57, 19, 38], name: '第六级' },
    { level: 6, bets: [100, 34, 66], name: '第七级' }
];

export default function Calculator3() {
    // 基础状态
    const [selectedMethod, setSelectedMethod] = useState<BettingMethod>('1221');
    const [sequence, setSequence] = useState<number[]>([]);
    const [currentLevel, setCurrentLevel] = useState(0); // 用于ladder方法
    const [totalPnL, setTotalPnL] = useState(0);
    const [currentBet, setCurrentBet] = useState(1);
    const [winCount, setWinCount] = useState(0); // 用于ladder方法计算目标
    
    // 九式寶纜专用状态
    const [jiushiLevel, setJiushiLevel] = useState(0); // 当前级别 (0-6)
    const [jiushiStep, setJiushiStep] = useState(0); // 当前级别内的步骤 (0-2)
    const [jiushiWinsInLevel, setJiushiWinsInLevel] = useState(0); // 当前级别的胜利次数
    const [isJiushiBusted, setIsJiushiBusted] = useState(false); // 九式寶纜是否爆缆
    
    // 1324缆法专用状态
    const [step1324, setStep1324] = useState(0); // 当前步骤 (0-3，对应1,3,2,4)
    const [gameHistory, setGameHistory] = useState<Array<{
        bet: number, 
        result: 'win' | 'lose', 
        pnl: number, 
        sequence: number[], 
        suggestion: DiceResult,
        level?: number,
        winCount?: number
    }>>([]);
    const [isGameComplete, setIsGameComplete] = useState(false);
    
    // 预测系统相关状态
    const [currentSuggestion, setCurrentSuggestion] = useState<DiceResult | null>(null);
    const [isWaitingForResult, setIsWaitingForResult] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [displayValue, setDisplayValue] = useState<DiceResult | null>(null);
    const [showMethodModal, setShowMethodModal] = useState(false);
    const [baseUnit, setBaseUnit] = useState(20); // 基码
    const [baseUnitInput, setBaseUnitInput] = useState('20'); // 基码输入框的值

    // 初始化序列
    useEffect(() => {
        const system = bettingSystems[selectedMethod];
        const multipliedSequence = system.initialSequence.map(num => num * baseUnit);
        setSequence([...multipliedSequence]);
        setCurrentLevel(0);
        setWinCount(0);
        
        // 九式寶纜初始化
        if (selectedMethod === 'jiushi') {
            setJiushiLevel(0);
            setJiushiStep(0);
            setJiushiWinsInLevel(0);
            setIsJiushiBusted(false);
            setCurrentBet(jiushiLevels[0].bets[0] * baseUnit);
        } else if (selectedMethod === '1324') {
            // 1324缆法初始化
            setStep1324(0);
            setCurrentBet(1 * baseUnit); // 第一步乘以基码
        } else {
            setCurrentBet(calculateCurrentBet(multipliedSequence, selectedMethod, 0));
        }
        
        setIsGameComplete(false);
    }, [selectedMethod, baseUnit]);

    // 计算当前下注金额
    const calculateCurrentBet = (seq: number[], method: BettingMethod, level: number): number => {
        if (method === '1221') {
            if (seq.length === 0) return 0;
            if (seq.length === 1) return seq[0];
            return seq[0] + seq[seq.length - 1];
        } else if (method === 'ladder') {
            return seq[level] || seq[seq.length - 1] || 1;
        } else if (method === 'jiushi') {
            const currentLevelData = jiushiLevels[jiushiLevel] || jiushiLevels[0];
            return (currentLevelData.bets[jiushiStep] || currentLevelData.bets[0]) * baseUnit;
        } else if (method === '1324') {
            const sequence1324 = [1, 3, 2, 4];
            return (sequence1324[step1324] || 1) * baseUnit;
        }
        return 1;
    };

    // 生成随机建议
    const generateSuggestion = (): DiceResult => {
        return Math.random() < 0.5 ? 'big' : 'small';
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
        if (isGameComplete) return;
        
        const newSuggestion = generateSuggestion();
        setCurrentSuggestion(newSuggestion);
        setIsWaitingForResult(true);
        
        // 开始动画
        startPredictionAnimation(newSuggestion);
    };

    // 生成初始建议（游戏开始时）
    if (!currentSuggestion && !isGameComplete && !isWaitingForResult && sequence.length > 0) {
        const initialSuggestion = generateSuggestion();
        setCurrentSuggestion(initialSuggestion);
        setIsWaitingForResult(true);
        
        // 开始动画
        startPredictionAnimation(initialSuggestion);
    }

    // 处理1221方法的输赢
    const handle1221 = (isWin: boolean, betAmount: number) => {
        if (isWin) {
            const newPnL = totalPnL + betAmount;
            let newSequence = [...sequence];
            
            // 移除首位和末位数字
            if (newSequence.length > 1) {
                newSequence = newSequence.slice(1, -1);
            } else if (newSequence.length === 1) {
                newSequence = [];
            }
            
            const newCurrentBet = calculateCurrentBet(newSequence, selectedMethod, currentLevel);
            const gameComplete = newSequence.length === 0;
            
            setTotalPnL(newPnL);
            setSequence(newSequence);
            setCurrentBet(newCurrentBet);
            setIsGameComplete(gameComplete);
            
            return { newPnL, newSequence, gameComplete };
        } else {
            const newPnL = totalPnL - betAmount;
            const newSequence = [...sequence, betAmount];
            const newCurrentBet = calculateCurrentBet(newSequence, selectedMethod, currentLevel);
            
            setTotalPnL(newPnL);
            setSequence(newSequence);
            setCurrentBet(newCurrentBet);
            
            return { newPnL, newSequence, gameComplete: false };
        }
    };

    // 处理ladder方法的输赢
    const handleLadder = (isWin: boolean, betAmount: number) => {
        if (isWin) {
            const newPnL = totalPnL + betAmount;
            const newWinCount = winCount + 1;
            const newLevel = Math.max(0, currentLevel - 1); // 赢了退一级
            const newCurrentBet = calculateCurrentBet(sequence, selectedMethod, newLevel);
            const gameComplete = newWinCount >= (bettingSystems.ladder.targetWins || 10);
            
            setTotalPnL(newPnL);
            setWinCount(newWinCount);
            setCurrentLevel(newLevel);
            setCurrentBet(newCurrentBet);
            setIsGameComplete(gameComplete);
            
            return { newPnL, newSequence: [...sequence], gameComplete, newLevel, newWinCount };
        } else {
            const newPnL = totalPnL - betAmount;
            const newLevel = Math.min(sequence.length - 1, currentLevel + 1); // 输了进一级
            const newCurrentBet = calculateCurrentBet(sequence, selectedMethod, newLevel);
            
            setTotalPnL(newPnL);
            setCurrentLevel(newLevel);
            setCurrentBet(newCurrentBet);
            
            return { newPnL, newSequence: [...sequence], gameComplete: false, newLevel, newWinCount: winCount };
        }
    };

    // 处理九式寶纜方法的输赢
    const handleJiushi = (isWin: boolean, betAmount: number) => {
        if (isWin) {
            const newPnL = totalPnL + betAmount;
            
            if (jiushiLevel === 0) {
                // 第一级：任何一胜都返回初始状态
                setJiushiLevel(0);
                setJiushiStep(0);
                setJiushiWinsInLevel(0);
                setCurrentBet(jiushiLevels[0].bets[0] * baseUnit);
                setTotalPnL(newPnL);
                
                return { newPnL, newSequence: [...sequence], gameComplete: false, newLevel: 0, newWinCount: 0 };
            } else {
                // 其他级别赢了
                if (jiushiStep === 0) {
                    // 第一个数字赢了，继续当前级别的第二个数字
                    setJiushiStep(1);
                    setJiushiWinsInLevel(1);
                    setCurrentBet(jiushiLevels[jiushiLevel].bets[1] * baseUnit);
                } else if (jiushiStep === 1) {
                    // 第二个数字赢了，直接返回初始状态
                    setJiushiLevel(0);
                    setJiushiStep(0);
                    setJiushiWinsInLevel(0);
                    setCurrentBet(jiushiLevels[0].bets[0] * baseUnit);
                } else if (jiushiStep === 2) {
                    // 第三个数字赢了，返回初始状态
                    setJiushiLevel(0);
                    setJiushiStep(0);
                    setJiushiWinsInLevel(0);
                    setCurrentBet(jiushiLevels[0].bets[0] * baseUnit);
                }
                
                setTotalPnL(newPnL);
                
                return { newPnL, newSequence: [...sequence], gameComplete: false, newLevel: jiushiLevel, newWinCount: jiushiWinsInLevel };
            }
        } else {
            const newPnL = totalPnL - betAmount;
            
            // 输了的处理逻辑
            if (jiushiLevel === 0) {
                // 第一级输了
                if (jiushiStep < 2) {
                    // 继续第一级的下一步
                    const newStep = jiushiStep + 1;
                    setJiushiStep(newStep);
                    setCurrentBet(jiushiLevels[0].bets[newStep] * baseUnit);
                } else {
                    // 第一级三步都输了，升级到第二级
                    setJiushiLevel(1);
                    setJiushiStep(0);
                    setJiushiWinsInLevel(0);
                    setCurrentBet(jiushiLevels[1].bets[0] * baseUnit);
                }
            } else {
                // 其他级别输了
                if (jiushiStep === 0) {
                    // 第一个数字输了
                    if (jiushiLevel === 6) {
                        // 第七级第一个数字100输了，爆缆
                        setIsJiushiBusted(true);
                        setIsGameComplete(true);
                    } else {
                        // 升级到下一级
                        const nextLevel = jiushiLevel + 1;
                        setJiushiLevel(nextLevel);
                        setJiushiStep(0);
                        setJiushiWinsInLevel(0);
                        setCurrentBet(jiushiLevels[nextLevel].bets[0] * baseUnit);
                    }
                } else if (jiushiStep === 1) {
                    // 第二个数字输了，继续第三个数字
                    setJiushiStep(2);
                    setCurrentBet(jiushiLevels[jiushiLevel].bets[2] * baseUnit);
                } else if (jiushiStep === 2) {
                    // 第三个数字输了，重新回到当前级别第一个数字
                    setJiushiStep(0);
                    setJiushiWinsInLevel(0);
                    setCurrentBet(jiushiLevels[jiushiLevel].bets[0] * baseUnit);
                }
            }
            
            setTotalPnL(newPnL);
            
            return { newPnL, newSequence: [...sequence], gameComplete: false, newLevel: jiushiLevel, newWinCount: jiushiWinsInLevel };
        }
    };

    // 处理1324缆法的输赢
    const handle1324 = (isWin: boolean, betAmount: number) => {
        const sequence1324 = [1, 3, 2, 4];
        const newPnL = isWin ? totalPnL + betAmount : totalPnL - betAmount;
        
        if (step1324 === 3) {
            // 第四步，不论输赢都回到原点
            setStep1324(0);
            setCurrentBet(sequence1324[0] * baseUnit); // 回到第一步：1 * baseUnit
        } else if (isWin) {
            // 赢了，前进到下一步
            const newStep = step1324 + 1;
            setStep1324(newStep);
            setCurrentBet(sequence1324[newStep] * baseUnit);
        } else {
            // 输了，回到原点
            setStep1324(0);
            setCurrentBet(sequence1324[0] * baseUnit); // 回到第一步：1 * baseUnit
        }
        
        setTotalPnL(newPnL);
        
        return { newPnL, newSequence: [...sequence], gameComplete: false, newLevel: step1324, newWinCount: 0 };
    };

    // 处理赢的情况
    const handleWin = () => {
        if (!isWaitingForResult || !currentSuggestion || isGameComplete || (selectedMethod === 'jiushi' && isJiushiBusted)) return;
        
        const betAmount = currentBet;
        let result;
        
        if (selectedMethod === '1221') {
            result = handle1221(true, betAmount);
        } else if (selectedMethod === 'ladder') {
            result = handleLadder(true, betAmount);
        } else if (selectedMethod === 'jiushi') {
            result = handleJiushi(true, betAmount);
        } else if (selectedMethod === '1324') {
            result = handle1324(true, betAmount);
        }
        
        // 记录历史
        setGameHistory(prev => [...prev, {
            bet: betAmount,
            result: 'win',
            pnl: result.newPnL,
            sequence: [...result.newSequence],
            suggestion: currentSuggestion,
            level: selectedMethod === 'ladder' ? result.newLevel : undefined,
            winCount: selectedMethod === 'ladder' ? result.newWinCount : undefined
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
        if (!isWaitingForResult || !currentSuggestion || isGameComplete || (selectedMethod === 'jiushi' && isJiushiBusted)) return;
        
        const betAmount = currentBet;
        let result;
        
        if (selectedMethod === '1221') {
            result = handle1221(false, betAmount);
        } else if (selectedMethod === 'ladder') {
            result = handleLadder(false, betAmount);
        } else if (selectedMethod === 'jiushi') {
            result = handleJiushi(false, betAmount);
        } else if (selectedMethod === '1324') {
            result = handle1324(false, betAmount);
        }
        
        // 记录历史
        setGameHistory(prev => [...prev, {
            bet: betAmount,
            result: 'lose',
            pnl: result.newPnL,
            sequence: [...result.newSequence],
            suggestion: currentSuggestion,
            level: selectedMethod === 'ladder' ? result.newLevel : undefined,
            winCount: selectedMethod === 'ladder' ? result.newWinCount : undefined
        }]);
        
        // 生成下一轮建议
        const nextSuggestion = generateSuggestion();
        setCurrentSuggestion(nextSuggestion);
        setIsWaitingForResult(true);
        
        // 开始动画
        startPredictionAnimation(nextSuggestion);
    };

    // 重置游戏
    const resetGame = () => {
        const system = bettingSystems[selectedMethod];
        const multipliedSequence = system.initialSequence.map(num => num * baseUnit);
        setSequence([...multipliedSequence]);
        setCurrentLevel(0);
        setTotalPnL(0);
        setWinCount(0);
        setGameHistory([]);
        setIsGameComplete(false);
        setCurrentSuggestion(null);
        setIsWaitingForResult(false);
        setIsAnimating(false);
        setDisplayValue(null);
        
        // 九式寶纜重置
        if (selectedMethod === 'jiushi') {
            setJiushiLevel(0);
            setJiushiStep(0);
            setJiushiWinsInLevel(0);
            setIsJiushiBusted(false);
            setCurrentBet(jiushiLevels[0].bets[0] * baseUnit);
        } else if (selectedMethod === '1324') {
            // 1324缆法重置
            setStep1324(0);
            setCurrentBet(1 * baseUnit);
        } else {
            setCurrentBet(calculateCurrentBet(multipliedSequence, selectedMethod, 0));
        }
    };

    return (
        <FrontendLayout>
            <Head title="多策略投注系统" />
            
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">🎯 多策略投注系统</h1>
                        <p className="text-sm text-gray-600 mt-2">
                            选择投注策略 | 系统给预测 | 手动输入结果
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
                        <div className="text-left mb-6">
                            <div className={`inline-block px-4 py-2 rounded-lg font-bold border-2 border-gray-300 text-gray-800 bg-transparent`}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-white transition-all duration-150 ${
                                        isAnimating 
                                            ? displayValue === 'big' ? 'bg-red-600 scale-110' : 'bg-blue-600 scale-110'
                                            : currentSuggestion === 'big' ? 'bg-red-600' : 'bg-blue-600'
                                    } ${isAnimating ? 'animate-pulse' : ''}`}>
                                        {isAnimating 
                                            ? displayValue === 'big' ? '大' : '小'
                                            : currentSuggestion === 'big' ? '大' : '小'
                                        }
                                    </div>
                                    <span>系统预测: {
                                        isAnimating 
                                            ? displayValue === 'big' ? '大' : '小'
                                            : currentSuggestion === 'big' ? '大' : '小'
                                    } {currentBet}</span>
                                </div>
                                <div className="text-xs mt-1">
                                    {isAnimating ? '系统运算中...' : '根据现场开奖结果，点击下方按钮输入结果'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 游戏完成提示 */}
                    {isGameComplete && (
                        <div className="text-center mb-6">
                            {selectedMethod === 'jiushi' && isJiushiBusted ? (
                                <div className="bg-red-50 rounded-lg p-6 shadow-sm border border-red-200">
                                    <div className="text-red-600 font-bold text-xl mb-2">💥 九式寶纜爆缆！</div>
                                    <div className="text-red-700">第七级第一个数字100输掉，请重新开始</div>
                                </div>
                            ) : (
                                <div className="bg-green-50 rounded-lg p-6 shadow-sm border border-green-200">
                                    <div className="text-green-600 font-bold text-xl mb-2">🎉 恭喜完成！</div>
                                    <div className="text-green-700">
                                        {selectedMethod === '1221' 
                                            ? '所有序列已消除，投注系统完成一轮' 
                                            : selectedMethod === 'ladder'
                                                ? `已达成${bettingSystems.ladder.targetWins}胜目标！`
                                                : '九式寶纜完成一轮盈利！'
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 当前状态显示 */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-left">
                                <button
                                    onClick={() => setShowMethodModal(true)}
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded transition-colors text-sm font-semibold"
                                >
                                    {bettingSystems[selectedMethod].name}
                                </button>
                                <div className="text-xs text-gray-500 mt-1">
                                    点击切换投注策略
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">基码</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={baseUnitInput}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setBaseUnitInput(value);
                                            
                                            // 立即应用有效的数字输入
                                            if (value === '') {
                                                setBaseUnit(20); // 空值默认为20
                                            } else {
                                                const numValue = parseInt(value);
                                                if (!isNaN(numValue) && numValue > 0) {
                                                    setBaseUnit(numValue);
                                                }
                                                // 无效输入不改变baseUnit，保持当前值
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const value = e.target.value;
                                            if (value === '') {
                                                setBaseUnitInput('20');
                                            } else {
                                                const numValue = parseInt(value);
                                                if (isNaN(numValue) || numValue <= 0) {
                                                    // 无效输入，恢复为当前有效值
                                                    setBaseUnitInput(baseUnit.toString());
                                                }
                                            }
                                        }}
                                        placeholder="20"
                                        className="w-12 px-1 py-0.5 border rounded text-xs text-center"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {selectedMethod === '1221' ? (
                            <div>
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
                        ) : selectedMethod === 'ladder' ? (
                            <div>
                                <div className="flex flex-wrap gap-2 justify-center mb-4">
                                    {sequence.map((num, index) => (
                                        <div
                                            key={index}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                                index === currentLevel
                                                    ? 'bg-red-500'
                                                    : index < currentLevel
                                                        ? 'bg-gray-300'
                                                        : 'bg-blue-400'
                                            }`}
                                        >
                                            {num}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-800">
                                        当前级别: 第{currentLevel + 1}级 | 下注: <span className="text-blue-600">{currentBet}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        已胜: {winCount}/{bettingSystems.ladder.targetWins}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        赢了退一级，输了进一级
                                    </div>
                                </div>
                            </div>
                        ) : selectedMethod === 'jiushi' ? (
                            <div>
                                {/* 显示所有级别 */}
                                <div className="mb-4">
                                    <div className="text-sm text-gray-600 mb-2">九式寶纜级别总览:</div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {jiushiLevels.map((levelData, index) => (
                                            <div key={index} className={`p-2 rounded border ${
                                                index === jiushiLevel 
                                                    ? 'border-red-500 bg-red-50' 
                                                    : index < jiushiLevel 
                                                        ? 'border-gray-300 bg-gray-100'
                                                        : 'border-gray-200 bg-white'
                                            }`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-gray-700">{levelData.name}:</span>
                                                    <div className="flex gap-1">
                                                        {levelData.bets.map((bet, betIndex) => (
                                                            <span key={betIndex} className={`px-2 py-1 rounded text-xs font-bold ${
                                                                index === jiushiLevel && betIndex === jiushiStep
                                                                    ? 'bg-red-500 text-white'
                                                                    : index === jiushiLevel
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-gray-200 text-gray-600'
                                                            }`}>
                                                                {bet * baseUnit}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-800">
                                        {jiushiLevels[jiushiLevel].name} | 下注: <span className="text-red-600">{currentBet}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        当前步骤: {jiushiStep + 1}/3 | 当前级别胜利: {jiushiWinsInLevel}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {jiushiLevel === 0 
                                            ? '第一级：任意一胜即可获利返回初始'
                                            : '其他级别：第一个数字输掉升级，第二、三个数字胜利返回初始'
                                        }
                                    </div>
                                </div>
                            </div>
                        ) : selectedMethod === '1324' ? (
                            <div>
                                {/* 显示1324序列 */}
                                <div className="mb-4">
                                    <div className="text-sm text-gray-600 mb-2">1324缆法序列:</div>
                                    <div className="flex justify-center gap-3">
                                        {[1, 3, 2, 4].map((num, index) => (
                                            <div key={index} className="flex flex-col items-center">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${
                                                    index === step1324
                                                        ? 'bg-green-500'
                                                        : index < step1324
                                                            ? 'bg-gray-300'
                                                            : 'bg-blue-400'
                                                }`}>
                                                    {num * baseUnit}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    第{index + 1}步
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-800">
                                        当前步骤: 第{step1324 + 1}步 | 下注: <span className="text-green-600">{currentBet}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-2">
                                        {step1324 === 3 
                                            ? '第四步：不论输赢都回到原点'
                                            : '赢了前进到下一步，输了回到原点'
                                        }
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        循环序列: 1 → 3 → 2 → 4 → 回到1
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        
                        {/* 结果输入按钮 - 放在当前状态div内底部 */}
                        {isWaitingForResult && !isGameComplete && !(selectedMethod === 'jiushi' && isJiushiBusted) && (
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={handleWin}
                                    disabled={isAnimating}
                                    className={`flex-1 font-bold py-2 px-3 rounded-lg text-sm shadow transition-all ${
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
                                    className={`flex-1 font-bold py-2 px-3 rounded-lg text-sm shadow transition-all ${
                                        isAnimating
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-500 text-white hover:bg-gray-600 hover:shadow-md active:scale-95'
                                    }`}
                                >
                                    错误
                                </button>
                            </div>
                        )}
                    </div>


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
                                                    {record.result === 'win' ? '正确' : '错误'}
                                                </span>
                                                <span className={`px-1 py-0.5 rounded text-xs ${
                                                    record.suggestion === 'big' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {record.suggestion === 'big' ? '大' : '小'}
                                                </span>
                                                <span className="text-xs">下注: {record.bet}</span>
                                                {selectedMethod === 'ladder' && record.level !== undefined && (
                                                    <span className="text-xs text-purple-600">L{record.level + 1}</span>
                                                )}
                                                {selectedMethod === 'ladder' && record.winCount !== undefined && (
                                                    <span className="text-xs text-green-600">{record.winCount}胜</span>
                                                )}
                                                {selectedMethod === 'jiushi' && record.level !== undefined && (
                                                    <span className="text-xs text-orange-600">级{record.level + 1}</span>
                                                )}
                                                {selectedMethod === 'jiushi' && record.winCount !== undefined && (
                                                    <span className="text-xs text-green-600">{record.winCount}胜</span>
                                                )}
                                                {selectedMethod === '1324' && record.level !== undefined && (
                                                    <span className="text-xs text-purple-600">步{record.level + 1}</span>
                                                )}
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
                        <h4 className="font-semibold text-blue-800 mb-2">投注策略说明</h4>
                        <div className="text-sm text-blue-700 space-y-2">
                            <div>
                                <strong>1221投注法:</strong>
                                <ul className="list-disc list-inside ml-4 text-xs">
                                    <li>下注金额 = 序列首位 + 末位</li>
                                    <li>预测正确: 移除首位和末位数字</li>
                                    <li>预测错误: 将下注金额添加到序列末尾</li>
                                    <li>目标: 消除所有数字完成盈利</li>
                                </ul>
                            </div>
                            <div>
                                <strong>勝退輸進樓梯纜:</strong>
                                <ul className="list-disc list-inside ml-4 text-xs">
                                    <li>十级固定序列: 1,2,3,5,7,9,12,16,21,28</li>
                                    <li>预测正确: 退一级（下注金额减少）</li>
                                    <li>预测错误: 进一级（下注金额增加）</li>
                                    <li>目标: 累计胜利10次完成盈利</li>
                                </ul>
                            </div>
                            <div>
                                <strong>九式寶纜:</strong>
                                <ul className="list-disc list-inside ml-4 text-xs">
                                    <li>七个级别: [1,2,4] [6,2,4] [11,3,6] [19,6,12] [33,11,22] [57,19,38] [100,34,66]</li>
                                    <li>第一级: 任意一胜即可获利并返回初始状态</li>
                                    <li>升级规则: 第一个数字输掉→升级到下一级第一个数字</li>
                                    <li>胜利规则: 第二、三个数字胜利→返回初始状态</li>
                                    <li>循环规则: 第三个数字输掉→回到当前级别第一个数字</li>
                                    <li>爆缆条件: 第七级第一个数字100输掉→游戏结束</li>
                                    <li>优势: 多个胜利机会，第二个数字就能获利返回初始</li>
                                </ul>
                            </div>
                            <div>
                                <strong>1324缆法:</strong>
                                <ul className="list-disc list-inside ml-4 text-xs">
                                    <li>四步循环序列: 1 → 3 → 2 → 4</li>
                                    <li>第一步: 下注1，赢了进入第二步，输了重新第一步</li>
                                    <li>第二步: 下注3，赢了进入第三步，输了重新第一步</li>
                                    <li>第三步: 下注2，赢了进入第四步，输了重新第一步</li>
                                    <li>第四步: 下注4，不论输赢都重新第一步</li>
                                    <li>优势: 风险控制好，输了就归零重新开始</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* 投注方法选择弹窗 */}
                    {showMethodModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">选择投注方法</h3>
                                    <button
                                        onClick={() => setShowMethodModal(false)}
                                        className="text-gray-500 hover:text-gray-700 text-xl"
                                    >
                                        ×
                                    </button>
                                </div>
                                
                                <div className="space-y-3">
                                    {Object.entries(bettingSystems).map(([key, system]) => (
                                        <div 
                                            key={key} 
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                selectedMethod === key 
                                                    ? 'border-purple-500 bg-purple-50' 
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                            onClick={() => {
                                                setSelectedMethod(key as BettingMethod);
                                                setShowMethodModal(false);
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-semibold text-gray-800">{system.name}</div>
                                                {selectedMethod === key && (
                                                    <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 mb-2">{system.description}</div>
                                            <div className="text-xs text-gray-500">
                                                序列: [{system.initialSequence.join(', ')}]
                                                {system.targetWins && ` | 目標: ${system.targetWins}勝`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => setShowMethodModal(false)}
                                        className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                                    >
                                        关闭
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </FrontendLayout>
    );
}