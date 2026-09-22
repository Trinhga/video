import React from 'react';
import { 
  Vehicle, 
  TrafficLightState, 
  ScenarioType, 
  SimulationParams, 
  ViolationEvidence 
} from '../types/traffic';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  Camera, 
  Radio, 
  Car, 
  Truck, 
  Bike, 
  Siren, 
  CheckCircle2, 
  AlertCircle, 
  Zap 
} from 'lucide-react';

interface IntersectionSimulationProps {
  vehicle: Vehicle;
  trafficLight: TrafficLightState;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: (scenario?: ScenarioType) => void;
  onStep: () => void;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  currentScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
  params: SimulationParams;
  onManualBrake: () => void;
  onManualAccelerate: () => void;
  onManualLightChange: (color: 'red' | 'yellow' | 'green') => void;
  activeEvidence: ViolationEvidence | null;
  onViewEvidence: () => void;
  vmsMessage: string;
  cameraFlashing: boolean;
}

export const IntersectionSimulation: React.FC<IntersectionSimulationProps> = ({
  vehicle,
  trafficLight,
  isPlaying,
  onTogglePlay,
  onReset,
  onStep,
  simSpeed,
  setSimSpeed,
  currentScenario,
  onSelectScenario,
  params,
  onManualBrake,
  onManualAccelerate,
  onManualLightChange,
  activeEvidence,
  onViewEvidence,
  vmsMessage,
  cameraFlashing,
}) => {
  const stopLineDistance = params.stopLinePos - vehicle.x;
  const speedKmh = Math.round((vehicle.speed * 3600) / 1000);

  // SVG dimensions
  const svgWidth = 1000;
  const svgHeight = 320;
  
  // Mapping meters to SVG X coordinate: 0m -> 40px, 120m -> 960px
  const scaleX = (m: number) => 40 + (m / params.roadLength) * (svgWidth - 80);

  const stopLineSvgX = scaleX(params.stopLinePos);
  const dilemmaStartSvgX = scaleX(params.dilemmaZoneStart);
  const dilemmaEndSvgX = scaleX(params.dilemmaZoneEnd);
  const intersectionEndSvgX = scaleX(params.intersectionEnd);
  const vehicleSvgX = scaleX(vehicle.x);
  const vehicleSvgY = 160;

  // Determine bounding box color
  let bboxColor = '#22c55e'; // green
  if (vehicle.isEmergency) {
    bboxColor = '#3b82f6'; // blue
  } else if (vehicle.status === 'violated') {
    bboxColor = '#ef4444'; // red
  } else if (vehicle.status === 'warned' || vehicle.status === 'stopping') {
    bboxColor = '#f59e0b'; // amber
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Scenario Selector Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Chọn Kịch Bản Khảo Sát Tình Huống:</span>
          <span className="text-[11px] text-blue-400 font-normal">
            Nhấn vào kịch bản để tái lập mô phỏng tự động
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            id="scenario-btn-safe-stop"
            onClick={() => onSelectScenario('early_warning_safe_stop')}
            className={`px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
              currentScenario === 'early_warning_safe_stop'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>1. Cảnh báo sớm</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Xe phanh dừng an toàn trước vạch 7.1
            </p>
          </button>

          <button
            id="scenario-btn-intentional-violation"
            onClick={() => onSelectScenario('intentional_violation')}
            className={`px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
              currentScenario === 'intentional_violation'
                ? 'bg-red-950/60 border-red-500 text-red-200 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span>2. Vượt đèn đỏ</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Tăng ga vượt qua ngã tư khi đèn đỏ
            </p>
          </button>

          <button
            id="scenario-btn-stop-line-creep"
            onClick={() => onSelectScenario('stop_line_creep')}
            className={`px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
              currentScenario === 'stop_line_creep'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Dừng đè vạch</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Chẹt vạch dừng nhưng không qua ngã tư
            </p>
          </button>

          <button
            id="scenario-btn-emergency-vehicle"
            onClick={() => onSelectScenario('emergency_vehicle')}
            className={`px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
              currentScenario === 'emergency_vehicle'
                ? 'bg-blue-950/60 border-blue-500 text-blue-200 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-0.5">
              <Siren className="w-3.5 h-3.5 text-blue-400" />
              <span>4. Xe cứu thương</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Xe ưu tiên khẩn cấp được miễn trừ
            </p>
          </button>

          <button
            id="scenario-btn-yellow-clearance"
            onClick={() => onSelectScenario('yellow_clearance')}
            className={`px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
              currentScenario === 'yellow_clearance'
                ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-0.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>5. Qua vạch đèn vàng</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Đã chớm qua vạch trước khi đèn đỏ
            </p>
          </button>

          <button
            id="scenario-btn-custom-sandbox"
            onClick={() => onSelectScenario('custom_sandbox')}
            className={`px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
              currentScenario === 'custom_sandbox'
                ? 'bg-slate-800 border-slate-400 text-white shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-0.5">
              <Car className="w-3.5 h-3.5 text-slate-400" />
              <span>6. Tùy biến Sandbox</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Tự điều khiển phanh, ga và pha đèn
            </p>
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport (Canvas / SVG) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl relative">
        {/* Overhead VMS Display (Bảng thông tin điện tử) */}
        <div className="bg-black/90 border-b border-amber-900/40 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
              BẢNG QUANG BÁO NÚT GIAO (VMS LED GANTRY):
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-amber-300 tracking-wide bg-amber-950/40 px-3 py-1 rounded border border-amber-700/50 shadow-[0_0_12px_rgba(245,158,11,0.2)] text-center">
            {vmsMessage}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Tốc độ radar: <strong className="text-white">{speedKmh} km/h</strong></span>
            <span>|</span>
            <span>Vị trí: <strong className="text-white">{vehicle.x.toFixed(1)}m</strong> / {params.roadLength}m</span>
          </div>
        </div>

        {/* Camera Flash overlay for visual confirmation */}
        {cameraFlashing && (
          <div className="absolute inset-0 bg-white/40 pointer-events-none z-30 animate-out fade-out duration-300" />
        )}

        {/* The SVG Intersection Map */}
        <div className="w-full overflow-x-auto p-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[750px] select-none"
          >
            <defs>
              {/* Striped pattern for Dilemma Zone */}
              <pattern id="dilemmaPattern" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="16" stroke="#eab308" strokeWidth="3" strokeOpacity="0.25" />
              </pattern>
              {/* Yellow box junction pattern */}
              <pattern id="yellowBoxPattern" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="20" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="0" y1="0" x2="20" y2="0" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.4" />
              </pattern>
            </defs>

            {/* Road Background */}
            <rect x="0" y="70" width={svgWidth} height="180" fill="#1e293b" />

            {/* Road borders (curbs) */}
            <line x1="0" y1="70" x2={svgWidth} y2="70" stroke="#64748b" strokeWidth="4" />
            <line x1="0" y1="250" x2={svgWidth} y2="250" stroke="#64748b" strokeWidth="4" />

            {/* Dilemma / Pre-Warning Zone Background */}
            <rect
              x={dilemmaStartSvgX}
              y="72"
              width={dilemmaEndSvgX - dilemmaStartSvgX}
              height="176"
              fill="url(#dilemmaPattern)"
            />
            {/* Dilemma Zone Label */}
            <text
              x={(dilemmaStartSvgX + dilemmaEndSvgX) / 2}
              y="92"
              fill="#fbbf24"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              className="font-mono"
            >
              VÙNG CẢNH BÁO SỚM / DILEMMA ZONE ({params.dilemmaZoneStart}m - {params.dilemmaZoneEnd}m)
            </text>

            {/* Lane dividing dashed lines */}
            <line
              x1="0"
              y1="160"
              x2={stopLineSvgX}
              y2="160"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="14 12"
            />

            {/* Virtual Trigger Sensors Lines */}
            {/* Sensor 1: Early Warning Trigger (45m) */}
            <line
              x1={scaleX(45)}
              y1="72"
              x2={scaleX(45)}
              y2="248"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x={scaleX(45)} y="64" fill="#38bdf8" fontSize="8" textAnchor="middle" className="font-mono">
              Vạch Cảm Biến T1 (Radar/ANPR)
            </text>

            {/* Sensor 2: Stop Line Sensor 7.1 */}
            <line
              x1={stopLineSvgX}
              y1="70"
              x2={stopLineSvgX}
              y2="250"
              stroke="#ffffff"
              strokeWidth="6"
            />
            <text x={stopLineSvgX} y="64" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">
              VẠCH DỪNG 7.1 ({params.stopLinePos}m)
            </text>

            {/* Pedestrian Zebra Crosswalk (Vạch đi bộ qua đường) */}
            {Array.from({ length: 9 }).map((_, idx) => (
              <rect
                key={idx}
                x={stopLineSvgX + 6 + idx * 8}
                y="76"
                width="4"
                height="168"
                fill="#f8fafc"
                opacity="0.85"
              />
            ))}

            {/* Intersection Core Area (Vùng tâm giao lộ vi phạm) */}
            <rect
              x={stopLineSvgX + 85}
              y="72"
              width={intersectionEndSvgX - (stopLineSvgX + 85)}
              height="176"
              fill="url(#yellowBoxPattern)"
              stroke="#eab308"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
            <text
              x={(stopLineSvgX + 85 + intersectionEndSvgX) / 2}
              y="92"
              fill="#f59e0b"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              className="font-mono"
            >
              VÙNG TÂM GIAO LỘ (KHU VỰC BẮT VI PHẠM T3)
            </text>

            {/* Sensor 3: Core Violation Sensor */}
            <line
              x1={scaleX(95)}
              y1="72"
              x2={scaleX(95)}
              y2="248"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x={scaleX(95)} y="64" fill="#ef4444" fontSize="8" textAnchor="middle" className="font-mono">
              Vạch Cảm Biến T3 (Xác Nhận Vượt Đèn Đỏ)
            </text>

            {/* Camera ITS Mast & FOV Beam */}
            <g transform={`translate(${stopLineSvgX + 15}, 15)`}>
              {/* Camera pole */}
              <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <path d="M-6 -3 L6 -3 L4 5 L-4 5 Z" fill="#38bdf8" />
              <circle cx="0" cy="1" r="2.5" fill="#ffffff" />
              <text x="16" y="4" fill="#38bdf8" fontSize="9" fontWeight="bold" className="font-mono">
                AI CAMERA ITS GHI HÌNH PHẠT NGUỘI
              </text>
              {/* Laser / FOV projection cone */}
              <polygon
                points={`-5,10 ${-120},145 ${80},145`}
                fill="#38bdf8"
                fillOpacity={cameraFlashing ? '0.35' : '0.08'}
              />
            </g>

            {/* Overhead Traffic Light Post at Stop Line */}
            <g transform={`translate(${stopLineSvgX - 25}, 185)`}>
              {/* Traffic Light Housing */}
              <rect x="0" y="0" width="22" height="60" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="2" />
              
              {/* Red bulb */}
              <circle
                cx="11"
                cy="11"
                r="6.5"
                fill={trafficLight.color === 'red' ? '#ef4444' : '#450a0a'}
                filter={trafficLight.color === 'red' ? 'drop-shadow(0 0 8px #ef4444)' : undefined}
              />
              {/* Yellow bulb */}
              <circle
                cx="11"
                cy="30"
                r="6.5"
                fill={trafficLight.color === 'yellow' ? '#f59e0b' : '#451a03'}
                filter={trafficLight.color === 'yellow' ? 'drop-shadow(0 0 8px #f59e0b)' : undefined}
              />
              {/* Green bulb */}
              <circle
                cx="11"
                cy="49"
                r="6.5"
                fill={trafficLight.color === 'green' ? '#10b981' : '#022c22'}
                filter={trafficLight.color === 'green' ? 'drop-shadow(0 0 8px #10b981)' : undefined}
              />

              {/* Digital Countdown Timer display above light */}
              <rect x="-6" y="-22" width="34" height="18" rx="3" fill="#000000" stroke="#334155" strokeWidth="1" />
              <text
                x="11"
                y="-9"
                fill={
                  trafficLight.color === 'red'
                    ? '#ef4444'
                    : trafficLight.color === 'yellow'
                    ? '#f59e0b'
                    : '#10b981'
                }
                fontSize="12"
                fontWeight="black"
                textAnchor="middle"
                className="font-mono"
              >
                {trafficLight.timeRemaining}
              </text>
            </g>

            {/* Moving Vehicle Group */}
            <g transform={`translate(${vehicleSvgX}, ${vehicleSvgY})`}>
              {/* Vehicle Body Shadow */}
              <ellipse cx="0" cy="18" rx="28" ry="8" fill="#000000" opacity="0.4" />

              {/* Vehicle graphics based on type */}
              {vehicle.type === 'ambulance' ? (
                // Ambulance
                <g>
                  <rect x="-32" y="-14" width="64" height="28" rx="4" fill="#f8fafc" stroke="#dc2626" strokeWidth="2" />
                  {/* Red cross */}
                  <rect x="-5" y="-9" width="10" height="18" fill="#dc2626" />
                  <rect x="-9" y="-5" width="18" height="10" fill="#dc2626" />
                  {/* Flashing blue/red emergency light on roof */}
                  <circle cx="0" cy="-17" r="4" fill="#3b82f6" className="animate-ping" />
                  <circle cx="0" cy="-17" r="3.5" fill="#ef4444" />
                </g>
              ) : vehicle.type === 'truck' ? (
                // Truck
                <g>
                  <rect x="-42" y="-16" width="56" height="32" rx="3" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
                  <rect x="14" y="-12" width="24" height="24" rx="4" fill={vehicle.color} />
                  <rect x="24" y="-8" width="10" height="16" fill="#38bdf8" opacity="0.7" />
                </g>
              ) : vehicle.type === 'motorcycle' ? (
                // Motorcycle
                <g>
                  <rect x="-14" y="-4" width="28" height="8" rx="3" fill={vehicle.color} />
                  <circle cx="-10" cy="0" r="5" fill="#334155" />
                  <circle cx="10" cy="0" r="5" fill="#334155" />
                  <circle cx="0" cy="-8" r="4" fill="#cbd5e1" /> {/* Rider helmet */}
                </g>
              ) : (
                // Passenger Car
                <g>
                  {/* Main Car Chassis */}
                  <rect x="-26" y="-12" width="52" height="24" rx="6" fill={vehicle.color} stroke="#334155" strokeWidth="1.5" />
                  {/* Cabin roof */}
                  <rect x="-12" y="-9" width="24" height="18" rx="3" fill="#0f172a" />
                  {/* Windshield front */}
                  <rect x="8" y="-7" width="5" height="14" rx="1" fill="#38bdf8" opacity="0.8" />
                  {/* Rear windshield */}
                  <rect x="-11" y="-7" width="4" height="14" rx="1" fill="#38bdf8" opacity="0.6" />
                  {/* Wheels */}
                  <rect x="-18" y="-15" width="8" height="4" rx="1" fill="#0f172a" />
                  <rect x="10" y="-15" width="8" height="4" rx="1" fill="#0f172a" />
                  <rect x="-18" y="11" width="8" height="4" rx="1" fill="#0f172a" />
                  <rect x="10" y="11" width="8" height="4" rx="1" fill="#0f172a" />
                </g>
              )}

              {/* Headlights (Front is facing right: +x direction) */}
              <polygon points="26,-6 50,-14 50,14 26,6" fill="#fef08a" opacity="0.25" />

              {/* Brake Lights (Rear: -x direction) - GLOWS when braking */}
              <circle
                cx="-26"
                cy="-7"
                r="3"
                fill={vehicle.isBraking ? '#ef4444' : '#7f1d1d'}
                filter={vehicle.isBraking ? 'drop-shadow(0 0 6px #ef4444)' : undefined}
              />
              <circle
                cx="-26"
                cy="7"
                r="3"
                fill={vehicle.isBraking ? '#ef4444' : '#7f1d1d'}
                filter={vehicle.isBraking ? 'drop-shadow(0 0 6px #ef4444)' : undefined}
              />

              {/* AI Camera Bounding Box (YOLO / OpenCV tracking overlay) */}
              <rect
                x="-36"
                y="-32"
                width="72"
                height="64"
                fill="none"
                stroke={bboxColor}
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              {/* Corner brackets */}
              <path d="M-36 -24 L-36 -32 L-28 -32" fill="none" stroke={bboxColor} strokeWidth="2.5" />
              <path d="M28 -32 L36 -32 L36 -24" fill="none" stroke={bboxColor} strokeWidth="2.5" />
              <path d="M-36 24 L-36 32 L-28 32" fill="none" stroke={bboxColor} strokeWidth="2.5" />
              <path d="M28 32 L36 32 L36 24" fill="none" stroke={bboxColor} strokeWidth="2.5" />

              {/* Plate & Telemetry Badge above vehicle */}
              <g transform="translate(-36, -50)">
                <rect x="0" y="0" width="72" height="15" rx="2" fill="#0f172a" stroke={bboxColor} strokeWidth="1" />
                <text x="36" y="11" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono">
                  {vehicle.plate} • {speedKmh}km/h
                </text>
              </g>
            </g>

            {/* Distance measurement tick lines on approach */}
            <g opacity="0.35">
              {[0, 20, 40, 60, 75, 90, 110].map((meter) => (
                <g key={meter} transform={`translate(${scaleX(meter)}, 255)`}>
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" strokeWidth="1" />
                  <text x="0" y="18" fill="#94a3b8" fontSize="8" textAnchor="middle" className="font-mono">
                    {meter}m
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Live Simulation Control Dashboard */}
        <div className="bg-slate-900 border-t border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 text-slate-200">
          {/* Main Play / Step / Reset controls */}
          <div className="flex items-center gap-2">
            <button
              id="sim-play-pause-btn"
              onClick={onTogglePlay}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Tạm Dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Bắt Đầu Chạy</span>
                </>
              )}
            </button>

            <button
              id="sim-step-btn"
              onClick={onStep}
              disabled={isPlaying}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50 border border-slate-700"
              title="Bước tới 0.1 giây"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>Bước (0.1s)</span>
            </button>

            <button
              id="sim-reset-btn"
              onClick={() => onReset()}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              title="Khôi phục trạng thái ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt Lại</span>
            </button>

            {/* Speed Multiplier */}
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 ml-1">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSimSpeed(s)}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                    simSpeed === s ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Driver Manual Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Tài xế:</span>
            <button
              id="driver-brake-btn"
              onClick={onManualBrake}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                vehicle.isBraking
                  ? 'bg-red-600 text-white border-red-500 shadow-md animate-pulse'
                  : 'bg-red-950/40 text-red-300 border-red-800/50 hover:bg-red-900/50'
              }`}
            >
              🛑 Đạp Phanh
            </button>
            <button
              id="driver-accelerate-btn"
              onClick={onManualAccelerate}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                vehicle.isAccelerating
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              ⚡ Tăng Ga
            </button>
          </div>

          {/* Traffic Light Manual Overrides */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Đèn:</span>
            <button
              onClick={() => onManualLightChange('red')}
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                trafficLight.color === 'red'
                  ? 'bg-red-600 border-white text-white shadow-[0_0_8px_#ef4444]'
                  : 'bg-red-950/80 border-red-900 text-red-400 hover:bg-red-900'
              }`}
              title="Chuyển đèn đỏ ngay"
            >
              Đ
            </button>
            <button
              onClick={() => onManualLightChange('yellow')}
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                trafficLight.color === 'yellow'
                  ? 'bg-amber-500 border-white text-black shadow-[0_0_8px_#f59e0b]'
                  : 'bg-amber-950/80 border-amber-900 text-amber-400 hover:bg-amber-900'
              }`}
              title="Chuyển đèn vàng ngay"
            >
              V
            </button>
            <button
              onClick={() => onManualLightChange('green')}
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                trafficLight.color === 'green'
                  ? 'bg-emerald-600 border-white text-white shadow-[0_0_8px_#10b981]'
                  : 'bg-emerald-950/80 border-emerald-900 text-emerald-400 hover:bg-emerald-900'
              }`}
              title="Chuyển đèn xanh ngay"
            >
              X
            </button>
          </div>

          {/* View Violation Dossier button if recorded */}
          {activeEvidence && (
            <button
              id="view-evidence-badge-btn"
              onClick={onViewEvidence}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white animate-bounce shadow-md"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Xem Hồ Sơ Phạt Nguội (3 Ảnh)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
