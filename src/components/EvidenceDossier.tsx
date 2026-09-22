import React from 'react';
import { ViolationEvidence } from '../types/traffic';
import { 
  FileCheck, 
  Printer, 
  Download, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  Car, 
  Clock, 
  MapPin, 
  Gauge, 
  CheckCircle2 
} from 'lucide-react';

interface EvidenceDossierProps {
  evidence: ViolationEvidence | null;
  onResetToSimulation: () => void;
}

export const EvidenceDossier: React.FC<EvidenceDossierProps> = ({
  evidence,
  onResetToSimulation,
}) => {
  if (!evidence) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center shadow-md">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-700">
          <FileCheck className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          Chưa Có Hồ Sơ Vi Phạm Nào Được Ghi Nhận
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Hãy quay lại tab Mô phỏng và chọn kịch bản <strong>"2. Vượt đèn đỏ"</strong> hoặc 
          <strong> "3. Dừng đè vạch"</strong> để kích hoạt camera chụp 3 khung hình bằng chứng.
        </p>
        <button
          onClick={onResetToSimulation}
          className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          Quay lại Mô phỏng Ngã tư
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const isExempt = evidence.violationType === 'EXEMPT_EMERGENCY';
  const isOverstep = evidence.violationType === 'STOP_LINE_OVERSTEP';

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto print:max-w-none print:m-0">
      {/* Action bar for printing / exporting */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md print:hidden">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-bold text-white">
            Trích Xuất Hồ Sơ Xử Lý Vi Phạm Giao Thông Số Chuẩn Cục CSGT
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Biên Bản</span>
          </button>
          <a
            href="https://csgt.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Tra Cứu Cổng DVC Quốc Gia</span>
          </a>
        </div>
      </div>

      {/* Main Official Dossier Paper */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Official Header */}
        <div className="border-b border-slate-800 pb-5 mb-6 text-center">
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-600">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </div>
          <div className="text-[11px] sm:text-xs font-semibold text-slate-400 underline decoration-slate-600 underline-offset-4 mb-3 print:text-gray-600">
            Độc lập - Tự do - Hạnh phúc
          </div>

          <div className="mt-4">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white print:text-black">
              PHIẾU XÁC NHẬN KẾT QUẢ THU THẬP BẰNG CHỨNG HÌNH ẢNH VI PHẠM
            </h2>
            <div className="text-xs font-mono text-slate-400 mt-1 print:text-gray-600">
              Mã hồ sơ điện tử: <strong className="text-blue-400 font-bold print:text-black">{evidence.id}</strong>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Trạng thái thẩm định:</span>
            {isExempt ? (
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                MIỄN TRỪ PHÁP LÝ (XE ƯU TIÊN)
              </span>
            ) : isOverstep ? (
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                VI PHẠM VẠCH KẺ ĐƯỜNG (KHÔNG VƯỢT ĐÈN)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                XÁC THỰC VI PHẠM VƯỢT ĐÈN ĐỎ
              </span>
            )}
          </div>
          <div className="text-xs font-mono text-slate-400">
            Hệ thống: AI Camera ITS • Tiêu chuẩn 3-Frame
          </div>
        </div>

        {/* The 3-Frame Evidence Grid */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <span>Bằng Chứng Số 3 Khung Hình Liên Tiếp (Theo Nghị Định 135/2021/NĐ-CP):</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Frame 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col print:border-gray-300">
              <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="font-bold text-white">ẢNH 1: TIẾP CẬN VẠCH</span>
                <span className="text-red-400">{evidence.frames.frame1.timeOffset}</span>
              </div>
              {/* Graphic representation of Frame 1 */}
              <div className="h-44 bg-slate-950 relative flex items-center justify-center p-3 border-b border-slate-800">
                <div className="w-full h-full border border-dashed border-slate-800 rounded flex flex-col justify-between p-2 relative overflow-hidden">
                  <div className="flex justify-between items-start text-[10px] font-mono text-slate-400 z-10">
                    <span className="bg-red-950/80 text-red-400 px-1 rounded border border-red-800">
                      ● ĐÈN ĐỎ SÁNG
                    </span>
                    <span>CAM-01 [GÓC TRÊN]</span>
                  </div>
                  {/* Visual stopline representation */}
                  <div className="absolute right-12 top-0 bottom-0 w-2 bg-white" />
                  <div className="absolute right-14 text-[9px] text-white font-mono uppercase transform -rotate-90">
                    Vạch 7.1
                  </div>
                  {/* Visual vehicle before line */}
                  <div className="w-24 h-12 bg-blue-600/80 rounded border border-blue-400 flex items-center justify-center text-[10px] font-bold text-white font-mono shadow-md z-10">
                    {evidence.vehiclePlate}
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 z-10">
                    Vị trí: {evidence.frames.frame1.vehiclePos}
                  </div>
                </div>
              </div>
              <div className="p-3 text-[11px] text-slate-300">
                <p className="font-medium">{evidence.frames.frame1.description}</p>
                <div className="mt-1 text-[10px] text-slate-500 font-mono">
                  Trạng thái: {evidence.frames.frame1.lightState}
                </div>
              </div>
            </div>

            {/* Frame 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col print:border-gray-300">
              <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="font-bold text-white">ẢNH 2: ĐÈ / QUA VẠCH</span>
                <span className="text-red-400">{evidence.frames.frame2.timeOffset}</span>
              </div>
              {/* Graphic representation of Frame 2 */}
              <div className="h-44 bg-slate-950 relative flex items-center justify-center p-3 border-b border-slate-800">
                <div className="w-full h-full border border-dashed border-slate-800 rounded flex flex-col justify-between p-2 relative overflow-hidden">
                  <div className="flex justify-between items-start text-[10px] font-mono text-slate-400 z-10">
                    <span className="bg-red-950/80 text-red-400 px-1 rounded border border-red-800">
                      ● ĐÈN ĐỎ SÁNG
                    </span>
                    <span className="text-amber-400 font-bold">ZOOM BIỂN SỐ 4X</span>
                  </div>
                  {/* Visual stopline right under vehicle */}
                  <div className="absolute left-16 top-0 bottom-0 w-2 bg-white" />
                  {/* Visual vehicle overlapping line */}
                  <div className="absolute left-8 top-12 w-28 h-12 bg-blue-600/90 rounded border-2 border-amber-400 flex items-center justify-center text-[11px] font-black text-white font-mono shadow-lg z-10">
                    {evidence.vehiclePlate}
                  </div>
                  <div className="mt-auto text-[9px] font-mono text-slate-500 z-10">
                    Vị trí: {evidence.frames.frame2.vehiclePos}
                  </div>
                </div>
              </div>
              <div className="p-3 text-[11px] text-slate-300">
                <p className="font-medium">{evidence.frames.frame2.description}</p>
                <div className="mt-1 text-[10px] text-slate-500 font-mono">
                  Trạng thái: {evidence.frames.frame2.lightState}
                </div>
              </div>
            </div>

            {/* Frame 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col print:border-gray-300">
              <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="font-bold text-white">ẢNH 3: TÂM GIAO LỘ</span>
                <span className="text-red-400">{evidence.frames.frame3.timeOffset}</span>
              </div>
              {/* Graphic representation of Frame 3 */}
              <div className="h-44 bg-slate-950 relative flex items-center justify-center p-3 border-b border-slate-800">
                <div className="w-full h-full border border-dashed border-slate-800 rounded flex flex-col justify-between p-2 relative overflow-hidden">
                  <div className="flex justify-between items-start text-[10px] font-mono text-slate-400 z-10">
                    <span className="bg-red-950/80 text-red-400 px-1 rounded border border-red-800">
                      ● ĐÈN ĐỎ SÁNG
                    </span>
                    <span>TÂM GIAO LỘ</span>
                  </div>
                  {/* Zebra crosswalk behind */}
                  <div className="absolute left-4 top-0 bottom-0 flex gap-1 opacity-40">
                    {[1,2,3,4].map(n => <div key={n} className="w-1.5 h-full bg-white" />)}
                  </div>
                  {/* Vehicle deep inside */}
                  <div className="w-24 h-12 bg-blue-600/80 rounded border border-blue-400 flex items-center justify-center text-[10px] font-bold text-white font-mono shadow-md z-10 mx-auto">
                    {evidence.vehiclePlate}
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 z-10">
                    Vị trí: {evidence.frames.frame3.vehiclePos}
                  </div>
                </div>
              </div>
              <div className="p-3 text-[11px] text-slate-300">
                <p className="font-medium">{evidence.frames.frame3.description}</p>
                <div className="mt-1 text-[10px] text-slate-500 font-mono">
                  Trạng thái: {evidence.frames.frame3.lightState}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metadata & Legal Sanctions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Telemetry info */}
          <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800 text-xs">
            <h5 className="font-bold text-slate-300 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-800">
              Thông Tin Kỹ Thuật & Giám Sát
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Biển kiểm soát:</span>
                <span className="font-mono font-bold text-white">{evidence.vehiclePlate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Loại phương tiện:</span>
                <span className="font-medium text-slate-200">
                  {evidence.vehicleType === 'car' ? 'Ô tô con' : evidence.vehicleType === 'truck' ? 'Xe tải' : evidence.vehicleType === 'ambulance' ? 'Xe cứu thương ưu tiên' : 'Mô tô / Xe máy'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Thời gian vi phạm:</span>
                <span className="font-mono text-slate-200">{evidence.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Địa điểm ghi nhận:</span>
                <span className="text-slate-200 text-right">{evidence.location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Tốc độ đo bằng Radar:</span>
                <span className="font-mono font-bold text-amber-400">{evidence.speedAtViolation} km/h</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Thời gian đèn đỏ đã bật:</span>
                <span className="font-mono text-red-400 font-bold">{evidence.redLightDurationAtViolation}s</span>
              </div>
            </div>
          </div>

          {/* Legal references & Penalty */}
          <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800 text-xs">
            <h5 className="font-bold text-slate-300 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-800">
              Căn Cứ Pháp Lý & Mức Xử Phạt
            </h5>
            <div className="space-y-2.5">
              <div>
                <span className="text-slate-400 block mb-0.5">Điều khoản áp dụng:</span>
                <span className="text-slate-200 font-medium leading-relaxed block">
                  {evidence.legalRef}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800/50">
                <span className="text-slate-400 block mb-0.5">Số tiền xử phạt:</span>
                <span className={`text-base font-bold font-mono ${isExempt ? 'text-emerald-400' : 'text-red-400'}`}>
                  {evidence.fineAmount}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800/50">
                <span className="text-slate-400 block mb-0.5">Hình thức phạt bổ sung:</span>
                <span className="text-slate-200 font-medium">
                  {evidence.licensePenalty}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Signature & Tamper-proof Hash */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <span className="text-slate-500">Mã băm bảo vệ tính toàn vẹn (Anti-tamper Hash): </span>
            <span className="text-blue-400 font-bold break-all">{evidence.hash}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>Đã ký số điện tử TSA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
