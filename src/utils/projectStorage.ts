import { FilmProject, VideoScript, VideoGenre } from '../types/script';
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
        const activeId = (rawActiveId && parsed.some((p: FilmProject) => p.id === rawActiveId))
          ? rawActiveId
          : parsed[0].id;
        return { projects: parsed, activeProjectId: activeId };
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
  const defaultScript: VideoScript = {
    ...CURATED_SCRIPTS[0],
    id: `script-${timestamp}`,
    title: customTopic.trim() ? `Dự Án: ${customTopic.slice(0, 32)}...` : 'Dự Án Phim Mới (Chưa tạo kịch bản)',
    subtitle: 'Đang khởi tạo kịch bản...',
    logline: customTopic.trim() || 'Nhập chủ đề ý tưởng để AI biên kịch toàn bộ phân cảnh.',
    scenes: [
      {
        id: 1,
        timeCode: '00:00 - 00:08',
        shotType: 'Toàn cảnh (Wide Shot)',
        setting: 'Bối cảnh khởi đầu',
        visualAction: customTopic.trim() || 'Bấm "BẤM MÁY TẠO KỊCH BẢN" để AI tự động biên kịch chi tiết.',
        voiceoverNarration: 'Kịch bản đang được chuẩn bị. Vui lòng tạo kịch bản từ Xưởng Phim AI.',
        soundEffects: 'Âm thanh nền điện ảnh nhẹ nhàng.',
      },
    ],
  };

  return {
    id,
    name: customTopic.trim() ? `Dự Án: ${customTopic.slice(0, 35)}` : `Dự Án Mới #${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
    topic: customTopic,
    genre: customGenre,
    duration: '3min',
    tone: 'Kịch tính, dồn dập, cảnh báo sâu sắc',
    customAudience: 'Khán giả đại chúng, thanh niên',
    customSetting: 'Ngoại cảnh thành phố',
    script: defaultScript,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
