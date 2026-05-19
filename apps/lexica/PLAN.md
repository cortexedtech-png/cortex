SPECIFICATION: LEXICA USER FLOW & PERSONALIZATION UPGRADE

Phiên bản: 1.1 (Cập nhật từ v1.0)
Mục tiêu: Đơn giản hóa User Flow thành luồng tuyến tính (Linear Flow), loại bỏ "ngõ cụt" cuối session và thêm cá nhân hóa trải nghiệm (không dùng AI real-time).

1. TỔNG QUAN KIẾN TRÚC MỚI (THE LINEAR PIPELINE)

Triết lý thay đổi: Từ "Cung cấp Menu" sang "Luồng dẫn dắt 1 chiều".
Người dùng mở app sẽ không phải chọn lựa tính năng, hệ thống sẽ tự động đưa ra màn hình tương ứng với trạng thái hiện tại của họ.

Phân tách Route (Decluttering):

/ (Trang chủ): Chỉ hiển thị Màn hình Entry (Bắt đầu/Tiếp tục) hoặc thẻ SwipeDeck. Các thống kê (Stats) và tùy chọn khác được ẩn vào menu phụ gọn gàng.

/learned: Chỉ dùng làm "Nhà kho". Chứa danh sách các từ đã học, tra cứu từ vựng và Heatmap tiến độ.

/stories (Mới): Tách Story Mode ra khỏi /learned. Nơi chứa danh sách các câu chuyện. Hiển thị thanh tiến trình rõ ràng cho biết cần quẹt thêm bao nhiêu từ để mở khóa chương tiếp theo.

2. CHI TIẾT USER FLOW MỚI

Bước 1: The Smart Entry (Cửa vào thông minh)

Hệ thống tự động quyết định màn hình hiển thị dựa trên dữ liệu từ Zustand store.

Ưu tiên 1: Lần mở app đầu tiên trong ngày (The Daily Slider)

Mô tả: Nếu kiểm tra lastGoalSetDate khác ngày hôm nay, hiển thị màn hình thiết lập mục tiêu.

Giao diện: * Câu chào theo buổi (Ví dụ: "Chào buổi sáng. Hôm nay bạn muốn học bao nhiêu từ?").

Thanh trượt (Slider): Cho phép người dùng chọn số lượng thẻ mục tiêu của ngày hôm nay.

Các mốc Slider: 5 từ, 10 từ, 20 từ, 30 từ (Tối đa là 30).

Nút CTA: "Bắt đầu học".

Ưu tiên 2: Các lần mở app tiếp theo trong ngày
Bỏ qua màn hình Slider, hiển thị nút CTA dựa trên bối cảnh hiện tại:

Nếu có từ đến hạn (Due > 5): Nút CTA ➔ "Ôn tập X từ vựng đến hạn".

Nếu có Story đủ điều kiện unlock: Hiển thị banner Story + Nút CTA ➔ "Đọc câu chuyện mới".

Trạng thái bình thường: Nút CTA ➔ "Tiếp tục học (Còn X từ mục tiêu hôm nay)".

Bước 2: The Core Loop (Trong lúc quẹt thẻ)

Logic: Giữ nguyên cơ chế SwipeDeck và Vocal Swipe.

UI Update: Thêm một Progress Bar nhỏ ở cạnh trên màn hình, phản ánh tiến độ của Mục tiêu hôm nay (ví dụ: đang quẹt thẻ thứ 5/15).

Bước 3: End of Session (Xử lý kết thúc lượt học)

Khi người dùng quẹt hết số từ mục tiêu đã cài đặt (hoặc quẹt hết 30 Energy):

KHÔNG hiển thị nút "Về trang chủ".

Giao diện:

Hiển thị thông báo hoàn thành mục tiêu ngày.

Hiển thị ELO tăng/giảm hoặc số từ mới đã tiếp thu.

Hành động tiếp theo (Next Actions): Chỉ có 2 nút.

Primary Button: "Đọc truyện thực hành" (Dẫn sang /stories).

Secondary Button: "Xem danh sách từ vựng" (Dẫn sang /learned).

3. CÁ NHÂN HÓA NỘI DUNG TĨNH (STATIC PERSONALIZATION)

Áp dụng cá nhân hóa vào câu ví dụ (Scenario) trên thẻ từ vựng dựa trên nhóm người dùng (Archetype), không sử dụng API real-time.

3.1. Cập nhật Màn hình Onboarding (/onboarding)

Thêm 1 step duy nhất để xác định Persona.

Câu hỏi: "Bạn thường sử dụng tiếng Anh trong ngữ cảnh nào nhất?"

Tùy chọn: 1. Sinh viên / Học tập (student)
2. Đi làm / Văn phòng (business)
3. Dân IT / Công nghệ (tech)
4. Đời thường / Giao tiếp cơ bản (casual)

3.2. Cập nhật Model Dữ liệu Từ vựng

Chuyển đổi trường scenario thành một Object chứa các biến thể (Variants).

// Nơi định nghĩa: app/data/vocabCards.ts
export type UserArchetype = 'casual' | 'tech' | 'business' | 'student';

export interface VocabCardData {
  id: string;
  word: string;
  // ... các trường khác giữ nguyên
  
  // MỚI: Ma trận biến thể câu ví dụ
  scenarios: Record<UserArchetype, string>; 
}


Ví dụ dữ liệu tĩnh:

{
  id: "v001",
  word: "ABUNDANT",
  scenarios: {
    casual: "Cuối tháng hết tiền mà mì tôm trong tủ vẫn còn abundant quá...",
    tech: "Tính năng mới vừa deploy, lỗi sinh ra abundant không fix kịp.",
    business: "Khối lượng công việc dự án này abundant đến mức cả team phải OT.",
    student: "Gần thi cuối kỳ, tài liệu cần ôn abundant đến mức không biết bắt đầu từ đâu."
  }
}


3.3. Logic Hiển thị trên VocabCard

Lấy giá trị userArchetype đã lưu trong Zustand Store.

Khi render mặt trước/sau của thẻ, render chuỗi tương ứng:
const displayScenario = card.scenarios[userArchetype] || card.scenarios.casual; (Fallback về casual nếu thiếu data).

4. CHECKLIST KỸ THUẬT CẦN THỰC HIỆN

1. Cập nhật Zustand Store (lexicaStore.ts)

Thêm các state mới sau:

userArchetype: UserArchetype (Lưu từ màn onboarding)

dailyGoal: number (Lưu số lượng thẻ do user chọn ở màn Slider, mặc định 15)

dailyProgress: number (Tiến độ quẹt thẻ trong ngày)

lastGoalSetDate: string (Chuỗi ngày tháng dạng YYYY-MM-DD để check reset Slider mỗi ngày)

Action: setDailyGoal(num), setUserArchetype(type), incrementDailyProgress().

2. Định tuyến (Routing)

Tạo folder/route mới: app/stories/page.tsx.

Di chuyển toàn bộ component liên quan đến Story List từ app/learned/page.tsx sang route mới này.

3. Refactor Component

Xây dựng SmartEntry.tsx: Thay thế nội dung cũ của app/page.tsx. Bao gồm logic hiển thị Slider đầu ngày (dùng <input type="range">) và các nút CTA theo trạng thái.

Sửa VocabCard.tsx: Connect store lấy userArchetype và render lại nội dung scenario.

Sửa SessionSummary.tsx: Xóa nút trang chủ, thêm 2 nút dẫn tới /stories và /learned.

4. Chuẩn bị Data

Cập nhật mảng VOCAB_DATABASE (95 từ): Chuyển đổi dữ liệu từ dạng scenario cũ sang dạng Object scenarios 4 ngữ cảnh.