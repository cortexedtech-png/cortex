'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptState {
    isInstallable: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isStandalone: boolean; // Already installed
    promptInstall: () => Promise<'accepted' | 'dismissed' | 'not-available'>;
}

/**
 * Hook to detect PWA install capability and trigger install prompt
 * 
 * Returns:
 * - isInstallable: Can show install button (Android/Desktop with prompt available)
 * - isIOS: Is iOS device (need to show manual instructions)
 * - isAndroid: Is Android device
 * - isStandalone: App is already installed
 * - promptInstall: Function to trigger install prompt
 */
export function useInstallPrompt(): InstallPromptState {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detect iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        // Detect Android
        const android = /Android/.test(navigator.userAgent);
        // Check if already installed (standalone mode)
        const standalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as { standalone?: boolean }).standalone === true
            || document.referrer.includes('android-app://');

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsIOS(iOS);
        setIsAndroid(android);
        setIsStandalone(standalone);

        // Capture beforeinstallprompt event (Android/Desktop Chrome/Edge)
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent default mini-infobar
            e.preventDefault();
            // Save event for later use
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'not-available'> => {
        if (!deferredPrompt) {
            return 'not-available';
        }

        // Show install prompt
        await deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;

        // Clear the prompt (can only be used once)
        setDeferredPrompt(null);

        return outcome;
    };

    return {
        isInstallable: !!deferredPrompt,
        isIOS,
        isAndroid,
        isStandalone,
        promptInstall,
    };
}
