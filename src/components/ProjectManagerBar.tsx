import React, { useState } from 'react';
import { FilmProject } from '../types/script';
import { 
  FolderGit2, 
  Plus, 
  Copy, 
  Trash2, 
  Edit3, 
  Check, 
  ChevronDown, 
  Sparkles, 
  Clock, 
  Film,
  HardDrive
} from 'lucide-react';

interface ProjectManagerBarProps {
  projects: FilmProject[];
  activeProject: FilmProject;
  onSelectProject: (projectId: string) => void;
  onCreateNewProject: () => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  lastSavedTime?: number;
}

export const ProjectManagerBar: React.FC<ProjectManagerBarProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onCreateNewProject,
  onDuplicateProject,
  onDeleteProject,
  onRenameProject,
  lastSavedTime,
}) => {
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(activeProject.name);

  const handleStartRename = () => {
    setTempName(activeProject.name);
    setIsEditingName(true);
  };

  const handleSaveRename = () => {
    if (tempName.trim()) {
      onRenameProject(activeProject.id, tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveRename();
    if (e.key === 'Escape') setIsEditingName(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-2.5 sm:p-3 shadow-md text-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-20 backdrop-blur-sm">
      {/* Left: Project Selector & Active Name */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
          <FolderGit2 className="w-4 h-4" />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              Dự Án Đang Mở:
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded">
              <Check className="w-2.5 h-2.5" /> Tự Động Đồng Bộ Tất Cả Các Tab
            </span>
          </div>

          {/* Project Name or Inline Edit */}
          {isEditingName ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="bg-slate-950 border border-indigo-500 rounded px-2 py-0.5 text-xs sm:text-sm text-white focus:outline-none w-full max-w-md font-semibold"
              />
              <button
                type="button"
                onClick={handleSaveRename}
                className="p-1 text-emerald-400 hover:text-emerald-300 rounded bg-emerald-500/10 hover:bg-emerald-500/20"
                title="Lưu tên mới"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <div 
                className="relative inline-block text-left"
              >
                <button
                  type="button"
                  onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white hover:text-indigo-300 transition-colors truncate text-left group"
                >
                  <span className="truncate max-w-[220px] sm:max-w-md">
                    {activeProject.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0 transition-transform" />
                </button>

                {/* Dropdown Menu of Projects */}
                {isOpenDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setIsOpenDropdown(false)} 
                    />
                    <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 p-2 text-xs flex flex-col gap-1 max-h-80 overflow-y-auto">
                      <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1">
                        <span>Danh Sách Dự Án Đã Lưu ({projects.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpenDropdown(false);
                            onCreateNewProject();
                          }}
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                        >
                          <Plus className="w-3 h-3" /> Tạo mới
                        </button>
                      </div>

                      {projects.map((p) => {
                        const isCurrent = p.id === activeProject.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              onSelectProject(p.id);
                              setIsOpenDropdown(false);
                            }}
                            className={`p-2 rounded-lg text-left transition-all flex items-start justify-between gap-2 ${
                              isCurrent
                                ? 'bg-indigo-600/30 border border-indigo-500/50 text-white'
                                : 'hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-bold truncate text-xs">
                                {p.name}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {p.topic || 'Chưa nhập chủ đề'}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                                <span className="text-indigo-300">{p.duration}</span>
                                <span>•</span>
                                <span>{new Date(p.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                              </div>
                            </div>

                            {isCurrent && (
                              <span className="shrink-0 text-emerald-400 bg-emerald-500/10 p-1 rounded">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleStartRename}
                className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
                title="Đổi tên dự án"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions (New Project, Duplicate, Delete) */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <button
          type="button"
          id="btn-create-new-project"
          onClick={onCreateNewProject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all"
          title="Tạo dự án mới hoàn toàn"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Dự Án Mới</span>
        </button>

        <button
          type="button"
          onClick={() => onDuplicateProject(activeProject.id)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
          title="Nhân bản dự án này để thử ý tưởng khác"
        >
          <Copy className="w-3 h-3" />
          <span className="hidden sm:inline">Nhân Bản</span>
        </button>

        {projects.length > 1 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Bạn có chắc muốn xóa dự án "${activeProject.name}" không?`)) {
                onDeleteProject(activeProject.id);
              }
            }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs border border-slate-700 transition-all"
            title="Xóa dự án này"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}

        <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 pl-2 border-l border-slate-800">
          <HardDrive className="w-3 h-3 text-emerald-400" />
          <span>Đã lưu lúc {new Date(lastSavedTime || activeProject.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};
