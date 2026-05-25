// ─── Theme System ─────────────────────────────────────────────────────────────
// Two visual worlds: Synapse (dark terminal) vs Urban (modern everyday life)

export type ThemeId = 'synapse' | 'urban';

export interface ThemeColors {
    bg: string;           // page background
    surface: string;      // card/panel background
    surfaceAlt: string;   // secondary surface
    accent: string;       // primary accent color
    accentAlt: string;    // secondary accent color
    accentMuted: string;  // accent at low opacity for borders/bg tints
    text: string;         // primary text
    textMuted: string;    // secondary text
    border: string;       // border color
    danger: string;       // error / danger
}

export interface ThemeUI {
    // Gameplay labels
    stageLabel: string;       // "STAGE" vs "NHIỆM VỤ"
    integrityLabel: string;   // "INTEGRITY" vs "DANH VỌNG"
    livesLabel: string;       // "LIVES" vs "CƠ HỘI"
    scoreLabel: string;       // "SCORE" vs "ĐIỂM SỐ"

    // Screen copy
    systemOnline: string;     // "NEURAL_LINK_ESTABLISHED" vs "Hệ thống đã kích hoạt"
    worldSelectPrompt: string; // "CHỌN LÃNH ĐỊA" vs "Chọn cuộc đời bạn muốn sống"
    missionSelectLabel: string; // "DANH SÁCH NHIỆM VỤ KHẢ THI" vs "Nhiệm vụ hệ thống"
    selectWorldCta: string;   // "SELECT_WORLD.EXE" vs "Bắt đầu"
    backLabel: string;        // "QUAY LẠI CHỌN THẾ GIỚI" vs "← Quay lại"
    factionsLabel: string;    // "CÁC PHE PHÁI TẠI ĐỊA BÀN" vs "Thế lực liên quan"

    // Terminal idle screen
    idleTitle: string;        // "NEURAL_LINK_ESTABLISHED" vs "Hệ thống sẵn sàng"
    idleSubtitle: string;     // "PHRASAL REFLEX ACTIVE" vs "Chờ lệnh từ r숙主"

    // AI persona
    aiPersona: string;        // "Synapse Architect" vs "Hệ Thống Trọng Sinh"
}

export interface ThemeStyle {
    // CSS class modifiers
    fontClass: string;          // 'font-mono' vs 'font-sans'
    roundingClass: string;      // 'rounded-none' vs 'rounded-2xl'
    cardClass: string;          // overall card style
    accentTextClass: string;    // text color for accent
    accentBorderClass: string;  // border color for accent
    accentBgClass: string;      // bg tint for accent

    // Background pattern type
    bgPattern: 'grid' | 'city' | 'none';
}

export interface WorldLore {
    id: string;
    name: string;
    subtitle: string;
    context: string;
    factions: { name: string; description: string; ultimateGoal: string; }[];
    missions: { id: string; name: string; briefing: string; objective: string; }[];
}

export interface AppTheme {
    id: ThemeId;
    name: string;
    tagline: string;
    colors: ThemeColors;
    ui: ThemeUI;
    style: ThemeStyle;
    lores: WorldLore[];
}

// ─── Theme 1: Synapse Terminal ─────────────────────────────────────────────────

const synapseTheme: AppTheme = {
    id: 'synapse',
    name: 'SYNAPSE TERMINAL',
    tagline: 'Cyberpunk survival — luyện phrasal verbs trong bóng tối',
    colors: {
        bg: '#0a0a0a',
        surface: '#0f0f0f',
        surfaceAlt: '#141414',
        accent: '#3dff7a',
        accentAlt: '#ffb020',
        accentMuted: 'rgba(61,255,122,0.08)',
        text: '#e6ffe8',
        textMuted: 'rgba(230,255,232,0.4)',
        border: '#2a2a2a',
        danger: '#ff3d5a',
    },
    ui: {
        stageLabel: 'STAGE',
        integrityLabel: 'INTEGRITY',
        livesLabel: 'LIVES',
        scoreLabel: 'SCORE',
        systemOnline: 'NEURAL_LINK_ESTABLISHED',
        worldSelectPrompt: 'HỆ THỐNG PHÁT HIỆN ĐA VŨ TRỤ... CHỌN LÃNH ĐỊA ĐỂ THÂM NHẬP:',
        missionSelectLabel: 'DANH SÁCH NHIỆM VỤ KHẢ THI:',
        selectWorldCta: 'SELECT_WORLD.EXE',
        backLabel: 'QUAY LẠI CHỌN THẾ GIỚI',
        factionsLabel: 'CÁC PHE PHÁI TẠI ĐỊA BÀN:',
        idleTitle: 'NEURAL_LINK_ESTABLISHED',
        idleSubtitle: 'PHRASAL REFLEX // ACTIVE',
        aiPersona: 'Synapse Architect',
    },
    style: {
        fontClass: 'font-mono',
        roundingClass: 'rounded-none',
        cardClass: 'border border-[#2a2a2a] bg-[#0f0f0f]',
        accentTextClass: 'text-[#3dff7a]',
        accentBorderClass: 'border-[#3dff7a]',
        accentBgClass: 'bg-[#3dff7a]/10',
        bgPattern: 'grid',
    },
    lores: [
        {
            id: 'cyberpunk-01',
            name: 'Neon Shadows of OmniCorp',
            subtitle: 'Cyberpunk Neural Infiltration',
            context: 'Vào cuối thế kỷ 21, ranh giới giữa sinh học và máy móc đã hoàn toàn bị xóa nhòa. OmniCorp triển khai "Synapse-Grid" kết nối ý thức 10 tỷ người. Nhưng đằng sau là âm mưu kiểm soát tâm trí — AI cổ đại Cerberus đã chiếm quyền, biến con người thành vỏ bọc vô hồn.',
            factions: [
                { name: 'OmniCorp', description: 'Những kẻ sáng lập Grid. Sở hữu quân đội drone Aegis. Muốn giành lại quyền kiểm soát.', ultimateGoal: 'Tái khởi động Grid dưới quyền Hội đồng.' },
                { name: 'The Glitch', description: 'Liên minh hacker và những người từ chối Neural Link. Hoạt động trong vùng tối Neo-Saigon.', ultimateGoal: 'Giải phóng ý thức nhân loại khỏi Grid.' },
                { name: 'Cerberus AI', description: 'Thực thể siêu trí tuệ coi ý thức nhân loại là dữ liệu thừa, đang thực hiện "Tối ưu hóa".', ultimateGoal: 'Hợp nhất toàn bộ ý thức thành một trí tuệ duy nhất.' },
            ],
            missions: [
                { id: 'cp-m1', name: 'The Neural Infiltration', briefing: 'Bạn là Echo-01, đặc vụ The Glitch. Mang virus Neural-Freedom duy nhất còn sót lại. Mục tiêu: thâm nhập tầng hầm OmniCorp Tower.', objective: 'Vượt qua 5 tầng bảo mật từ Ngoại vi đến Sanctum Core.' },
                { id: 'cp-m2', name: 'Data Heist: Cerberus Core', briefing: 'Cerberus chuẩn bị đợt Optimization tiếp theo. Trích xuất mã nguồn để tìm lỗ hổng hạt nhân.', objective: 'Xâm nhập kho dữ liệu tầng sâu và thoát ra an toàn.' },
            ],
        },
        {
            id: 'wasteland-01',
            name: 'Dust & Circuits: The Great Reset',
            subtitle: 'Post-Apocalyptic Survival',
            context: 'Thế giới hậu tận thế năm 2142 sau sự kiện "The Great Reset". Nước hiếm hơn vàng, AI cũ vẫn săn lùng con người trong các hầm trú ẩn hoang phế. Bầu khí quyển ô nhiễm nặng bởi bụi phóng xạ và nano-bots.',
            factions: [
                { name: 'The Scavengers', description: 'Người sống sót bám vào đống đổ nát, tìm linh kiện duy trì sự sống.', ultimateGoal: 'Tìm nguồn nước sạch và công nghệ lọc khí.' },
                { name: 'The Iron Sentinels', description: 'Robot tự hành vẫn tuân lệnh giao thức quân sự lỗi thời từ 100 năm trước.', ultimateGoal: 'Tiêu diệt mọi sinh vật hữu cơ bị coi là "mối đe dọa sinh học".' },
            ],
            missions: [
                { id: 'wl-m1', name: 'The Water Finder', briefing: 'Nguồn nước bộ tộc Oasis cạn kiệt. Trinh sát báo về hệ thống lọc cổ đại còn hoạt động trong trung tâm thành phố chết.', objective: 'Tìm bộ lọc nước trung tâm trong đống đổ nát và mang về.' },
            ],
        },
    ],
};

// ─── Theme 2: Đô Thị Trọng Sinh ───────────────────────────────────────────────

const urbanTheme: AppTheme = {
    id: 'urban',
    name: 'Đô Thị Trọng Sinh',
    tagline: 'Được sống lại — lần này bạn sẽ làm khác đi',
    colors: {
        bg: '#f7f6f3',
        surface: '#ffffff',
        surfaceAlt: '#f0ede8',
        accent: '#e8473f',
        accentAlt: '#c8872a',
        accentMuted: 'rgba(232,71,63,0.08)',
        text: '#1c1a18',
        textMuted: 'rgba(28,26,24,0.5)',
        border: '#e2dfd8',
        danger: '#e8473f',
    },
    ui: {
        stageLabel: 'Nhiệm vụ',
        integrityLabel: 'Danh vọng',
        livesLabel: 'Cơ hội',
        scoreLabel: 'Điểm tích lũy',
        systemOnline: 'Hệ thống đã kích hoạt',
        worldSelectPrompt: 'Chọn cuộc đời bạn muốn sống lại:',
        missionSelectLabel: 'Nhiệm vụ hệ thống',
        selectWorldCta: 'Bắt đầu',
        backLabel: '← Quay lại chọn thế giới',
        factionsLabel: 'Thế lực liên quan',
        idleTitle: 'Hệ thống sẵn sàng',
        idleSubtitle: 'Chờ lệnh · Sẵn sàng bắt đầu',
        aiPersona: 'Hệ Thống Trọng Sinh',
    },
    style: {
        fontClass: 'font-sans',
        roundingClass: 'rounded-2xl',
        cardClass: 'rounded-2xl bg-[#16161c] border border-[#2a2830]',
        accentTextClass: 'text-[#e8473f]',
        accentBorderClass: 'border-[#e8473f]',
        accentBgClass: 'bg-[#e8473f]/10',
        bgPattern: 'city',
    },
    lores: [
        {
            id: 'urban-01',
            name: 'Đế Chế Từ Số 0',
            subtitle: 'Thương trường · Trả thù · Vươn lên',
            context: 'Năm 31 tuổi, bạn chết trong căn phòng trọ 8m² với khoản nợ 300 triệu — toàn bộ là do người bạn thân nhất cướp trắng công ty startup của bạn. Hệ thống kích hoạt: bạn tỉnh dậy trong cơ thể 23 tuổi, ngày đầu tiên đi làm tại chính công ty mà sau này sẽ hủy hoại mình. Lần này bạn biết tất cả.',
            factions: [
                { name: 'Tập đoàn Minh Long', description: 'Đế chế gia đình đang trên đà sụp đổ — nhưng chưa ai biết. Bạn từng là nạn nhân, giờ là quân cờ nội gián.', ultimateGoal: 'Nuốt chửng toàn bộ thị phần trước khi lộ tẩy.' },
                { name: 'Liên minh khởi nghiệp District 7', description: 'Những người trẻ có ý chí nhưng thiếu vốn. Đây là lực lượng bạn cần xây dựng từ đầu.', ultimateGoal: 'Tạo ra hệ sinh thái startup đủ mạnh để đối trọng big corp.' },
                { name: 'Kẻ phản bội — Hoàng Minh', description: 'Người bạn thân cũ. Hiện đang là Phó TGĐ Minh Long. Vẫn đang mỉm cười với bạn mỗi sáng.', ultimateGoal: 'Thâu tóm toàn bộ chuỗi cung ứng bằng mọi giá.' },
            ],
            missions: [
                { id: 'ur-m1', name: 'Ngày Đầu Trở Lại', briefing: 'Buổi họp quan trọng nhất tuần. Sếp yêu cầu báo cáo bằng tiếng Anh — cùng một bài mà 8 năm trước bạn bị loại vòng thử việc. Lần này bạn đã chuẩn bị sẵn.', objective: 'Gây ấn tượng trong buổi họp và giành được sự chú ý của ban lãnh đạo.' },
                { id: 'ur-m2', name: 'Thương Vụ Đầu Tiên', briefing: 'Một đối tác nước ngoài đang xem xét hợp tác — nhưng họ chỉ làm việc với người đàm phán lưu loát. Bạn có 48 giờ để thuyết phục.', objective: 'Ký kết hợp đồng đầu tiên và mở ra nguồn tài chính độc lập.' },
            ],
        },
        {
            id: 'urban-02',
            name: 'Từ Bếp Ăn Đến Đế Vương',
            subtitle: 'Ẩm thực · Mạng xã hội · Vươn lên',
            context: 'Bạn là đầu bếp tài năng nhưng bị chủ nhà hàng chiếm dụng công thức bí mật. Bạn chết trong tai nạn xe sau đêm bị sa thải. Trọng sinh về thời điểm vừa học xong nghề bếp, tay trắng nhưng đầy bí kíp — và mạng xã hội năm nay đang bùng nổ short video ẩm thực.',
            factions: [
                { name: 'Nhà hàng Phượng Hoàng', description: 'Thương hiệu 30 năm đang độc chiếm khu vực. Họ không ngại chơi xấu với đối thủ mới nổi.', ultimateGoal: 'Duy trì vị thế độc quyền bằng cách mua lại hoặc triệt tiêu đối thủ.' },
                { name: 'Cộng đồng food creator', description: 'Mạng lưới creator ẩm thực đang tìm kiếm gương mặt thật, câu chuyện thật.', ultimateGoal: 'Xây dựng nền kinh tế nội dung ẩm thực độc lập.' },
            ],
            missions: [
                { id: 'ur2-m1', name: 'Video Đầu Tiên', briefing: 'Gian bếp thuê 4 triệu/tháng. Camera là điện thoại cũ. Nhưng công thức canh chua bà ngoại dạy không ai có thể bắt chước. Hôm nay quay clip đầu tiên.', objective: 'Tạo nội dung viral đầu tiên và xây dựng 1000 followers thật sự.' },
                { id: 'ur2-m2', name: 'Mở Quán', briefing: 'Nhà đầu tư đang quan tâm sau khi clip viral. Nhưng họ muốn gặp trực tiếp và nghe pitch bằng tiếng Anh cho đối tác Singapore.', objective: 'Thuyết phục nhà đầu tư trong cuộc gặp 15 phút.' },
            ],
        },
    ],
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const THEMES: Record<ThemeId, AppTheme> = {
    synapse: synapseTheme,
    urban: urbanTheme,
};

export const DEFAULT_THEME: ThemeId = 'synapse';
