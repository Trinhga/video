import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VideoScript, ScriptScene } from '../types/script';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  FileText, 
  Subtitles, 
  Film, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Edit3, 
  Save, 
  X, 
  Sliders, 
  Share2, 
  Check, 
  Tv, 
  Eye, 
  Maximize2,
  Video,
  ListVideo,
  Radio,
  Layers,
  MessageSquareQuote
} from 'lucide-react';
import { Vehicle, TrafficLightState, ScenarioType, SimulationParams } from '../types/traffic';
import { IntersectionSimulation } from './IntersectionSimulation';
import { DriverHUD } from './DriverHUD';

export interface VideoExportStudioProps {
  script: VideoScript;
  onUpdateScript?: (updatedScript: VideoScript) => void;
  onOpenTeleprompter?: () => void;
  onOpenEightSecondStudio?: () => void;
}

export type VoiceActorType = 'mc_female' | 'mc_male' | 'actor_tuan' | 'actor_mai' | 'actor_csgt';

const VOICE_PRESETS: Record<VoiceActorType, { label: string; role: string; pitch: number; rate: number }> = {
  mc_female: { label: 'MC Nữ Truyền Cảm', role: 'Thuyết Minh / Voiceover Chính', pitch: 1.1, rate: 0.95 },
  mc_male: { label: 'MC Nam Nghiêm Nghị', role: 'Phát Thanh Viên / Cảnh Báo', pitch: 0.9, rate: 0.95 },
  actor_tuan: { label: 'Tuấn (Diễn viên Nam Trẻ)', role: 'Lời Thoại Nhân Vật Tuấn', pitch: 0.95, rate: 1.05 },
  actor_mai: { label: 'Chị Mai (Diễn viên Nữ)', role: 'Lời Thoại Người Mẹ Chở Con', pitch: 1.15, rate: 1.0 },
  actor_csgt: { label: 'Cán Bộ CSGT', role: 'Lời Thoại Cán Bộ Xử Lý Vi Phạm', pitch: 0.85, rate: 0.9 },
};

export const VideoExportStudio: React.FC<VideoExportStudioProps> = ({
  script,
  onUpdateScript,
  onOpenTeleprompter,
  onOpenEightSecondStudio,
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlayingFullMovie, setIsPlayingFullMovie] = useState(false);
  const [isPlayingScene, setIsPlayingScene] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [voiceActor, setVoiceActor] = useState<VoiceActorType>('mc_female');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Editing state for scene dialogue & voiceover
  const [editingSceneId, setEditingSceneId] = useState<number | null>(null);
  const [editDialogue, setEditDialogue] = useState('');
  const [editVoiceover, setEditVoiceover] = useState('');
  const [editVisualAction, setEditVisualAction] = useState('');

  // Director Blocking Simulator state
  const [showDirectorSimulation, setShowDirectorSimulation] = useState(false);

  // Video element and speech utterance references
  const videoRef = useRef<HTMLVideoElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fullMovieTimerRef = useRef<any>(null);

  const scenes = script.scenes || [];
  const currentScene: ScriptScene | undefined = scenes[currentSceneIndex] || scenes[0];

  // Parse start time seconds from timeCode for accurate timeline
  const parseStartSeconds = (tc: string): number => {
    const m = tc.match(/(\d{1,2}):(\d{2})/);
    if (m) {
      return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    }
    return 0;
  };

  const currentSeconds = currentScene ? parseStartSeconds(currentScene.timeCode) : 0;
  const totalDurationSeconds = useMemo(() => {
    if (scenes.length === 0) return 180;
    const last = scenes[scenes.length - 1];
    const match = last.timeCode.match(/-?\s*(\d{1,2}):(\d{2})$/);
    if (match) {
      return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    }
    return scenes.length * 8;
  }, [scenes]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Video URL for current scene
  const activeVideoUrl = useMemo(() => {
    if (!currentScene) return '/api/video/stream/1';
    const clipNum = Math.max(1, Math.min(22, currentScene.id));
    return `/api/video/stream/${clipNum}`;
  }, [currentScene]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (fullMovieTimerRef.current) {
        clearTimeout(fullMovieTimerRef.current);
      }
    };
  }, []);

  // Text-To-Speech engine for accurate dialogue & voiceover
  const playSceneVoice = (scene: ScriptScene, onComplete?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }

    window.speechSynthesis.cancel();

    // Construct text combining actor dialogue and voiceover narration
    let speechParts: string[] = [];
    if (scene.actorDialogue && scene.actorDialogue.trim()) {
      speechParts.push(scene.actorDialogue.trim());
    }
    if (scene.voiceoverNarration && scene.voiceoverNarration.trim()) {
      speechParts.push(scene.voiceoverNarration.trim());
    }

    const fullText = speechParts.join('. ... ');

    if (!fullText.trim()) {
      if (onComplete) onComplete();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'vi-VN';
    
    // Apply voice preset
    const preset = VOICE_PRESETS[voiceActor] || VOICE_PRESETS.mc_female;
    utterance.pitch = preset.pitch;
    utterance.rate = preset.rate * speechRate;

    // Detect natural Vietnamese voice if available
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VIE'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onstart = () => {
      setIsVoiceSpeaking(true);
    };

    utterance.onend = () => {
      setIsVoiceSpeaking(false);
      speechRef.current = null;
      if (onComplete) {
        onComplete();
      }
    };

    utterance.onerror = () => {
      setIsVoiceSpeaking(false);
      speechRef.current = null;
      if (onComplete) {
        onComplete();
      }
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopAllVoiceAndVideo = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (fullMovieTimerRef.current) {
      clearTimeout(fullMovieTimerRef.current);
    }
    setIsVoiceSpeaking(false);
    setIsPlayingScene(false);
    setIsPlayingFullMovie(false);
  };

  // Play single scene with synchronized voice
  const handlePlaySceneWithVoice = (index: number) => {
    stopAllVoiceAndVideo();
    setCurrentSceneIndex(index);
    const targetScene = scenes[index];
    if (!targetScene) return;

    setIsPlayingScene(true);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    playSceneVoice(targetScene, () => {
      setIsPlayingScene(false);
    });
  };

  // Play full 3-minute movie sequentially (scenes 1 to 22 with full dialogue & voiceover)
  const handleToggleFullMovie = () => {
    if (isPlayingFullMovie) {
      stopAllVoiceAndVideo();
      return;
    }

    stopAllVoiceAndVideo();
    setIsPlayingFullMovie(true);
    runFullMovieStep(0);
  };

  const runFullMovieStep = (sceneIdx: number) => {
    if (sceneIdx >= scenes.length) {
      stopAllVoiceAndVideo();
      setCurrentSceneIndex(0);
      return;
    }

    setCurrentSceneIndex(sceneIdx);
    const targetScene = scenes[sceneIdx];

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    // Play voiceover for this scene, then advance to next scene
    let voiceDone = false;
    let minTimeElapsed = false;

    const maybeAdvance = () => {
      if (voiceDone && minTimeElapsed) {
        fullMovieTimerRef.current = setTimeout(() => {
          runFullMovieStep(sceneIdx + 1);
        }, 300);
      }
    };

    // Keep each scene playing for at least 7.5 seconds
    const durationTimer = setTimeout(() => {
      minTimeElapsed = true;
      maybeAdvance();
    }, 7500);

    playSceneVoice(targetScene, () => {
      voiceDone = true;
      maybeAdvance();
    });
  };

  // Handle start editing a scene
  const handleStartEdit = (scene: ScriptScene) => {
    setEditingSceneId(scene.id);
    setEditDialogue(scene.actorDialogue || '');
    setEditVoiceover(scene.voiceoverNarration || '');
    setEditVisualAction(scene.visualAction || '');
  };

  // Save edited scene back to script
  const handleSaveEdit = (sceneId: number) => {
    if (!onUpdateScript) return;
    const updatedScenes = scenes.map((s) => {
      if (s.id === sceneId) {
        return {
          ...s,
          actorDialogue: editDialogue.trim(),
          voiceoverNarration: editVoiceover.trim(),
          visualAction: editVisualAction.trim(),
        };
      }
      return s;
    });

    const updatedScript: VideoScript = {
      ...script,
      scenes: updatedScenes,
    };

    onUpdateScript(updatedScript);
    setEditingSceneId(null);
    notifyCopied(`Đã lưu thay đổi lời thoại phân cảnh #${sceneId}!`);
  };

  const notifyCopied = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // Generate & Download SRT Subtitles
  const handleDownloadSrt = () => {
    let srtContent = '';
    scenes.forEach((sc, idx) => {
      const startSec = parseStartSeconds(sc.timeCode);
      const endSec = startSec + 8;

      const formatSrtTime = (s: number) => {
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = Math.floor(s % 60);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},000`;
      };

      const startFormatted = formatSrtTime(startSec);
      const endFormatted = formatSrtTime(endSec);

      srtContent += `${idx + 1}\n`;
      srtContent += `${startFormatted} --> ${endFormatted}\n`;
      if (sc.actorDialogue && sc.actorDialogue.trim()) {
        srtContent += `${sc.actorDialogue.trim()}\n`;
      }
      if (sc.voiceoverNarration && sc.voiceoverNarration.trim()) {
        srtContent += `(${sc.voiceoverNarration.trim()})\n`;
      }
      srtContent += `\n`;
    });

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Phu_De_Video_${script.title.replace(/\s+/g, '_')}.srt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notifyCopied('Đã tải file phụ đề .SRT chuẩn Premiere/CapCut!');
  };

  // Download Dialogue Cue Sheet
  const handleDownloadCueSheet = () => {
    let text = `===========================================================\n`;
    text += `BẢNG PHÂN VAI & LỜI THOẠI LỒNG TIẾNG (VOICE TALENT CUE SHEET)\n`;
    text += `Kịch Bản: ${script.title}\n`;
    text += `Thể Loại: ${script.genreLabel} | Thời Lượng: ${script.targetDuration}\n`;
    text += `Số Phân Cảnh: ${scenes.length} | Tổng Thời Gian: ${formatTime(totalDurationSeconds)}\n`;
    text += `===========================================================\n\n`;

    scenes.forEach((sc) => {
      text += `-----------------------------------------------------------\n`;
      text += `PHÂN CẢNH #${sc.id} [${sc.timeCode}] - ${sc.shotType}\n`;
      text += `Bối Cảnh: ${sc.setting}\n`;
      text += `Hình Ảnh/Hành Động: ${sc.visualAction}\n`;
      if (sc.actorDialogue) {
        text += `>>> LỜI THOẠI DIỄN VIÊN: ${sc.actorDialogue}\n`;
      }
      text += `>>> LỜI BÌNH VOICEOVER: "${sc.voiceoverNarration}"\n`;
      text += `Tiếng Động (SFX): ${sc.soundEffects}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Loi_Thoai_Long_Tieng_${script.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notifyCopied('Đã tải kịch bản lồng tiếng phân vai (.txt)!');
  };

  // Director Simulation State
  const [simVehicle, setSimVehicle] = useState<Vehicle>({
    id: 'veh-1',
    type: 'car',
    name: 'Mazda 3 (Xe diễn viên Tuấn)',
    plate: '30E-689.96',
    color: '#dc2626',
    x: 25,
    speed: 13.89,
    initialSpeed: 13.89,
    maxBrakingDecel: 4.0,
    isBraking: false,
    isAccelerating: false,
    isEmergency: false,
    length: 4.5,
    width: 1.8,
    status: 'approaching',
  });

  const [trafficLight, setTrafficLight] = useState<TrafficLightState>({
    color: 'yellow',
    timeRemaining: 2,
    cycleDurations: { green: 12, yellow: 3, red: 10 },
  });

  const [isSimPlaying, setIsSimPlaying] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('early_warning_safe_stop');

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-emerald-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Top Banner: Master Video & Voice Control Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 border border-rose-500/30 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white uppercase tracking-wider">
              BƯỚC 5 / 5: VIDEO & LỒNG TIẾNG (XUẤT BẢN HOÀN THIỆN)
            </span>
            <span className="text-xs text-rose-300 font-medium hidden sm:inline">
              Quy trình: Kịch bản ➔ Phân cảnh ➔ Góc máy ➔ Prompt ➔ <strong className="text-white font-bold underline">Video</strong>
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              • {scenes.length} Phân Cảnh
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{script.title}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Từng phân cảnh được kết xuất video kèm <strong>lời thoại nhân vật</strong> và <strong>lời bình voiceover tiếng Việt</strong> đồng bộ bám sát khung hình, hỗ trợ phát liên tục toàn bộ tác phẩm và tải phụ đề .SRT.
          </p>
        </div>

        {/* Action Buttons: Export & Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadSrt}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Tải phụ đề khớp chính xác từng giây để import vào CapCut / Premiere"
          >
            <Subtitles className="w-4 h-4 text-amber-400" />
            <span>Tải Phụ Đề .SRT</span>
          </button>

          <button
            onClick={handleDownloadCueSheet}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Tải bảng phân vai và lời thoại gửi cho phòng thu âm / diễn viên"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Kịch Bản Lồng Tiếng (.txt)</span>
          </button>

          {onOpenEightSecondStudio && (
            <button
              onClick={onOpenEightSecondStudio}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer"
              title="Mở Xưởng Phim AI Video 8s để chỉnh sửa Prompt AI"
            >
              <Film className="w-4 h-4 text-indigo-300" />
              <span>Xưởng Video 8s AI</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Viewport: Cinema Player (Left) + Scene Inspector & Voice Engine (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Cinema Video Screen (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl aspect-video flex items-center justify-center group">
            {/* HTML5 Video Player */}
            <video
              ref={videoRef}
              key={activeVideoUrl}
              src={activeVideoUrl}
              className="w-full h-full object-cover"
              loop={!isPlayingFullMovie}
              playsInline
              muted
              autoPlay
            />

            {/* Top Corner Scene Tag & Timecode */}
            <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
              <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-white font-mono text-xs font-bold shadow-lg">
                Cảnh #{currentScene?.id || 1} / {scenes.length}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/80 text-slate-950 font-mono text-xs font-black shadow-lg">
                {currentScene?.timeCode || '00:00 - 00:08'}
              </span>
              <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-slate-300 text-[11px] font-semibold border border-white/10 hidden sm:inline">
                {currentScene?.shotType}
              </span>
            </div>

            {/* Audio Waveform Speaking Pulse Indicator */}
            {isVoiceSpeaking && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600/90 text-white text-xs font-bold shadow-lg z-20 animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Đang Đọc Voiceover...</span>
                <div className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* SUBTITLES OVERLAY (Burned-in Style Display) */}
            {showSubtitles && currentScene && (
              <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col items-center gap-1.5 pointer-events-none transition-all">
                {/* Character Dialogue (Highlighted Gold) */}
                {currentScene.actorDialogue && currentScene.actorDialogue.trim() && (
                  <div className="max-w-[90%] text-center px-4 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-amber-400/40 shadow-xl">
                    <span className="text-amber-300 font-bold text-xs sm:text-sm tracking-wide">
                      {currentScene.actorDialogue}
                    </span>
                  </div>
                )}

                {/* Voiceover Narration (Clean White Text) */}
                {currentScene.voiceoverNarration && (
                  <div className="max-w-[92%] text-center px-4 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 shadow-lg">
                    <span className="text-white text-[11px] sm:text-xs font-medium leading-relaxed">
                      🎙️ {currentScene.voiceoverNarration}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Master Timeline & Transport Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-md">
            {/* Scrubber Progress Bar */}
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="text-white font-bold">{formatTime(currentSeconds)}</span>
              <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden relative border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(4, ((currentSceneIndex + 1) / scenes.length) * 100))}%`,
                  }}
                />
              </div>
              <span className="text-slate-400">{formatTime(totalDurationSeconds)}</span>
            </div>

            {/* Playback Controls & Voice Buttons */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Prev Scene */}
                <button
                  onClick={() => {
                    const prevIdx = Math.max(0, currentSceneIndex - 1);
                    handlePlaySceneWithVoice(prevIdx);
                  }}
                  disabled={currentSceneIndex === 0}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Cảnh trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Play/Stop Current Scene with Voice */}
                <button
                  onClick={() => {
                    if (isPlayingScene || isVoiceSpeaking) {
                      stopAllVoiceAndVideo();
                    } else {
                      handlePlaySceneWithVoice(currentSceneIndex);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                    isPlayingScene || isVoiceSpeaking
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  {isPlayingScene || isVoiceSpeaking ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Dừng Cảnh Này</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Phát Cảnh #{currentScene?.id} + Lời Thoại</span>
                    </>
                  )}
                </button>

                {/* Play Full Movie Sequentially */}
                <button
                  onClick={handleToggleFullMovie}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                    isPlayingFullMovie
                      ? 'bg-red-600 hover:bg-red-500 text-white ring-2 ring-red-400/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  }`}
                  title="Phát toàn bộ 22 phân cảnh liên tục kèm lời thoại và thuyết minh"
                >
                  {isPlayingFullMovie ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Dừng Xem Toàn Phim</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>🎬 Phát Toàn Bộ Phim (22 Cảnh)</span>
                    </>
                  )}
                </button>

                {/* Next Scene */}
                <button
                  onClick={() => {
                    const nextIdx = Math.min(scenes.length - 1, currentSceneIndex + 1);
                    handlePlaySceneWithVoice(nextIdx);
                  }}
                  disabled={currentSceneIndex === scenes.length - 1}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Cảnh tiếp theo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Subtitles & Video Download */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    showSubtitles
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Bật/Tắt hiển thị phụ đề trên màn hình video"
                >
                  <Subtitles className="w-3.5 h-3.5" />
                  <span>Phụ Đề: {showSubtitles ? 'BẬT' : 'TẮT'}</span>
                </button>

                <a
                  href={activeVideoUrl}
                  download={`Clip_${currentScene?.id || 1}_${currentScene?.timeCode.replace(/\s+/g, '')}.mp4`}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  title="Tải video 8s cảnh hiện tại về máy (.mp4)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Video 8s</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Scene Details, Exact Dialogues & Voiceover Editor (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {currentScene ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
              {/* Header: Scene Info & Edit Toggle */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">
                      PHÂN CẢNH #{currentScene.id}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {currentScene.timeCode}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Bối cảnh: <strong className="text-slate-200">{currentScene.setting}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {editingSceneId === currentScene.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(currentScene.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu</span>
                      </button>
                      <button
                        onClick={() => setEditingSceneId(null)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(currentScene)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer"
                      title="Chỉnh sửa trực tiếp lời thoại và voiceover của phân cảnh này"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa Lời Thoại</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Voice Actor Settings Bar */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-indigo-400" />
                    Giọng Đọc Voiceover (TTS):
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span>Tốc độ:</span>
                    {[0.8, 1.0, 1.2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setSpeechRate(spd)}
                        className={`px-1.5 py-0.5 rounded font-mono cursor-pointer ${
                          speechRate === spd
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(Object.keys(VOICE_PRESETS) as VoiceActorType[]).map((key) => {
                    const preset = VOICE_PRESETS[key];
                    const isSelected = voiceActor === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setVoiceActor(key)}
                        className={`p-1.5 rounded-lg text-left text-[11px] border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold ring-1 ring-indigo-400/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="block truncate">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dialogue & Voiceover Cards / Form */}
              {editingSceneId === currentScene.id ? (
                /* Editing Mode Form */
                <div className="flex flex-col gap-3 text-xs">
                  <div>
                    <label className="text-amber-400 font-bold block mb-1">
                      Lời Thoại Nhân Vật:
                    </label>
                    <textarea
                      value={editDialogue}
                      onChange={(e) => setEditDialogue(e.target.value)}
                      placeholder='Ví dụ: Tuấn: "Còn đúng 2 phút nữa là trễ họp rồi!"'
                      rows={2}
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-2.5 text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-blue-400 font-bold block mb-1">
                      Lời Bình / Thuyết Minh Voiceover (MC):
                    </label>
                    <textarea
                      value={editVoiceover}
                      onChange={(e) => setEditVoiceover(e.target.value)}
                      placeholder="Lời dẫn truyền cảm của MC hoặc người thuyết minh..."
                      rows={3}
                      className="w-full bg-slate-950 border border-blue-500/40 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">
                      Mô Tả Hình Ảnh & Hành Động (Visual Action):
                    </label>
                    <textarea
                      value={editVisualAction}
                      onChange={(e) => setEditVisualAction(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500 text-xs"
                    />
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex flex-col gap-3 text-xs">
                  {/* Exact Actor Dialogue */}
                  <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <MessageSquareQuote className="w-3.5 h-3.5" />
                        Lời Thoại Diễn Viên (Actor Dialogue):
                      </span>
                      {currentScene.actorDialogue && (
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                              window.speechSynthesis.cancel();
                              const utt = new SpeechSynthesisUtterance(currentScene.actorDialogue!);
                              utt.lang = 'vi-VN';
                              utt.rate = speechRate;
                              window.speechSynthesis.speak(utt);
                            }
                          }}
                          className="text-[10px] text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Nghe thoại</span>
                        </button>
                      )}
                    </div>
                    <p className="text-amber-200 font-medium italic text-xs leading-relaxed">
                      {currentScene.actorDialogue || '(Không có lời thoại thoại nhân vật trong phân cảnh này)'}
                    </p>
                  </div>

                  {/* Exact Voiceover Narration */}
                  <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5" />
                        Lời Bình Thuyết Minh (Voiceover Narration):
                      </span>
                      <button
                        onClick={() => {
                          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                            const utt = new SpeechSynthesisUtterance(currentScene.voiceoverNarration);
                            utt.lang = 'vi-VN';
                            utt.rate = speechRate;
                            window.speechSynthesis.speak(utt);
                          }
                        }}
                        className="text-[10px] text-blue-300 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Nghe voiceover</span>
                      </button>
                    </div>
                    <p className="text-slate-200 font-medium leading-relaxed">
                      "{currentScene.voiceoverNarration}"
                    </p>
                  </div>

                  {/* Visual Action & SFX */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] space-y-2">
                    <div>
                      <span className="text-slate-500 block">Hình ảnh & Hành động:</span>
                      <p className="text-slate-300 leading-relaxed">{currentScene.visualAction}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-900 grid grid-cols-2 gap-2 text-slate-400">
                      <div>
                        <span className="text-slate-500 block">Âm thanh SFX:</span>
                        <span className="text-slate-300">{currentScene.soundEffects}</span>
                      </div>
                      {currentScene.vfxGraphics && (
                        <div>
                          <span className="text-slate-500 block">Kỹ xảo VFX:</span>
                          <span className="text-slate-300">{currentScene.vfxGraphics}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* 22-Scene Horizontal Timeline Strip (Khung Cảnh 1 Đến 22 Kèm Lời Thoại) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <ListVideo className="w-5 h-5 text-indigo-400" />
              <span>DANH SÁCH 22 PHÂN CẢNH (KÈM LỜI THOẠI & VOICEOVER)</span>
            </h3>
            <span className="text-xs text-slate-400">
              Nhấp vào bất kỳ cảnh nào để phát ngay video kèm lời thoại, hoặc chỉnh sửa trực tiếp nội dung kịch bản.
            </span>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Lời thoại nhân vật
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> Lời dẫn voiceover
            </span>
          </div>
        </div>

        {/* Scene Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto pr-1">
          {scenes.map((scene, idx) => {
            const isCurrent = currentSceneIndex === idx;
            return (
              <div
                key={scene.id}
                onClick={() => handlePlaySceneWithVoice(idx)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isCurrent
                    ? 'bg-indigo-950/60 border-indigo-500 shadow-lg ring-2 ring-indigo-400/40'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-black ${isCurrent ? 'text-indigo-300' : 'text-slate-300'}`}>
                      Cảnh #{scene.id}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {scene.timeCode}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 block line-clamp-1 mb-2 font-medium">
                    {scene.shotType}
                  </span>

                  {/* Character dialogue badge */}
                  {scene.actorDialogue ? (
                    <div className="bg-amber-950/30 border border-amber-500/30 p-1.5 rounded-lg mb-1.5">
                      <span className="text-[10px] font-bold text-amber-400 block">Thoại:</span>
                      <p className="text-amber-200 text-[11px] italic line-clamp-2">
                        {scene.actorDialogue}
                      </p>
                    </div>
                  ) : null}

                  {/* Voiceover preview */}
                  <div className="bg-blue-950/20 border border-blue-500/20 p-1.5 rounded-lg">
                    <span className="text-[10px] font-bold text-blue-400 block">Voiceover:</span>
                    <p className="text-slate-300 text-[11px] line-clamp-2">
                      "{scene.voiceoverNarration}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 line-clamp-1 max-w-[140px]">
                    {scene.setting}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(scene);
                      setCurrentSceneIndex(idx);
                    }}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    title="Sửa lời thoại cảnh này"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Director Blocking & Simulation (Collapsible Section) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <button
          onClick={() => setShowDirectorSimulation(!showDirectorSimulation)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Sa Bàn Đạo Diễn & Mô Phỏng Góc Máy Nút Giao (Director Camera Blocking)
              </h4>
              <p className="text-xs text-slate-400">
                Mô phỏng phối cảnh ngã tư, quỹ đạo phanh, góc camera hành trình POV và đèn tín hiệu vàng/đỏ.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-400 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            {showDirectorSimulation ? 'Ẩn Sa Bàn' : 'Mở Sa Bàn Mô Phỏng'}
          </span>
        </button>

        {showDirectorSimulation && (
          <div className="p-4 sm:p-5 border-t border-slate-800 flex flex-col gap-5">
            <IntersectionSimulation
              vehicle={simVehicle}
              trafficLight={trafficLight}
              isPlaying={isSimPlaying}
              onTogglePlay={() => setIsSimPlaying(!isSimPlaying)}
              onReset={() => {
                setIsSimPlaying(false);
                setSimVehicle((prev) => ({ ...prev, x: 15, speed: 13.89, isBraking: false }));
              }}
              onStep={() => {
                setSimVehicle((prev) => ({ ...prev, x: Math.min(120, prev.x + 3) }));
              }}
              simSpeed={simSpeed}
              setSimSpeed={setSimSpeed}
              currentScenario={currentScenario}
              onSelectScenario={(sc) => setCurrentScenario(sc)}
              params={{
                roadLength: 120,
                stopLinePos: 75,
                dilemmaZoneStart: 35,
                dilemmaZoneEnd: 60,
                intersectionEnd: 105,
                frictionCoeff: 0.7,
                driverReactionTime: 1.0,
                gracePeriod: 0.3,
              }}
              onManualBrake={() => setSimVehicle((prev) => ({ ...prev, isBraking: !prev.isBraking }))}
              onManualAccelerate={() => setSimVehicle((prev) => ({ ...prev, isAccelerating: !prev.isAccelerating }))}
              onManualLightChange={(color) => setTrafficLight((prev) => ({ ...prev, color, timeRemaining: color === 'yellow' ? 3 : 10 }))}
              activeEvidence={null}
              onViewEvidence={() => {}}
              vmsMessage="GÓC MÁY QUAY: ĐẶT CAMERA HÀNH TRÌNH TẠI GÓC TIẾP CẬN 45 ĐỘ"
              cameraFlashing={false}
            />

            <DriverHUD
              vehicle={simVehicle}
              trafficLight={trafficLight}
              stopLineDistance={75 - simVehicle.x}
            />
          </div>
        )}
      </div>
    </div>
  );
};
