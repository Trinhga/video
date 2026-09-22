import React, { useState, useEffect, useRef } from 'react';
import { VideoScript, ScriptScene, VideoGenre } from '../types/script';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Wand2, 
  Film, 
  Edit3, 
  Tv, 
  Volume2, 
  VolumeX, 
  Play, 
  Clock, 
  Users, 
  Camera, 
  ChevronRight, 
  Sliders, 
  Flame, 
  RotateCcw,
  Video,
  Clapperboard,
  Zap,
  Lightbulb,
  X,
  ArrowRight,
  RefreshCw,
  CornerDownRight
} from 'lucide-react';

export interface ScriptGeneratorProps {
  initialTopic?: string;
  initialGenre?: VideoGenre;
  initialDuration?: '30s' | '60s' | '2min' | '3min' | '5min';
  initialTone?: string;
  initialCustomAudience?: string;
  initialCustomSetting?: string;
  initialScript?: VideoScript | null;
  projectId?: string;
  projectName?: string;
  onProjectDataChange?: (data: {
    topic: string;
    genre: VideoGenre;
    duration: '30s' | '60s' | '2min' | '3min' | '5min';
    tone: string;
    customAudience: string;
    customSetting: string;
  }) => void;
  onScriptGenerated?: (script: VideoScript) => void;
  onUseGeneratedScript: (script: VideoScript) => void;
  onOpenTeleprompterWithScript?: (script: VideoScript) => void;
  onOpenEightSecondStudioWithScript?: (script: VideoScript) => void;
}

const TRENDING_TOPICS = [
  {
    icon: '🚀',
    label: 'Sci-Fi Cyberpunk: Phục dựng ký ức năm 2088',
    topic: 'Tại siêu đô thị năm 2088, một kỹ sư phục chế ký ức phát hiện ra mảnh chip chứa cảm xúc tự nhiên cuối cùng của loài người trước khi bị AI kiểm soát hoàn toàn',
    genre: 'scifi_cyberpunk' as VideoGenre,
    duration: '3min' as const,
  },
  {
    icon: '☕',
    label: 'TVC Quảng Cáo: Hương vị cà phê mộc cao nguyên',
    topic: 'Hành trình từ giọt sương mai trên đồi cà phê bazan đến tách espresso sánh mịn đánh thức bản lĩnh của doanh nhân trẻ',
    genre: 'tvc_commercial' as VideoGenre,
    duration: '60s' as const,
  },
  {
    icon: '🕵️',
    label: 'Trinh thám phá án: Manh mối đồng hồ cổ',
    topic: 'Thám tử tư điều tra vụ mất tích bí ẩn trong dinh thự cổ, phát hiện chiếc kim giây đồng hồ quả lắc đang chạy giật lùi để giấu mật mã mở căn hầm',
    genre: 'action_thriller' as VideoGenre,
    duration: '3min' as const,
  },
  {
    icon: '❤️',
    label: 'Drama gia đình: Bữa cơm nghèo và ước mơ của con',
    topic: 'Người cha làm nghề phụ hồ đạp xe cọc cạch chắt chiu từng đồng tiền công để mua chiếc máy tính đầu tiên cho con gái đỗ đại học',
    genre: 'drama' as VideoGenre,
    duration: '3min' as const,
  },
  {
    icon: '😂',
    label: 'TikTok Viral: Phỏng vấn xin việc và Chủ tịch giả nghèo',
    topic: 'Ứng viên tự phụ đi phỏng vấn xin việc coi thường người bảo vệ già, không ngờ đó chính là Chủ tịch tập đoàn đang thử thách nhân cách',
    genre: 'tiktok_viral' as VideoGenre,
    duration: '60s' as const,
  },
  {
    icon: '⚔️',
    label: 'Cổ trang kiếm hiệp: Tiếng sáo trong rừng trúc',
    topic: 'Hiệp khách ẩn dật rửa tay gác kiếm nơi sơn cước, nhưng buộc phải xuất chiêu lần cuối khi đám sát thủ truy sát một đứa trẻ mang ngọc tỷ hoàng triều',
    genre: 'historical_fantasy' as VideoGenre,
    duration: '3min' as const,
  },
  {
    icon: '🚦',
    label: 'Cảnh báo giao thông: Chậm 3 giây đèn vàng',
    topic: 'Tài xế vội vã vượt đèn vàng lúc 2 giây tại ngã tư và bài học cảnh tỉnh về sự an toàn và trách nhiệm với người thân chờ đợi ở nhà',
    genre: 'drama_psa' as VideoGenre,
    duration: '3min' as const,
  },
];

export interface RealtimeSuggestion {
  label: string;
  topic: string;
  genre: VideoGenre;
  genreLabel: string;
  duration: '30s' | '60s' | '2min' | '3min' | '5min';
  tone: string;
  icon: string;
  angle: string;
}

// Instant synchronous heuristic generator for 0ms response on every keystroke
function generateInstantSuggestions(query: string, _currentGenre: VideoGenre): RealtimeSuggestion[] {
  const q = query.trim();
  if (!q) return [];
  const lower = q.toLowerCase();

  const isTraffic = /vượt đèn|đèn đỏ|đèn vàng|giao thông|tai nạn|xe máy|ô tô|xe tải|container|csgt|phạt nguội|cứu thương|nồng độ cồn|say xỉn|mũ bảo hiểm|lạng lách/i.test(lower);
  const isCoffeeOrProduct = /cà phê|coffee|trà|mỹ phẩm|son|quần áo|thời trang|đồng hồ|giày|sản phẩm|nước hoa|bánh|ẩm thực|du lịch|resort|spa/i.test(lower);
  const isSciFi = /vũ trụ|tương lai|robot|ai|trí tuệ nhân tạo|hologram|cyberpunk|khoa học|viễn tưởng|máy tính|chiến hạm|người máy|năm 20|lượng tử/i.test(lower);
  const isDetective = /án mạng|thám tử|mất tích|bí ẩn|chìa khóa|điều tra|tội phạm|vết máu|nhật ký|bức thư|chủ mưu|trinh thám|giật gân|vụ án/i.test(lower);
  const isEmotional = /cha|mẹ|bố|con|gia đình|nghèo|nước mắt|chắt chiu|hy sinh|bệnh viện|bữa cơm|quê hương|ký ức|tuổi thơ/i.test(lower);
  const isComedy = /hài|cười|vui|troll|bảo vệ|chủ tịch|xin việc|công sở|tiktok|ngố|bá đạo|vợ chồng/i.test(lower);
  const isMartialArts = /kiếm|cổ trang|hiệp khách|sát thủ|triều đình|hoàng đế|sơn cước|võ công|rừng trúc|dã sử/i.test(lower);

  const list: RealtimeSuggestion[] = [];

  if (isTraffic) {
    list.push({
      label: `Cảnh Báo Kịch Tính: ${q.slice(0, 26)}`,
      topic: `Tình huống kịch tính bám sát chủ đề: "${q}". Camera hành trình POV ghi lại khoảnh khắc thót tim khi một phương tiện vội vã 3 giây định mệnh và bài học an toàn sâu sắc.`,
      genre: 'drama_psa',
      genreLabel: 'Tiểu Phẩm Cảnh Báo',
      duration: '3min',
      tone: 'Kịch tính, dồn dập, cảnh báo sâu sắc',
      icon: '🚦',
      angle: 'Cảnh Báo An Toàn',
    });
    list.push({
      label: `Viral TikTok 60s: Cú Phanh Định Mệnh`,
      topic: `Clip 60s tái hiện khoảnh khắc suýt va chạm khi "${q}", kết thúc bằng hình ảnh đứa con nhỏ ở nhà đợi cha mẹ trở về an toàn.`,
      genre: 'tiktok_viral',
      genreLabel: 'Video Ngắn 60s Viral',
      duration: '60s',
      tone: 'Nhanh, cảm xúc chạm đến trái tim',
      icon: '⚡',
      angle: 'Cú Lật Cảm Xúc 60s',
    });
    list.push({
      label: `Mắt Thần Phạt Nguội: Quy Trình VNeID`,
      topic: `Quy trình camera AI giám sát thông minh truy vết biển số xe khi xảy ra "${q}", gửi thông báo xử phạt và trừ điểm giấy phép lái xe.`,
      genre: 'legal_explainer',
      genreLabel: 'Phân Tích Luật & AI',
      duration: '2min',
      tone: 'Khách quan, chuẩn xác, hiện đại',
      icon: '📷',
      angle: 'Công Nghệ Phạt Nguội',
    });
  } else if (isSciFi) {
    list.push({
      label: `Sci-Fi Cyberpunk: Siêu Đô Thị 2088`,
      topic: `Tại siêu đô thị tương lai 2088 ngập tràn hologram, "${q}" trở thành bí mật sống còn đe dọa sự kiểm soát của mạng lưới trí tuệ nhân tạo toàn tri.`,
      genre: 'scifi_cyberpunk',
      genreLabel: 'Khoa Học Viễn Tưởng',
      duration: '3min',
      tone: 'Huyền bí, viễn tưởng vị lai, triết học',
      icon: '🚀',
      angle: 'Kỷ Nguyên Tương Lai',
    });
    list.push({
      label: `Mã Lượng Tử: Ký Ức Đánh Rơi`,
      topic: `Một nhà nghiên cứu tìm cách phục hồi lại "${q}" - mảnh cảm xúc sinh học cuối cùng còn sót lại trước khi nhân loại bị số hóa hoàn toàn.`,
      genre: 'scifi_cyberpunk',
      genreLabel: 'Khoa Học Viễn Tưởng',
      duration: '3min',
      tone: 'Hồi hộp, điện ảnh, sâu lắng',
      icon: '🌌',
      angle: 'Du Hành Thời Gian',
    });
  } else if (isCoffeeOrProduct) {
    list.push({
      label: `TVC Mỹ Học: Đánh Thức Bản Lĩnh`,
      topic: `Thước phim quảng cáo điện ảnh tôn vinh "${q}", từ quy trình thủ công tỉ mỉ đến khoảnh khắc bùng nổ hương vị giác quan và phong thái tự tin thành đạt.`,
      genre: 'tvc_commercial',
      genreLabel: 'TVC Quảng Cáo',
      duration: '60s',
      tone: 'Sang trọng, truyền cảm hứng, mỹ thuật cao',
      icon: '☕',
      angle: 'Mỹ Học & Đẳng Cấp',
    });
    list.push({
      label: `Phim Ngắn Thương Hiệu: Đam Mê Bất Tận`,
      topic: `Hành trình của người trẻ khởi nghiệp kiên định với giấc mơ, tìm thấy điểm tựa năng lượng từ "${q}" để tạo nên thành công bứt phá.`,
      genre: 'tvc_commercial',
      genreLabel: 'Brand Storyteller',
      duration: '2min',
      tone: 'Năng động, nhiệt huyết, thôi thúc',
      icon: '✨',
      angle: 'Khởi Nghiệp & Đam Mê',
    });
  } else if (isDetective) {
    list.push({
      label: `Trinh Thám Nghẹt Thở: Vết Dấu Nửa Đêm`,
      topic: `Thám tử lần theo dấu vết hiện trường phát hiện manh mối bí ẩn xoay quanh "${q}", hé lộ âm mưu tinh vi được chuẩn bị kỹ lưỡng suốt nhiều năm.`,
      genre: 'action_thriller',
      genreLabel: 'Trinh Thám / Giật Gân',
      duration: '3min',
      tone: 'Hồi hộp, bí ẩn, suy luận logic sắc bén',
      icon: '🕵️',
      angle: 'Phá Án Suy Luận',
    });
    list.push({
      label: `Cú Lật Phút 89: Kẻ Giấu Mặt`,
      topic: `Vụ án tưởng chừng đã khép lại với "${q}", nhưng một chi tiết nhỏ bị bỏ quên làm đảo ngược hoàn toàn danh tính kẻ chủ mưu thực sự.`,
      genre: 'action_thriller',
      genreLabel: 'Giật Gân / Plot Twist',
      duration: '3min',
      tone: 'Căng thẳng, bất ngờ rợn người',
      icon: '🧩',
      angle: 'Plot Twist Đảo Chiều',
    });
  } else if (isEmotional) {
    list.push({
      label: `Phim Ngắn Cảm Động: Ước Mơ Của Cha`,
      topic: `Câu chuyện ấm áp đong đầy nước mắt về "${q}", người trụ cột gia đình thầm lặng vượt qua gian khó để mang lại nụ cười cho con cái.`,
      genre: 'drama',
      genreLabel: 'Tâm Lý Xã Hội',
      duration: '3min',
      tone: 'Chân thực, xúc động rơi lệ, giàu tình người',
      icon: '❤️',
      angle: 'Tình Cảm Gia Đình',
    });
  } else if (isComedy) {
    list.push({
      label: `Viral Hài Hước: Tình Huống Bi Hài`,
      topic: `Video ngắn 60s đầy ắp tiếng cười châm biếm về "${q}", đẩy các nhân vật vào cảnh dở khóc dở cười trước khi nhận ra bài học ý nghĩa.`,
      genre: 'comedy',
      genreLabel: 'Hài Hước / Bi Hài',
      duration: '60s',
      tone: 'Hóm hỉnh, duyên dáng, sảng khoái',
      icon: '😂',
      angle: 'Châm Biếm Hài Hước',
    });
  } else if (isMartialArts) {
    list.push({
      label: `Cổ Trang Kiếm Hiệp: Tiếng Sáo Rừng Trúc`,
      topic: `Hiệp khách ẩn mình quyết định tái xuất giang hồ vì biến cố liên quan đến "${q}", đối đầu những cao thủ bí hiểm trong màn mưa.`,
      genre: 'historical_fantasy',
      genreLabel: 'Cổ Trang Kiếm Hiệp',
      duration: '3min',
      tone: 'Hào sảng, điện ảnh kiếm hiệp, bi tráng',
      icon: '⚔️',
      angle: 'Võ Hiệp Giang Hồ',
    });
  }

  // Universal dynamic angles based on user's exact query
  if (list.length < 5) {
    list.push({
      label: `Xung Đột Kịch Tính: ${q.slice(0, 24)}`,
      topic: `Tình huống đối đầu căng thẳng xoay quanh "${q}", các nhân vật phải đấu tranh quyết liệt giữa lý trí và cảm xúc trong thời khắc quyết định.`,
      genre: 'drama',
      genreLabel: 'Drama Kịch Tính',
      duration: '3min',
      tone: 'Dồn dập, căng thẳng, diễn xuất nội tâm',
      icon: '🎭',
      angle: 'Xung Đột Kịch Tính',
    });
  }

  if (list.length < 5) {
    list.push({
      label: `Viral TikTok 60s: Cú Lật Phút Chót`,
      topic: `Tình huống mở đầu gây tò mò cực độ về "${q}", nhịp điệu nhanh dồn dập và cú bẻ lái bất ngờ ở 10 giây cuối cùng khiến người xem vỡ òa.`,
      genre: 'tiktok_viral',
      genreLabel: 'Video Ngắn 60s Viral',
      duration: '60s',
      tone: 'Bất ngờ, nhịp điệu nhanh, triệu view',
      icon: '⚡',
      angle: 'Cú Lật Bất Ngờ (Twist)',
    });
  }

  if (list.length < 5) {
    list.push({
      label: `TVC Nghệ Thuật: Tôn Vinh ${q.slice(0, 22)}`,
      topic: `Thước phim phong cách điện ảnh với các khung hình góc rộng và cận cảnh đặc tả, lột tả vẻ đẹp và câu chuyện sâu sắc phía sau "${q}".`,
      genre: 'tvc_commercial',
      genreLabel: 'TVC Điện Ảnh',
      duration: '60s',
      tone: 'Sang trọng, mỹ thuật, truyền cảm hứng',
      icon: '✨',
      angle: 'Góc Nhìn Điện Ảnh',
    });
  }

  if (list.length < 5) {
    list.push({
      label: `Sci-Fi 2088: Bí Ẩn Số Hóa ${q.slice(0, 20)}`,
      topic: `Trong tương lai nơi mọi thứ đều được lập trình, "${q}" bỗng biến thành sự kiện dị thường kích hoạt một chuỗi khám phá thay đổi thế giới.`,
      genre: 'scifi_cyberpunk',
      genreLabel: 'Khoa Học Viễn Tưởng',
      duration: '3min',
      tone: 'Huyền ảo, công nghệ, triết lý vị lai',
      icon: '🚀',
      angle: 'Tương Lai Vị Lai',
    });
  }

  return list.slice(0, 5);
}

export const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({
  initialTopic = '',
  initialGenre = 'drama_psa',
  initialDuration = '3min',
  initialTone = 'Kịch tính, dồn dập, cảnh báo sâu sắc',
  initialCustomAudience = 'Thanh thiếu niên và người tham gia giao thông',
  initialCustomSetting = 'Ngã tư nút giao trung tâm thành phố',
  initialScript = null,
  projectId,
  projectName,
  onProjectDataChange,
  onScriptGenerated,
  onUseGeneratedScript,
  onOpenTeleprompterWithScript,
  onOpenEightSecondStudioWithScript,
}) => {
  const [topic, setTopic] = useState<string>(initialTopic);
  const [duration, setDuration] = useState<'30s' | '60s' | '2min' | '3min' | '5min'>(initialDuration);
  const [genre, setGenre] = useState<VideoGenre>(initialGenre);
  const [tone, setTone] = useState<string>(initialTone);
  const [customAudience, setCustomAudience] = useState<string>(initialCustomAudience);
  const [customSetting, setCustomSetting] = useState<string>(initialCustomSetting);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedScript, setGeneratedScript] = useState<VideoScript | null>(initialScript);
  const [copied, setCopied] = useState(false);
  const [playingSceneId, setPlayingSceneId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync state if projectId changes (switching project)
  useEffect(() => {
    setTopic(initialTopic);
    setDuration(initialDuration);
    setGenre(initialGenre);
    setTone(initialTone);
    setCustomAudience(initialCustomAudience);
    setCustomSetting(initialCustomSetting);
    setGeneratedScript(initialScript);
  }, [projectId]);

  // Notify parent on data change to auto-save to project
  useEffect(() => {
    onProjectDataChange?.({
      topic,
      genre,
      duration,
      tone,
      customAudience,
      customSetting,
    });
  }, [topic, genre, duration, tone, customAudience, customSetting]);

  // Real-time suggestions state
  const [realtimeSuggestions, setRealtimeSuggestions] = useState<RealtimeSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [appliedSuggestionLabel, setAppliedSuggestionLabel] = useState<string | null>(null);
  const latestTopicRef = useRef(topic);
  latestTopicRef.current = topic;

  // Listen to topic input in real-time and provide dynamic suggestions
  useEffect(() => {
    const trimmed = topic.trim();
    if (trimmed.length < 2) {
      setRealtimeSuggestions([]);
      setIsSuggesting(false);
      return;
    }

    // 1. Instant heuristic update for 0ms latency feedback
    const instant = generateInstantSuggestions(trimmed, genre);
    setRealtimeSuggestions(instant);

    // 2. Debounced AI suggestions from Gemini Flash
    setIsSuggesting(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/suggest-topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: trimmed, currentGenre: genre }),
        });
        const data = await res.json();
        if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          if (latestTopicRef.current.trim() === trimmed) {
            setRealtimeSuggestions(data.suggestions);
          }
        }
      } catch (err) {
        console.warn('Real-time suggestion fetch error:', err);
      } finally {
        setIsSuggesting(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [topic, genre]);

  const LOADING_MESSAGES = [
    '🎬 Đang phân tích chủ đề & xây dựng cấu trúc kịch bản 3 hồi...',
    '🎥 Đang lên bảng phân cảnh (Shot-by-Shot): Cỡ cảnh, góc máy & bố cục...',
    '✍️ Đang chấp bút lời thoại nhân vật & lời bình thuyết minh Voiceover...',
    '🎵 Đang thiết kế hiệu ứng âm thanh SFX, nhạc nền & đồ họa kỹ xảo VFX...',
  ];

  // Speech preview
  const speakText = (text: string, sceneId: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ Text-to-Speech.');
      return;
    }

    if (playingSceneId === sceneId) {
      window.speechSynthesis.cancel();
      setPlayingSceneId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.onend = () => setPlayingSceneId(null);
    utterance.onerror = () => setPlayingSceneId(null);

    setPlayingSceneId(sceneId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectTrending = (item: typeof TRENDING_TOPICS[0]) => {
    setTopic(item.topic);
    setGenre(item.genre);
    setDuration(item.duration);
  };

  const handleApplySuggestion = (sug: RealtimeSuggestion, autoGenerate: boolean = false) => {
    setTopic(sug.topic);
    setGenre(sug.genre);
    setDuration(sug.duration);
    setTone(sug.tone);
    setAppliedSuggestionLabel(sug.label);
    setTimeout(() => setAppliedSuggestionLabel(null), 2000);

    if (autoGenerate) {
      handleGenerate(sug.topic, sug.genre, sug.duration, sug.tone);
    }
  };

  const handleGenerate = async (
    overrideTopic?: string,
    overrideGenre?: VideoGenre,
    overrideDuration?: '30s' | '60s' | '2min' | '3min' | '5min',
    overrideTone?: string
  ) => {
    const activeTopic = (overrideTopic || topic).trim() || 'Người lái xe vượt đèn đỏ tại ngã tư và bài học cảnh tỉnh';
    const activeGenre = overrideGenre || genre;
    const activeDuration = overrideDuration || duration;
    const activeTone = overrideTone || tone;

    setIsLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: activeTopic,
          genre: activeGenre,
          duration: activeDuration === '30s' ? '30 giây' : activeDuration === '60s' ? '60 giây' : activeDuration === '2min' ? '2 phút' : activeDuration === '3min' ? '3 phút' : '5 phút',
          tone: activeTone,
          customAudience,
          customSetting,
        }),
      });

      const data = await response.json();
      if (data.script) {
        setGeneratedScript(data.script);
        onScriptGenerated?.(data.script);
      } else {
        throw new Error(data.error || 'Không thể tạo kịch bản.');
      }
    } catch (err) {
      console.error('Lỗi khi gọi API sinh kịch bản:', err);
      // Client-side emergency fallback
      const fallback: VideoScript = {
        id: `script-${Date.now()}`,
        title: `KỊCH BẢN PHIM: ${activeTopic.toUpperCase()}`,
        subtitle: `Kịch bản điện ảnh chuẩn phân cảnh - Chủ đề: ${activeTopic}`,
        genre,
        genreLabel: genre === 'tiktok_viral' ? 'Video Ngắn 60s Viral' : 'Tiểu Phẩm Kịch Tính',
        targetDuration: duration === '60s' ? '60 giây' : '3 phút',
        targetAudience: customAudience,
        tone,
        logline: `Tình huống cảnh báo sâu sắc xoay quanh chủ đề: "${activeTopic}", nhấn mạnh vào hậu quả của sự hấp tấp và cái giá đắt của việc vượt đèn đỏ.`,
        characters: [
          { name: 'Nhân vật chính', role: 'Người lái xe điều khiển phương tiện vội vã', costume: 'Trang phục thường nhật' },
          { name: 'Người đi đường', role: 'Nạn nhân đối đầu suýt xảy ra tai nạn', costume: 'Trang phục công sở' },
          { name: 'Cán bộ CSGT / MC', role: 'Thuyết minh và xử lý vi phạm', costume: 'Trang phục cảnh sát hoặc BTV' },
        ],
        propsLocations: {
          locations: [customSetting, 'Trong cabin xe', 'Trụ sở Đội CSGT'],
          props: ['Phương tiện xe máy / ô tô', 'Điện thoại thông minh', 'Camera phạt nguội'],
        },
        scenes: [
          {
            id: 1,
            timeCode: '00:00 - 00:25',
            shotType: 'Toàn cảnh (Wide Shot)',
            setting: customSetting,
            visualAction: `Góc máy toàn cảnh: Dòng xe nườm nượp qua lại. Nhân vật chính điều khiển phương tiện với vẻ mặt căng thẳng. Đèn giao thông nhảy từ xanh sang vàng.`,
            actorDialogue: 'Nhân vật chính: "Nhanh chân ga một chút là qua kịp!"',
            voiceoverNarration: `Tại các ngã tư đô thị, ranh giới giữa an toàn và tai họa đôi khi chỉ cách nhau đúng 3 giây đèn vàng: ${activeTopic}.`,
            soundEffects: 'Tiếng còi xe đô thị, tiếng động cơ tăng ga dồn dập.',
            vfxGraphics: `Dòng chữ điện ảnh: "${activeTopic.toUpperCase()}"`,
          },
          {
            id: 2,
            timeCode: '00:25 - 00:55',
            shotType: 'Cận cảnh đặc tả (Extreme Close-up)',
            setting: 'Chân ga và bàn đạp phanh',
            visualAction: 'Bàn chân nhấn mạnh chân ga để cố vượt qua vạch dừng khi đèn đã đỏ rực. Bánh xe đè qua vạch sơn 7.1.',
            voiceoverNarration: 'Một quyết định liều lĩnh chỉ trong 1 giây có thể biến bạn thành nguồn nguy hiểm cho hàng chục người vô tội.',
            soundEffects: 'Tiếng rú ga xé gió, tiếng tim đập hồi hộp.',
            vfxGraphics: 'Hiệu ứng Slow-motion tại vạch dừng màu trắng.',
          },
          {
            id: 3,
            timeCode: '00:55 - 01:40',
            shotType: 'Góc nhìn người lái (POV Dashcam)',
            setting: 'Tâm giao lộ ngã tư',
            visualAction: 'Góc nhìn từ kính lái: Đúng lúc lao vào ngã tư thì phương tiện khác đi đúng đèn xanh xuất hiện. Cú phanh cháy đường trong gang tấc.',
            actorDialogue: 'Người đi đường: "Đi kiểu gì đấy? Muốn tự sát à?!"',
            voiceoverNarration: 'Khoảng cách giữa sự sống và cái chết chỉ là 30 centimet. Không phải lúc nào may mắn cũng mỉm cười.',
            soundEffects: 'Tiếng phanh xe rít chói tai, tiếng còi kéo dài.',
            vfxGraphics: 'Màn hình rung lắc giật nảy.',
          },
          {
            id: 4,
            timeCode: '01:40 - 02:20',
            shotType: 'Trung cảnh (Medium Shot)',
            setting: 'Trung tâm giám sát camera AI',
            visualAction: 'Hình ảnh 3 khung hình bằng chứng phạt nguội rõ nét. Nhân vật nhận biên bản xử phạt và thông báo tước bằng lái.',
            voiceoverNarration: 'Mắt thần thông minh 24/7 ghi nhận mọi hành vi vi phạm. Không ai có thể trốn tránh trách nhiệm pháp lý.',
            soundEffects: 'Tiếng bàn phím máy tính, tiếng đóng dấu đỏ.',
            vfxGraphics: 'Biên lai phạt tiền triệu và tước bằng lái 3 tháng.',
          },
          {
            id: 5,
            timeCode: '02:20 - 03:00',
            shotType: 'Toàn cảnh (Wide Shot)',
            setting: 'Ngã tư bình yên',
            visualAction: 'Các phương tiện dừng lại ngay ngắn trước vạch dừng. Đèn xanh sáng lên, giao thông thông suốt.',
            voiceoverNarration: 'Chậm lại 3 giây đèn đỏ để giữ trọn vẹn một đời bình an. Vì phía sau tay lái là gia đình bạn đang chờ đợi!',
            soundEffects: 'Nhạc giao hưởng ấm áp kết thúc.',
            vfxGraphics: 'Slogan: "NHANH MỘT GIÂY - CHẬM MỘT ĐỜI".',
          },
        ],
        coreMessage: 'An toàn giao thông là không vội vã. Hãy luôn chủ động dừng trước đèn vàng!',
        callToAction: 'Lan tỏa video này để mọi người cùng nâng cao ý thức dừng đèn đỏ!',
      };
      setGeneratedScript(fallback);
      onScriptGenerated?.(fallback);
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedScript) return;
    let md = `# KỊCH BẢN ĐIỆN ẢNH: ${generatedScript.title.toUpperCase()}\n`;
    md += `**Thể loại:** ${generatedScript.genreLabel} | **Thời lượng:** ${generatedScript.targetDuration}\n`;
    md += `**Tông giọng:** ${generatedScript.tone}\n`;
    md += `**Logline:** ${generatedScript.logline}\n\n`;
    md += `## BẢNG PHÂN VAI & ĐẠO CỤ:\n`;
    generatedScript.characters?.forEach((c) => {
      md += `- ${c.name}: ${c.role} (${c.costume})\n`;
    });
    md += `\n## BẢNG PHÂN CẢNH CHI TIẾT (SHOT BY SHOT):\n\n`;
    generatedScript.scenes.forEach((s) => {
      md += `### CẢNH ${s.id} [${s.timeCode}] - ${s.shotType}\n`;
      md += `- Bối cảnh: ${s.setting}\n`;
      md += `- Hình ảnh & Diễn xuất: ${s.visualAction}\n`;
      if (s.actorDialogue) md += `- Lời thoại: ${s.actorDialogue}\n`;
      md += `- Lời dẫn Voiceover: "${s.voiceoverNarration}"\n`;
      md += `- Âm thanh SFX: ${s.soundEffects}\n`;
      if (s.vfxGraphics) md += `- Kỹ xảo VFX: ${s.vfxGraphics}\n`;
      md += `\n------------------------------------\n\n`;
    });
    md += `**Thông điệp cốt lõi:** ${generatedScript.coreMessage}\n`;
    md += `**Slogan kết phim:** ${generatedScript.callToAction}\n`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Studio Banner / Creator Console */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
              <Clapperboard className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  XƯỞNG BIÊN KỊCH ĐIỆN ẢNH AI
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Phân Cảnh Quay • Lời Thoại • Voiceover Chuẩn
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Bạn chỉ cần nhập bất kỳ chủ đề hoặc ý tưởng nào — Trí tuệ nhân tạo sẽ tự động xuất trọn vẹn kịch bản phim phân cảnh theo đúng chuẩn Đạo diễn & Truyền hình.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>{showAdvanced ? 'Ẩn tùy chọn nâng cao' : 'Tùy chọn nâng cao'}</span>
            </button>
          </div>
        </div>

        {/* Big Topic Input Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Nhập Chủ Đề Phim / Ý Tưởng Video Bạn Muốn Làm:</span>
            </label>
            {topic && (
              <span className="text-[11px] text-slate-400 font-mono">
                {topic.length} ký tự
              </span>
            )}
          </div>

          <div className="relative group">
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Nhập bất kỳ ý tưởng, thể loại hoặc tình huống nào (ví dụ: 'Phim ngắn thám tử truy tìm bức thư mật', 'TVC quảng cáo cà phê mộc đánh thức bản lĩnh', 'Khoa học viễn tưởng trạm không gian năm 2150', 'Chuyện gia đình người thợ may già chắt chiu nuôi con', 'Video viral TikTok tình huống công sở bi hài', 'Cảnh báo an toàn giao thông vượt đèn đỏ')..."
              className="w-full bg-slate-950/90 border-2 border-slate-700 focus:border-blue-500 rounded-xl p-4 pr-10 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner resize-none font-medium leading-relaxed"
            />
            {topic.length > 0 && (
              <button
                type="button"
                onClick={() => setTopic('')}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/60 transition-colors"
                title="Xóa ý tưởng nhập lại"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Real-time Suggestions or Trending Topics */}
          {topic.trim().length === 0 ? (
            /* Default: Quick Trending Topic Suggestions when topic is empty */
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span className="font-semibold text-slate-300">Gợi ý chủ đề nóng (bấm chọn nhanh để bắt đầu):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TOPICS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectTrending(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500 hover:bg-slate-800/80 text-xs text-slate-300 hover:text-white transition-all text-left group"
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Dynamic Real-time Suggestions tailored to user's keystrokes */
            <div className="flex flex-col gap-2.5 pt-1 pb-1">
              {/* Header Status Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> GỢI Ý THỜI GIAN THỰC THEO Ý TƯỞNG:
                  </span>
                  <span className="text-slate-200 font-medium truncate max-w-[220px] sm:max-w-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                    "{topic}"
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isSuggesting && (
                    <span className="text-[11px] text-blue-400 flex items-center gap-1.5 animate-pulse bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      <Sparkles className="w-3 h-3" /> Đang cập nhật góc nhìn mới...
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setTopic('')}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800"
                  >
                    <X className="w-3 h-3" /> Xóa ô nhập
                  </button>
                </div>
              </div>

              {/* Suggestions Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {realtimeSuggestions.map((sug, idx) => {
                  const isApplied = appliedSuggestionLabel === sug.label;
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all ${
                        isApplied
                          ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/50'
                          : 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-800 hover:border-blue-500/60'
                      }`}
                    >
                      <div>
                        {/* Top: Icon + Label + Angle Pill */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{sug.icon}</span>
                            <span className="font-bold text-xs sm:text-sm text-white">
                              {sug.label}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 shrink-0">
                            {sug.angle}
                          </span>
                        </div>

                        {/* Middle: Rich story premise teaser */}
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
                          {sug.topic}
                        </p>
                      </div>

                      {/* Bottom Meta & Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                            {sug.genreLabel}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span>{sug.duration}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApplySuggestion(sug, false)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isApplied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <Check className="w-3 h-3 text-white" />
                                <span>Đã áp dụng!</span>
                              </>
                            ) : (
                              <>
                                <CornerDownRight className="w-3 h-3 text-blue-400" />
                                <span>Áp dụng</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApplySuggestion(sug, true)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm transition-all"
                            title="Áp dụng và bắt đầu tạo kịch bản ngay"
                          >
                            <Zap className="w-3 h-3 text-amber-300" />
                            <span>Tạo ngay</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Append Tags to expand ideas */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[11px] text-slate-400">
                <span className="shrink-0 text-slate-500 font-medium">Thêm chi tiết:</span>
                {[
                  '+ Cú twist phút chót',
                  '+ Góc quay Slow-motion 120fps',
                  '+ Kết thúc xúc động chạm đáy cảm xúc',
                  '+ Nhịp điệu dồn dập nghẹt thở',
                  '+ Góc nhìn máy quay POV',
                ].map((tag, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => setTopic((prev) => `${prev.trim()}, ${tag.replace('+ ', '')}`)}
                    className="shrink-0 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-200 text-slate-400 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Settings: Genre & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800/60 mt-1">
            {/* Genre */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Thể Loại Phim:
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as VideoGenre)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="scifi_cyberpunk">🚀 Khoa Học Viễn Tưởng (Sci-Fi / Cyberpunk)</option>
                <option value="tvc_commercial">☕ TVC Quảng Cáo & Video Sản Phẩm</option>
                <option value="drama">🎭 Phim Ngắn / Drama Tâm Lý Xã Hội</option>
                <option value="action_thriller">🕵️ Hành Động / Trinh Thám / Giật Gân</option>
                <option value="tiktok_viral">📱 Video Ngắn 60s Viral (TikTok/Shorts)</option>
                <option value="historical_fantasy">⚔️ Cổ Trang / Dã Sử / Kiếm Hiệp</option>
                <option value="comedy">😄 Hài Hước / Tình Huống Bi Hài</option>
                <option value="horror_mystery">👻 Kinh Dị / Bí Ẩn Rùng Rợn</option>
                <option value="documentary">📽️ Phim Tài Liệu & Phóng Sự Khám Phá</option>
                <option value="education_explainer">💡 Video Giáo Dục & Kiến Thức</option>
                <option value="drama_psa">🚦 Tiểu Phẩm Tuyên Truyền & Cảnh Báo</option>
                <option value="reportage_tv">📺 Phóng Sự Truyền Hình Thời Sự</option>
                <option value="legal_explainer">⚖️ Đồ Họa Phân Tích Pháp Luật</option>
                <option value="emotional_story">❤️ Phim Ngắn Cảm Động Gia Đình</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Thời Lượng:
              </label>
              <div className="grid grid-cols-5 gap-1">
                {(['30s', '60s', '2min', '3min', '5min'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-2 px-1 rounded-lg border font-mono font-bold text-xs transition-colors text-center ${
                      duration === d
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Tông Giọng & Sắc Thái:
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="Kịch tính, dồn dập, cảnh báo sâu sắc">Kịch tính, dồn dập, căng thẳng</option>
                <option value="Cảm động rơi nước mắt, bài học gia đình">Cảm động, tình cảm gia đình</option>
                <option value="Châm biếm hài hước sâu cay, dí dỏm">Châm biếm hài hước, phê phán nhẹ nhàng</option>
                <option value="Nghiêm cẩn, phóng sự điều tra sắc sảo">Nghiêm cẩn, phóng sự điều tra</option>
              </select>
            </div>

            {/* Generate Action Button */}
            <div className="flex items-end">
              <button
                id="btn-generate-script"
                onClick={() => handleGenerate()}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50 transition-all cursor-pointer h-[42px]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang bấm máy...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-200" />
                    <span>BẤM MÁY TẠO KỊCH BẢN</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Advanced Options Drawer */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 mt-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Bối cảnh quay cụ thể:
                </label>
                <input
                  type="text"
                  value={customSetting}
                  onChange={(e) => setCustomSetting(e.target.value)}
                  placeholder="Ví dụ: Ngã tư phố cổ Hà Nội, Ngã 6 Dân Chủ TP.HCM, Đường đèo dốc..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Đối tượng người xem trọng tâm:
                </label>
                <input
                  type="text"
                  value={customAudience}
                  onChange={(e) => setCustomAudience(e.target.value)}
                  placeholder="Ví dụ: Học sinh sinh viên, Tài xế công nghệ, Người lái ô tô gia đình..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Animation Card */}
      {isLoading && (
        <div className="bg-slate-900 border border-blue-500/40 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4 shadow-2xl animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Clapperboard className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              ĐẠO DIỄN AI ĐANG LÊN KỊCH BẢN ĐIỆN ẢNH
            </h3>
            <p className="text-sm text-blue-400 font-medium">
              {LOADING_MESSAGES[loadingStep]}
            </p>
          </div>
          <div className="w-full max-w-md bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 mt-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-amber-400 h-full transition-all duration-700" 
              style={{ width: `${((loadingStep + 1) / LOADING_MESSAGES.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Result Section: Generated Script */}
      {generatedScript && !isLoading && (
        <div className="flex flex-col gap-5">
          {/* Header Action Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  {generatedScript.genreLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {generatedScript.targetDuration}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {generatedScript.scenes.length} Phân Cảnh Quay
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {generatedScript.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 italic">
                "{generatedScript.logline}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onUseGeneratedScript(generatedScript)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-colors cursor-pointer"
              >
                <Film className="w-4 h-4" />
                <span>Xem Bảng Phân Cảnh Toàn Diện</span>
              </button>

              <button
                onClick={() => {
                  onUseGeneratedScript(generatedScript);
                  if (typeof onOpenEightSecondStudioWithScript === 'function') {
                    onOpenEightSecondStudioWithScript(generatedScript);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer border border-indigo-400/30"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>🎬 Chia Nhỏ 8s & Prompts AI Video</span>
              </button>

              <button
                onClick={() => {
                  onUseGeneratedScript(generatedScript);
                  if (typeof onOpenTeleprompterWithScript === 'function') {
                    onOpenTeleprompterWithScript(generatedScript);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
              >
                <Tv className="w-4 h-4" />
                <span>Đưa Vào Máy Nhắc Chữ</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép văn bản'}</span>
              </button>

              <button
                onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>{editMode ? 'Khóa chỉnh sửa' : 'Chỉnh sửa'}</span>
              </button>
            </div>
          </div>

          {/* Cast & Props Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Characters */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 mb-2.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Bảng Phân Vai Diễn Viên:</span>
              </div>
              <div className="flex flex-col gap-2">
                {generatedScript.characters?.map((c, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>{c.name}</span>
                      <span className="text-slate-400 font-normal">{c.role}</span>
                    </div>
                    {c.costume && (
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Trang phục: {c.costume}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Locations & Props */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 mb-2.5">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Bối Cảnh & Đạo Cụ Đoàn Phim:</span>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="font-bold text-slate-300 block mb-1">Địa điểm quay:</span>
                  <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                    {generatedScript.propsLocations?.locations?.map((loc, i) => (
                      <li key={i}>{loc}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="font-bold text-slate-300 block mb-1">Đạo cụ & Thiết bị:</span>
                  <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                    {generatedScript.propsLocations?.props?.map((prop, i) => (
                      <li key={i}>{prop}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Shot-by-Shot Scenes */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-blue-400" />
                <span>Bảng Phân Cảnh Chi Tiết (Shot-by-Shot Director Breakdown)</span>
              </h3>
              <span className="text-xs text-slate-400">
                Nhấn biểu tượng Loa để đọc thử Voiceover tiếng Việt
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {generatedScript.scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 shadow-sm transition-all"
                >
                  {/* Scene Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                        #{scene.id}
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {scene.timeCode}
                      </span>
                      <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                        {scene.shotType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakText(scene.voiceoverNarration, scene.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          playingSceneId === scene.id
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                      >
                        {playingSceneId === scene.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>Dừng đọc</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Đọc thử giọng dẫn</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Scene Body Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                    {/* Visual & Dialogue */}
                    <div className="flex flex-col gap-2.5">
                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                          Bối cảnh:
                        </span>
                        <p className="text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                          {scene.setting}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px] block mb-1">
                          Hành động diễn xuất & Hình ảnh quay:
                        </span>
                        {editMode ? (
                          <textarea
                            rows={3}
                            value={scene.visualAction}
                            onChange={(e) => {
                              const updatedScenes = generatedScript.scenes.map((s) =>
                                s.id === scene.id ? { ...s, visualAction: e.target.value } : s
                              );
                              setGeneratedScript({ ...generatedScript, scenes: updatedScenes });
                            }}
                            className="w-full bg-slate-950 border border-slate-700 p-2 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                          />
                        ) : (
                          <p className="text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed font-medium">
                            {scene.visualAction}
                          </p>
                        )}
                      </div>

                      {scene.actorDialogue && (
                        <div>
                          <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] block mb-1">
                            Lời thoại nhân vật:
                          </span>
                          <p className="text-amber-200 bg-amber-950/20 border border-amber-500/20 p-2 rounded-lg font-mono italic">
                            "{scene.actorDialogue}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Voiceover, SFX, VFX */}
                    <div className="flex flex-col gap-2.5">
                      <div>
                        <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] block mb-1">
                          Lời bình thuyết minh (MC / Voiceover):
                        </span>
                        {editMode ? (
                          <textarea
                            rows={3}
                            value={scene.voiceoverNarration}
                            onChange={(e) => {
                              const updatedScenes = generatedScript.scenes.map((s) =>
                                s.id === scene.id ? { ...s, voiceoverNarration: e.target.value } : s
                              );
                              setGeneratedScript({ ...generatedScript, scenes: updatedScenes });
                            }}
                            className="w-full bg-slate-950 border border-slate-700 p-2 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                          />
                        ) : (
                          <p className="text-emerald-300 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg leading-relaxed">
                            "{scene.voiceoverNarration}"
                          </p>
                        )}
                      </div>

                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                          Âm thanh & Tiếng động (SFX / Music):
                        </span>
                        <p className="text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                          {scene.soundEffects}
                        </p>
                      </div>

                      {scene.vfxGraphics && (
                        <div>
                          <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px] block mb-1">
                            Kỹ xảo & Đồ họa hiển thị (VFX):
                          </span>
                          <p className="text-purple-300 bg-purple-950/20 border border-purple-500/20 p-2 rounded-lg text-[11px]">
                            {scene.vfxGraphics}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slogan & Call to action */}
          <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 rounded-xl p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
              Thông Điệp & Slogan Kết Phim (Call To Action)
            </span>
            <p className="text-lg font-black text-white">
              "{generatedScript.callToAction}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
