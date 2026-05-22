'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useLexicaStore } from '../../store/lexicaStore';
import LevelTestResult from '../../components/LevelTestResult';


function TestResultContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const testScore = useLexicaStore(state => state.testScore);
    const recommendedLevel = useLexicaStore(state => state.recommendedLevel) || 'beginner';
    const userStats = useLexicaStore(state => state.userStats);
    const acceptRecommendedLevel = useLexicaStore(state => state.acceptRecommendedLevel);
    const skipToManual = useLexicaStore(state => state.skipToManual);
    const setSelectedLevel = useLexicaStore(state => state.setSelectedLevel);

    // Use score from store (source of truth), fallback to URL param for backwards compatibility
    const score = testScore ?? parseInt(searchParams.get('score') || '0');
    const calibratedElo = userStats.currentElo;

    // Only redirect if no test score (user shouldn't be here)
    useEffect(() => {
        if (testScore === null) {
            router.replace('/');
        }
    }, [testScore, router]);

    const handleAccept = () => {
        acceptRecommendedLevel();
        router.replace('/');
    };

    const handleChooseManually = () => {
        // Reset test state and redirect to level selector
        skipToManual();
        setSelectedLevel(null);
        router.replace('/level-select');
    };

    if (testScore === null) {
        return null;
    }

    return (
        <LevelTestResult
            score={score}
            totalQuestions={10}
            recommendedLevel={recommendedLevel}
            calibratedElo={calibratedElo}
            onAccept={handleAccept}
            onChooseManually={handleChooseManually}
        />
    );
}

export default function TestResultPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
            <TestResultContent />
        </Suspense>
    );
}
