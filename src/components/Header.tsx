import React from 'react';
import { 
  Clapperboard, 
  Film, 
  Tv, 
  Wand2, 
  FileCheck, 
  Eye, 
  Video,
  Monitor,
  Sparkles 
} from 'lucide-react';

export type MainTabType = 'generator' | 'scripts' | 'camera_angles' | 'eight_sec' | 'video_export' | 'teleprompter' | 'production' | 'simulation';

interface HeaderProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  currentScriptTitle: string;
  onOpenDesktopModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentScriptTitle,
  onOpenDesktopModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand and Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white uppercase">
                XƯỞNG BIÊN KỊCH ĐIỆN ẢNH & VIDEO AI
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Quy Trình 5 Bước Chuẩn Điện Ảnh
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span className="text-blue-400 font-bold">1. Kịch bản</span>
              <span className="text-slate-600">➔</span>
              <span className="text-indigo-400 font-bold">2. Phân cảnh</span>
              <span className="text-slate-600">➔</span>
              <span className="text-amber-400 font-bold">3. Góc máy</span>
              <span className="text-slate-600">➔</span>
              <span className="text-purple-400 font-bold">4. Prompt</span>
              <span className="text-slate-600">➔</span>
              <span className="text-rose-400 font-bold">5. Video</span>
            </p>
          </div>
        </div>

        {/* Controls: Current Script Badge & Desktop Export */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Đang chọn:</span>
            <span className="font-bold text-white max-w-[180px] truncate">
              {currentScriptTitle}
            </span>
          </div>

          {onOpenDesktopModal && (
            <button
              id="btn-desktop-export"
              onClick={onOpenDesktopModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer border border-blue-400/30"
              title="Cài đặt hoặc đóng gói thành phần mềm Desktop (Windows/Mac)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>💻 Cài Đặt Desktop App</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs - STRICT 5-STEP WORKFLOW: Kịch bản -> Phân cảnh -> Góc máy -> Prompt -> Video */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2 scrollbar-none text-xs sm:text-sm font-medium">
          
          {/* Bước 1: KỊCH BẢN */}
          <button
            id="nav-tab-generator"
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black ring-2 ring-blue-400/40'
                : 'text-blue-300 hover:text-white bg-blue-950/30 hover:bg-blue-900/40 border border-blue-800/40 font-semibold'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/40 text-[11px] font-black flex items-center justify-center text-blue-200">
              1
            </span>
            <Clapperboard className="w-4 h-4 text-blue-300" />
            <span>Kịch Bản (Ý Tưởng & Cốt Truyện)</span>
          </button>

          <span className="text-slate-600 hidden sm:inline select-none">➔</span>

          {/* Bước 2: PHÂN CẢNH */}
          <button
            id="nav-tab-scripts"
            onClick={() => setActiveTab('scripts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'scripts'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-black ring-2 ring-indigo-400/40'
                : 'text-indigo-300 hover:text-white bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-800/40 font-semibold'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-[11px] font-black flex items-center justify-center text-indigo-200">
              2
            </span>
            <Film className="w-4 h-4 text-indigo-300" />
            <span>Phân Cảnh (Shot-by-Shot)</span>
          </button>

          <span className="text-slate-600 hidden sm:inline select-none">➔</span>

          {/* Bước 3: GÓC MÁY */}
          <button
            id="nav-tab-camera-angles"
            onClick={() => setActiveTab('camera_angles')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'camera_angles'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-black ring-2 ring-amber-400/40'
                : 'text-amber-300 hover:text-white bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/40 font-semibold'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[11px] font-black flex items-center justify-center text-amber-200">
              3
            </span>
            <Eye className="w-4 h-4 text-amber-300" />
            <span>Góc Máy & Tiêu Cự (Blocking)</span>
          </button>

          <span className="text-slate-600 hidden sm:inline select-none">➔</span>

          {/* Bước 4: PROMPT */}
          <button
            id="nav-tab-eight-sec"
            onClick={() => setActiveTab('eight_sec')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'eight_sec'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black ring-2 ring-purple-400/40'
                : 'text-purple-300 hover:text-white bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/40 font-semibold'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-400/40 text-[11px] font-black flex items-center justify-center text-purple-200">
              4
            </span>
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>Prompt Video AI (8s Clips)</span>
          </button>

          <span className="text-slate-600 hidden sm:inline select-none">➔</span>

          {/* Bước 5: VIDEO */}
          <button
            id="nav-tab-video-export"
            onClick={() => setActiveTab('video_export')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'video_export'
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-lg shadow-red-600/40 font-black ring-2 ring-red-400/50'
                : 'text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 font-bold'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-400/40 text-[11px] font-black flex items-center justify-center text-rose-200">
              5
            </span>
            <Video className="w-4 h-4 text-rose-300" />
            <span>Video & Lồng Tiếng (Xuất Bản)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
