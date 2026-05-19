'use client';

import { useState, useEffect } from 'react';
import { Zap, AlertTriangle, Skull, Flame } from 'lucide-react';

interface EnergyBarProps {
    currentEnergy: number;
    maxEnergy: number;
    streak?: number;
}

export default function EnergyBar({ currentEnergy, maxEnergy, streak = 0 }: EnergyBarProps) {
    const percentage = (currentEnergy / maxEnergy) * 100;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Client-side only rendering to prevent hydration mismatch
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-safe" data-tour-id="energy-bar">
            <div className="mx-auto max-w-md pt-4 pb-2">
                {/* Energy Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider cyber-text">
                            Energy
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Streak Badge */}
                        {streak > 0 && (
                            <div data-tour-id="streak-badge" className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-bold ${streak >= 7 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-700/60 text-slate-300 border border-slate-600/30'}`}>
                                <Flame className={`w-3.5 h-3.5 ${streak >= 7 ? 'text-cyan-400' : 'text-slate-400'}`} />
                                {streak}
                            </div>
                        )}
                        <div className="text-lg font-bold text-white">
                            <span className="text-cyan-400">{currentEnergy}</span>
                            <span className="text-slate-500 mx-1">/</span>
                            <span className="text-slate-400">{maxEnergy}</span>
                        </div>
                    </div>
                </div>

                {/* Neumorphic Energy Bar Container */}
                <div
                    className="relative h-4 rounded-full overflow-hidden"
                    style={{
                        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                        boxShadow: 'inset 4px 4px 8px rgba(0, 0, 0, 0.5), inset -4px -4px 8px rgba(51, 65, 85, 0.1)'
                    }}
                >
                    {/* Energy Fill */}
                    <div
                        className="h-full transition-all duration-500 ease-out relative overflow-hidden rounded-full"
                        style={{
                            width: `${percentage}%`,
                            background: percentage > 50
                                ? 'linear-gradient(90deg, #06b6d4, #22d3ee)' // Cyan gradient (high energy)
                                : 'linear-gradient(90deg, #94a3b8, #cbd5e1)', // Slate gradient (low energy)
                            boxShadow: percentage > 0
                                ? '0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.3)'
                                : 'none'
                        }}
                    >
                        {/* Animated glow effect */}
                        <div
                            className="absolute inset-0 opacity-50"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                animation: 'shimmer 2s infinite'
                            }}
                        />
                    </div>

                    {/* Warning pulse for low energy */}
                    {percentage < 20 && percentage > 0 && (
                        <div
                            className="absolute inset-0 rounded-full animate-pulse"
                            style={{
                                background: 'radial-gradient(circle, rgba(148, 163, 184, 0.3), transparent)',
                            }}
                        />
                    )}
                </div>

                {/* Low energy warning */}
                {currentEnergy < 5 && currentEnergy > 0 && (
                    <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-2 animate-pulse font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Low Energy! Resets at midnight</span>
                    </p>
                )}

                {/* Empty energy message */}
                {currentEnergy === 0 && (
                    <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-2 font-bold uppercase tracking-wide">
                        <Skull className="w-3.5 h-3.5" />
                        <span>Energy Depleted! Come back tomorrow</span>
                    </p>
                )}
            </div>
        </div>
    );
}
