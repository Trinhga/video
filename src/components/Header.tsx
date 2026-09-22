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

export type MainTabType = 'scripts' | 'teleprompter' | 'generator' | 'eight_sec' | 'production' | 'simulation';

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
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Đa Thể Loại • Phân Đoạn 8s AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Kịch bản chuẩn điện ảnh (Sci-Fi, TVC, Drama, Trinh thám, An toàn...) • Phân rã 8s Runway/Kling/Sora • Nhận diện nhân vật đồng nhất
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

      {/* Navigation Tabs */}
      <div className="bg-slate-950/70 border-t border-slate-800/60 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-1.5 scrollbar-none text-xs sm:text-sm font-medium">
          <button
            id="nav-tab-generator"
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'generator'
                ? 'bg-blue-600 text-white shadow-sm font-bold ring-2 ring-blue-400/30'
                : 'text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 font-semibold'
            }`}
          >
            <Clapperboard className="w-4 h-4 text-amber-400" />
            <span>🎬 Xưởng Phim AI (Nhập Chủ Đề)</span>
          </button>

          <button
            id="nav-tab-scripts"
            onClick={() => setActiveTab('scripts')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'scripts'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Kịch Bản Chi Tiết (Shot-by-Shot)</span>
          </button>

          <button
            id="nav-tab-eight-sec"
            onClick={() => setActiveTab('eight_sec')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'eight_sec'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md font-bold ring-2 ring-indigo-400/40'
                : 'text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 font-semibold'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>🎬 Phân Đoạn 8s & Prompts Video AI</span>
          </button>

          <button
            id="nav-tab-teleprompter"
            onClick={() => setActiveTab('teleprompter')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'teleprompter'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Máy Nhắc Chữ & Đọc Thử</span>
          </button>

          <button
            id="nav-tab-production"
            onClick={() => setActiveTab('production')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'production'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Checklist Đạo Diễn & Quay Phim</span>
          </button>

          <button
            id="nav-tab-simulation"
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'simulation'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Sa Bàn Mô Phỏng Góc Máy Nút Giao</span>
          </button>
        </div>
      </div>
    </header>
  );
};
