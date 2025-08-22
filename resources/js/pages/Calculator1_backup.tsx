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
    const [currentBetLevel, setCurrentBetLevel] = useState(0); // 当前投注级别
    const [totalPnL, setTotalPnL] = useState(0); // 总盈亏
    const [lastRecommendation, setLastRecommendation] = useState<string | null>(null); // 上一局的建议
    const [editingLevel, setEditingLevel] = useState<number | null>(null); // 正在编辑的级别

    // 投注级别和注码
    const originalLevels = [10, 20, 40, 30, 60, 120, 80, 160, 320, 200, 400, 800];
    const [betLevels, setBetLevels] = useState([...originalLevels]);
    const [baseLevels, setBaseLevels] = useState([...originalLevels]); // 用于计算增减的基准值

    const addResult = (result: Result) => {
        // 计算上一局的盈亏（如果有投注建议的话）
        if (lastRecommendation && results.length > 0) {
            const currentStake = betLevels[currentBetLevel];
            const won = result === lastRecommendation;
            
            if (won) {
                // 赢了：加上注码金额，回到第一级
                setTotalPnL(prev => prev + currentStake);
                setCurrentBetLevel(0);
            } else {
                // 输了：减去注码金额，进入下一级（如果不是最后一级）
                setTotalPnL(prev => prev - currentStake);
                if (currentBetLevel < betLevels.length - 1) {
                    setCurrentBetLevel(prev => prev + 1);
                } else {
                    // 最后一级也输了，回到第一级
                    setCurrentBetLevel(0);
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
    };

    // 投注建议规则
    const getBettingRecommendation = (results: Result[]): string | null => {
        if (results.length === 0) return null;
        
        const resultString = results.join('');
        
        // 建议投注B的模式
        const betBPatterns = [
            { pattern: /^P$/, strict: true },        // P (严格匹配开头结尾)
            { pattern: /^PP$/, strict: true },       // PP (严格匹配)
            { pattern: /^B$/, strict: true },        // B (严格匹配)
            { pattern: /^BB$/, strict: true },       // BB (严格匹配)
            { pattern: /[BP]?BP$/, strict: false },  // *BP (灵活匹配)
            { pattern: /[BP]?BPP$/, strict: false }, // *BPP (灵活匹配)
            { pattern: /[BP]?PB$/, strict: false },  // *PB (灵活匹配)
            { pattern: /PBB$/, strict: false }       // PBB (灵活匹配)
        ];
        
        // 建议投注P的模式 (可以根据需要添加)
        const betPPatterns = [
            // 这里可以添加建议投注P的模式
        ];
        
        // 检查是否匹配投注B的模式
        for (const { pattern, strict } of betBPatterns) {
            if (strict) {
                // 严格匹配：整个字符串必须完全匹配模式
                if (pattern.test(resultString) && resultString.match(pattern)?.[0] === resultString) {
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
                if (pattern.test(resultString) && resultString.match(pattern)?.[0] === resultString) {
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

    const currentRecommendation = getBettingRecommendation(results);

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
    };

    // 重置投注级别
    const resetBetLevels = () => {
        setBetLevels([...originalLevels]);
        setBaseLevels([...originalLevels]);
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

    // Create grid for display - always show rightmost 15 columns
    const maxRows = 6;
    const displayCols = 15;
    const totalCols = roadMap.length > 0 ? Math.max(...roadMap.map(cell => cell.col)) + 1 : 0;
    const startCol = Math.max(0, totalCols - 10); // Show rightmost 10 columns with data, plus 5 empty

    return (
        <FrontendLayout>
            <Head title="百家乐路单" />
            
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">直播机助手</h1>
                        <p className="text-sm text-gray-600">点击 P 或 B 记录结果</p>
                    </div>

                    {/* P&L and Betting Info */}
                    <div className="mb-4">
                        {/* Total P&L */}
                        <div className="text-center mb-2">
                            <span className={`text-lg font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                总盈亏: {totalPnL >= 0 ? '+' : ''}{totalPnL}
                            </span>
                        </div>
                        
                        {/* Betting Recommendation */}
                        <div className="text-center">
                            {currentRecommendation ? (
                                <div className={`inline-block px-4 py-2 rounded-lg text-white font-bold ${
                                    currentRecommendation === 'P' ? 'bg-blue-500' : 'bg-red-500'
                                }`}>
                                    建议下注: {currentRecommendation === 'P' ? 'P 闲' : 'B 庄'} ({betLevels[currentBetLevel]})
                                </div>
                            ) : (
                                <div className="inline-block px-4 py-2 rounded-lg bg-gray-400 text-white font-bold">
                                    此局不下注
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Betting Levels Display */}
                    <div className="mb-4 bg-white rounded-lg p-3 shadow-sm border">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold">缆法（点击可编辑）</h4>
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

                    {/* Control Buttons */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => addResult('P')}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
                        >
                            P 闲
                        </button>
                        <button
                            onClick={() => addResult('B')}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
                        >
                            B 庄
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
                </div>
            </div>
        </FrontendLayout>
    );
}