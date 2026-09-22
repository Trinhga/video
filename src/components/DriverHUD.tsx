import React from 'react';
import { Vehicle, TrafficLightState } from '../types/traffic';
import { AlertTriangle, ShieldCheck, Gauge, BellRing, OctagonAlert, Siren } from 'lucide-react';

interface DriverHUDProps {
  vehicle: Vehicle;
  trafficLight: TrafficLightState;
  stopLineDistance: number; // in meters (positive = before line, negative = crossed)
}

export const DriverHUD: React.FC<DriverHUDProps> = ({
  vehicle,
  trafficLight,
  stopLineDistance,
}) => {
  const speedKmh = Math.round((vehicle.speed * 3600) / 1000);
  const distanceClamped = Math.max(0, stopLineDistance);
  const ttc = vehicle.speed > 0.5 && stopLineDistance > 0 
    ? (stopLineDistance / vehicle.speed).toFixed(1) 
    : '--';

  let alertLevel: 'safe' | 'warning' | 'danger' | 'violation' | 'emergency' = 'safe';
  let hudMessage = 'Tín hiệu giao thông bình thường';
  let hudSubMessage = 'Duy trì khoảng cách an toàn';

  if (vehicle.isEmergency) {
    alertLevel = 'emergency';
    hudMessage = 'XE ƯU TIÊN: ĐANG THỰC THI NHIỆM VỤ KHẨN CẤP';
    hudSubMessage = 'Phát tín hiệu còi & đèn ưu tiên qua giao lộ';
  } else if (vehicle.status === 'violated') {
    alertLevel = 'violation';
    hudMessage = 'CẢNH BÁO VI PHẠM: ĐÃ VƯỢT ĐÈN ĐỎ!';
    hudSubMessage = 'Camera ITS ngã tư đã kích hoạt ghi hình phạt nguội';
  } else if (trafficLight.color === 'red') {
    if (stopLineDistance > 0 && stopLineDistance < 40) {
      alertLevel = 'danger';
      hudMessage = 'NGUY HIỂM: ĐÈN ĐỎ PHÍA TRƯỚC!';
      hudSubMessage = `Khoảng cách còn ${distanceClamped.toFixed(1)}m. Đạp phanh dừng trước vạch!`;
    } else if (vehicle.status === 'stopped') {
      alertLevel = 'safe';
      hudMessage = 'ĐÃ DỪNG AN TOÀN TRƯỚC VẠCH 7.1';
      hudSubMessage = `Chờ đèn xanh (${trafficLight.timeRemaining}s)`;
    }
  } else if (trafficLight.color === 'yellow') {
    if (stopLineDistance > 0 && stopLineDistance < 45) {
      alertLevel = 'warning';
      hudMessage = 'CẢNH BÁO SỚM V2X: ĐÈN VÀNG!';
      hudSubMessage = `Dự kiến chuyển đỏ sau ${trafficLight.timeRemaining}s. Giảm tốc độ!`;
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md text-slate-100 relative overflow-hidden">
      {/* Background HUD Grid styling */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono tracking-wider uppercase text-slate-400">
            Màn hình Taplo Xe (V2X In-Cabin ADAS)
          </span>
        </div>
        <span className="text-xs font-mono text-blue-400 font-semibold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
          {vehicle.plate} ({vehicle.name})
        </span>
      </div>

      {/* Gauges & Telemetry Row */}
      <div className="grid grid-cols-3 gap-3 mb-3 text-center">
        {/* Speed */}
        <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-1">
            <Gauge className="w-3.5 h-3.5" />
            <span>Vận tốc</span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-white">
            {speedKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {(vehicle.speed).toFixed(1)} m/s
          </div>
        </div>

        {/* Distance to Stop Line */}
        <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-1">
            <OctagonAlert className="w-3.5 h-3.5" />
            <span>Khoảng cách vạch</span>
          </div>
          <div className={`text-2xl font-black font-mono tracking-tight ${
            stopLineDistance < 0 ? 'text-red-400' : stopLineDistance < 15 ? 'text-amber-400' : 'text-slate-100'
          }`}>
            {stopLineDistance < 0 ? `+${Math.abs(stopLineDistance).toFixed(1)}` : stopLineDistance.toFixed(1)}
            <span className="text-xs font-normal text-slate-400"> m</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {stopLineDistance < 0 ? 'Đã qua vạch' : 'Trước vạch số 7.1'}
          </div>
        </div>

        {/* TTC or Brake status */}
        <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-1">
            <BellRing className="w-3.5 h-3.5" />
            <span>Thời gian tới vạch</span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-white">
            {ttc} <span className="text-xs font-normal text-slate-400">s</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {vehicle.isBraking ? 'Đang đạp phanh' : vehicle.isAccelerating ? 'Đang tăng ga' : 'Duy trì tốc độ'}
          </div>
        </div>
      </div>

      {/* Dynamic HUD Alert Banner */}
      <div
        className={`rounded-lg p-3 border transition-all flex items-start gap-3 ${
          alertLevel === 'emergency'
            ? 'bg-blue-950/40 border-blue-500/50 text-blue-200'
            : alertLevel === 'violation'
            ? 'bg-red-950/60 border-red-500 text-red-200 animate-pulse'
            : alertLevel === 'danger'
            ? 'bg-red-950/40 border-red-500/50 text-red-300'
            : alertLevel === 'warning'
            ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
            : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {alertLevel === 'emergency' ? (
            <Siren className="w-5 h-5 text-blue-400 animate-bounce" />
          ) : alertLevel === 'violation' || alertLevel === 'danger' ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : alertLevel === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-wide">
            {hudMessage}
          </div>
          <div className="text-[11px] opacity-90 mt-0.5">
            {hudSubMessage}
          </div>
        </div>

        {/* Mini traffic light state indicator on HUD */}
        <div className="shrink-0 flex items-center gap-1 bg-black/60 px-2 py-1 rounded border border-slate-700">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              trafficLight.color === 'red' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-red-950'
            }`}
          />
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              trafficLight.color === 'yellow' ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-amber-950'
            }`}
          />
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              trafficLight.color === 'green' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-emerald-950'
            }`}
          />
          <span className="text-[11px] font-mono font-bold text-white ml-1">
            {trafficLight.timeRemaining}s
          </span>
        </div>
      </div>
    </div>
  );
};
