'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import PeriodSelector from './PeriodSelector';

interface AccuracyChartProps {
    studyHistory: Record<string, { swipes: number; correct: number; wrong: number }>;
}

type Period = '7D' | '1M' | '3M';

export default function AccuracyChart({ studyHistory }: AccuracyChartProps) {
    const [period, setPeriod] = useState<Period>('1M');

    // Generate data based on selected period
    const generateChartData = () => {
        const dates = Object.keys(studyHistory).sort();

        // Determine number of days based on period
        const numDays = period === '7D' ? 7 : period === '1M' ? 30 : 90;
        const lastDates = dates.slice(-numDays);

        const data = [];

        for (const date of lastDates) {
            const entry = studyHistory[date];

            const accuracy = entry.swipes > 0 ? Math.round((entry.correct / entry.swipes) * 100) : 0;
            const dateObj = new Date(date + 'T00:00:00');
            const shortDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

            data.push({
                date: shortDate,
                fullDate: date,
                accuracy,
                swipes: entry.swipes,
            });
        }

        return data;
    };

    const data = generateChartData();

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-16 text-slate-500">
                <p className="text-sm">Chưa có dữ liệu accuracy</p>
            </div>
        );
    }

    // Calculate average accuracy
    const avgAccuracy = Math.round(data.reduce((sum, d) => sum + d.accuracy, 0) / data.length);

    const periodOptions = [
        { label: '7 ngày', value: '7D' },
        { label: '1 tháng', value: '1M' },
        { label: '3 tháng', value: '3M' },
    ];

    return (
        <div>
            <div className="mb-4 flex justify-end">
                <PeriodSelector id="accuracy" periods={periodOptions} selected={period} onChange={(value) => setPeriod(value as Period)} />
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={{ stroke: '#475569' }}
                    />
                    <YAxis
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={{ stroke: '#475569' }}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}
                        labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                        itemStyle={{ color: '#10b981' }}
                        formatter={(value, name) => {
                            if (value === undefined || typeof value !== 'number') return ['N/A', name];
                            if (name === 'accuracy') return [`${value}%`, 'Accuracy'];
                            return [value, name];
                        }}
                    />
                    <ReferenceLine
                        y={avgAccuracy}
                        stroke="#64748b"
                        strokeDasharray="5 5"
                        label={{
                            value: `TB: ${avgAccuracy}%`,
                            position: 'right',
                            fill: '#64748b',
                            fontSize: 11,
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#accuracyGradient)"
                        dot={{ fill: '#10b981', r: 3 }}
                        activeDot={{ r: 5, fill: '#059669' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
