# Lexica — Testing Summary

## Cấu trúc thư mục

```
apps/lexica/
├── vitest.config.ts              # Config cho Unit Tests (Vitest + jsdom)
├── vitest.setup.ts               # Setup: @testing-library/jest-dom
├── playwright.config.ts          # Config cho E2E Tests (Playwright + Chromium)
└── __tests__/
    ├── unit/
    │   ├── lexicaStore.test.ts   # 10 tests
    │   └── eloAlgorithm.test.ts  # 33 tests
    └── e2e/
        ├── helpers.ts            # Shared utilities (inject localStorage)
        ├── onboarding.spec.ts    # 5 tests
        ├── core-flow.spec.ts     # 6 tests
        └── dead-end.spec.ts      # 6 tests
```

---

## Unit Tests — 43 tests (pnpm test)

### lexicaStore.test.ts (10 tests)

| # | Test | Mô tả |
|---|------|-------|
| 1 | consumeEnergy() — giảm 1 | energy 10 → 9, return true |
| 2 | consumeEnergy() — nhiều lần | energy 5 → 2 sau 3 lần gọi |
| 3 | consumeEnergy() — energy = 0 | return false, energy vẫn = 0 |
| 4 | consumeEnergy() — không âm | gọi nhiều lần khi = 0, vẫn = 0 |
| 5 | consumeEnergy() — chỉ giảm 1 | energy 30 → 29 |
| 6 | checkAndResetEnergy() — cùng ngày | energy không đổi |
| 7 | checkAndResetEnergy() — hôm qua | energy reset về 30 |
| 8 | checkAndResetEnergy() — fake timers +25h | energy reset về 30 |
| 9 | checkAndResetEnergy() — cập nhật lastEnergyReset | timestamp mới >= midnight hôm nay |
| 10 | checkAndResetEnergy() — không reset nếu cùng ngày | lastEnergyReset không đổi |

### eloAlgorithm.test.ts (33 tests)

| Group | # | Test |
|-------|---|------|
| Thẻ mới | 1 | Quẹt đúng lần đầu: state=seed, reviewCount=1 |
| | 2 | Quẹt đúng lần đầu: nextReviewAt = now + 1 ngày |
| | 3 | Quẹt sai lần đầu: state=seed, wrongCount=1 |
| | 4 | Quẹt sai lần đầu: nextReviewAt = now + 1 ngày |
| | 5 | lastReviewedAt = thời điểm hiện tại |
| Tiến cấp | 6 | seed (reviewCount=0) + right → sprout, +3 ngày |
| | 7 | sprout (reviewCount=1) + right → gold, +7 ngày |
| | 8 | gold (reviewCount=2) + right → mastered, +14 ngày |
| | 9 | mastered + right → giữ mastered |
| Reset | 10 | gold + left → state = seed |
| | 11 | sprout + left → seed, nextReviewAt = +1 ngày |
| | 12 | wrongCount tăng, reviewCount không đổi khi sai |
| calculateNextReview() | 13–16 | seed/sprout/gold/mastered → đúng interval |
| calculateStruggleRate() | 17 | Rỗng → 50 (default balanced) |
| | 18 | 100% left → 100 |
| | 19 | 100% right → 0 |
| | 20 | 50/50 → 50 |
| | 21 | 3 left / 2 right → 60 |
| getAdaptiveEloRange() | 22 | struggleRate >= 70 → ELO range thấp hơn |
| | 23 | struggleRate <= 20 → ELO range cao hơn |
| | 24 | min >= 800, max <= 1500 |
| updateUserElo() | 25 | right → +5 |
| | 26 | left → -3 |
| | 27 | Clamp max 1500 |
| | 28 | Clamp min 800 |
| isCardDue() | 29 | undefined → false |
| | 30 | nextReviewAt <= now → true |
| | 31 | nextReviewAt > now → false |
| getDueCards() | 32 | Không có card đến hạn → rỗng |
| | 33 | Lọc đúng card đến hạn |

---

## E2E Tests — 17 tests (pnpm test:e2e)

### onboarding.spec.ts (5 tests)

| # | Test |
|---|------|
| 1 | App redirect vào /onboarding khi localStorage trống |
| 2 | Trang /onboarding hiển thị màn hình chào mừng LEXICA |
| 3 | Chọn archetype "tech" → hoàn thành → chuyển khỏi /onboarding |
| 4 | Nút Skip (X) bỏ qua toàn bộ onboarding |
| 5 | Người dùng đã onboarding bị redirect ra khỏi /onboarding |

### core-flow.spec.ts (6 tests)

| # | Test |
|---|------|
| 1 | Trang chủ hiển thị slider chọn số lượng từ |
| 2 | Slider thay đổi giá trị khi kéo/set value |
| 3 | Click "Bắt đầu học" → SwipeDeck xuất hiện với thẻ từ vựng |
| 4 | Nhấn ArrowLeft → thẻ bị bỏ qua, thẻ mới xuất hiện |
| 5 | Kéo thẻ sang trái > 150px (mouse drag) → thẻ bị loại bỏ |
| 6 | Kéo thẻ sang phải > 150px → ghi nhận "Ghi nhớ" |

### dead-end.spec.ts (6 tests)

| # | Test |
|---|------|
| 1 | Swipe hết 10 thẻ → hiển thị "Hoàn thành bộ bài!" |
| 2 | Dead-end: không còn thẻ nào, nhấn ArrowLeft không tạo thẻ mới |
| 3 | Nút "Đọc truyện thực hành" xuất hiện và điều hướng đến /stories |
| 4 | Nút "Xem danh sách từ vựng" xuất hiện và điều hướng đến /learned |
| 5 | energy=0: SwipeDeck vẫn render thẻ (energy không ẩn deck) |
| 6 | Hoàn thành daily goal: UI không crash, không redirect lạ |

---

## Scripts

```bash
pnpm test              # Chạy unit tests (Vitest)
pnpm test:watch        # Vitest watch mode
pnpm test:coverage     # Unit tests + coverage report
pnpm test:e2e          # Chạy E2E tests (Playwright, cần dev server)
pnpm test:e2e:ui       # Playwright UI mode
pnpm test:e2e:headed   # Playwright chạy có browser hiển thị
```

---

## Ghi chú kỹ thuật

- **Vocal Swipe (Web Speech API)** không được test — CI không có microphone.
- **Seed interval**: Spec yêu cầu "8 tiếng" nhưng code thực tế dùng **1 ngày** (`86,400,000ms`). Tests bảo vệ hành vi thực tế.
- **E2E localStorage injection**: Dùng `page.addInitScript()` để set `lexica-storage` trước khi Zustand hydrate.
- **E2E swipe**: Dùng keyboard (`ArrowLeft`/`ArrowRight`) thay vì Framer Motion drag để ổn định hơn trong CI.
