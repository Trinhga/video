import React, { useState } from 'react';
import { VideoScript, ScriptScene } from '../types/script';
import { 
  Clapperboard, 
  Copy, 
  Check, 
  Printer, 
  Play, 
  Volume2, 
  VolumeX, 
  Clock, 
  Users, 
  Film, 
  Sparkles, 
  Tv, 
  Video, 
  FileText, 
  Share2 
} from 'lucide-react';

interface ScriptViewerProps {
  script: VideoScript;
  onOpenTeleprompter: () => void;
  onOpenEightSecondStudio?: () => void;
  onSelectAnotherScript: (id: string) => void;
  allScripts: VideoScript[];
}

export const ScriptViewer: React.FC<ScriptViewerProps> = ({
  script,
  onOpenTeleprompter,
  onOpenEightSecondStudio,
  onSelectAnotherScript,
  allScripts,
}) => {
  const [copied, setCopied] = useState(false);
  const [playingSceneId, setPlayingSceneId] = useState<number | null>(null);

  // Web Speech API for voiceover preview
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

    utterance.onend = () => {
      setPlayingSceneId(null);
    };
    utterance.onerror = () => {
      setPlayingSceneId(null);
    };

    setPlayingSceneId(sceneId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyScript = () => {
    let markdown = `# KỊCH BẢN VIDEO: ${script.title.toUpperCase()}\n`;
    markdown += `**Thể loại:** ${script.genreLabel} | **Thời lượng:** ${script.targetDuration}\n`;
    markdown += `**Thông điệp cốt lõi:** ${script.coreMessage}\n`;
    markdown += `**Logline:** ${script.logline}\n\n`;
    markdown += `## DANH SÁCH NHÂN VẬT & DIỄN VIÊN:\n`;
    script.characters.forEach((c) => {
      markdown += `- **${c.name}**: ${c.role} (Trang phục: ${c.costume})\n`;
    });
    markdown += `\n## BẢNG PHÂN CẢNH CHI TIẾT (SHOT BY SHOT):\n\n`;

    script.scenes.forEach((s) => {
      markdown += `### CẢNH ${s.id} [${s.timeCode}] - ${s.shotType}\n`;
      markdown += `- **Bối cảnh:** ${s.setting}\n`;
      markdown += `- **Hình ảnh & Diễn xuất:** ${s.visualAction}\n`;
      if (s.actorDialogue) {
        markdown += `- **Lời thoại nhân vật:** ${s.actorDialogue}\n`;
      }
      markdown += `- **Lời dẫn Voiceover:** "${s.voiceoverNarration}"\n`;
      markdown += `- **Âm thanh & Tiếng động (SFX):** ${s.soundEffects}\n`;
      if (s.vfxGraphics) {
        markdown += `- **Kỹ xảo & Text đồ họa:** ${s.vfxGraphics}\n`;
      }
      markdown += `\n------------------------------------\n\n`;
    });

    markdown += `**Lời kêu gọi hành động (Call To Action):** ${script.callToAction}\n`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Script Selector Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Film className="w-4 h-4 text-blue-400" />
            <span>Chọn Kịch Bản Video Mẫu Để Xem & Sử Dụng:</span>
          </span>
          <span className="text-[11px] text-blue-400">
            5 kịch bản đầy đủ phân cảnh, lời thoại và lời dẫn
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {allScripts.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectAnotherScript(s.id)}
              className={`p-3 rounded-lg text-left transition-all border flex flex-col justify-between ${
                s.id === script.id
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mb-1 ${
                  s.id === script.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-blue-400'
                }`}>
                  {s.targetDuration}
                </span>
                <div className="text-xs font-bold line-clamp-2 leading-tight">
                  {s.title}
                </div>
              </div>
              <p className={`text-[10px] mt-2 line-clamp-1 ${
                s.id === script.id ? 'text-blue-100' : 'text-slate-400'
              }`}>
                {s.genreLabel}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Script Metadata Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {script.genreLabel}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Thời lượng: <strong>{script.targetDuration}</strong></span>
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Đối tượng: <strong>{script.targetAudience}</strong></span>
              </span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight pt-1">
              {script.title}
            </h2>
            <p className="text-sm text-slate-400">
              {script.subtitle}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Sao chép kịch bản dạng văn bản"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Đã Sao Chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Sao Chép Kịch Bản</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors print:hidden"
              title="In kịch bản ra giấy hoặc xuất PDF"
            >
              <Printer className="w-4 h-4" />
              <span>In Kịch Bản</span>
            </button>

            {onOpenEightSecondStudio && (
              <button
                onClick={onOpenEightSecondStudio}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer border border-indigo-400/30"
                title="Chia nhỏ kịch bản này thành chuỗi clip 8 giây và xuất Prompts Video AI Runway/Kling/Sora"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>🎬 Chia Nhỏ 8s & Prompts AI Video</span>
              </button>
            )}

            <button
              onClick={onOpenTeleprompter}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
              title="Mở máy nhắc chữ để MC / Diễn viên tập đọc lời dẫn"
            >
              <Tv className="w-4 h-4" />
              <span>Máy Nhắc Chữ (Teleprompter)</span>
            </button>
          </div>
        </div>

        {/* Logline & Tone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="md:col-span-2 bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-xs sm:text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
              Tóm Tắt Cốt Truyện (Logline):
            </span>
            <p className="text-slate-200 italic leading-relaxed">
              "{script.logline}"
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Phong Cách & Giọng Điệu:
            </span>
            <p className="text-slate-300 leading-relaxed">
              {script.tone}
            </p>
          </div>
        </div>

        {/* Characters Profile */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Bảng Phân Vai Nhân Vật & Trang Phục:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {script.characters.map((char, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>{char.name}</span>
                </div>
                <p className="text-slate-400 text-[11px] mb-2 leading-tight">
                  {char.role}
                </p>
                <div className="text-[10px] text-slate-500 bg-slate-900 p-1.5 rounded border border-slate-800/80">
                  <strong className="text-slate-400">Trang phục: </strong>
                  {char.costume}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storyboard & Detailed Shot-by-Shot Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clapperboard className="w-4 h-4 text-emerald-400" />
              <span>Bảng Phân Cảnh Chi Tiết (Shot-by-Shot Screenplay):</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              Tổng cộng: <strong>{script.scenes.length} phân cảnh</strong>
            </span>
          </div>

          <div className="space-y-4">
            {script.scenes.map((scene) => (
              <div
                key={scene.id}
                className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm hover:border-slate-700 transition-colors"
              >
                {/* Scene Header */}
                <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono font-bold flex items-center justify-center text-xs">
                      #{scene.id}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      Thời lượng: {scene.timeCode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {scene.shotType}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    Bối cảnh: <strong className="text-slate-200">{scene.setting}</strong>
                  </div>
                </div>

                {/* Scene Content Grid */}
                <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                  {/* Visual & Action */}
                  <div className="lg:col-span-4 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Hình Ảnh & Hành Động Diễn Xuất:
                    </span>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      {scene.visualAction}
                    </p>

                    {scene.actorDialogue && (
                      <div className="bg-amber-950/20 border border-amber-500/30 p-2.5 rounded-lg text-amber-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                          Lời thoại nhân vật:
                        </span>
                        <p className="italic font-medium leading-relaxed">
                          {scene.actorDialogue}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Voiceover / Narration Script (Core) */}
                  <div className="lg:col-span-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
                        Lời Dẫn Thuyết Minh / Lời Bình MC (Voiceover):
                      </span>
                      <button
                        onClick={() => speakText(scene.voiceoverNarration, scene.id)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          playingSceneId === scene.id
                            ? 'bg-red-600 text-white'
                            : 'bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900'
                        }`}
                        title="Đọc thử lời dẫn bằng giọng máy tiếng Việt"
                      >
                        {playingSceneId === scene.id ? (
                          <>
                            <VolumeX className="w-3 h-3" />
                            <span>Dừng đọc</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Nghe đọc thử</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-blue-950/20 border border-blue-500/30 p-3 rounded-lg text-slate-200 leading-relaxed font-medium">
                      "{scene.voiceoverNarration}"
                    </div>
                  </div>

                  {/* Sound & VFX */}
                  <div className="lg:col-span-3 space-y-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                        Âm Thanh & Tiếng Động (SFX/BGM):
                      </span>
                      <p className="text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/80 leading-relaxed text-[11px]">
                        {scene.soundEffects}
                      </p>
                    </div>

                    {scene.vfxGraphics && (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 block mb-1">
                          Kỹ Xảo / Text Đồ Họa (VFX):
                        </span>
                        <p className="text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/80 leading-relaxed text-[11px]">
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

        {/* Message & CTA Banner */}
        <div className="mt-6 bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              Thông Điệp Kết Thúc Video (Takeaway):
            </span>
            <p className="text-sm font-semibold text-white mt-1">
              "{script.coreMessage}"
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Kêu gọi hành động (CTA): {script.callToAction}
            </p>
          </div>

          <button
            onClick={onOpenTeleprompter}
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shrink-0 transition-colors shadow-md flex items-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Mở Máy Nhắc Chữ Teleprompter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
