import React, { useState, useMemo } from 'react';
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
  Camera, 
  ArrowLeft,
  ChevronRight,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Compass,
  AlertCircle,
  Edit3,
  Save,
  Plus,
  Trash2,
  Eye,
  X
} from 'lucide-react';

export interface ScriptViewerProps {
  script: VideoScript;
  projectName?: string;
  onBackToGenerator?: () => void;
  onOpenTeleprompter: () => void;
  onOpenEightSecondStudio?: () => void;
  onOpenCameraAngles?: () => void;
  onSelectAnotherScript: (id: string) => void;
  allScripts?: VideoScript[];
  onUpdateScript?: (updatedScript: VideoScript) => void;
}

interface MinuteBreakdown {
  minuteIndex: number;
  label: string;
  actName: string;
  timeRange: string;
  scenes: ScriptScene[];
}

export const ScriptViewer: React.FC<ScriptViewerProps> = ({
  script,
  projectName,
  onBackToGenerator,
  onOpenTeleprompter,
  onOpenEightSecondStudio,
  onOpenCameraAngles,
  onSelectAnotherScript,
  allScripts = [],
  onUpdateScript,
}) => {
  const [copied, setCopied] = useState(false);
  const [playingSceneId, setPlayingSceneId] = useState<number | null>(null);
  const [selectedMinuteFilter, setSelectedMinuteFilter] = useState<number | 'all'>('all');
  const [showCuratedLibrary, setShowCuratedLibrary] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scene editing state
  const [editingSceneId, setEditingSceneId] = useState<number | null>(null);
  const [editSceneForm, setEditSceneForm] = useState<Partial<ScriptScene>>({});

  // Script metadata editing state
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [metaForm, setMetaForm] = useState({
    title: script.title,
    subtitle: script.subtitle || '',
    logline: script.logline,
    tone: script.tone,
    targetAudience: script.targetAudience,
    coreMessage: script.coreMessage,
    callToAction: script.callToAction,
  });

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleStartEditScene = (scene: ScriptScene) => {
    setEditingSceneId(scene.id);
    setEditSceneForm({ ...scene });
  };

  const handleCancelEditScene = () => {
    setEditingSceneId(null);
    setEditSceneForm({});
  };

  const handleSaveScene = (sceneId: number) => {
    if (!onUpdateScript) return;
    const updatedScenes = script.scenes.map((s) => {
      if (s.id === sceneId) {
        return {
          ...s,
          ...editSceneForm,
        } as ScriptScene;
      }
      return s;
    });

    const updated = {
      ...script,
      scenes: updatedScenes,
    };
    onUpdateScript(updated);
    setEditingSceneId(null);
    setEditSceneForm({});
    showNotification(`Đã lưu thay đổi phân cảnh #${sceneId}!`);
  };

  const handleSaveMetadata = () => {
    if (!onUpdateScript) return;
    const updated: VideoScript = {
      ...script,
      title: metaForm.title.trim() || script.title,
      subtitle: metaForm.subtitle.trim(),
      logline: metaForm.logline.trim() || script.logline,
      tone: metaForm.tone.trim() || script.tone,
      targetAudience: metaForm.targetAudience.trim() || script.targetAudience,
      coreMessage: metaForm.coreMessage.trim() || script.coreMessage,
      callToAction: metaForm.callToAction.trim() || script.callToAction,
    };
    onUpdateScript(updated);
    setIsEditingMetadata(false);
    showNotification('Đã cập nhật thông tin kịch bản thành công!');
  };

  const handleAddNewScene = (afterId?: number) => {
    if (!onUpdateScript) return;
    const targetIdx = afterId !== undefined 
      ? script.scenes.findIndex((s) => s.id === afterId)
      : script.scenes.length - 1;

    const newId = Math.max(0, ...script.scenes.map((s) => s.id)) + 1;
    const newScene: ScriptScene = {
      id: newId,
      timeCode: `${String(Math.floor(script.scenes.length * 8 / 60)).padStart(2, '0')}:${String((script.scenes.length * 8) % 60).padStart(2, '0')} - ${String(Math.floor((script.scenes.length + 1) * 8 / 60)).padStart(2, '0')}:${String(((script.scenes.length + 1) * 8) % 60).padStart(2, '0')}`,
      shotType: 'Trung cảnh (Medium Shot)',
      setting: 'Bối cảnh mới',
      visualAction: 'Mô tả hình ảnh hành động mới...',
      actorDialogue: '',
      voiceoverNarration: 'Lời bình thuyết minh cho cảnh mới...',
      soundEffects: 'Tiếng môi trường, động cơ nhẹ',
      vfxGraphics: '',
    };

    const newScenes = [...script.scenes];
    newScenes.splice(targetIdx + 1, 0, newScene);
    
    // Re-index scene IDs
    const reindexedScenes = newScenes.map((sc, i) => ({
      ...sc,
      id: i + 1,
    }));

    onUpdateScript({
      ...script,
      scenes: reindexedScenes,
    });
    setEditingSceneId(newScene.id);
    setEditSceneForm(newScene);
    showNotification('Đã thêm phân cảnh mới! Hãy nhập nội dung và bấm Lưu.');
  };

  const handleDeleteScene = (sceneId: number) => {
    if (!onUpdateScript) return;
    if (script.scenes.length <= 1) {
      alert('Kịch bản cần tối thiểu 1 phân cảnh!');
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa phân cảnh #${sceneId}?`)) return;

    const filtered = script.scenes.filter((s) => s.id !== sceneId);
    const reindexed = filtered.map((sc, i) => ({
      ...sc,
      id: i + 1,
    }));

    onUpdateScript({
      ...script,
      scenes: reindexed,
    });
    showNotification(`Đã xóa phân cảnh #${sceneId}!`);
  };

  // Group scenes by minute/act structure matching ScriptGenerator
  const minuteGroups: MinuteBreakdown[] = useMemo(() => {
    if (!script.scenes || script.scenes.length === 0) return [];

    const actNames = [
      'Hồi 1: Thiết Lập & Khởi Đầu (Hook & Setup)',
      'Hồi 2: Xung Đột & Cao Trào (Conflict & Climax)',
      'Hồi 3: Bước Ngoặt & Giải Quyết (Turning Point & Resolution)',
      'Hồi 4: Thức Tỉnh & Pháp Lý (Consequences & Rule of Law)',
      'Hồi 5: Đúc Kết & Lan Tỏa (Message & Takeaway)',
    ];

    const groups: { [key: number]: ScriptScene[] } = {};

    script.scenes.forEach((scene, index) => {
      let minIdx = 1;
      const match = scene.timeCode.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const startSecs = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
        minIdx = Math.floor(startSecs / 60) + 1;
      } else {
        minIdx = Math.min(3, Math.floor((index / script.scenes.length) * 3) + 1);
      }

      if (!groups[minIdx]) {
        groups[minIdx] = [];
      }
      groups[minIdx].push(scene);
    });

    const sortedIndices = Object.keys(groups).map(Number).sort((a, b) => a - b);

    return sortedIndices.map((minIdx) => {
      const mScenes = groups[minIdx];
      const first = mScenes[0];
      const last = mScenes[mScenes.length - 1];

      const startMatch = first.timeCode.match(/(\d{1,2}:\d{2})/);
      const endMatch = last.timeCode.match(/-?\s*(\d{1,2}:\d{2})$/);
      const timeRange = `${startMatch ? startMatch[1] : `0${minIdx - 1}:00`} - ${endMatch ? endMatch[1] : `0${minIdx}:00`}`;

      return {
        minuteIndex: minIdx,
        label: `Phút ${minIdx}`,
        actName: actNames[minIdx - 1] || `Phân đoạn ${minIdx}`,
        timeRange,
        scenes: mScenes,
      };
    });
  }, [script.scenes]);

  // Filtered scenes based on active minute selector
  const displayedScenes = useMemo(() => {
    if (selectedMinuteFilter === 'all') {
      return script.scenes;
    }
    const group = minuteGroups.find((g) => g.minuteIndex === selectedMinuteFilter);
    return group ? group.scenes : script.scenes;
  }, [script.scenes, selectedMinuteFilter, minuteGroups]);

  // Text-to-Speech preview
  const speakText = (text: string, sceneId: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
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
    let markdown = `# KỊCH BẢN ĐIỆN ẢNH CHI TIẾT: ${script.title.toUpperCase()}\n`;
    markdown += `**Thể loại:** ${script.genreLabel} | **Thời lượng:** ${script.targetDuration}\n`;
    markdown += `**Tông giọng:** ${script.tone}\n`;
    markdown += `**Logline:** ${script.logline}\n\n`;

    if (script.characters && script.characters.length > 0) {
      markdown += `## BẢNG PHÂN VAI & TRANG PHỤC:\n`;
      script.characters.forEach((c) => {
        markdown += `- ${c.name}: ${c.role} (Trang phục: ${c.costume})\n`;
      });
      markdown += `\n`;
    }

    if (script.propsLocations) {
      markdown += `## BỐI CẢNH & ĐẠO CỤ:\n`;
      markdown += `- Địa điểm quay: ${script.propsLocations.locations.join(', ')}\n`;
      markdown += `- Đạo cụ & Thiết bị: ${script.propsLocations.props.join(', ')}\n\n`;
    }

    markdown += `## BẢNG PHÂN CẢNH CHI TIẾT (SHOT-BY-SHOT SCREENPLAY):\n\n`;

    script.scenes.forEach((s) => {
      markdown += `### CẢNH ${s.id} [${s.timeCode}] - ${s.shotType}\n`;
      markdown += `- Bối cảnh: ${s.setting}\n`;
      markdown += `- Hình ảnh & Diễn xuất: ${s.visualAction}\n`;
      if (s.actorDialogue) {
        markdown += `- Lời thoại: ${s.actorDialogue}\n`;
      }
      markdown += `- Lời dẫn Voiceover: "${s.voiceoverNarration}"\n`;
      markdown += `- Âm thanh SFX: ${s.soundEffects}\n`;
      if (s.vfxGraphics) {
        markdown += `- Kỹ xảo VFX: ${s.vfxGraphics}\n`;
      }
      markdown += `\n------------------------------------\n\n`;
    });

    markdown += `**Thông điệp cốt lõi:** ${script.coreMessage}\n`;
    markdown += `**Slogan kết phim (Call To Action):** ${script.callToAction}\n`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl w-full mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-emerald-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Script Metadata Edit Form (Modal/Drawer) */}
      {isEditingMetadata && (
        <div className="bg-slate-900 border-2 border-blue-500/60 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Chỉnh Sửa Thông Tin Kịch Bản</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveMetadata}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Kịch Bản</span>
              </button>
              <button
                onClick={() => setIsEditingMetadata(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-bold block mb-1">Tiêu Đề Kịch Bản:</label>
              <input
                type="text"
                value={metaForm.title}
                onChange={(e) => setMetaForm({ ...metaForm, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Đối Tượng Khán Giả:</label>
              <input
                type="text"
                value={metaForm.targetAudience}
                onChange={(e) => setMetaForm({ ...metaForm, targetAudience: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-400 font-bold block mb-1">Tóm Tắt Cốt Truyện (Logline):</label>
              <textarea
                value={metaForm.logline}
                onChange={(e) => setMetaForm({ ...metaForm, logline: e.target.value })}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Phong Cách & Giọng Điệu (Tone):</label>
              <input
                type="text"
                value={metaForm.tone}
                onChange={(e) => setMetaForm({ ...metaForm, tone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Slogan Kết Phim (Call To Action):</label>
              <input
                type="text"
                value={metaForm.callToAction}
                onChange={(e) => setMetaForm({ ...metaForm, callToAction: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-400 font-bold block mb-1">Thông Điệp Cốt Lõi (Core Message):</label>
              <input
                type="text"
                value={metaForm.coreMessage}
                onChange={(e) => setMetaForm({ ...metaForm, coreMessage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Project Synchronized Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToGenerator && (
            <button
              onClick={onBackToGenerator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Quay lại Xưởng Phim AI để biên kịch hoặc chỉnh sửa ý tưởng"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span>Xưởng Phim AI</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                Kịch Bản Dự Án Hiện Tại
              </span>
              {projectName && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {projectName}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Đồng bộ khớp 100% với Xưởng Phim AI
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {script.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onUpdateScript && (
            <>
              <button
                onClick={() => setIsEditingMetadata(!isEditingMetadata)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all cursor-pointer"
                title="Sửa thông tin tổng quan của kịch bản (Tiêu đề, Logline, Thông điệp...)"
              >
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span>{isEditingMetadata ? 'Đóng Sửa' : 'Sửa Kịch Bản'}</span>
              </button>

              <button
                onClick={() => handleAddNewScene()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer"
                title="Thêm một phân cảnh mới vào cuối kịch bản"
              >
                <Plus className="w-4 h-4 text-purple-300" />
                <span>Thêm Cảnh (+)</span>
              </button>
            </>
          )}

          {onOpenCameraAngles && (
            <button
              onClick={onOpenCameraAngles}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 border border-amber-400/30 transition-all cursor-pointer"
              title="Chuyển sang Bước 3: Đặt góc máy & tiêu cự cho từng phân cảnh"
            >
              <Eye className="w-4 h-4 text-amber-200" />
              <span>Bước 3: Góc Máy & Tiêu Cự ➔</span>
            </button>
          )}

          {onOpenEightSecondStudio && (
            <button
              onClick={onOpenEightSecondStudio}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 border border-purple-400/30 transition-all cursor-pointer"
              title="Chuyển sang Bước 4: Tạo Prompt Video AI 8s"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Bước 4: Prompt Video AI ➔</span>
            </button>
          )}

          <button
            onClick={onOpenTeleprompter}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
          >
            <Tv className="w-4 h-4" />
            <span>Máy Nhắc Chữ</span>
          </button>

          <button
            onClick={handleCopyScript}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép!' : 'Sao chép văn bản'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>In / PDF</span>
          </button>
        </div>
      </div>

      {/* Script Metadata Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md">
        {/* Genre, Duration, Tone Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
            {script.genreLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Thời lượng: <strong>{script.targetDuration}</strong></span>
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Đối tượng: <strong>{script.targetAudience}</strong></span>
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tổng cộng: <strong>{script.scenes.length} phân cảnh chi tiết</strong></span>
          </span>
        </div>

        {/* Logline & Tone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800/90">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
              Tóm Tắt Cốt Truyện (Logline):
            </span>
            <p className="text-slate-200 italic leading-relaxed text-sm">
              "{script.logline}"
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Phong Cách & Giọng Điệu (Tone):
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {script.tone}
            </p>
          </div>
        </div>

        {/* Characters & Props Locations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Cast & Wardrobe */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Bảng Phân Vai Nhân Vật & Trang Phục:</span>
            </h4>
            <div className="flex flex-col gap-2">
              {script.characters.map((char, idx) => (
                <div key={idx} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>{char.name}</span>
                    <span className="text-slate-400 font-normal text-[11px]">{char.role}</span>
                  </div>
                  {char.costume && (
                    <p className="text-slate-400 text-[11px] mt-1">
                      <strong className="text-slate-500">Trang phục:</strong> {char.costume}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Locations & Props */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              <span>Bối Cảnh Quay & Đạo Cụ Đoàn Phim:</span>
            </h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-slate-300 block mb-1">Địa điểm quay:</span>
                <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                  {script.propsLocations?.locations && script.propsLocations.locations.length > 0 ? (
                    script.propsLocations.locations.map((loc, i) => <li key={i}>{loc}</li>)
                  ) : (
                    <li>Bối cảnh phù hợp nội dung phim</li>
                  )}
                </ul>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-slate-300 block mb-1">Đạo cụ & Thiết bị ghi hình:</span>
                <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                  {script.propsLocations?.props && script.propsLocations.props.length > 0 ? (
                    script.propsLocations.props.map((prop, i) => <li key={i}>{prop}</li>)
                  ) : (
                    <li>Phương tiện, phục trang và đạo cụ theo kịch bản</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Per-Minute Act Breakdown (Dòng Thời Gian Phân Đoạn Từng Phút Khớp Xưởng Phim AI) */}
        <div className="bg-gradient-to-r from-blue-950/40 via-slate-950 to-indigo-950/40 p-4 sm:p-5 rounded-xl border border-blue-900/40 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Dòng Thời Gian Phân Đoạn Từng Phút (Act & Timeline Breakdown)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cấu trúc nhịp phim từng phút theo chuẩn điện ảnh. Bấm chọn phút để lọc nhanh các cảnh tương ứng:
              </p>
            </div>

            {/* Quick Filter Pill Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedMinuteFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedMinuteFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Tất cả ({script.scenes.length} cảnh)
              </button>

              {minuteGroups.map((group) => (
                <button
                  key={group.minuteIndex}
                  onClick={() => setSelectedMinuteFilter(group.minuteIndex)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    selectedMinuteFilter === group.minuteIndex
                      ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-400/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{group.label}</span>
                  <span className="text-[10px] opacity-80">({group.scenes.length} cảnh)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Minute Cards Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {minuteGroups.map((group) => (
              <div
                key={group.minuteIndex}
                onClick={() => setSelectedMinuteFilter(group.minuteIndex)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedMinuteFilter === group.minuteIndex
                    ? 'bg-slate-900 border-amber-500/60 ring-2 ring-amber-500/20 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {group.label}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {group.timeRange}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mb-1 leading-snug">
                  {group.actName}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>Bao gồm:</span>
                  <strong className="text-slate-300">
                    {group.scenes.map((s) => `Cảnh #${s.id}`).join(', ')}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Shot-by-Shot Screenplay Table */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Bảng Phân Cảnh Chi Tiết (Shot-by-Shot Director Breakdown)
              </h3>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-3">
              {selectedMinuteFilter !== 'all' && (
                <span className="text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Đang lọc: Phút {selectedMinuteFilter}
                </span>
              )}
              <span>Đang hiển thị <strong>{displayedScenes.length}</strong> / {script.scenes.length} phân cảnh</span>
            </div>
          </div>

          <div className="space-y-4">
            {displayedScenes.map((scene) => (
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
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {scene.timeCode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {scene.shotType}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Khớp Clip 8s #{scene.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-400 hidden lg:block mr-2">
                      Bối cảnh: <strong className="text-slate-200">{scene.setting}</strong>
                    </div>

                    {onUpdateScript && (
                      <>
                        <button
                          onClick={() => handleStartEditScene(scene)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold cursor-pointer transition-all"
                          title="Chỉnh sửa chi tiết lời thoại, voiceover và hình ảnh cảnh này"
                        >
                          <Edit3 className="w-3 h-3 text-blue-400" />
                          <span>Sửa Cảnh</span>
                        </button>

                        <button
                          onClick={() => handleAddNewScene(scene.id)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                          title="Thêm cảnh mới ngay sau cảnh này"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteScene(scene.id)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 text-xs cursor-pointer"
                          title="Xóa phân cảnh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {onOpenEightSecondStudio && (
                      <button
                        onClick={onOpenEightSecondStudio}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
                        title="Chuyển sang Xưởng Phim AI Video 8s để tạo hoặc xem video clip này"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Xem / Tạo Video 8s Này</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Conditional Edit Form or Display Grid */}
                {editingSceneId === scene.id ? (
                  /* INLINE SCENE EDIT FORM */
                  <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex flex-col gap-4 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4" />
                        Chỉnh Sửa Phân Cảnh #{scene.id}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveScene(scene.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md transition-all"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Lưu Phân Cảnh</span>
                        </button>
                        <button
                          onClick={handleCancelEditScene}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">TimeCode (Thời lượng):</label>
                        <input
                          type="text"
                          value={editSceneForm.timeCode || ''}
                          onChange={(e) => setEditSceneForm({ ...editSceneForm, timeCode: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Góc máy (Shot Type):</label>
                        <input
                          type="text"
                          value={editSceneForm.shotType || ''}
                          onChange={(e) => setEditSceneForm({ ...editSceneForm, shotType: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Bối cảnh (Setting):</label>
                        <input
                          type="text"
                          value={editSceneForm.setting || ''}
                          onChange={(e) => setEditSceneForm({ ...editSceneForm, setting: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">Hình ảnh & Hành động diễn xuất (Visual Action):</label>
                        <textarea
                          value={editSceneForm.visualAction || ''}
                          onChange={(e) => setEditSceneForm({ ...editSceneForm, visualAction: e.target.value })}
                          rows={3}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 leading-relaxed text-xs focus:ring-1 focus:ring-blue-400"
                        />
                      </div>

                      <div>
                        <label className="text-amber-400 font-bold block mb-1">Lời thoại nhân vật (Actor Dialogue):</label>
                        <textarea
                          value={editSceneForm.actorDialogue || ''}
                          onChange={(e) => setEditSceneForm({ ...editSceneForm, actorDialogue: e.target.value })}
                          placeholder='Ví dụ: Tuấn: "Còn đúng 2 phút nữa là trễ rồi!"'
                          rows={3}
                          className="w-full bg-slate-950 border border-amber-500/40 rounded-lg p-2 text-amber-200 leading-relaxed text-xs focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-blue-400 font-bold block mb-1">Lời Dẫn Thuyết Minh / Lời Bình MC (Voiceover Narration):</label>
                      <textarea
                        value={editSceneForm.voiceoverNarration || ''}
                        onChange={(e) => setEditSceneForm({ ...editSceneForm, voiceoverNarration: e.target.value })}
                        rows={2}
                        className="w-full bg-slate-950 border border-blue-500/40 rounded-lg p-2 text-slate-200 leading-relaxed text-xs focus:ring-1 focus:ring-blue-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-emerald-400 font-bold block mb-1">Âm thanh SFX & BGM:</label>
                        <input
                          type="text"
                          value={editSceneForm.soundEffects || ''}
                          onChange={(e) => setEditSceneForm({ ...editSceneForm, soundEffects: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 text-xs focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="text-pink-400 font-bold block mb-1">Kỹ xảo & Đồ họa VFX:</label>
                        <input
                          type="text"
                          value={editSceneForm.vfxGraphics || ''}
                          onChange={(e) => setEditSceneForm({ ...editSceneForm, vfxGraphics: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 text-xs focus:ring-1 focus:ring-pink-400"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Scene Content Grid */
                <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                  {/* Visual & Action */}
                  <div className="lg:col-span-5 space-y-2">
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
                  <div className="lg:col-span-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
                        Lời Dẫn Thuyết Minh / Lời Bình MC (Voiceover):
                      </span>
                      <button
                        onClick={() => speakText(scene.voiceoverNarration, scene.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                          playingSceneId === scene.id
                            ? 'bg-red-600 text-white font-bold'
                            : 'bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900'
                        }`}
                        title="Đọc thử lời dẫn bằng giọng máy tiếng Việt"
                      >
                        {playingSceneId === scene.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>Dừng đọc</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
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
              )}
            </div>
          ))}
          </div>
        </div>

        {/* Core Message & CTA Banner */}
        <div className="mt-6 bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              Thông Điệp Kết Thúc Video (Takeaway):
            </span>
            <p className="text-sm font-bold text-white mt-1">
              "{script.coreMessage}"
            </p>
            <p className="text-xs text-slate-400 mt-1">
              <strong className="text-slate-300">Slogan kết phim (CTA):</strong> {script.callToAction}
            </p>
          </div>

          <button
            onClick={onOpenTeleprompter}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shrink-0 transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Mở Máy Nhắc Chữ Teleprompter</span>
          </button>
        </div>
      </div>

      {/* Reference Templates Drawer (Cleanly separated at bottom so it doesn't mix up with active project) */}
      {allScripts && allScripts.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <button
            onClick={() => setShowCuratedLibrary(!showCuratedLibrary)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-blue-400" />
              <span>Thư viện kịch bản mẫu tham khảo ({allScripts.length} kịch bản sẵn có)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500">
                {showCuratedLibrary ? 'Thu gọn' : 'Bấm để mở tham khảo'}
              </span>
              {showCuratedLibrary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showCuratedLibrary && (
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {allScripts.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectAnotherScript(s.id)}
                  className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between cursor-pointer ${
                    s.id === script.id
                      ? 'bg-blue-600/20 text-white border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-blue-400">
                        {s.targetDuration}
                      </span>
                      <span className="text-[10px] text-slate-400">{s.scenes.length} cảnh</span>
                    </div>
                    <div className="text-xs font-bold line-clamp-2 leading-tight">
                      {s.title}
                    </div>
                  </div>
                  <p className="text-[10px] mt-2 text-slate-400 line-clamp-1">
                    {s.genreLabel}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
