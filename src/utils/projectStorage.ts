import { FilmProject, VideoScript, VideoGenre, ScriptScene } from '../types/script';
import { CURATED_SCRIPTS } from '../data/videoScripts';

const STORAGE_KEY_PROJECTS = 'film_ai_projects_v2';
const STORAGE_KEY_ACTIVE_ID = 'film_ai_active_project_id_v2';

export function createDefaultProjects(): FilmProject[] {
  return [
    {
      id: 'proj-traffic-1',
      name: 'Dự Án 1: Chậm 3 Giây - Nhanh Một Đời (Tiểu Phẩm Cảnh Báo)',
      topic: 'Người lái xe vội vã vượt đèn đỏ tại ngã tư và bài học cảnh tỉnh suýt đánh đổi cả mạng sống',
      genre: 'drama_psa',
      duration: '3min',
      tone: 'Căng thẳng, dồn dập, giật mình thức tỉnh, kết thúc nhân văn',
      customAudience: 'Người điều khiển xe máy, ô tô, thanh niên và tài xế công nghệ',
      customSetting: 'Trong cabin ô tô & Ngã tư giao lộ trung tâm',
      script: CURATED_SCRIPTS[0],
      createdAt: Date.now() - 86400000 * 3,
      updatedAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'proj-scifi-2',
      name: 'Dự Án 2: Thành Phố 2088 (Sci-Fi Tương Lai)',
      topic: 'Cyberpunk Neo-Saigon năm 2088, trạm lưu trữ ký ức số và hacker giải mã bí mật tập đoàn',
      genre: 'scifi_cyberpunk',
      duration: '2min',
      tone: 'Huyền ảo, vị lai, công nghệ cao, dồn dập',
      customAudience: 'Khán giả trẻ mê phim khoa học viễn tưởng & công nghệ AI',
      customSetting: 'Khu phố ngập ánh đèn neon và trạm tàu đệm từ trên cao',
      script: CURATED_SCRIPTS[1] || CURATED_SCRIPTS[0],
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'proj-tvc-3',
      name: 'Dự Án 3: TVC Cà Phê Mộc Cao Nguyên',
      topic: 'TVC quảng cáo cà phê mộc nguyên bản, tôn vinh giọt đắng đánh thức khát vọng khởi nghiệp',
      genre: 'tvc_commercial',
      duration: '60s',
      tone: 'Hào sảng, truyền cảm hứng, hình ảnh điện ảnh duy mỹ',
      customAudience: 'Dân văn phòng, giới trẻ năng động, người yêu cà phê',
      customSetting: 'Nông trại cà phê Đắk Lắk trong sương sớm & không gian quán sáng tạo',
      script: CURATED_SCRIPTS[2] || CURATED_SCRIPTS[0],
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
  ];
}

export function loadSavedProjects(): { projects: FilmProject[]; activeProjectId: string } {
  try {
    const rawProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
    const rawActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);

    if (rawProjects) {
      const parsed = JSON.parse(rawProjects);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Upgrade legacy projects that had old 6-scene format to the full 22-scene synchronized breakdown
        const updatedProjects = parsed.map((p: FilmProject) => {
          if (p.id === 'proj-traffic-1' && (!p.script.scenes || p.script.scenes.length < 20)) {
            return {
              ...p,
              script: CURATED_SCRIPTS[0],
            };
          }
          return p;
        });

        const activeId = (rawActiveId && updatedProjects.some((p: FilmProject) => p.id === rawActiveId))
          ? rawActiveId
          : updatedProjects[0].id;
        
        // Persist the upgraded list
        saveProjects(updatedProjects, activeId);
        return { projects: updatedProjects, activeProjectId: activeId };
      }
    }
  } catch (err) {
    console.warn('Could not read projects from localStorage:', err);
  }

  const defaults = createDefaultProjects();
  saveProjects(defaults, defaults[0].id);
  return { projects: defaults, activeProjectId: defaults[0].id };
}

export function saveProjects(projects: FilmProject[], activeId?: string) {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    if (activeId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeId);
    }
  } catch (err) {
    console.warn('Failed to save projects to localStorage:', err);
  }
}

export function createNewProject(customTopic: string = '', customGenre: VideoGenre = 'drama_psa'): FilmProject {
  const timestamp = Date.now();
  const id = `proj-${timestamp}`;
  const cleanTopic = customTopic.trim();

  const isWater = /đuối nước|duoi nuoc|nước|nuoc|sông|song|suối|suoi|hồ|ho|ao|biển|bien|bơi|boi|chết đuối|chet duoi|cứu đuối|cuu duoi|chìm|chim/i.test(cleanTopic);

  const defaultTitle = cleanTopic 
    ? (isWater ? `Kịch Bản: PHÒNG CHỐNG ĐUỐI NƯỚC` : `Dự Án: ${cleanTopic.slice(0, 35)}`)
    : 'Dự Án Phim Mới (Sẵn sàng biên kịch)';

  const defaultCharacters = isWater
    ? [
        { name: 'Cứu hộ viên / Tuyên truyền viên', role: 'Người phát hiện và ứng cứu kịp thời', costume: 'Trang phục cứu hộ, còi cứu sinh, phao tròn' },
        { name: 'Nhóm học sinh & Bé nhỏ', role: 'Học sinh rủ nhau ra khúc sông tắm mát', costume: 'Trang phục học sinh thường nhật' },
        { name: 'Phụ huynh học sinh', role: 'Thức tỉnh về sự lơ là quản lý con trẻ', costume: 'Trang phục đời thường' }
      ]
    : [
        { name: 'Nhân vật chính', role: 'Người dẫn dắt câu chuyện', costume: 'Trang phục phù hợp bối cảnh thực tế' },
        { name: 'Nhân vật đồng hành', role: 'Đồng hành hoặc xúc tác tình huống', costume: 'Trang phục đời thường' }
      ];

  const defaultLocations = isWater
    ? ['Khúc sông nước sâu hoang vắng có cắm biển cảnh báo', 'Bãi cát bồi ven sông', 'Bãi cỏ sơ cấp cứu']
    : ['Không gian bối cảnh thực tế chính', 'Khu vực diễn ra tình huống'];

  const defaultProps = isWater
    ? ['Biển cảnh báo nguy hiểm', 'Phao cứu sinh tròn & Can nhựa', 'Cành tre dài cứu hộ']
    : ['Đạo cụ chuyên dụng của câu chuyện', 'Thiết bị hỗ trợ'];

  const defaultScenes: ScriptScene[] = isWater
    ? [
        {
          id: 1,
          timeCode: '00:00 - 00:30',
          shotType: 'Toàn cảnh thiết lập (Wide Shot)',
          setting: 'Khúc sông nước sâu hoang vắng',
          visualAction: 'Ánh nắng trưa hè gay gắt chiếu xuống mặt sông phẳng lặng. Tấm biển "KHU VỰC NƯỚC SÂU NGUY HIỂM" cắm nghiêng bên bờ cỏ. Nhóm học sinh rủ nhau vứt cặp sách chạy ùa xuống nước.',
          actorDialogue: 'Học sinh: "Nóng quá, nhảy xuống tắm một lúc cho đã!"',
          voiceoverNarration: 'Mùa hè bình an có thể vụt tắt chỉ sau một phút chủ quan bên dòng nước sâu.',
          soundEffects: 'Tiếng ve kêu râm ran, tiếng nước vỗ bì bõm.',
          vfxGraphics: 'Dòng chữ: CẢNH BÁO NGUY CƠ ĐUỐI NƯỚC',
        },
        {
          id: 2,
          timeCode: '00:30 - 01:15',
          shotType: 'Trung cận kịch tính (Medium Close-up)',
          setting: 'Dưới lòng sông sâu',
          visualAction: 'Một em nhỏ sụt hố cát sâu chới với, vỗ tay loạn xạ trên mặt nước rồi chìm dần. Bạn trên bờ hoảng loạn định nhảy nhào xuống.',
          actorDialogue: 'Bạn trên bờ: "Cứu với! Có người bị đuối nước rồi!"',
          voiceoverNarration: 'Tuyệt đối không nhảy xuống ôm nạn nhân khi không có kỹ năng cứu hộ chuyên nghiệp.',
          soundEffects: 'Tiếng nước đập loạn xạ, tiếng kêu cứu thất thanh.',
          vfxGraphics: 'Chữ đỏ: NGUYÊN TẮC VÀNG: KHÔNG LAO XUỐNG ÔM NẠN NHÂN',
        },
        {
          id: 3,
          timeCode: '01:15 - 02:00',
          shotType: 'Góc máy hành động theo sát (Tracking Shot)',
          setting: 'Ven bờ sông',
          visualAction: 'Người cứu hộ chạy đến, hô hoán gọi người hỗ trợ, chìa cành tre dài và quẳng chiếc can nhựa buộc dây cho nạn nhân bám vào.',
          actorDialogue: 'Cứu hộ viên: "Bình tĩnh! Bám chắc vào cành tre! Ôm lấy chiếc can phao!"',
          voiceoverNarration: 'Cứu đuối an toàn gián tiếp: Hô hoán - Ném vật nổi - Với sào dài.',
          soundEffects: 'Tiếng thở gấp, tiếng can phao rơi bõm.',
          vfxGraphics: 'KỸ NĂNG: HÔ HOÁN - NÉM VẬT NỔI - VỚI SÀO DÀI',
        },
        {
          id: 4,
          timeCode: '02:00 - 03:00',
          shotType: 'Toàn cảnh ấm áp lùi dần (Grand Aerial Pull-back)',
          setting: 'Bờ sông lúc hoàng hôn',
          visualAction: 'Nạn nhân được sơ cấp cứu CPR hồi tỉnh an toàn. Gia đình ôm chầm lấy con trong nghẹn ngào nước mắt. Các tình nguyện viên dựng thêm biển cảnh báo và giá phao cứu sinh.',
          actorDialogue: 'Phụ huynh: "Cảm ơn các anh đã cứu sống cháu... Từ nay gia đình sẽ cho con đi học bơi an toàn ngay!"',
          voiceoverNarration: 'Trang bị kỹ năng bơi lội và luôn mặc áo phao là chiếc khiên vững chắc nhất bảo vệ con trẻ trước hiểm họa đuối nước.',
          soundEffects: 'Giai điệu piano ấm áp, tiếng chim chiều.',
          vfxGraphics: 'Thông điệp: HÃY TRANG BỊ KỸ NĂNG BƠI & ÁO PHAO CHO CON TRẺ',
        },
      ]
    : [
        {
          id: 1,
          timeCode: '00:00 - 00:30',
          shotType: 'Toàn cảnh (Wide Shot)',
          setting: cleanTopic ? `Bối cảnh gắn liền với ${cleanTopic}` : 'Bối cảnh khởi đầu',
          visualAction: cleanTopic
            ? `Toàn cảnh mở màn thiết lập thế giới của câu chuyện: ${cleanTopic}. Nhân vật xuất hiện tương tác với không gian thực tế.`
            : 'Bối cảnh khởi đầu câu chuyện. Bấm "BẤM MÁY TẠO KỊCH BẢN" để AI tự động biên kịch toàn bộ các phân cảnh chi tiết.',
          actorDialogue: cleanTopic ? 'Nhân vật chính: "Mọi thay đổi đều bắt đầu từ một bước đi đúng đắn."' : '',
          voiceoverNarration: cleanTopic
            ? `Khởi đầu một hành trình ý nghĩa gắn liền với chủ đề: ${cleanTopic}.`
            : 'Kịch bản đang ở trạng thái sẵn sàng. Vui lòng nhập chủ đề và bấm Bấm Máy Tạo Kịch Bản.',
          soundEffects: 'Âm thanh nền điện ảnh nhẹ nhàng.',
          vfxGraphics: cleanTopic ? `Tiêu đề: ${cleanTopic.toUpperCase()}` : 'XƯỞNG BIÊN KỊCH ĐIỆN ẢNH AI',
        },
      ];

  const defaultScript: VideoScript = {
    id: `script-${timestamp}`,
    title: defaultTitle,
    subtitle: cleanTopic ? `Kịch bản phân cảnh chi tiết - Chủ đề: ${cleanTopic}` : 'Kịch bản đang khởi tạo...',
    genre: customGenre,
    genreLabel: customGenre === 'drama_psa' ? 'Tuyên Truyền, Cảnh Báo Xã Hội & Kỹ Năng Sống' : 'Phim Ngắn / Drama',
    targetDuration: '3 phút',
    targetAudience: isWater ? 'Phụ huynh, thanh thiếu niên, học sinh' : 'Khán giả đại chúng',
    tone: isWater ? 'Căng thẳng, hồi hộp, cảnh báo sâu sắc' : 'Điện ảnh, cuốn hút, giàu cảm xúc',
    logline: cleanTopic
      ? `Câu chuyện truyền tải thông điệp sâu sắc và bài học thực tế xoay quanh: "${cleanTopic}".`
      : 'Nhập chủ đề ý tưởng để AI tự động biên kịch toàn bộ các phân cảnh.',
    characters: defaultCharacters,
    propsLocations: {
      locations: defaultLocations,
      props: defaultProps,
    },
    scenes: defaultScenes,
    coreMessage: isWater 
      ? 'Chủ động phòng chống đuối nước và trang bị kỹ năng an toàn để bảo vệ mầm non tương lai.'
      : 'Hành động đúng đắn và nâng cao nhận thức vì một cuộc sống tốt đẹp hơn.',
    callToAction: isWater
      ? 'Tuyệt đối không tắm sông hồ tự phát - Luôn mặc áo phao và học bơi an toàn ngay hôm nay!'
      : 'Bắt đầu thay đổi nhận thức ngay hôm nay!',
  };

  return {
    id,
    name: cleanTopic ? `Dự Án: ${cleanTopic.slice(0, 35)}` : `Dự Án Mới #${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
    topic: customTopic,
    genre: customGenre,
    duration: '3min',
    tone: isWater ? 'Căng thẳng, hồi hộp, cảnh báo sâu sắc' : 'Điện ảnh, cuốn hút, giàu cảm xúc',
    customAudience: isWater ? 'Phụ huynh, thanh thiếu niên, học sinh' : 'Khán giả đại chúng',
    customSetting: isWater ? 'Bờ khúc sông nước sâu hoang vắng' : 'Bối cảnh thực tế',
    script: defaultScript,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
