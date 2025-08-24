import { useState } from 'react';
import { Head } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';

type Result = 'P' | 'B';

interface RoadCell {
    result: Result;
    row: number;
    col: number;
}

export default function Calculator() {
    const [results, setResults] = useState<Result[]>([]);
    const [roadMap, setRoadMap] = useState<RoadCell[]>([]);
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

    // 缆法系统预设
    const cableSystems = {
        'martingale': {
            name: '马丁格尔',
            levels: [10, 30, 70, 150, 310, 630, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            description: '经典倍投法'
        },
        'fibonacci': {
            name: '斐波那契',
            levels: [10, 10, 20, 30, 50, 80, 130, 210, 340, 550, 0, 0, 0, 0, 0, 0, 0, 0],
            description: '斐波那契数列递增'
        }
    };
    
    // 投注级别和注码
    const originalLevels = cableSystems.martingale.levels;
    const [betLevels, setBetLevels] = useState([...originalLevels]);
    const [baseLevels, setBaseLevels] = useState([...originalLevels]);
    const [currentCableSystem, setCurrentCableSystem] = useState('martingale');

    // 策略管理
    const [strategies, setStrategies] = useState([
        { pattern: '[BP]?BP$', description: '*BP 打B', bet: 'B' as 'B' | 'P', strict: false }
    ]);

    // 复位功能
    const resetBettingSystem = () => {
        setCurrentBetLevel(0);  // 注码复位到第一个数字
        setTotalPnL(0);         // 总盈亏归零
        // 保持当前序列不变，不清空results和roadmap
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
        // 开始硬币翻转动画
        setIsRolling(true);
        
        // 硬币翻转效果：每100ms切换一次B/P
        const flipInterval = setInterval(() => {
            setCoinSide(prev => prev === 'B' ? 'P' : 'B');
        }, 100);
        
        // 计算上一局的盈亏（如果有投注建议的话）
        if (lastRecommendation) {
            // 如果当前级别为0，使用第一级的数字
            const currentStake = betLevels[currentBetLevel] || betLevels[0];
            const won = result === lastRecommendation;
            
            if (won) {
                // 赢了：计算盈利（庄赢扣5%手续费，闲赢不扣）
                const profit = lastRecommendation === 'B' ? currentStake * 0.95 : currentStake;
                setTotalPnL(prev => prev + profit);
                setCurrentBetLevel(0);
            } else {
                // 输了：减去注码金额，进入下一级
                setTotalPnL(prev => prev - currentStake);
                
                // 检查下一级是否为0或空，如果是则直接回到第一级
                const nextLevel = currentBetLevel + 1;
                if (nextLevel < betLevels.length && betLevels[nextLevel] > 0) {
                    setCurrentBetLevel(nextLevel);
                } else {
                    // 下一级为0/空或已到最后一级，回到第一级
                    setCurrentBetLevel(0);
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
            
            // 更新投注建议（用于下一局）
            if (strategyMode === 'random') {
                const newRandomRecommendation = getRandomRecommendation();
                setCurrentRandomRecommendation(newRandomRecommendation);
                setLastRecommendation(newRandomRecommendation);
            } else {
                const newRecommendation = getBettingRecommendation(newResults);
                setLastRecommendation(newRecommendation);
            }
            setIsRolling(false);
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
        return random < 0.508 ? 'B' : 'P'; // 50.8% B, 49.2% P
    };

    // 为随机模式生成初始建议
    if (strategyMode === 'random' && results.length === 0 && !currentRandomRecommendation) {
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
        setRoadMap([]);
        setCurrentBetLevel(0);
        setTotalPnL(0);
        setLastRecommendation(null);
        setCurrentRandomRecommendation(null);
    };

    const resetBetLevels = () => {
        const currentSystem = cableSystems[currentCableSystem];
        setBetLevels([...currentSystem.levels]);
        setBaseLevels([...currentSystem.levels]);
    };

    const selectCableSystem = (systemKey: string) => {
        setCurrentCableSystem(systemKey);
        const newSystem = cableSystems[systemKey];
        setBetLevels([...newSystem.levels]);
        setBaseLevels([...newSystem.levels]);
        setShowCableModal(false);
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
        const newLevels = betLevels.map((level, index) => {
            const baseLevel = baseLevels[index];
            if (increment) {
                return level + baseLevel;
            } else {
                return Math.max(baseLevel, level - baseLevel);
            }
        });
        setBetLevels(newLevels);
    };

    // Create grid for display - always show rightmost 15 columns
    const maxRows = 6;
    const displayCols = 15;
    const totalCols = roadMap.length > 0 ? Math.max(...roadMap.map(cell => cell.col)) + 1 : 0;
    const startCol = Math.max(0, totalCols - 10);

    return (
        <FrontendLayout>
            <Head title="百家乐路单" />
            
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
                            {!isHidden && <h1 className="text-2xl font-bold text-gray-800">直播机助手</h1>}
                            <button
                                onClick={() => {
                                    if (!isHidden) {
                                        generateRandomButtonColors();
                                    }
                                    setIsHidden(!isHidden);
                                }}
                                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                            >
                                {isHidden ? '显示' : '隐藏模式'}
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
                                总盈亏: {totalPnL >= 0 ? '+' : ''}{totalPnL}
                            </span>
                        </div>
                        
                        {/* Betting Recommendation */}
                        <div className="text-left">
                            {isRolling ? (
                                <div className={`inline-block px-4 py-2 rounded-lg font-bold border-2 border-gray-300 ${
                                    isHidden ? `${randomButtonColors.text} bg-transparent` : 'text-gray-800 bg-transparent'
                                }`}>
                                    <div className="flex items-center justify-center gap-2">
                                        <div className={`text-sm w-6 h-6 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-100 ${
                                            isHidden
                                                ? 'bg-gray-300 text-gray-700 border-gray-500'
                                                : coinSide === 'B' 
                                                    ? 'bg-red-400 text-white border-red-600' 
                                                    : 'bg-blue-400 text-white border-blue-600'
                                        }`}>
                                            {coinSide}
                                        </div>
                                        <span>随机运算中...</span>
                                    </div>
                                </div>
                            ) : currentRecommendation ? (
                                <div className={`inline-block px-4 py-2 rounded-lg font-bold border-2 border-gray-300 ${
                                    isHidden 
                                        ? `${randomButtonColors.text} bg-transparent`
                                        : 'text-gray-800 bg-transparent'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-white ${
                                            currentRecommendation === 'P' ? 'bg-blue-600' : 'bg-red-600'
                                        }`}>
                                            {currentRecommendation}
                                        </div>
                                        <span>下局建议打: {currentRecommendation === 'P' ? 'P 闲' : 'B 庄'} {betLevels[currentBetLevel] || betLevels[0]}</span>
                                    </div>
                                    {betLevels[currentBetLevel] === 0 && <span className="text-xs block mt-1">遇到0值，使用第一级</span>}
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
                    

                    {/* Control Buttons */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => addResult('P')}
                            className={`flex-1 text-white font-bold py-2 px-6 rounded-lg text-xl transform active:scale-95 transition-all duration-150 ${
                                isHidden ? randomButtonColors.p : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                            }`}
                        >
                            P
                        </button>
                        <button
                            onClick={() => addResult('B')}
                            className={`flex-1 text-white font-bold py-2 px-6 rounded-lg text-xl transform active:scale-95 transition-all duration-150 ${
                                isHidden ? randomButtonColors.b : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                            }`}
                        >
                            B
                        </button>
                    </div>


                    {/* Betting Levels Display */}
                    {!isHidden && (
                    <div className="mb-4 bg-white rounded-lg p-3 shadow-sm border">
                        <div className="flex justify-end items-center mb-2">
                            
                            <div className="flex gap-1">
                                
                                <button
                                    onClick={() => adjustAllLevels(true)}
                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                >
                                    +1倍
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
                        <div className="grid grid-cols-6 gap-1 text-xs" style={{gridTemplateRows: 'repeat(3, 1fr)'}}>
                            {betLevels.map((level, index) => (
                                <div
                                    key={index}
                                    className={`text-center py-1 px-1 rounded cursor-pointer ${
                                        level === 0
                                            ? 'bg-gray-100 text-gray-600'
                                            : index === currentBetLevel
                                                ? currentRecommendation && level > 0
                                                    ? 'bg-yellow-400 text-black font-bold'
                                                    : 'bg-gray-300 text-gray-600 font-bold'
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
                                        level === 0 ? '\u00A0' : level
                                    )}
                                </div>
                            ))}
                        </div>
                        <h4 className="text-[10px] text-gray-400 text-right">点击数字可自行编辑</h4>
                    </div>
                    )}

                    

                    {/* Road Map Grid */}
                    {!isHidden && (
                    <div className="bg-white rounded-lg p-2 shadow-sm border w-full">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">大路</h3>
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

                    {/* Current Sequence */}
                    {!isHidden && results.length > 0 && (
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
                                            随机投注：B(庄) 50.8% 概率，P(闲) 49.2% 概率
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
                                            <p>• <strong>概率设置</strong>：B(庄) 50.8%，P(闲) 49.2%</p>
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
                                {Object.entries(cableSystems).map(([key, system]) => (
                                    <div 
                                        key={key}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                            currentCableSystem === key 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                        onClick={() => selectCableSystem(key)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-gray-800">{system.name}</h4>
                                            {currentCableSystem === key && (
                                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{system.description}</p>
                                        <div className="text-xs text-gray-500 font-mono">
                                            [{system.levels.filter(l => l > 0).join(', ')}...]
                                        </div>
                                    </div>
                                ))}
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
                                            <p className="text-xs text-gray-600">每局随机推荐，B 50.8%概率，P 49.2%概率</p>
                                        </div>
                                        <div>
                                            <strong>自定义策略：</strong>
                                            <p className="text-xs text-gray-600">根据路单模式匹配，如 "BBB打P" 表示连续3个B后打P</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="font-semibold text-gray-800 mb-2">💰 缆法系统</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>默认注码：10, 30, 70, 150, 310, 630，可以自行修改</li>
                                        <li>点击数字可编辑投注金额</li>
                                        <li>赢了回到第一级，输了进入下一级</li>
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