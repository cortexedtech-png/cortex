'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLexicaStore } from '../../store/lexicaStore';
import StoryMode from '../../components/StoryMode';
import { STORIES } from '../../data/stories';

export default function StoryPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const storyId = params.id as string;
    const part = (searchParams.get('part') || 'full') as 'part1' | 'part2' | 'full';

    const markStoryAsRead = useLexicaStore(state => state.markStoryAsRead);
    const unlockedStories = useLexicaStore(state => state.unlockedStories);
    const unlockedStoryPart1 = useLexicaStore(state => state.unlockedStoryPart1);

    const story = STORIES.find(s => s.id === storyId);
    // Check if user has access to this story part
    useEffect(() => {
        if (!story) {
            router.push('/learned');
            return;
        }

        const part1Unlocked = unlockedStoryPart1.includes(storyId);
        const part2Unlocked = unlockedStories.includes(storyId);

        // Redirect if user doesn't have access
        if (part === 'part1' && !part1Unlocked) {
            router.push('/learned');
        } else if ((part === 'part2' || part === 'full') && !part2Unlocked) {
            router.push('/learned');
        }
    }, [story, storyId, part, unlockedStoryPart1, unlockedStories, router]);

    if (!story) {
        return null;
    }

    const handleClose = () => {
        // Go back to previous page or /learned
        router.back();
    };

    const handleFinish = (partRead: 'part1' | 'full') => {
        markStoryAsRead(storyId, partRead);
        router.back();
    };

    const handleNavigateToPart2 = () => {
        router.push(`/story/${storyId}?part=full`);
    };

    return (
        <StoryMode
            storyId={storyId}
            part={part}
            onClose={handleClose}
            onFinish={handleFinish}
            onNavigateToPart2={handleNavigateToPart2}
        />
    );
}
