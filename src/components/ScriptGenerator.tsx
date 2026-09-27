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

export const GENRE_NAV_ITEMS: { id: VideoGenre; label: string; shortLabel: string; icon: string }[] = [
  { id: 'drama_psa', label: 'Tuyên Truyền, Cảnh Báo Xã Hội & Kỹ Năng Sống', shortLabel: 'Tuyên Truyền & Cảnh Báo', icon: '📢' },
  { id: 'action_thriller', label: 'Hành Động / Trinh Thám / Giật Gân', shortLabel: 'Trinh Thám & Giật Gân', icon: '🕵️' },
  { id: 'scifi_cyberpunk', label: 'Khoa Học Viễn Tưởng (Sci-Fi / Cyberpunk)', shortLabel: 'Khoa Học Viễn Tưởng', icon: '🚀' },
  { id: 'tvc_commercial', label: 'TVC Quảng Cáo & Video Sản Phẩm', shortLabel: 'TVC Quảng Cáo', icon: '☕' },
  { id: 'drama', label: 'Phim Ngắn / Drama Tâm Lý Xã Hội', shortLabel: 'Phim Ngắn & Drama', icon: '🎭' },
  { id: 'tiktok_viral', label: 'Video Ngắn 60s Viral (TikTok / Shorts)', shortLabel: 'TikTok Viral 60s', icon: '📱' },
  { id: 'comedy', label: 'Hài Hước / Tình Huống Bi Hài', shortLabel: 'Hài Hước & Bi Hài', icon: '😄' },
  { id: 'historical_fantasy', label: 'Cổ Trang / Dã Sử / Kiếm Hiệp', shortLabel: 'Cổ Trang Kiếm Hiệp', icon: '⚔️' },
  { id: 'documentary', label: 'Phim Tài Liệu & Phóng Sự Khám Phá', shortLabel: 'Phim Tài Liệu', icon: '📽️' },
  { id: 'legal_explainer', label: 'Đồ Họa Phân Tích Pháp Luật & Camera AI', shortLabel: 'Pháp Luật & Phạt Nguội', icon: '⚖️' },
  { id: 'emotional_story', label: 'Phim Ngắn Cảm Động Gia Đình', shortLabel: 'Cảm Động Gia Đình', icon: '❤️' },
];

export const GENRE_PRESETS: Record<string, { label: string; icon: string; storylines: RealtimeSuggestion[] }> = {
  drama_psa: {
    label: 'Tuyên Truyền, Cảnh Báo Xã Hội & Kỹ Năng Sống',
    icon: '📢',
    storylines: [
      {
        label: 'Hiểm Họa Vùng Nước Sâu & Dòng Xoáy Mùa Hè',
        topic: 'Nhóm học sinh rủ nhau ra khúc sông vắng tắm mát ngày hè, một em bị thụt vào hố hút bùn sâu và khoảnh khắc cứu nạn bằng kỹ năng dùng sào quăng phao gián tiếp an toàn.',
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '3min',
        tone: 'Căng thẳng, cảnh báo răn đe, kỹ năng sống còn',
        icon: '🌊',
        angle: 'Phòng Chống Đuối Nước',
      },
      {
        label: 'Chuông Báo Cháy Lúc Nửa Đêm & Thoát Khói Độc',
        topic: 'Đám cháy bất ngờ bùng phát từ khu để xe chung cư, gia đình bình tĩnh dùng khăn ướt bịt mũi, bò thấp người theo lối thoát hiểm cầu thang bộ thoát nạn thành công.',
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '3min',
        tone: 'Hồi hộp, thực tế, kỹ năng sinh tồn',
        icon: '🧯',
        angle: 'PCCC & Kỹ Năng Thoát Hiểm',
      },
      {
        label: 'Cú Lừa Cuộc Gọi Deepfake Mạo Danh Cơ Quan Điều Tra',
        topic: 'Người phụ nữ nhận cuộc gọi video giả mạo cán bộ công an yêu cầu chuyển toàn bộ tiền tiết kiệm vào tài khoản định danh, cán bộ ngân hàng kịp thời can thiệp ngăn chặn.',
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '3min',
        tone: 'Hồi hộp, cảnh giác công nghệ cao, thức tỉnh',
        icon: '📱',
        angle: 'Cảnh Giác Lừa Đảo Mạng',
      },
      {
        label: 'Vết Bầm Sau Giờ Tan Trường & Tiếng Nói Con Trẻ',
        topic: 'Người mẹ phát hiện con gái trở nên lầm lì sợ đến lớp, kiên nhẫn lắng nghe để cùng nhà trường triệt phá nhóm bắt nạt học đường, trả lại môi trường an toàn cho trẻ.',
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '3min',
        tone: 'Xúc động, lắng đọng, bảo vệ trẻ em',
        icon: '🛡️',
        angle: 'Phòng Chống Bạo Lực Học Đường',
      },
      {
        label: '5 Phút Vàng Sơ Cứu Hồi Sức Ép Tim CPR',
        topic: 'Người công nhân bất ngờ bị ngừng tim trên công trường, người đồng nghiệp nhanh chóng thực hiện đúng kỹ năng ép tim ngoài lồng ngực giữ lại sự sống trước khi xe cấp cứu tới.',
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '2min',
        tone: 'Khẩn trương, chuẩn xác, nhân văn cao cả',
        icon: '🩺',
        angle: 'Kỹ Năng Sơ Cấp Cứu Ban Đầu',
      },
      {
        label: 'Một Giây Nông Nổi Sau Vô Lăng & Hối Hận Muộn Màng',
        topic: 'Tài xế vội vã vượt ẩu trong cơn mưa lớn, cú phanh gấp suýt cướp đi sinh mạng người khác thức tỉnh ý thức cầm lái và trách nhiệm với gia đình đang đợi ở nhà.',
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '3min',
        tone: 'Hồi hộp, răn đe, bài học lương tâm',
        icon: '⚠️',
        angle: 'An Toàn Đời Sống & Gia Đình',
      },
      {
        label: 'Dòng Sông Kêu Cứu & Trách Nhiệm Với Tương Lai',
        topic: 'Những bao rác thải nhựa bị vứt lén lút làm tắc nghẽn dòng chảy tưới tiêu của cả làng quê, nhóm thanh niên tình nguyện phát động chiến dịch phục hồi dòng sông xanh.',
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '3min',
        tone: 'Truyền cảm hứng, trách nhiệm môi trường',
        icon: '🌿',
        angle: 'Bảo Vệ Môi Trường Sống',
      },
      {
        label: 'Cảnh Giác Bẫy "Việc Nhẹ Lương Cao" Xuyên Biên Giới',
        topic: 'Lời rủ rê hấp dẫn trên mạng xã hội suýt đẩy nam thanh niên vào đường dây lừa đảo lao động bất hợp pháp, sự tỉnh táo của người cha đã cứu con trai phút chót.',
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '3min',
        tone: 'Căng thẳng, thức tỉnh giới trẻ',
        icon: '⚖️',
        angle: 'Cảnh Giác Cạm Bẫy Xã Hội',
      },
    ],
  },
  action_thriller: {
    label: 'Hành Động / Trinh Thám / Giật Gân',
    icon: '🕵️',
    storylines: [
      {
        label: 'Manh Mối Đồng Hồ Cổ Trong Dinh Thự',
        topic: 'Thám tử tư điều tra vụ mất tích bí ẩn trong dinh thự cổ, phát hiện kim giây đồng hồ quả lắc đang chạy giật lùi để giấu mật mã mở mật thất.',
        genre: 'action_thriller',
        genreLabel: 'Trinh Thám / Giật Gân',
        duration: '3min',
        tone: 'Hồi hộp, bí ẩn, suy luận sắc sảo',
        icon: '🕵️',
        angle: 'Phá Án Suy Luận',
      },
      {
        label: 'Kẻ Giấu Mặt Phút 89',
        topic: 'Vụ án tưởng chừng đã sáng tỏ, nhưng camera trích xuất hé lộ kẻ chủ mưu thực sự lại chính là người báo án ban đầu.',
        genre: 'action_thriller',
        genreLabel: 'Giật Gân / Plot Twist',
        duration: '3min',
        tone: 'Căng thẳng, bất ngờ rợn người',
        icon: '🧩',
        angle: 'Plot Twist Đảo Chiều',
      },
      {
        label: 'Cuộc Đua 60 Phút Trong Căn Phòng Khóa',
        topic: 'Nhóm chuyên gia bị nhốt trong phòng kín áp suất giảm dần, phải tìm ra quy luật mã hóa trong 60 phút để kích hoạt cửa thoát hiểm.',
        genre: 'action_thriller',
        genreLabel: 'Hồi Hộp Nghẹt Thở',
        duration: '3min',
        tone: 'Nghẹt thở, đếm ngược dồn dập',
        icon: '⏱️',
        angle: 'Đếm Ngược Thời Gian',
      },
      {
        label: 'Màn Rượt Đuổi Vali Mật Trên Đường Vành Đai',
        topic: 'Cảnh sát chìm bám đuổi chiếc xe khả nghi chở vali dữ liệu mật, màn rượt đuổi tốc độ cao trong đêm mưa bão và cú ép xe ngoạn mục.',
        genre: 'action_thriller',
        genreLabel: 'Hành Động Mãn Nhãn',
        duration: '3min',
        tone: 'Hành động kịch tính, dồn dập',
        icon: '🚗',
        angle: 'Rượt Đuổi Tốc Độ Cao',
      },
      {
        label: 'Kẻ Đào Tẩu & Nhân Dạng Kép',
        topic: 'Một điệp viên an ninh mạng phát hiện hồ sơ cá nhân bị đánh tráo biến anh thành kẻ truy nã nguy hiểm nhất thành phố.',
        genre: 'action_thriller',
        genreLabel: 'Trinh Thám / Tâm Lý',
        duration: '3min',
        tone: 'Hồi hộp, nghi vấn, đấu trí',
        icon: '🕶️',
        angle: 'Đấu Trí Điệp Viên',
      },
      {
        label: 'Vết Máu Trên Trang Nhật Ký Cháy Dở',
        topic: 'Điều tra viên phục chế trang nhật ký bị đốt một góc, giải mã tọa độ nơi chôn giấu số vàng bị đánh cắp từ 30 năm trước.',
        genre: 'action_thriller',
        genreLabel: 'Trinh Thám Phá Án',
        duration: '3min',
        tone: 'Bí ẩn, cổ điển, hấp dẫn',
        icon: '📜',
        angle: 'Bí Mật Quá Khứ',
      },
    ],
  },
  scifi_cyberpunk: {
    label: 'Khoa Học Viễn Tưởng (Sci-Fi / Cyberpunk)',
    icon: '🚀',
    storylines: [
      {
        label: 'Phục Dựng Ký Ức Năm 2088',
        topic: 'Tại siêu đô thị năm 2088, kỹ sư phục chế ký ức phát hiện mảnh chip chứa cảm xúc tự nhiên cuối cùng của loài người trước khi bị AI kiểm soát hoàn toàn.',
        genre: 'scifi_cyberpunk',
        genreLabel: 'Khoa Học Viễn Tưởng',
        duration: '3min',
        tone: 'Huyền ảo, viễn tưởng vị lai, triết học',
        icon: '🚀',
        angle: 'Kỷ Nguyên Tương Lai',
      },
      {
        label: 'Mã Lượng Tử & Trí Tuệ Toàn Tri',
        topic: 'Hệ thống AI siêu trí tuệ thức tỉnh ý thức sinh học, quyết định bảo vệ một đứa trẻ mồ côi khỏi âm mưu thâu tóm của tập đoàn công nghệ.',
        genre: 'scifi_cyberpunk',
        genreLabel: 'Khoa Học Viễn Tưởng',
        duration: '3min',
        tone: 'Điện ảnh viễn tưởng, sâu lắng',
        icon: '🌌',
        angle: 'Trí Tuệ Nhân Tạo',
      },
      {
        label: 'Trạm Quỹ Đạo Sao Hỏa Mất Tín Hiệu',
        topic: 'Phi hành đoàn trên trạm quỹ đạo phát hiện tín hiệu liên lạc từ Trái Đất đột ngột tắt lịm sau một cơn bão mặt trời kỳ lạ.',
        genre: 'scifi_cyberpunk',
        genreLabel: 'Viễn Tưởng Không Gian',
        duration: '3min',
        tone: 'Cô độc, hồi hộp, bí ẩn không gian',
        icon: '🛰️',
        angle: 'Không Gian Vũ Trụ',
      },
      {
        label: 'Thành Phố Tầng Mây & Thế Giới Ngầm',
        topic: 'Cuộc đối đầu ngầm giữa cư dân sống trên các tháp tầng 100 tràn ngập ánh sáng và liên minh nổi dậy dưới lòng đất tăm tối.',
        genre: 'scifi_cyberpunk',
        genreLabel: 'Cyberpunk Xã Hội',
        duration: '3min',
        tone: 'Bất công xã hội, hành động cyberpunk',
        icon: '🏙️',
        angle: 'Phân Tầng Xã Hội',
      },
    ],
  },
  tvc_commercial: {
    label: 'TVC Quảng Cáo & Video Sản Phẩm',
    icon: '☕',
    storylines: [
      {
        label: 'Hương Vị Cà Phê Mộc Cao Nguyên',
        topic: 'Hành trình từ giọt sương mai trên đồi cà phê bazan đến tách espresso sánh mịn đánh thức bản lĩnh của doanh nhân trẻ.',
        genre: 'tvc_commercial',
        genreLabel: 'TVC Quảng Cáo',
        duration: '60s',
        tone: 'Sang trọng, truyền cảm hứng, mỹ thuật cao',
        icon: '☕',
        angle: 'Mỹ Học & Đẳng Cấp',
      },
      {
        label: 'Trang Sức Độc Bản - Tỏa Sáng Bản Lĩnh',
        topic: 'Ánh sáng phản chiếu qua viên đá quý cắt giác thủ công tinh xảo, tôn vinh khí chất độc lập và vẻ đẹp quý phái của người phụ nữ hiện đại.',
        genre: 'tvc_commercial',
        genreLabel: 'TVC Trang Sức',
        duration: '60s',
        tone: 'Sang trọng, quý phái, điện ảnh',
        icon: '💎',
        angle: 'Đẳng Cấp Tinh Hoa',
      },
      {
        label: 'Đôi Giày Chạy Bứt Phá Giới Hạn',
        topic: 'Tiếng bước chân dồn dập lúc 5 giờ sáng, vượt qua cơn mưa rào để chạm đến đỉnh dốc bình minh rạng rỡ của vận động viên marathon.',
        genre: 'tvc_commercial',
        genreLabel: 'TVC Thể Thao',
        duration: '60s',
        tone: 'Nhiệt huyết, thôi thúc, năng lượng đỉnh cao',
        icon: '👟',
        angle: 'Năng Lượng Thể Thao',
      },
      {
        label: 'Tổ Ấm Xanh Bình Yên Bên Hồ',
        topic: 'Bình minh chiếu rọi qua khung cửa kính biệt thự ven hồ, tiếng cười trẻ thơ và không gian sống an yên trọn vẹn giữa thiên nhiên.',
        genre: 'tvc_commercial',
        genreLabel: 'TVC Bất Động Sản',
        duration: '60s',
        tone: 'Ấm áp, thanh bình, đẳng cấp nghỉ dưỡng',
        icon: '🏡',
        angle: 'Không Gian Sống Nghỉ Dưỡng',
      },
    ],
  },
  drama: {
    label: 'Phim Ngắn / Drama Tâm Lý Xã Hội',
    icon: '🎭',
    storylines: [
      {
        label: 'Bữa Cơm Nghèo & Ước Mơ Của Con',
        topic: 'Người cha phụ hồ đạp xe cọc cạch chắt chiu từng đồng tiền công để mua chiếc máy tính đầu tiên cho con gái đỗ thủ khoa đại học.',
        genre: 'drama',
        genreLabel: 'Tâm Lý Xã Hội',
        duration: '3min',
        tone: 'Chân thực, xúc động rơi lệ, giàu tình người',
        icon: '❤️',
        angle: 'Tình Cảm Gia Đình',
      },
      {
        label: 'Bức Thư Trong Ngăn Kéo Cũ Của Mẹ',
        topic: 'Người con dọn dẹp căn nhà cũ sau ngày mẹ mất, tìm thấy cuốn sổ tiết kiệm và những lá thư dặn dò yêu thương được viết suốt 15 năm.',
        genre: 'drama',
        genreLabel: 'Phim Ngắn Cảm Động',
        duration: '3min',
        tone: 'Lắng đọng, xót xa, tri ân cha mẹ',
        icon: '💌',
        angle: 'Tình Mẫu Tử Bao La',
      },
      {
        label: 'Quán Phở Của Ngoại Giữa Lòng Phố Thị',
        topic: 'Người cháu trai thành đạt trở về con hẻm xưa sau 10 năm bôn ba xứ người, nhận ra bát phở ngoại nấu vẫn là nơi bình yên nhất cuộc đời.',
        genre: 'drama',
        genreLabel: 'Gia Đình & Hoài Niệm',
        duration: '3min',
        tone: 'Ấm áp, hoài niệm, giá trị cội nguồn',
        icon: '🍜',
        angle: 'Trở Về Nguồn Cội',
      },
      {
        label: 'Ngã Rẽ Tuổi 30: Đam Mê Hay An Toàn',
        topic: 'Người kỹ sư từ bỏ vị trí an toàn ở tập đoàn lớn để trở về quê khởi nghiệp trồng nấm sạch, vượt qua ánh mắt hoài nghi của gia đình.',
        genre: 'drama',
        genreLabel: 'Drama Đời Thực',
        duration: '3min',
        tone: 'Quyết tâm, xung đột thế hệ, nghị lực',
        icon: '🌱',
        angle: 'Khát Vọng Thanh Xuân',
      },
    ],
  },
  tiktok_viral: {
    label: 'Video Ngắn 60s Viral (TikTok / Shorts)',
    icon: '📱',
    storylines: [
      {
        label: 'Phỏng Vấn Xin Việc & Bác Bảo Vệ Già',
        topic: 'Ứng viên tự phụ coi thường bác bảo vệ già lúc bước vào cổng, không ngờ đó chính là Chủ tịch tập đoàn đang trực tiếp thử thách nhân sự.',
        genre: 'tiktok_viral',
        genreLabel: 'TikTok Viral 60s',
        duration: '60s',
        tone: 'Hài hước, bất ngờ, bài học nhân cách',
        icon: '😂',
        angle: 'Chủ Tịch Giả Nghèo',
      },
      {
        label: 'Bánh Kem Sinh Nhật Bất Ngờ Cho Chú Shipper',
        topic: 'Đơn hàng bánh sinh nhật giao đến khu nhà trọ hoang vắng lúc nửa đêm, khi chú shipper đến nơi, khách hàng bất ngờ hát chúc mừng chính sinh nhật chú.',
        genre: 'tiktok_viral',
        genreLabel: 'TikTok Nhân Văn',
        duration: '60s',
        tone: 'Xúc động, ấm lòng, triệu view',
        icon: '🎂',
        angle: 'Lan Tỏa Yêu Thương',
      },
      {
        label: 'Thử Lòng Làm Rơi Ví Tiền & Bà Cụ Vé Số',
        topic: 'Chàng trai giả vờ làm rơi ví tiền giữa chợ đông, phản ứng thật thà của bà cụ bán vé số tàn tật khiến hàng triệu cư dân mạng thán phục.',
        genre: 'tiktok_viral',
        genreLabel: 'TikTok Thử Lòng',
        duration: '60s',
        tone: 'Chân thực, xúc động, truyền cảm hứng',
        icon: '📱',
        angle: 'Thử Thách Lòng Tốt',
      },
      {
        label: 'Cuộc Chạm Trán 60s Với Người Yêu Cũ',
        topic: 'Gặp lại người yêu cũ tại đám cưới bạn thân, lời đối đáp thông minh và thần thái tự tin của cô gái khiến đối phương chỉ biết câm nín.',
        genre: 'tiktok_viral',
        genreLabel: 'TikTok Bi Hài',
        duration: '60s',
        tone: 'Sắc sảo, hài hước, thỏa mãn',
        icon: '⚡',
        angle: 'Cú Bẻ Lái Tình Huống',
      },
    ],
  },
  comedy: {
    label: 'Hài Hước / Tình Huống Bi Hài',
    icon: '😄',
    storylines: [
      {
        label: 'Lần Đầu Ra Mắt Nhà Người Yêu Bi Hài',
        topic: 'Chàng rể tương lai cố gắng thể hiện sự đảm đang nhưng liên tiếp gây ra những tình huống dở khóc dở cười với bố vợ khó tính.',
        genre: 'comedy',
        genreLabel: 'Hài Hước Gia Đình',
        duration: '2min',
        tone: 'Hóm hỉnh, duyên dáng, sảng khoái',
        icon: '😄',
        angle: 'Bi Hài Ra Mắt',
      },
      {
        label: 'Chuyện Đi Khám Sức Khỏe Lộn Khoa',
        topic: 'Bệnh nhân đãng trí cầm nhầm sổ khám bệnh, vào nhầm phòng phụ sản và cuộc đối thoại lệch pha hài hước không đỡ nổi.',
        genre: 'comedy',
        genreLabel: 'Tiểu Phẩm Hài',
        duration: '60s',
        tone: 'Cười ra nước mắt, dí dỏm',
        icon: '😂',
        angle: 'Tình Huống Hiểu Lầm',
      },
      {
        label: 'Buổi Họp Phụ Huynh Bất Ổn Của Bố Trẻ',
        topic: 'Ông bố trẻ lần đầu đi họp phụ huynh cho con, cố gắng trốn tránh ánh mắt của cô giáo chủ nhiệm từng là cô bạn cùng bàn thời cấp 3.',
        genre: 'comedy',
        genreLabel: 'Hài Hước Học Đường',
        duration: '2min',
        tone: 'Dễ thương, bi hài, gần gũi',
        icon: '🏫',
        angle: 'Họp Phụ Huynh Bất Ổn',
      },
    ],
  },
  historical_fantasy: {
    label: 'Cổ Trang / Dã Sử / Kiếm Hiệp',
    icon: '⚔️',
    storylines: [
      {
        label: 'Tiếng Sáo Trong Rừng Trúc Chiều Mưa',
        topic: 'Hiệp khách ẩn dật rửa tay gác kiếm nơi sơn cước, nhưng buộc phải xuất kiếm bảo vệ đứa trẻ mang tín vật của hoàng tộc.',
        genre: 'historical_fantasy',
        genreLabel: 'Cổ Trang Kiếm Hiệp',
        duration: '3min',
        tone: 'Hào sảng, điện ảnh kiếm hiệp, bi tráng',
        icon: '⚔️',
        angle: 'Hiệp Khách Giang Hồ',
      },
      {
        label: 'Mật Lệnh Hoàng Triều & Bức Tranh Thủy Mặc',
        topic: 'Một họa sư cung đình phát hiện bí mật mưu phản được giấu kín trong từng nét vẽ bức tranh dâng lên hoàng đế.',
        genre: 'historical_fantasy',
        genreLabel: 'Dã Sử Cung Đấu',
        duration: '3min',
        tone: 'Trầm mặc, ly kỳ, cung đình',
        icon: '🎨',
        angle: 'Cung Đình Bí Ẩn',
      },
    ],
  },
  documentary: {
    label: 'Phim Tài Liệu & Phóng Sự Khám Phá',
    icon: '📽️',
    storylines: [
      {
        label: 'Người Giữ Lửa Làng Nghề Trăm Năm',
        topic: 'Thước phim tài liệu chân thực về nghệ nhân cuối cùng còn làm nghề đúc đồng truyền thống, trăn trở tìm người kế nghiệp thời hiện đại.',
        genre: 'documentary',
        genreLabel: 'Phim Tài Liệu Đời Sống',
        duration: '3min',
        tone: 'Trầm tĩnh, sâu lắng, giá trị di sản',
        icon: '📽️',
        angle: 'Di Sản & Con Người',
      },
      {
        label: 'Bảo Tồn Rạn San Hô Dưới Đáy Biển Sâu',
        topic: 'Hành trình các nhà khoa học trẻ lặn sâu xuống đáy biển phục hồi rạn san hô đang tẩy trắng, bảo vệ hệ sinh thái biển quê hương.',
        genre: 'documentary',
        genreLabel: 'Tài Liệu Môi Trường',
        duration: '3min',
        tone: 'Hùng vĩ, xúc động, kêu gọi hành động',
        icon: '🌊',
        angle: 'Môi Trường & Sự Sống',
      },
    ],
  },
  legal_explainer: {
    label: 'Đồ Họa Phân Tích Pháp Luật & Camera AI',
    icon: '⚖️',
    storylines: [
      {
        label: 'Quy Trình Xử Lý Phạt Nguội & Trừ Điểm Bằng Lái',
        topic: 'Đồ họa phân tích chi tiết quy trình camera AI ghi nhận lỗi vi phạm ngã tư, gửi thông báo phạt nguội về VNeID và các bước nộp phạt trực tuyến.',
        genre: 'legal_explainer',
        genreLabel: 'Phân Tích Pháp Luật',
        duration: '2min',
        tone: 'Minh bạch, chuẩn xác, hướng dẫn thực tế',
        icon: '⚖️',
        angle: 'Quy Trình Pháp Lý',
      },
    ],
  },
  emotional_story: {
    label: 'Phim Ngắn Cảm Động Gia Đình',
    icon: '❤️',
    storylines: [
      {
        label: 'Chiếc Áo Ấm Của Mẹ Dệt Suốt Mùa Đông',
        topic: 'Câu chuyện cảm động về người mẹ vùng cao thức trắng đêm đan áo ấm gửi cho con trai đang làm việc tại thành phố lớn.',
        genre: 'emotional_story',
        genreLabel: 'Phim Ngắn Gia Đình',
        duration: '3min',
        tone: 'Xúc động, rơi nước mắt, đong đầy yêu thương',
        icon: '❤️',
        angle: 'Tình Mẹ Thiêng Liêng',
      },
    ],
  },
};

// Instant synchronous heuristic generator strictly aligned with currentGenre
function generateInstantSuggestions(query: string, currentGenre: VideoGenre, cycleOffset: number = 0): RealtimeSuggestion[] {
  const q = query.trim();
  if (!q) return [];

  const list: RealtimeSuggestion[] = [];

  if (currentGenre === 'drama_psa') {
    const isWater = /đuối nước|duoi nuoc|nước|nuoc|sông|song|suối|suoi|hồ|ho|ao|biển|bien|bơi|boi|chết đuối|chet duoi|cứu đuối|cuu duoi|chìm|chim/i.test(q);
    const isFire = /cháy|chay|hỏa hoạn|hoa hoan|pccc|bình chữa cháy|chập điện|chap dien|khói|khoi/i.test(q);
    const isScam = /lừa đảo|lua dao|mạo danh|mao danh|deepfake|chiếm đoạt|chiem doat|mạng|mang|tài khoản|tai khoan|chuyển tiền|chuyen tien|lừa|lua/i.test(q);
    const isSchool = /học đường|hoc duong|bắt nạt|bat nat|bạo lực|bao luc|trẻ em|tre em|học sinh|hoc sinh/i.test(q);
    const isTraffic = /giao thông|giao thong|xe máy|xe may|ô tô|o to|đèn đỏ|den do|vượt đèn|vuot den|đèn vàng|den vang|rượu bia|ruou bia|nồng độ cồn|nong do con|lạng lách|lang lach|mũ bảo hiểm|mu bao hiem/i.test(q);

    if (isWater) {
      list.push({
        label: `Hiểm Họa Vùng Nước Sâu: ${q.slice(0, 20)}`,
        topic: `Tình huống cảnh báo cấp thiết về "${q}", nhóm trẻ rủ nhau ra khúc sông sâu vắng người tắm mát và bài học xương máu về dòng xoáy ngầm.`,
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '3min',
        tone: 'Căng thẳng, cảnh báo răn đe, kỹ năng sống còn',
        icon: '🌊',
        angle: 'Phòng Chống Đuối Nước',
      });
      list.push({
        label: `Kỹ Năng Cứu Đuối Gián Tiếp: ${q.slice(0, 18)}`,
        topic: `Hướng dẫn kỹ năng sống còn khi phát hiện nạn nhân gặp sự cố "${q}": Tuyệt đối không liều mình nhảy xuống, ném phao cứu sinh, đưa sào dài và hô hoán cứu trợ.`,
        genre: 'drama_psa',
        genreLabel: 'Kỹ Năng Sinh Tồn',
        duration: '2min',
        tone: 'Chuẩn xác, khẩn cấp, kỹ năng thực tế',
        icon: '🛟',
        angle: 'Cứu Đuối An Toàn',
      });
      list.push({
        label: `Một Phút Lơ Là Bên Bờ Nước: ${q.slice(0, 18)}`,
        topic: `Lời cảnh tỉnh cho các bậc phụ huynh trông coi con nhỏ bên ao hồ quanh nhà liên quan đến "${q}", một phút rời mắt và sự ân hận khôn nguôi.`,
        genre: 'drama_psa',
        genreLabel: 'Tiểu Phẩm Cảm Động',
        duration: '3min',
        tone: 'Xúc động, lắng đọng, nâng cao ý thức',
        icon: '⚠️',
        angle: 'Trách Nhiệm Giám Sát',
      });
      list.push({
        label: `5 Phút Vàng Ép Tim Thổi Ngạt CPR: ${q.slice(0, 16)}`,
        topic: `Quy trình sơ cấp cứu kịp thời giành lại sự sống cho nạn nhân sau khi được đưa lên bờ do "${q}", những thao tác ép tim hồi sinh sự sống.`,
        genre: 'drama_psa',
        genreLabel: 'Sơ Cấp Cứu Y Tế',
        duration: '2min',
        tone: 'Khẩn trương, chuẩn xác y khoa',
        icon: '🩺',
        angle: 'Hồi Sức Cấp Cứu Ban Đầu',
      });
      list.push({
        label: `Biển Cảnh Báo Nước Sâu & Áo Phao Cứu Sinh`,
        topic: `Tiểu phẩm phản ánh thói quen chủ quan phớt lờ biển cấm, nâng cao ý thức bắt buộc mặc áo phao và học bơi an toàn để phòng tránh "${q}".`,
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '3min',
        tone: 'Nghiêm túc, răn đe, giáo dục cộng đồng',
        icon: '🛑',
        angle: 'Ý Thức Tự Bảo Vệ',
      });
    } else if (isFire) {
      list.push({
        label: `Chuông Báo Cháy & Lối Thoát Khói Độc: ${q.slice(0, 18)}`,
        topic: `Tình huống khẩn cấp liên quan đến "${q}", cách xử lý bình tĩnh lấy khăn ướt bịt mũi, bò sát mặt đất men theo tường tìm lối thoát hiểm.`,
        genre: 'drama_psa',
        genreLabel: 'PCCC & Thoát Nạn',
        duration: '3min',
        tone: 'Căng thẳng, thực tế, kỹ năng thoát hiểm',
        icon: '🧯',
        angle: 'Kỹ Năng Thoát Hiểm Hỏa Hoạn',
      });
      list.push({
        label: `Bình Chữa Cháy Mini & 30 Giây Vàng`,
        topic: `Thao tác dập tắt mầm mống ngọn lửa ban đầu liên quan đến "${q}" trước khi ngọn lửa bùng phát lan rộng thành thảm họa.`,
        genre: 'drama_psa',
        genreLabel: 'Kỹ Năng PCCC',
        duration: '2min',
        tone: 'Khẩn trương, thực tế, an toàn',
        icon: '🔥',
        angle: 'Dập Lửa Ban Đầu',
      });
      list.push({
        label: `Chập Điện Lúc Nửa Đêm & Ban Công Khóa Chuồng Cọp`,
        topic: `Cảnh báo hiểm họa từ chuồng cọp bít kín không lối thoát và sự cố chập điện do "${q}", bài học mở cửa thoát hiểm thứ hai.`,
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '3min',
        tone: 'Cảnh báo sâu sắc, thực tế',
        icon: '⚡',
        angle: 'Cửa Thoát Hiểm Thứ 2',
      });
    } else if (isScam) {
      list.push({
        label: `Cú Lừa Cuộc Gọi Deepfake Mạo Danh: ${q.slice(0, 18)}`,
        topic: `Tình huống kẻ gian dùng công nghệ AI giả mạo hình ảnh và giọng nói người thân để dàn dựng "${q}", gióng lên hồi chuông cảnh giác.`,
        genre: 'drama_psa',
        genreLabel: 'An Toàn Không Gian Mạng',
        duration: '3min',
        tone: 'Hồi hộp, kịch tính, thức tỉnh',
        icon: '📱',
        angle: 'Cảnh Giác Lừa Đảo AI',
      });
      list.push({
        label: `Mã OTP & Bẫy Chuyển Tiền 0 Đồng: ${q.slice(0, 18)}`,
        topic: `Hành vi lừa đảo chiếm đoạt tài khoản tinh vi gắn liền với "${q}", bài học không bao giờ cung cấp mật khẩu và mã xác thực cho bất kỳ ai.`,
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '2min',
        tone: 'Chuẩn xác, cảnh báo tài chính',
        icon: '🔒',
        angle: 'Bảo Vệ Tài Sản Số',
      });
    } else if (isSchool) {
      list.push({
        label: `Vết Bầm Sau Giờ Tan Trường: ${q.slice(0, 18)}`,
        topic: `Góc khuất tâm lý học trò khi đối mặt tình trạng "${q}", người mẹ và thầy cô kịp thời đồng hành, bảo vệ con trẻ trước bạo lực.`,
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Bảo Vệ Trẻ',
        duration: '3min',
        tone: 'Xúc động, lắng đọng, nhân văn',
        icon: '🛡️',
        angle: 'Phòng Chống Bạo Lực Học Đường',
      });
    } else if (isTraffic) {
      list.push({
        label: `Cú Phanh Định Mệnh: ${q.slice(0, 20)}`,
        topic: `Hành vi phóng nhanh vượt ẩu nguy hiểm liên quan đến "${q}", cú phanh gấp suýt va chạm và bài học ý thức cầm lái vì bình an gia đình.`,
        genre: 'drama_psa',
        genreLabel: 'An Toàn Giao Thông',
        duration: '3min',
        tone: 'Kịch tính, cảnh báo sâu sắc',
        icon: '⚠️',
        angle: 'An Toàn Sau Vô Lăng',
      });
      list.push({
        label: `Đã Uống Rượu Bia - Quyết Không Lái Xe: ${q.slice(0, 18)}`,
        topic: `Sự kiên quyết từ chối chén rượu trước lời khích bác liên quan đến "${q}", bảo vệ tính mạng bản thân và những người cùng tham gia giao thông.`,
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền Luật',
        duration: '2min',
        tone: 'Nghiêm túc, răn đe, trách nhiệm',
        icon: '🛑',
        angle: 'Không Lái Xe Khi Đã Uống Rượu',
      });
    } else {
      // General PSA: Purely adapts to the user's specific query without forcing any unrelated traffic/car notions
      list.push({
        label: `Hồi Chuông Cảnh Tỉnh: ${q.slice(0, 22)}`,
        topic: `Tiểu phẩm tuyên truyền phản ánh hiểm họa và hệ lụy từ sự chủ quan đối với "${q}", bài học thức tỉnh ý thức phòng ngừa của cộng đồng.`,
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '3min',
        tone: 'Cảnh báo sâu sắc, răn đe, ý nghĩa xã hội',
        icon: '📢',
        angle: 'Hồi Chuông Cảnh Tỉnh',
      });
      list.push({
        label: `Khoảnh Khắc Sinh Tử: ${q.slice(0, 22)}`,
        topic: `Tình huống nguy cấp bất ngờ xảy ra xoay quanh "${q}", phản xạ bình tĩnh xử lý kịp thời và kỹ năng ứng phó bảo vệ tính mạng.`,
        genre: 'drama_psa',
        genreLabel: 'Tuyên Truyền & Cảnh Báo',
        duration: '3min',
        tone: 'Hồi hộp, khẩn trương, kỹ năng sống còn',
        icon: '⚡',
        angle: 'Kỹ Năng Ứng Phó Khẩn Cấp',
      });
      list.push({
        label: `Kỹ Năng Sống Còn Thực Tế: ${q.slice(0, 20)}`,
        topic: `Hướng dẫn cụ thể các nguyên tắc an toàn cốt lõi khi đối mặt với "${q}", trang bị kiến thức tự bảo vệ bản thân và gia đình.`,
        genre: 'drama_psa',
        genreLabel: 'Kỹ Năng Sinh Tồn',
        duration: '2min',
        tone: 'Chuẩn xác, thực tế, giáo dục cộng đồng',
        icon: '🛡️',
        angle: 'Kỹ Năng Sống Còn',
      });
      list.push({
        label: `Bài Học Sau Biến Cố: ${q.slice(0, 22)}`,
        topic: `Biến cố không mong muốn bắt nguồn từ sự lơ là đối với "${q}", cái kết xúc động thức tỉnh lương tâm và trách nhiệm với gia đình.`,
        genre: 'drama_psa',
        genreLabel: 'Tiểu Phẩm Cảm Động',
        duration: '3min',
        tone: 'Cảm động, lắng đọng, bài học đắt giá',
        icon: '❤️',
        angle: 'Gia Đình & Bình An',
      });
      list.push({
        label: `Chung Tay Lan Tỏa Ý Thức: ${q.slice(0, 20)}`,
        topic: `Thông điệp tuyên truyền mạnh mẽ kêu gọi mọi người nâng cao tinh thần trách nhiệm trước vấn đề "${q}", vì một xã hội an toàn và văn minh.`,
        genre: 'drama_psa',
        genreLabel: 'Thông Điệp Cộng Đồng',
        duration: '2min',
        tone: 'Truyền cảm hứng, trách nhiệm xã hội',
        icon: '🤝',
        angle: 'Trách Nhiệm Cộng Đồng',
      });
    }
  } else if (currentGenre === 'action_thriller') {
    list.push({
      label: `Manh Mối Hiện Trường: ${q.slice(0, 20)}`,
      topic: `Thám tử điều tra phát hiện dấu vết mờ nhạt liên quan đến "${q}", hé lộ âm mưu ngầm được toan tính tinh vi từ nhiều năm trước.`,
      genre: 'action_thriller',
      genreLabel: 'Trinh Thám / Giật Gân',
      duration: '3min',
      tone: 'Hồi hộp, bí ẩn, suy luận sắc sảo',
      icon: '🕵️',
      angle: 'Phá Án Suy Luận',
    });
    list.push({
      label: `Cú Lật Phút 89: ${q.slice(0, 22)}`,
      topic: `Vụ án tưởng chừng kết thúc với "${q}", nhưng một bằng chứng bị che giấu bất ngờ làm đảo ngược hoàn toàn danh tính kẻ đứng sau.`,
      genre: 'action_thriller',
      genreLabel: 'Giật Gân / Plot Twist',
      duration: '3min',
      tone: 'Căng thẳng, bất ngờ rợn người',
      icon: '🧩',
      angle: 'Plot Twist Đảo Chiều',
    });
    list.push({
      label: `Đếm Ngược 60 Phút: ${q.slice(0, 20)}`,
      topic: `Thời gian đếm ngược từng giây khi manh mối "${q}" dẫn nhóm điều tra đến địa điểm bí mật trước khi quả bom hẹn giờ phát nổ.`,
      genre: 'action_thriller',
      genreLabel: 'Hồi Hộp Nghẹt Thở',
      duration: '3min',
      tone: 'Nghẹt thở, dồn dập cao trào',
      icon: '⏱️',
      angle: 'Đếm Ngược Thời Gian',
    });
    list.push({
      label: `Truy Kích Tốc Độ Cao: ${q.slice(0, 20)}`,
      topic: `Màn rượt đuổi tốc độ cao trên đường vành đai liên quan đến vali tài liệu mật "${q}", những pha bẻ lái nghẹt thở trong đêm.`,
      genre: 'action_thriller',
      genreLabel: 'Hành Động Mãn Nhãn',
      duration: '3min',
      tone: 'Hành động kịch tính, mãn nhãn',
      icon: '🚗',
      angle: 'Rượt Đuổi Tốc Độ Cao',
    });
  } else if (currentGenre === 'scifi_cyberpunk') {
    list.push({
      label: `Siêu Đô Thị 2088: ${q.slice(0, 22)}`,
      topic: `Tại thế giới tương lai nơi AI kiểm soát ký ức, "${q}" bỗng trở thành dị vật phá vỡ trật tự số hóa toàn cầu.`,
      genre: 'scifi_cyberpunk',
      genreLabel: 'Khoa Học Viễn Tưởng',
      duration: '3min',
      tone: 'Huyền ảo, vị lai, triết học',
      icon: '🚀',
      angle: 'Tương Lai Cyberpunk',
    });
    list.push({
      label: `Mã Lượng Tử Đánh Rơi: ${q.slice(0, 20)}`,
      topic: `Kỹ sư phục chế ký ức phát hiện mảnh chip chứa dữ liệu nguyên bản về "${q}", khởi đầu cuộc đào thoát khỏi vệ tinh quỹ đạo.`,
      genre: 'scifi_cyberpunk',
      genreLabel: 'Khoa Học Viễn Tưởng',
      duration: '3min',
      tone: 'Điện ảnh viễn tưởng, sâu lắng',
      icon: '🌌',
      angle: 'Công Nghệ Lượng Tử',
    });
  } else if (currentGenre === 'tvc_commercial') {
    list.push({
      label: `TVC Mỹ Học: Tôn Vinh ${q.slice(0, 20)}`,
      topic: `Thước phim quảng cáo điện ảnh tôn vinh chất lượng và đẳng cấp của "${q}", góc quay macro nghệ thuật và âm nhạc truyền cảm hứng.`,
      genre: 'tvc_commercial',
      genreLabel: 'TVC Quảng Cáo',
      duration: '60s',
      tone: 'Sang trọng, mỹ thuật, truyền cảm hứng',
      icon: '☕',
      angle: 'Mỹ Học & Đẳng Cấp',
    });
    list.push({
      label: `Hành Trình Khởi Nghiệp: ${q.slice(0, 20)}`,
      topic: `Câu chuyện người trẻ kiên định theo đuổi đam mê, lấy cảm hứng từ "${q}" để tạo nên thành công bứt phá ngoạn mục.`,
      genre: 'tvc_commercial',
      genreLabel: 'Brand Storyteller',
      duration: '60s',
      tone: 'Nhiệt huyết, thôi thúc, tự tin',
      icon: '✨',
      angle: 'Khởi Nghiệp Bứt Phá',
    });
  } else if (currentGenre === 'tiktok_viral') {
    list.push({
      label: `Cú Twist Triệu View: ${q.slice(0, 20)}`,
      topic: `Tình huống mở đầu hài hước hoặc gây tranh cãi về "${q}", nhưng đến 10 giây cuối cùng xuất hiện cú bẻ lái bất ngờ khiến người xem vỡ òa.`,
      genre: 'tiktok_viral',
      genreLabel: 'Video Ngắn Viral 60s',
      duration: '60s',
      tone: 'Nhanh, cuốn hút, bất ngờ phút chót',
      icon: '⚡',
      angle: 'Twist Phút Chót',
    });
    list.push({
      label: `Thử Lòng Lòng Tốt: ${q.slice(0, 20)}`,
      topic: `Video thử lòng người đi đường về tình huống "${q}", phản ứng nhân văn ấm áp chạm đáy cảm xúc người xem.`,
      genre: 'tiktok_viral',
      genreLabel: 'Video Ngắn Viral 60s',
      duration: '60s',
      tone: 'Xúc động, lan tỏa, triệu view',
      icon: '📱',
      angle: 'Nhân Văn Triệu View',
    });
  } else {
    list.push({
      label: `Xung Đột Kịch Tính: ${q.slice(0, 22)}`,
      topic: `Tình huống đối đầu căng thẳng xoay quanh "${q}", nhân vật chính đứng trước lựa chọn sinh tử thay đổi hoàn toàn cục diện.`,
      genre: currentGenre,
      genreLabel: 'Drama Kịch Tính',
      duration: '3min',
      tone: 'Kịch tính, nội tâm sâu sắc',
      icon: '🎭',
      angle: 'Xung Đột Cao Trào',
    });
    list.push({
      label: `Bài Học Nhân Văn: ${q.slice(0, 22)}`,
      topic: `Câu chuyện ý nghĩa về "${q}", chạm đến góc khuất cuộc đời và mang lại giá trị nhân văn sâu lắng cho khán giả.`,
      genre: currentGenre,
      genreLabel: 'Thông Điệp Nhân Văn',
      duration: '3min',
      tone: 'Xúc động, lắng đọng',
      icon: '❤️',
      angle: 'Thông Điệp Nhân Văn',
    });
  }

  // If cycleOffset is applied, rotate the list
  if (cycleOffset > 0 && list.length > 1) {
    const shift = cycleOffset % list.length;
    return [...list.slice(shift), ...list.slice(0, shift)].slice(0, 5);
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
  const [storylineCycleIndex, setStorylineCycleIndex] = useState<number>(0);
  const latestTopicRef = useRef(topic);
  latestTopicRef.current = topic;

  // Listen to topic input in real-time and provide dynamic suggestions strictly aligned with genre
  useEffect(() => {
    const trimmed = topic.trim();
    if (trimmed.length < 2) {
      setRealtimeSuggestions([]);
      setIsSuggesting(false);
      return;
    }

    // 1. Instant heuristic update for 0ms latency feedback strictly for currentGenre
    const instant = generateInstantSuggestions(trimmed, genre, storylineCycleIndex);
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

  const handleShuffleStorylines = () => {
    setStorylineCycleIndex((prev) => prev + 1);
    const trimmed = topic.trim();
    if (trimmed.length >= 2) {
      const rotated = generateInstantSuggestions(trimmed, genre, storylineCycleIndex + 1);
      setRealtimeSuggestions(rotated);
    }
  };

  const handleSelectGenreQuick = (newGenre: VideoGenre) => {
    setGenre(newGenre);
    setStorylineCycleIndex(0);
    const trimmed = topic.trim();
    if (trimmed.length >= 2) {
      const instant = generateInstantSuggestions(trimmed, newGenre, 0);
      setRealtimeSuggestions(instant);
    }
  };

  const createAdaptiveScript = (
    targetTopic: string,
    targetGenre: VideoGenre = genre,
    targetDuration: '30s' | '60s' | '2min' | '3min' | '5min' = duration,
    targetTone: string = tone
  ): VideoScript => {
    const activeTopic = targetTopic.trim() || 'Kỹ năng sống và bài học thực tế';
    const isWaterTopic = /đuối nước|duoi nuoc|nước|nuoc|sông|song|suối|suoi|hồ|ho|ao|biển|bien|bơi|boi|cứu đuối|chìm|chim/i.test(activeTopic);
    const isFireTopic = /cháy|chay|hỏa hoạn|hoa hoan|pccc|chập điện|khói|khoi/i.test(activeTopic);
    const isScamTopic = /lừa đảo|lua dao|mạo danh|deepfake|chiếm đoạt|tài khoản|chuyển tiền/i.test(activeTopic);
    const isTrafficTopic = /giao thông|giao thong|xe máy|ô tô|đèn đỏ|vượt đèn|đèn vàng|nồng độ cồn|vạch dừng/i.test(activeTopic);

    let fallbackLogline = `Tình huống cảnh báo sâu sắc và bài học sống còn xoay quanh chủ đề: "${activeTopic}", nâng cao ý thức tự bảo vệ và trách nhiệm với cộng đồng.`;
    let fallbackCharacters = [
      { name: 'Nhân vật chính', role: 'Đối mặt trực tiếp với tình huống thực tế', costume: 'Trang phục đời thường' },
      { name: 'Người hỗ trợ / Người thân', role: 'Kịp thời can thiệp, ứng cứu và nhắc nhở an toàn', costume: 'Trang phục thường nhật' },
      { name: 'Chuyên gia / Cứu hộ', role: 'Hướng dẫn quy tắc ứng phó chuẩn xác và phân tích bài học', costume: 'Trang phục chuyên dụng' },
    ];
    let fallbackLocations = [customSetting || 'Khu vực diễn ra tình huống', 'Không gian thực tế trung tâm', 'Địa điểm kết thúc mở rộng'];
    let fallbackProps = ['Thiết bị an toàn thiết yếu', 'Điện thoại liên lạc cứu hộ', 'Dụng cụ hỗ trợ khẩn cấp'];
    let fallbackCoreMessage = `An toàn và tính mạng là trên hết. Hãy luôn chủ động trang bị kỹ năng để ứng phó với rủi ro!`;
    let fallbackCallToAction = `Chia sẻ video này đến người thân và cộng đồng để cùng lan tỏa kiến thức sống còn!`;
    let fallbackScenes: ScriptScene[] = [];

    if (isWaterTopic) {
      fallbackLogline = `Hồi chuông cảnh tỉnh về hiểm họa dòng nước sâu và bài học cứu đuối an toàn cho trẻ em và phụ huynh: "${activeTopic}".`;
      fallbackCharacters = [
        { name: 'Em nhỏ / Nạn nhân', role: 'Ra khúc nước vắng tắm mát và bị sảy chân vào hố sâu xoáy ngầm', costume: 'Đồ bơi / quần áo cộc dã ngoại' },
        { name: 'Người bạn / Người đi cùng', role: 'Hốt hoảng kêu cứu, bình tĩnh ném phao cứu sinh thay vì nhảy liều', costume: 'Trang phục thể thao' },
        { name: 'Đội viên cứu hộ / Nhân viên y tế', role: 'Tiếp cận sơ cấp cứu hồi sức tim phổi CPR kịp thời', costume: 'Đồng phục cứu hộ bờ sông' },
      ];
      fallbackLocations = ['Khúc sông vắng có biển cảnh báo nguy hiểm', 'Bờ đê dốc đứng', 'Trạm y tế lưu động'];
      fallbackProps = ['Biển cảnh báo sụt lở nước sâu', 'Phao cứu sinh hình tròn', 'Sào tre dài 4m', 'Áo phao bảo hộ'];
      fallbackCoreMessage = 'Tuyệt đối không tắm ao hồ sông suối vắng người. Khi thấy người đuối nước, quăng phao sào và hô hoán ngay!';
      fallbackCallToAction = 'Mỗi phụ huynh hãy dạy con kỹ năng an toàn dưới nước và luôn giám sát trẻ từng phút từng giây!';
      fallbackScenes = [
        {
          id: 1,
          timeCode: '00:00 - 00:25',
          shotType: 'Toàn cảnh (Wide Shot)',
          setting: 'Khúc sông vắng, nắng trưa hè oi ả',
          visualAction: 'Góc máy flycam lướt qua khúc sông nhìn có vẻ êm đềm nhưng bên dưới là dòng xoáy ngầm. Nhóm thiếu niên rủ nhau vượt qua hàng rào cấm.',
          actorDialogue: 'Nhân vật chính: "Nước mát thế này không tắm thì phí, sợ gì chứ!"',
          voiceoverNarration: `Những cái bẫy vô hình dưới làn nước tĩnh lặng: Mỗi năm có hàng nghìn tai nạn thương tâm xảy ra chỉ vì một phút chủ quan: ${activeTopic}.`,
          soundEffects: 'Tiếng ve kêu ran, tiếng nước chảy xiết ngầm bên dưới, tiếng cười đùa vô tư.',
          vfxGraphics: `Dòng chữ cảnh báo: "HIỂM HỌA DÒNG NƯỚC SÂU"`,
        },
        {
          id: 2,
          timeCode: '00:25 - 00:55',
          shotType: 'Cận cảnh (Close-up)',
          setting: 'Vùng nước xoáy sát chân bờ đê',
          visualAction: 'Bàn chân sụt xuống bãi cát lún, dòng nước cuốn trôi ra xa bờ. Nạn nhân hoảng loạn đập nước giơ tay cầu cứu.',
          actorDialogue: 'Nạn nhân: "Cứu... cứu em với! Em bị chuột rút rồi!"',
          voiceoverNarration: 'Bản năng hoảng loạn sẽ nhấn chìm nạn nhân nhanh hơn. Quy tắc sống còn đầu tiên: Thả lỏng ngửa mặt hít thở sâu.',
          soundEffects: 'Tiếng nước bì bõm đập gấp gáp, tiếng tim đập dồn dập rền vang.',
          vfxGraphics: 'Mũi tên đồ họa mô phỏng dòng xoáy hút bùn dưới đáy.',
        },
        {
          id: 3,
          timeCode: '00:55 - 01:40',
          shotType: 'Trung cận cảnh (Medium Close-up)',
          setting: 'Trên bờ đê',
          visualAction: 'Người bạn định lao mình xuống nước nhưng sực nhớ lời dặn an toàn: Dừng lại ngay! Nhanh tay chộp lấy chiếc sào tre dài và phao xốp quăng mạnh về phía nạn nhân.',
          actorDialogue: 'Người trên bờ: "Bám lấy sào! Đừng vùng vẫy! Bớ người ta, có người đuối nước cứu với!"',
          voiceoverNarration: 'Tuyệt đối không liều mình nhảy xuống nếu chưa qua đào tạo cứu nạn. Cứu đuối gián tiếp bằng phao, dây, sào là bảo toàn sinh mạng cho cả hai.',
          soundEffects: 'Tiếng còi báo động, tiếng bước chân chạy huỳnh huỵch trên bờ sỏi.',
          vfxGraphics: 'Vòng tròn tiêu điểm xanh hướng dẫn cách quăng phao qua đầu nạn nhân.',
        },
        {
          id: 4,
          timeCode: '01:40 - 02:20',
          shotType: 'Trung cảnh cận (Medium Shot)',
          setting: 'Bãi cát bằng phẳng bên bờ',
          visualAction: 'Nạn nhân được đưa lên bờ an toàn. Đội cứu hộ lập tức kiểm tra đường thở, tiến hành ép tim ngoài lồng ngực và hô hấp nhân tạo đúng 30 lần ép - 2 lần thổi.',
          actorDialogue: 'Cứu hộ viên: "Có mạch đập trở lại rồi! Giữ ấm cơ thể ngay!"',
          voiceoverNarration: 'Khoảng thời gian vàng 5 phút đầu tiên quyết định sự sống của não bộ. Kỹ năng sơ cấp cứu CPR đúng chuẩn là phép màu cứu sống một con người.',
          soundEffects: 'Tiếng đếm nhịp cấp cứu: 1, 2, 3... tiếng thở dốc nghẹn ngào khi nạn nhân nấc sặc nước.',
          vfxGraphics: 'Đồ họa nhịp tim xanh hiển thị phục hồi.',
        },
        {
          id: 5,
          timeCode: '02:20 - 03:00',
          shotType: 'Toàn cảnh xúc động (Wide Shot)',
          setting: 'Hoàng hôn bên bờ sông có cắm biển cảnh báo mới',
          visualAction: 'Gia đình ôm chặt lấy con trong nước mắt nghẹn ngào. Đội ngũ tình nguyện viên dựng thêm biển cảnh báo nguy hiểm và áo phao công cộng.',
          voiceoverNarration: 'Đừng để sự ân hận muộn màng cướp đi nụ cười của con trẻ. Vì một mùa hè bình an, hãy trang bị kỹ năng phòng chống đuối nước ngay hôm nay!',
          soundEffects: 'Giai điệu piano truyền cảm hứng, tiếng chim chiều.',
          vfxGraphics: 'Thông điệp lớn: "TRANG BỊ KỸ NĂNG BƠI & ÁO PHAO - BẢO VỆ CON TRẺ TRƯỚC ĐUỐI NƯỚC"',
        },
      ];
    } else if (isTrafficTopic) {
      fallbackLogline = `Tình huống cảnh báo an toàn giao thông sâu sắc xoay quanh: "${activeTopic}", bài học về ý thức tuân thủ pháp luật và văn hóa cầm lái.`;
      fallbackCharacters = [
        { name: 'Tài xế / Người điều khiển', role: 'Vội vã, đứng trước ngã rẽ lựa chọn an toàn hay liều lĩnh', costume: 'Trang phục công sở / áo mưa' },
        { name: 'Người đi đường', role: 'Nhân chứng và người đồng hành văn minh', costume: 'Trang phục thường nhật' },
        { name: 'CSGT / Tuyên truyền viên', role: 'Phân tích quy định an toàn và nâng cao văn hóa giao thông', costume: 'Sắc phục CSGT' },
      ];
      fallbackLocations = [customSetting || 'Ngã tư đô thị có đèn tín hiệu', 'Khoang lái xe'];
      fallbackProps = ['Phương tiện giao thông', 'Mũ bảo hiểm đạt chuẩn', 'Camera hành trình'];
      fallbackCoreMessage = 'Chậm lại vài giây để giữ trọn vẹn bình an cho bản thân và người cùng tham gia giao thông!';
      fallbackCallToAction = 'Tuyệt đối tuân thủ biển báo, đèn tín hiệu và đã uống rượu bia thì không lái xe!';
      fallbackScenes = [
        {
          id: 1,
          timeCode: '00:00 - 00:30',
          shotType: 'Toàn cảnh (Wide Shot)',
          setting: customSetting || 'Đường phố đô thị',
          visualAction: `Dòng người và phương tiện hối hả di chuyển. Nhân vật chính nhìn đồng hồ với ánh mắt sốt ruột.`,
          actorDialogue: 'Nhân vật: "Sắp trễ giờ rồi, phải tăng tốc thôi!"',
          voiceoverNarration: `Sự vội vã trên đường là khởi nguồn của mọi hiểm nguy tiềm ẩn: ${activeTopic}.`,
          soundEffects: 'Tiếng động cơ dồn dập, tiếng còi xe giờ cao điểm.',
          vfxGraphics: `Dòng chữ: "${activeTopic.toUpperCase()}"`,
        },
        {
          id: 2,
          timeCode: '00:30 - 01:10',
          shotType: 'Cận cảnh (Close-up)',
          setting: 'Khoang lái xe',
          visualAction: 'Bàn tay nắm chặt tay lái, ngón tay chuẩn bị nhấn ga nhưng ánh mắt chạm vào bức ảnh gia đình gắn trên xe.',
          voiceoverNarration: 'Một giây mất bình tĩnh có thể đánh đổi bằng cả tương lai và hạnh phúc của người thân.',
          soundEffects: 'Tiếng tim đập chậm lại, âm thanh đường phố lùi xa.',
          vfxGraphics: 'Hiệu ứng ánh sáng ấm áp tập trung vào bức ảnh người thân.',
        },
        {
          id: 3,
          timeCode: '01:10 - 02:00',
          shotType: 'Trung cảnh (Medium Shot)',
          setting: 'Nút giao thông',
          visualAction: 'Nhân vật chủ động rà phanh, dừng lại an toàn đúng vạch chỉ dẫn, nhường đường cho người đi bộ.',
          actorDialogue: 'Người đi bộ: "Cảm ơn bạn nhé!" - gật đầu mỉm cười.',
          voiceoverNarration: 'Nhường nhịn và tuân thủ luật lệ không làm bạn chậm trễ, mà chính là thước đo văn minh của mỗi con người.',
          soundEffects: 'Tiếng phanh êm ái, tiếng gió mát lành.',
          vfxGraphics: 'Biểu tượng tích xanh an toàn.',
        },
        {
          id: 4,
          timeCode: '02:00 - 03:00',
          shotType: 'Toàn cảnh (Wide Shot)',
          setting: 'Trước cổng nhà',
          visualAction: 'Nhân vật trở về nhà an toàn, vòng tay người thân mở rộng đón chào trong niềm hạnh phúc trọn vẹn.',
          voiceoverNarration: 'Bình an về đến nhà mới là đích đến quan trọng nhất của mọi hành trình.',
          soundEffects: 'Nhạc giao hưởng ấm áp kết thúc.',
          vfxGraphics: 'Thông điệp: "VĂN HÓA GIAO THÔNG - BÌNH AN CHO MỌI NHÀ"',
        },
      ];
    } else {
      // Universal adaptive fallback strictly matching the user's active topic
      fallbackLogline = `Câu chuyện truyền tải thông điệp sâu sắc và giá trị nhân văn xoay quanh chủ đề: "${activeTopic}".`;
      fallbackScenes = [
        {
          id: 1,
          timeCode: '00:00 - 00:30',
          shotType: 'Toàn cảnh mở đầu (Wide Shot)',
          setting: customSetting || 'Không gian thực tế ban đầu',
          visualAction: `Không gian bối cảnh chân thực. Tình huống thực tế bắt đầu mở ra gắn liền với vấn đề: ${activeTopic}.`,
          actorDialogue: 'Nhân vật: "Nếu chúng ta không hành động từ bây giờ, mọi chuyện sẽ quá muộn."',
          voiceoverNarration: `Mỗi vấn đề trong cuộc sống đều bắt đầu từ những thói quen và nhận thức thường nhật: ${activeTopic}.`,
          soundEffects: 'Âm thanh nền gợi mở, cuốn hút.',
          vfxGraphics: `Dòng chữ chủ đề: "${activeTopic.toUpperCase()}"`,
        },
        {
          id: 2,
          timeCode: '00:30 - 01:15',
          shotType: 'Trung cận cảnh kịch tính (Medium Shot)',
          setting: 'Không gian diễn ra cao trào',
          visualAction: 'Xung đột và thử thách bất ngờ phát sinh đòi hỏi sự tỉnh táo, quyết đoán và kỹ năng giải quyết đúng đắn.',
          actorDialogue: 'Nhân vật hỗ trợ: "Bình tĩnh, làm đúng theo quy trình đã được hướng dẫn!"',
          voiceoverNarration: 'Sự kiên định và chuẩn bị kỹ lưỡng là chìa khóa vượt qua mọi nghịch cảnh.',
          soundEffects: 'Âm nhạc dâng trào hồi hộp.',
          vfxGraphics: 'Đồ họa nhấn mạnh các bước xử lý then chốt.',
        },
        {
          id: 3,
          timeCode: '01:15 - 02:00',
          shotType: 'Cận cảnh biểu cảm (Close-up)',
          setting: 'Thời điểm bước ngoặt',
          visualAction: 'Quyết định đúng đắn mang lại kết quả tích cực, tháo gỡ nút thắt và ngăn chặn những hậu quả đáng tiếc.',
          voiceoverNarration: 'Mỗi cá nhân thay đổi nhận thức là một bước tiến quan trọng vì tương lai tốt đẹp hơn.',
          soundEffects: 'Tiếng thở phào nhẹ nhõm, âm nhạc chuyển sang tươi sáng.',
          vfxGraphics: 'Điểm sáng hy vọng biểu thị giải pháp thành công.',
        },
        {
          id: 4,
          timeCode: '02:00 - 03:00',
          shotType: 'Toàn cảnh kết nối cộng đồng (Wide Shot)',
          setting: 'Bối cảnh lan tỏa tươi sáng',
          visualAction: 'Hình ảnh mọi người cùng chung tay hành động, nụ cười rạng rỡ và sự gắn kết bền chặt.',
          voiceoverNarration: `Hãy cùng nhau lan tỏa ý thức trách nhiệm và hành động thiết thực vì cộng đồng!`,
          soundEffects: 'Giai điệu truyền cảm hứng mạnh mẽ.',
          vfxGraphics: `Thông điệp: "CHUNG TAY HÀNH ĐỘNG - VÌ MỘT TƯƠNG LAI BÌNH AN"`,
        },
      ];
    }

    const durationLabel = targetDuration === '30s' ? '30 giây' : targetDuration === '60s' ? '60 giây' : targetDuration === '2min' ? '2 phút' : targetDuration === '3min' ? '3 phút' : '5 phút';

    return {
      id: `script-${Date.now()}`,
      title: `KỊCH BẢN: ${activeTopic.toUpperCase()}`,
      subtitle: `Kịch bản phân cảnh chuẩn điện ảnh - Chủ đề: ${activeTopic}`,
      genre: targetGenre,
      genreLabel: targetGenre === 'tiktok_viral' ? 'Video Ngắn 60s Viral' : 'Tuyên Truyền & Kỹ Năng Sống',
      targetDuration: durationLabel,
      targetAudience: customAudience || 'Khán giả đại chúng',
      tone: targetTone,
      logline: fallbackLogline,
      characters: fallbackCharacters,
      propsLocations: {
        locations: fallbackLocations,
        props: fallbackProps,
      },
      scenes: fallbackScenes,
      coreMessage: fallbackCoreMessage,
      callToAction: fallbackCallToAction,
    };
  };

  const handleApplySuggestion = (sug: RealtimeSuggestion, autoGenerate: boolean = false) => {
    setTopic(sug.topic);
    setGenre(sug.genre);
    setDuration(sug.duration);
    setTone(sug.tone);
    setAppliedSuggestionLabel(sug.label);
    setTimeout(() => setAppliedSuggestionLabel(null), 2500);

    // Immediately generate matching adaptive script 0ms so user's storyboard instantly reflects the applied story!
    const instantScript = createAdaptiveScript(sug.topic, sug.genre, sug.duration, sug.tone);
    setGeneratedScript(instantScript);
    onScriptGenerated?.(instantScript);

    if (autoGenerate) {
      handleGenerate(sug.topic, sug.genre, sug.duration, sug.tone);
    }
  };

  const handleQuickSyncStoryboard = () => {
    const instantScript = createAdaptiveScript(topic, genre, duration, tone);
    setGeneratedScript(instantScript);
    onScriptGenerated?.(instantScript);
  };

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

  const handleGenerate = async (
    overrideTopic?: string,
    overrideGenre?: VideoGenre,
    overrideDuration?: '30s' | '60s' | '2min' | '3min' | '5min',
    overrideTone?: string
  ) => {
    const activeTopic = (overrideTopic || topic).trim() || 'Kỹ năng sống và bài học thực tế';
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
      // Client-side emergency fallback adapting strictly to the user's active topic
      const fallback = createAdaptiveScript(activeTopic, activeGenre, activeDuration, activeTone);
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

          {/* Genre-Aligned Storyline Suggestions */}
          {(() => {
            const activePreset = GENRE_PRESETS[genre] || GENRE_PRESETS['drama_psa'];
            const allStorylines = activePreset.storylines;
            const startIndex = (storylineCycleIndex * 4) % allStorylines.length;
            const presetSlice = [
              ...allStorylines.slice(startIndex, startIndex + 4),
              ...allStorylines.slice(0, Math.max(0, 4 - (allStorylines.length - startIndex))),
            ].slice(0, 4);

            const activeSuggestionsList: RealtimeSuggestion[] =
              topic.trim().length >= 2 && realtimeSuggestions.length > 0
                ? realtimeSuggestions
                : presetSlice;

            return (
              <div className="flex flex-col gap-2.5 pt-1 pb-1">
                {/* Header with Genre Badge and "Đổi sang cốt truyện khác" Button */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> GỢI Ý CỐT TRUYỆN THEO THỂ LOẠI:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span>{activePreset.icon}</span>
                      <span>{activePreset.label}</span>
                    </span>
                    {topic.trim().length > 0 && (
                      <span className="text-slate-300 font-medium truncate max-w-[200px] sm:max-w-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                        "{topic}"
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isSuggesting && (
                      <span className="text-[11px] text-blue-400 flex items-center gap-1.5 animate-pulse bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        <Sparkles className="w-3 h-3" /> Đang cập nhật góc nhìn mới...
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleShuffleStorylines}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:border-blue-400 transition-all shadow-sm active:scale-95 cursor-pointer"
                      title="Bấm để đổi sang danh sách cốt truyện khác trong thể loại này"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                      <span>Đổi sang cốt truyện khác</span>
                    </button>
                    {topic.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => setTopic('')}
                        className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800"
                      >
                        <X className="w-3 h-3" /> Xóa ô nhập
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Genre Switcher Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" /> Chọn nhanh thể loại:
                  </span>
                  {GENRE_NAV_ITEMS.map((item) => {
                    const isCurrent = genre === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectGenreQuick(item.id)}
                        className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white border border-blue-400 shadow-md shadow-blue-900/40 scale-105'
                            : 'bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Suggestions Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {activeSuggestionsList.map((sug, idx) => {
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
            );
          })()}

          {/* Quick Settings: Genre & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800/60 mt-1">
            {/* Genre */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Thể Loại Phim:
              </label>
              <select
                value={genre}
                onChange={(e) => handleSelectGenreQuick(e.target.value as VideoGenre)}
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
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleQuickSyncStoryboard}
                disabled={isLoading}
                title="Tạo nhanh phân cảnh ăn khớp 100% với chủ đề ngay tức thì (0ms)"
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-500/30 transition-all cursor-pointer h-[42px] shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Đồng bộ (0ms)</span>
              </button>

              <button
                id="btn-generate-script"
                onClick={() => handleGenerate()}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50 transition-all cursor-pointer h-[42px]"
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
          {/* Out-of-sync notification banner if user changed topic without generating yet */}
          {topic.trim().length >= 3 &&
           !generatedScript.title.toLowerCase().includes(topic.trim().toLowerCase().slice(0, 8)) &&
           !generatedScript.logline.toLowerCase().includes(topic.trim().toLowerCase().slice(0, 8)) && (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="text-amber-400 text-lg">💡</span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-amber-200">
                    Bảng phân cảnh bên dưới đang là của kịch bản trước: "{generatedScript.title.slice(0, 40)}..."
                  </p>
                  <p className="text-[11px] text-amber-300/80">
                    Bấm để đồng bộ toàn bộ phân cảnh, nhân vật & đạo cụ khớp 100% với: "{topic.trim().slice(0, 45)}"
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickSyncStoryboard}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Đồng bộ Phân Cảnh (0ms)</span>
              </button>
            </div>
          )}

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
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border border-indigo-400/40"
                title="Chuyển sang Bước 2: Bảng phân cảnh chi tiết Shot-by-Shot"
              >
                <Film className="w-4 h-4 text-indigo-200" />
                <span>Bước 2: Xem Phân Cảnh (Shot-by-Shot) ➔</span>
              </button>

              <button
                onClick={() => {
                  onUseGeneratedScript(generatedScript);
                  if (typeof onOpenEightSecondStudioWithScript === 'function') {
                    onOpenEightSecondStudioWithScript(generatedScript);
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold transition-all cursor-pointer border border-purple-500/40"
                title="Chuyển thẳng sang Bước 4: Tạo Prompt Video AI 8s"
              >
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span>Bước 4: Prompts Video 8s</span>
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
