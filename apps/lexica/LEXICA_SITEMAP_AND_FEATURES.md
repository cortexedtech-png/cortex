# LEXICA - SITEMAP VÀ TÓM TẮT CHI TIẾT TÍNH NĂNG

**Ngày tạo:** 19/05/2026  
**Phiên bản:** 1.0  
**Mục đích:** Tài liệu tổng hợp đầy đủ về cấu trúc website, routing và tất cả tính năng của LEXICA

---

## 📋 MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Sitemap - Cấu trúc Routes](#2-sitemap---cấu-trúc-routes)
3. [Các tính năng chính](#3-các-tính-năng-chính)
4. [Components chi tiết](#4-components-chi-tiết)
5. [Data Models & Store](#5-data-models--store)
6. [Game Modes](#6-game-modes)
7. [Algorithms & Systems](#7-algorithms--systems)
8. [PWA & Technical Features](#8-pwa--technical-features)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Thông tin cơ bản
- **Tên:** LEXICA - IELTS Vocabulary Swiper
- **Loại:** Progressive Web App (PWA) / Single Page Application
- **Mục đích:** App học từ vựng IELTS theo phong cách swipe như Tinder
- **Chiến lược:** Ứng dụng miễn phí 100%, không quảng cáo, là "Funnel App" để dẫn traffic sang ORATIO (sản phẩm chính)

### 1.2. Tech Stack
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **State Management:** Zustand + localStorage persistence
- **Speech API:** Web Speech API (Webkit)
- **Database:** Supabase (static data)
- **Deployment:** Vercel

### 1.3. Design Philosophy
- **Style:** "Cyber-Arcade" Neumorphism
- **Color Scheme:** Dark mode (`bg-slate-900`) với neon cyan/amber accents
- **Approach:** Mobile-first, high dopamine, fast-paced micro-learning
- **Fonts:** Orbitron (cyberpunk headings), Space Grotesk (body text)

---

## 2. SITEMAP - CẤU TRÚC ROUTES

### 2.1. Cây Routes đầy đủ

```
/                           → Trang chủ (Home/Main Swipe Deck)
├── /onboarding             → Màn hình giới thiệu lần đầu
├── /test                   → Welcome screen cho Level Test
│   ├── /test/quiz          → Quiz định cấp độ (5 câu hỏi)
│   └── /test/result        → Kết quả test + gợi ý level
├── /level-select           → Chọn level học (Beginner → Expert)
├── /learned                → Danh sách từ đã học + Story Mode
├── /review                 → Review Quiz (Spaced Repetition)
├── /stats                  → Thống kê chi tiết (Charts, Heatmap, ELO)
└── /story/[id]             → Dynamic routes cho Story Mode
    ├── /story/[id]         → Đọc story (part1/part2/full)
    ├── /story/[id]/unlock  → Modal "Story Unlocked!"
    └── /story/[id]/unlock-quiz → Quiz để unlock story sớm
```

### 2.2. Chi tiết từng Route

#### **Route: `/` (Homepage - Main Swipe Deck)**

**File:** `app/page.tsx`

**Mô tả:** Trang chính của ứng dụng, hiển thị SwipeDeck và toàn bộ UI học từ vựng.

**Features:**
- SwipeDeck chính (Tinder-style swipe cards)
- EnergyBar (30 energy, resets at midnight)
- Streak counter (current & longest streak)
- Stats overview (learned count, mastered count, ELO)
- Difficulty status indicator (dynamic ELO routing feedback)
- Mode toggle: Touch Swipe vs Voice Swipe
- Review prompt modal (xuất hiện khi có từ cần ôn)
- Cortex Hub reminder (xuất hiện mỗi 25 từ học được)
- Interactive Tour (first-time guide)
- Navigation buttons (Stats, Learned, Settings)

**Redirects:**
- Nếu chưa xem onboarding → `/onboarding`
- Nếu chưa chọn level & chưa làm test → `/test`
- Nếu đang làm test → `/test/quiz`
- Nếu test xong chưa chấp nhận → `/test/result`
- Nếu chưa chọn level (manual) → `/level-select`

---

#### **Route: `/onboarding` (First-Time User Guide)**

**File:** `app/onboarding/page.tsx`

**Mô tả:** Hướng dẫn sử dụng app cho user lần đầu.

**Features:**
- Multi-step modal walkthrough
- Giải thích concept: Swipe mechanics, Energy system, ELO routing, Voice Swipe
- "Got it" button → redirect to homepage
- Chỉ hiển thị 1 lần (tracked in Zustand)

**Components sử dụng:**
- `OnboardingModal.tsx`

---

#### **Route: `/test` (Level Test Welcome)**

**File:** `app/test/page.tsx`

**Mô tả:** Màn hình welcome cho Level Test, giải thích tại sao nên làm test.

**Features:**
- Giới thiệu Level Test (5 câu hỏi định cấp độ)
- 2 options:
  - **"Làm test định cấp"** → `/test/quiz`
  - **"Tự chọn level"** → `/level-select`

---

#### **Route: `/test/quiz` (Level Test Quiz)**

**File:** `app/test/quiz/page.tsx`

**Mô tả:** Quiz 5 câu hỏi để định cấp độ người dùng.

**Features:**
- 5 câu hỏi tăng dần độ khó (ELO 800 → 1400)
- Multiple choice format
- Real-time scoring
- Auto-redirect to `/test/result` khi hoàn thành

**Test Logic:**
- Score 0-1: Beginner (ELO 900)
- Score 2: Intermediate (ELO 1050)
- Score 3-4: Advanced (ELO 1200)
- Score 5: Expert (ELO 1350)

---

#### **Route: `/test/result` (Test Results)**

**File:** `app/test/result/page.tsx`

**Mô tả:** Hiển thị kết quả test và gợi ý level phù hợp.

**Features:**
- Score display (X/5)
- AI recommended level
- Calibrated ELO starting point
- 2 actions:
  - **"Chấp nhận"** → Start learning với recommended level
  - **"Chọn lại"** → `/level-select`

---

#### **Route: `/level-select` (Manual Level Selection)**

**File:** `app/level-select/page.tsx`

**Mô tả:** User tự chọn level học (nếu không muốn làm test).

**Features:**
- 4 level buttons: Beginner, Intermediate, Advanced, Expert
- Hiển thị ELO range và word count cho mỗi level
- Confirmation → Start learning
- Có option "Học tất cả level" (All)

**Components sử dụng:**
- `LevelSelector.tsx`

---

#### **Route: `/learned` (Learned Words & Story Hub)**

**File:** `app/learned/page.tsx`

**Mô tả:** Trang tổng hợp từ đã học, Story Mode, và Vocabulary Games.

**Features:**

1. **Header Stats:**
   - Total learned words count
   - Mastered words count (Gold state)
   - Unlocked stories count (X/Y)
   - Mastery progress bar

2. **SRS Calendar:**
   - Heatmap 30 ngày gần nhất
   - Hiển thị số từ học mỗi ngày
   - Due cards indicator

3. **Review Reminder:**
   - Button "Ôn tập hôm nay" (nếu có từ due)
   - Shows due count

4. **Vocabulary Games:**
   - Button "Vocabulary Games" (unlock khi ≥4 từ)
   - Opens GameHub modal with 7 mini-games

5. **Story Mode Section:**
   - List of all stories (preview/locked/unlocked states)
   - Story Card States:
     - **LOCKED (0-1 words):** "Thu thập thêm X từ để preview"
     - **PREVIEW (2-3 words):** Teaser text visible
     - **QUIZ AVAILABLE (3 words):** Button "⚡ Unlock Part 1" (quiz route)
     - **PART 1 UNLOCKED (4+ words):** Button "📖 Đọc Part 1"
     - **PART 2 QUIZ AVAILABLE (5-6 words):** Button "⚡ Unlock Ending"
     - **FULL UNLOCKED (7 words):** Button "📖 Đọc lại full story"

6. **Learned Words List:**
   - Expandable list of all learned words
   - Each word shows: Word, IPA, Meaning, State (Seed/Sprout/Gold)
   - Filter by state

**Components sử dụng:**
- `LearnedWordsList.tsx`
- `SRSCalendar.tsx`
- `GameHub.tsx` (modal)
- Story card UI (inline)

---

#### **Route: `/review` (Spaced Repetition Review)**

**File:** `app/review/page.tsx`

**Mô tả:** Quiz review cho các từ đến hạn ôn tập (Spaced Repetition System).

**Features:**

1. **Review Quiz:**
   - Questions for due cards only
   - 4 question types:
     - **word-to-meaning:** Word → chọn nghĩa đúng
     - **meaning-to-word:** Nghĩa → gõ từ tiếng Anh
     - **fill-in:** Điền từ vào chỗ trống trong câu
     - **context-pick:** Chọn câu nào dùng đúng từ này
   - Timer: 15 giây/câu
   - Reveal panel sau mỗi câu (show full word info)

2. **Progress Tracking:**
   - Current question X/Y
   - Streak counter (consecutive correct)
   - Score percentage
   - Flame icon khi combo ≥3

3. **Results Screen:**
   - Total score (X/Y correct)
   - Accuracy percentage
   - XP earned
   - Continue button → back to home

**Review Algorithm:**
- Correct answer → Next review in 1 day, 3 days, 7 days, 14 days (exponential)
- Wrong answer → Reset to 8 hours

**Components sử dụng:**
- `ReviewQuiz.tsx`

---

#### **Route: `/stats` (Statistics Dashboard)**

**File:** `app/stats/page.tsx`

**Mô tả:** Dashboard thống kê chi tiết về tiến độ học.

**Features:**

1. **Overview Stats:**
   - Total learned words
   - Mastered words
   - Current ELO (vs highest ELO)
   - Current streak (vs longest streak)
   - Today's swipes
   - Overall accuracy %

2. **Charts:**
   - **Activity Heatmap:** 30 ngày gần nhất (GitHub-style)
   - **ELO Chart:** Line chart theo thời gian
   - **Accuracy Chart:** Bar chart accuracy % theo tuần
   - **Card States Pie Chart:** Seed/Sprout/Gold distribution

3. **Period Selector:**
   - Tabs: 7 days / 30 days / All time
   - Update charts dynamically

4. **Level Progress:**
   - Breakdown theo từng level (Beginner/Intermediate/Advanced/Expert)
   - Words count per level
   - Mastery rate per level

**Components sử dụng:**
- `ActivityHeatmap.tsx`
- `ELOChart.tsx`
- `AccuracyChart.tsx`
- `CardStatesPieChart.tsx`
- `PeriodSelector.tsx`
- `CountUp.tsx` (animated numbers)

---

#### **Route: `/story/[id]` (Story Reading Page)**

**File:** `app/story/[id]/page.tsx`

**Mô tả:** Đọc story (Part 1 hoặc Full story).

**Query Params:**
- `?part=part1` → Read Part 1 only
- `?part=full` hoặc không có param → Read full story

**Features:**
- Story title & teaser
- Story content (markdown-style)
- Vocabulary words highlighted trong story (bọc trong `{...}`)
- Comprehension Quiz sau khi đọc:
  - Part 1: 3 câu hỏi
  - Full story: 4-5 câu hỏi
  - Phải đạt 3/3 (Part 1) hoặc 3/4 (Full) để pass
- ORATIO CTA button (cuối story): "Vocabulary is dead until spoken. Debate this on ORATIO →"
- Mark as read automatically

**Components sử dụng:**
- `StoryMode.tsx`
- `StoryComprehensionQuiz.tsx`
- `CortexSection.tsx` (ORATIO CTA)

---

#### **Route: `/story/[id]/unlock` (Story Unlock Modal)**

**File:** `app/story/[id]/unlock/page.tsx`

**Mô tả:** Modal thông báo "Story Unlocked!" khi unlock Part 1 hoặc Part 2.

**Query Params:**
- `?part=1` → Part 1 unlocked
- `?part=2` → Part 2 unlocked (full story)

**Features:**
- Celebration animation (confetti, party popper icon)
- Message:
  - Part 1: "📖 Part 1 Unlocked! Bạn đã mở khóa 60% đầu của câu chuyện"
  - Part 2: "🎉 Ending Unlocked! Bạn đã hoàn thành full story!"
- Buttons:
  - **"Đọc ngay"** → `/story/[id]?part=...`
  - **"Để sau"** → Back to `/learned`

**Components sử dụng:**
- `StoryUnlockModal.tsx`

---

#### **Route: `/story/[id]/unlock-quiz` (Story Unlock Quiz)**

**File:** `app/story/[id]/unlock-quiz/page.tsx`

**Mô tả:** Quiz để unlock story sớm (thay vì phải học đủ số từ).

**Query Params:**
- `?part=1` → Quiz to unlock Part 1 (requires 3 words learned)
- `?part=2` → Quiz to unlock Part 2 (requires 5 words learned)

**Features:**
- 5 câu hỏi MCQ về các từ đã học trong story pack đó
- Phải đạt 4/5 correct để pass
- Pass → Auto-unlock part tương ứng + redirect to unlock modal
- Fail → "Học thêm từ hoặc thử lại sau 1h" (cooldown)
- Hiển thị cooldown timer nếu đã fail gần đây

**Components sử dụng:**
- `StoryQuizModal.tsx`

---

## 3. CÁC TÍNH NĂNG CHÍNH

### 3.1. Energy System (Scarcity Mechanic)

**Concept:** Giới hạn số lần swipe mỗi ngày để tạo khan hiếm và engagement.

**Specs:**
- Max energy: 30 points
- Cost: 1 energy per swipe RIGHT (learning new card)
- Swipe LEFT (skip) = FREE (no energy cost)
- Review cards = FREE (no energy cost)
- Recovery: Full reset at midnight (local time)
- UI: Energy bar ở top màn hình chính

**Implementation:**
- Tracked in `lexicaStore.energy`
- Reset logic in `checkAndResetEnergy()` (runs on app mount)
- Prevent swipe if energy = 0

---

### 3.2. ELO Routing & Adaptive Difficulty

**Concept:** Tự động điều chỉnh độ khó của thẻ dựa trên performance gần đây.

**Mechanics:**

1. **ELO Ratings:**
   - User starts at 1000 ELO
   - Each word has ELO 800-1500
   - User ELO changes based on performance (not implemented yet - static for now)

2. **Struggle Rate Calculation:**
   - Track last 10 swipes
   - Calculate % of LEFT swipes (struggle rate)

3. **Dynamic ELO Range:**
   - **High struggle (≥70%):** Reduce difficulty (ELO range -150, target -100)
   - **Medium struggle (50-69%):** Slight reduction (ELO range -180, target -50)
   - **Low struggle (≤20%):** Increase difficulty (ELO range -150, target +100)
   - **Perfect flow (21-49%):** Maintain current range

4. **Card Selection:**
   - Filter cards within adaptive ELO range
   - Weighted random (cards closer to user ELO = higher probability)
   - Exclude last 20 seen cards

5. **Status Feedback:**
   - Hiển thị status indicator trên UI:
     - "Very Hard" / "Challenging" → slate (struggling)
     - "Perfect Flow" → check icon (balanced)
     - "Too Easy" → trending up (crushing)
   - Auto-hide sau 5s

**Files:**
- `lib/eloAlgorithm.ts` (core logic)
- `app/page.tsx` (UI display)

---

### 3.3. Card Evolution System (Mastery States)

**Concept:** 3 cấp độ thành thạo cho mỗi từ (visual gamification).

**States:**

1. **Seed (Initial):** Chưa học hoặc mới swipe RIGHT lần 1
   - Icon: 🌱
   - Color: slate-400

2. **Sprout (Growing):** Swipe RIGHT lần 2 (consolidated)
   - Icon: 🌿
   - Color: cyan-500

3. **Gold (Mastered):** Swipe RIGHT lần 3 VIA VOICE SWIPE
   - Icon: 👑
   - Color: amber-400
   - Achievement: Confetti animation

**Transition Rules:**
- Seed → Sprout: Any swipe RIGHT (touch or voice)
- Sprout → Gold: Must use VOICE SWIPE (3x vocal combo)
- Gold →永久 (irreversible in current version)

**UI Representation:**
- Small icon + color on card corner
- LearnedWordsList shows state for each word
- Pie chart in /stats

---

### 3.4. Vocal Swipe (Killer Feature)

**Concept:** Bắt buộc phải phát âm từ 3 lần liên tiếp để thẻ chuyển Gold.

**When Triggered:**
- Mode "Voice Swipe" active (toggle on homepage)
- Card is in "Sprout" state (transitioning to Gold)
- Manual swipe RIGHT bị disable

**State Machine:**

1. **INIT:** Mic icon xanh, chờ user nói
2. **HIT_1:** 1st correct → Glow green, play "tick", counter "2 left"
3. **HIT_2:** 2nd correct → Intensify glow, subtle shake, counter "1 left"
4. **HIT_3:** 3rd correct → CONFETTI EXPLOSION, "swoosh" sound, auto-swipe RIGHT, card → Gold
5. **FAIL:** Any incorrect → Flash red, reset combo to 3 required

**Web Speech API:**
```typescript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
```

**Fallback:**
- iOS Safari requires user interaction to start
- Permission denial handling
- Button to retry mic access

**Components:**
- `VocabCard.tsx` (vocal swipe UI)
- `hooks/useVocalSwipe.tsx` (speech recognition logic)

---

### 3.5. Story Mode (Progressive Unlock)

**Concept:** Đọc truyện ngắn chứa 7 từ vựng vừa học, có hệ thống unlock tiến bộ.

**Story Structure:**

Each story has:
- **Title:** Tiêu đề hấp dẫn
- **Teaser:** Preview text (visible at 2 words)
- **Part 1 Content:** ~60% story
- **Part 2 Content:** ~40% story (ending)
- **7 vocabulary IDs:** Words required
- **Comprehension Quiz:** Questions to test understanding

**Unlock Progression:**

| Words Learned | State | Actions Available |
|---------------|-------|-------------------|
| 0-1 | LOCKED | "Thu thập thêm X từ để preview" |
| 2 | PREVIEW | Teaser visible, "Học thêm 2 từ để mở Part 1" |
| 3 | QUIZ ELIGIBLE (Part 1) | "Học thêm 1 từ" OR "⚡ Làm quiz để unlock Part 1" |
| 4 | PART 1 UNLOCKED | "📖 Đọc Part 1" button |
| 5-6 | QUIZ ELIGIBLE (Part 2) | "Học thêm X từ" OR "⚡ Làm quiz để unlock Ending" |
| 7 | FULL UNLOCKED | "📖 Đọc lại full story" |

**Quiz Unlock Alternative:**
- Part 1: Min 3 words learned → Take quiz (5 questions, need 4/5 correct)
- Part 2: Min 5 words learned → Take quiz (5 questions, need 4/5 correct)
- Pass → Auto-unlock part immediately
- Fail → 1 hour cooldown before retry

**Story Content Format:**
```markdown
Your story text with {VOCABULARY_WORD} highlighted in curly braces.

The app will automatically highlight these words in cyan.
```

**ORATIO Funnel CTA:**
At end of every story:
> "Vocabulary is dead until spoken. Take this absurd story and debate it with a real human on ORATIO right now."
> 
> **[🔥 Debate on ORATIO →]**

---

### 3.6. Spaced Repetition System (SRS)

**Concept:** Lặp lại từ theo khoảng thời gian tăng dần để củng cố trí nhớ dài hạn.

**Intervals:**

| Review Count | Next Review In |
|--------------|----------------|
| 1st correct | 8 hours |
| 2nd correct | 1 day |
| 3rd correct | 3 days |
| 4th correct | 7 days |
| 5th correct | 14 days |
| 6th+ correct | 30 days |

**Wrong Answer:** Reset to 8 hours

**Auto-Injection:**
- Due cards automatically injected into main deck (optional setting)
- Review prompt modal khi có từ due
- Dedicated `/review` page for focused review

**Algorithm:**
```typescript
function updateCardProgress(
  cardProgress: UserCardProgress,
  correct: boolean
): UserCardProgress {
  const intervals = [8 * 3600000, 86400000, 3 * 86400000, 7 * 86400000, ...];
  
  if (correct) {
    reviewCount++;
    nextReviewAt = now + intervals[reviewCount];
  } else {
    reviewCount = 0;
    nextReviewAt = now + 8 * 3600000; // 8 hours
  }
}
```

**UI:**
- SRS Calendar heatmap on `/learned`
- Due count badge on review button
- Review quiz page `/review`

---

### 3.7. Level System

**Concept:** 4 difficulty levels dựa trên IELTS band scores.

**Levels:**

| Level | ELO Range | Word Count | Description |
|-------|-----------|------------|-------------|
| **Beginner** | 800-950 | 10 words | Từ phổ biến, dễ hiểu |
| **Intermediate** | 900-1200 | 25 words | Từ IELTS band 5-6 |
| **Advanced** | 1100-1400 | 30 words | Từ IELTS band 6.5-7.5 |
| **Expert** | 1300+ | 30 words | Từ academic, formal |

**Selection:**
- Auto-detect via Level Test (5 questions)
- Manual selection in `/level-select`
- Can change anytime (button on homepage)

**Level Test Scoring:**
```
0-1 correct → Beginner (ELO 900)
2 correct → Intermediate (ELO 1050)
3-4 correct → Advanced (ELO 1200)
5 correct → Expert (ELO 1350)
```

---

### 3.8. Vocabulary Database

**Total Words:** 95 words (10 + 25 + 30 + 30)

**Card Structure:**
```typescript
interface VocabCardData {
  id: string;              // "v001"
  word: string;            // "METICULOUS"
  ipa: string;             // "məˈtɪkjələs"
  elo: number;             // 1050
  level: DifficultyLevel;  // "intermediate"
  scenario: string;        // POV micro-scenario (Vietnamese)
  translationHint: string; // "Tỉ mỉ, cẩn thận"
  
  // Optional modules
  upgradeModule?: {        // Academic upgrade examples
    simpleSentence: string;
    targetSlot: string;
    academicOptions: Array<{
      text: string;
      nuance: string;
      formalityScore: number;
    }>;
  };
  
  surgeryModule?: {        // Prefix/Root/Suffix breakdown
    prefix: { text: string; meaning: string; relatedWords: [...] };
    root: { text: string; meaning: string; relatedWords: [...] };
    suffix: { text: string; meaning: string; relatedWords: [...] };
  };
  
  state: 'seed' | 'sprout' | 'gold'; // Mastery state
}
```

**Scenario Style:**
- 100% Vietnamese with English word embedded
- POV (first-person) situational context
- Dark humor, relatable situations
- Example: "Lương chưa về mà bill thì ABUNDANT vãi..."

---

### 3.9. Streak System

**Concept:** Khuyến khích sử dụng hàng ngày.

**Mechanics:**
- +1 streak mỗi ngày active (swipe ≥1 card)
- Reset nếu miss 1 ngày
- Track current streak & longest streak
- Display on homepage + stats page

**UI:**
- 🔥 Fire icon + number on homepage
- Streak broken warning if miss 1 day (future feature)

---

### 3.10. Sound Effects

**Audio Feedback:**
- ✅ Swipe right: "Success" chime
- ❌ Swipe left: "Skip" whoosh
- 🎤 Voice hit: "Tick" sound
- 🎉 Mastery achieved: "Celebration" fanfare
- 🔘 Button press: Subtle click
- ⚡ Quiz correct: "Correct" ding
- ❌ Quiz wrong: "Wrong" buzz

**Toggle:**
- Sound on/off button in settings
- Saved in localStorage

**Files:**
- `hooks/useSoundEffects.tsx`

---

## 4. COMPONENTS CHI TIẾT

### 4.1. Core Components

#### **SwipeDeck.tsx**
Main swipe deck with Framer Motion drag physics.

**Features:**
- Tinder-style drag & swipe
- Threshold detection (150px)
- Stack of 3 cards visible
- Exit animations (fly off screen)
- Keyboard controls (Arrow keys, Space to reveal)
- "Deck complete" screen with CTA

**Props:** None (reads from Zustand store)

---

#### **VocabCard.tsx**
Individual vocabulary card with flip animation.

**Features:**
- Front: Scenario (Vietnamese + blank)
- Back: 
  - Word + IPA
  - Translation hint
  - Upgrade Lab button (if has upgradeModule)
  - Surgery Lab button (if has surgeryModule)
- Vocal Swipe UI (if voice mode + sprout state)
- State badge (Seed/Sprout/Gold icon)

**Props:**
```typescript
{
  card: VocabCardData;
  index: number;        // Stack position
  onSwipe: (direction: 'left' | 'right', source: 'manual' | 'voice' | 'quiz') => void;
  revealed?: boolean;   // Controlled reveal state
  onReveal?: () => void;
}
```

---

#### **EnergyBar.tsx**
Energy display at top of screen.

**Features:**
- Progress bar (0-30)
- Color gradient (green → yellow → red)
- Pulse animation when low (<5)
- Tooltip: "Resets at midnight"

**Props:**
```typescript
{ energy: number; maxEnergy: number }
```

---

#### **OnboardingModal.tsx**
Multi-step tutorial for first-time users.

**Steps:**
1. Welcome to LEXICA
2. How to Swipe
3. Energy System
4. ELO Routing
5. Story Mode teaser
6. Voice Swipe intro

**Props:**
```typescript
{ onComplete: () => void }
```

---

#### **InteractiveTour.tsx**
On-demand guided tour (triggered by "?" button).

**Features:**
- Step-by-step highlights
- Overlay with spotlight effect
- "Next" / "Skip" buttons
- 8 tour steps covering main UI

**Props:**
```typescript
{ steps: TourStep[]; onComplete: () => void }
```

---

### 4.2. Story Components

#### **StoryMode.tsx**
Story reading interface.

**Features:**
- Title + teaser header
- Story content with highlighted vocab
- Scroll indicator
- Comprehension quiz (3-5 questions)
- ORATIO CTA at end
- Mark as read on close

**Props:**
```typescript
{
  storyId: string;
  part: 'part1' | 'part2' | 'full';
  onClose: () => void;
  onFinish: () => void;
}
```

---

#### **StoryUnlockModal.tsx**
Celebration modal when story unlocks.

**Features:**
- Confetti animation
- Context-specific message (Part 1 vs Part 2)
- "Đọc ngay" / "Để sau" buttons

**Props:**
```typescript
{
  storyId: string;
  part: 1 | 2;
  onReadNow: () => void;
  onClose: () => void;
}
```

---

#### **StoryQuizModal.tsx**
Quiz to unlock story early.

**Features:**
- 5 MCQ questions about learned words
- Timer per question
- 4/5 correct to pass
- Pass → Auto-unlock + confetti
- Fail → Cooldown message (1 hour)

**Props:**
```typescript
{
  storyId: string;
  part: 1 | 2;
  onPass: () => void;
  onFail: () => void;
  onClose: () => void;
}
```

---

#### **StoryComprehensionQuiz.tsx**
Post-reading comprehension quiz.

**Features:**
- 3-5 questions testing story understanding
- MCQ format
- Must pass (60%+) to mark story as read
- Retry on fail

**Props:**
```typescript
{
  questions: ComprehensionQuestion[];
  onPass: () => void;
  onFail: () => void;
}
```

---

### 4.3. Lab Components (Upgrade Modules)

#### **UpgradeLab.tsx**
Academic vocabulary upgrade suggestions.

**Concept:** Transform casual English → Academic English.

**Features:**
- Simple sentence with target slot
- 3 academic alternatives
- Each with nuance explanation & formality score
- Examples:
  - "possible to do" → "feasible" (8/10) / "viable" (9/10)

**Props:**
```typescript
{
  upgradeModule: UpgradeModule;
  word: string;
  onClose: () => void;
}
```

---

#### **SurgeryLab.tsx**
Etymology breakdown (Prefix + Root + Suffix).

**Features:**
- Visual word dissection
- Each part with meaning + related words
- Example: METICULOUS = met- (fear) + -ous (quality)
- Related words clickable (show definition)

**Props:**
```typescript
{
  surgeryModule: SurgeryModule;
  word: string;
  onClose: () => void;
}
```

---

### 4.4. Game Components

#### **GameHub.tsx**
Modal launcher for vocabulary games.

**Games (7 total):**

1. **Memory Match:** Flip cards to match word + meaning
2. **Speed Quiz:** Fast-paced MCQ (30 seconds)
3. **Type Challenge:** Type the word correctly (audio + meaning)
4. **Word Scramble:** Unscramble letters to form word
5. **True/False Blitz:** Quick true/false statements
6. **Word Bingo:** 5x5 bingo grid with vocab
7. **Combo Chain:** Sequential word-meaning matching

**Props:**
```typescript
{
  learnedWords: Set<string>;
  onClose: () => void;
}
```

**Individual Game Components:**
- `MemoryMatch.tsx`
- `SpeedQuiz.tsx`
- `TypeChallenge.tsx`
- `WordScramble.tsx`
- `TrueFalseBlitz.tsx`
- `WordBingo.tsx`
- `ComboChain.tsx`

---

### 4.5. Chart Components

#### **ActivityHeatmap.tsx**
GitHub-style contribution graph.

**Features:**
- 30-day grid
- Color intensity based on swipe count
- Tooltip on hover (date + swipes)
- Current day highlighted

**Props:**
```typescript
{
  studyHistory: Record<string, StudyHistoryEntry>;
  period: 'week' | 'month' | 'all';
}
```

---

#### **ELOChart.tsx**
Line chart of ELO progression.

**Features:**
- X-axis: Date
- Y-axis: ELO (800-1500)
- Smooth curve
- Current ELO marker
- Highest ELO marker

**Props:**
```typescript
{
  studyHistory: Record<string, StudyHistoryEntry>;
  currentElo: number;
  highestElo: number;
}
```

---

#### **AccuracyChart.tsx**
Bar chart of accuracy over time.

**Features:**
- Weekly accuracy %
- Color gradient (red → green)
- Average line overlay

**Props:**
```typescript
{
  studyHistory: Record<string, StudyHistoryEntry>;
  period: 'week' | 'month' | 'all';
}
```

---

#### **CardStatesPieChart.tsx**
Distribution of card states.

**Features:**
- 3 segments: Seed, Sprout, Gold
- Percentages
- Color-coded (slate, cyan, amber)

**Props:**
```typescript
{
  cardProgress: Record<string, UserCardProgress>;
}
```

---

### 4.6. Other UI Components

#### **SRSCalendar.tsx**
Spaced Repetition calendar heatmap.

**Features:**
- 30-day view
- Show review schedule
- Due today highlighted in amber
- Upcoming reviews in cyan

**Props:**
```typescript
{ cardProgress: Record<string, UserCardProgress> }
```

---

#### **LearnedWordsList.tsx**
Expandable list of learned words.

**Features:**
- Search/filter
- Group by state (Seed/Sprout/Gold)
- Each word shows: Word, IPA, Meaning, State badge
- Click to expand → Show full scenario

**Props:**
```typescript
{
  learnedWords: Set<string>;
  cardProgress: Record<string, UserCardProgress>;
}
```

---

#### **LearnedWordsCounter.tsx**
Animated counter for learned words.

**Features:**
- CountUp animation
- Suffix: "words learned"
- Color pulse on increment

**Props:**
```typescript
{ count: number }
```

---

#### **CortexWidget.tsx**
Cortex Hub integration reminder.

**Features:**
- "Connect to Cortex" CTA
- Appears every 25 words learned
- Dismissable (24h cooldown)
- Deep link to Cortex Hub registration

**Props:**
```typescript
{
  learnedCount: number;
  onDismiss: () => void;
  onConnect: () => void;
}
```

---

#### **ErrorBoundary.tsx**
React error boundary for graceful error handling.

**Features:**
- Catch component errors
- Show fallback UI
- "Reload" button
- Error logging (console)

---

#### **InstallPWAPrompt.tsx**
Native-like PWA install prompt.

**Features:**
- Detect browser (iOS Safari, Android Chrome, Desktop)
- Custom install button
- Instructions per platform
- Auto-hide after install

---

## 5. DATA MODELS & STORE

### 5.1. Zustand Store Structure

**File:** `app/store/lexicaStore.ts`

```typescript
interface LexicaStore {
  // User Stats
  userStats: UserStats;
  cardProgress: Record<string, UserCardProgress>;
  learnedWords: Set<string>;
  todayLearnedWords: Set<string>;
  
  // Energy System
  energy: number;
  maxEnergy: number;
  lastEnergyReset: number;
  
  // Deck
  currentDeck: VocabCardData[];
  
  // Level
  selectedLevel: DifficultyLevel | 'all' | null;
  
  // Test Flow
  hasSeenWelcome: boolean;
  isInTest: boolean;
  testScore: number | null;
  recommendedLevel: DifficultyLevel | null;
  
  // Story Mode
  unlockedStories: string[];
  unlockedStoryPart1: string[];
  readStories: string[];
  readStoryPart1: string[];
  storyQuizAttempts: Record<string, {
    part1Passed?: boolean;
    part1LastAttempt?: number;
    part2Passed?: boolean;
    part2LastAttempt?: number;
  }>;
  
  // Streak
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  
  // Analytics
  highestElo: number;
  studyHistory: Record<string, StudyHistoryEntry>;
  
  // Settings
  hasSeenOnboarding: boolean;
  swipeMode: 'touch' | 'voice';
  soundEnabled: boolean;
  autoReviewInDeck: boolean;
  
  // Actions
  swipeCard: (cardId: string, direction: 'left' | 'right') => void;
  consumeEnergy: () => boolean;
  checkAndResetEnergy: () => void;
  loadNewDeck: () => void;
  resetProgress: () => void;
  setSelectedLevel: (level: DifficultyLevel | 'all' | null) => void;
  startTest: () => void;
  skipToManual: () => void;
  completeTest: (score: number, level: DifficultyLevel, calibratedElo?: number) => void;
  acceptRecommendedLevel: () => void;
  checkStoryUnlock: () => void;
  unlockStoryPart1: (storyId: string) => void;
  unlockStoryPart2: (storyId: string) => void;
  markStoryAsRead: (storyId: string, part: 'part1' | 'full') => void;
  submitStoryQuiz: (storyId: string, part: 1 | 2, score: number) => void;
  submitReviewAnswer: (cardId: string, correct: boolean) => void;
  markAsMastered: (cardId: string) => void;
  completeOnboarding: () => void;
  setSwipeMode: (mode: 'touch' | 'voice') => void;
  toggleSound: () => void;
  toggleAutoReview: () => void;
  syncAllToCortex: () => Promise<void>;
  getLearnedWordsCount: () => number;
  getLearnedWordsList: () => string[];
  getMasteredWordsCount: () => number;
  getStudyStats: () => { ... };
}
```

---

### 5.2. Persistence

**Storage:** localStorage (via Zustand persist middleware)

**Key:** `lexica-store`

**Persisted Data:**
- All store state (except transient UI states)
- Auto-save on every state change
- Hydrates on app mount

**Migration:**
- Version checking for breaking changes
- Fallback to default state if corrupted

---

### 5.3. Data Files

#### **app/data/vocabCards.ts**
- Contains `VOCAB_DATABASE` array (95 words)
- Each word with full metadata (see section 3.8)

#### **app/data/stories.ts**
- Contains `STORIES` array (3 stories currently)
- Helper functions:
  - `getStoryLearnedCount(story, learnedWordIds)`
  - `isStoryPreviewVisible(...)`
  - `canUnlockPart1Naturally(...)`
  - `canTakePart1Quiz(...)`
  - `isStoryPart1Unlocked(...)`
  - `canUnlockPart2Naturally(...)`
  - `canTakePart2Quiz(...)`
  - `isStoryPart2Unlocked(...)`

---

## 6. GAME MODES

### 6.1. Memory Match
**Type:** Flip-card matching game

**Rules:**
- 12 cards (6 pairs: word + meaning)
- Flip 2 cards per turn
- Match → Cards stay flipped
- Mismatch → Cards flip back
- Complete all pairs to win

**Scoring:**
- Moves count
- Time taken
- Par: 20 moves, 2 minutes

---

### 6.2. Speed Quiz
**Type:** Rapid-fire MCQ

**Rules:**
- 10 questions
- 5 seconds per question
- Word → Meaning or Meaning → Word
- Score based on correct answers

**Scoring:**
- 1 point per correct
- Bonus for speed (answer in <3s)

---

### 6.3. Type Challenge
**Type:** Typing practice

**Rules:**
- Hear word (Web Speech Synthesis)
- See meaning
- Type word correctly
- 10 words total

**Scoring:**
- Accuracy (typos penalized)
- Speed (WPM calculated)

---

### 6.4. Word Scramble
**Type:** Unscramble letters

**Rules:**
- Scrambled letters shown
- Meaning as hint
- Type correct word
- 8 words total

**Scoring:**
- Time per word
- Hints used (penalty)

---

### 6.5. True/False Blitz
**Type:** Quick judgment

**Rules:**
- Statement shown (e.g., "ABUNDANT means scarce")
- True or False?
- 15 statements total
- 3 seconds each

**Scoring:**
- Correct answers
- Streak bonus

---

### 6.6. Word Bingo
**Type:** Bingo game

**Rules:**
- 5x5 grid with learned words
- Meanings called out
- Mark matching word
- First to complete row/column/diagonal wins

**Scoring:**
- Speed to complete line
- Multiple lines = higher score

---

### 6.7. Combo Chain
**Type:** Sequential matching

**Rules:**
- Match word → meaning in sequence
- 3-second timer per match
- Combo multiplier for streak
- Ends on wrong match or timeout

**Scoring:**
- Chain length × combo multiplier
- Bonus for perfect chain

---

## 7. ALGORITHMS & SYSTEMS

### 7.1. ELO Algorithm Details

**File:** `lib/eloAlgorithm.ts`

**Core Functions:**

#### `calculateStruggleRate(recentSwipes: SwipeHistory[]): number`
- Returns % of LEFT swipes (0-100)
- Used to determine if user is struggling

#### `getAdaptiveEloRange(userElo: number, struggleRate: number): [number, number]`
- Returns [minElo, maxElo] for card selection
- Adjusts based on struggle rate (see section 3.2)

#### `selectNextCard(userStats, availableCards, selectedLevel?): VocabCardData | null`
- Filters by level (if specified)
- Excludes last 20 seen cards
- Filters by adaptive ELO range
- Weighted random selection (closer to user ELO = higher weight)

#### `generateInitialDeck(userStats, cardProgress, selectedLevel?, forcedCardIds?, shouldInjectReview?): VocabCardData[]`
- Creates deck of 10 cards
- Priority:
  1. Forced cards (story catch-up)
  2. Due review cards (if autoReview enabled)
  3. New cards (via ELO routing)
- Injects review cards up to 40% of deck

#### `recordSwipe(userStats, cardId, direction): UserStats`
- Updates `recentSwipes` (keep last 10)
- Updates `seenCardIds` (keep last 20)
- Increments counters (correctSwipes/wrongSwipes)
- (Future: Update user ELO)

#### `updateCardProgress(cardProgress, cardId, direction): UserCardProgress`
- Transitions state (Seed → Sprout → Gold)
- Updates review schedule (SRS intervals)
- Tracks review/wrong counts

#### `getDueCards(cardProgress): string[]`
- Returns array of card IDs due for review
- Due = `nextReviewAt <= now`

#### `getProgressStats(cardProgress): { dueToday, upcoming, mastered }`
- Aggregate stats about card progress
- Used for calendar and review prompts

---

### 7.2. Story Unlock Algorithm

**File:** `app/data/stories.ts`

**Unlock Logic:**

```typescript
// Part 1 Natural Unlock
canUnlockPart1Naturally(story, learnedWordIds) {
  return getStoryLearnedCount(story, learnedWordIds) >= 4;
}

// Part 1 Quiz Eligibility
canTakePart1Quiz(story, learnedWordIds) {
  return getStoryLearnedCount(story, learnedWordIds) >= 3
    && !storyQuizAttempts[story.id]?.part1Passed
    && (now - lastAttempt) > 1 hour;
}

// Part 2 Natural Unlock
canUnlockPart2Naturally(story, learnedWordIds) {
  return getStoryLearnedCount(story, learnedWordIds) >= 7;
}

// Part 2 Quiz Eligibility
canTakePart2Quiz(story, learnedWordIds) {
  return getStoryLearnedCount(story, learnedWordIds) >= 5
    && isStoryPart1Unlocked(...)
    && !storyQuizAttempts[story.id]?.part2Passed
    && (now - lastAttempt) > 1 hour;
}
```

**Auto-Unlock Check:**
- Runs after every swipe RIGHT
- Checks all stories for natural unlock conditions
- Auto-unlocks + shows modal if conditions met

---

### 7.3. Spaced Repetition Algorithm

**Intervals (milliseconds):**
```typescript
const SRS_INTERVALS = [
  8 * 3600 * 1000,      // 8 hours (1st review)
  24 * 3600 * 1000,     // 1 day (2nd review)
  3 * 24 * 3600 * 1000, // 3 days
  7 * 24 * 3600 * 1000, // 7 days
  14 * 24 * 3600 * 1000,// 14 days
  30 * 24 * 3600 * 1000 // 30 days
];
```

**Review Logic:**
```typescript
if (correct) {
  reviewCount++;
  interval = SRS_INTERVALS[Math.min(reviewCount, SRS_INTERVALS.length - 1)];
  nextReviewAt = now + interval;
} else {
  reviewCount = 0;
  nextReviewAt = now + SRS_INTERVALS[0]; // Reset to 8 hours
}
```

---

### 7.4. Streak Algorithm

**Update Logic:**
```typescript
function updateStreak(lastActivityDate: string | null, currentStreak: number): number {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  
  if (lastActivityDate === today) {
    // Same day, maintain streak
    return currentStreak;
  } else if (lastActivityDate === yesterday) {
    // Consecutive day, increment
    return currentStreak + 1;
  } else {
    // Missed day(s), reset
    return 1;
  }
}
```

**Tracked in:** `lexicaStore.currentStreak`

**Updated on:** First swipe of the day

---

### 7.5. Energy Reset Algorithm

**Check on app mount:**
```typescript
function checkAndResetEnergy() {
  const lastReset = store.lastEnergyReset;
  const currentMidnight = getMidnightTimestamp();
  
  if (lastReset < currentMidnight) {
    // New day detected
    store.energy = store.maxEnergy; // Reset to 30
    store.lastEnergyReset = currentMidnight;
    
    // Also reset today's learned words
    store.todayLearnedWords.clear();
  }
}
```

**Midnight Calculation:**
```typescript
function getMidnightTimestamp(): number {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0, 0, 0
  );
  return midnight.getTime();
}
```

---

## 8. PWA & TECHNICAL FEATURES

### 8.1. PWA Configuration

**Manifest:** `/public/manifest.json`

```json
{
  "name": "LEXICA - IELTS Vocabulary",
  "short_name": "LEXICA",
  "description": "Master IELTS vocabulary through swipe-based micro-learning",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

**Metadata (layout.tsx):**
```typescript
export const metadata: Metadata = {
  title: "LEXICA - IELTS Vocabulary Swiper",
  description: "Master IELTS vocabulary through addictive swipe-based micro-learning",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LEXICA",
  },
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};
```

---

### 8.2. Touch Gestures

**CSS Optimizations:**
```css
/* Prevent default browser gestures */
.swipe-container {
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

/* Smooth animations */
* {
  -webkit-tap-highlight-color: transparent;
}
```

**Framer Motion Drag:**
```typescript
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.7}
  onDragEnd={(event, info) => {
    const threshold = 150;
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      handleSwipe(direction);
    }
  }}
>
```

---

### 8.3. Web Speech API

**Speech Recognition (Voice Swipe):**
```typescript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = false;
recognition.interimResults = false;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript.toLowerCase();
  const targetWord = card.word.toLowerCase();
  
  if (transcript.includes(targetWord)) {
    handleVocalHit(); // Correct pronunciation
  } else {
    handleVocalMiss(); // Wrong pronunciation
  }
};

recognition.start();
```

**Speech Synthesis (Game audio):**
```typescript
const utterance = new SpeechSynthesisUtterance(word);
utterance.lang = 'en-US';
utterance.rate = 0.9;
speechSynthesis.speak(utterance);
```

---

### 8.4. Analytics

**File:** `lib/analytics.ts`

**Events Tracked:**
- `swipe` (direction, cardId, source, word)
- `story_unlock` (storyId, part)
- `story_read` (storyId, part, timeSpent)
- `story_quiz_attempt` (storyId, part, score, passed)
- `review_session_complete` (score, duration)
- `game_played` (gameType, score, duration)
- `level_test_complete` (score, recommendedLevel)
- `energy_depleted` (time, learnedToday)
- `cortex_connect` (learnedCount)

**Implementation:**
```typescript
export const analytics = {
  swipe: (direction, cardId, source, word) => {
    // Send to analytics service (future: GA4, Mixpanel, etc.)
    console.log('[Analytics] Swipe:', { direction, cardId, source, word });
  },
  // ... other events
};
```

---

### 8.5. Performance Optimizations

**Image Loading:**
- SVG icons (lightweight, scalable)
- Lazy loading for charts (Suspense)

**Code Splitting:**
- Route-based splitting (Next.js automatic)
- Dynamic imports for modals:
  ```typescript
  const GameHub = dynamic(() => import('./components/GameHub'));
  ```

**Memoization:**
- React.memo for expensive components (Charts)
- useMemo for computed values (story eligibility)
- useCallback for event handlers

**Animations:**
- Hardware-accelerated (transform, opacity only)
- Reduce motion support:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; }
  }
  ```

---

### 8.6. Accessibility

**Keyboard Navigation:**
- Arrow keys for swipe (Left/Right)
- Space to reveal card
- Tab navigation for buttons
- Enter to confirm

**Screen Reader:**
- Semantic HTML (nav, main, section)
- ARIA labels on interactive elements
- Alt text for icons

**Focus Management:**
- Visible focus outlines
- Focus trap in modals
- Auto-focus on modal open

---

### 8.7. Error Handling

**ErrorBoundary:**
- Catches React component errors
- Shows fallback UI
- Logs to console (future: Sentry)

**API Fallbacks:**
- Web Speech API not supported → Show warning
- localStorage blocked → Use sessionStorage fallback
- Network error → Offline mode with cached data

---

### 8.8. Security

**Data Storage:**
- No sensitive data stored
- localStorage only (no cookies)
- No external API calls (except Cortex sync)

**XSS Prevention:**
- React auto-escapes all text
- No `dangerouslySetInnerHTML` used
- CSP headers (Vercel default)

---

## 9. CORTEX HUB INTEGRATION

### 9.1. Purpose
LEXICA là "Funnel App" để dẫn user sang CORTEX HUB (sản phẩm chính).

### 9.2. Integration Points

**1. Story Mode CTA:**
- Xuất hiện cuối mỗi story
- Message: "Vocabulary is dead until spoken. Debate this on ORATIO →"
- Deep link: `https://oratio.cortex.com/?source=lexica&story=${storyId}`

**2. Cortex Reminder Modal:**
- Xuất hiện mỗi 25 từ học được
- Nếu chưa connect Cortex account
- CTA: "Connect to Cortex Hub to sync progress"
- Deep link: `https://cortex.com/register?source=lexica`

**3. Data Sync (Future):**
```typescript
async syncAllToCortex() {
  const userId = localStorage.getItem('cortex_user_id');
  if (!userId) return;
  
  const payload = {
    userId,
    learnedWords: Array.from(this.learnedWords),
    userStats: this.userStats,
    cardProgress: this.cardProgress,
  };
  
  await fetch('https://api.cortex.com/v1/lexica/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
```

---

## 10. DEPLOYMENT & ENVIRONMENT

### 10.1. Vercel Deployment

**Config:** `vercel.json`
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "rewrites": [
    { "source": "/manifest.json", "destination": "/api/manifest" }
  ]
}
```

**Environment Variables:**
- `NEXT_PUBLIC_CORTEX_API_URL` (for sync)
- `NEXT_PUBLIC_ANALYTICS_ID` (GA4)

---

### 10.2. Development Scripts

**package.json:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 11. FUTURE ROADMAP

### 11.1. Phase 2 Features (Planned)
- [ ] Multiplayer quiz battles (real-time)
- [ ] Leaderboards (ELO-based)
- [ ] Achievement system (badges)
- [ ] Custom deck creation (user-generated cards)
- [ ] Export progress to PDF (certificate)
- [ ] Dark/Light mode toggle
- [ ] Multi-language UI (Vietnamese, Thai, Japanese)

### 11.2. Phase 3 Features (Long-term)
- [ ] AI-generated stories (dynamic content)
- [ ] Voice recording & pronunciation feedback
- [ ] Offline mode with Service Worker
- [ ] Premium tier (unlimited energy, exclusive stories)
- [ ] Social sharing (progress snapshots)
- [ ] Integration with IELTS test prep platforms

---

## 12. KNOWN ISSUES & LIMITATIONS

### 12.1. Current Limitations
- **Voice Swipe:** iOS Safari requires user gesture to start speech recognition
- **Energy System:** No server-side validation (client-side only, can be hacked)
- **Story Content:** Only 3 stories available (need 20+ for full experience)
- **ELO Adjustment:** User ELO is static (doesn't change based on performance yet)
- **Offline Mode:** Not fully functional (no Service Worker)

### 12.2. Browser Compatibility
- **Chrome/Edge:** ✅ Full support
- **Safari (iOS):** ⚠️ Partial (voice swipe needs manual trigger)
- **Firefox:** ✅ Full support (except Web Speech API)
- **Opera:** ✅ Full support

---

## 13. GLOSSARY

**ELO:** Rating system (800-1500) for vocabulary difficulty  
**Seed:** First mastery state (newly learned)  
**Sprout:** Second mastery state (consolidated)  
**Gold:** Final mastery state (mastered via voice)  
**SRS:** Spaced Repetition System  
**POV:** Point of View (first-person scenarios)  
**Funnel App:** App designed to drive traffic to another product  
**PWA:** Progressive Web App  
**DifficultyLevel:** One of: beginner, intermediate, advanced, expert  

---

## 14. CONTACT & SUPPORT

**Developer:** ORATIO Team  
**GitHub:** [Repo Link]  
**Support Email:** support@oratio.com  
**Discord:** [Community Link]  

---

**END OF DOCUMENTATION**

*Tài liệu này được tạo tự động và cập nhật thường xuyên. Vui lòng kiểm tra version mới nhất.*
