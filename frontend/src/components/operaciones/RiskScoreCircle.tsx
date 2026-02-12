import { useEffect, useState } from 'react';

interface RiskScoreCircleProps {
    score: number; // 0-100
    nivel: 'BAJO' | 'MEDIO' | 'ALTO' | 'MUY_ALTO';
    size?: number;
}

export default function RiskScoreCircle({ score, nivel, size = 120 }: RiskScoreCircleProps) {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedScore(score);
        }, 100);
        return () => clearTimeout(timer);
    }, [score]);

    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 100) * circumference;

    const getColor = () => {
        switch (nivel) {
            case 'BAJO':
                return '#10b981'; // green-500
            case 'MEDIO':
                return '#f59e0b'; // amber-500
            case 'ALTO':
                return '#f97316'; // orange-500
            case 'MUY_ALTO':
                return '#ef4444'; // red-500
            default:
                return '#6b7280'; // gray-500
        }
    };

    const getBadgeColor = () => {
        switch (nivel) {
            case 'BAJO':
                return 'bg-green-100 text-green-800';
            case 'MEDIO':
                return 'bg-amber-100 text-amber-800';
            case 'ALTO':
                return 'bg-orange-100 text-orange-800';
            case 'MUY_ALTO':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Circle */}
                <svg className="transform -rotate-90" width={size} height={size}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth="10"
                        fill="none"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={getColor()}
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{
                            transition: 'stroke-dashoffset 1s ease-in-out',
                        }}
                    />
                </svg>

                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{Math.round(animatedScore)}</span>
                    <span className="text-xs text-gray-500">/100</span>
                </div>
            </div>

            {/* Risk Level Badge */}
            <span className={`mt-3 px-3 py-1 rounded-full text-sm font-semibold ${getBadgeColor()}`}>
                {nivel.replace('_', ' ')}
            </span>
        </div>
    );
}
