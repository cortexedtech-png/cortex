'use client';

import { useState, useCallback } from 'react';
import { driver, DriveStep, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_SEEN_KEY = 'lexica-tour-completed';
const TOUR_SKIPPED_KEY = 'lexica-tour-skipped';

export function useTour() {
    const [driverObj, setDriverObj] = useState<Driver | null>(null);
    const [hasSeenTour, setHasSeenTour] = useState(() => {
        // Initialize from localStorage to avoid cascading renders
        if (typeof window === 'undefined') return true;
        const tourCompleted = localStorage.getItem(TOUR_SEEN_KEY) === 'true';
        const tourSkipped = localStorage.getItem(TOUR_SKIPPED_KEY) === 'true';
        return tourCompleted || tourSkipped;
    });

    const startTour = useCallback((steps: DriveStep[]) => {
        const newDriver = driver({
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            progressText: '{{current}} / {{total}}',
            nextBtnText: 'Tiếp theo',
            prevBtnText: 'Quay lại',
            doneBtnText: 'Hoàn thành ✓',
            allowClose: true,
            popoverClass: 'lexica-tour-popover',
            onDestroyed: () => {
                // Mark as completed when tour finishes
                localStorage.setItem(TOUR_SEEN_KEY, 'true');
                setHasSeenTour(true);
            },
            onCloseClick: () => {
                // Mark as skipped if user closes early
                const activeIndex = newDriver.getActiveIndex?.();
                if (activeIndex !== undefined && activeIndex < steps.length - 1) {
                    localStorage.setItem(TOUR_SKIPPED_KEY, 'true');
                    setHasSeenTour(true);
                }
                newDriver.destroy();
            },
            steps,
        });

        setDriverObj(newDriver);
        newDriver.drive();
    }, []);

    const resetTour = useCallback(() => {
        localStorage.removeItem(TOUR_SEEN_KEY);
        localStorage.removeItem(TOUR_SKIPPED_KEY);
        setHasSeenTour(false);
    }, []);

    return {
        startTour,
        resetTour,
        hasSeenTour,
        driverObj,
    };
}
