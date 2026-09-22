import React, { useState } from 'react';
import { calculateDilemmaZone } from '../utils/physics';
import { Calculator, AlertTriangle, CheckCircle, Info, ArrowRight, Lightbulb } from 'lucide-react';

export const DilemmaCalculator: React.FC = () => {
  const [speedKmh, setSpeedKmh] = useState<number>(50);
  const [yellowDurationSec, setYellowDurationSec] = useState<number>(3);
  const [reactionTimeSec, setReactionTimeSec] = useState<number>(1.0);
  const [frictionCoeff, setFrictionCoeff] = useState<number>(0.7); // Dry asphalt
  const [intersectionWidthMeters, setIntersectionWidthMeters] = useState<number>(20);
  const [vehicleLengthMeters, setVehicleLengthMeters] = useState<number>(4.5);

  const result = calculateDilemmaZone({
    speedKmh,
    reactionTimeSec,
    yellowDurationSec,
    frictionCoeff,
    intersectionWidthMeters,
    vehicleLengthMeters,
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Title banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
        <div className="flex items-start gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              Vật Lý Vùng Tiến Thoái Lưỡng Nan (Dilemma Zone Calculator)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Tính toán khoa học theo chuẩn <strong>Viện Kỹ sư Giao thông Hoa Kỳ (ITE)</strong> và 
              <strong> QCVN 41:2019/BGTVT</strong>: Giải thích vì sao người lái xe có thể bị "bẫy" vượt đèn đỏ ngoài ý muốn nếu chu kỳ đèn vàng quá ngắn.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Input Panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
            Tham Số Giao Lộ & Phương Tiện
          </h3>

          {/* Speed */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Vận tốc tiếp cận (v):</span>
              <span className="font-mono font-bold text-white">{speedKmh} km/h</span>
            </div>
            <input
              type="range"
              min="30"
              max="90"
              step="5"
              value={speedKmh}
              onChange={(e) => setSpeedKmh(Number(e.target.value))}
              className="w-full accent-blue-500 bg-slate-950 h-2 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>30 km/h</span>
              <span>60 km/h</span>
              <span>90 km/h</span>
            </div>
          </div>

          {/* Yellow duration */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Thời gian đèn vàng (Y):</span>
              <span className="font-mono font-bold text-amber-400">{yellowDurationSec} giây</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="0.5"
              value={yellowDurationSec}
              onChange={(e) => setYellowDurationSec(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-950 h-2 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>1s (Quá ngắn)</span>
              <span>3s (Phổ biến)</span>
              <span>6s</span>
            </div>
          </div>

          {/* Reaction time */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Thời gian phản xạ tài xế (tr):</span>
              <span className="font-mono font-bold text-white">{reactionTimeSec} giây</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="2.0"
              step="0.1"
              value={reactionTimeSec}
              onChange={(e) => setReactionTimeSec(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-950 h-2 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0.6s (Phản ứng nhanh)</span>
              <span>1.0s (Chuẩn)</span>
              <span>2.0s (Mất tập trung)</span>
            </div>
          </div>

          {/* Road friction */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Hệ số ma sát mặt đường (μ):</span>
              <span className="font-mono font-bold text-white">
                {frictionCoeff} ({frictionCoeff >= 0.65 ? 'Nhựa khô ráo' : frictionCoeff >= 0.4 ? 'Đường ướt' : 'Trơn trượt'})
              </span>
            </div>
            <input
              type="range"
              min="0.25"
              max="0.85"
              step="0.05"
              value={frictionCoeff}
              onChange={(e) => setFrictionCoeff(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-950 h-2 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0.25 (Mưa trơn)</span>
              <span>0.70 (Khô ráo)</span>
              <span>0.85 (Mặt bám cao)</span>
            </div>
          </div>

          {/* Intersection width */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Bề rộng giao lộ (W):</span>
              <span className="font-mono font-bold text-white">{intersectionWidthMeters} mét</span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              step="5"
              value={intersectionWidthMeters}
              onChange={(e) => setIntersectionWidthMeters(Number(e.target.value))}
              className="w-full accent-blue-500 bg-slate-950 h-2 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>10m (Nhỏ)</span>
              <span>20m (Trung bình)</span>
              <span>45m (Đại lộ rộng)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Analysis & Output Results */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Status Verdict Banner */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              result.hasDilemmaZone
                ? 'bg-red-950/40 border-red-500/60 text-red-200'
                : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.hasDilemmaZone ? (
                <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-base font-black">
                  {result.hasDilemmaZone
                    ? `CẢNH BÁO: TỒN TẠI VÙNG DILEMMA DÀI ${result.dilemmaZoneLength} MÉT!`
                    : 'GIAO LỘ AN TOÀN: KHÔNG XUẤT HIỆN BẪY VÙNG DILEMMA'}
                </h4>
                <p className="text-xs mt-1 opacity-90 leading-relaxed">
                  {result.hasDilemmaZone
                    ? `Với tốc độ ${speedKmh} km/h và đèn vàng chỉ ${yellowDurationSec}s, khi xe nằm trong khoảng cách từ ${result.clearingDistance}m đến ${result.stoppingDistance}m trước vạch dừng, người lái KHÔNG THỂ dừng an toàn cũng KHÔNG THỂ đi qua giao lộ trước khi đèn đỏ bật!`
                    : `Khoảng cách vượt an toàn (Xc = ${result.clearingDistance}m) lớn hơn khoảng cách dừng (Xs = ${result.stoppingDistance}m). Người lái có Option Zone dài ${result.optionZoneLength}m để tự tin quyết định dừng hay đi tiếp.`}
                </p>
              </div>
            </div>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] text-slate-400 block mb-1">
                Khoảng cách dừng an toàn tối thiểu (Xs)
              </span>
              <div className="text-2xl font-black font-mono text-white">
                {result.stoppingDistance} <span className="text-xs text-slate-400 font-normal">m</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Xs = v • tr + v² / (2 • a_max)
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] text-slate-400 block mb-1">
                Khoảng cách tối đa qua giao lộ trong pha vàng (Xc)
              </span>
              <div className="text-2xl font-black font-mono text-amber-400">
                {result.clearingDistance} <span className="text-xs text-slate-400 font-normal">m</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Xc = v • Y - (W + L)
              </p>
            </div>
          </div>

          {/* Graphical Distance Comparison Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Trực quan hóa Khoảng Cách Trước Vạch Dừng:
            </span>
            <div className="relative h-12 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center p-2">
              {/* Stop line at 0 (right edge) */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white z-10" />

              {/* Stopping distance bar */}
              <div
                className="absolute top-2 h-4 rounded bg-red-500/80 text-[10px] font-mono font-bold text-white flex items-center justify-end pr-1 transition-all"
                style={{
                  right: 8,
                  width: `${Math.min(95, (result.stoppingDistance / 70) * 100)}%`,
                }}
              >
                Xs: {result.stoppingDistance}m
              </div>

              {/* Clearance distance bar */}
              <div
                className="absolute bottom-2 h-4 rounded bg-amber-500/80 text-[10px] font-mono font-bold text-black flex items-center justify-end pr-1 transition-all"
                style={{
                  right: 8,
                  width: `${Math.min(95, (result.clearingDistance / 70) * 100)}%`,
                }}
              >
                Xc: {result.clearingDistance}m
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-red-500" />
                <span>Khoảng cách cần để phanh xe an toàn (Xs)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span>Khoảng cách tối đa vượt kịp đèn vàng (Xc)</span>
              </span>
            </div>
          </div>

          {/* ITE Recommendation Card */}
          <div className="bg-blue-950/30 border border-blue-500/40 rounded-xl p-4 text-xs text-blue-200 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold text-sm mb-0.5">
                Khuyến nghị thời gian đèn vàng theo tiêu chuẩn ITE:
              </strong>
              <span>
                Để triệt tiêu hoàn toàn vùng Dilemma Zone ở nút giao này (vận tốc {speedKmh} km/h, bề rộng {intersectionWidthMeters}m), 
                pha đèn vàng cần được cài đặt tối thiểu là <strong className="text-white font-mono font-bold text-sm">{result.minRecommendedYellowTime} giây</strong> 
                (thay vì {yellowDurationSec}s hiện tại).
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
