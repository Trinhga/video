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
  VideoApiKeyModal, 
  getSavedVideoApiKeys, 
  VideoApiKeysConfig 
} from './VideoApiKeyModal';
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
  Volume2,
  Key,
  PlayCircle,
  RotateCcw,
  Zap,
  Loader2,
  AlertCircle,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface EightSecondStudioProps {
  script: VideoScript;
  onOpenTeleprompter?: () => void;
  onUpdateScript?: (updatedScript: VideoScript) => void;
  onNavigateToVideo?: () => void;
  onNavigateToCameraAngles?: () => void;
}

interface GeneratedClipVideo {
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  progressText: string;
  videoUrl?: string;
  provider: string;
  providerName: string;
  error?: string;
  isSimulation?: boolean;
  quotaExceeded?: boolean;
}

const PROVIDER_NAMES: Record<string, string> = {
  kling_official: 'Kling AI Chính Hãng (kling.ai)',
  gemini_veo: 'Google Veo (Gemini AI)',
  fal_kling: 'Kling 1.5 HD (Fal.ai)',
  fal_minimax: 'Minimax Hailuo (Fal.ai)',
  runway_gen3: 'Runway Gen-3 Alpha',
  luma_dream: 'Luma Dream Machine',
  simulation: 'Chế độ Render Thử Nghiệm',
};

export const EightSecondStudio: React.FC<EightSecondStudioProps> = ({
  script,
  onOpenTeleprompter,
  onUpdateScript,
  onNavigateToVideo,
  onNavigateToCameraAngles,
}) => {
  const isOriginalTrafficScript = 
    script.id === 'script-drama-3min' && 
    (script.title.includes('Chậm 3 Giây') || script.title.includes('Giao Thông'));

  const [breakdown, setBreakdown] = useState<EightSecondBreakdown>(() => {
    return (isOriginalTrafficScript && CURATED_8S_BREAKDOWNS[script.id])
      ? CURATED_8S_BREAKDOWNS[script.id]
      : generateDefault8sBreakdownForScript(script);
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedClipFilter, setSelectedClipFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'timeline' | 'character_bible' | 'workflow_guide'>('timeline');
  const [expandedClipIds, setExpandedClipIds] = useState<Record<number, boolean>>({});

  // Clip editing state
  const [editingClipId, setEditingClipId] = useState<number | null>(null);
  const [editClipForm, setEditClipForm] = useState<Partial<EightSecondClip>>({});
  const [studioToast, setStudioToast] = useState<string | null>(null);

  const showStudioToast = (msg: string) => {
    setStudioToast(msg);
    setTimeout(() => setStudioToast(null), 2500);
  };

  const handleStartEditClip = (clip: EightSecondClip) => {
    setEditingClipId(clip.id);
    setEditClipForm({ ...clip });
  };

  const handleCancelEditClip = () => {
    setEditingClipId(null);
    setEditClipForm({});
  };

  const handleSaveClip = (clipId: number) => {
    const updatedClips = breakdown.clips.map((c) => {
      if (c.id === clipId) {
        return {
          ...c,
          ...editClipForm,
        } as EightSecondClip;
      }
      return c;
    });

    const updatedBreakdown = {
      ...breakdown,
      clips: updatedClips,
    };
    setBreakdown(updatedBreakdown);

    // Sync to script if onUpdateScript is available
    if (onUpdateScript) {
      const updatedScenes = script.scenes.map((sc) => {
        if (sc.id === clipId) {
          return {
            ...sc,
            voiceoverNarration: editClipForm.audioVoiceover !== undefined ? editClipForm.audioVoiceover : sc.voiceoverNarration,
            visualAction: editClipForm.visualAction !== undefined ? editClipForm.visualAction : sc.visualAction,
          };
        }
        return sc;
      });
      onUpdateScript({
        ...script,
        scenes: updatedScenes,
      });
    }

    setEditingClipId(null);
    setEditClipForm({});
    showStudioToast(`Đã lưu thay đổi cho Clip 8s #${clipId}!`);
  };

  // Audio voiceover test state
  const [playingClipId, setPlayingClipId] = useState<number | null>(null);

  // Video API Keys & Generation state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [videoApiConfig, setVideoApiConfig] = useState<VideoApiKeysConfig>(getSavedVideoApiKeys());
  const [clipVideos, setClipVideos] = useState<Record<number, GeneratedClipVideo>>({});
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  // Update breakdown when script prop changes
  useEffect(() => {
    const isOriginalTraffic = 
      script.id === 'script-drama-3min' && 
      (script.title.includes('Chậm 3 Giây') || script.title.includes('Giao Thông'));

    if (isOriginalTraffic && CURATED_8S_BREAKDOWNS[script.id]) {
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
        setBreakdown(generateDefault8sBreakdownForScript(script));
      }
    } catch (err) {
      console.error('Error generating 8s breakdown:', err);
      setBreakdown(generateDefault8sBreakdownForScript(script));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Generate Video for an individual 8s Clip
  const handleGenerateVideoForClip = async (clip: EightSecondClip, selectedProvider?: string) => {
    const provider = selectedProvider || videoApiConfig.defaultProvider || 'kling_official';
    const providerName = PROVIDER_NAMES[provider] || 'AI Video Engine';

    // If using Kling AI Official, check if user provided keys
    if (provider === 'kling_official' && !videoApiConfig.klingAccessKey && !videoApiConfig.klingApiKey) {
      setIsApiKeyModalOpen(true);
      showStudioToast('Vui lòng dán API Key Kling AI từ https://kling.ai/dev/api-key để tạo video!');
      return;
    }

    // Set initial generating state
    setClipVideos((prev) => ({
      ...prev,
      [clip.id]: {
        status: 'generating',
        progress: 15,
        progressText: `Đang kết nối ${providerName} & nạp Master Character Token...`,
        provider,
        providerName,
      },
    }));

    // Dynamic progress ticker
    const timer1 = setTimeout(() => {
      setClipVideos((prev) => {
        if (prev[clip.id]?.status !== 'generating') return prev;
        return {
          ...prev,
          [clip.id]: {
            ...prev[clip.id],
            progress: 35,
            progressText: 'Đang khởi tạo khung hình đầu & chuyển động camera 8 giây...',
          },
        };
      });
    }, 1200);

    const timer2 = setTimeout(() => {
      setClipVideos((prev) => {
        if (prev[clip.id]?.status !== 'generating') return prev;
        return {
          ...prev,
          [clip.id]: {
            ...prev[clip.id],
            progress: 55,
            progressText: 'Đang gửi prompt điện ảnh và xếp hàng xử lý...',
          },
        };
      });
    }, 2800);

    try {
      // Pick matching user API key based on provider
      let userApiKey = '';
      if (provider === 'fal_kling' || provider === 'fal_minimax') {
        userApiKey = videoApiConfig.falKey;
      } else if (provider === 'runway_gen3') {
        userApiKey = videoApiConfig.runwayKey;
      } else if (provider === 'luma_dream') {
        userApiKey = videoApiConfig.lumaKey;
      } else if (provider === 'gemini_veo') {
        userApiKey = videoApiConfig.geminiKey;
      }

      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipId: clip.id,
          prompt: clip.englishVideoPrompt,
          provider,
          userApiKey,
          klingAccessKey: videoApiConfig.klingAccessKey || videoApiConfig.klingApiKey,
          klingSecretKey: videoApiConfig.klingSecretKey,
          klingApiKey: videoApiConfig.klingApiKey || videoApiConfig.klingAccessKey,
          klingModel: videoApiConfig.klingModel || 'kling-v2-6',
          duration: 8,
          title: clip.title,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await res.json();

      if (data?.success && data?.videoUrl) {
        setClipVideos((prev) => ({
          ...prev,
          [clip.id]: {
            status: 'completed',
            progress: 100,
            progressText: data.message || 'Hoàn tất kết xuất video!',
            videoUrl: data.videoUrl,
            provider,
            providerName,
            isSimulation: data.isSimulation,
            quotaExceeded: data.quotaExceeded,
          },
        }));
      } else if (data?.success && data?.taskId) {
        // Asynchronous generation: launch polling
        const taskId = data.taskId;
        setClipVideos((prev) => ({
          ...prev,
          [clip.id]: {
            status: 'generating',
            progress: 40,
            progressText: `Đã gửi lên ${providerName} (Task ID: ${taskId.slice(0, 10)}...). Đang render...`,
            provider,
            providerName,
          },
        }));

        let pollCount = 0;
        const maxPolls = 75; // ~5 minutes
        const pollInterval = setInterval(async () => {
          pollCount++;
          if (pollCount > maxPolls) {
            clearInterval(pollInterval);
            setClipVideos((prev) => ({
              ...prev,
              [clip.id]: {
                status: 'error',
                progress: 0,
                progressText: 'Hết thời gian chờ tạo video (Timeout)',
                error: 'Tác vụ render mất quá nhiều thời gian. Bạn có thể kiểm tra trực tiếp tại https://kling.ai/dev/api-key.',
                provider,
                providerName,
              },
            }));
            return;
          }

          try {
            const statusRes = await fetch('/api/video/task-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                provider,
                taskId,
                userApiKey,
                klingAccessKey: videoApiConfig.klingAccessKey || videoApiConfig.klingApiKey,
                klingSecretKey: videoApiConfig.klingSecretKey,
                klingApiKey: videoApiConfig.klingApiKey || videoApiConfig.klingAccessKey,
              }),
            });

            const statusData = await statusRes.json();
            if (statusData?.status === 'succeed' && statusData?.videoUrl) {
              clearInterval(pollInterval);
              setClipVideos((prev) => ({
                ...prev,
                [clip.id]: {
                  status: 'completed',
                  progress: 100,
                  progressText: statusData.message || 'Kling AI đã hoàn tất tạo video 8s!',
                  videoUrl: statusData.videoUrl,
                  provider,
                  providerName,
                  isRealApi: true,
                },
              }));
            } else if (statusData?.status === 'failed') {
              clearInterval(pollInterval);
              setClipVideos((prev) => ({
                ...prev,
                [clip.id]: {
                  status: 'error',
                  progress: 0,
                  progressText: 'Kling AI báo lỗi kết xuất',
                  error: statusData.error || 'Quá trình tạo video thất bại trên Kling AI',
                  provider,
                  providerName,
                },
              }));
            } else {
              // Still processing, advance visual progress
              setClipVideos((prev) => {
                const current = prev[clip.id];
                if (!current || current.status !== 'generating') return prev;
                const nextProg = Math.min(95, (current.progress || 40) + 3);
                return {
                  ...prev,
                  [clip.id]: {
                    ...current,
                    progress: nextProg,
                    progressText: statusData.message || `Đang render trên ${providerName} (${nextProg}%)...`,
                  },
                };
              });
            }
          } catch (pollErr) {
            console.warn('Poll error:', pollErr);
          }
        }, 4000);
      } else {
        setClipVideos((prev) => ({
          ...prev,
          [clip.id]: {
            status: 'error',
            progress: 0,
            progressText: 'Lỗi khi tạo video',
            error: data?.error || 'Không thể tạo video từ API Kling. Hãy kiểm tra lại API Key hoặc hạn ngạch.',
            provider,
            providerName,
          },
        }));
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error('Error generating clip video:', err);
      setClipVideos((prev) => ({
        ...prev,
        [clip.id]: {
          status: 'error',
          progress: 0,
          progressText: 'Lỗi mạng hoặc API',
          error: err?.message || 'Lỗi kết nối máy chủ',
          provider,
          providerName,
        },
      }));
    }
  };

  // Batch generate all clips in timeline
  const handleBatchGenerateAll = async () => {
    if (isBatchGenerating) return;
    setIsBatchGenerating(true);
    setBatchProgress(0);

    const clips = breakdown.clips;
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      await handleGenerateVideoForClip(clip, videoApiConfig.defaultProvider);
      setBatchProgress(Math.round(((i + 1) / clips.length) * 100));
    }

    setIsBatchGenerating(false);
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

    output += `--- 1. MASTER CHARACTER CONSISTENCY ANCHORS ---\n`;
    breakdown.characterAnchors.forEach((char) => {
      output += `[${char.name} - ${char.role}]\n`;
      output += `Master Prompt Token: ${char.masterPromptToken}\n`;
      output += `Wardrobe Anchor: ${char.clothingAnchor}\n`;
      output += `Appearance Anchor: ${char.appearanceAnchor}\n\n`;
    });

    output += `\n--- 2. 8-SECOND CLIPS LIST (READY FOR RUNWAY / KLING / SORA / LUMA) ---\n\n`;
    breakdown.clips.forEach((clip) => {
      output += `-----------------------------------------------------------\n`;
      output += `CLIP #${clip.clipNumber} [${clip.timeRange}] - ${clip.title}\n`;
      output += `Action (VN): ${clip.visualAction}\n`;
      output += `Voiceover (VN): "${clip.audioVoiceover}"\n`;
      output += `Camera: ${clip.cameraMovement} | Lighting: ${clip.lightingMood}\n`;
      output += `Recommended Model: ${clip.recommendedModel} | Motion: ${clip.motionScore}/10\n\n`;
      output += `>>> TEXT-TO-VIDEO PROMPT (ENGLISH):\n${clip.englishVideoPrompt}\n\n`;
      output += `>>> MIDJOURNEY START FRAME PROMPT:\n${clip.firstFramePromptMidjourney}\n\n`;
    });

    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `8s-prompts-${breakdown.scriptId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl w-full mx-auto">
      {/* API Key Settings Modal */}
      <VideoApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={(newCfg) => setVideoApiConfig(newCfg)}
      />

      {/* Toast Notification */}
      {studioToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-emerald-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>{studioToast}</span>
        </div>
      )}

      {/* Top Banner & AI Video Generator Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-600 text-white uppercase tracking-wider">
                BƯỚC 4 / 5: PROMPT VIDEO AI (8S CLIPS)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Kling 1.5 • Runway Gen-3 • Luma • Sora</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Engine: {PROVIDER_NAMES[videoApiConfig.defaultProvider] || 'Kling 1.5 HD'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Tạo Video 8 Giây Trực Tiếp & Khóa Nhân Diện Nhân Vật
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Quy trình: Kịch bản ➔ Phân cảnh ➔ Góc máy ➔ <strong className="text-purple-300 underline font-bold">Prompt (8s Clips)</strong> ➔ Video. Mỗi clip 8s có sẵn Prompt tiếng Anh & tiếng Việt tối ưu cho AI video engines.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {onNavigateToVideo && (
              <button
                type="button"
                onClick={onNavigateToVideo}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Chuyển sang Bước 5: Xem trước video hoàn chỉnh, lồng tiếng & xuất bản"
              >
                <Video className="w-4 h-4 text-amber-300" />
                <span>Bước 5: Video & Lồng Tiếng ➔</span>
              </button>
            )}

            {/* API Key Modal Button */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Cài đặt API Key của Fal.ai (Kling/Minimax), Runway Gen-3, Luma Dream Machine, Google Veo"
            >
              <Key className="w-4 h-4" />
              <span>Cài Đặt API KEY</span>
            </button>

            {/* Batch Generate All Button */}
            <button
              onClick={handleBatchGenerateAll}
              disabled={isBatchGenerating}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isBatchGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Render ({batchProgress}%)</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Tạo Tất Cả {breakdown.totalClips} Clip 8s</span>
                </>
              )}
            </button>

            <button
              onClick={handleRegenerateWithGemini}
              disabled={isGeneratingAI}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Sử dụng Gemini AI để phân tách lại prompt 8s chuyên sâu"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isGeneratingAI ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAI ? 'Đang phân tích...' : 'Làm mới phân đoạn'}</span>
            </button>

            <button
              onClick={handleExportAllPrompts}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Xuất toàn bộ danh sách Prompts thành file .TXT"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất File .TXT</span>
            </button>
          </div>
        </div>

        {/* Global Film Specs Bar */}
        <div className="mt-2 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
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
              <strong className="text-white font-mono">16:9 • 1080p • 24fps</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs: Timeline vs Character Bible vs Workflow Guide */}
      <div className="flex border-b border-slate-800 gap-2 pb-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Danh Sách {breakdown.totalClips} Phân Đoạn 8 Giây & Tạo Video</span>
        </button>

        <button
          onClick={() => setActiveTab('character_bible')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
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
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'workflow_guide'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Quy Trình Tạo Video AI Không Biến Dạng (I2V Guide)</span>
        </button>
      </div>

      {/* TAB 1: 8-SECOND TIMELINE & READY-TO-GENERATE VIDEOS */}
      {activeTab === 'timeline' && (
        <div className="flex flex-col gap-4">
          {/* Universal Vietnam Context Standards Banner (Across All Genres) */}
          <div className="bg-gradient-to-r from-red-950/40 via-amber-950/30 to-slate-900 border-2 border-red-500/50 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <span className="text-xl">🇻🇳</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Chuẩn Hóa 100% Bản Sắc & Bối Cảnh Việt Nam (Mọi Thể Loại & Lĩnh Vực)</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                    TVC • Phim Ảnh • Drama • Đời Sống
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    Khóa Chặt 100% Việt Nam
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Tất cả các prompt video (Kling AI, Veo, Runway, Luma) trên mọi lĩnh vực đều được khóa chặt: <strong className="text-amber-300">Con người Việt Nam</strong> (gương mặt, dáng vóc Á Đông) • <strong className="text-amber-300">Khung cảnh & Kiến trúc VN</strong> • <strong className="text-amber-300">Ngôn ngữ & Biển hiệu VN</strong> • <strong className="text-amber-300">Phương tiện & Biển số xe VN</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Đã nạp quy chuẩn Việt Nam</span>
              </div>
            </div>
          </div>

          {/* Quick Notice about Video Generation */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Check className="w-4 h-4" />
              </span>
              <span className="text-slate-300">
                Mỗi phân đoạn 8s bên dưới đều có nút <strong>"Bấm Tạo Video 8s Ngay"</strong> và xem trước trực tiếp bằng video player. Bạn cũng có thể bấm nút <strong>"🔑 Cài Đặt API KEY"</strong> để nối với tài khoản Fal.ai, RunwayML hoặc Luma Labs của mình.
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

          {/* List of 8-second clips with Video Player & Generator */}
          <div className="flex flex-col gap-5">
            {breakdown.clips
              .filter((c) => {
                if (selectedClipFilter === 'all') return true;
                return c.charactersInvolved.some((ch) => ch.includes(selectedClipFilter));
              })
              .map((clip) => {
                const isExpanded = expandedClipIds[clip.id] !== false; // Default expanded
                const isSpeaking = playingClipId === clip.id;
                const clipVideo = clipVideos[clip.id] || { status: 'idle', progress: 0, progressText: '', provider: videoApiConfig.defaultProvider, providerName: PROVIDER_NAMES[videoApiConfig.defaultProvider] };

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
                        {clipVideo.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Đã Có Video
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {clip.recommendedModel}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          Motion: {clip.motionScore}/10
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editingClipId === clip.id) {
                              handleCancelEditClip();
                            } else {
                              handleStartEditClip(clip);
                              if (!isExpanded) toggleExpand(clip.id);
                            }
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/40 cursor-pointer transition-all"
                          title="Sửa prompt AI, lời thoại và mô tả cho clip này"
                        >
                          <Edit3 className="w-3 h-3 text-blue-400" />
                          <span>{editingClipId === clip.id ? 'Đóng Sửa' : 'Sửa Clip'}</span>
                        </button>
                        <button
                          onClick={() => toggleExpand(clip.id)}
                          className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Clip Body */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 flex flex-col gap-4 text-xs">
                        {editingClipId === clip.id ? (
                          /* EDIT CLIP PROMPT & DIALOGUE FORM */
                          <div className="bg-slate-950 p-4 rounded-xl border-2 border-blue-500/60 flex flex-col gap-3 shadow-xl">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                              <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                                <Edit3 className="w-4 h-4 text-blue-400" />
                                Chỉnh Sửa Prompt & Lời Thoại Clip 8s #{clip.id}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSaveClip(clip.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md transition-all"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Lưu Clip 8s</span>
                                </button>
                                <button
                                  onClick={handleCancelEditClip}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-slate-400 font-bold block mb-1">Tiêu Đề Phân Đoạn 8s:</label>
                                <input
                                  type="text"
                                  value={editClipForm.title || ''}
                                  onChange={(e) => setEditClipForm({ ...editClipForm, title: e.target.value })}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-blue-400 font-bold block mb-1">Lời Thoại / Voiceover 8s (Tiếng Việt):</label>
                                <input
                                  type="text"
                                  value={editClipForm.audioVoiceover || ''}
                                  onChange={(e) => setEditClipForm({ ...editClipForm, audioVoiceover: e.target.value })}
                                  className="w-full bg-slate-900 border border-blue-500/40 rounded-lg p-2 text-slate-100 text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-slate-300 font-bold block mb-1">Hành Động Khung Hình (Visual Action):</label>
                              <textarea
                                value={editClipForm.visualAction || ''}
                                onChange={(e) => setEditClipForm({ ...editClipForm, visualAction: e.target.value })}
                                rows={2}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-emerald-400 font-bold block">AI Video Prompt (English - Kling / Runway / Luma / Veo):</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const curEng = editClipForm.englishVideoPrompt || '';
                                    const curVn = editClipForm.vietnamesePrompt || '';
                                    const vnEngAnchor = 'Set in Vietnam. Authentic Vietnamese people with East Asian facial features, realistic Vietnam setting with Vietnamese language signage and architecture, authentic Vietnamese vehicle license plates (white plate with black digits), cinematic 35mm film, ARRI Alexa LF, 4k 24fps photorealism';
                                    const vnVnAnchor = 'Bối cảnh Việt Nam, con người Việt Nam, không gian và biển hiệu chữ tiếng Việt, phương tiện và biển số xe chuẩn Việt Nam';
                                    
                                    setEditClipForm({
                                      ...editClipForm,
                                      englishVideoPrompt: curEng.includes('Set in Vietnam') ? curEng : `${curEng}. ${vnEngAnchor}.`,
                                      vietnamesePrompt: curVn.includes('Việt Nam') ? curVn : `${curVn} (${vnVnAnchor})`,
                                    });
                                  }}
                                  className="px-2.5 py-0.5 rounded bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Tự động chèn các thông số chuẩn hóa bối cảnh Việt Nam vào prompt"
                                >
                                  <span>🇻🇳</span>
                                  <span>Nạp Chuẩn Bối Cảnh VN</span>
                                </button>
                              </div>
                              <textarea
                                value={editClipForm.englishVideoPrompt || ''}
                                onChange={(e) => setEditClipForm({ ...editClipForm, englishVideoPrompt: e.target.value })}
                                rows={3}
                                className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg p-2 text-emerald-200 font-mono text-xs leading-relaxed"
                              />
                            </div>

                            <div>
                              <label className="text-amber-400 font-bold block mb-1">Prompt Tiếng Việt giải nghĩa:</label>
                              <textarea
                                value={editClipForm.vietnamesePrompt || ''}
                                onChange={(e) => setEditClipForm({ ...editClipForm, vietnamesePrompt: e.target.value })}
                                rows={2}
                                className="w-full bg-slate-900 border border-amber-500/40 rounded-lg p-2 text-amber-200 text-xs leading-relaxed"
                              />
                            </div>

                            <div>
                              <label className="text-pink-400 font-bold block mb-1">Prompt Tạo Ảnh Đầu Midjourney / Flux (First Frame):</label>
                              <textarea
                                value={editClipForm.firstFramePromptMidjourney || ''}
                                onChange={(e) => setEditClipForm({ ...editClipForm, firstFramePromptMidjourney: e.target.value })}
                                rows={2}
                                className="w-full bg-slate-900 border border-pink-500/40 rounded-lg p-2 text-pink-200 font-mono text-xs leading-relaxed"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-slate-400 font-bold block mb-1">Chuyển Động Máy Quay (Camera Movement):</label>
                                <input
                                  type="text"
                                  value={editClipForm.cameraMovement || ''}
                                  onChange={(e) => setEditClipForm({ ...editClipForm, cameraMovement: e.target.value })}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-slate-400 font-bold block mb-1">Ánh Sáng & Không Khí (Lighting & Mood):</label>
                                <input
                                  type="text"
                                  value={editClipForm.lightingMood || ''}
                                  onChange={(e) => setEditClipForm({ ...editClipForm, lightingMood: e.target.value })}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Action & Audio in Vietnamese */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              Hành Động 8s (Visual Scene):
                            </span>
                            <p className="text-slate-200 leading-relaxed">
                              {clip.visualAction}
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-slate-400">Xuất hiện:</span>
                              {clip.charactersInvolved.map((char, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px]"
                                >
                                  {char}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                                  Lời Thoại / Voiceover 8s:
                                </span>
                                <button
                                  onClick={() => handlePlayVoiceover(clip.audioVoiceover, clip.id)}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                                    isSpeaking
                                      ? 'bg-red-600 text-white'
                                      : 'bg-blue-900/40 text-blue-300 hover:bg-blue-900'
                                  }`}
                                  title="Nghe đọc thử giọng máy tiếng Việt"
                                >
                                  <Volume2 className="w-3 h-3" />
                                  <span>{isSpeaking ? 'Dừng đọc' : 'Nghe đọc'}</span>
                                </button>
                              </div>
                              <p className="text-slate-200 italic leading-relaxed">
                                "{clip.audioVoiceover || 'Không có lời thoại / Chỉ có tiếng động cảnh và nhạc nền'}"
                              </p>
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                              <div>
                                <span className="text-slate-500 block text-[10px]">Chuyển động máy:</span>
                                <span className="text-slate-300 font-medium">{clip.cameraMovement}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px]">Ánh sáng & Tone:</span>
                                <span className="text-slate-300 font-medium">{clip.lightingMood}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* DIRECT 8S VIDEO GENERATOR & EMBEDDED PLAYER */}
                        <div className="bg-gradient-to-br from-slate-950 via-slate-900/90 to-blue-950/40 rounded-xl p-4 border border-blue-500/30 shadow-md">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                                <Video className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-white text-xs block">
                                  Tạo & Phát Video 8 Giây AI (Direct Clip Video)
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Engine hiện tại: <strong className="text-blue-300">{clipVideo.providerName || PROVIDER_NAMES[videoApiConfig.defaultProvider]}</strong>
                                </span>
                              </div>
                            </div>

                            {/* Generator Controls */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Provider Dropdown for this clip */}
                              <select
                                defaultValue={videoApiConfig.defaultProvider}
                                onChange={(e) => {
                                  // Update provider for this clip
                                  setClipVideos((prev) => ({
                                    ...prev,
                                    [clip.id]: {
                                      ...(prev[clip.id] || { status: 'idle', progress: 0, progressText: '' }),
                                      provider: e.target.value,
                                      providerName: PROVIDER_NAMES[e.target.value] || e.target.value,
                                    },
                                  }));
                                }}
                                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                              >
                                <option value="kling_official">✨ Kling AI Chính Hãng (kling.ai)</option>
                                <option value="gemini_veo">🌟 Google Veo (Gemini AI)</option>
                                <option value="fal_kling">⚡ Kling 1.5 HD (qua Fal.ai)</option>
                                <option value="fal_minimax">🎥 Minimax Hailuo (qua Fal.ai)</option>
                                <option value="runway_gen3">🎬 Runway Gen-3 Alpha</option>
                                <option value="luma_dream">🌌 Luma Dream Machine</option>
                                <option value="simulation">🧪 Render Thử Nghiệm Nhanh</option>
                              </select>

                              {/* Create / Regenerate Video Button */}
                              <button
                                onClick={() => handleGenerateVideoForClip(clip, clipVideo.provider || videoApiConfig.defaultProvider)}
                                disabled={clipVideo.status === 'generating'}
                                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                              >
                                {clipVideo.status === 'generating' ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Đang Render ({clipVideo.progress}%)...</span>
                                  </>
                                ) : clipVideo.status === 'completed' ? (
                                  <>
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Tạo Lại Video 8s</span>
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Bấm Tạo Video 8s Ngay</span>
                                  </>
                                )}
                              </button>

                              {/* Key Settings Button */}
                              <button
                                onClick={() => setIsApiKeyModalOpen(true)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                                title="Cài đặt API Key cho mô hình này"
                              >
                                <Key className="w-3.5 h-3.5 text-amber-400" />
                              </button>
                            </div>
                          </div>

                          {/* Generation In Progress Bar */}
                          {clipVideo.status === 'generating' && (
                            <div className="bg-slate-950 p-3 rounded-xl border border-blue-500/30 my-2 flex flex-col gap-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-blue-300 font-semibold flex items-center gap-1.5">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                                  <span>{clipVideo.progressText}</span>
                                </span>
                                <span className="font-mono text-amber-400 font-bold">{clipVideo.progress}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                                  style={{ width: `${clipVideo.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Generation Error Banner */}
                          {clipVideo.status === 'error' && (
                            <div className="bg-red-950/40 p-3 rounded-xl border border-red-500/30 my-2 flex items-center justify-between text-xs text-red-200">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                <span>{clipVideo.error}</span>
                              </div>
                              <button
                                onClick={() => handleGenerateVideoForClip(clip, 'simulation')}
                                className="px-2.5 py-1 rounded bg-red-900 hover:bg-red-800 text-white text-[11px] font-semibold cursor-pointer"
                              >
                                Thử Render Simulation
                              </button>
                            </div>
                          )}

                          {/* Completed Video Player */}
                          {clipVideo.status === 'completed' && clipVideo.videoUrl && (
                            <div className="mt-2 flex flex-col gap-2">
                              <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner">
                                <video
                                  src={clipVideo.videoUrl}
                                  controls
                                  className="w-full max-h-[360px] object-contain mx-auto bg-black"
                                  playsInline
                                />
                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-white flex items-center gap-1.5 pointer-events-none">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>1080p • 24fps • {clip.timeRange}</span>
                                </div>
                              </div>

                              {clipVideo.quotaExceeded && (
                                <div className="text-[11px] bg-amber-950/40 border border-amber-500/30 text-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span>Tài khoản Google Veo đang chịu giới hạn hạn ngạch (quota) từ Google Cloud. Hệ thống đã tự động kết xuất video 8s điện ảnh tương đương để bạn trải nghiệm và tải về ngay lập tức.</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" />
                                    Đã kết xuất thành công bởi {clipVideo.providerName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={clipVideo.videoUrl}
                                    download={`clip-${clip.clipNumber}-8s.mp4`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                                  >
                                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Tải Video MP4</span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Default state hint when idle */}
                          {clipVideo.status === 'idle' && (
                            <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                              <span>
                                Nhấn <strong>"Bấm Tạo Video 8s Ngay"</strong> để gửi prompt sang AI Video Engine và nhận file MP4 xem trực tiếp tại đây.
                              </span>
                              <span className="text-amber-400 font-medium">8 giây • 16:9 HD</span>
                            </div>
                          )}
                        </div>

                        {/* Video Prompts (Runway Gen-3 / Kling 1.5 & Midjourney First Frame) */}
                        <div className="flex flex-col gap-3">
                          {/* Text-to-Video English Prompt */}
                          <div className="bg-slate-950 rounded-xl p-3.5 border border-indigo-500/30 relative">
                            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                              <span className="font-bold text-indigo-400 text-xs flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>PROMPT VIDEO AI (Kling 2.6 / Runway Gen-3 / Veo / Luma):</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                                  <span>🇻🇳</span>
                                  <span>Bối cảnh Giao thông VN</span>
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
                      </>
                    )}
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

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase text-amber-400">
                        Master Prompt Token (Sao Chép Gắn Vào Mọi Prompt):
                      </span>
                      <button
                        onClick={() => copyToClipboard(char.masterPromptToken, `char-${char.id}`)}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                      >
                        {copiedId === `char-${char.id}` ? 'Đã sao chép!' : 'Sao chép token'}
                      </button>
                    </div>
                    <p className="font-mono text-xs text-slate-200 leading-relaxed bg-slate-950 p-2 rounded border border-slate-800/80 select-all">
                      {char.masterPromptToken}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400">
                    <div>
                      <strong className="text-slate-300">Trang phục cố định:</strong> {char.clothingAnchor}
                    </div>
                    <div>
                      <strong className="text-slate-300">Đặc điểm nhận dạng:</strong> {char.appearanceAnchor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WORKFLOW GUIDE */}
      {activeTab === 'workflow_guide' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5 text-xs text-slate-300">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              <span>Quy Trình Tạo Phim AI Không Biến Dạng (Standard AI Filmmaking Pipeline)</span>
            </h3>
            <p className="text-slate-400">
              Quy trình chuẩn được các nhà làm phim AI Hollywood áp dụng để tạo ra video dài từ các phân đoạn 8 giây mượt mà:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center mb-2">
                1
              </div>
              <h4 className="font-bold text-white mb-1">Tạo Keyframe Đầu (Image)</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Copy prompt <strong>Midjourney / Flux First Frame</strong> ở trên để sinh ảnh tĩnh độ phân giải cao 8K, chuẩn 16:9.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center mb-2">
                2
              </div>
              <h4 className="font-bold text-white mb-1">Image-to-Video (8 Giây)</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Bấm trực tiếp nút <strong>"Bấm Tạo Video 8s Ngay"</strong> hoặc upload ảnh vào Kling 1.5 / Runway Gen-3 kèm prompt tiếng Anh 8s đã sinh sẵn.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center mb-2">
                3
              </div>
              <h4 className="font-bold text-white mb-1">Ghép Nối & Lồng Tiếng</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Tải các video MP4 về CapCut / Premiere Pro. Mở tab <strong>Máy Nhắc Chữ (Teleprompter)</strong> để thu âm voiceover khớp từng giây.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
