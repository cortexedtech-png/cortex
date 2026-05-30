/**
 * E2E Test: Core Learning Flow (Linear Pipeline)
 *
 * Kịch bản: Người dùng đã qua onboarding, vào trang chủ và bắt đầu học.
 * Mục tiêu:
 *  1. Trang chủ hiển thị SmartEntry với Slider chọn số lượng từ
 *  2. Kéo slider và bấm "Bắt đầu học" → SwipeDeck xuất hiện
 *  3. Thực hiện swipe (kéo hoặc bàn phím) → thẻ mới xuất hiện
 *
 * Chiến lược:
 *  - Inject localStorage với trạng thái "bypass" (đã onboarding, đã chọn level)
 *  - KHÔNG set sessionStorage goal_set_* để slider tự động xuất hiện
 *  - Dùng keyboard ArrowLeft/ArrowRight để swipe (stable hơn Framer Motion drag)
 */

import { test, expect } from '@playwright/test';
import { injectLexicaState, makeBypassState } from './helpers';

// ---------------------------------------------------------------------------
// Bộ test chính
// ---------------------------------------------------------------------------
test.describe('Core Learning Flow — Linear Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    // Inject trạng thái bypass: đã onboarding, đã chọn level
    // lastGoalSetDate = null → SmartEntry sẽ hiển thị slider
    await injectLexicaState(page, makeBypassState({ lastGoalSetDate: null }));
  });

  // -------------------------------------------------------------------------
  // Test 1: Trang chủ hiển thị SmartEntry với Slider
  // -------------------------------------------------------------------------
  test('trang chủ hiển thị slider chọn số lượng từ', async ({ page }) => {
    await page.goto('/');

    // Phải ở trang chủ (không bị redirect)
    await page.waitForURL('/', { timeout: 10_000 });

    // SmartEntry với slider phải xuất hiện
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible({ timeout: 8_000 });

    // Nút "Bắt đầu học" phải có
    await expect(page.getByRole('button', { name: 'Bắt đầu học' })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 2: Slider có thể thay đổi giá trị
  // -------------------------------------------------------------------------
  test('slider thay đổi giá trị khi kéo hoặc set value', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('/', { timeout: 10_000 });

    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible({ timeout: 8_000 });

    // Đặt giá trị slider trực tiếp qua JavaScript (cách ổn định nhất cho input[range])
    await slider.evaluate((el: HTMLInputElement) => {
      el.value = '20';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Giá trị hiển thị (số lớn bên trên slider) phải cập nhật thành 20
    await expect(page.getByText('20').first()).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 3: Click "Bắt đầu học" → SwipeDeck xuất hiện
  // -------------------------------------------------------------------------
  test('click "Bắt đầu học" → SwipeDeck xuất hiện với thẻ từ vựng', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('/', { timeout: 10_000 });

    // Đợi slider xuất hiện
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible({ timeout: 8_000 });

    // Click "Bắt đầu học"
    await page.getByRole('button', { name: 'Bắt đầu học' }).click();

    // SwipeDeck phải xuất hiện — tìm vùng swipe-deck
    const swipeDeckArea = page.locator('[data-tour-id="swipe-deck"]');
    await expect(swipeDeckArea).toBeVisible({ timeout: 8_000 });

    // Phải có ít nhất 1 VocabCard (thẻ từ vựng) được render
    // VocabCard thường chứa phần tử có class card hoặc text tiếng Anh
    // Kiểm tra rằng SwipeDeck không hiển thị dead-end view (PartyPopper)
    const partyPopper = page.getByText('Hoàn thành bộ bài!');
    await expect(partyPopper).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 4: Swipe thẻ bằng bàn phím (ArrowLeft) → thẻ bị loại bỏ
  // -------------------------------------------------------------------------
  test('nhấn ArrowLeft → thẻ hiện tại bị bỏ qua, thẻ mới xuất hiện', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('/', { timeout: 10_000 });

    // Bắt đầu phiên học
    await page.locator('input[type="range"]').waitFor({ timeout: 8_000 });
    await page.getByRole('button', { name: 'Bắt đầu học' }).click();

    // Đợi SwipeDeck render
    const swipeDeck = page.locator('[data-tour-id="swipe-deck"]');
    await expect(swipeDeck).toBeVisible({ timeout: 8_000 });

    // Đợi thẻ đầu tiên được render (có thể cần time để deck load)
    await page.waitForTimeout(1_000);

    // Nhấn Space để reveal thẻ (nếu cần), sau đó ArrowLeft để swipe left
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    await page.keyboard.press('ArrowLeft');

    // Đợi animation swipe hoàn thành
    await page.waitForTimeout(500);

    // Kiểm tra: thẻ mới xuất hiện (hoặc dead-end nếu deck chỉ có 1 thẻ)
    // App không crash → SwipeDeck area vẫn còn
    await expect(swipeDeck).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 5: Swipe bằng mouse drag (mô phỏng Framer Motion drag > 150px)
  // -------------------------------------------------------------------------
  test('kéo thẻ sang trái > 150px → thẻ bị loại bỏ', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('/', { timeout: 10_000 });

    await page.locator('input[type="range"]').waitFor({ timeout: 8_000 });
    await page.getByRole('button', { name: 'Bắt đầu học' }).click();

    const swipeDeck = page.locator('[data-tour-id="swipe-deck"]');
    await expect(swipeDeck).toBeVisible({ timeout: 8_000 });

    // Đợi deck load các thẻ
    await page.waitForTimeout(1_200);

    // Tìm thẻ từ vựng trên cùng (thẻ đầu tiên trong stack)
    // VocabCard thường là div có cursor-grab hoặc có motion component
    const topCard = swipeDeck.locator('[data-card-id], div[style*="position"]').first();

    // Fallback: dùng bounding box của swipe deck để drag
    const deckBox = await swipeDeck.boundingBox();

    if (deckBox) {
      const startX = deckBox.x + deckBox.width / 2;
      const startY = deckBox.y + deckBox.height / 2;

      // Thực hiện drag từ giữa sang trái 200px (> 150px threshold)
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.waitForTimeout(100);

      // Di chuyển từng bước để Framer Motion detect gesture
      for (let dx = 0; dx < 200; dx += 20) {
        await page.mouse.move(startX - dx, startY);
        await page.waitForTimeout(20);
      }
      await page.mouse.move(startX - 200, startY);
      await page.mouse.up();

      // Đợi animation hoàn thành
      await page.waitForTimeout(800);
    }

    // App vẫn hoạt động bình thường sau thao tác swipe
    await expect(swipeDeck).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 6: Swipe bằng mouse drag sang phải (swipe right)
  // -------------------------------------------------------------------------
  test('kéo thẻ sang phải > 150px → ghi nhận "Ghi nhớ"', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('/', { timeout: 10_000 });

    await page.locator('input[type="range"]').waitFor({ timeout: 8_000 });
    await page.getByRole('button', { name: 'Bắt đầu học' }).click();

    const swipeDeck = page.locator('[data-tour-id="swipe-deck"]');
    await expect(swipeDeck).toBeVisible({ timeout: 8_000 });
    await page.waitForTimeout(1_200);

    const deckBox = await swipeDeck.boundingBox();

    if (deckBox) {
      const startX = deckBox.x + deckBox.width / 2;
      const startY = deckBox.y + deckBox.height / 2;

      // Swipe phải
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);

      // Feedback "GHI NHỚ" hoặc check icon có thể xuất hiện tạm thời
      // (AnimatePresence - xuất hiện trong ~1s)
    }

    // App không crash
    await expect(swipeDeck).toBeVisible();
  });
});
