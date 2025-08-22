import { useState } from 'react';
import { Head } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';

type Result = 'P' | 'B';

interface RoadCell {
    result: Result;
    row: number;
    col: number;
}

export default function Calculator1() {
    const [results, setResults] = useState<Result[]>([]);
    const [roadMap, setRoadMap] = useState<RoadCell[]>([]);
    const [currentBetLevel, setCurrentBetLevel] = useState(0); // 当前投注级别
    const [totalPnL, setTotalPnL] = useState(0); // 总盈亏
    const [lastRecommendation, setLastRecommendation] = useState<string | null>(null); // 上一局的建议
    const [editingLevel, setEditingLevel] = useState<number | null>(null); // 正在编辑的级别
    const [showStrategyModal, setShowStrategyModal] = useState(false); // 策略弹窗显示状态
    const [strategyPatterns, setStrategyPatterns] = useState({
        betB: ['P', 'PP', 'B', 'BB', '*BP', '*BPP', '*PB', 'PBB', 'BBBB', 'BBBBB', '*PBBBB', '*PBBBBB', '*BBBBBB'],
        betP: [] as string[]
    }); // 投注策略模式

    // 打闲缆法的投注模式
    const [reverseStrategyPatterns, setReverseStrategyPatterns] = useState({
        betP: ['P', 'PP', 'B', 'BB', '*BP', '*BPP', '*PB', '*PBB', 'PPPP', 'PPPPP', '*BPPPP', '*BPPPPP', '*PPPPPP']
    });

    // 投注级别和注码 (主缆法)
    const originalLevels = [20, 40, 80, 60, 120, 240, 160, 320, 640, 400, 800, 1600];
    const [betLevels, setBetLevels] = useState([...originalLevels]);
    const [baseLevels, setBaseLevels] = useState([...originalLevels]); // 用于计算增减的基准值

    // 投注模式缆法 (打闲系统)
    const originalReverseLevels = [20, 40, 80, 60, 120, 240, 160, 320, 640, 400, 800, 1600];
    const [reverseBetLevels, setReverseBetLevels] = useState([...originalReverseLevels]);
    const [reverseBaseLevels, setReverseBaseLevels] = useState([...originalReverseLevels]);
    const [currentReverseBetLevel, setCurrentReverseBetLevel] = useState(0);
    const [reverseTotalPnL, setReverseTotalPnL] = useState(0);
    const [lastReverseRecommendation, setLastReverseRecommendation] = useState<string | null>(null); // 上一局打闲缆法的建议

    const addResult = (result: Result) => {
        // 计算抵消后的最终投注和盈亏（考虑5%庄家抽水）
        if ((lastRecommendation || lastReverseRecommendation) && results.length > 0) {
            const mainBetAmount = lastRecommendation ? getCurrentBetAmount(results) : 0;
            const reverseBetAmount = lastReverseRecommendation ? getCurrentReverseBetAmount(results) : 0;
            const mainBetSide = lastRecommendation;
            const reverseBetSide = lastReverseRecommendation;
            
            // 计算抵消后的净投注
            let netBetAmount = 0;
            let netBetSide: Result | null = null;
            
            if (mainBetAmount > 0 && reverseBetAmount > 0) {
                // 都是投注P
                if (mainBetSide === 'P' && reverseBetSide === 'P') {
                    netBetAmount = mainBetAmount + reverseBetAmount;
                    netBetSide = 'P';
                }
                // 都是投注B  
                else if (mainBetSide === 'B' && reverseBetSide === 'B') {
                    netBetAmount = mainBetAmount + reverseBetAmount;
                    netBetSide = 'B';
                }
                // 一个投注P，一个投注B，可以抵消
                else {
                    netBetAmount = Math.abs(mainBetAmount - reverseBetAmount);
                    if (netBetAmount > 0) {
                        netBetSide = mainBetAmount > reverseBetAmount ? mainBetSide as Result : (reverseBetSide as Result);
                    }
                }
            }
            // 只有一边投注
            else if (mainBetAmount > 0) {
                netBetAmount = mainBetAmount;
                netBetSide = mainBetSide as Result;
            }
            else if (reverseBetAmount > 0) {
                netBetAmount = reverseBetAmount;
                netBetSide = 'P'; // 打闲缆法只投注P
            }
            
            // 如果有净投注，计算盈亏（考虑庄家5%抽水）
            if (netBetAmount > 0 && netBetSide) {
                const won = result === netBetSide;
                let pnlChange = 0;
                
                if (won) {
                    // 赢了
                    if (netBetSide === 'B') {
                        // 庄赢抽水5%
                        pnlChange = netBetAmount * 0.95;
                    } else {
                        // 闲赢不抽水
                        pnlChange = netBetAmount;
                    }
                } else {
                    // 输了
                    pnlChange = -netBetAmount;
                }
                
                // 根据投注来源分配盈亏变化到对应系统
                if (mainBetAmount > 0 && reverseBetAmount > 0) {
                    // 两边都有投注，按比例分配盈亏
                    const mainRatio = mainBetAmount / (mainBetAmount + reverseBetAmount);
                    const reverseRatio = reverseBetAmount / (mainBetAmount + reverseBetAmount);
                    
                    setTotalPnL(prev => prev + pnlChange * mainRatio);
                    setReverseTotalPnL(prev => prev + pnlChange * reverseRatio);
                } else if (mainBetAmount > 0) {
                    // 只有主缆法投注
                    setTotalPnL(prev => prev + pnlChange);
                } else if (reverseBetAmount > 0) {
                    // 只有打闲缆法投注
                    setReverseTotalPnL(prev => prev + pnlChange);
                }
            }
        }

        // 更新投注级别（基于各自系统的投注建议，不考虑抵消）
        if (lastRecommendation && results.length > 0) {
            const won = result === lastRecommendation;
            
            // 倍数模式不改变级别，其他模式根据输赢调整级别
            if (!isMainMultiplierPattern(results)) {
                if (won) {
                    setCurrentBetLevel(0);
                } else {
                    if (currentBetLevel < betLevels.length - 1) {
                        setCurrentBetLevel(prev => prev + 1);
                    } else {
                        setCurrentBetLevel(0);
                    }
                }
            }
        }

        if (lastReverseRecommendation && results.length > 0) {
            const reverseWon = result === lastReverseRecommendation;
            
            // 倍数模式不改变级别，其他模式根据输赢调整级别
            if (!isReverseMultiplierPattern(results)) {
                if (reverseWon) {
                    setCurrentReverseBetLevel(0);
                } else {
                    if (currentReverseBetLevel < reverseBetLevels.length - 1) {
                        setCurrentReverseBetLevel(prev => prev + 1);
                    } else {
                        setCurrentReverseBetLevel(0);
                    }
                }
            }
        }

        const newResults = [...results, result];
        setResults(newResults);
        
        // Generate roadmap
        const newRoadMap = generateRoadMap(newResults);
        setRoadMap(newRoadMap);

        // 更新投注建议（用于下一局）
        const newRecommendation = getBettingRecommendation(newResults);
        setLastRecommendation(newRecommendation);

        // 更新打闲缆法建议（用于下一局）
        const newReverseRecommendation = getReverseRecommendation(newResults);
        setLastReverseRecommendation(newReverseRecommendation);
    };

    // 获取当前投注金额（考虑特殊倍数模式）
    const getCurrentBetAmount = (results: Result[]): number => {
        if (results.length === 0) return betLevels[currentBetLevel];
        
        const resultString = results.join('');
        const baseAmount = betLevels[currentBetLevel];
        
        // 检查特殊倍数模式
        if (resultString === 'BBBB' || /[BP]?PBBBB$/.test(resultString)) {
            return baseAmount * 10; // 10倍 (20*10=200)
        } else if (resultString === 'BBBBB' || /[BP]?PBBBBB$/.test(resultString)) {
            return baseAmount * 6; // 6倍 (20*6=120)
        } else if (/[BP]?BBBBBB$/.test(resultString)) {
            return baseAmount * 4; // 4倍 (20*4=80)
        }
        
        return baseAmount; // 正常倍数
    };

    // 获取当前打闲缆法投注金额（考虑特殊倍数模式）
    const getCurrentReverseBetAmount = (results: Result[]): number => {
        if (results.length === 0) return reverseBetLevels[currentReverseBetLevel];
        
        const resultString = results.join('');
        const baseAmount = reverseBetLevels[currentReverseBetLevel];
        
        // 检查特殊倍数模式
        if (resultString === 'PPPP' || /[BP]?BPPPP$/.test(resultString)) {
            return baseAmount * 10; // 10倍 (20*10=200)
        } else if (resultString === 'PPPPP' || /[BP]?BPPPPP$/.test(resultString)) {
            return baseAmount * 6; // 6倍 (20*6=120)
        } else if (/[BP]?PPPPPP$/.test(resultString)) {
            return baseAmount * 4; // 4倍 (20*4=80)
        }
        
        return baseAmount; // 正常倍数
    };

    // 检查是否为主缆法的倍数模式（不增加缆法级别）
    const isMainMultiplierPattern = (results: Result[]): boolean => {
        if (results.length === 0) return false;
        const resultString = results.join('');
        return resultString === 'BBBB' || 
               /[BP]?PBBBB$/.test(resultString) || 
               resultString === 'BBBBB' || 
               /[BP]?PBBBBB$/.test(resultString) || 
               /[BP]?BBBBBB$/.test(resultString);
    };

    // 检查是否为打闲缆法的倍数模式（不增加缆法级别）
    const isReverseMultiplierPattern = (results: Result[]): boolean => {
        if (results.length === 0) return false;
        const resultString = results.join('');
        return resultString === 'PPPP' || 
               /[BP]?BPPPP$/.test(resultString) || 
               resultString === 'PPPPP' || 
               /[BP]?BPPPPP$/.test(resultString) || 
               /[BP]?PPPPPP$/.test(resultString);
    };

    // 将模式字符串转换为正则表达式
    const patternToRegex = (pattern: string): { pattern: RegExp; strict: boolean } => {
        const strict = !pattern.includes('*');
        let regexString = pattern;
        
        // 替换*为可选的[BP]
        regexString = regexString.replace(/\*/g, '[BP]?');
        
        if (strict) {
            // 严格匹配：必须是完整字符串
            regexString = `^${regexString}$`;
        } else {
            // 灵活匹配：匹配结尾
            regexString = `${regexString}$`;
        }
        
        return {
            pattern: new RegExp(regexString),
            strict
        };
    };

    // 投注建议规则
    const getBettingRecommendation = (results: Result[]): string | null => {
        if (results.length === 0) return null;
        
        const resultString = results.join('');
        
        // 转换用户定义的模式为正则表达式
        const betBPatterns = strategyPatterns.betB.map(patternToRegex);
        const betPPatterns = strategyPatterns.betP.map(patternToRegex);
        
        // 检查是否匹配投注B的模式
        for (const { pattern, strict } of betBPatterns) {
            if (strict) {
                // 严格匹配：整个字符串必须完全匹配模式
                if (pattern.test(resultString)) {
                    return 'B';
                }
            } else {
                // 灵活匹配：模式匹配结尾即可
                if (pattern.test(resultString)) {
                    return 'B';
                }
            }
        }
        
        // 检查是否匹配投注P的模式
        for (const { pattern, strict } of betPPatterns) {
            if (strict) {
                if (pattern.test(resultString)) {
                    return 'P';
                }
            } else {
                if (pattern.test(resultString)) {
                    return 'P';
                }
            }
        }
        
        return null; // 没有匹配的模式
    };

    // 打闲缆法投注建议规则
    const getReverseRecommendation = (results: Result[]): string | null => {
        if (results.length === 0) return null;
        
        const resultString = results.join('');
        
        // 转换打闲缆法的模式为正则表达式
        const reverseBetPPatterns = reverseStrategyPatterns.betP.map(patternToRegex);
        
        // 检查是否匹配投注P的模式
        for (const { pattern, strict } of reverseBetPPatterns) {
            if (strict) {
                // 严格匹配：整个字符串必须完全匹配模式
                if (pattern.test(resultString)) {
                    return 'P';
                }
            } else {
                // 灵活匹配：模式匹配结尾即可
                if (pattern.test(resultString)) {
                    return 'P';
                }
            }
        }
        
        return null; // 没有匹配的模式
    };

    const currentRecommendation = getBettingRecommendation(results);
    const currentReverseRecommendation = getReverseRecommendation(results);

    const generateRoadMap = (results: Result[]): RoadCell[] => {
        const roadMap: RoadCell[] = [];
        let currentCol = 0;
        let currentRow = 0;
        let lastResult: Result | null = null;
        let streakStartCol = 0; // Track where the current streak started

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            
            if (lastResult === null || lastResult !== result) {
                // Different result - need to start a new column
                if (lastResult !== null) {
                    // New streak starts right after the start of the previous streak
                    currentCol = streakStartCol + 1;
                    currentRow = 0;
                    streakStartCol = currentCol; // Update streak start position
                }
            } else {
                // Same result - continue the streak
                
                // Helper function to check if a position is occupied
                const isPositionOccupied = (col: number, row: number) => {
                    return roadMap.some(cell => cell.col === col && cell.row === row);
                };
                
                // Try to continue vertically first
                const nextRow = currentRow + 1;
                
                if (nextRow < 6 && !isPositionOccupied(currentCol, nextRow)) {
                    // Can continue down in the same column
                    currentRow = nextRow;
                } else {
                    // Can't go down, need to go right and stay in the same row
                    currentCol++;
                    
                    // Stay in the same row when going horizontally
                    // If current row is occupied, find the first available row from bottom up
                    if (isPositionOccupied(currentCol, currentRow)) {
                        for (let testRow = 5; testRow >= 0; testRow--) {
                            if (!isPositionOccupied(currentCol, testRow)) {
                                currentRow = testRow;
                                break;
                            }
                        }
                    }
                    // If current row is not occupied, stay in the same row
                }
            }
            
            roadMap.push({
                result,
                row: currentRow,
                col: currentCol
            });
            
            lastResult = result;
        }
        
        return roadMap;
    };

    const clearResults = () => {
        setResults([]);
        setRoadMap([]);
        setCurrentBetLevel(0);
        setTotalPnL(0);
        setLastRecommendation(null);
        setCurrentReverseBetLevel(0);
        setReverseTotalPnL(0);
        setLastReverseRecommendation(null);
    };

    // 重置投注级别
    const resetBetLevels = () => {
        const newLevels = [20, 40, 80, 60, 120, 240, 160, 320, 640, 400, 800, 1600];
        setBetLevels([...newLevels]);
        setBaseLevels([...newLevels]);
    };

    // 重置反向投注级别
    const resetReverseBetLevels = () => {
        const newLevels = [20, 40, 80, 60, 120, 240, 160, 320, 640, 400, 800, 1600];
        setReverseBetLevels([...newLevels]);
        setReverseBaseLevels([...newLevels]);
    };

    // 处理投注级别编辑
    const handleLevelEdit = (index: number, value: string) => {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue > 0) {
            const newLevels = [...betLevels];
            const newBaseLevels = [...baseLevels];
            newLevels[index] = numValue;
            newBaseLevels[index] = numValue; // 更新基准值为用户编辑的值
            setBetLevels(newLevels);
            setBaseLevels(newBaseLevels);
        }
        setEditingLevel(null);
    };

    // 处理反向投注级别编辑
    const handleReverseLevelEdit = (index: number, value: string) => {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue > 0) {
            const newLevels = [...reverseBetLevels];
            const newBaseLevels = [...reverseBaseLevels];
            newLevels[index] = numValue;
            newBaseLevels[index] = numValue;
            setReverseBetLevels(newLevels);
            setReverseBaseLevels(newBaseLevels);
        }
        setEditingLevel(null);
    };

    // 处理点击投注级别
    const handleLevelClick = (index: number) => {
        setEditingLevel(index);
    };

    // 处理投注级别增减
    const adjustAllLevels = (increment: boolean) => {
        const newLevels = betLevels.map((level, index) => {
            const baseLevel = baseLevels[index]; // 使用基准值（可能是原始值或用户修改的值）
            if (increment) {
                return level + baseLevel; // 加一倍基准值
            } else {
                return Math.max(baseLevel, level - baseLevel); // 减一倍基准值，但不低于基准值
            }
        });
        setBetLevels(newLevels);
    };

    // 处理反向投注级别增减
    const adjustAllReverseLevels = (increment: boolean) => {
        const newLevels = reverseBetLevels.map((level, index) => {
            const baseLevel = reverseBaseLevels[index];
            if (increment) {
                return level + baseLevel;
            } else {
                return Math.max(baseLevel, level - baseLevel);
            }
        });
        setReverseBetLevels(newLevels);
    };

    // Create grid for display - always show rightmost 15 columns
    const maxRows = 6;
    const displayCols = 15;
    const totalCols = roadMap.length > 0 ? Math.max(...roadMap.map(cell => cell.col)) + 1 : 0;
    const startCol = Math.max(0, totalCols - 10); // Show rightmost 10 columns with data, plus 5 empty

    return (
        <FrontendLayout>
            <Head title="百家乐路单1" />
            
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">直播机助手v0.2</h1>
                        <p className="text-sm text-gray-600">双管齐下缆</p>
                        <button
                            onClick={() => setShowStrategyModal(true)}
                            className="mt-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
                        >
                            策略管理
                        </button>
                    </div>

                    {/* P&L and Betting Info */}
                    <div className="mb-4">
                        {/* Total P&L - Two Systems and Combined */}
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            <div className="text-center">
                                <div className="text-xs text-gray-600 mb-1">打庄缆法</div>
                                <span className={`text-sm font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {totalPnL >= 0 ? '+' : ''}{Math.floor(totalPnL)}
                                </span>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-600 mb-1">打闲缆法</div>
                                <span className={`text-sm font-bold ${reverseTotalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {reverseTotalPnL >= 0 ? '+' : ''}{Math.floor(reverseTotalPnL)}
                                </span>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-600 mb-1">总赢利</div>
                                <span className={`text-sm font-bold ${(totalPnL + reverseTotalPnL) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {(totalPnL + reverseTotalPnL) >= 0 ? '+' : ''}{Math.floor(totalPnL + reverseTotalPnL)}
                                </span>
                            </div>
                        </div>
                        
                        {/* Betting Recommendation and Reverse Betting */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="text-center">
                                {currentRecommendation ? (
                                    <div className={`inline-block px-2 py-1 rounded text-white font-bold text-xs ${
                                        currentRecommendation === 'P' ? 'bg-blue-500' : 'bg-red-500'
                                    }`}>
                                        {currentRecommendation === 'P' ? 'P' : 'B'} ({Math.floor(getCurrentBetAmount(results))})
                                    </div>
                                ) : (
                                    <div className="inline-block px-2 py-1 rounded bg-gray-400 text-white font-bold text-xs">
                                        不下注
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                {currentReverseRecommendation ? (
                                    <div className="inline-block px-2 py-1 rounded bg-blue-500 text-white font-bold text-xs">
                                        P ({Math.floor(getCurrentReverseBetAmount(results))})
                                    </div>
                                ) : (
                                    <div className="inline-block px-2 py-1 rounded bg-gray-400 text-white font-bold text-xs">
                                        不下注
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Net Betting After Offsetting */}
                        <div className="text-center mb-2">
                            {(() => {
                                const mainBetAmount = currentRecommendation ? Math.floor(getCurrentBetAmount(results)) : 0;
                                const reverseBetAmount = currentReverseRecommendation ? Math.floor(getCurrentReverseBetAmount(results)) : 0;
                                const mainBetSide = currentRecommendation;
                                const reverseBetSide = currentReverseRecommendation;
                                
                                // 如果两边都有投注，计算抵消后的净投注
                                if (mainBetAmount > 0 && reverseBetAmount > 0) {
                                    // 都是投注P
                                    if (mainBetSide === 'P' && reverseBetSide === 'P') {
                                        const totalP = mainBetAmount + reverseBetAmount;
                                        return (
                                            <div className="inline-block px-3 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm">
                                                打: P 闲 ({totalP})
                                            </div>
                                        );
                                    }
                                    // 都是投注B  
                                    else if (mainBetSide === 'B' && reverseBetSide === 'B') {
                                        const totalB = mainBetAmount + reverseBetAmount;
                                        return (
                                            <div className="inline-block px-3 py-2 rounded-lg bg-red-600 text-white font-bold text-sm">
                                                打: B 庄 ({totalB}) 赢95%
                                            </div>
                                        );
                                    }
                                    // 一个投注P，一个投注B，可以抵消
                                    else {
                                        const netAmount = Math.abs(mainBetAmount - reverseBetAmount);
                                        if (netAmount === 0) {
                                            return (
                                                <div className="inline-block px-3 py-2 rounded-lg bg-gray-600 text-white font-bold text-sm">
                                                    这局不打
                                                </div>
                                            );
                                        } else {
                                            const netSide = mainBetAmount > reverseBetAmount ? mainBetSide : (reverseBetSide === 'P' ? 'P' : 'B');
                                            return (
                                                <div className={`inline-block px-3 py-2 rounded-lg text-white font-bold text-sm ${
                                                    netSide === 'P' ? 'bg-blue-600' : 'bg-red-600'
                                                }`}>
                                                    打: {netSide === 'P' ? 'P 闲' : 'B 庄'} ({netAmount}){netSide === 'B' ? ' 赢95%' : ''}
                                                </div>
                                            );
                                        }
                                    }
                                }
                                // 只有一边投注
                                else if (mainBetAmount > 0) {
                                    return (
                                        <div className={`inline-block px-3 py-2 rounded-lg text-white font-bold text-sm ${
                                            mainBetSide === 'P' ? 'bg-blue-600' : 'bg-red-600'
                                        }`}>
                                            总计: {mainBetSide === 'P' ? 'P 闲' : 'B 庄'} ({mainBetAmount}){mainBetSide === 'B' ? ' 赢95%' : ''}
                                        </div>
                                    );
                                }
                                else if (reverseBetAmount > 0) {
                                    return (
                                        <div className="inline-block px-3 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm">
                                            总计: P 闲 ({reverseBetAmount})
                                        </div>
                                    );
                                }
                                // 两边都没有投注
                                return (
                                    <div className="inline-block px-3 py-2 rounded-lg bg-gray-600 text-white font-bold text-sm">
                                        此局不打
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Main Betting Levels Display */}
                    <div className="mb-4 bg-white rounded-lg p-3 shadow-sm border">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold text-red-600">打庄缆法（点击可编辑）</h4>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => adjustAllLevels(true)}
                                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                >
                                    +1倍
                                </button>
                                <button
                                    onClick={() => adjustAllLevels(false)}
                                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                >
                                    -1倍
                                </button>
                                <button
                                    onClick={resetBetLevels}
                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                                >
                                    重置
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-6 gap-1 text-xs">
                            {betLevels.map((level, index) => (
                                <div
                                    key={index}
                                    className={`text-center py-1 px-1 rounded cursor-pointer ${
                                        index === currentBetLevel
                                            ? currentRecommendation
                                                ? 'bg-yellow-400 text-black font-bold'
                                                : 'bg-gray-300 text-gray-600 font-bold'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    onClick={() => handleLevelClick(index)}
                                >
                                    {editingLevel === index ? (
                                        <input
                                            type="number"
                                            defaultValue={level}
                                            className="w-full text-center bg-transparent border-none outline-none text-xs"
                                            autoFocus
                                            onBlur={(e) => handleLevelEdit(index, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleLevelEdit(index, (e.target as HTMLInputElement).value);
                                                } else if (e.key === 'Escape') {
                                                    setEditingLevel(null);
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        level
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reverse Betting Levels Display */}
                    <div className="mb-4 bg-white rounded-lg p-3 shadow-sm border">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold text-blue-600">打闲缆法（点击可编辑）</h4>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => adjustAllReverseLevels(true)}
                                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                >
                                    +1倍
                                </button>
                                <button
                                    onClick={() => adjustAllReverseLevels(false)}
                                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                >
                                    -1倍
                                </button>
                                <button
                                    onClick={resetReverseBetLevels}
                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                                >
                                    重置
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-6 gap-1 text-xs">
                            {reverseBetLevels.map((level, index) => (
                                <div
                                    key={index}
                                    className={`text-center py-1 px-1 rounded cursor-pointer ${
                                        index === currentReverseBetLevel
                                            ? currentReverseRecommendation
                                                ? 'bg-blue-400 text-white font-bold'
                                                : 'bg-gray-300 text-gray-600 font-bold'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    onClick={() => handleLevelClick(index)}
                                >
                                    {editingLevel === index ? (
                                        <input
                                            type="number"
                                            defaultValue={level}
                                            className="w-full text-center bg-transparent border-none outline-none text-xs"
                                            autoFocus
                                            onBlur={(e) => handleReverseLevelEdit(index, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleReverseLevelEdit(index, (e.target as HTMLInputElement).value);
                                                } else if (e.key === 'Escape') {
                                                    setEditingLevel(null);
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        level
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => addResult('P')}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
                        >
                            P
                        </button>
                        <button
                            onClick={() => addResult('B')}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
                        >
                            B
                        </button>
                    </div>

                    {/* Clear Button */}
                    <div className="text-center mb-6">
                        <button
                            onClick={clearResults}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm transition-colors"
                        >
                            清空路单
                        </button>
                    </div>

                    {/* Road Map Grid */}
                    <div className="bg-white rounded-lg p-2 shadow-sm border w-full">
                        <h3 className="text-lg font-semibold mb-2 text-center">大路</h3>
                        <div className="w-full overflow-hidden">
                            <div 
                                className="grid gap-1 mx-auto"
                                style={{ 
                                    gridTemplateColumns: `repeat(${displayCols}, 1fr)`,
                                    gridTemplateRows: `repeat(${maxRows}, minmax(24px, 1fr))`,
                                    width: '98%',
                                    aspectRatio: `${displayCols} / ${maxRows}`
                                }}
                            >
                            {Array.from({ length: maxRows * displayCols }).map((_, index) => {
                                const row = Math.floor(index / displayCols);
                                const displayCol = index % displayCols;
                                const actualCol = startCol + displayCol;
                                
                                const cell = roadMap.find(c => c.row === row && c.col === actualCol);
                                
                                return (
                                    <div
                                        key={index}
                                        className={`aspect-square border border-gray-200 rounded-sm flex items-center justify-center text-xs font-bold ${
                                            cell 
                                                ? cell.result === 'P' 
                                                    ? 'bg-blue-500 text-white' 
                                                    : 'bg-red-500 text-white'
                                                : 'bg-gray-50'
                                        }`}
                                    >
                                        {cell ? cell.result : ''}
                                    </div>
                                );
                            })}
                            </div>
                        </div>
                    </div>

                    {/* Current Sequence */}
                    {results.length > 0 && (
                        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border">
                            <h3 className="text-lg font-semibold mb-2">当前序列</h3>
                            <div className="mb-4">
                                <div className="font-mono text-lg tracking-wider overflow-x-auto whitespace-nowrap p-2 border rounded bg-gray-50">
                                    {results.join('')}
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>总局数: {results.length}</span>
                                <span>庄: {results.filter(r => r === 'B').length}</span>
                                <span>闲: {results.filter(r => r === 'P').length}</span>
                            </div>
                        </div>
                    )}

                    {/* Strategy Management Modal */}
                    {showStrategyModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">策略管理</h2>
                                    <button
                                        onClick={() => setShowStrategyModal(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Bet B Patterns */}
                                    <div>
                                        <h3 className="font-semibold mb-2 text-red-600">打庄缆法 - 投注B庄的模式</h3>
                                        <div className="space-y-2">
                                            {strategyPatterns.betB.map((pattern, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={pattern}
                                                        onChange={(e) => {
                                                            const newPatterns = { ...strategyPatterns };
                                                            newPatterns.betB[index] = e.target.value.toUpperCase();
                                                            setStrategyPatterns(newPatterns);
                                                        }}
                                                        className="flex-1 px-3 py-1 border rounded text-sm"
                                                        placeholder="如: PP, *BP, PBB"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newPatterns = { ...strategyPatterns };
                                                            newPatterns.betB.splice(index, 1);
                                                            setStrategyPatterns(newPatterns);
                                                        }}
                                                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newPatterns = { ...strategyPatterns };
                                                    newPatterns.betB.push('');
                                                    setStrategyPatterns(newPatterns);
                                                }}
                                                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                            >
                                                + 添加模式
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bet P Patterns */}
                                    <div>
                                        <h3 className="font-semibold mb-2 text-blue-600">打庄缆法 - 投注P闲的模式</h3>
                                        <div className="space-y-2">
                                            {strategyPatterns.betP.map((pattern, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={pattern}
                                                        onChange={(e) => {
                                                            const newPatterns = { ...strategyPatterns };
                                                            newPatterns.betP[index] = e.target.value.toUpperCase();
                                                            setStrategyPatterns(newPatterns);
                                                        }}
                                                        className="flex-1 px-3 py-1 border rounded text-sm"
                                                        placeholder="如: BB, *PB, BPP"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newPatterns = { ...strategyPatterns };
                                                            newPatterns.betP.splice(index, 1);
                                                            setStrategyPatterns(newPatterns);
                                                        }}
                                                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newPatterns = { ...strategyPatterns };
                                                    newPatterns.betP.push('');
                                                    setStrategyPatterns(newPatterns);
                                                }}
                                                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                            >
                                                + 添加模式
                                            </button>
                                        </div>
                                    </div>

                                    {/* Reverse Bet P Patterns */}
                                    <div>
                                        <h3 className="font-semibold mb-2 text-blue-600">打闲缆法 - 投注P闲的模式</h3>
                                        <div className="space-y-2">
                                            {reverseStrategyPatterns.betP.map((pattern, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={pattern}
                                                        onChange={(e) => {
                                                            const newPatterns = { ...reverseStrategyPatterns };
                                                            newPatterns.betP[index] = e.target.value.toUpperCase();
                                                            setReverseStrategyPatterns(newPatterns);
                                                        }}
                                                        className="flex-1 px-3 py-2 border rounded text-sm"
                                                        placeholder="如: PP, *BP, PBB"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newPatterns = { ...reverseStrategyPatterns };
                                                            newPatterns.betP.splice(index, 1);
                                                            setReverseStrategyPatterns(newPatterns);
                                                        }}
                                                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newPatterns = { ...reverseStrategyPatterns };
                                                    newPatterns.betP.push('');
                                                    setReverseStrategyPatterns(newPatterns);
                                                }}
                                                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                            >
                                                + 添加模式
                                            </button>
                                        </div>
                                    </div>

                                    {/* Help Text */}
                                    <div className="bg-gray-100 p-3 rounded text-sm">
                                        <h4 className="font-semibold mb-2">使用说明：</h4>
                                        <ul className="space-y-1 text-xs">
                                            <li>• 使用 P 和 B 表示闲和庄</li>
                                            <li>• 使用 * 表示任意结果（P或B或空）</li>
                                            <li>• 没有*的模式为严格匹配（如PP必须完全是PP）</li>
                                            <li>• 有*的模式为灵活匹配（如*BP匹配结尾为BP）</li>
                                            <li>• 示例: PBB, *BP, BB, *PBP</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <button
                                        onClick={() => {
                                            setStrategyPatterns({
                                                betB: ['P', 'PP', 'B', 'BB', '*BP', '*BPP', '*PB', 'PBB', 'BBBB', 'BBBBB', '*PBBBB', '*PBBBBB', '*BBBBBB'],
                                                betP: []
                                            });
                                            setReverseStrategyPatterns({
                                                betP: ['P', 'PP', 'B', 'BB', '*BP', '*BPP', '*PB', '*PBB', 'PPPP', 'PPPPP', '*BPPPP', '*BPPPPP', '*PPPPPP']
                                            });
                                            // Also reset bet levels to new defaults
                                            setBetLevels([20, 40, 80, 60, 120, 240, 160, 320, 640, 400, 800, 1600]);
                                            setBaseLevels([20, 40, 80, 60, 120, 240, 160, 320, 640, 400, 800, 1600]);
                                            setReverseBetLevels([20, 40, 80, 60, 120, 240, 160, 320, 640, 400, 800, 1600]);
                                            setReverseBaseLevels([20, 40, 80, 60, 120, 240, 160, 320, 640, 400, 800, 1600]);
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    >
                                        重置默认
                                    </button>
                                    <button
                                        onClick={() => setShowStrategyModal(false)}
                                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        确定
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