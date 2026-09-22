import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    engine: "gemini-3.8-flash",
  });
});

// Helper: Intelligent Fallback Script Builder if API key is missing or quota reached
function buildFallbackScript(
  topic: string,
  genre: string = "drama",
  duration: string = "3 phút",
  tone: string = "Điện ảnh, cuốn hút, giàu cảm xúc",
  customAudience?: string,
  customSetting?: string
) {
  const cleanTopic = topic.trim() || "Chuyến phiêu lưu và hành trình vượt qua giới hạn";
  const genreLabelMap: Record<string, string> = {
    drama: "Phim Ngắn / Tâm Lý Xã Hội",
    scifi_cyberpunk: "Khoa Học Viễn Tưởng (Sci-Fi / Cyberpunk)",
    tvc_commercial: "TVC Quảng Cáo & Video Sản Phẩm",
    action_thriller: "Hành Động / Giật Gân / Trinh Thám",
    tiktok_viral: "Video Ngắn 60s Viral TikTok",
    historical_fantasy: "Cổ Trang / Dã Sử / Huyền Huyễn",
    comedy: "Hài Hước / Tình Huống Bi Hài",
    horror_mystery: "Kinh Dị / Bí Ẩn / Siêu Nhiên",
    documentary: "Phim Tài Liệu & Khám Phá",
    education_explainer: "Video Giáo Dục & Giải Thích Kiến Thức",
    drama_psa: "Tiểu Phẩm Tuyên Truyền & Cảnh Báo",
  };
  const genreLabel = genreLabelMap[genre] || "Phim Điện Ảnh Đa Thể Loại";

  const isSciFi = genre.includes("scifi");
  const isTVC = genre.includes("tvc");
  const isHorror = genre.includes("horror");
  const isHistorical = genre.includes("historical");

  const char1 = isSciFi
    ? { name: "An (Kỹ sư AI)", role: "Nhân vật chính - Chuyên gia công nghệ tương lai", costume: "Trang phục tối giản phong cách Cyberpunk, thiết bị quang học ở thái dương" }
    : isTVC
    ? { name: "Minh (Nhà sáng tạo trẻ)", role: "Nhân vật trải nghiệm & Đại sứ thương hiệu", costume: "Trang phục hiện đại thanh lịch, nụ cười rạng rỡ và năng lượng tích cực" }
    : isHorror
    ? { name: "Bảo (Nhà nghiên cứu)", role: "Nhân vật chính - Người giải mã bí ẩn", costume: "Áo khoác măng-tô sẫm màu, mang theo sổ tay da và đèn pin cổ" }
    : isHistorical
    ? { name: "Trần Quân (Hiệp khách)", role: "Nhân vật chính - Kiếm khách ẩn dật", costume: "Võ phục vải thô thời cổ, đeo bội kiếm sau lưng" }
    : { name: "Nhân vật chính", role: "Nhân vật trung tâm của câu chuyện", costume: "Trang phục đời thường hiện đại, phù hợp bối cảnh" };

  const char2 = isTVC
    ? { name: "Khách hàng / Bạn đồng hành", role: "Người cùng chia sẻ giá trị sản phẩm", costume: "Trang phục tự tin, phong thái cởi mở" }
    : { name: "Nhân vật đồng hành / Đối trọng", role: "Tạo xung đột và xúc tác câu chuyện", costume: "Trang phục phản ánh tính cách đối nghịch" };

  const defaultLocation = isSciFi
    ? "Thành phố ánh sáng tương lai với những tòa tháp hologram lơ lửng"
    : isTVC
    ? "Không gian studio tối giản tràn ngập ánh sáng tự nhiên"
    : isHorror
    ? "Căn phòng gác mái phủ bụi thời gian trong dinh thự cổ"
    : isHistorical
    ? "Rừng trúc phủ sương mờ bên bờ suối vắng"
    : "Không gian đô thị đương đại sống động";

  return {
    id: `script-ai-${Date.now()}`,
    title: `Kịch Bản: ${cleanTopic.toUpperCase()}`,
    subtitle: `Kịch bản điện ảnh chuẩn phân cảnh (${genreLabel}) - Chủ đề: ${cleanTopic}`,
    genre: (genre as any) || "drama",
    genreLabel,
    targetDuration: duration || "3 phút",
    targetAudience: customAudience || "Khán giả đại chúng yêu thích phim ảnh và video chất lượng cao",
    tone: tone || "Điện ảnh, cuốn hút, thông điệp sâu sắc",
    logline: `Lấy cảm hứng từ chủ đề "${cleanTopic}", bộ phim dẫn dắt người xem qua hành trình cảm xúc mãnh liệt, mở ra góc nhìn mới mẻ và để lại dư âm sâu đậm.`,
    characters: [char1, char2],
    propsLocations: {
      locations: [
        customSetting || defaultLocation,
        "Không gian nội cảnh đặc tả chiều sâu tâm lý",
        "Đại cảnh ngoài trời mang tính biểu tượng",
      ],
      props: [
        "Vật phẩm biểu tượng then chốt gắn liền với cốt truyện",
        "Thiết bị kỹ thuật số ghi lại dấu vết",
        "Ánh sáng tạo hiệu ứng tương phản nghệ thuật",
      ],
    },
    scenes: [
      {
        id: 1,
        timeCode: "00:00 - 00:30",
        shotType: "Toàn cảnh (Wide Shot)",
        setting: customSetting || defaultLocation,
        visualAction: `Toàn cảnh mở màn thiết lập thế giới của câu chuyện. Máy quay lướt chậm từ trên cao xuống để giới thiệu bối cảnh "${cleanTopic}". Nhân vật chính xuất hiện trong khuôn hình, tương tác với không gian xung quanh với ánh mắt đầy suy tư.`,
        actorDialogue: `${char1.name}: "Mỗi bước đi hôm nay đều là khởi đầu của một điều chưa từng thấy..."`,
        voiceoverNarration: `Có những câu chuyện bắt đầu từ một khoảnh khắc tưởng chừng bình dị nhất: "${cleanTopic}". Nhưng chính từ đây, mọi giới hạn bắt đầu được định nghĩa lại.`,
        soundEffects: "Âm hưởng điện ảnh du dương, tiếng môi trường chân thực với độ chi tiết cao.",
        vfxGraphics: `Dòng chữ điện ảnh xuất hiện nhẹ nhàng: "${cleanTopic.toUpperCase()}"`,
      },
      {
        id: 2,
        timeCode: "00:30 - 01:10",
        shotType: "Trung cảnh (Medium Shot) & Cận cảnh (Close-up)",
        setting: "Không gian diễn biến trung tâm",
        visualAction: `Cắt cảnh trung cận: Tình huống bước ngoặt xuất hiện. Nhân vật đối mặt với thử thách hoặc phát hiện quan trọng. Máy quay chuyển động theo bước chân, bắt trọn từng biến đổi cảm xúc tinh tế trên khuôn mặt.`,
        actorDialogue: `${char2.name}: "Bạn có dám chắc đây là lựa chọn duy nhất của mình?"`,
        voiceoverNarration: `Trước mỗi bước ngoặt lớn, điều định hình chúng ta không phải là nghịch cảnh, mà là bản lĩnh và niềm tin mà ta kiên định gìn giữ.`,
        soundEffects: "Nhịp điệu dồn dập tăng tiến, tiếng bước chân, hiệu ứng âm thanh kích thích trí tò mò.",
        vfxGraphics: "Chuyển cảnh ánh sáng mềm mại, tăng độ bão hòa màu sắc.",
      },
      {
        id: 3,
        timeCode: "01:10 - 02:00",
        shotType: "Cận cảnh đặc tả (Extreme Close-up)",
        setting: "Cao trào xung đột / Khám phá bí ẩn",
        visualAction: `Đặc tả khoảnh khắc quyết định: Bàn tay chạm vào biểu tượng then chốt. Ánh mắt bừng sáng sự quyết đoán. Khung hình sử dụng kỹ thuật quay chậm slow-motion để tôn vinh sự tinh tế và vẻ đẹp của khoảnh khắc.`,
        actorDialogue: `${char1.name}: "Tôi đã tìm ra câu trả lời."`,
        voiceoverNarration: `Khi đam mê và sự chân thành gặp nhau, không có ranh giới nào là không thể vượt qua.`,
        soundEffects: "Âm bass trầm sâu lắng, âm nhạc vút cao hào hùng truyền cảm hứng.",
        vfxGraphics: "Tia sáng nghệ thuật lens flare, hạt bụi ánh sáng cinematic.",
      },
      {
        id: 4,
        timeCode: "02:00 - 03:00",
        shotType: "Toàn cảnh góc rộng lùi dần (Grand Aerial Pull-back)",
        setting: "Khung cảnh kết thúc mở rộng",
        visualAction: `Máy quay lùi dần ra xa, bao quát nhân vật tự tin bước về phía chân trời mới ngập tràn ánh hoàng hôn hoặc ánh bình minh rạng rỡ. Hình ảnh đọng lại sự thanh thản, tự tin và tràn đầy cảm hứng sống.`,
        voiceoverNarration: `Hành trình vĩ đại luôn bắt đầu từ một quyết định dũng cảm. Hãy viết tiếp câu chuyện của chính bạn!`,
        soundEffects: "Hợp âm vĩ cầm và piano vang vọng rồi tan dần vào tĩnh lặng ấm áp.",
        vfxGraphics: "Logo hoặc Slogan thông điệp kết phim phát sáng trang nhã.",
      },
    ],
    coreMessage: `Thông điệp ý nghĩa rút ra từ "${cleanTopic}": Sự kiên trì, sáng tạo và niềm tin luôn mở ra những điều kỳ diệu.`,
    callToAction: `Hành động ngay hôm nay để biến ước mơ và ý tưởng của bạn thành hiện thực!`,
  };
}

// API: Generate complete standard film script using Gemini API (or intelligent fallback)
app.post("/api/generate-script", async (req, res) => {
  try {
    const { topic, genre, duration, tone, customAudience, customSetting } = req.body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      res.status(400).json({ error: "Vui lòng nhập chủ đề kịch bản muốn tạo." });
      return;
    }

    const ai = getAi();

    // If no API key is provided, use high-fidelity intelligent fallback
    if (!ai) {
      console.log("No GEMINI_API_KEY detected, using intelligent script generator fallback.");
      const fallbackScript = buildFallbackScript(
        topic,
        genre,
        duration,
        tone,
        customAudience,
        customSetting
      );
      res.json({ script: fallbackScript, source: "generator_fallback" });
      return;
    }

    // Call Gemini 3.8 Flash model with Universal Filmmaking Intelligence
    const prompt = `Bạn là một Đạo diễn Điện ảnh, Nhà sản xuất Video và Bậc thầy Biên kịch chuyên nghiệp (Universal Film Director & Screenwriter), có khả năng sáng tác kịch bản phim ảnh đỉnh cao cho BẤT KỲ THỂ LOẠI VÀ CHỦ ĐỀ NÀO trên thế giới.
    
Người dùng yêu cầu tạo một kịch bản phim/video hoàn chỉnh, chuẩn điện ảnh chuyên nghiệp cho chủ đề sau:
- Chủ đề kịch bản: "${topic.trim()}" (Tự do sáng tạo cho bất kỳ chủ đề nào: Khoa học viễn tưởng, TVC thương mại, Phim tâm lý, Hành động, Hài hước, Kinh dị, Cổ trang kiếm hiệp, Phim tài liệu, Video viral TikTok, Đời sống thường nhật, Công nghệ, v.v.)
- Thể loại: ${genre || "drama"} (drama: Tâm lý xã hội / Phim ngắn, scifi_cyberpunk: Khoa học viễn tưởng, tvc_commercial: TVC Quảng cáo, action_thriller: Hành động/Trinh thám, tiktok_viral: Video viral ngắn, historical_fantasy: Cổ trang/Dã sử, comedy: Hài hước, horror_mystery: Kinh dị/Bí ẩn, documentary: Phim tài liệu, education_explainer: Video giáo dục, drama_psa: Tiểu phẩm tuyên truyền)
- Thời lượng mong muốn: ${duration || "3 phút"}
- Tông giọng / Phong cách: ${tone || "Điện ảnh, cuốn hút, giàu cảm xúc"}
- Đối tượng mục tiêu: ${customAudience || "Khán giả đại chúng"}
- Bối cảnh gợi ý: ${customSetting || "Bối cảnh phù hợp tự nhiên với chủ đề"}

HÃY TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON HỢP LỆ (KHÔNG KÈM TEXT MARKDOWN NGOÀI JSON) THEO ĐÚNG CẤU TRÚC SAU:
{
  "title": "Tiêu đề kịch bản hấp dẫn, đậm chất điện ảnh",
  "subtitle": "Phụ đề kịch bản súc tích",
  "genre": "${genre || "drama"}",
  "genreLabel": "Tên tiếng Việt của thể loại (ví dụ: Khoa Học Viễn Tưởng, TVC Quảng Cáo, Phim Ngắn Tâm Lý, Trinh Thám...)",
  "targetDuration": "${duration || "3 phút"}",
  "targetAudience": "${customAudience || "Khán giả đại chúng"}",
  "tone": "${tone || "Điện ảnh, sâu sắc, cuốn hút"}",
  "logline": "1-2 câu tóm tắt cốt truyện kịch tính của bộ phim",
  "characters": [
    {
      "name": "Tên nhân vật (tuổi hoặc vai trò)",
      "role": "Vai trò trong kịch bản",
      "costume": "Trang phục và đặc điểm ngoại hình đặc trưng"
    }
  ],
  "propsLocations": {
    "locations": ["Bối cảnh 1", "Bối cảnh 2"],
    "props": ["Đạo cụ 1", "Đạo cụ 2"]
  },
  "scenes": [
    {
      "id": 1,
      "timeCode": "00:00 - 00:30",
      "shotType": "Toàn cảnh (Wide Shot) / Cận cảnh (Close-up) / Trung cảnh (Medium Shot) / Góc trên cao (Drone) / Cận cảnh đặc tả (Extreme Close-up) / POV",
      "setting": "Bối cảnh cụ thể của phân cảnh",
      "visualAction": "Miêu tả chi tiết hành động diễn viên, chuyển động máy quay, ánh sáng, màu sắc và diễn biến câu chuyện sống động như thật",
      "actorDialogue": "Lời thoại nhân vật tự nhiên, giàu sức sống",
      "voiceoverNarration": "Lời bình, lời dẫn thuyết minh của MC / giọng đọc Voiceover truyền cảm hứng",
      "soundEffects": "Tiếng động hiện trường SFX và phong cách âm nhạc BGM",
      "vfxGraphics": "Kỹ xảo hình ảnh, kỹ thuật quay slow-mo hoặc chữ chạy đồ họa trên màn hình"
    }
  ],
  "coreMessage": "Thông điệp cốt lõi hoặc giá trị mà tác phẩm gửi gắm",
  "callToAction": "Lời kêu gọi hành động hoặc câu slogan ấn tượng đọng lại cuối phim"
}

LƯU Ý QUAN TRỌNG:
1. Số phân cảnh (scenes) phải từ 4 đến 6 phân cảnh, phân bổ thời gian hợp lý theo thời lượng "${duration || "3 phút"}".
2. Hành động diễn xuất (visualAction) phải giàu tính thị giác điện ảnh (visual storytelling) để đạo diễn và tổ quay phim có thể bấm máy ghi hình ngay lập tức hoặc đưa vào AI Video generation.
3. Lời thoại (actorDialogue) và lời dẫn (voiceoverNarration) bằng tiếng Việt tự nhiên, cuốn hút, phù hợp với phong cách của thể loại đã chọn.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    let parsedScript: any;

    try {
      parsedScript = JSON.parse(responseText);
    } catch {
      // Clean possible markdown code fences
      const cleaned = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsedScript = JSON.parse(cleaned);
    }

    if (!parsedScript.id) {
      parsedScript.id = `script-ai-${Date.now()}`;
    }

    res.json({ script: parsedScript, source: "gemini" });
  } catch (error: any) {
    console.error("Gemini API generation error:", error);
    // Return fallback script if API error occurs
    const fallbackScript = buildFallbackScript(
      req.body?.topic || "Bài học vượt đèn đỏ",
      req.body?.genre,
      req.body?.duration,
      req.body?.tone,
      req.body?.customAudience,
      req.body?.customSetting
    );
    res.json({ script: fallbackScript, source: "fallback_on_error", error: error?.message });
  }
});

// API: Real-time dynamic topic & story angle suggestions based on user keystrokes
app.post("/api/suggest-topics", async (req, res) => {
  const query = (req.body?.query || "").trim();
  const currentGenre = req.body?.currentGenre || "drama";

  if (!query || query.length < 2) {
    res.json({ suggestions: [] });
    return;
  }

  // Fast heuristic suggestions generator as reliable baseline
  const generateHeuristicSuggestions = (q: string) => {
    const lower = q.toLowerCase();
    const suggestions = [];

    // Angle 1: Dramatic / Conflict
    suggestions.push({
      label: `Xung Đột Kịch Tính: ${q.slice(0, 30)}`,
      topic: `Một biến cố bất ngờ xảy ra xoay quanh "${q}", đẩy nhân vật chính vào tình thế tiến thoái lưỡng nan buộc phải đưa ra quyết định thay đổi số phận.`,
      genre: "drama",
      genreLabel: "Phim Ngắn Tâm Lý / Drama",
      duration: "3min",
      tone: "Kịch tính, căng thẳng, bài học nhân văn",
      icon: "🎭",
      angle: "Xung Đột Kịch Tính",
    });

    // Angle 2: Sci-Fi / Công Nghệ / Tương Lai
    suggestions.push({
      label: `Sci-Fi 2090: ${q.slice(0, 30)}`,
      topic: `Trong thế giới tương lai nơi công nghệ AI chi phối, "${q}" bỗng trở thành chìa khóa giải mã bí ẩn đánh thức lại cảm xúc nguyên bản của con người.`,
      genre: "scifi_cyberpunk",
      genreLabel: "Khoa Học Viễn Tưởng",
      duration: "3min",
      tone: "Huyền ảo, công nghệ vị lai, triết học sâu sắc",
      icon: "🚀",
      angle: "Khoa Học Viễn Tưởng",
    });

    // Angle 3: Viral TikTok 60s & Twist bất ngờ
    suggestions.push({
      label: `Viral 60s Cú Lật: ${q.slice(0, 30)}`,
      topic: `Tình huống mở đầu hài hước hoặc gây tranh cãi về "${q}", nhưng đến 10 giây cuối cùng xuất hiện cú bẻ lái (twist) bất ngờ khiến người xem vỡ òa.`,
      genre: "tiktok_viral",
      genreLabel: "Video Ngắn Viral 60s",
      duration: "60s",
      tone: "Nhanh, cuốn hút, bất ngờ phút chót",
      icon: "⚡",
      angle: "Cú Lật Bất Ngờ (Twist)",
    });

    // Angle 4: TVC Thương Mại / Điện Ảnh Mỹ Học
    suggestions.push({
      label: `TVC Điện Ảnh: Tôn Vinh ${q.slice(0, 30)}`,
      topic: `Thước phim quảng cáo tôn vinh giá trị và vẻ đẹp của "${q}", sử dụng các góc quay macro nghệ thuật, chuyển động chậm 120fps và lời bình truyền cảm hứng.`,
      genre: "tvc_commercial",
      genreLabel: "TVC Quảng Cáo",
      duration: "60s",
      tone: "Sang trọng, truyền cảm hứng, mỹ thuật cao",
      icon: "☕",
      angle: "Mỹ Thuật & Cảm Hứng",
    });

    // Angle 5: Trinh Thám / Bí Ẩn
    suggestions.push({
      label: `Bí Mật Đằng Sau: ${q.slice(0, 30)}`,
      topic: `Một manh mối bí ẩn liên quan đến "${q}" được phát hiện, hé lộ sự thật bị chôn giấu suốt nhiều năm mà không ai ngờ tới.`,
      genre: "action_thriller",
      genreLabel: "Trinh Thám / Giật Gân",
      duration: "3min",
      tone: "Hồi hộp, bí ẩn, suy luận sắc sảo",
      icon: "🕵️",
      angle: "Bí Ẩn Trinh Thám",
    });

    return suggestions;
  };

  const ai = getAi();
  if (!ai) {
    res.json({ suggestions: generateHeuristicSuggestions(query), source: "heuristic" });
    return;
  }

  try {
    const prompt = `Người dùng đang gõ ý tưởng/chủ đề làm phim: "${query}". Thể loại người dùng đang chọn: "${currentGenre}".
Nhiệm vụ của bạn là đóng vai Đạo diễn và Biên kịch sáng tạo, ngay lập tức đề xuất 4 đến 5 Ý TƯỞNG / GÓC TIẾP CẬN KỊCH BẢN ĐỘC ĐÁO, HẤP DẪN bám sát trực tiếp vào từ khóa "${query}".

Mỗi gợi ý phải là một câu chuyện hoàn chỉnh, hấp dẫn, có tính hình ảnh cao, đa dạng các góc độ:
1. Góc kịch tính / xung đột cảm xúc (Drama / Emotional)
2. Góc phá cách / khoa học viễn tưởng hoặc trinh thám ly kỳ (Sci-Fi / Thriller)
3. Góc video ngắn triệu view trên TikTok/Reels với cú lật bất ngờ (Viral 60s Twist)
4. Góc TVC quảng cáo nghệ thuật / truyền cảm hứng (TVC Commercial) hoặc Hài hước / châm biếm sâu cay

HÃY TRẢ VỀ DUY NHẤT MỘT JSON HỢP LỆ VỚI CẤU TRÚC:
{
  "suggestions": [
    {
      "label": "Tên gợi ý ngắn gọn (dưới 7 từ, lôi cuốn)",
      "topic": "Ý tưởng kịch bản đầy đủ 1-2 câu chi tiết, cụ thể hóa từ khóa '${query}' thành cốt truyện hấp dẫn",
      "genre": "drama | scifi_cyberpunk | tvc_commercial | action_thriller | tiktok_viral | historical_fantasy | comedy | horror_mystery | documentary | drama_psa",
      "genreLabel": "Tên thể loại bằng tiếng Việt",
      "duration": "60s | 2min | 3min",
      "tone": "Tông giọng gợi ý (ngắn)",
      "icon": "Emoji phù hợp nhất (ví dụ: 🚀, 🕵️, ☕, 🎭, ⚡, 👻, ⚔️, ❤️, 📱)",
      "angle": "Góc tiếp cận (ví dụ: Cú lật bất ngờ, Đậm chất điện ảnh, Xúc động rơi lệ, Trinh thám bí ẩn...)"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    if (parsed && Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
      res.json({ suggestions: parsed.suggestions, source: "gemini" });
      return;
    }

    res.json({ suggestions: generateHeuristicSuggestions(query), source: "heuristic_fallback" });
  } catch (error) {
    console.warn("Real-time suggestion error, using heuristic:", error);
    res.json({ suggestions: generateHeuristicSuggestions(query), source: "heuristic_on_error" });
  }
});

// API: Generate 8-second clips breakdown and AI video generation prompts with Character Consistency Bible
app.post("/api/generate-8s-breakdown", async (req, res) => {
  const script = req.body?.script;
  if (!script || !script.scenes || script.scenes.length === 0) {
    res.status(400).json({ error: "Kịch bản không hợp lệ hoặc thiếu phân cảnh" });
    return;
  }

  const ai = getAi();
  if (!ai) {
    // Fallback if no API key
    res.json({ breakdown: null, source: "fallback_needed" });
    return;
  }

  try {
    const prompt = `Bạn là Chuyên gia Đạo diễn Điện ảnh và Kỹ sư Prompt Video AI hàng đầu thế giới (Chuyên gia Runway Gen-3 Alpha, Kling 1.5, Luma Dream Machine, OpenAI Sora, Midjourney v6.1 & Flux).
Nhiệm vụ của bạn là nhận kịch bản phim/video (thuộc bất kỳ thể loại nào: Sci-Fi, TVC quảng cáo, Drama, Trinh thám, Kinh dị, Hài hước, Cổ trang, Tài liệu, v.v.) và phân rã thành:
1. BỘ NHẬN DIỆN ĐỒNG NHẤT NHÂN VẬT XUYÊN SUỐT (Character Consistency Bible & Master Prompt Tokens):
   - Thiết lập ngoại hình chi tiết phù hợp với thể loại: tuổi, nhân dạng, kiểu tóc, đặc điểm khuôn mặt, trang phục cố định không đổi (áo, màu sắc, phụ kiện biểu trưng), đạo cụ hoặc phương tiện gắn liền.
   - Tạo Master Prompt Token tiếng Anh dạng: "[Character Name, age/traits, facial features, specific haircut, exact unchanging clothing, signature accessory]" để chèn vào đầu MỌI prompt video.
2. CHIA NHỎ TOÀN BỘ KỊCH BẢN THÀNH CÁC PHÂN ĐOẠN ĐÚNG 8 GIÂY (8-second clips):
   - Các clip nối tiếp nhau chính xác: Clip 1 (00:00 - 00:08), Clip 2 (00:08 - 00:16), Clip 3 (00:16 - 00:24)...
   - Mỗi clip 8 giây phải có:
     * visualAction (tiếng Việt): Hành động cụ thể diễn ra trong 8 giây (để AI video render không bị biến dạng)
     * audioVoiceover (tiếng Việt): Lời thoại hoặc lời dẫn thuyết minh ứng với 8 giây đó
     * cameraMovement: Góc máy & chuyển động camera (Slow dolly push-in, low angle tracking, FPV drone, macro close-up...)
     * lightingMood: Ánh sáng bối cảnh phù hợp thể loại (cyberpunk neon, warm golden hour, moody chiaroscuro, studio high-key...)
     * englishVideoPrompt: Prompt tiếng Anh chuẩn điện ảnh cho Runway/Kling/Sora kết hợp Master Character Token + hành động 8s + chuyển động máy + ánh sáng + cinematic 35mm film, 4k 24fps
     * vietnamesePrompt: Prompt tiếng Việt tương ứng
     * firstFramePromptMidjourney: Prompt tạo keyframe xuất phát bằng Midjourney/Flux cho kỹ thuật Image-to-Video (I2V)
     * recommendedModel: Runway Gen-3 Alpha / Kling 1.5 / Luma Dream Machine / Sora / Hailuo Minimax
     * motionScore: Điểm chuyển động từ 1 đến 10

KỊCH BẢN ĐẦU VÀO:
Tiêu đề: ${script.title}
Thể loại: ${script.genreLabel || script.genre}
Thời lượng: ${script.targetDuration}
Thông điệp: ${script.coreMessage}
Nhân vật: ${JSON.stringify(script.characters)}
Phân cảnh gốc: ${JSON.stringify(script.scenes.map((s: any) => ({ id: s.id, timeCode: s.timeCode, setting: s.setting, visualAction: s.visualAction, voiceover: s.voiceoverNarration, dialogue: s.actorDialogue })))}

YÊU CẦU TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON THEO SCHEMA DƯỚI ĐÂY (KHÔNG KÈM TEXT NGOÀI):
{
  "scriptId": "${script.id}",
  "scriptTitle": "${script.title}",
  "totalClips": 12,
  "totalDurationSeconds": 96,
  "characterAnchors": [
    {
      "id": "char-1",
      "name": "Tên nhân vật chính",
      "role": "Vai trò",
      "appearanceAnchor": "Mô tả chi tiết khuôn mặt, tóc, độ tuổi, đặc điểm nhận diện",
      "clothingAnchor": "Trang phục cố định không đổi xuyên suốt câu chuyện",
      "masterPromptToken": "[Character Name, appearance, specific clothing, hair]",
      "negativePrompt": "deformed face, changing clothes, cartoon, 3D render, anime, inconsistent haircut, extra fingers"
    }
  ],
  "objectAnchors": [
    {
      "name": "Đạo cụ / Phương tiện biểu tượng",
      "promptAnchor": "Mô tả chi tiết vật thể hoặc phương tiện cố định"
    }
  ],
  "globalStylePrompt": "Cinematic 35mm film, shot on ARRI Alexa LF, natural cinematic lighting, highly detailed photorealism, authentic atmosphere, 4K UHD, 24fps motion blur",
  "globalNegativePrompt": "cartoon, CGI, 3D animation, oversaturated, deformed hands, warped objects, shifting clothes, changing actor face",
  "clips": [
    {
      "id": 1,
      "clipNumber": 1,
      "timeRange": "00:00 - 00:08",
      "durationSec": 8,
      "sceneReferenceId": 1,
      "title": "Tên hành động trong 8 giây",
      "visualAction": "Miêu tả chi tiết hành động trong 8s",
      "audioVoiceover": "Lời thoại hoặc lời dẫn tương ứng trong 8s",
      "charactersInvolved": ["Tên nhân vật"],
      "cameraMovement": "Slow steady dolly push-in",
      "lightingMood": "Cinematic lighting matching genre",
      "englishVideoPrompt": "Cinematic 35mm shot, [Master Character Token] action in 8 seconds, camera movement, lighting, 4k 24fps photorealism",
      "vietnamesePrompt": "Cảnh phim điện ảnh miêu tả hành động trong 8s.",
      "firstFramePromptMidjourney": "Cinematic film still, [Master Character Token], setting, lighting, photorealistic, 8k --ar 16:9 --style raw --v 6.1",
      "recommendedModel": "Runway Gen-3 Alpha",
      "motionScore": 5
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    res.json({ breakdown: parsed, source: "gemini" });
  } catch (err: any) {
    console.error("Error generating 8s breakdown with Gemini:", err);
    res.json({ breakdown: null, source: "error", error: err?.message });
  }
});

// Start Server with Vite Middleware in dev or static in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Traffic Video Film Studio running on http://localhost:${PORT}`);
  });
}

startServer();
