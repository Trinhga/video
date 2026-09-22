import React, { useState, useEffect } from 'react';
import { 
  VideoScript, 
  EightSecondBreakdown, 
  EightSecondClip 
} from '../types/script';
import { 
  CURATED_8S_BREAKDOWNS, 
  generateDefault8sBreakdownForScript 
} from '../data/eightSecondBreakdowns';
import { 
  Video, 
  Sparkles, 
  Copy, 
  Check, 
  UserCheck, 
  Camera, 
  Layers, 
  Download, 
  Play, 
  Square, 
  Film, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  Sliders, 
  Tv, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flame,
  Volume2
} from 'lucide-react';

interface EightSecondStudioProps {
  script: VideoScript;
  onOpenTeleprompter?: () => void;
}

export const EightSecondStudio: React.FC<EightSecondStudioProps> = ({
  script,
  onOpenTeleprompter,
}) => {
  const [breakdown, setBreakdown] = useState<EightSecondBreakdown>(() => {
    return CURATED_8S_BREAKDOWNS[script.id] || generateDefault8sBreakdownForScript(script);
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedClipFilter, setSelectedClipFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'timeline' | 'character_bible' | 'workflow_guide'>('timeline');
  const [expandedClipIds, setExpandedClipIds] = useState<Record<number, boolean>>({});

  // Audio voiceover test state
  const [playingClipId, setPlayingClipId] = useState<number | null>(null);

  // Update breakdown when script prop changes
  useEffect(() => {
    if (CURATED_8S_BREAKDOWNS[script.id]) {
      setBreakdown(CURATED_8S_BREAKDOWNS[script.id]);
    } else {
      setBreakdown(generateDefault8sBreakdownForScript(script));
    }
  }, [script.id, script.title, script.scenes.length]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // AI Gemini trigger for 8s breakdown
  const handleRegenerateWithGemini = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/generate-8s-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
      });
      const data = await res.json();
      if (data?.breakdown && data.breakdown.clips && data.breakdown.clips.length > 0) {
        setBreakdown(data.breakdown);
      } else {
        // Use algorithmic generator
        setBreakdown(generateDefault8sBreakdownForScript(script));
      }
    } catch (err) {
      console.error('Error generating 8s breakdown:', err);
      setBreakdown(generateDefault8sBreakdownForScript(script));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Text to speech for 8s voiceover reading
  const handlePlayVoiceover = (text: string, clipId: number) => {
    if (!('speechSynthesis' in window)) return;

    if (playingClipId === clipId) {
      window.speechSynthesis.cancel();
      setPlayingClipId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.onend = () => setPlayingClipId(null);
    utterance.onerror = () => setPlayingClipId(null);

    setPlayingClipId(clipId);
    window.speechSynthesis.speak(utterance);
  };

  const toggleExpand = (id: number) => {
    setExpandedClipIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Export all prompts to a formatted TXT file
  const handleExportAllPrompts = () => {
    let output = `===========================================================\n`;
    output += `AI VIDEO PROMPTS (8-SECOND SEQUENCE BREAKDOWN)\n`;
    output += `Script: ${breakdown.scriptTitle}\n`;
    output += `Total Clips: ${breakdown.totalClips} | Duration: ${breakdown.totalDurationSeconds}s\n`;
    output += `Global Style: ${breakdown.globalStylePrompt}\n`;
    output += `Global Negative: ${breakdown.globalNegativePrompt}\n`;
    output += `===========================================================\n\n`;

    output += `--- CHARACTER CONSISTENCY BIBLE (MASTER TOKENS) ---\n`;
    breakdown.characterAnchors.forEach((char, i) => {
      output += `[Character ${i + 1}] ${char.name} (${char.role})\n`;
      output += `Appearance: ${char.appearanceAnchor}\n`;
      output += `Clothing: ${char.clothingAnchor}\n`;
      output += `Master Token: ${char.masterPromptToken}\n`;
      output += `Negative Prompt: ${char.negativePrompt}\n\n`;
    });

    output += `--- 8-SECOND VIDEO CLIPS & PROMPTS ---\n\n`;
    breakdown.clips.forEach((c) => {
      output += `### CLIP ${c.clipNumber.toString().padStart(2, '0')} (${c.timeRange})\n`;
      output += `Action: ${c.visualAction}\n`;
      output += `Voiceover: ${c.audioVoiceover}\n`;
      output += `Camera: ${c.cameraMovement} | Model: ${c.recommendedModel}\n\n`;
      output += `[RUNWAY/KLING/SORA VIDEO PROMPT]:\n${c.englishVideoPrompt}\n\n`;
      output += `[MIDJOURNEY FIRST FRAME (I2V)]:\n${c.firstFramePromptMidjourney}\n\n`;
      output += `-----------------------------------------------------------\n\n`;
    });

    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prompts_8s_${script.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                AI Video Generator Studio (8s Clips)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Đồng Nhất Nhân Vật 100%
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Runway Gen-3 • Kling 1.5 • Sora • Midjourney I2V
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Phân Rã Phân Cảnh 8 Giây & Hệ Thống Prompts AI Video</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl mt-1">
              Kịch bản <strong>"{script.title}"</strong> đã được chia nhỏ thành <strong>{breakdown.totalClips} phân đoạn 8 giây</strong> chuẩn hóa, gắn kèm mã định danh nhân vật (Master Token) và góc máy điện ảnh để bạn tạo video liền mạch không biến dạng nhân vật.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleRegenerateWithGemini}
              disabled={isGeneratingAI}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              title="Dùng Gemini AI phân tích và tạo chuỗi 8s mới"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAI ? 'Đang Phân Rã AI...' : 'Phân Rã Lại Bằng Gemini'}</span>
            </button>

            <button
              onClick={handleExportAllPrompts}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Xuất toàn bộ danh sách Prompts thành file .TXT"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất File Prompts (.TXT)</span>
            </button>
          </div>
        </div>

        {/* Global Film Specs Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Tổng số Clip 8s</span>
              <strong className="text-white font-mono">{breakdown.totalClips} Clips ({breakdown.totalDurationSeconds}s)</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Nhân vật khóa nhận diện</span>
              <strong className="text-white font-mono">{breakdown.characterAnchors.length} Nhân vật</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Tiêu cự & Máy quay</span>
              <strong className="text-white font-mono">ARRI Alexa • 35mm Lens</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Định dạng Render</span>
              <strong className="text-white font-mono">16:9 • 4K UHD • 24fps</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs: Timeline vs Character Bible vs Workflow Guide */}
      <div className="flex border-b border-slate-800 gap-2 pb-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'timeline'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Danh Sách {breakdown.totalClips} Phân Đoạn 8 Giây & Prompts</span>
        </button>

        <button
          onClick={() => setActiveTab('character_bible')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'character_bible'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Hồ Sơ Đồng Nhất Nhân Vật (Character Bible)</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
            {breakdown.characterAnchors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('workflow_guide')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'workflow_guide'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Quy Trình Tạo Video AI Không Biến Dạng (I2V Guide)</span>
        </button>
      </div>

      {/* TAB 1: 8-SECOND TIMELINE & READY-TO-COPY PROMPTS */}
      {activeTab === 'timeline' && (
        <div className="flex flex-col gap-4">
          {/* Quick Notice about Character Consistency */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Check className="w-4 h-4" />
              </span>
              <span className="text-slate-300">
                Mỗi prompt bên dưới đã được tự động gắn <strong>Master Character Token</strong>. Bạn chỉ cần nhấn nút <strong>"Sao Chép Prompt 8s"</strong> và dán vào ô Text Prompt của Runway Gen-3 hoặc Kling AI.
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="text-[11px] text-slate-400">Lọc theo nhân vật:</span>
              <select
                value={selectedClipFilter}
                onChange={(e) => setSelectedClipFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tất cả {breakdown.clips.length} clip</option>
                {breakdown.characterAnchors.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List of 8-second clips */}
          <div className="flex flex-col gap-4">
            {breakdown.clips
              .filter((c) => {
                if (selectedClipFilter === 'all') return true;
                return c.charactersInvolved.some((ch) => ch.includes(selectedClipFilter));
              })
              .map((clip) => {
                const isExpanded = expandedClipIds[clip.id] !== false; // Default expanded
                const isSpeaking = playingClipId === clip.id;

                return (
                  <div
                    key={clip.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg transition-all"
                  >
                    {/* Clip Header Bar */}
                    <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Clip Badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs">
                          <Film className="w-3.5 h-3.5" />
                          <span>CLIP {clip.clipNumber.toString().padStart(2, '0')}</span>
                        </div>

                        {/* Time Range */}
                        <div className="flex items-center gap-1 text-slate-400 font-mono text-xs bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{clip.timeRange} (8 Giây)</span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-white text-xs sm:text-sm">
                          {clip.title}
                        </h4>
                      </div>

                      {/* Right Meta Badges */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {clip.recommendedModel}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          Motion: {clip.motionScore}/10
                        </span>
                        <button
                          onClick={() => toggleExpand(clip.id)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Clip Body */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 flex flex-col gap-4 text-xs">
                        {/* Action & Audio in Vietnamese */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Visual Action */}
                          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5 text-blue-400" />
                              <span>Hành Động Diễn Xuất Trong 8 Giây:</span>
                            </span>
                            <p className="text-slate-200 leading-relaxed">
                              {clip.visualAction}
                            </p>
                            <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400">
                              <span><strong>Góc máy:</strong> {clip.cameraMovement}</span>
                            </div>
                          </div>

                          {/* Voiceover / Dialogue */}
                          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-2">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Lời Dẫn / Thoại Trong 8 Giây Này:</span>
                                </span>
                                <button
                                  onClick={() => handlePlayVoiceover(clip.audioVoiceover, clip.id)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                                    isSpeaking
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                  }`}
                                >
                                  {isSpeaking ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                                  <span>{isSpeaking ? 'Dừng' : 'Đọc thử voiceover'}</span>
                                </button>
                              </div>
                              <p className="text-slate-200 italic leading-relaxed">
                                "{clip.audioVoiceover}"
                              </p>
                            </div>

                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span><strong>Nhân vật:</strong> {clip.charactersInvolved.join(', ') || 'Ngoại cảnh'}</span>
                            </div>
                          </div>
                        </div>

                        {/* AI Video Prompts Box (English & Midjourney I2V) */}
                        <div className="flex flex-col gap-3">
                          {/* English Video Prompt for Runway / Kling / Sora */}
                          <div className="bg-slate-950 rounded-xl p-3.5 border border-indigo-500/30 relative">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-indigo-400 text-xs flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>PROMPT VIDEO AI (Runway Gen-3 / Kling 1.5 / Sora / Luma):</span>
                              </span>
                              <button
                                onClick={() => copyToClipboard(clip.englishVideoPrompt, `eng-${clip.id}`)}
                                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                              >
                                {copiedId === `eng-${clip.id}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                                    <span>Đã Sao Chép</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Sao Chép Prompt 8s</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-200 leading-relaxed select-all">
                              {clip.englishVideoPrompt}
                            </div>
                          </div>

                          {/* Midjourney Start Frame (First Frame) for Image-to-Video Workflow */}
                          <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 relative">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                                <Film className="w-3.5 h-3.5" />
                                <span>PROMPT TẠO ẢNH ĐẦU (Midjourney v6.1 / Flux - Kỹ thuật Image-to-Video):</span>
                              </span>
                              <button
                                onClick={() => copyToClipboard(clip.firstFramePromptMidjourney, `mj-${clip.id}`)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                {copiedId === `mj-${clip.id}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Đã Sao Chép</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Midjourney Prompt</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed select-all">
                              {clip.firstFramePromptMidjourney}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: CHARACTER CONSISTENCY BIBLE */}
      {activeTab === 'character_bible' && (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>Bộ Nhận Diện Đồng Nhất Nhân Vật (Character Consistency Anchors)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Bí quyết để các video AI (Runway, Kling, Luma) không bị thay đổi khuôn mặt hay đổi màu quần áo qua các đoạn 8 giây là luôn giữ nguyên <strong>Master Character Token</strong> cố định dưới đây trong tất cả các đoạn prompt.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {breakdown.characterAnchors.map((char) => (
                <div
                  key={char.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{char.name}</h4>
                      <span className="text-[11px] text-slate-400">{char.role}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Khóa nhân diện
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Đặc điểm khuôn mặt & cơ thể:</span>
                      <p className="text-slate-200 mt-0.5">{char.appearanceAnchor}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Trang phục cố định:</span>
                      <p className="text-slate-200 mt-0.5">{char.clothingAnchor}</p>
                    </div>

                    {/* Master Token with Copy Button */}
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-amber-400">Master Prompt Token:</span>
                        <button
                          onClick={() => copyToClipboard(char.masterPromptToken, char.id)}
                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedId === char.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === char.id ? 'Đã Chép' : 'Sao Chép'}</span>
                        </button>
                      </div>
                      <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-amber-200 border border-slate-800 select-all">
                        {char.masterPromptToken}
                      </div>
                    </div>

                    {/* Negative Prompt */}
                    <div>
                      <span className="text-[11px] text-red-400 font-bold block mb-1">Negative Prompt (Từ khóa cấm):</span>
                      <div className="p-2 rounded bg-slate-900 font-mono text-[10px] text-slate-400 border border-slate-800 select-all">
                        {char.negativePrompt}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Consistent Objects Anchor */}
            {breakdown.objectAnchors && breakdown.objectAnchors.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-800">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span>Phương Tiện & Đạo Cụ Đồng Nhất Xuyên Suốt:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {breakdown.objectAnchors.map((obj, i) => (
                    <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                      <strong className="text-white block mb-1">{obj.name}</strong>
                      <p className="font-mono text-[11px] text-slate-300">{obj.promptAnchor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: WORKFLOW GUIDE FOR AI VIDEO GENERATION */}
      {activeTab === 'workflow_guide' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-xs text-slate-300 flex flex-col gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>Quy Trình Chuẩn (Workflow) Tạo Video AI Đồng Nhất 100% Từ Chuỗi Clip 8 Giây</span>
          </h3>
          <p className="text-slate-400">
            Để tạo ra một video hoàn chỉnh dài 1-3 phút mà các nhân vật và phương tiện không bị biến dạng giữa các cảnh, các nhà làm phim AI chuyên nghiệp áp dụng quy trình <strong>Image-to-Video (I2V)</strong> kết hợp <strong>Master Character Anchor</strong>:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {/* Step 1 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                01
              </span>
              <strong className="text-white text-sm">Tạo Ảnh Xuất Phát (First Frame)</strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Sao chép <strong>Prompt Midjourney / Flux</strong> ở từng clip để tạo ra bức ảnh tĩnh đầu tiên sắc nét. Bạn có thể sử dụng tham số <code>--cref</code> (Character Reference) trong Midjourney v6.1 để giữ đúng 1 khuôn mặt.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                02
              </span>
              <strong className="text-white text-sm">Đưa Vào Công Cụ AI Video (I2V)</strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Tải ảnh tĩnh vừa tạo lên làm <strong>Start Frame (ảnh đầu)</strong> trong <strong>Runway Gen-3 Alpha</strong>, <strong>Kling AI</strong>, hoặc <strong>Luma Dream Machine</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
              <span className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center text-xs">
                03
              </span>
              <strong className="text-white text-sm">Dán Prompt 8s & Render</strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Nhấn nút <strong>"Sao Chép Prompt 8s"</strong> trong tab Timeline và dán vào ô Text Prompt của video generator. Chọn thời lượng 8s hoặc 10s rồi bấm Render. Ghép các clip lại trên CapCut hoặc Premiere là bạn có full video!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
