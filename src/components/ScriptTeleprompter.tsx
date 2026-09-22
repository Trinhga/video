import React, { useState, useEffect, useRef } from 'react';
import { VideoScript } from '../types/script';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Type, 
  Clock, 
  ChevronLeft, 
  Tv 
} from 'lucide-react';

interface ScriptTeleprompterProps {
  script: VideoScript;
  onClose: () => void;
}

export const ScriptTeleprompter: React.FC<ScriptTeleprompterProps> = ({
  script,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(2); // 1 to 5
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += scrollSpeed;
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isPlaying, scrollSpeed]);

  // Audio Speech synthesis logic for continuous narration
  const handleToggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Trình duyệt không hỗ trợ Text-to-Speech.');
      return;
    }

    if (isAudioSpeaking) {
      window.speechSynthesis.cancel();
      setIsAudioSpeaking(false);
      return;
    }

    // Combine all voiceovers into one narration
    const fullNarration = script.scenes
      .map((s) => `Phân cảnh ${s.id}. ${s.voiceoverNarration}`)
      .join(' ... ');

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullNarration);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;

    utterance.onend = () => {
      setIsAudioSpeaking(false);
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      setIsAudioSpeaking(false);
    };

    setIsAudioSpeaking(true);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleResetScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    if (isAudioSpeaking) {
      window.speechSynthesis.cancel();
      setIsAudioSpeaking(false);
    }
    setIsPlaying(false);
  };

  // Font size classes
  const fontClass =
    fontSize === 'huge'
      ? 'text-3xl sm:text-4xl leading-relaxed'
      : fontSize === 'large'
      ? 'text-xl sm:text-2xl leading-relaxed'
      : 'text-base sm:text-lg leading-relaxed';

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3 text-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại Kịch bản</span>
          </button>
          <div>
            <span className="text-xs text-blue-400 font-mono font-bold block">
              MÁY NHẮC CHỮ (TELEPROMPTER STUDIO)
            </span>
            <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
              {script.title}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Play/Pause Scroll */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Tạm Dừng Cuộn</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Bắt Đầu Cuộn</span>
              </>
            )}
          </button>

          {/* Voiceover Speech synthesis */}
          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all border ${
              isAudioSpeaking
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Đọc toàn bộ lời bình bằng giọng máy"
          >
            {isAudioSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Dừng Đọc</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Đọc Thử Toàn Bộ</span>
              </>
            )}
          </button>

          {/* Reset */}
          <button
            onClick={handleResetScroll}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Cuộn về đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed slider */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400">
            <span>Tốc độ:</span>
            {[1, 2, 3, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setScrollSpeed(spd)}
                className={`w-6 h-6 rounded text-xs font-mono font-bold transition-colors ${
                  scrollSpeed === spd
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}
              </button>
            ))}
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400">
            <Type className="w-3.5 h-3.5" />
            <button
              onClick={() => setFontSize('normal')}
              className={`px-1.5 py-0.5 rounded text-[11px] ${
                fontSize === 'normal' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'
              }`}
            >
              Nhỏ
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-1.5 py-0.5 rounded text-[11px] ${
                fontSize === 'large' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'
              }`}
            >
              Vừa
            </button>
            <button
              onClick={() => setFontSize('huge')}
              className={`px-1.5 py-0.5 rounded text-[11px] ${
                fontSize === 'huge' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'
              }`}
            >
              Lớn
            </button>
          </div>
        </div>
      </div>

      {/* Main Teleprompter Screen (High Contrast Black Canvas) */}
      <div className="bg-black border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Prompter Eye-line Guide Wire */}
        <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-red-500/40 pointer-events-none z-20 flex items-center justify-between px-4">
          <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest bg-black/80 px-2 py-0.5 rounded">
            ĐƯỜNG MẮT NHÌN ỐNG KÍNH (EYE-LINE)
          </span>
          <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest bg-black/80 px-2 py-0.5 rounded">
            REC ●
          </span>
        </div>

        {/* Scrolling text container */}
        <div
          ref={scrollContainerRef}
          className="h-[520px] overflow-y-auto p-8 sm:p-12 text-slate-100 font-sans select-none scrollbar-thin scrollbar-thumb-slate-700"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Top buffer space so the first scene starts at the eye-line */}
          <div className="h-40" />

          {/* Title Header */}
          <div className="text-center mb-16 border-b border-slate-800 pb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block mb-1">
              KỊCH BẢN VIDEO TUYÊN TRUYỀN GIAO THÔNG
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {script.title}
            </h1>
            <p className="text-sm text-slate-400 mt-2 font-mono">
              Thời lượng dự kiến: {script.targetDuration} • Thể loại: {script.genreLabel}
            </p>
          </div>

          {/* Scenes Flow */}
          <div className="space-y-20 max-w-3xl mx-auto">
            {script.scenes.map((scene) => (
              <div key={scene.id} className="border-b border-slate-900 pb-16">
                {/* Scene Marker */}
                <div className="flex items-center gap-2 mb-4 font-mono text-xs text-blue-400">
                  <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 font-bold">
                    CẢNH {scene.id} [{scene.timeCode}]
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{scene.shotType}</span>
                </div>

                {/* Actor action cue (displayed smaller and italic) */}
                <div className="text-xs text-slate-500 italic mb-4 bg-slate-950/60 p-2.5 rounded border border-slate-900">
                  [Hình ảnh: {scene.visualAction}]
                  {scene.actorDialogue && (
                    <span className="block text-amber-300 font-medium not-italic mt-1">
                      Thoại: "{scene.actorDialogue}"
                    </span>
                  )}
                </div>

                {/* Main Prompter Speech Text */}
                <div className={`${fontClass} font-bold text-white tracking-wide leading-relaxed`}>
                  "{scene.voiceoverNarration}"
                </div>

                {/* Audio sound cue */}
                <div className="text-xs text-emerald-400 font-mono mt-3">
                  ♫ SFX: {scene.soundEffects}
                </div>
              </div>
            ))}

            {/* Outro */}
            <div className="text-center py-12">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block mb-2">
                HẾT KỊCH BẢN
              </span>
              <p className="text-xl font-bold text-white">
                "{script.coreMessage}"
              </p>
            </div>
          </div>

          {/* Bottom buffer */}
          <div className="h-60" />
        </div>
      </div>
    </div>
  );
};
