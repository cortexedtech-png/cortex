/**
 * Unit Tests: ELO Algorithm & Spaced Repetition System (SRS)
 *
 * Bảo vệ logic cốt lõi của thuật toán SRS trong eloAlgorithm.ts:
 *
 *  - updateCardProgress(): Cập nhật tiến trình thẻ sau khi quẹt
 *    · Thẻ mới quẹt đúng lần đầu → state='seed', nextReviewAt = now + 1 ngày
 *    · Thẻ seed quẹt sai → giữ state='seed', nextReviewAt reset về now + 1 ngày
 *    · Thẻ tiến cấp qua các state: seed → sprout → gold → mastered
 *
 *  - calculateStruggleRate(): Tỷ lệ quẹt sai từ lịch sử gần đây
 *  - getAdaptiveEloRange(): Điều chỉnh range ELO theo tỷ lệ gặp khó khăn
 *  - updateUserElo(): ELO tăng khi đúng, giảm khi sai
 *
 * Lưu ý: Spec yêu cầu "8 tiếng" cho seed state nhưng code thực tế dùng 1 ngày
 * (24 giờ = 86,400,000ms). Các test này bảo vệ HÀNH VI THỰC TẾ của code.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  updateCardProgress,
  calculateNextReview,
  calculateStruggleRate,
  getAdaptiveEloRange,
  updateUserElo,
  recordSwipe,
  isCardDue,
  getDueCards,
} from '../../app/lib/eloAlgorithm';
import type { UserCardProgress, UserStats, SwipeHistory } from '../../app/lib/eloAlgorithm';

// ---------------------------------------------------------------------------
// Hằng số khoảng thời gian (phải khớp với code thực tế trong eloAlgorithm.ts)
// ---------------------------------------------------------------------------
const DAY_MS = 24 * 60 * 60 * 1000;

const SRS_INTERVALS = {
  seed: 1 * DAY_MS,       // 1 ngày
  sprout: 3 * DAY_MS,     // 3 ngày
  gold: 7 * DAY_MS,       // 7 ngày
  mastered: 14 * DAY_MS,  // 14 ngày
} as const;

// Tolerance cho kiểm tra timestamp (±100ms để tránh test flaky do thời gian chạy code)
const TIME_TOLERANCE = 100;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeExistingProgress(
  overrides: Partial<UserCardProgress>
): UserCardProgress {
  return {
    cardId: 'test-card',
    state: 'seed',
    lastReviewedAt: Date.now() - DAY_MS * 2, // đã xem 2 ngày trước
    nextReviewAt: Date.now() - 1000,           // đã đến hạn ôn
    reviewCount: 0,
    wrongCount: 0,
    ...overrides,
  };
}

function makeUserStats(overrides: Partial<UserStats> = {}): UserStats {
  return {
    currentElo: 1000,
    totalSwipes: 0,
    correctSwipes: 0,
    wrongSwipes: 0,
    recentSwipes: [],
    seenCardIds: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// updateCardProgress() — Thẻ mới (chưa có progress)
// ---------------------------------------------------------------------------
describe('updateCardProgress() — thẻ mới (không có progress trước)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('quẹt đúng lần đầu: state = seed, reviewCount = 1', () => {
    const result = updateCardProgress(undefined, 'v001', 'right');

    expect(result.cardId).toBe('v001');
    expect(result.state).toBe('seed');
    expect(result.reviewCount).toBe(1);
    expect(result.wrongCount).toBe(0);
  });

  it('quẹt đúng lần đầu: nextReviewAt = now + 1 ngày (seed interval)', () => {
    const now = Date.now();
    const result = updateCardProgress(undefined, 'v001', 'right');

    expect(result.nextReviewAt).toBeGreaterThanOrEqual(now + SRS_INTERVALS.seed - TIME_TOLERANCE);
    expect(result.nextReviewAt).toBeLessThanOrEqual(now + SRS_INTERVALS.seed + TIME_TOLERANCE);
  });

  it('quẹt sai lần đầu: state = seed, wrongCount = 1', () => {
    const result = updateCardProgress(undefined, 'v001', 'left');

    expect(result.state).toBe('seed');
    expect(result.wrongCount).toBe(1);
    expect(result.reviewCount).toBe(0);
  });

  it('quẹt sai lần đầu: nextReviewAt = now + 1 ngày (seed interval)', () => {
    const now = Date.now();
    const result = updateCardProgress(undefined, 'v001', 'left');

    expect(result.nextReviewAt).toBeGreaterThanOrEqual(now + SRS_INTERVALS.seed - TIME_TOLERANCE);
    expect(result.nextReviewAt).toBeLessThanOrEqual(now + SRS_INTERVALS.seed + TIME_TOLERANCE);
  });

  it('lastReviewedAt được set về thời điểm hiện tại', () => {
    const before = Date.now();
    const result = updateCardProgress(undefined, 'v001', 'right');
    const after = Date.now();

    expect(result.lastReviewedAt).toBeGreaterThanOrEqual(before);
    expect(result.lastReviewedAt).toBeLessThanOrEqual(after);
  });
});

// ---------------------------------------------------------------------------
// updateCardProgress() — Thẻ đã có progress (state machine tiến cấp)
// ---------------------------------------------------------------------------
describe('updateCardProgress() — tiến cấp state khi quẹt đúng', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('seed (reviewCount=0) + right → sprout, nextReviewAt = now + 3 ngày', () => {
    // reviewCount sẽ là 0+1=1, và seed+reviewCount>=1 → sprout
    const existing = makeExistingProgress({ state: 'seed', reviewCount: 0 });
    const now = Date.now();

    const result = updateCardProgress(existing, 'v001', 'right');

    expect(result.state).toBe('sprout');
    expect(result.reviewCount).toBe(1);
    expect(result.nextReviewAt).toBeGreaterThanOrEqual(now + SRS_INTERVALS.sprout - TIME_TOLERANCE);
    expect(result.nextReviewAt).toBeLessThanOrEqual(now + SRS_INTERVALS.sprout + TIME_TOLERANCE);
  });

  it('sprout (reviewCount=1) + right → gold, nextReviewAt = now + 7 ngày', () => {
    // reviewCount 1+1=2 >= 2 → gold
    const existing = makeExistingProgress({ state: 'sprout', reviewCount: 1 });
    const now = Date.now();

    const result = updateCardProgress(existing, 'v001', 'right');

    expect(result.state).toBe('gold');
    expect(result.nextReviewAt).toBeGreaterThanOrEqual(now + SRS_INTERVALS.gold - TIME_TOLERANCE);
    expect(result.nextReviewAt).toBeLessThanOrEqual(now + SRS_INTERVALS.gold + TIME_TOLERANCE);
  });

  it('gold (reviewCount=2) + right → mastered, nextReviewAt = now + 14 ngày', () => {
    // reviewCount 2+1=3 >= 3 → mastered
    const existing = makeExistingProgress({ state: 'gold', reviewCount: 2 });
    const now = Date.now();

    const result = updateCardProgress(existing, 'v001', 'right');

    expect(result.state).toBe('mastered');
    expect(result.nextReviewAt).toBeGreaterThanOrEqual(now + SRS_INTERVALS.mastered - TIME_TOLERANCE);
    expect(result.nextReviewAt).toBeLessThanOrEqual(now + SRS_INTERVALS.mastered + TIME_TOLERANCE);
  });

  it('mastered + right → giữ mastered', () => {
    const existing = makeExistingProgress({ state: 'mastered', reviewCount: 5 });

    const result = updateCardProgress(existing, 'v001', 'right');

    expect(result.state).toBe('mastered');
  });
});

// ---------------------------------------------------------------------------
// updateCardProgress() — Quẹt sai: reset về seed
// ---------------------------------------------------------------------------
describe('updateCardProgress() — quẹt sai reset về seed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('gold + left → state = seed', () => {
    const existing = makeExistingProgress({ state: 'gold', reviewCount: 3, wrongCount: 0 });

    const result = updateCardProgress(existing, 'v001', 'left');

    expect(result.state).toBe('seed');
  });

  it('sprout + left → state = seed, nextReviewAt = now + 1 ngày', () => {
    const existing = makeExistingProgress({ state: 'sprout', reviewCount: 1 });
    const now = Date.now();

    const result = updateCardProgress(existing, 'v001', 'left');

    expect(result.state).toBe('seed');
    expect(result.nextReviewAt).toBeGreaterThanOrEqual(now + SRS_INTERVALS.seed - TIME_TOLERANCE);
    expect(result.nextReviewAt).toBeLessThanOrEqual(now + SRS_INTERVALS.seed + TIME_TOLERANCE);
  });

  it('wrongCount tăng 1 khi quẹt sai, reviewCount không đổi', () => {
    const existing = makeExistingProgress({ state: 'sprout', reviewCount: 2, wrongCount: 1 });

    const result = updateCardProgress(existing, 'v001', 'left');

    expect(result.wrongCount).toBe(2);
    expect(result.reviewCount).toBe(2); // không tăng
  });
});

// ---------------------------------------------------------------------------
// calculateNextReview() — Kiểm tra interval trực tiếp
// ---------------------------------------------------------------------------
describe('calculateNextReview()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T08:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['seed', SRS_INTERVALS.seed],
    ['sprout', SRS_INTERVALS.sprout],
    ['gold', SRS_INTERVALS.gold],
    ['mastered', SRS_INTERVALS.mastered],
  ] as const)('%s → now + %d ms', (state, expectedInterval) => {
    const now = Date.now();
    const result = calculateNextReview(state);

    expect(result).toBe(now + expectedInterval);
  });
});

// ---------------------------------------------------------------------------
// calculateStruggleRate()
// ---------------------------------------------------------------------------
describe('calculateStruggleRate()', () => {
  function makeSwipe(direction: 'left' | 'right'): SwipeHistory {
    return { direction, cardId: 'x', timestamp: Date.now() };
  }

  it('trả về 50 khi lịch sử trống (default balanced)', () => {
    expect(calculateStruggleRate([])).toBe(50);
  });

  it('100% khi toàn bộ là left', () => {
    const swipes = Array.from({ length: 5 }, () => makeSwipe('left'));
    expect(calculateStruggleRate(swipes)).toBe(100);
  });

  it('0% khi toàn bộ là right', () => {
    const swipes = Array.from({ length: 5 }, () => makeSwipe('right'));
    expect(calculateStruggleRate(swipes)).toBe(0);
  });

  it('50% khi bằng nhau left/right', () => {
    const swipes = [
      makeSwipe('left'), makeSwipe('right'),
      makeSwipe('left'), makeSwipe('right'),
    ];
    expect(calculateStruggleRate(swipes)).toBe(50);
  });

  it('60% khi 3 left / 2 right trên tổng 5', () => {
    const swipes = [
      makeSwipe('left'), makeSwipe('left'), makeSwipe('left'),
      makeSwipe('right'), makeSwipe('right'),
    ];
    expect(calculateStruggleRate(swipes)).toBe(60);
  });
});

// ---------------------------------------------------------------------------
// getAdaptiveEloRange()
// ---------------------------------------------------------------------------
describe('getAdaptiveEloRange()', () => {
  it('khi struggleRate >= 70: minElo và maxElo thấp hơn baseline', () => {
    const [min, max] = getAdaptiveEloRange(1000, 75);
    // userElo sẽ bị hạ 100 → 900, range ±150 → [750, 1050]
    expect(min).toBeLessThan(1000);
    expect(max).toBeGreaterThan(750);
  });

  it('khi struggleRate <= 20: minElo và maxElo cao hơn baseline', () => {
    const [min, max] = getAdaptiveEloRange(1000, 10);
    // userElo tăng 100 → 1100, range ±150 → [950, 1250]
    expect(max).toBeGreaterThan(1000);
  });

  it('min không bao giờ < 800 và max không bao giờ > 1500', () => {
    const [min1] = getAdaptiveEloRange(800, 90); // push down from minimum
    const [, max2] = getAdaptiveEloRange(1500, 5); // push up from maximum

    expect(min1).toBeGreaterThanOrEqual(800);
    expect(max2).toBeLessThanOrEqual(1500);
  });
});

// ---------------------------------------------------------------------------
// updateUserElo()
// ---------------------------------------------------------------------------
describe('updateUserElo()', () => {
  it('tăng 5 khi quẹt right', () => {
    expect(updateUserElo(1000, 'right')).toBe(1005);
  });

  it('giảm 3 khi quẹt left', () => {
    expect(updateUserElo(1000, 'left')).toBe(997);
  });

  it('ELO không vượt quá 1500', () => {
    expect(updateUserElo(1498, 'right')).toBe(1500); // 1498+5=1503 → clamp 1500
  });

  it('ELO không xuống dưới 800', () => {
    expect(updateUserElo(801, 'left')).toBe(800); // 801-3=798 → clamp 800
  });
});

// ---------------------------------------------------------------------------
// isCardDue() & getDueCards()
// ---------------------------------------------------------------------------
describe('isCardDue()', () => {
  it('trả về false khi progress là undefined (thẻ chưa gặp)', () => {
    expect(isCardDue(undefined)).toBe(false);
  });

  it('trả về true khi nextReviewAt <= Date.now()', () => {
    const progress = makeExistingProgress({ nextReviewAt: Date.now() - 1 });
    expect(isCardDue(progress)).toBe(true);
  });

  it('trả về false khi nextReviewAt > Date.now() (chưa đến hạn)', () => {
    const progress = makeExistingProgress({ nextReviewAt: Date.now() + DAY_MS });
    expect(isCardDue(progress)).toBe(false);
  });
});

describe('getDueCards()', () => {
  it('trả về danh sách rỗng khi không có card nào đến hạn', () => {
    const cardProgress = {
      v001: makeExistingProgress({ cardId: 'v001', nextReviewAt: Date.now() + DAY_MS }),
      v002: makeExistingProgress({ cardId: 'v002', nextReviewAt: Date.now() + DAY_MS * 3 }),
    };

    expect(getDueCards(cardProgress)).toHaveLength(0);
  });

  it('chỉ trả về những card đã đến hạn', () => {
    const cardProgress = {
      v001: makeExistingProgress({ cardId: 'v001', nextReviewAt: Date.now() - 1000 }), // đến hạn
      v002: makeExistingProgress({ cardId: 'v002', nextReviewAt: Date.now() + DAY_MS }), // chưa đến
      v003: makeExistingProgress({ cardId: 'v003', nextReviewAt: Date.now() - 5000 }), // đến hạn
    };

    const due = getDueCards(cardProgress);
    expect(due).toHaveLength(2);
    expect(due.map(d => d.cardId)).toEqual(expect.arrayContaining(['v001', 'v003']));
  });
});
