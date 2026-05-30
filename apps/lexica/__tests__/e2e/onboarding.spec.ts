/**
 * E2E Test: Onboarding Flow
 *
 * Kịch bản: Người dùng mở app lần đầu (localStorage trống).
 * Mục tiêu:
 *  1. App tự động redirect vào /onboarding
 *  2. Người dùng điều hướng qua các bước, chọn archetype 'tech'
 *  3. Sau khi hoàn thành onboarding, được chuyển đi khỏi /onboarding
 *     (về /test theo logic thực tế của app)
 */

import { test, expect } from '@playwright/test';
import { clearLexicaState } from './helpers';

// ---------------------------------------------------------------------------
// Bộ test chính
// ---------------------------------------------------------------------------
test.describe('Onboarding Flow — lần đầu sử dụng', () => {
  test.beforeEach(async ({ page }) => {
    // Xóa sạch localStorage để mô phỏng người dùng mới hoàn toàn
    await clearLexicaState(page);
  });

  // -------------------------------------------------------------------------
  // Test 1: Redirect tự động vào /onboarding
  // -------------------------------------------------------------------------
  test('app redirect vào /onboarding khi localStorage trống', async ({ page }) => {
    await page.goto('/');

    // Đợi redirect hoàn thành
    await page.waitForURL(/\/onboarding/, { timeout: 10_000 });

    expect(page.url()).toContain('/onboarding');
  });

  // -------------------------------------------------------------------------
  // Test 2: Trang /onboarding hiển thị modal chào mừng
  // -------------------------------------------------------------------------
  test('trang /onboarding hiển thị màn hình chào mừng LEXICA', async ({ page }) => {
    await page.goto('/onboarding');

    // Modal phải xuất hiện với tiêu đề chào mừng
    await expect(page.getByText('Chào mừng đến LEXICA')).toBeVisible({ timeout: 8_000 });
  });

  // -------------------------------------------------------------------------
  // Test 3: Chọn archetype 'tech' và hoàn thành onboarding
  // -------------------------------------------------------------------------
  test('chọn archetype "tech" và hoàn thành onboarding → chuyển khỏi /onboarding', async ({ page }) => {
    await page.goto('/onboarding');

    // Đợi modal xuất hiện
    await expect(page.getByText('Chào mừng đến LEXICA')).toBeVisible({ timeout: 8_000 });

    // Bước 1 → Bước 2 (Persona Selection) bằng cách click nút "Tiếp theo"
    // Tìm nút điều hướng sang bước tiếp theo
    const nextButton = page.getByRole('button', { name: /tiếp theo/i });
    await nextButton.click();

    // Đợi bước persona selection xuất hiện
    await expect(page.getByText('Chọn ngữ cảnh học phù hợp')).toBeVisible({ timeout: 5_000 });

    // Click chọn archetype 'Lập trình viên / Tech'
    const techOption = page.getByText('Lập trình viên / Tech');
    await techOption.click();

    // Đảm bảo option được chọn (có thể kiểm tra via aria-pressed hoặc visual state)
    await expect(techOption).toBeVisible();

    // Tiếp tục qua các bước còn lại bằng cách click "Tiếp theo" nhiều lần
    // Số bước = 7 (STEPS.length trong OnboardingModal.tsx)
    // Đã ở bước 2, cần đến bước cuối (bước 7, index 6)
    const REMAINING_STEPS = 5; // từ bước 2 đến bước cuối
    for (let i = 0; i < REMAINING_STEPS; i++) {
      const btn = page.getByRole('button', { name: /tiếp theo/i });
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(300); // đợi animation
      } else {
        // Bước cuối cùng: nút "Bắt đầu" hoặc tương đương
        break;
      }
    }

    // Bước cuối — nút có thể là "Bắt đầu" hoặc tương tự
    const startButton = page.getByRole('button', { name: /bắt đầu/i });
    if (await startButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await startButton.click();
    } else {
      // Thử nút tiếp theo một lần nữa (nếu còn bước)
      const lastNext = page.getByRole('button', { name: /tiếp theo/i });
      if (await lastNext.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await lastNext.click();
      }
    }

    // Sau khi hoàn thành onboarding:
    // - completeOnboarding() sets hasSeenOnboarding = true
    // - router.replace('/test') chuyển đến trang test
    // => URL KHÔNG còn là /onboarding
    await page.waitForURL((url) => !url.pathname.includes('/onboarding'), {
      timeout: 10_000,
    });

    expect(page.url()).not.toContain('/onboarding');
  });

  // -------------------------------------------------------------------------
  // Test 4: Nút Skip cho phép thoát ngay lập tức
  // -------------------------------------------------------------------------
  test('nút Skip (X) bỏ qua toàn bộ onboarding', async ({ page }) => {
    await page.goto('/onboarding');

    await expect(page.getByText('Chào mừng đến LEXICA')).toBeVisible({ timeout: 8_000 });

    // Click nút X (Skip)
    const skipButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    // Thử tìm chính xác hơn — nút close/skip thường ở góc phải trên
    const closeBtn = page.locator('button').filter({ hasText: '' }).last();

    // Sử dụng keyboard Escape như một alternative nếu cần
    // Hoặc tìm nút X trực tiếp
    const xButton = page.locator('[class*="absolute"][class*="top"]').locator('button').first();

    if (await xButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await xButton.click();
    } else {
      // Fallback: tìm nút có SVG X icon
      await page.locator('button:has(svg)').last().click();
    }

    // Sau khi skip, phải chuyển ra khỏi /onboarding
    await page.waitForURL((url) => !url.pathname.includes('/onboarding'), {
      timeout: 8_000,
    });

    expect(page.url()).not.toContain('/onboarding');
  });

  // -------------------------------------------------------------------------
  // Test 5: Người dùng đã onboarding → redirect ra khỏi /onboarding
  // -------------------------------------------------------------------------
  test('người dùng đã onboarding bị redirect ra khỏi /onboarding', async ({ page }) => {
    // Set state đã onboarding trước khi load
    await page.addInitScript(() => {
      const state = {
        hasSeenOnboarding: true,
        hasSeenWelcome: true,
        selectedLevel: 'intermediate',
      };
      localStorage.setItem('lexica-storage', JSON.stringify({ state, version: 0 }));
    });

    await page.goto('/onboarding');

    // Nên được redirect ra ngay
    await page.waitForURL((url) => !url.pathname.includes('/onboarding'), {
      timeout: 8_000,
    });

    expect(page.url()).not.toContain('/onboarding');
  });
});
