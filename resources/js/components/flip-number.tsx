import { useState, useEffect } from 'react';

interface FlipNumberProps {
    value: string;
    duration?: number;
    className?: string;
}

export function FlipNumber({ value, duration = 800, className = '' }: FlipNumberProps) {
    const [currentValue, setCurrentValue] = useState(value);
    const [isFlipping, setIsFlipping] = useState(false);

    useEffect(() => {
        if (value !== currentValue) {
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentValue(value);
                setTimeout(() => setIsFlipping(false), duration / 2);
            }, duration / 2);
        }
    }, [value, currentValue, duration]);

    return (
        <div className={`relative inline-block ${className}`}>
            <div 
                className={`transition-transform duration-${duration} ${
                    isFlipping ? 'animate-flip' : ''
                }`}
            >
                {currentValue}
            </div>
        </div>
    );
}

interface FlipPriceProps {
    price: number;
    className?: string;
    animate?: boolean;
}

export function FlipPrice({ price, className = '', animate = true }: FlipPriceProps) {
    const [displayPrice, setDisplayPrice] = useState(price);
    const [isAnimating, setIsAnimating] = useState(false);
    const [flipDirection, setFlipDirection] = useState<'up' | 'down'>('up');

    useEffect(() => {
        if (animate && Math.abs(price - displayPrice) > 1000) { // 只有显著变化才动画
            const direction = price > displayPrice ? 'up' : 'down';
            setFlipDirection(direction);
            setIsAnimating(true);
            
            const timer = setTimeout(() => {
                setDisplayPrice(price);
                setTimeout(() => setIsAnimating(false), 600);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setDisplayPrice(price);
        }
    }, [price, displayPrice, animate]);

    const formatPrice = (num: number) => {
        return Math.round(num).toLocaleString('zh-CN');
    };

    const getAnimationColor = () => {
        if (!isAnimating) return '';
        return flipDirection === 'up' 
            ? 'text-green-500 shadow-green-500/50' 
            : 'text-red-500 shadow-red-500/50';
    };

    return (
        <div className={`relative overflow-hidden font-mono ${className}`}>
            <div 
                className={`transition-all duration-600 transform ${
                    isAnimating 
                        ? `scale-110 ${flipDirection === 'up' ? 'rotate-1' : '-rotate-1'} ${getAnimationColor()}` 
                        : 'scale-100 rotate-0'
                }`}
                style={{
                    textShadow: isAnimating ? '0 0 15px currentColor' : 'none',
                    filter: isAnimating ? 'brightness(1.3)' : 'brightness(1)'
                }}
            >
                ¥{formatPrice(displayPrice)}
            </div>
            {isAnimating && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-40 animate-pulse"></div>
                    <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping ${
                        flipDirection === 'up' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                </>
            )}
        </div>
    );
}