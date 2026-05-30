/**
 * Unit Tests: lexicaStore (Zustand)
 *
 * Bảo vệ các hành động cốt lõi của store:
 *  - consumeEnergy()        : energy giảm 1, không xuống dưới 0
 *  - checkAndResetEnergy()  : reset về maxEnergy khi sang ngày mới
 *
 * Chiến lược test:
 *  - Sử dụng useLexicaStore.setState() để thiết lập trạng thái kiểm thử trực tiếp
 *    (bỏ qua lớp persist/localStorage để giữ test đơn giản và nhanh)
 *  - Dùng vi.useFakeTimers() cho các bài test liên quan đến ngày/giờ
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Zustand persist dùng localStorage — jsdom cung cấp sẵn, không cần mock thêm.
// Tuy nhiên ta phải xóa localStorage trước mỗi test để tránh ô nhiễm trạng thái.
beforeEach(() => {
  localStorage.clear();
});

// Import store SAU khi đã chuẩn bị môi trường
// eslint-disable-next-line import/first
import { useLexicaStore } from '../../app/store/lexicaStore';

// ---------------------------------------------------------------------------
// Helper: tính timestamp của midnight hôm nay
// ---------------------------------------------------------------------------
function getMidnightTimestamp(date: Date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0).getTime();
}

// ---------------------------------------------------------------------------
// Helper: reset về trạng thái tối thiểu đủ để chạy một test
// ---------------------------------------------------------------------------
function resetToKnownState(overrides: Partial<ReturnType<typeof useLexicaStore.getState>> = {}) {
  useLexicaStore.setState({
    energy: 30,
    maxEnergy: 30,
    lastEnergyReset: getMidnightTimestamp(),
    ...overrides,
  } as Parameters<typeof useLexicaStore.setState>[0]);
}

// ---------------------------------------------------------------------------
// consumeEnergy()
// ---------------------------------------------------------------------------
describe('consumeEnergy()', () => {
  beforeEach(() => resetToKnownState());

  it('trả về true và giảm energy đi 1 khi energy > 0', () => {
    useLexicaStore.setState({ energy: 10 });

    const result = useLexicaStore.getState().consumeEnergy();

    expect(result).toBe(true);
    expect(useLexicaStore.getState().energy).toBe(9);
  });

  it('gọi liên tiếp nhiều lần → energy giảm tương ứng', () => {
    useLexicaStore.setState({ energy: 5 });
    const store = useLexicaStore.getState();

    store.consumeEnergy();
    store.consumeEnergy();
    store.consumeEnergy();

    expect(useLexicaStore.getState().energy).toBe(2);
  });

  it('trả về false và KHÔNG giảm energy khi energy === 0', () => {
    useLexicaStore.setState({ energy: 0 });

    const result = useLexicaStore.getState().consumeEnergy();

    expect(result).toBe(false);
    expect(useLexicaStore.getState().energy).toBe(0);
  });

  it('energy không bao giờ âm dù gọi nhiều lần khi đã hết', () => {
    useLexicaStore.setState({ energy: 1 });
    const store = useLexicaStore.getState();

    store.consumeEnergy(); // 1 → 0
    store.consumeEnergy(); // still 0
    store.consumeEnergy(); // still 0

    expect(useLexicaStore.getState().energy).toBe(0);
  });

  it('energy chỉ giảm 1 mỗi lần gọi (không giảm nhiều hơn)', () => {
    useLexicaStore.setState({ energy: 30 });

    useLexicaStore.getState().consumeEnergy();

    expect(useLexicaStore.getState().energy).toBe(29);
  });
});

// ---------------------------------------------------------------------------
// checkAndResetEnergy()
// ---------------------------------------------------------------------------
describe('checkAndResetEnergy()', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('KHÔNG reset energy khi lastEnergyReset là midnight của ngày hiện tại', () => {
    const todayMidnight = getMidnightTimestamp();

    resetToKnownState({ energy: 5, lastEnergyReset: todayMidnight });

    useLexicaStore.getState().checkAndResetEnergy();

    expect(useLexicaStore.getState().energy).toBe(5); // không đổi
  });

  it('reset energy về maxEnergy khi lastEnergyReset là ngày hôm qua', () => {
    // Thiết lập lastEnergyReset = midnight của hôm qua
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayMidnight = getMidnightTimestamp(yesterday);

    resetToKnownState({ energy: 5, maxEnergy: 30, lastEnergyReset: yesterdayMidnight });

    useLexicaStore.getState().checkAndResetEnergy();

    expect(useLexicaStore.getState().energy).toBe(30);
  });

  it('reset energy về maxEnergy khi giả lập hệ thống sang ngày hôm sau', () => {
    vi.useFakeTimers();

    // Thiết lập: energy đã tiêu, lastEnergyReset = midnight HÔM NAY (thực tế)
    const realTodayMidnight = getMidnightTimestamp(new Date());
    resetToKnownState({ energy: 7, maxEnergy: 30, lastEnergyReset: realTodayMidnight });

    // Tua thời gian sang ngày mai (+ 25 giờ để chắc chắn qua midnight)
    vi.advanceTimersByTime(25 * 60 * 60 * 1000);

    useLexicaStore.getState().checkAndResetEnergy();

    expect(useLexicaStore.getState().energy).toBe(30);
  });

  it('cập nhật lastEnergyReset về midnight của ngày mới sau khi reset', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayMidnight = getMidnightTimestamp(yesterday);

    resetToKnownState({ energy: 0, lastEnergyReset: yesterdayMidnight });

    useLexicaStore.getState().checkAndResetEnergy();

    const newLastReset = useLexicaStore.getState().lastEnergyReset;
    const todayMidnight = getMidnightTimestamp();

    // lastEnergyReset phải >= midnight hôm nay (không còn là hôm qua)
    expect(newLastReset).toBeGreaterThanOrEqual(todayMidnight);
  });

  it('KHÔNG thay đổi lastEnergyReset nếu không reset', () => {
    const todayMidnight = getMidnightTimestamp();
    resetToKnownState({ energy: 15, lastEnergyReset: todayMidnight });

    useLexicaStore.getState().checkAndResetEnergy();

    expect(useLexicaStore.getState().lastEnergyReset).toBe(todayMidnight);
  });
});
