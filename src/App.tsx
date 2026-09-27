import React, { useState, useEffect } from 'react';
import { CURATED_SCRIPTS } from './data/videoScripts';
import { VideoScript, FilmProject } from './types/script';
import { 
  loadSavedProjects, 
  saveProjects, 
  createNewProject 
} from './utils/projectStorage';
import { Header, MainTabType } from './components/Header';
import { ProjectManagerBar } from './components/ProjectManagerBar';
import { ScriptViewer } from './components/ScriptViewer';
import { ScriptTeleprompter } from './components/ScriptTeleprompter';
import { ScriptGenerator } from './components/ScriptGenerator';
import { CameraAngleStudio } from './components/CameraAngleStudio';
import { EightSecondStudio } from './components/EightSecondStudio';
import { ProductionChecklist } from './components/ProductionChecklist';
import { IntersectionSimulation } from './components/IntersectionSimulation';
import { DriverHUD } from './components/DriverHUD';
import { DesktopExportModal } from './components/DesktopExportModal';
import { VideoExportStudio } from './components/VideoExportStudio';
import { 
  Vehicle, 
  TrafficLightState, 
  ScenarioType, 
  SimulationParams 
} from './types/traffic';

const INITIAL_PARAMS: SimulationParams = {
  roadLength: 120,
  stopLinePos: 75,
  dilemmaZoneStart: 35,
  dilemmaZoneEnd: 60,
  intersectionEnd: 105,
  frictionCoeff: 0.7,
  driverReactionTime: 1.0,
  gracePeriod: 0.3,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('generator');
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);

  // Persistent Multi-Project State
  const [projectState, setProjectState] = useState(() => loadSavedProjects());
  const projects = projectState.projects;
  const activeProjectId = projectState.activeProjectId;
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const [lastSavedTime, setLastSavedTime] = useState<number>(Date.now());

  // Save projects to localStorage whenever projectState updates
  const updateAndSaveProjects = (newProjects: FilmProject[], newActiveId: string = activeProjectId) => {
    setProjectState({
      projects: newProjects,
      activeProjectId: newActiveId,
    });
    saveProjects(newProjects, newActiveId);
    setLastSavedTime(Date.now());
  };

  // Select project
  const handleSelectProject = (projectId: string) => {
    updateAndSaveProjects(projects, projectId);
  };

  // Create new project
  const handleCreateNewProject = () => {
    const newProj = createNewProject('', 'drama');
    const updated = [newProj, ...projects];
    updateAndSaveProjects(updated, newProj.id);
    setActiveTab('generator');
  };

  // Duplicate project
  const handleDuplicateProject = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    const clonedId = `proj-${Date.now()}`;
    const clonedProj: FilmProject = {
      ...target,
      id: clonedId,
      name: `${target.name} (Bản sao)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      script: {
        ...target.script,
        id: `script-${Date.now()}`,
        title: `${target.script.title} (Bản sao)`,
      },
    };
    const updated = [clonedProj, ...projects];
    updateAndSaveProjects(updated, clonedId);
  };

  // Delete project
  const handleDeleteProject = (projectId: string) => {
    if (projects.length <= 1) return;
    const updated = projects.filter((p) => p.id !== projectId);
    const nextActiveId = updated[0].id;
    updateAndSaveProjects(updated, nextActiveId);
  };

  // Rename project
  const handleRenameProject = (projectId: string, newName: string) => {
    const updated = projects.map((p) =>
      p.id === projectId ? { ...p, name: newName, updatedAt: Date.now() } : p
    );
    updateAndSaveProjects(updated, activeProjectId);
  };

  // Auto-save form inputs (topic, genre, duration, etc.) as the user types
  const handleProjectDataChange = (data: {
    topic: string;
    genre: FilmProject['genre'];
    duration: FilmProject['duration'];
    tone: string;
    customAudience: string;
    customSetting: string;
  }) => {
    const updated = projects.map((p) => {
      if (p.id === activeProjectId) {
        // If the project was freshly created without custom name, auto-derive name from topic
        const autoName = (p.name.startsWith('Dự Án Mới') && data.topic.trim().length > 3)
          ? `Dự Án: ${data.topic.trim().slice(0, 32)}...`
          : p.name;

        return {
          ...p,
          ...data,
          name: autoName,
          updatedAt: Date.now(),
        };
      }
      return p;
    });
    updateAndSaveProjects(updated, activeProjectId);
  };

  // When a script is generated in Xưởng Phim AI, sync immediately across all tabs!
  const handleScriptGenerated = (newScript: VideoScript) => {
    const updated = projects.map((p) => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          name: newScript.title,
          script: newScript,
          updatedAt: Date.now(),
        };
      }
      return p;
    });
    updateAndSaveProjects(updated, activeProjectId);
  };

  const handleUseGeneratedScript = (newScript: VideoScript) => {
    handleScriptGenerated(newScript);
    setActiveTab('scripts');
  };

  const handleOpenTeleprompterWithScript = (newScript: VideoScript) => {
    handleScriptGenerated(newScript);
    setActiveTab('video_export');
  };

  const handleOpenEightSecondStudioWithScript = (newScript: VideoScript) => {
    handleScriptGenerated(newScript);
    setActiveTab('eight_sec');
  };

  const handleUpdateScript = (updatedScript: VideoScript) => {
    handleScriptGenerated(updatedScript);
  };

  // State for Intersection Simulation reference
  const [simVehicle, setSimVehicle] = useState<Vehicle>({
    id: 'veh-1',
    type: 'car',
    name: 'Mazda 3 (Xe diễn viên Tuấn)',
    plate: '30E-689.96',
    color: '#dc2626',
    x: 25,
    speed: 13.89, // 50 km/h
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

  // Unified all scripts list for the ScriptViewer selector
  const combinedScripts = [
    activeProject.script,
    ...CURATED_SCRIPTS.filter((s) => s.id !== activeProject.script.id),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentScriptTitle={activeProject.script.title}
        onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Project Manager Bar (Unified project switcher & auto-saver) */}
        <ProjectManagerBar
          projects={projects}
          activeProject={activeProject}
          onSelectProject={handleSelectProject}
          onCreateNewProject={handleCreateNewProject}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={handleDeleteProject}
          onRenameProject={handleRenameProject}
          lastSavedTime={lastSavedTime}
        />

        {/* Bước 1: Kịch Bản (XƯỞNG PHIM AI) */}
        <div style={{ display: activeTab === 'generator' ? 'block' : 'none' }}>
          <ScriptGenerator
            key={activeProject.id}
            initialTopic={activeProject.topic}
            initialGenre={activeProject.genre}
            initialDuration={activeProject.duration}
            initialTone={activeProject.tone}
            initialCustomAudience={activeProject.customAudience}
            initialCustomSetting={activeProject.customSetting}
            initialScript={activeProject.script}
            projectId={activeProject.id}
            projectName={activeProject.name}
            onProjectDataChange={handleProjectDataChange}
            onScriptGenerated={handleScriptGenerated}
            onUseGeneratedScript={handleUseGeneratedScript}
            onOpenTeleprompterWithScript={handleOpenTeleprompterWithScript}
            onOpenEightSecondStudioWithScript={handleOpenEightSecondStudioWithScript}
          />
        </div>

        {/* Bước 2: Phân Cảnh (Shot-by-Shot, Lời thoại, Voiceover) */}
        <div style={{ display: activeTab === 'scripts' ? 'block' : 'none' }}>
          <ScriptViewer
            script={activeProject.script}
            projectName={activeProject.name}
            onUpdateScript={handleUpdateScript}
            onBackToGenerator={() => setActiveTab('generator')}
            onOpenCameraAngles={() => setActiveTab('camera_angles')}
            onOpenTeleprompter={() => setActiveTab('video_export')}
            onOpenEightSecondStudio={() => setActiveTab('eight_sec')}
            onSelectAnotherScript={(id) => {
              const found = CURATED_SCRIPTS.find((s) => s.id === id);
              if (found) {
                handleScriptGenerated(found);
              }
            }}
            allScripts={CURATED_SCRIPTS}
          />
        </div>

        {/* Bước 3: Góc Máy (Studio Đặt Góc Máy & Tiêu Cự Đạo Diễn) */}
        <div style={{ display: activeTab === 'camera_angles' || activeTab === 'simulation' ? 'block' : 'none' }}>
          <CameraAngleStudio
            script={activeProject.script}
            onUpdateScript={handleUpdateScript}
            onNavigateToPrompts={() => setActiveTab('eight_sec')}
            onNavigateToVideo={() => setActiveTab('video_export')}
          />
        </div>

        {/* Bước 4: Prompt (Phân Đoạn 8s & Prompts Video AI) */}
        <div style={{ display: activeTab === 'eight_sec' ? 'block' : 'none' }}>
          <EightSecondStudio
            script={activeProject.script}
            onUpdateScript={handleUpdateScript}
            onOpenTeleprompter={() => setActiveTab('video_export')}
            onNavigateToVideo={() => setActiveTab('video_export')}
            onNavigateToCameraAngles={() => setActiveTab('camera_angles')}
          />
        </div>

        {/* Bước 5: Video (Kết Xuất Video, Lồng Tiếng Voiceover & Xuất Bản) */}
        <div style={{ display: activeTab === 'video_export' || activeTab === 'teleprompter' ? 'block' : 'none' }}>
          <VideoExportStudio
            script={activeProject.script}
            onUpdateScript={handleUpdateScript}
            onOpenTeleprompter={() => setActiveTab('video_export')}
            onOpenEightSecondStudio={() => setActiveTab('eight_sec')}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Xưởng Biên Kịch Điện Ảnh & Video AI • Quản Lý Đa Dự Án Tự Động Lưu • Phân Rã 8s Runway / Kling / Sora
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Dự án: {activeProject.name}
          </span>
        </div>
      </footer>

      {/* Desktop App Installation & Export Modal */}
      <DesktopExportModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />
    </div>
  );
}
