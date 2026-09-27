import React, { useState } from 'react';
import { 
  Camera, 
  Video, 
  Sparkles, 
  Layers, 
  MoveRight, 
  Eye, 
  Maximize2, 
  Compass, 
  Sliders, 
  Check, 
  Copy, 
  ArrowRight,
  ChevronRight,
  Info,
  Film,
  Play,
  RotateCcw
} from 'lucide-react';
import { VideoScript, ScriptScene } from '../types/script';

export interface CameraAngleStudioProps {
  script: VideoScript;
  onUpdateScript?: (script: VideoScript) => void;
  onNavigateToPrompts?: () => void;
  onNavigateToVideo?: () => void;
}

export interface CameraLensPreset {
  id: string;
  name: string;
  focalLength: string;
  shotType: string;
  purpose: string;
  visualEffect: string;
  recommendedMovement: string;
  samplePromptSnippet: string;
  icon: string;
}

export const CAMERA_PRESETS: CameraLensPreset[] = [
  {
    id: 'ultra_wide_aerial',
    name: 'Góc Toàn Cảnh Trên Cao (Drone Aerial / High Angle)',
    focalLength: '18mm - 24mm Ultra-Wide',
    shotType: 'Toàn cảnh (Wide Shot)',
    purpose: 'Thiết lập không gian, mô tả mức độ bao quát và định vị môi trường địa lý diễn ra câu chuyện.',
    visualEffect: 'Độ sâu trường ảnh vô tận, bao quát toàn bộ địa hình xung quanh, tạo cảm giác choáng ngợp hoặc cô độc.',
    recommendedMovement: 'Slow descending drone shot, high angle sweeping crane pan',
    samplePromptSnippet: 'high-angle drone aerial view, wide establishing landscape shot, slow cinematic descent, 24mm lens, 4K UHD',
    icon: '🦅',
  },
  {
    id: 'eye_level_medium',
    name: 'Góc Ngang Tầm Mắt (Eye-Level Medium Tracking)',
    focalLength: '35mm - 50mm Standard Prime',
    shotType: 'Trung cảnh (Medium Shot)',
    purpose: 'Ghi lại hành động của nhân vật trong mối tương quan với môi trường xung quanh một cách chân thực nhất.',
    visualEffect: 'Tỉ lệ mắt người tự nhiên, tạo cảm giác thân mật, đồng cảm và đưa người xem vào trung tâm tình huống.',
    recommendedMovement: 'Smooth dolly tracking shot alongside actor, handheld subtle organic shake',
    samplePromptSnippet: 'eye-level medium shot, smooth tracking dolly movement beside the character, 35mm lens, realistic depth of field, 24fps motion blur',
    icon: '🚶',
  },
  {
    id: 'close_up_emotion',
    name: 'Cận Cảnh Bắt Cảm Xúc (Emotional Close-Up Portrait)',
    focalLength: '85mm Portrait Lens',
    shotType: 'Cận cảnh (Close-up)',
    purpose: 'Đặc tả biến chuyển tâm lý tinh tế, ánh mắt hoảng sợ, quyết tâm, nụ cười hoặc giọt nước mắt.',
    visualEffect: 'Hậu cảnh xóa mờ nghệ thuật (creamy bokeh), làm nổi bật chi tiết khuôn mặt và đường nét chân thực.',
    recommendedMovement: 'Slow cinematic push-in on eyes, shallow focus rack',
    samplePromptSnippet: 'cinematic close-up portrait, shallow depth of field, sharp focus on facial expression, creamy bokeh background, 85mm lens, photorealistic',
    icon: '👤',
  },
  {
    id: 'macro_extreme_detail',
    name: 'Cận Cảnh Đặc Tả Chi Tiết (Extreme Close-Up / Macro)',
    focalLength: '100mm Macro Lens',
    shotType: 'Cận cảnh đặc tả (Extreme Close-up)',
    purpose: 'Nhấn mạnh chi tiết chìa khóa: Bàn tay nắm phao cứu sinh, nút bấm báo động, đồng hồ đếm ngược, biển cấm...',
    visualEffect: 'Cực kỳ sắc nét vào từng kết cấu bề mặt, tạo cảm giác căng thẳng tột độ và tập trung tuyệt đối.',
    recommendedMovement: 'Static macro shot with subtle micro vibration or focus pull',
    samplePromptSnippet: 'extreme close-up macro shot, hyper-detailed texture, dramatic cinematic rim lighting, 100mm macro lens, 8k crisp details',
    icon: '🔍',
  },
  {
    id: 'first_person_pov',
    name: 'Góc Nhìn Thứ Nhất (First-Person POV Experience)',
    focalLength: '28mm Dynamic POV',
    shotType: 'Góc nhìn người lái (POV Dashcam)',
    purpose: 'Đặt người xem trực tiếp vào góc nhìn của nhân vật hoặc camera hành trình, tạo trải nghiệm nhập vai 100%.',
    visualEffect: 'Thấy một phần bàn tay, tầm nhìn rung lắc theo nhịp thở và bước chạy hoặc kính xe.',
    recommendedMovement: 'Dynamic FPV forward tracking, first-person perspective with slight head bob',
    samplePromptSnippet: 'first-person POV camera angle, realistic forward motion, immersive viewing angle, dynamic 28mm wide angle perspective, GoPro CineStyle',
    icon: '👁️',
  },
  {
    id: 'low_angle_hero',
    name: 'Góc Thấp Tôn Vinh / Kịch Tính (Low-Angle Dutch Tilt)',
    focalLength: '24mm - 35mm Low Tilt',
    shotType: 'Góc thấp (Low Angle)',
    purpose: 'Tạo cảm giác đồ sộ, áp lực uy hiếp hoặc sự kiên cường vượt qua nghịch cảnh của nhân vật cứu hộ.',
    visualEffect: 'Nhân vật trở nên mạnh mẽ, đường chân trời thấp, bầu trời hoặc trần nhà mở rộng.',
    recommendedMovement: 'Low angle slow tilt-up from ground level, Dutch angle 15-degree tilt',
    samplePromptSnippet: 'dramatic low-angle shot looking up at the hero, cinematic dutch angle, majestic posture, high contrast lighting, 35mm film',
    icon: '📐',
  },
];

export const CameraAngleStudio: React.FC<CameraAngleStudioProps> = ({
  script,
  onUpdateScript,
  onNavigateToPrompts,
  onNavigateToVideo,
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<number>(
    script.scenes && script.scenes.length > 0 ? script.scenes[0].id : 1
  );
  const [copiedPresetId, setCopiedPresetId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const currentScene = script.scenes?.find((s) => s.id === selectedSceneId) || script.scenes?.[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPresetId(id);
    setTimeout(() => setCopiedPresetId(null), 2000);
  };

  const handleApplyPresetToScene = (preset: CameraLensPreset) => {
    if (!onUpdateScript || !currentScene) return;
    setIsApplying(true);

    const updatedScenes = script.scenes.map((sc) => {
      if (sc.id === selectedSceneId) {
        return {
          ...sc,
          shotType: preset.shotType as any,
          visualAction: sc.visualAction.includes('Góc quay:')
            ? sc.visualAction.replace(/Góc quay:[^.]+\./, `Góc quay: ${preset.name} (${preset.focalLength}).`)
            : `[Góc quay: ${preset.name} (${preset.focalLength})] ${sc.visualAction}`,
        };
      }
      return sc;
    });

    onUpdateScript({
      ...script,
      scenes: updatedScenes,
    });

    setTimeout(() => setIsApplying(false), 500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Workflow Step Indicator */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500 text-white uppercase tracking-wider">
                BƯỚC 3 / 5: THIẾT KẾ GÓC MÁY (CAMERA BLOCKING)
              </span>
              <span className="text-xs text-blue-300 font-medium">
                Quy trình: Kịch bản ➔ Phân cảnh ➔ <strong className="text-white font-bold underline">Góc máy</strong> ➔ Prompt ➔ Video
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Camera className="w-6 h-6 text-blue-400" />
              <span>Studio Đặt Góc Máy & Tiêu Cự Đạo Diễn (Director's Lens & Framing)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Chọn tiêu cự (Focal Length), cỡ cảnh và hướng chuyển động máy quay (Camera Movement) chuẩn điện ảnh cho từng phân cảnh trong kịch bản: <span className="text-amber-300 font-bold">"{script.title}"</span>.
            </p>
          </div>

          {/* Quick Flow Navigators */}
          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToPrompts && (
              <button
                type="button"
                onClick={onNavigateToPrompts}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Tiếp tục: Bước 4 (Prompt Video)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scene Selector (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-blue-400" />
                <span>Chọn Phân Cảnh Để Đặt Góc Máy ({script.scenes?.length || 0} cảnh)</span>
              </h3>
              <span className="text-[11px] text-slate-400">Ấn chọn cảnh</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
              {script.scenes?.map((scene) => {
                const isSelected = scene.id === selectedSceneId;
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => setSelectedSceneId(scene.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-blue-950/70 border-blue-500 text-white shadow-md ring-2 ring-blue-500/20'
                        : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        Cảnh #{scene.id} • {scene.timeCode}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-300 truncate max-w-[140px]">
                        {scene.shotType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {scene.visualAction}
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Compass className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="truncate">{scene.setting}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Camera & Lens Presets & Interactive Director Desk (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Active Scene Preview Card */}
          {currentScene && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-sm">
                    #{currentScene.id}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Đang Định Hình Góc Máy Cho Phân Cảnh #{currentScene.id}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Thời lượng: <strong className="text-slate-200">{currentScene.timeCode}</strong> • Bối cảnh: <strong className="text-slate-200">{currentScene.setting}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    Cỡ cảnh hiện tại: {currentScene.shotType}
                  </span>
                </div>
              </div>

              {/* Scene Visual & Dialogue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">🎬 Hành động & Diễn xuất:</span>
                  <p className="text-slate-200 leading-relaxed">{currentScene.visualAction}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">🎙️ Lời thoại & Thuyết minh:</span>
                  <p className="text-emerald-300 italic leading-relaxed">
                    {currentScene.actorDialogue ? `"${currentScene.actorDialogue}"` : (currentScene.voiceoverNarration || 'Không có thoại')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Director Camera Lens & Movement Presets Grid */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>6 Mẫu Góc Máy & Tiêu Cự Điện Ảnh Tiêu Chuẩn (Director's Framing Library)</span>
              </h3>
              <span className="text-xs text-slate-400">Bấm "Áp Dụng Cho Cảnh" để cập nhật</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CAMERA_PRESETS.map((preset) => {
                const isCopied = copiedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md transition-all hover:bg-slate-850"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{preset.icon}</span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                              {preset.name}
                            </h4>
                            <span className="text-[11px] font-semibold text-blue-400">
                              Tiêu cự: {preset.focalLength}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        {preset.purpose}
                      </p>

                      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-1 text-[11px]">
                        <div className="text-slate-400">
                          <strong className="text-slate-300">Chuyển động máy:</strong> {preset.recommendedMovement}
                        </div>
                        <div className="text-amber-300/90 font-mono text-[10px] truncate">
                          Tag prompt: {preset.samplePromptSnippet}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => handleApplyPresetToScene(preset)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Áp dụng vào Cảnh #{selectedSceneId}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(preset.samplePromptSnippet, preset.id)}
                        className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                        title="Sao chép đoạn mô tả góc máy bằng tiếng Anh"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Đã chép' : 'Chép Tag'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Bar to Next Step */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <span className="text-emerald-400 text-lg">✨</span>
              <span>
                Sau khi thiết lập góc máy mong muốn, chuyển sang <strong>Bước 4 (Prompts Video AI)</strong> để sao chép prompt tối ưu cho Runway / Kling / Sora.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              {onNavigateToPrompts && (
                <button
                  type="button"
                  onClick={onNavigateToPrompts}
                  className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Bước 4: Sang Tab Prompts Video AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
