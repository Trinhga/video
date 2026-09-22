export type VideoGenre = 
  | 'drama' // Phim kịch tính / Tâm lý xã hội / Phim ngắn
  | 'scifi_cyberpunk' // Khoa học viễn tưởng / Cyberpunk / Tương lai
  | 'tvc_commercial' // TVC Quảng cáo & Video bán hàng sản phẩm
  | 'action_thriller' // Hành động / Giật gân / Phá án
  | 'tiktok_viral' // Video ngắn Viral TikTok/Reels 60s
  | 'historical_fantasy' // Cổ trang / Dã sử / Huyền ảo
  | 'comedy' // Hài hước / Tình huống đời thường bi hài
  | 'horror_mystery' // Kinh dị / Trinh thám / Bí ẩn ly kỳ
  | 'documentary' // Phim tài liệu / Khám phá & Đời sống
  | 'education_explainer' // Video giáo dục & Phân tích giải thích
  | 'drama_psa' // Tiểu phẩm tuyên truyền & Cảnh báo an toàn
  | (string & {});

export type ShotType = 
  | 'Toàn cảnh (Wide Shot)' 
  | 'Trung cảnh (Medium Shot)' 
  | 'Cận cảnh (Close-up)' 
  | 'Góc nhìn người lái (POV Dashcam)' 
  | 'Góc trên cao (Overhead / Drone)' 
  | 'Cận cảnh đặc tả (Extreme Close-up)'
  | (string & {});

export interface ScriptScene {
  id: number;
  timeCode: string; // e.g. "00:00 - 00:10"
  shotType: ShotType;
  setting: string; // e.g. "Trong cabin ô tô / Ngã tư đường đông đúc"
  visualAction: string; // Hành động diễn viên & hình ảnh quay
  actorDialogue?: string; // Lời thoại nhân vật
  voiceoverNarration: string; // Lời dẫn / thuyết minh của MC hoặc giọng đọc voiceover
  soundEffects: string; // Tiếng động (SFX) & Âm nhạc (BGM)
  vfxGraphics?: string; // Kỹ xảo hình ảnh, text overlay, đồ họa
}

export interface VideoScript {
  id: string;
  title: string;
  subtitle: string;
  genre: VideoGenre;
  genreLabel: string;
  targetDuration: string; // e.g. "3 phút"
  targetAudience: string; // e.g. "Người tham gia giao thông, thanh thiếu niên"
  tone: string; // e.g. "Cảnh báo kịch tính, nhịp nhanh, thông điệp sâu sắc"
  logline: string; // Tóm tắt 1 câu cốt truyện / thông điệp chính
  characters: {
    name: string;
    role: string;
    costume: string;
  }[];
  propsLocations: {
    locations: string[];
    props: string[];
  };
  scenes: ScriptScene[];
  coreMessage: string;
  callToAction: string;
}

export interface CharacterConsistencyAnchor {
  id: string;
  name: string;
  role: string;
  appearanceAnchor: string; // Chi tiết ngoại hình, độ tuổi, da, mắt, kiểu tóc
  clothingAnchor: string; // Quần áo cố định xuyên suốt
  masterPromptToken: string; // Đoạn prompt tiếng Anh chuẩn mô tả nhân vật để dán vào mọi cảnh
  negativePrompt: string; // Từ khóa cấm biến dạng nhân vật
  midjourneyReferenceTag?: string; // Tag gợi ý cho Midjourney / Flux
}

export interface ConsistentObjectAnchor {
  name: string; // e.g. "Xe Mazda 3 đỏ"
  promptAnchor: string; // e.g. "Glossy crimson red Mazda 3 sedan 2022, license plate 30E-689.96"
}

export interface EightSecondClip {
  id: number;
  clipNumber: number;
  timeRange: string; // e.g. "00:00 - 00:08", "00:08 - 00:16"
  durationSec: number; // 8
  sceneReferenceId: number;
  title: string;
  visualAction: string; // Miêu tả hành động trong 8s bằng tiếng Việt
  audioVoiceover: string; // Lời thoại / voiceover tương ứng trong 8s này
  charactersInvolved: string[]; // Tên các nhân vật xuất hiện
  
  // Camera & Lighting specs
  cameraMovement: string; // e.g. "Slow dolly push-in on face", "Static low angle", "FPV chase behind car"
  lightingMood: string; // e.g. "Morning golden sunlight, harsh asphalt reflection"
  
  // Ready-to-copy AI video generation prompts
  englishVideoPrompt: string; // Prompt tiếng Anh tối ưu cho Runway Gen-3 / Kling AI / Sora / Luma
  vietnamesePrompt: string; // Prompt tiếng Việt
  firstFramePromptMidjourney: string; // Prompt tạo keyframe đầu (Image-to-Video Workflow)
  recommendedModel: 'Runway Gen-3 Alpha' | 'Kling 1.5' | 'Luma Dream Machine' | 'Sora' | 'Hailuo Minimax';
  motionScore: number; // Điểm chuyển động 1 - 10
}

export interface EightSecondBreakdown {
  scriptId: string;
  scriptTitle: string;
  totalClips: number;
  totalDurationSeconds: number;
  characterAnchors: CharacterConsistencyAnchor[];
  objectAnchors: ConsistentObjectAnchor[];
  globalStylePrompt: string; // Phong cách chung (Cinematic, 35mm lens, photorealistic, 4K, 24fps)
  globalNegativePrompt: string;
  clips: EightSecondClip[];
}

export interface FilmProject {
  id: string;
  name: string;
  topic: string;
  genre: VideoGenre;
  duration: '30s' | '60s' | '2min' | '3min' | '5min';
  tone: string;
  customAudience: string;
  customSetting: string;
  script: VideoScript;
  createdAt: number;
  updatedAt: number;
}

