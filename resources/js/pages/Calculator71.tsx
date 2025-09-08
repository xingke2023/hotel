import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';

type Result = 'P' | 'B';

interface RoadCell {
    result: Result;
    row: number;
    col: number;
}

export default function Calculator7() {
    const [results, setResults] = useState<Result[]>([]);
    const [winLossResults, setWinLossResults] = useState<boolean[]>([]); // true = 赢, false = 输
    const [roadMap, setRoadMap] = useState<RoadCell[]>([]);
    const winLossScrollRef = useRef<HTMLDivElement>(null);
    const [currentBetLevel, setCurrentBetLevel] = useState(0);
    const [totalPnL, setTotalPnL] = useState(0);
    const [lastRecommendation, setLastRecommendation] = useState<string | null>(null);
    const [currentRandomRecommendation, setCurrentRandomRecommendation] = useState<string | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [coinSide, setCoinSide] = useState('B');
    const [editingLevel, setEditingLevel] = useState<number | null>(null);
    const [showStrategyModal, setShowStrategyModal] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState<number | null>(null);
    const [editingValues, setEditingValues] = useState<{pattern: string, bet: 'B' | 'P'}>({pattern: '', bet: 'B'});
    const [newStrategy, setNewStrategy] = useState({ pattern: '', bet: 'B' as 'B' | 'P' });
    const [showAddStrategy, setShowAddStrategy] = useState(false);
    const [strategyMode, setStrategyMode] = useState<'custom' | 'random'>('random');
    const [isHidden, setIsHidden] = useState(false);
    const [randomButtonColors, setRandomButtonColors] = useState({
        p: 'bg-blue-500 hover:bg-blue-600',
        b: 'bg-red-500 hover:bg-red-600',
        recommendation: 'bg-gray-500',
        text: 'text-gray-800',
        rolling: 'bg-gray-500'
    });
    const [showInstructions, setShowInstructions] = useState(false);
    const [showCableModal, setShowCableModal] = useState(false);
    const [clickedButton, setClickedButton] = useState<'P' | 'B' | null>(null);
    
    // 双套注码专用状态
    const [isOnDouble, setIsOnDouble] = useState(false); // 第一套注码是否在下孖宝
    const [currentSet, setCurrentSet] = useState<'first' | 'second'>('first'); // 当前使用哪套注码
    const [secondSetLevel, setSecondSetLevel] = useState(0); // 第二套注码的当前级别
    const [isBusted, setIsBusted] = useState(false); // 是否爆缆

    // 自动投注相关状态
    const [isAutoMode, setIsAutoMode] = useState(false);
    const [autoRounds, setAutoRounds] = useState(500);
    const [autoRoundsInput, setAutoRoundsInput] = useState('500');
    const [currentAutoRound, setCurrentAutoRound] = useState(0);
    const [autoSpeed, setAutoSpeed] = useState(1000); // 每局间隔ms
    const [isAutoPaused, setIsAutoPaused] = useState(false);
    const autoModeRef = useRef(false);
    const autoPausedRef = useRef(false);

    // 第一套注码：孖宝缆法 - 18个位置，前12个是实际注码
    const firstSetLevels = [20, 20, 20, 20, 30, 40, 50, 70, 90, 120, 160, 220, 0, 0, 0, 0, 0, 0];
    const [betLevels, setBetLevels] = useState([...firstSetLevels]);
    const [baseLevels, setBaseLevels] = useState([...firstSetLevels]);
    
    // 第二套注码：胜进缆法 - 18个位置，前15个是实际注码
    const secondSetLevels = [40, 20, 40, 40, 80, 80, 160, 160, 320, 320, 640, 640, 1280, 1280, 2560, 0, 0, 0];
    const [secondBetLevels, setSecondBetLevels] = useState([...secondSetLevels]);
    const [secondBaseLevels, setSecondBaseLevels] = useState([...secondSetLevels]);

    // 策略管理
    const [strategies, setStrategies] = useState([
        { pattern: '[BP]?BP$', description: '*BP 打B', bet: 'B' as 'B' | 'P', strict: false }
    ]);

    // 自动滚动到输赢路最新数据
    useEffect(() => {
        if (winLossScrollRef.current && winLossResults.length > 0) {
            winLossScrollRef.current.scrollLeft = winLossScrollRef.current.scrollWidth;
        }
    }, [winLossResults]);

    // 复位功能
    const resetBettingSystem = () => {
        setCurrentBetLevel(0);  // 第一套注码复位到第一个数字
        setSecondSetLevel(0);   // 第二套注码复位到第一个数字
        setTotalPnL(0);         // 总盈亏归零
        setIsOnDouble(false);   // 重置孖宝状态
        setCurrentSet('first'); // 返回第一套注码
        setIsBusted(false);     // 重置爆缆状态
        // 停止自动投注
        setIsAutoMode(false);
        setIsAutoPaused(false);
        autoModeRef.current = false;
        autoPausedRef.current = false;
        setCurrentAutoRound(0);
        // 保持当前序列不变，不清空results和roadmap
        
        // 触发建议运算动画
        triggerRecommendationAnimation();
    };


    // 自动投注的核心逻辑
    const startAutoMode = async () => {
        if (autoModeRef.current || isBusted) return;
        
        setIsAutoMode(true);
        setIsAutoPaused(false);
        autoModeRef.current = true;
        autoPausedRef.current = false;
        
        // 如果是首次开始，重置轮数计数
        if (currentAutoRound === 0) {
            // 开始自动投注前确保有建议
            if (!currentRecommendation) {
                triggerRecommendationAnimation();
                // 等待建议生成完成
                await new Promise(resolve => setTimeout(resolve, 1600));
            }
        }

        let roundCount = currentAutoRound;
        
        while (roundCount < autoRounds && autoModeRef.current && !isBusted) {
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
            
            // 随机选择P或B，各50%概率
            const randomChoice: Result = Math.random() < 0.5 ? 'P' : 'B';
            
            // 模拟点击按钮
            setClickedButton(randomChoice);
            
            // 等待点击动效
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // 清除点击动效并使用手动投注的完整逻辑（包含动画和状态更新）
            setClickedButton(null);
            addResult(randomChoice); // 使用原有的手动投注逻辑，保证状态正确更新
            
            roundCount++;
            setCurrentAutoRound(roundCount);
            
            // 等待手动投注的完整周期（1.5秒动画 + 用户设置速度）
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, 1500 + autoSpeed);
            });
            
            // 检查是否爆缆，如果爆缆则停止
            if (isBusted) break;
        }
        
        // 如果完成了所有轮次或爆缆，重置状态
        if (roundCount >= autoRounds || isBusted) {
            setIsAutoMode(false);
            setIsAutoPaused(false);
            autoModeRef.current = false;
            autoPausedRef.current = false;
        }
    };

    // 暂停自动投注
    const pauseAutoMode = () => {
        setIsAutoPaused(true);
        autoPausedRef.current = true;
    };

    // 继续自动投注
    const resumeAutoMode = () => {
        setIsAutoPaused(false);
        autoPausedRef.current = false;
    };

    // 停止自动投注
    const stopAutoMode = () => {
        setIsAutoMode(false);
        setIsAutoPaused(false);
        autoModeRef.current = false;
        autoPausedRef.current = false;
        setCurrentAutoRound(0); // 完全停止时重置轮数
    };

    // 更新自动轮数
    const handleAutoRoundsChange = (inputValue: string) => {
        setAutoRoundsInput(inputValue);
        const newRounds = inputValue === '' ? 500 : Number(inputValue);
        if (newRounds > 0) {
            setAutoRounds(newRounds);
        }
    };

    // 处理按钮点击动效
    const handleButtonClick = (result: Result) => {
        if (isBusted) return;
        
        // 设置点击动效
        setClickedButton(result);
        
        // 300ms后清除动效并执行实际功能
        setTimeout(() => {
            setClickedButton(null);
            addResult(result);
        }, 150);
    };

    // 生成随机按钮颜色（以灰色为主）
    const generateRandomButtonColors = () => {
        const grayColors = [
            'bg-gray-400 hover:bg-gray-500',
            'bg-gray-500 hover:bg-gray-600',
            'bg-gray-600 hover:bg-gray-700',
            'bg-slate-400 hover:bg-slate-500',
            'bg-slate-500 hover:bg-slate-600',
            'bg-zinc-400 hover:bg-zinc-500',
            'bg-zinc-500 hover:bg-zinc-600',
            'bg-stone-400 hover:bg-stone-500',
            'bg-neutral-400 hover:bg-neutral-500',
            'bg-neutral-500 hover:bg-neutral-600'
        ];
        
        const textColors = [
            'text-gray-600', 'text-gray-700', 'text-gray-800',
            'text-slate-600', 'text-slate-700', 'text-slate-800',
            'text-zinc-600', 'text-zinc-700', 'text-zinc-800',
            'text-stone-600', 'text-stone-700', 'text-stone-800'
        ];
        
        const randomPColor = grayColors[Math.floor(Math.random() * grayColors.length)];
        const randomBColor = grayColors[Math.floor(Math.random() * grayColors.length)];
        const randomRecommendationColor = grayColors[Math.floor(Math.random() * grayColors.length)].split(' ')[0]; // 只取背景色，不要hover效果
        const randomTextColor = textColors[Math.floor(Math.random() * textColors.length)];
        const randomRollingColor = grayColors[Math.floor(Math.random() * grayColors.length)].split(' ')[0];
        
        setRandomButtonColors({ 
            p: randomPColor,
            b: randomBColor,
            recommendation: randomRecommendationColor,
            text: randomTextColor,
            rolling: randomRollingColor
        });
    };

    const addResult = (result: Result) => {
        // 如果已经爆缆，不处理投注
        if (isBusted) return;
        
        // 开始硬币翻转动画
        setIsRolling(true);
        
        // 硬币翻转效果：每100ms切换一次B/P
        const flipInterval = setInterval(() => {
            setCoinSide(prev => prev === 'B' ? 'P' : 'B');
        }, 100);
        
        // 双套注码逻辑
        if (lastRecommendation) {
            let currentStake = 0;
            
            if (currentSet === 'first') {
                // 第一套注码：第一个数字无孖宝，其他数字有孖宝
                if (currentBetLevel === 0) {
                    // 第一个数字不需要孖宝
                    currentStake = betLevels[currentBetLevel];
                } else {
                    // 从第二个数字开始有孖宝模式
                    currentStake = isOnDouble ? betLevels[currentBetLevel] * 2 : betLevels[currentBetLevel];
                }
            } else {
                // 第二套注码：胜进缆法
                currentStake = secondBetLevels[secondSetLevel];
            }
            
            const won = result === lastRecommendation;
            
            // 记录输赢结果（只有当有投注建议时才记录）
            const newWinLossResults = [...winLossResults, won];
            setWinLossResults(newWinLossResults);
            
            if (won) {
                // 赢了
                const profit = lastRecommendation === 'B' ? currentStake * 0.95 : currentStake;
                setTotalPnL(prev => prev + profit);
                
                if (currentSet === 'first') {
                    if (currentBetLevel === 0) {
                        // 第一个数字赢了，进入第二套注码
                        setCurrentSet('second');
                        setSecondSetLevel(0);
                        setIsOnDouble(false);
                    } else {
                        // 从第二个数字开始的逻辑
                        if (isOnDouble) {
                            // 孖宝赢了，返回第一条缆第一个数字
                            setCurrentBetLevel(0);
                            setIsOnDouble(false);
                        } else {
                            // 第一次赢了，下注孖宝
                            setIsOnDouble(true);
                        }
                    }
                } else {
                    // 第二套注码赢了，进入下一个数字
                    const nextSecondLevel = secondSetLevel + 1;
                    if (nextSecondLevel < secondBetLevels.length && secondBetLevels[nextSecondLevel] > 0) {
                        setSecondSetLevel(nextSecondLevel);
                    }
                }
            } else {
                // 输了
                setTotalPnL(prev => prev - currentStake);
                
                if (currentSet === 'first') {
                    if (currentBetLevel === 0) {
                        // 第一个数字输了，进入第二个数字
                        setCurrentBetLevel(1);
                        setIsOnDouble(false);
                    } else {
                        // 从第二个数字开始的输了逻辑
                        if (isOnDouble) {
                            // 孖宝输了，进入下一个数字
                            setIsOnDouble(false);
                            const nextLevel = currentBetLevel + 1;
                            if (nextLevel < betLevels.length && betLevels[nextLevel] > 0) {
                                setCurrentBetLevel(nextLevel);
                            } else {
                                // 已经是最后一个数字的孖宝输了，爆缆
                                setIsBusted(true);
                                // 清除推荐
                                setLastRecommendation(null);
                                setCurrentRandomRecommendation(null);
                            }
                        } else {
                            // 第一次输了，进入下一个数字
                            const nextLevel = currentBetLevel + 1;
                            if (nextLevel < betLevels.length && betLevels[nextLevel] > 0) {
                                setCurrentBetLevel(nextLevel);
                            } else {
                                // 已经是最后一个数字输了，爆缆
                                setIsBusted(true);
                                // 清除推荐
                                setLastRecommendation(null);
                                setCurrentRandomRecommendation(null);
                            }
                        }
                    }
                } else {
                    // 第二套注码输了
                    if (secondSetLevel === 0) {
                        // 第二套第一个数字输了，返回第一套注码的第二个数字
                        setCurrentSet('first');
                        setCurrentBetLevel(1);
                        setSecondSetLevel(0);
                        setIsOnDouble(false);
                    } else {
                        // 第二套其他数字输了，返回第一套注码的第一个数字
                        setCurrentSet('first');
                        setCurrentBetLevel(0);
                        setSecondSetLevel(0);
                        setIsOnDouble(false);
                    }
                }
            }
        }

        const newResults = [...results, result];
        setResults(newResults);
        
        // Generate roadmap
        const newRoadMap = generateRoadMap(newResults);
        setRoadMap(newRoadMap);

        // 1.5秒后停止动画并更新投注建议
        setTimeout(() => {
            clearInterval(flipInterval);
            setIsRolling(false);
            
            // 延迟检查爆缆状态，因为状态更新可能需要时间
            setTimeout(() => {
                // 如果没有爆缆，更新投注建议（用于下一局）
                if (!isBusted) {
                    if (strategyMode === 'random') {
                        const newRandomRecommendation = getRandomRecommendation();
                        setCurrentRandomRecommendation(newRandomRecommendation);
                        setLastRecommendation(newRandomRecommendation);
                    } else {
                        const newRecommendation = getBettingRecommendation(newResults);
                        setLastRecommendation(newRecommendation);
                    }
                }
            }, 100);
        }, 1500);
    };

    // 投注建议规则
    const getBettingRecommendation = (results: Result[]): string | null => {
        if (results.length === 0) return null;
        
        const resultString = results.join('');
        
        // 检查是否匹配策略
        for (const strategy of strategies) {
            try {
                const pattern = new RegExp(strategy.pattern);
                if (strategy.strict) {
                    // 严格匹配：整个字符串必须完全匹配模式
                    if (pattern.test(resultString) && resultString.match(pattern)?.[0] === resultString) {
                        return strategy.bet;
                    }
                } else {
                    // 灵活匹配：模式匹配结尾即可
                    if (pattern.test(resultString)) {
                        return strategy.bet;
                    }
                }
            } catch (e) {
                // 忽略无效的正则表达式
                console.warn('Invalid regex pattern:', strategy.pattern);
            }
        }
        
        return null; // 没有匹配的模式
    };

    // 随机投注推荐
    const getRandomRecommendation = (): string => {
        const random = Math.random();
        return random < 0.5066 ? 'B' : 'P'; // 50.66% B, 49.34% P
    };

    // 通用的建议运算和动画函数
    const triggerRecommendationAnimation = () => {
        // 开始硬币翻转动画
        setIsRolling(true);
        
        // 硬币翻转效果：每100ms切换一次B/P
        const flipInterval = setInterval(() => {
            setCoinSide(prev => prev === 'B' ? 'P' : 'B');
        }, 100);
        
        // 1.5秒后停止动画并更新投注建议
        setTimeout(() => {
            clearInterval(flipInterval);
            setIsRolling(false);
            
            // 生成新的投注建议
            if (strategyMode === 'random') {
                const newRandomRecommendation = getRandomRecommendation();
                setCurrentRandomRecommendation(newRandomRecommendation);
                setLastRecommendation(newRandomRecommendation);
            } else {
                const newRecommendation = getBettingRecommendation(results);
                setLastRecommendation(newRecommendation);
            }
        }, 1500);
    };

    // 为随机模式生成初始建议（爆缆时不生成）
    if (strategyMode === 'random' && results.length === 0 && !currentRandomRecommendation && !isBusted) {
        const initialRandom = getRandomRecommendation();
        setCurrentRandomRecommendation(initialRandom);
        setLastRecommendation(initialRandom); // 确保第一局也有lastRecommendation
    }

    const currentRecommendation = strategyMode === 'random' 
        ? currentRandomRecommendation 
        : getBettingRecommendation(results);

    // 将简单输入转换为正则表达式和描述
    const parseStrategyInput = (patternInput: string, bet: 'B' | 'P') => {
        const cleanPattern = patternInput.trim().toUpperCase();
        if (!cleanPattern) return null;

        // 检查输入格式：应该只包含B和P
        if (!/^[BP]+$/.test(cleanPattern)) return null;
        
        // 生成正则表达式：[BP]?sequence$（灵活匹配结尾）
        const regexPattern = `[BP]?${cleanPattern}$`;
        const description = `*${cleanPattern} 打${bet}`;
        
        return {
            pattern: regexPattern,
            description,
            bet,
            strict: false
        };
    };

    // 策略管理函数
    const addStrategy = () => {
        const parsed = parseStrategyInput(newStrategy.pattern, newStrategy.bet);
        if (parsed) {
            setStrategies([...strategies, parsed]);
            setNewStrategy({ pattern: '', bet: 'B' });
            setShowAddStrategy(false);
        }
    };

    const deleteStrategy = (index: number) => {
        const newStrategies = strategies.filter((_, i) => i !== index);
        setStrategies(newStrategies);
    };

    // 从描述中提取模式
    const extractPatternFromDescription = (description: string) => {
        const match = description.match(/^\*(.+) 打[BP]$/);
        return match ? match[1] : '';
    };

    // 更新策略的模式和描述
    const updateStrategyPattern = (index: number, newPattern: string, newBet: 'B' | 'P') => {
        const newStrategies = [...strategies];
        const cleanPattern = newPattern.trim().toUpperCase();
        
        if (cleanPattern && /^[BP]+$/.test(cleanPattern)) {
            newStrategies[index] = {
                ...newStrategies[index],
                pattern: `[BP]?${cleanPattern}$`,
                description: `*${cleanPattern} 打${newBet}`,
                bet: newBet
            };
        }
        setStrategies(newStrategies);
    };

    const generateRoadMap = (results: Result[]): RoadCell[] => {
        const roadMap: RoadCell[] = [];
        let currentCol = 0;
        let currentRow = 0;
        let lastResult: Result | null = null;
        let streakStartCol = 0;

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            
            if (lastResult === null || lastResult !== result) {
                if (lastResult !== null) {
                    currentCol = streakStartCol + 1;
                    currentRow = 0;
                    streakStartCol = currentCol;
                }
            } else {
                const isPositionOccupied = (col: number, row: number) => {
                    return roadMap.some(cell => cell.col === col && cell.row === row);
                };
                
                const nextRow = currentRow + 1;
                
                if (nextRow < 6 && !isPositionOccupied(currentCol, nextRow)) {
                    currentRow = nextRow;
                } else {
                    currentCol++;
                    
                    if (isPositionOccupied(currentCol, currentRow)) {
                        for (let testRow = 5; testRow >= 0; testRow--) {
                            if (!isPositionOccupied(currentCol, testRow)) {
                                currentRow = testRow;
                                break;
                            }
                        }
                    }
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
        setWinLossResults([]); // 清空输赢记录
        setRoadMap([]);
        setCurrentBetLevel(0);
        setSecondSetLevel(0);
        setTotalPnL(0);
        setLastRecommendation(null);
        setCurrentRandomRecommendation(null);
        setIsOnDouble(false);
        setCurrentSet('first');
        setIsBusted(false);
        // 停止自动投注
        setIsAutoMode(false);
        setIsAutoPaused(false);
        autoModeRef.current = false;
        autoPausedRef.current = false;
        setCurrentAutoRound(0);
        
        // 触发建议运算动画
        triggerRecommendationAnimation();
    };

    const resetBetLevels = () => {
        setBetLevels([...firstSetLevels]);
        setBaseLevels([...firstSetLevels]);
        setSecondBetLevels([...secondSetLevels]);
        setSecondBaseLevels([...secondSetLevels]);
    };

    const handleLevelEdit = (index: number, value: string) => {
        const numValue = value.trim() === '' ? 0 : parseInt(value);
        if (!isNaN(numValue) && numValue >= 0) {
            const newLevels = [...betLevels];
            const newBaseLevels = [...baseLevels];
            newLevels[index] = numValue;
            newBaseLevels[index] = numValue;
            setBetLevels(newLevels);
            setBaseLevels(newBaseLevels);
        }
        setEditingLevel(null);
    };

    const handleLevelClick = (index: number) => {
        setEditingLevel(index);
    };

    const adjustAllLevels = (increment: boolean) => {
        // 调整第一套注码
        const newLevels = betLevels.map((level, index) => {
            const baseLevel = baseLevels[index];
            if (increment) {
                return Math.round(level + baseLevel * 0.5);
            } else {
                return Math.max(baseLevel, Math.round(level - baseLevel * 0.5));
            }
        });
        setBetLevels(newLevels);
        
        // 同时调整第二套注码
        const newSecondLevels = secondBetLevels.map((level, index) => {
            const baseLevel = secondBaseLevels[index];
            if (increment) {
                return Math.round(level + baseLevel * 0.5);
            } else {
                return Math.max(baseLevel, Math.round(level - baseLevel * 0.5));
            }
        });
        setSecondBetLevels(newSecondLevels);
    };

    // Create grid for display - always show rightmost 15 columns
    const maxRows = 6;
    const displayCols = 15;
    const totalCols = roadMap.length > 0 ? Math.max(...roadMap.map(cell => cell.col)) + 1 : 0;
    const startCol = Math.max(0, totalCols - 10);

    return (
        <FrontendLayout>
            <Head title="孖宝胜进双层缆游戏" />
            
            <div className="min-h-screen bg-gray-50 p-4 relative">
                {/* Usage Instructions Link - Top Right */}
                {!isHidden && (
                    <div className="fixed top-4 right-4 z-40">
                        <button
                            onClick={() => setShowInstructions(true)}
                            className="text-sm text-gray-500 underline hover:text-gray-700 transition-colors"
                        >
                            使用说明
                        </button>
                    </div>
                )}
                
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            {!isHidden && <h1 className="text-xl text-gray-800">🎯 孖宝胜进双层缆游戏</h1>}
                            <button
                                onClick={() => {
                                    if (!isHidden) {
                                        generateRandomButtonColors();
                                    }
                                    setIsHidden(!isHidden);
                                }}
                                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                            >
                                {isHidden ? '显示' : '隐藏'}
                            </button>
                        </div>
                        
                    </div>

                    {/* P&L and Betting Info */}
                    <div className="mb-4">
                        {/* Total P&L */}
                        <div className="text-center mb-2">
                            <span className={`text-lg font-bold ${
                                isHidden 
                                    ? randomButtonColors.text 
                                    : totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                战绩: {totalPnL >= 0 ? '+' : ''}{totalPnL}
                            </span>
                        </div>
                        
                        {/* Betting Recommendation */}
                        <div className="text-left">
                            {isRolling ? (
                                <div className={`inline-block px-4 py-2 rounded-lg font-bold border-2 border-gray-300 ${
                                    isHidden ? `${randomButtonColors.text} bg-transparent` : 'text-gray-800 bg-transparent'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`text-sm w-6 h-6 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-100 ${
                                            isHidden
                                                ? 'bg-gray-300 text-gray-700 border-gray-500'
                                                : coinSide === 'B' 
                                                    ? 'bg-red-400 text-white border-red-600' 
                                                    : 'bg-blue-400 text-white border-blue-600'
                                        }`}>
                                            
                                        </div>
                                        <span>下局游戏转动中... 请稍候</span>
                                        <button
                                            disabled={true}
                                            className="ml-2 px-2 py-1 text-xs rounded bg-gray-300 text-gray-500 cursor-not-allowed"
                                        >
                                            游戏
                                        </button>
                                    </div>
                                    {/* 保持缆法描述信息显示，避免高度变化 */}
                                    <div className="text-xs mt-1 opacity-50">
                                        {currentSet === 'first' 
                                            ? (currentBetLevel === 0 
                                                ? `第一套基础缆 | 第1级 (特殊级别)`
                                                : `第一套孖宝缆 | 第${currentBetLevel + 1}级 | ${isOnDouble ? '孖宝模式' : '基础模式'}`)
                                            : `第二套胜进缆 | 第${secondSetLevel + 1}级`
                                        }
                                    </div>
                                </div>
                            ) : isBusted ? (
                                <div className="inline-block px-4 py-2 rounded-lg bg-red-500 text-white font-bold">
                                    💥 第一套注码爆缆！
                                    <div className="text-xs mt-1">
                                        休息一下，点击复位重新开始
                                    </div>
                                </div>
                            ) : currentRecommendation ? (
                                <div className={`inline-block px-4 py-2 rounded-lg font-bold border-2 border-gray-300 ${
                                    isHidden 
                                        ? `${randomButtonColors.text} bg-transparent`
                                        : 'text-gray-800 bg-transparent'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        下局建议
                                        <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-white ${
                                            currentRecommendation === 'P' ? 'bg-blue-600' : 'bg-red-600'
                                        }`}>
                                            
                                        </div>
                                        <span>{
                                            currentSet === 'first' 
                                                ? (currentBetLevel === 0 
                                                    ? betLevels[currentBetLevel]
                                                    : (isOnDouble ? betLevels[currentBetLevel] * 2 : betLevels[currentBetLevel]))
                                                : secondBetLevels[secondSetLevel]
                                        }</span>
                                        <button
                                            onClick={triggerRecommendationAnimation}
                                            disabled={isRolling}
                                            className={`ml-2 px-2 py-1 text-xs rounded transition-colors ${
                                                isRolling 
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : isHidden
                                                        ? 'bg-gray-400 hover:bg-gray-500 text-white'
                                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                            }`}
                                        >
                                        转动
                                        </button>
                                    </div>
                                    {((currentSet === 'first' && betLevels[currentBetLevel] === 0) || 
                                      (currentSet === 'second' && secondBetLevels[secondSetLevel] === 0)) && 
                                      <span className="text-xs block mt-1">遇到0值，使用第一级</span>}
                                    <div className="text-xs mt-1">
                                        {currentSet === 'first' 
                                            ? (currentBetLevel === 0 
                                                ? `第一套基础缆 | 第1级 (特殊级别)`
                                                : `第一套孖宝缆 | 第${currentBetLevel + 1}级 | ${isOnDouble ? '孖宝模式' : '基础模式'}`)
                                            : `第二套胜进缆 | 第${secondSetLevel + 1}级`
                                        }
                                    </div>
                                    
                                </div>
                            ) : (
                                <div className="inline-block px-4 py-2 rounded-lg bg-gray-400 text-white font-bold">
                                    此局不下注
                                    <span className="text-xs block mt-1">
                                        ({strategyMode === 'random' ? '随机PB' : '自定义策略'})
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Win/Loss Path - Above P B Buttons */}
                    {!isHidden && winLossResults.length > 0 && (
                        <div className="mb-3">
                            <div 
                                ref={winLossScrollRef}
                                className="font-mono text-base tracking-wide overflow-x-auto whitespace-nowrap py-1 scrollbar-hide"
                                style={{ 
                                    scrollbarWidth: 'none', 
                                    msOverflowStyle: 'none',
                                    WebkitScrollbar: { display: 'none' }
                                }}
                            >
                                {winLossResults.map((won, index) => (
                                    <span 
                                        key={index} 
                                        className={`${won ? 'text-green-600' : 'text-red-600'} font-bold mr-1`}
                                    >
                                        {won ? '✓' : '✗'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Control Buttons */}
                    <div className="flex gap-4 mb-2">
                        <button
                            onClick={() => handleButtonClick('P')}
                            disabled={isBusted || clickedButton !== null || isAutoMode}
                            className={`relative flex-1 text-white font-bold py-2 px-6 rounded-lg text-xl transform transition-all duration-300 overflow-hidden ${
                                isBusted || isAutoMode
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : clickedButton === 'P'
                                        ? 'scale-95 shadow-inner bg-blue-800'
                                        : isHidden 
                                            ? `${randomButtonColors.p} hover:scale-105 active:scale-90 shadow-lg` 
                                            : 'bg-blue-500 hover:bg-blue-600 hover:scale-105 active:scale-90 shadow-md'
                            }`}
                        >
                            <span className={`relative z-10 transition-all duration-300 ${
                                clickedButton === 'P' ? 'scale-90' : ''
                            }`}>
                                &nbsp;
                            </span>
                            {clickedButton === 'P' && (
                                <div className="absolute inset-0 bg-white opacity-30 rounded-lg animate-ping"></div>
                            )}
                        </button>
                        <button
                            onClick={() => handleButtonClick('B')}
                            disabled={isBusted || clickedButton !== null || isAutoMode}
                            className={`relative flex-1 text-white font-bold py-2 px-6 rounded-lg text-xl transform transition-all duration-300 overflow-hidden ${
                                isBusted || isAutoMode
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : clickedButton === 'B'
                                        ? 'scale-95 shadow-inner bg-red-800'
                                        : isHidden 
                                            ? `${randomButtonColors.b} hover:scale-105 active:scale-90 shadow-lg` 
                                            : 'bg-red-500 hover:bg-red-600 hover:scale-105 active:scale-90 shadow-md'
                            }`}
                        >
                            <span className={`relative z-10 transition-all duration-300 ${
                                clickedButton === 'B' ? 'scale-90' : ''
                            }`}>
                                &nbsp;
                            </span>
                            {clickedButton === 'B' && (
                                <div className="absolute inset-0 bg-white opacity-30 rounded-lg animate-ping"></div>
                            )}
                        </button>
                    </div>

                    {/* Win/Loss Statistics - Below P B Buttons */}
                    {!isHidden && winLossResults.length > 0 && (
                        <div className="mb-4 text-center">
                            <div className="flex justify-center gap-6 text-xs">
                                <span className="text-green-600 font-medium">赢: {winLossResults.filter(w => w).length}</span>
                                <span className="text-gray-500">总局数: {winLossResults.length}</span>
                                <span className="text-red-600 font-medium">输: {winLossResults.filter(w => !w).length}</span>
                            </div>
                        </div>
                    )}

                    {/* 自动投注控制 */}
                    {!isHidden && !isAutoMode && !isBusted && (
                        <div className="mb-4 bg-white rounded-lg p-4 shadow-sm border">
                            <h4 className="text-gray-800 font-semibold mb-3">🤖 自动投注</h4>
                            
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <label className="text-sm text-gray-700">轮数</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="2000"
                                    value={autoRoundsInput}
                                    onChange={(e) => handleAutoRoundsChange(e.target.value)}
                                    placeholder="500"
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                />
                                <label className="text-sm text-gray-700">速度</label>
                                <select
                                    value={autoSpeed}
                                    onChange={(e) => setAutoSpeed(Number(e.target.value))}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                    <option value={500}>极快 (0.5s)</option>
                                    <option value={1000}>快 (1s)</option>
                                    <option value={1500}>正常 (1.5s)</option>
                                    <option value={2500}>慢 (2.5s)</option>
                                    <option value={4000}>极慢 (4s)</option>
                                </select>
                            </div>
                            
                            <div className="text-xs text-gray-500 mb-3">
                                随机选择红色/蓝色按钮，各50%概率，自动执行投注策略
                            </div>
                            
                            <div className="text-center">
                                <button
                                    onClick={startAutoMode}
                                    disabled={isBusted}
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded text-sm transition-colors disabled:bg-gray-300 font-medium"
                                >
                                    {currentAutoRound > 0 ? `继续自动 (${currentAutoRound}/${autoRounds})` : '开始自动投注'}
                                </button>
                            </div>
                            
                            {currentAutoRound > 0 && (
                                <div className="text-xs text-gray-600 text-center mt-2">
                                    已完成 {currentAutoRound} / {autoRounds} 轮
                                </div>
                            )}
                        </div>
                    )}

                    {/* 自动投注进度 */}
                    {!isHidden && isAutoMode && (
                        <div className="mb-4 bg-white rounded-lg p-4 shadow-sm border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-700 font-medium">
                                    {isAutoPaused ? '⏸️ 已暂停' : '🤖 自动投注中...'}
                                </span>
                                <div className="flex gap-2">
                                    {isAutoPaused ? (
                                        <button
                                            onClick={resumeAutoMode}
                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                        >
                                            继续
                                        </button>
                                    ) : (
                                        <button
                                            onClick={pauseAutoMode}
                                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                        >
                                            暂停
                                        </button>
                                    )}
                                    <button
                                        onClick={stopAutoMode}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
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
                                {isAutoPaused && <span className="text-orange-600 ml-2">暂停中</span>}
                            </div>
                        </div>
                    )}

                    {/* Betting Levels Display */}
                    {!isHidden && (
                    <div className="mb-4 bg-white rounded-lg p-3 shadow-sm border">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold text-gray-700">孖宝缆</h4>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => adjustAllLevels(true)}
                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                >
                                    +倍
                                </button>
                                <button
                                    onClick={resetBetLevels}
                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                                >
                                    重置
                                </button>
                                <button
                                    onClick={() => setShowCableModal(true)}
                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                >
                                    注码法
                                </button>
                                <button
                                    onClick={() => setShowStrategyModal(true)}
                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                                >
                                    {strategyMode === 'random' ? '随机PB' : '自定义策略'}
                                </button>
                                <button
                                    onClick={resetBettingSystem}
                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                                >
                                    复位
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-6 grid-rows-3 gap-1 text-xs mb-4">
                            {betLevels.map((level, index) => (
                                <div
                                    key={index}
                                    className={`text-center py-1 px-1 rounded cursor-pointer ${
                                        level === 0
                                            ? 'bg-gray-100 text-gray-600'
                                            : currentSet === 'first' && index === currentBetLevel
                                                ? (index === 0 
                                                    ? 'bg-blue-200 text-gray-800 font-bold' // 第一个数字特殊颜色
                                                    : (isOnDouble 
                                                        ? 'bg-yellow-500 text-white font-bold' // 孖宝模式
                                                        : 'bg-yellow-200 text-gray-800 font-bold')) // 基础模式
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    onClick={() => handleLevelClick(index)}
                                >
                                    {editingLevel === index ? (
                                        <input
                                            type="number"
                                            defaultValue={level === 0 ? '' : level}
                                            min="0"
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
                                        <span>
                                            {level === 0 ? '\u00A0' : (
                                                currentSet === 'first' && index === currentBetLevel && index > 0 && isOnDouble 
                                                    ? level * 2 
                                                    : level
                                            )}
                                            {currentSet === 'first' && index === currentBetLevel && index > 0 && isOnDouble && (
                                                <span className="block text-xs">孖宝</span>
                                            )}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {/* 第二套注码显示 */}
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">第二套注码 - 胜进缆法</h4>
                        <div className="grid grid-cols-6 grid-rows-3 gap-1 text-xs">
                            {secondBetLevels.map((level, index) => (
                                <div
                                    key={`second-${index}`}
                                    className={`text-center py-1 px-1 rounded ${
                                        level === 0
                                            ? 'bg-gray-100 text-gray-600'
                                            : currentSet === 'second' && index === secondSetLevel
                                                ? 'bg-green-200 text-gray-800 font-bold'
                                                : 'bg-blue-50 text-blue-700'
                                    }`}
                                >
                                    <span>
                                        {level === 0 ? '\u00A0' : level}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <h4 className="text-[10px] text-gray-400 text-right">点击第一套数字可自行编辑</h4>
                    </div>
                    )}

                    

                    {/* Road Map Grid */}
                    {!isHidden && (
                    <div className="bg-white rounded-lg p-2 shadow-sm border w-full">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold"></h3>
                            <button
                                onClick={clearResults}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                                清空牌靴
                            </button>
                        </div>
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
                    )}

                </div>

                {/* Strategy Management Modal */}
                {showStrategyModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">策略管理</h3>
                                <button
                                    onClick={() => setShowStrategyModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-xl"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {/* Strategy Mode Selection */}
                                <div className="mb-4">
                                    <label className="text-sm text-gray-600 mb-2 block">策略模式:</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setStrategyMode('random')}
                                            className={`px-3 py-2 text-sm rounded transition-colors ${
                                                strategyMode === 'random' 
                                                    ? 'bg-blue-500 text-white' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            随机模式
                                        </button>
                                        <button
                                            onClick={() => setStrategyMode('custom')}
                                            className={`px-3 py-2 text-sm rounded transition-colors ${
                                                strategyMode === 'custom' 
                                                    ? 'bg-blue-500 text-white' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            自定义策略
                                        </button>
                                    </div>
                                    {strategyMode === 'random' && (
                                        <div className="text-xs text-gray-500 mt-2">
                                            随机投注：B(庄) 50.66% 概率，P(闲) 49.34% 概率
                                        </div>
                                    )}
                                </div>

                                {strategyMode === 'custom' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="text-sm text-gray-600">
                                                自定义策略 ({strategies.length}条):
                                            </div>
                                            <button
                                                onClick={() => setShowAddStrategy(true)}
                                                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                            >
                                                + 添加策略
                                            </button>
                                        </div>
                                
                                        {strategies.map((strategy, index) => (
                                            <div key={index} className="p-3 bg-gray-50 rounded border mb-2">
                                                {editingStrategy === index ? (
                                                    <div className="space-y-2">
                                                        <div>
                                                            <label className="text-xs text-gray-600">出现什么:</label>
                                                            <input
                                                                type="text"
                                                                value={editingValues.pattern}
                                                                onChange={(e) => {
                                                                    const cleanPattern = e.target.value.trim().toUpperCase();
                                                                    if (/^[BP]*$/.test(cleanPattern) || cleanPattern === '') {
                                                                        setEditingValues({...editingValues, pattern: cleanPattern});
                                                                    }
                                                                }}
                                                                className="w-full text-xs p-1 border rounded font-mono"
                                                                placeholder="例: BBB 或 BPP"
                                                            />
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                只能输入B和P的组合
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-600">打什么:</label>
                                                            <select
                                                                value={editingValues.bet}
                                                                onChange={(e) => {
                                                                    setEditingValues({...editingValues, bet: e.target.value as 'B' | 'P'});
                                                                }}
                                                                className="w-full text-xs p-1 border rounded"
                                                            >
                                                                <option value="B">打B(庄)</option>
                                                                <option value="P">打P(闲)</option>
                                                            </select>
                                                        </div>
                                                        {editingValues.pattern && (
                                                            <div className="text-xs text-blue-600 bg-blue-50 p-1 rounded">
                                                                预览: *{editingValues.pattern} 打{editingValues.bet}
                                                            </div>
                                                        )}
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    if (editingValues.pattern) {
                                                                        updateStrategyPattern(index, editingValues.pattern, editingValues.bet);
                                                                    }
                                                                    setEditingStrategy(null);
                                                                }}
                                                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                                                disabled={!editingValues.pattern.trim()}
                                                            >
                                                                保存
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingStrategy(null)}
                                                                className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                                            >
                                                                取消
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="text-sm font-mono">{strategy.description}</div>
                                                            <div className="text-xs text-gray-500 font-mono">{strategy.pattern}</div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            
                                                            <button
                                                                onClick={() => {
                                                                    const currentPattern = extractPatternFromDescription(strategy.description);
                                                                    setEditingValues({pattern: currentPattern, bet: strategy.bet});
                                                                    setEditingStrategy(index);
                                                                }}
                                                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                                            >
                                                                编辑
                                                            </button>
                                                            <button
                                                                onClick={() => deleteStrategy(index)}
                                                                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                            >
                                                                删除
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Add New Strategy Form */}
                                        {showAddStrategy && (
                                            <div className="p-3 bg-green-50 rounded border border-green-200">
                                                <div className="text-sm font-semibold mb-2 text-green-800">添加新策略</div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="text-xs text-gray-600">出现什么:</label>
                                                        <input
                                                            type="text"
                                                            value={newStrategy.pattern}
                                                            onChange={(e) => setNewStrategy({...newStrategy, pattern: e.target.value})}
                                                            className="w-full text-xs p-1 border rounded font-mono"
                                                            placeholder="例: BBB 或 BPP 或 PPBB"
                                                        />
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            只能输入B和P的组合
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-600">打什么:</label>
                                                        <select
                                                            value={newStrategy.bet}
                                                            onChange={(e) => setNewStrategy({...newStrategy, bet: e.target.value as 'B' | 'P'})}
                                                            className="w-full text-xs p-1 border rounded"
                                                        >
                                                            <option value="B">打B(庄)</option>
                                                            <option value="P">打P(闲)</option>
                                                        </select>
                                                    </div>
                                                    {newStrategy.pattern && (
                                                        <div className="text-xs text-blue-600 bg-blue-50 p-1 rounded">
                                                            预览: *{newStrategy.pattern.toUpperCase()} 打{newStrategy.bet}
                                                        </div>
                                                    )}
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={addStrategy}
                                                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                            disabled={!newStrategy.pattern.trim()}
                                                        >
                                                            添加
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowAddStrategy(false);
                                                                setNewStrategy({ pattern: '', bet: 'B' });
                                                            }}
                                                            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                                        >
                                                            取消
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="mt-4 pt-3 border-t text-xs text-gray-500">
                                    {strategyMode === 'custom' ? (
                                        <>
                                            <p>• <strong>出现什么</strong>：输入B和P的组合，如BBB、BPP、PPBB</p>
                                            <p>• <strong>打什么</strong>：选择当出现该模式时要投注B(庄)还是P(闲)</p>
                                            <p>• <strong>自动转换</strong>：系统会自动转换为 *BBB打P 格式</p>
                                            <p>• <strong>灵活匹配</strong>：*BBB 表示任意序列以BBB结尾都匹配</p>
                                        </>
                                    ) : (
                                        <>
                                            <p>• <strong>随机模式</strong>：每局随机决定投注B或P</p>
                                            <p>• <strong>概率设置</strong>：B(庄) 50.66%，P(闲) 49.34%</p>
                                            <p>• <strong>真实模拟</strong>：模拟真实百家乐庄闲出现概率</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => {
                                        setShowStrategyModal(false);
                                        setEditingStrategy(null);
                                        setShowAddStrategy(false);
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                >
                                    完成
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cable System Selection Modal */}
                {showCableModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">选择注码法</h3>
                                <button
                                    onClick={() => setShowCableModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-xl"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="p-4 border border-blue-500 bg-blue-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-800">双套注码系统</h4>
                                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">混合孖宝缆+胜进缆组合系统</p>
                                    <div className="text-xs text-gray-500 font-mono mb-2">
                                        第一套: [20, 20, 20, 20, 30, 40, 50, 70, 90, 120, 160, 220]
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono mb-2">
                                        第二套: [40, 20, 40, 40, 80, 80, 160, 160, 320, 320, 640, 640, 1280, 1280, 2560]
                                    </div>
                                    <div className="text-xs text-blue-600 mt-2">
                                        第一套第1级赢→进入第二套；第一套其他级赢→孖宝模式；孖宝赢→回第1级；第二套第1级输→回第2级；第二套其他级输→回第1级
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowCableModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Usage Instructions Modal */}
                {showInstructions && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">使用说明</h3>
                                <button
                                    onClick={() => setShowInstructions(false)}
                                    className="text-gray-500 hover:text-gray-700 text-xl"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="space-y-4 text-sm text-gray-700">
                                <section>
                                    <h4 className="font-semibold text-gray-800 mb-2">📖 为什么使用工具</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>使用工具可以防止失控，没有方法的投资100%亏损</li>
                                        <li>系统集成了前人最优秀的投资方案，只需执行即可，投资什么投资多少，系统都给出建议</li>
                                        <li>不要打六点抽一半的台，一定要打抽水5%台</li>
                                        
                                    </ul>
                                </section>

                                <section>
                                    <h4 className="font-semibold text-gray-800 mb-2">🎯 运行模式</h4>
                                    <div className="space-y-2">
                                        <div>
                                            <strong>随机模式：</strong>
                                            <p className="text-xs text-gray-600">每局随机推荐，B 50.66%概率，P 49.34%概率</p>
                                        </div>
                                        <div>
                                            <strong>自定义策略：</strong>
                                            <p className="text-xs text-gray-600">根据路单模式匹配，如 "BBB打P" 表示连续3个B后打P</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="font-semibold text-gray-800 mb-2">💰 混合双套注码系统</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>第一套混合缆：20, 20, 20, 20, 30, 40, 50, 70, 90, 120, 160, 220</li>
                                        <li>第二套胜进缆：40, 20, 40, 40, 80, 80, 160, 160, 320, 320, 640, 640, 1280, 1280, 2560</li>
                                        <li>第一套第1级：赢了→进入第二套；输了→进入第2级</li>
                                        <li>第一套第2级开始：赢了→孖宝模式；孖宝赢了→回第1级；孖宝输了→下一级</li>
                                        <li>第二套第1级：赢了→下一级；输了→回第一套第2级</li>
                                        <li>第二套第2级及以后：赢了→下一级；输了→回第一套第1级</li>
                                        <li>只能编辑第一套注码，第二套固定胜进序列</li>
                                    </ul>
                                </section>

                                <section>
                                    <h4 className="font-semibold text-gray-800 mb-2">🎮 操作技巧</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li><strong>隐藏模式：</strong>点击"隐藏"按钮进入低调界面</li>
                                        <li><strong>策略管理：</strong>点击"切入点"按钮管理投注策略</li>
                                        <li><strong>调整注码：</strong>使用"+1倍"按钮注码按比例加倍</li>
                                    </ul>
                                </section>

                                <section>
                                    <h4 className="font-semibold text-gray-800 mb-2">⚠️ 重要提醒</h4>
                                    <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                                        <p className="text-yellow-800 font-medium">仅供娱乐和学习使用</p>
                                        <p className="text-xs text-yellow-700 mt-1">理性游戏，请勿沉迷。投注有风险，请量力而行。</p>
                                    </div>
                                </section>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowInstructions(false)}
                                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                >
                                    我知道了
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </FrontendLayout>
    );
}