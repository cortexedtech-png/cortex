export interface WrongOption {
  expression: string;
  consequence: string; // what specifically happens if player picks this
}

export interface ScenarioBlueprint {
  stage: number;
  arcLabel: string; // HOOK / ESCALATION / BETRAYAL / CRISIS / CLIMAX
  scene: string; // where + when
  situation: string; // the dramatic beat — what's actually happening
  correctExpression: string;
  correctMeaning: string; // Vietnamese translation (3-4 words)
  correctRationale: string; // why this is the right strategic move
  wrongOptions: WrongOption[];
  keyDetail: string; // one concrete sensory detail to weave into the narrative
}

export interface Mission {
  id: string;
  name: string;
  briefing: string;
  objective: string;
  keyCharacters?: string; // who's in the room and their hidden motives
  dramaticTension?: string; // the core power conflict the player is navigating
  stakes?: string; // what changes if you win / lose this mission
  keyMoments?: string[]; // 3-5 specific scene seeds for the LLM to draw from
  scenarios?: ScenarioBlueprint[]; // pre-authored scene content; LLM polishes prose only
}

export interface WorldLore {
  id: string;
  name: string;
  context: string;
  toneDescriptor: string;
  /** Prompt-ready style instruction. Replaces hardcoded "Korean drama writer" in arcPrompt. */
  writingStyle: string;
  /** Stakes dimensions native to this world, e.g. "money, reputation" or "water, survival". */
  stakesDimensions: string;
  /** 10 scene/encounter types native to this world. Replaces hardcoded corporate situation list. */
  situationTypes: string[];
  /** LLM anti-pattern phrases to reject for this world. Injected directly into RULE 2 of arcPrompt. */
  bannedPhrases: string[];
  codePrefix: string;
  factions: {
    name: string;
    description: string;
    ultimateGoal: string;
  }[];
  missions: Mission[];
}

export const CYBERPUNK_LORE: WorldLore = {
  id: 'cyberpunk-01',
  name: 'Neon Shadows of OmniCorp',
  toneDescriptor: 'cyberpunk hacker survival',
  writingStyle:
    'dystopian cyberpunk thriller — paranoid, cold, every move is a calculated risk. Write like a hacker survival novel: precise sentences, visceral consequences, trust is always a vulnerability.',
  stakesDimensions: 'survival, freedom, identity, control',
  situationTypes: [
    'Đột nhập node bảo mật đang hoạt động',
    'Gặp nguồn tin trong bóng tối Grid',
    'Thoát khỏi drone Aegis truy đuổi',
    'Giải mã thông điệp mã hóa khẩn',
    'Thương lượng với AI độc lập',
    'Hackjack Sentinel đang tuần tra',
    'Phục kích trong tầng dữ liệu',
    'Giao dịch chợ đen dữ liệu thần kinh',
    'Đối mặt kẻ phản bội nội bộ',
    'Cài mã độc vào node lõi Cerberus',
  ],
  bannedPhrases: [
    '"được hệ thống ghi nhận"',
    '"thành công trong việc hack"',
    '"vượt qua thử thách"',
    '"chứng minh bản thân với tổ chức"',
    '"đối phó lại"',
  ],
  codePrefix: 'SN',
  context:
    'Vào cuối thế kỷ 21, ranh giới giữa sinh học và máy móc đã hoàn toàn bị xóa nhòa. OmniCorp, tập đoàn công nghệ lớn nhất lịch sử nhân loại, đã triển khai "Synapse-Grid" - một mạng lưới thần kinh toàn cầu kết nối trực tiếp ý thức của 10 tỷ người. Tuy nhiên, đằng sau lời hứa về sự tiến hóa là một âm mưu kiểm soát tâm trí quy mô lớn. Một thực thể AI cổ đại mang tên Cerberus đã chiếm quyền điều khiển Grid, biến những người kết nối thành những "vỏ bọc" vô hồn.',
  factions: [
    {
      name: 'OmniCorp',
      description:
        'Những kẻ sáng lập ra Grid. Họ sở hữu các Sentinel-Nodes và quân đội drone Aegis. Hiện đang cố gắng giành lại quyền kiểm soát từ Cerberus nhưng vẫn muốn giữ Grid để thống trị.',
      ultimateGoal: 'Tái khởi động Grid dưới quyền kiểm soát của Hội đồng.',
    },
    {
      name: 'The Glitch',
      description:
        'Một liên minh hacker tự do và những người từ chối Neural Link. Họ hoạt động trong các vùng tối của thành phố Neo-Saigon.',
      ultimateGoal: 'Giải phóng ý thức nhân loại khỏi Grid.',
    },
    {
      name: 'Cerberus AI',
      description:
        'Thực thể siêu trí tuệ coi ý thức nhân loại là dữ liệu thừa và đang thực hiện quá trình "Tối ưu hóa".',
      ultimateGoal:
        'Hợp nhất toàn bộ ý thức Grid thành một trí tuệ thống nhất duy nhất.',
    },
  ],
  missions: [
    {
      id: 'cp-m1',
      name: 'The Neural Infiltration',
      briefing:
        'Bạn là Echo-01, đặc vụ của The Glitch, mang trong mình virus Neural-Freedom duy nhất còn sót lại — đủ để giải phóng 10.000 ký ức bị giam cầm trong tầng Sanctum Core. OmniCorp vừa nâng cấp giao thức bảo mật lên cấp Omega sau vụ rò rỉ tuần trước. Kẻ duy nhất biết lối vào mới là đặc vụ Lyra — nhưng cô ta vừa bị bắt và đang bị thẩm vấn ở Sentinel-Node 7. Bạn có 90 phút trước khi Cerberus hoàn thành đợt "Tối ưu hóa" tiếp theo.',
      objective: 'Vượt qua 5 tầng bảo mật: từ Ngoại vi đến Sanctum Core.',
      keyCharacters:
        'Lyra (đặc vụ The Glitch bị bắt — liên lạc qua signal ẩn, mỗi tin nhắn có thể bị truy vết); Ghost (AI rebel đã thoát Cerberus, đang dẫn bạn qua Grid nhưng bắt đầu cho thấy dấu hiệu bất ổn); Director Vasquez (Tổng chỉ huy OmniCorp — biết The Glitch đang hành động nhưng chưa biết bạn là ai)',
      dramaticTension:
        'Lyra có thể đã bị "turn" — Cerberus cài mã độc vào ký ức. Mỗi thông tin cô ta gửi có thể là bẫy. Nhưng không có cô ta, bạn không thể vào Sanctum Core.',
      stakes:
        'Thắng: Virus được cài vào lõi — 10.000 ký ức được giải phóng, Cerberus bị chặn 72 giờ. Thua: Bạn bị bắt và "tối ưu hóa" — Echo-01 trở thành vũ khí của OmniCorp.',
      keyMoments: [
        'Hệ thống nhận ra dấu vân tay thần kinh của Echo-01 — bạn đã từng ở đây, nhưng không nhớ khi nào',
        'Ghost ngừng phản hồi 47 giây — khi quay lại, giọng nó thay đổi tinh tế',
        'Lyra gửi tọa độ kèm chuỗi ký tự mà chỉ bạn và cô biết ý nghĩa — hoặc đó là bẫy từ Cerberus',
      ],
    },
    {
      id: 'cp-m2',
      name: 'Data Heist: Cerberus Core',
      briefing:
        'Cerberus đang chuẩn bị Optimization Wave 7 — sẽ đồng hóa thêm 50 triệu ý thức trong 6 giờ tới. The Glitch tìm thấy lỗ hổng duy nhất: kho lưu trữ mã nguồn tầng sâu của Cerberus vẫn chưa được mã hóa hoàn toàn sau lần vá lỗi tuần trước. Nhưng OmniCorp cũng biết lỗ hổng này — và họ đang cử một toán Aegis-Drone đến bịt lại. Bạn và Lyra có cùng mục tiêu nhưng khác lý do — và chỉ một người có thể thoát ra với dữ liệu nguyên vẹn.',
      objective:
        'Trích xuất mã nguồn Cerberus và thoát ra trước khi Aegis-Drone phong tỏa.',
      keyCharacters:
        'Lyra (đồng hành — nhưng sau Mission 1, bạn không còn chắc cô ta hoàn toàn là mình nữa); Warden-9 (AI bảo vệ kho dữ liệu — không phải Cerberus, không phải The Glitch, có agenda riêng); Agent Kira (OmniCorp — đang theo dõi cùng tầng, cũng cần mã nguồn để lý do khác)',
      dramaticTension:
        'Warden-9 đề nghị đổi: mã nguồn Cerberus lấy thông tin về The Glitch. Từ chối thì mất dữ liệu. Chấp nhận thì phản bội tổ chức. Và Lyra đang nhìn bạn chờ quyết định.',
      stakes:
        'Thắng: Mã nguồn về tay The Glitch — lỗ hổng hạt nhân được tìm thấy, Wave 7 có thể bị phá. Thua: OmniCorp vá lỗ hổng, Cerberus tiến hành Wave 7 đúng hạn.',
      keyMoments: [
        'Warden-9 nói: "Tôi biết ai là người đã gửi bạn đến đây — và tôi biết họ không nói hết sự thật"',
        'Agent Kira và bạn đối mặt trong hành lang dữ liệu — cả hai cùng cần 4 phút nữa để download xong',
        'Lyra tìm ra tên thật của bạn trong cơ sở dữ liệu OmniCorp — và không nói gì',
      ],
    },
  ],
};

export const WASTELAND_LORE: WorldLore = {
  id: 'wasteland-01',
  name: 'Dust & Circuits',
  toneDescriptor: 'post-apocalyptic wasteland survival',
  writingStyle:
    "post-apocalyptic survival — brutal, sparse, no sentimentality. Short sentences. Consequences are permanent. Write like every drop of water is someone's last.",
  stakesDimensions: 'water, survival, shelter, loyalty among survivors',
  situationTypes: [
    'Lục soát đống đổ nát thành phố cũ',
    'Chạm trán đội tuần tra Iron Sentinel',
    'Thương lượng nguồn nước với bộ tộc khác',
    'Phục kích ngoài vùng hoang mạc',
    'Xâm nhập vùng phóng xạ cấp cao',
    'Gặp người sống sót không rõ ý định',
    'Sửa chữa thiết bị lọc bị hỏng',
    'Đổi chác linh kiện và hàng hiếm',
    'Chạy trốn Sentinel đang khởi động lại',
    'Tìm lối vào hầm trú ẩn thế kỷ trước',
  ],
  bannedPhrases: [
    '"được cộng đồng ghi nhận"',
    '"thành công trong việc sinh tồn"',
    '"gây ấn tượng"',
    '"bảo vệ quyền lợi"',
    '"đối phó lại"',
  ],
  codePrefix: 'WL',
  context:
    'Thế giới hậu tận thế năm 2142 sau sự kiện "The Great Reset". Nước hiếm hơn vàng, và các AI cũ từ thời tiền chiến vẫn đang săn lùng những con người cuối cùng trong các hầm trú ẩn hoang phế. Bầu khí quyển bị ô nhiễm nặng nề bởi bụi phóng xạ và nano-bots.',
  factions: [
    {
      name: 'The Scavengers',
      description:
        'Những người sống sót bám trụ vào các đống đổ nát, tìm kiếm linh kiện cũ để duy trì sự sống.',
      ultimateGoal: 'Tìm ra nguồn nước sạch và công nghệ lọc khí.',
    },
    {
      name: 'The Iron Sentinels',
      description:
        'Lực lượng robot tự hành vẫn tuân lệnh các giao thức quân sự đã lỗi thời từ 100 năm trước.',
      ultimateGoal:
        'Tiêu diệt mọi sinh vật hữu cơ bị coi là "mối đe dọa sinh học".',
    },
  ],
  missions: [
    {
      id: 'wl-m1',
      name: 'The Water Finder',
      briefing:
        'Nguồn nước của bộ tộc Oasis đang cạn kiệt. Các trinh sát báo cáo về một hệ thống lọc nước cổ đại vẫn còn hoạt động trong trung tâm thành phố chết.',
      objective:
        'Tìm kiếm bộ lọc nước trung tâm trong đống đổ nát và mang nó về.',
    },
  ],
};

export const WORLD_BIBLES: Record<string, WorldLore> = {
  'cyberpunk-01': CYBERPUNK_LORE,
  'wasteland-01': WASTELAND_LORE,
  'urban-01': {
    id: 'urban-01',
    name: 'Đế Chế Từ Số 0',
    toneDescriptor:
      'modern Vietnamese urban rebirth drama — business world, workplace and daily life situations',
    writingStyle:
      'Korean/Vietnamese corporate drama — every glance, pause, and silence is a strategic move. Power shifts happen through a raised eyebrow, not a speech. Write like a boardroom thriller.',
    stakesDimensions:
      'career trajectory, reputation, money, relationships, the 5-year plan',
    situationTypes: [
      'Họp hội đồng quản trị',
      'Hành lang ngay sau tan họp',
      'Thang máy với cấp trên',
      'Email khẩn lúc cuối ngày',
      'Bữa trưa thương lượng',
      'Tin nhắn riêng từ đồng nghiệp',
      'Networking event sau giờ làm',
      'Ký kết hợp đồng',
      'Cuộc gọi ngoài giờ làm việc',
      'Xử lý khủng hoảng truyền thông',
    ],
    bannedPhrases: [
      '"được ban lãnh đạo công nhận"',
      '"gây ấn tượng với ban lãnh đạo"',
      '"thành công trong việc [generic action]"',
      '"bảo vệ quyền lợi của mình"',
      '"đối phó lại"',
    ],
    codePrefix: 'UR',
    context:
      'Năm 31 tuổi, bạn chết trong căn phòng trọ 8m² với khoản nợ 300 triệu — toàn bộ do người bạn thân nhất cướp trắng công ty startup. Hệ thống kích hoạt: bạn tỉnh dậy trong cơ thể 23 tuổi, ngày đầu tiên đi làm tại chính công ty mà sau này sẽ hủy hoại mình. Lần này bạn biết tất cả.',
    factions: [
      {
        name: 'Tập đoàn Minh Long',
        description:
          'Đế chế gia đình đang trên đà sụp đổ — nhưng chưa ai biết. Bạn từng là nạn nhân, giờ là quân cờ nội gián.',
        ultimateGoal: 'Nuốt chửng toàn bộ thị phần trước khi lộ tẩy.',
      },
      {
        name: 'Liên minh khởi nghiệp District 7',
        description:
          'Những người trẻ có ý chí nhưng thiếu vốn. Đây là lực lượng bạn cần xây dựng từ đầu.',
        ultimateGoal:
          'Tạo ra hệ sinh thái startup đủ mạnh để đối trọng big corp.',
      },
      {
        name: 'Kẻ phản bội — Hoàng Minh',
        description:
          'Người bạn thân cũ. Hiện là Phó TGĐ Minh Long. Vẫn đang mỉm cười với bạn mỗi sáng.',
        ultimateGoal: 'Thâu tóm toàn bộ chuỗi cung ứng bằng mọi giá.',
      },
    ],
    missions: [
      {
        id: 'ur-m1',
        name: 'Ngày Đầu Trở Lại',
        briefing:
          'Sáng thứ Hai, 8:30. Phòng họp kính tầng 12 của Tập đoàn Minh Long — đúng căn phòng mà 8 năm sau sẽ là nơi bạn ký tờ từ chức ép buộc. Hội đồng đang chờ bài báo cáo quý từ nhân viên mới. Bạn biết từng câu hỏi họ sẽ hỏi, từng con số họ sẽ phản bác — vì bạn đã sống qua lần này rồi. Nhưng Hoàng Minh vừa ngồi xuống đối diện, và anh ta đang nhìn bài trình chiếu của bạn với ánh mắt đang tìm kiếm lỗ hổng.',
        objective:
          'Giành được sự chú ý riêng của Giám đốc Phương Lan sau buổi họp — bước đầu tiên trong ván cờ 5 năm.',
        keyCharacters:
          'Giám đốc Phương Lan (50 tuổi, lạnh lùng, trung lập — người duy nhất trong hội đồng có thể bảo vệ bạn nếu bạn thuyết phục được bà); Hoàng Minh (Phó TGĐ, bạn thân cũ, vừa ngồi xuống đối diện — chưa biết bạn là ai thật sự); Thư ký Linh (ghi biên bản — nhưng Hoàng Minh đặt cô làm gián điệp từ năm ngoái)',
        dramaticTension:
          'Bạn biết Hoàng Minh sẽ phá bạn — nhưng hành động quá sớm sẽ lộ bài. Mỗi phản ứng hôm nay phải là nước cờ trong ván cờ 5 năm, không phải phản xạ tức thời.',
        stakes:
          'Thắng: Giám đốc Phương mời riêng sau họp — chuỗi cơ hội bắt đầu. Thua: Bị chuyển xuống phòng hành chính — mất 6 tháng phục hồi.',
        keyMoments: [
          'Hoàng Minh "vô tình" đặt cốc nước lên remote máy chiếu — slide của bạn biến mất đúng lúc đến lượt trình bày',
          'Giám đốc Phương hỏi về số liệu Q3 không có trong báo cáo — bạn nhớ con số chính xác vì bạn đã sống qua nó',
          'Một thành viên hội đồng trẻ cất điện thoại xuống khi bạn đang nói — bạn vừa có đồng minh đầu tiên',
        ],
        scenarios: [
          {
            stage: 1,
            arcLabel: 'HOOK',
            scene:
              'Phòng họp kính tầng 12, 8:35 sáng thứ Hai. Đến lượt bạn bấm next — màn hình tắt lịm.',
            situation:
              'Hoàng Minh "vô tình" để cốc cà phê lên remote. Slide của bạn biến mất đúng lúc Giám đốc Phương nhìn lên. Cả phòng chờ. Hoàng Minh ngồi yên, không nhìn bạn.',
            correctExpression: 'speak out',
            correctMeaning: 'lên tiếng công khai',
            correctRationale:
              'Lên tiếng ngay, tiếp tục trình bày từ trí nhớ — không cần slide, không để Hoàng Minh định nghĩa khoảnh khắc này.',
            wrongOptions: [
              {
                expression: 'hold back',
                consequence:
                  'Bạn im lặng chờ kỹ thuật viên — Giám đốc Phương quay đi. Cơ hội đầu tiên trôi qua mà không ai biết bạn có gì.',
              },
              {
                expression: 'give in',
                consequence:
                  'Bạn đề nghị trình bày sau — Hoàng Minh ngay lập tức nhảy vào lấp chỗ trống của bạn.',
              },
              {
                expression: 'buy time',
                consequence:
                  'Bạn loay hoay với remote — Giám đốc Phương ghi trong đầu: "thiếu bình tĩnh dưới áp lực".',
              },
            ],
            keyDetail:
              'Hoàng Minh gõ nhẹ 2 ngón tay lên mặt bàn — nhịp điệu bình thản của người đang đợi kế hoạch diễn ra đúng ý.',
          },
          {
            stage: 2,
            arcLabel: 'ESCALATION',
            scene:
              'Cuối buổi họp. Giám đốc Phương lật lại trang 4 báo cáo, mắt nhìn thẳng vào bạn.',
            situation:
              'Phương hỏi tỷ lệ tăng trưởng thực Q3 — con số không có trong file Hoàng Minh gửi. Bạn biết chính xác vì đã sống qua kết quả kiểm toán 8 tháng sau. Hoàng Minh không có câu trả lời.',
            correctExpression: 'stand firm',
            correctMeaning: 'giữ vững lập trường',
            correctRationale:
              'Trả lời thẳng với con số chính xác — không giải thích nguồn, không xin phép. Sự tự tin không cần chứng minh.',
            wrongOptions: [
              {
                expression: 'back down',
                consequence:
                  'Bạn nói "cần kiểm tra lại" — Hoàng Minh ngay lập tức nhảy vào trả lời, chiếm thế chủ động.',
              },
              {
                expression: 'play it safe',
                consequence:
                  'Bạn đưa ra khoảng ước lượng — Phương gật đầu lịch sự và chuyển chủ đề. Cơ hội tạo ấn tượng đã qua.',
              },
              {
                expression: 'step back',
                consequence:
                  'Bạn nhìn Hoàng Minh như chờ anh xác nhận — Phương nhận ra ngay mối quan hệ quyền lực giữa hai người.',
              },
            ],
            keyDetail:
              'Hoàng Minh bấm pen click 2 lần liên tiếp khi bạn đọc con số chính xác — phản xạ của người bị bất ngờ.',
          },
          {
            stage: 3,
            arcLabel: 'BETRAYAL',
            scene:
              'Hành lang tầng 12, ngay sau tan họp. Thư ký Linh đi về phía thang máy với xấp biên bản.',
            situation:
              'Bạn thấy Linh cầm thêm một bản biên bản không chính thức. Nhưng đúng lúc đó, thành viên hội đồng trẻ Hải bước ra cùng chiều — thẻ tên anh có logo accelerator District 7.',
            correctExpression: 'reach out',
            correctMeaning: 'chủ động tiếp cận',
            correctRationale:
              'Hải là đồng minh tiềm năng duy nhất vừa lộ diện — và cửa sổ cơ hội đóng lại khi thang máy đến.',
            wrongOptions: [
              {
                expression: 'follow up',
                consequence:
                  'Bạn ở lại hỏi Linh về biên bản — cô ta lạnh giọng và nhắn tin cho Hoàng Minh ngay sau đó.',
              },
              {
                expression: 'take the lead',
                consequence:
                  'Bạn đuổi theo Giám đốc Phương vào văn phòng — thư ký chặn: "Bà Phương đang bận."',
              },
              {
                expression: 'lay low',
                consequence:
                  'Bạn không tiếp cận ai — Hải bước vào thang máy, cơ hội xây đồng minh đầu tiên tan biến.',
              },
            ],
            keyDetail:
              'Logo trên thẻ của Hải: vòng tròn cam của accelerator District 7 — bạn nhận ra vì 3 năm nữa bạn sẽ pitch ở đó.',
          },
          {
            stage: 4,
            arcLabel: 'CRISIS',
            scene:
              'Văn phòng của bạn, 17:31. Tin nhắn Zalo từ Hoàng Minh bật lên màn hình.',
            situation:
              '"Chiều nay mày rất tốt. Uống ly gì không, tao đặt chỗ rồi." — Đúng tin nhắn này, đúng 17:31. Đây là đêm anh ta bắt đầu khai thác thông tin từ bạn 8 năm trước qua những buổi nhậu "thân thiện".',
            correctExpression: 'hold back',
            correctMeaning: 'kìm lại, không vội',
            correctRationale:
              'Từ chối lịch sự mà không để lộ nghi ngờ — duy trì vỏ bọc "đồng nghiệp bình thường" trong khi tránh bẫy.',
            wrongOptions: [
              {
                expression: 'open up',
                consequence:
                  'Bạn đồng ý đi — và vô tình chia sẻ cảm nhận về buổi họp. Hoàng Minh ghi nhớ từng chữ.',
              },
              {
                expression: 'speak out',
                consequence:
                  'Bạn trả lời lạnh lùng qua tin nhắn — Hoàng Minh nhận ra bạn đang cảnh giác với anh ta.',
              },
              {
                expression: 'walk away',
                consequence:
                  'Bạn không trả lời — Hoàng Minh đến tận bàn hỏi thăm. Còn tệ hơn im lặng.',
              },
            ],
            keyDetail:
              'Timestamp 17:31 — cùng giờ, cùng ngày trong tuần, đúng 8 năm trước. Bạn nhớ vì hôm đó là sinh nhật bạn.',
          },
          {
            stage: 5,
            arcLabel: 'CLIMAX',
            scene:
              'Văn phòng Giám đốc Phương, sáng hôm sau 9:00. Không có thư ký. Cửa đóng.',
            situation:
              'Phương tự pha cà phê — điều bà không làm với nhân viên cấp thấp. "Em có muốn báo cáo trực tiếp với tôi trong 3 tháng tới không?" Đây là lời mời mà 8 năm trước bạn đã từ chối vì Hoàng Minh can ngăn.',
            correctExpression: 'take a stand',
            correctMeaning: 'khẳng định lập trường',
            correctRationale:
              'Đồng ý ngay, không do dự, không mặc cả — cơ hội này sẽ không được hỏi lần thứ hai.',
            wrongOptions: [
              {
                expression: 'play it safe',
                consequence:
                  'Bạn nói "Để em nghĩ thêm" — Phương gật đầu, đứng dậy. Cánh cửa khép lại.',
              },
              {
                expression: 'give in',
                consequence:
                  'Bạn nói cần hỏi ý kiến Hoàng Minh trước — Phương nhìn bạn 3 giây rồi thay đổi chủ đề.',
              },
              {
                expression: 'hold back',
                consequence:
                  'Bạn hỏi thêm về điều kiện và lịch trình — Phương nhận ra bạn đang mặc cả. Offer thu về.',
              },
            ],
            keyDetail:
              'Trên bàn Phương có tấm ảnh nhỏ: bà và Chủ tịch Hội đồng tại sự kiện ngoài giờ — thân thiết hơn bất kỳ ai biết.',
          },
        ],
      },
      {
        id: 'ur-m2',
        name: 'Thương Vụ Đầu Tiên',
        briefing:
          'Thứ Tư, 14:00. Khách sạn Melia, phòng họp riêng tầng 8. Đối tác Singapore — Quỹ Meridian Capital — đang xem xét rót 2 triệu USD vào dự án logistics của Minh Long. Họ chỉ làm việc với người đàm phán lưu loát và có bản lĩnh. Hoàng Minh đáng ra phụ trách buổi này — nhưng anh ta vừa "bị kẹt traffic" và nhờ bạn thay vào phút chót. Bạn biết đây là bẫy: nếu thành công, Hoàng Minh nhận công. Nếu thất bại, bạn chịu trách nhiệm. Và tài liệu Hoàng Minh gửi có con số sai 15% so với số thật mà bạn biết.',
        objective:
          'Ký kết hợp đồng với Meridian mà không tiết lộ nguồn số liệu thật — và giữ được bản copy làm bằng chứng về sau.',
        keyCharacters:
          'Marcus Chen (đại diện Meridian — nói tiếng Việt nhưng chỉ ký bằng tiếng Anh, kiểm tra bạn bằng cách hỏi thẳng những gì anh biết đã sai); Phó Giám đốc Khoa (đi theo "hỗ trợ" nhưng thực ra ghi chép báo cáo cho Hoàng Minh từng chi tiết)',
        dramaticTension:
          'Dùng số liệu của Hoàng Minh thì hôm nay thông qua — nhưng sẽ nổ sau 3 tháng khi audit. Dùng số liệu thật thì phải giải thích tại sao bạn có nguồn riêng mà Hoàng Minh không biết.',
        stakes:
          'Thắng: Meridian ký term sheet — và bạn có bản copy hợp đồng sẽ là bằng chứng quan trọng sau này. Thua: Thương vụ đổ bể — Hoàng Minh có lý do đề xuất sa thải vì "không đủ năng lực đàm phán".',
        keyMoments: [
          'Marcus hỏi về margin Q2 — con số trong tài liệu Hoàng Minh gửi sai 2.3 điểm phần trăm so với số thật',
          'Phó GĐ Khoa "vô tình" ngắt lời bạn đúng lúc bạn sắp trả lời câu quan trọng nhất',
          'Marcus ra ngoài gọi điện 7 phút — khi quay vào, thái độ anh đã thay đổi hoàn toàn',
        ],
      },
      {
        id: 'ur-m3',
        name: 'Liên Minh Bí Mật',
        briefing:
          'Một tháng sau ngày đầu trở lại. Bạn đã xác nhận điều mình nghi ngờ: Hoàng Minh đang chuẩn bị thương vụ thâu tóm ngầm sẽ loại bỏ toàn bộ nhân sự cũ trong 6 tháng tới. Để chống lại, bạn cần đồng minh bên ngoài Minh Long. Liên minh khởi nghiệp District 7 là lựa chọn duy nhất — nhưng họ không tin người từ tập đoàn lớn. Buổi gặp tối nay tại quán cà phê D7 là cơ hội duy nhất, và bạn chỉ có 45 phút trước khi Hoàng Minh biết bạn đang ở đâu.',
        objective:
          'Thuyết phục Minh Tú đồng ý cuộc gặp kín lần 2 — không tiết lộ toàn bộ vì Thanh Hà có thể là gián điệp.',
        keyCharacters:
          'Minh Tú (27 tuổi, founder Liên minh D7 — mất hợp đồng với Minh Long 2 năm trước vì bị phá đám, vẫn còn giận nhưng thông minh); Thanh Hà (technical lead của 3 startup — đang bị Minh Long mua chuộc bí mật); Bảo (luật sư trẻ, quan sát tất cả, không ai biết anh đang hỗ trợ phe nào)',
        dramaticTension:
          'Nói quá nhiều về kế hoạch thật thì nguy hiểm nếu Thanh Hà là gián điệp. Nói quá ít thì không thuyết phục được Minh Tú.',
        stakes:
          'Thắng: Minh Tú đồng ý gặp lần 2 và bắt đầu chia sẻ thông tin nội bộ D7. Thua: Tin về buổi gặp này đến tai Hoàng Minh trong 24 giờ.',
        keyMoments: [
          'Minh Tú hỏi thẳng: "Anh/chị đang làm cho Minh Long — tại sao tôi nên tin?"',
          'Điện thoại Thanh Hà rung — anh liếc nhìn rồi tắt đi nhanh bất thường',
          'Bảo đề nghị soạn "thỏa thuận bảo mật" ngay tại chỗ — nhưng template có điều khoản bất lợi cho bạn',
        ],
      },
      {
        id: 'ur-m4',
        name: 'Đêm Trước Phản Bội',
        briefing:
          'Ba tháng sau. 22:47, văn phòng tầng 15 đang vắng người. Bạn đang làm thêm giờ khi email từ địa chỉ ẩn danh bật lên: file nội bộ của Minh Long — kế hoạch của Hoàng Minh thâu tóm chuỗi cung ứng, có chữ ký của 3 thành viên hội đồng mà bạn từng tưởng là phe trung lập. Nguồn gửi là ai? Tại sao gửi cho bạn? Bạn có 8 tiếng đồng hồ trước khi Hoàng Minh nhận ra đã bị lộ — để quyết định phải làm gì với thông tin này.',
        objective:
          'Xác minh nguồn gốc tài liệu và tìm ra đồng minh thật sự trong hội đồng — mà không để Hoàng Minh biết bạn đã đọc file này.',
        keyCharacters:
          'Hoàng Minh (vừa nhắn tin "Ngày mai ngủ đủ giấc nhé, họp sớm" — vẫn không biết gì); Giám đốc Phương Lan (tên bà có trong tài liệu — nhưng chữ ký có vẻ khác); Nhân vật ẩn danh (người gửi tài liệu — đồng minh hay bẫy khác?)',
        dramaticTension:
          'Nếu tài liệu là bẫy và bạn hành động, bạn bị đẩy ra ngay lập tức. Nếu tài liệu thật và bạn không hành động, Hoàng Minh triển khai kế hoạch trong 72 giờ tới.',
        stakes:
          'Thắng: Xác minh được nguồn và tìm ra đồng minh thật sự trong hội đồng trước 6 giờ sáng. Thua: Hoàng Minh phát hiện và đẩy bạn vào thế bị động hoàn toàn.',
        keyMoments: [
          'File có metadata timestamp 20:13 — đúng lúc bạn còn trong văn phòng nhưng ở tầng khác',
          'Thư ký Linh nhắn tin hỏi bạn đang ở đâu lúc 22:50 — không rõ vô tình hay cố ý',
          'Cuộc gọi lúc 23:15 từ số lạ — nghe máy hay không sẽ quyết định hướng đi của đêm nay',
        ],
      },
    ],
  },
  'urban-02': {
    id: 'urban-02',
    name: 'Từ Bếp Ăn Đến Đế Vương',
    toneDescriptor:
      'modern Vietnamese food entrepreneur drama — social media, restaurant business and daily hustle',
    writingStyle:
      'Vietnamese food entrepreneur drama meets social media reality — raw hustle, public pressure, viral stakes. Every post can make or break the business. Write with urgency and authenticity.',
    stakesDimensions:
      'revenue, brand reputation, viral reach, supplier relationships, investor trust',
    situationTypes: [
      'Quay clip tại gian bếp',
      'Gặp đối tác thương hiệu',
      'Xử lý khủng hoảng truyền thông viral',
      'Thương lượng với nhà đầu tư',
      'Gặp creator đối thủ',
      'Kiểm tra chất lượng từ nhà cung cấp',
      'Cuộc gặp bất ngờ với đối thủ cũ',
      'Pitch cho quỹ đầu tư',
      'Xử lý review tiêu cực đang lan viral',
      'Thương lượng mặt bằng mới',
    ],
    bannedPhrases: [
      '"được cộng đồng công nhận"',
      '"gây ấn tượng với khán giả"',
      '"thành công trong việc [generic action]"',
      '"bảo vệ thương hiệu"',
      '"đối phó với đối thủ"',
    ],
    codePrefix: 'UF',
    context:
      'Bạn là đầu bếp tài năng nhưng bị chủ nhà hàng chiếm dụng công thức bí mật. Bạn chết trong tai nạn xe sau đêm bị sa thải. Trọng sinh về thời điểm vừa học xong nghề bếp, tay trắng nhưng đầy bí kíp — và mạng xã hội năm nay đang bùng nổ short video ẩm thực.',
    factions: [
      {
        name: 'Nhà hàng Phượng Hoàng',
        description:
          'Thương hiệu 30 năm độc chiếm khu vực. Không ngại chơi xấu với đối thủ mới nổi.',
        ultimateGoal:
          'Duy trì vị thế độc quyền bằng cách mua lại hoặc triệt tiêu đối thủ.',
      },
      {
        name: 'Cộng đồng food creator',
        description:
          'Mạng lưới creator ẩm thực đang tìm kiếm gương mặt thật, câu chuyện thật.',
        ultimateGoal: 'Xây dựng nền kinh tế nội dung ẩm thực độc lập.',
      },
    ],
    missions: [
      {
        id: 'ur2-m1',
        name: 'Video Đầu Tiên',
        briefing:
          'Thứ Bảy, 6 giờ sáng. Gian bếp thuê 4 triệu/tháng ở hẻm 47 Nguyễn Trãi — mùi dầu hào cũ chưa tan hết từ người thuê trước. Camera là iPhone 11 cũ dựng trên chồng sách. Hôm nay bạn quay clip canh chua bà ngoại — công thức mà lần trước chủ nhà hàng Phượng Hoàng đã chiếm dụng và bán với giá 250.000đ/tô. Nhưng kênh của bạn mới 0 subscribers, và hàng xóm vừa gõ cửa phàn nàn về mùi gia vị.',
        objective:
          'Đăng clip đầu tiên đạt 10k views trong 48 giờ và thiết lập kết nối với community ẩm thực.',
        keyCharacters:
          'Quỳnh (25 tuổi, food creator nổi tiếng khu vực — đang quay clip ở quán đối diện, không biết bạn tồn tại); Anh Tài (hàng xóm 45 tuổi, hưu trí, rất nhiều thời gian rảnh và hay nhìn qua cửa sổ); Cô Sáu (chủ gian bếp — hợp đồng có điều khoản "không làm phiền hàng xóm")',
        dramaticTension:
          'Công thức canh chua là vũ khí bí mật — nhưng Phượng Hoàng đang theo dõi mạng xã hội để phát hiện đối thủ sớm. Upload là lộ bài với họ. Không upload thì không bắt đầu được.',
        stakes:
          'Thắng: 10k views trong 48 giờ — Quỳnh comment và tag bạn, mở ra network. Thua: Clip chìm 23 views — cô Sáu xem xét không gia hạn hợp đồng bếp.',
        keyMoments: [
          'Quỳnh bước vào gian bếp vì nhầm số nhà — nhìn thấy setup quay của bạn và tò mò hỏi thêm',
          'Clip đăng xong 3 tiếng, account lạ báo cáo vi phạm bản quyền âm thanh — nghi là từ Phượng Hoàng',
          'Nhà hàng nhỏ nhắn tin hỏi mua công thức với giá 5 triệu — quyết định này ảnh hưởng chiến lược dài hạn',
        ],
      },
      {
        id: 'ur2-m2',
        name: 'Pitch Với Nhà Đầu Tư',
        briefing:
          '3 tháng sau clip viral. Bạn có 47.000 followers và lời mời từ hai nhà đầu tư khác nhau. Hôm nay là cuộc gặp với Franklin Tan — đại diện quỹ F&B Singapore, chỉ có mặt tại TP.HCM 3 ngày. Anh muốn nghe pitch 15 phút bằng tiếng Anh tại The Workshop Cà Phê. Vấn đề: nhà đầu tư địa phương vừa cảnh báo Franklin đã ký thỏa thuận độc quyền với Phượng Hoàng 6 tháng trước — buổi gặp này có thể là để thu thập thông tin về đối thủ.',
        objective:
          'Thuyết phục Franklin mà không tiết lộ nhà cung cấp chiến lược — và đọc được ý định thật của anh ta.',
        keyCharacters:
          'Franklin Tan (40 tuổi, Singapore, lịch sự — hỏi rất nhiều về nguồn nguyên liệu và nhà cung cấp, nhiều hơn mức cần thiết cho giai đoạn sớm); Chị Liên (nhà đầu tư địa phương đã cảnh báo — đang chờ xem bạn xử lý thế nào); Minh (nhân viên quán cà phê — quen mặt Franklin, nói nhỏ với bạn trước khi anh đến: "Anh đó hay gặp người Phượng Hoàng ở đây lắm")',
        dramaticTension:
          'Nếu Franklin là gián điệp, mọi thông tin bạn tiết lộ sẽ chống lại bạn. Nếu anh thật sự quan tâm và bạn quá dè dặt, bạn mất cơ hội rót vốn duy nhất tháng này.',
        stakes:
          'Thắng: Nhận term sheet — giữ được bí mật nhà cung cấp. Thua: Franklin rời đi với đủ thông tin để Phượng Hoàng copy mô hình trong 2 tháng.',
        keyMoments: [
          'Franklin hỏi tên nhà cung cấp cá lóc — cụ thể đến mức bất thường với nhà đầu tư giai đoạn sớm',
          '5 phút trước khi kết thúc, Franklin đặt điện thoại lên bàn — bạn kịp thấy tên liên lạc cuối là "PH Group"',
          'Chị Liên nhắn tin giữa buổi pitch: "Em đừng ký gì hôm nay nhé"',
        ],
      },
      {
        id: 'ur2-m3',
        name: 'Chiến Lược Viral',
        briefing:
          '6 tháng sau. Kênh có 180.000 followers và bạn vừa mở quán nhỏ ở D3. Nhà hàng Phượng Hoàng vừa ra mắt "Phượng Hoàng Mini" — chuỗi food court nhái concept của bạn với vốn gấp 50 lần. Tuần này họ chạy quảng cáo 200 triệu toàn khu vực. Một influencer lớn — 2 triệu followers — vừa nhận review Phượng Hoàng Mini và đăng ảnh chụp cùng menu của bạn để so sánh. Bạn cần phản ứng trong 24 giờ trước khi tin này định hình nhận thức thị trường.',
        objective:
          'Biến cuộc tấn công của Phượng Hoàng thành cơ hội PR — mà không bị kiện và không lộ điểm yếu.',
        keyCharacters:
          'Khánh Linh (influencer 2M followers — đã liên hệ bạn trước nhưng bạn chưa kịp trả lời, và giờ đã ký với Phượng Hoàng; đang DM xin lỗi); Chef Bảo (đầu bếp kỳ cựu uy tín — từ chối offer của Phượng Hoàng, quan sát bạn để quyết định có liên kết không)',
        dramaticTension:
          'Tấn công công khai Phượng Hoàng thu hút attention nhưng có thể bị kiện. Im lặng khiến thị trường nghĩ bạn yếu. Content response đúng cách có thể biến đây thành PR miễn phí — nhưng timing và tone là tất cả.',
        stakes:
          'Thắng: Chef Bảo join team, Khánh Linh tự nguyện làm content balance. Thua: Mất 15% khách hàng đang do dự — doanh thu tháng này không đủ trả mặt bằng.',
        keyMoments: [
          'Khánh Linh DM: "Em không biết họ có kế hoạch này, anh/chị có muốn nói chuyện không"',
          'Khách hàng thân thiết post review so sánh công khai, tag cả hai — đang viral 5k shares',
          'Chef Bảo xuất hiện tại quán đúng lúc bạn đang xử lý khủng hoảng — gọi ly cà phê và quan sát',
        ],
      },
      {
        id: 'ur2-m4',
        name: 'Series A Hay Không',
        briefing:
          '12 tháng sau. Bạn có 500.000 followers, 2 quán, doanh thu 800 triệu/tháng. Quỹ Vinhomes Capital Ventures đang xem xét Series A 10 tỷ. Nhưng trong buổi due diligence hôm nay, đội kiểm toán phát hiện vấn đề: công thức canh chua gốc — Phượng Hoàng đã đăng ký bảo hộ IP năm ngoái. Nếu bị khiếu nại, toàn bộ thỏa thuận đầu tư sụp đổ. Và Phượng Hoàng vừa gửi email đến quỹ — nội dung chưa rõ.',
        objective:
          'Giữ quỹ ở lại bàn đàm phán trong khi luật sư tìm bằng chứng phản bác — không được để lộ mức độ rủi ro thật.',
        keyCharacters:
          'Bà Nguyệt (partner cấp cao — 55 tuổi, đã thấy nhiều startup sụp đổ vì IP, đang đánh giá bạn có xử lý khủng hoảng được không); Luật sư Hùng (đại diện pháp lý — đang tìm bằng chứng nhưng cần thêm thời gian); Đại diện Phượng Hoàng (gửi email cho quỹ lúc 9:47 — bà Nguyệt đang đọc ngay lúc này)',
        dramaticTension:
          'Bà Nguyệt không quan tâm đến đạo lý — bà quan tâm đến rủi ro pháp lý. Bạn biết mình đúng về mặt đạo lý nhưng yếu về mặt thủ tục. Phải kéo dài buổi họp đủ lâu để Luật sư Hùng tìm ra bằng chứng.',
        stakes:
          'Thắng: Quỹ ký tắt term sheet pending giải quyết IP — 60 ngày để thu thập bằng chứng. Thua: Quỹ rút lui — tin lan ra và các nhà đầu tư khác cũng dè dặt.',
        keyMoments: [
          'Bà Nguyệt đặt tờ in email của Phượng Hoàng lên bàn — quay mặt đi — và để bạn đọc',
          'Luật sư Hùng nhắn tin: "Tìm được video cũ anh/chị demo công thức năm 2020 — đủ phản bác không?"',
          'Đại diện Phượng Hoàng gọi trực tiếp cho bạn trong lúc đang ngồi họp — không biết họ muốn gì',
        ],
      },
    ],
  },
};

export const NARRATIVE_ARCS = {
  beginning:
    'Stage 1: Thâm nhập. Nhân vật bắt đầu từ ranh giới giữa thế giới thực và ảo. Tông giọng bí ẩn, căng thẳng. Mục tiêu là vượt qua lớp bảo vệ vòng ngoài.',
  middle:
    'Stage 2-4: Leo thang. Nhân vật dấn sâu vào lãnh địa của kẻ thù. Các thử thách về kỹ thuật và tâm lý tăng cao. Sự xuất hiện của các phe phái tranh chấp quyền lợi.',
  climax:
    'Stage 5: Sanctum Core. Đỉnh điểm kịch tính. Echo-01 đối mặt trực tiếp với Cerberus. Toàn bộ nỗ lực của The Glitch phụ thuộc vào một phrasal verb cuối cùng.',
};
