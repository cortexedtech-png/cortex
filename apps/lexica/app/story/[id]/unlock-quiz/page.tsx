'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import StoryQuizModal from '../../../components/StoryQuizModal';
import { STORIES } from '../../../data/stories';

function UnlockQuizContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const storyId = params.id as string;
    const part = parseInt(searchParams.get('part') || '1') as 1 | 2;

    const story = STORIES.find(s => s.id === storyId);
    // Check if story exists
    useEffect(() => {
        if (!story) {
            router.replace('/learned');
        }
    }, [story, router]);

    const handleClose = () => {
        router.back();
    };

    const handleSuccess = (storyId: string, part: 1 | 2) => {
        // Navigate to unlock celebration page when quiz is passed
        router.push(`/story/${storyId}/unlock?part=${part}`);
    };

    if (!story) {
        return null;
    }

    return <StoryQuizModal storyId={storyId} part={part} onClose={handleClose} onSuccess={handleSuccess} />;
}

export default function UnlockQuizPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
            <UnlockQuizContent />
        </Suspense>
    );
}
