'use client';

import { useEffect, useRef } from 'react';
import { DriveStep } from 'driver.js';
import { useTour } from '../hooks/useTour';

interface InteractiveTourProps {
    autoStart?: boolean;
}

// Phase 1 + Phase 2 Tour Steps (13 steps total)
export const getTourSteps = (): DriveStep[] => [
    // PHASE 1: Core Basics (6 steps)
    {
        popover: {
            title: '🎉 Chào mừng đến với LEXICA!',
            description: 'Hệ thống học từ vựng IELTS thông minh với phương pháp swipe như Tinder. Chúng tôi sẽ hướng dẫn bạn các tính năng chính trong 2 phút. Bạn có thể bỏ qua bất cứ lúc nào!',
            side: 'bottom',
            align: 'center',
        }
    },
    {
        element: '[data-tour-id="swipe-deck"]',
        popover: {
            title: '💳 Thẻ từ vựng',
            description: 'Đây là thẻ từ vựng với tình huống thực tế (POV scenario). Mặt trước hiện tình huống tiếng Việt, mặt sau hiện từ tiếng Anh và nghĩa.',
            side: 'bottom',
            align: 'center',
        }
    },
    {
        element: '[data-tour-id="energy-bar"]',
        popover: {
            title: '⚡ Năng lượng (Energy)',
            description: 'Bạn có 30 năng lượng mỗi ngày. Mỗi lần học từ mới tiêu tốn 1 năng lượng. Năng lượng phục hồi hoàn toàn vào 00:00 hàng ngày.',
            side: 'bottom',
            align: 'start',
        }
    },
    {
        element: '[data-tour-id="reveal-button"]',
        popover: {
            title: '👁️ Nút Reveal',
            description: 'Nhấn nút này (hoặc phím Space trên desktop) để lật thẻ và xem từ tiếng Anh + nghĩa. Đọc kỹ trước khi quyết định!',
            side: 'top',
            align: 'center',
        }
    },
    {
        element: '[data-tour-id="swipe-actions"]',
        popover: {
            title: '↔️ Swipe để học',
            description: '<strong>← Quẹt trái (Skip):</strong> Chưa muốn học từ này, miễn phí.<br><strong>→ Quẹt phải (Learn):</strong> Học từ này, tốn 1 năng lượng. Từ sẽ được ôn lại theo lịch tối ưu.',
            side: 'top',
            align: 'center',
        }
    },
    {
        element: '[data-tour-id="voice-mode-toggle"]',
        popover: {
            title: '🎤 Voice Mode',
            description: 'Bật Voice Mode để học hiệu quả hơn! Bạn phải phát âm đúng từ 3 lần liên tiếp mới có thể swipe thẻ. Tính năng đặc biệt của LEXICA!',
            side: 'left',
            align: 'start',
        }
    },

    // PHASE 2: Learning Features (7 steps)
    {
        element: '[data-tour-id="elo-rating"]',
        popover: {
            title: '🎯 ELO Rating',
            description: 'Hệ thống ELO tự động điều chỉnh độ khó theo trình độ của bạn. Swipe đúng nhiều → Từ khó hơn. Swipe sai nhiều → Từ dễ hơn để xây dựng lại tự tin.',
            side: 'left',
            align: 'start',
        }
    },
    {
        element: '[data-tour-id="learned-counter"]',
        popover: {
            title: '📚 Số từ đã học',
            description: 'Theo dõi tiến độ của bạn! Mỗi từ swipe phải sẽ được đưa vào danh sách "Đã học" và ôn tập theo thuật toán Spaced Repetition.',
            side: 'left',
            align: 'start',
        }
    },
    {
        element: '[data-tour-id="streak-badge"]',
        popover: {
            title: '🔥 Streak',
            description: 'Học liên tục mỗi ngày để giữ streak! Streak cao → Motivation cao → Hiệu quả học tập tăng.',
            side: 'bottom',
            align: 'start',
        }
    },
    {
        element: '[data-tour-id="review-link"]',
        popover: {
            title: '🔄 Hệ thống ôn tập (SRS)',
            description: 'Các từ đã học sẽ xuất hiện lại theo lịch tối ưu (Spaced Repetition). Ôn đúng hạn giúp ghi nhớ dài hạn. Số trong ngoặc là từ cần ôn hôm nay.',
            side: 'top',
            align: 'center',
        }
    },
    {
        element: '[data-tour-id="learned-words-link"]',
        popover: {
            title: '📖 Danh sách từ đã học',
            description: 'Xem lại tất cả các từ bạn đã học, tìm kiếm, sắp xếp theo trạng thái. Có thể test lại kiến thức bất cứ lúc nào!',
            side: 'top',
            align: 'center',
        }
    },
    {
        element: '[data-tour-id="game-hub-button"]',
        popover: {
            title: '🎮 Game Hub - 7 Mini Games',
            description: 'Luyện tập với 7 game khác nhau: Speed Quiz, Memory Match, Type Challenge, Word Scramble, True/False Blitz, Combo Chain, Word Bingo. Vừa học vừa chơi!',
            side: 'top',
            align: 'center',
        }
    },
    {
        element: '[data-tour-id="story-mode-button"]',
        popover: {
            title: '📚 Story Mode',
            description: 'Học từ vựng qua truyện thực tế! Mở khóa từng phần bằng cách hoàn thành quiz. Từ được highlight trong context để ghi nhớ tốt hơn.',
            side: 'top',
            align: 'center',
        }
    },
];

export default function InteractiveTour({ autoStart = false }: InteractiveTourProps) {
    const { startTour, hasSeenTour } = useTour();
    const hasStartedRef = useRef(false);

    useEffect(() => {
        // Auto-start tour on first visit (only once)
        if (autoStart && !hasSeenTour && !hasStartedRef.current) {
            hasStartedRef.current = true;
            // Small delay to let page render fully
            const timer = setTimeout(() => {
                startTour(getTourSteps());
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [autoStart, hasSeenTour, startTour]);

    return null; // This component doesn't render anything
}

// Export function to manually trigger tour (for help button)
export function startManualTour() {
    const { startTour } = useTour();
    startTour(getTourSteps());
}
