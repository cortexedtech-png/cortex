'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { VOCAB_DATABASE } from '../data/vocabCards';

interface CardStatesPieChartProps {
    cardProgress: Record<string, { state: 'seed' | 'sprout' | 'gold' | 'mastered'; cardId: string }>;
    learnedWords: Set<string>;
}

export default function CardStatesPieChart({ cardProgress, learnedWords }: CardStatesPieChartProps) {
    // Calculate card states
    const totalCards = VOCAB_DATABASE.length;
    let notStarted = 0;
    let learned = 0; // seed
    let sprout = 0;
    let mastered = 0;

    const learnedArray = Array.from(learnedWords);

    for (const card of VOCAB_DATABASE) {
        if (!learnedArray.includes(card.id)) {
            notStarted++;
        } else {
            const progress = cardProgress[card.id];
            if (progress) {
                if (progress.state === 'mastered') {
                    mastered++;
                } else if (progress.state === 'sprout') {
                    sprout++;
                } else {
                    learned++;
                }
            } else {
                learned++; // In learnedWords but no progress entry yet
            }
        }
    }

    const data = [
        { name: 'Chưa học', value: notStarted, color: '#475569' },
        { name: 'Đã học', value: learned, color: '#22d3ee' },
        { name: 'Đang luyện', value: sprout, color: '#10b981' },
        { name: 'Thành thạo', value: mastered, color: '#fbbf24' },
    ].filter(item => item.value > 0); // Only show categories with data

    if (data.length === 0 || (data.length === 1 && data[0].name === 'Chưa học')) {
        return (
            <div className="flex items-center justify-center py-16 text-slate-500">
                <p className="text-sm">Bắt đầu học từ đầu tiên!</p>
            </div>
        );
    }

    // Custom label renderer - only show label if segment > 5%, positioned further out
    const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: {
        cx?: number; cy?: number; midAngle?: number; outerRadius?: number; percent?: number; name?: string;
    }) => {
        if (!cx || !cy || !midAngle || !outerRadius || !percent || !name) return null;
        // Only show label if percentage > 5%
        if (percent < 0.05) {
            return null;
        }

        const RADIAN = Math.PI / 180;
        // Position label further outside by adding 30 to outerRadius
        const radius = outerRadius + 30;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-xs font-medium"
            >
                {`${name} ${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="relative">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={renderLabel}
                        labelLine={false}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                className="transition-all duration-200 cursor-pointer hover:brightness-110"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}
                        itemStyle={{ color: '#e2e8f0' }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <p className="text-3xl font-bold text-white">{totalCards}</p>
                    <p className="text-xs text-slate-500 mt-1">tổng từ</p>
                </div>
            </div>
        </div>
    );
}
