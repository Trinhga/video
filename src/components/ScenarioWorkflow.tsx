import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Radio, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Bell, 
  Clock, 
  Server, 
  Send, 
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

export const ScenarioWorkflow: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(1);

  const stages = [
    {
      id: 1,
      name: 'Giai Đoạn 1: Giám Sát Từ Xa & Quét Đa Cảm Biến',
      shortTitle: '1. Giám sát từ xa',
      zone: 'Vùng tiếp cận (35m - 60m trước vạch)',
      sensors: 'Radar 77GHz + Camera AI góc rộng + Cảm biến áp điện / Vòng từ',
      summary: 'Phát hiện phương tiện đang tiến vào giao lộ, đo vận tốc tức thời, gia tốc và khoảng cách đến vạch dừng số 7.1.',
      details: [
        'Radar 77GHz bám quét quỹ đạo xe liên tục với tần số quét 20Hz, đo chính xác vận tốc đến ±0.1 km/h.',
        'Camera góc rộng AI phát hiện đối tượng (Object Detection), phân loại phương tiện (Ô tô con, Xe máy, Xe tải, Xe buýt, Xe ưu tiên).',
        'Camera ANPR đọc trước biển số xe với độ chính xác >99% ngay từ cự ly 50 mét.',
      ],
      icon: Radio,
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      id: 2,
      name: 'Giai Đoạn 2: Đánh Giá Nguy Cơ & Dự Báo Vi Phạm (AI Prediction)',
      shortTitle: '2. Dự báo vi phạm',
      zone: 'Vùng tiến thoái lưỡng nan (Dilemma Zone)',
      sensors: 'Bộ tính toán biên (Edge AI Box / IPC công nghiệp) + Tín hiệu tủ đèn',
      summary: 'Thuật toán đối chiếu vận tốc xe với thời gian đếm ngược của pha đèn (Vàng -> Đỏ) để phát hiện xe có nguy cơ vượt đèn đỏ.',
      details: [
        'Tính toán thời gian dự kiến tới vạch dừng (Time-to-Collision / Time-to-Stopline: TTC = d / v).',
        'Tính toán gia tốc phanh cần thiết: a_req = v² / (2 * d). Nếu a_req > 3.5 m/s² (vượt ngưỡng phanh thoải mái) và đèn sắp chuyển đỏ, hệ thống kích hoạt chế độ cảnh báo khẩn.',
        'Dự báo xác suất vượt đèn đỏ của phương tiện theo thời gian thực.',
      ],
      icon: Cpu,
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      id: 3,
      name: 'Giai Đoạn 3: Kích Hoạt Cảnh Báo Sớm Đa Kênh (Pre-Warning)',
      shortTitle: '3. Cảnh báo sớm',
      zone: 'Trước vạch dừng 20m - 45m',
      sensors: 'Bảng quang báo LED VMS + Loa thông minh giao lộ + Sóng C-V2X / DSRC',
      summary: 'Cảnh báo trực tiếp cho tài xế trước khi vi phạm xảy ra, giúp lái xe kịp thời giảm tốc và dừng an toàn.',
      details: [
        'Bảng LED VMS trên giá long môn hiển thị biển số xe kèm cảnh báo: "XE [BIỂN SỐ] GIẢM TỐC - ĐÈN ĐỎ!"',
        'Gửi gói tin cảnh báo V2X (MapData / SPaT - Signal Phase and Timing) trực tiếp lên màn hình Taplo / HUD của xe thông minh.',
        'Loa phát thanh định hướng tại nút giao phát âm thanh cảnh báo nếu phát hiện người điều khiển không có dấu hiệu giảm tốc.',
      ],
      icon: Bell,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      id: 4,
      name: 'Giai Đoạn 4: Đồng Bộ Pha Đèn & Độ Trễ Pháp Lý (Grace Period)',
      shortTitle: '4. Đồng bộ tủ đèn',
      zone: 'Vạch dừng số 7.1',
      sensors: 'Module I/O kết nối trực tiếp Tủ điều khiển đèn tín hiệu (Traffic Controller)',
      summary: 'Khóa pha millisecond và áp dụng thời gian ân hạn tiêu chuẩn để tránh phạt nhầm.',
      details: [
        'Đồng bộ xung nhịp phần cứng với rơ-le đèn đỏ tủ điều khiển (độ trễ < 5ms).',
        'Áp dụng Thời gian ân hạn tiêu chuẩn (Grace Period = 0.3s - 0.5s): Nếu xe vượt qua vạch dừng trong khoảng 0.3s đầu tiên sau khi đèn đỏ bật, hệ thống sẽ kiểm tra xem xe có ở pha đèn vàng trước đó không nhằm đảm bảo tính công bằng pháp lý.',
      ],
      icon: Clock,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 5,
      name: 'Giai Đoạn 5: Bẫy Cảm Biến Ảo & Đóng Gói 3 Khung Hình Bằng Chứng',
      shortTitle: '5. Thu thập bằng chứng 3 ảnh',
      zone: 'Vạch dừng 7.1 -> Vạch đi bộ -> Tâm ngã tư',
      sensors: 'Camera ITS 4K 60fps + Cảm biến vạch ảo Virtual Loop',
      summary: 'Tự động chụp bộ 3 ảnh bằng chứng pháp lý chuẩn Bộ Công An + Đoạn video 10 giây (5s trước và 5s sau vi phạm).',
      details: [
        'Ảnh 1 (Trước vạch): Toàn cảnh xe chưa qua vạch dừng số 7.1, đèn tín hiệu rõ màu đỏ.',
        'Ảnh 2 (Đè vạch): Bánh xe hoặc thân xe đè/vượt qua vạch dừng, phóng to biển kiểm soát rõ nét.',
        'Ảnh 3 (Trong giao lộ): Xe đã di chuyển sâu vào trong lòng giao lộ trong khi pha đèn đỏ vẫn đang sáng.',
        'Ghi nhận video 10 giây định dạng MP4 4K, chèn Watermark: Thời gian (ms), Tốc độ radar, Tọa độ GPS ngã tư, Mã camera.',
        'Tạo mã băm bảo mật SHA-256 chống chỉnh sửa giả mạo bằng chứng số.',
      ],
      icon: Camera,
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    {
      id: 6,
      name: 'Giai Đoạn 6: Đối Chiếu Dữ Liệu & Sàng Lọc Ngoại Lệ (AI + CSGT)',
      shortTitle: '6. Sàng lọc & Xác thực',
      zone: 'Máy chủ Trung tâm Chỉ huy Giao thông (TOC)',
      sensors: 'Hệ thống CSDL Đăng kiểm & Quản lý GPLX + AI lọc xe ưu tiên',
      summary: 'Tự động sàng lọc trường hợp xe ưu tiên (Cứu thương, Cứu hỏa) và chuyển hồ sơ cho cán bộ CSGT thẩm định.',
      details: [
        'AI nhận diện âm thanh còi hú (Siren), đèn quay khẩn cấp và biển số xe cứu thương/công an để tự động miễn trừ (Dismissed).',
        'Phân biệt rõ: Lỗi vượt đèn đỏ (phạt nặng) vs Lỗi đè vạch dừng (phạt nhẹ).',
        'Cán bộ Cảnh sát Giao thông thẩm định lần cuối trước khi ký số ban hành biên bản (Human-in-the-loop).',
      ],
      icon: Server,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      id: 7,
      name: 'Giai Đoạn 7: Ban Hành Thông Báo Phạt Nguội & Cổng Dịch Vụ Công',
      shortTitle: '7. Thông báo & Nộp phạt',
      zone: 'Ứng dụng VNeID / Cổng DVC Quốc Gia / Tin nhắn SMS / Bưu chính',
      sensors: 'API Gateway Cổng Dịch vụ công Quốc gia & Cục Cảnh sát Giao thông',
      summary: 'Gửi thông báo phạt nguội đến chủ phương tiện trong vòng 24 - 48 giờ.',
      details: [
        'Đẩy thông báo vi phạm lên ứng dụng Định danh điện tử VNeID và Website Tra cứu phạt nguội Cục CSGT (csgt.vn).',
        'Gửi tin nhắn SMS / Zalo OA / Giấy báo phạt gửi theo đường bưu điện tới địa chỉ đăng ký xe.',
        'Hỗ trợ chủ xe nộp phạt trực tuyến và nhận lại biên lai điện tử qua Cổng Dịch vụ công Quốc gia.',
      ],
      icon: Send,
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    },
  ];

  const currentStageData = stages.find((s) => s.id === selectedStage) || stages[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Intro Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
              QUY TRÌNH CHUẨN HOÁ HỆ THỐNG ITS
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              Kịch Bản 7 Giai Đoạn Cảnh Báo Sớm & Xử Lý Vi Phạm Vượt Đèn Đỏ
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Hệ thống kết hợp công nghệ Cảnh báo sớm chủ động (Proactive Collision & Violation Prevention) 
              với Quy trình bằng chứng số 3 khung hình chuẩn Cục Cảnh sát Giao thông - Bộ Công An.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 shrink-0">
            <Layers className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-xs text-slate-400">Tiêu chuẩn kỹ thuật:</div>
              <div className="text-xs font-bold text-white">QCVN 41:2019 & NĐ 100/123</div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Interactive Step Pipeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Sơ Đồ Tuyến Tính 7 Bước (Nhấn vào từng bước để xem chi tiết kỹ thuật):
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stages.map((stg) => {
            const Icon = stg.icon;
            const isCurrent = stg.id === selectedStage;
            return (
              <button
                key={stg.id}
                onClick={() => setSelectedStage(stg.id)}
                className={`p-3 rounded-lg text-left transition-all border flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-500/30'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                    isCurrent ? 'bg-white text-blue-700' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {stg.id}
                  </span>
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div className="text-xs font-bold line-clamp-2 leading-snug">
                  {stg.shortTitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deep-dive Card for the selected stage */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <currentStageData.icon className="w-6 h-6" />
            </div>
            <div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${currentStageData.badgeColor} mb-1`}>
                GIAI ĐOẠN {currentStageData.id} / 7
              </span>
              <h3 className="text-lg font-bold text-white">
                {currentStageData.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Vùng thực thi: <strong className="text-slate-200">{currentStageData.zone}</strong>
              </p>
            </div>
          </div>

          <div className="bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[11px]">Thiết bị & Cảm biến áp dụng:</span>
            <span className="text-slate-200 font-medium">{currentStageData.sensors}</span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 mb-4 text-xs sm:text-sm text-slate-300">
          <strong className="text-blue-400">Mục tiêu giai đoạn: </strong>
          {currentStageData.summary}
        </div>

        {/* Detail points */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Quy chuẩn kỹ thuật chi tiết:
          </h4>
          {currentStageData.details.map((detail, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Matrix Table: Red Light vs Stop Line Creep vs Emergency Vehicle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>Bảng Phân Biệt Các Hành Vi Vi Phạm & Chế Tài Xử Lý (QCVN 41 & NĐ 100/123)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Hệ thống AI phân định chính xác hành vi để tránh phạt oan sai cho người dân
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono">
                <th className="p-3">Hành vi / Tình huống</th>
                <th className="p-3">Đặc điểm nhận diện AI</th>
                <th className="p-3">Kết luận hệ thống</th>
                <th className="p-3">Mức phạt Ô tô</th>
                <th className="p-3">Mức phạt Xe máy</th>
                <th className="p-3">Tước GPLX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {/* Row 1: Vượt đèn đỏ trọn vẹn */}
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-red-400">
                  Vượt đèn đỏ hoàn toàn
                </td>
                <td className="p-3">
                  Xe vượt qua vạch dừng 7.1 khi đèn đỏ và tiếp tục di chuyển qua tâm giao lộ
                </td>
                <td className="p-3 font-semibold text-red-300">
                  Vi phạm Khoản 5 Điều 5 (Ô tô) / Khoản 4 Điều 6 (Mô tô)
                </td>
                <td className="p-3 font-mono font-bold text-white">4.000.000 - 6.000.000 đ</td>
                <td className="p-3 font-mono font-bold text-white">800.000 - 1.000.000 đ</td>
                <td className="p-3 text-red-400 font-medium">1 - 3 tháng</td>
              </tr>

              {/* Row 2: Đè vạch dừng / Dừng quá vạch */}
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-amber-400">
                  Dừng đè / quá vạch dừng 7.1
                </td>
                <td className="p-3">
                  Bánh xe đè lên vạch dừng nhưng xe dừng hẳn lại, không tiến vào giao lộ
                </td>
                <td className="p-3 font-semibold text-amber-300">
                  Lỗi không chấp hành vạch kẻ đường (Không phải vượt đèn đỏ)
                </td>
                <td className="p-3 font-mono text-slate-200">300.000 - 400.000 đ</td>
                <td className="p-3 font-mono text-slate-200">100.000 - 200.000 đ</td>
                <td className="p-3 text-emerald-400 font-medium">Không tước</td>
              </tr>

              {/* Row 3: Xe ưu tiên */}
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-blue-400">
                  Xe ưu tiên (Cấp cứu, Cứu hỏa)
                </td>
                <td className="p-3">
                  Có còi siren, đèn quay chớp, biển số xe chuyên dụng cấp cứu
                </td>
                <td className="p-3 font-semibold text-blue-300">
                  Miễn trừ theo Điều 22 Luật GTĐB (Hợp pháp)
                </td>
                <td className="p-3 font-mono text-emerald-400 font-bold">0 đ (Miễn trừ)</td>
                <td className="p-3 font-mono text-emerald-400 font-bold">0 đ (Miễn trừ)</td>
                <td className="p-3 text-emerald-400 font-medium">Không phạt</td>
              </tr>

              {/* Row 4: Nhường đường xe cấp cứu */}
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-emerald-400">
                  Vượt đèn đỏ để nhường xe cấp cứu
                </td>
                <td className="p-3">
                  Camera ghi nhận xe cấp cứu hú còi phía sau và xe phía trước rẽ để tạo khoảng trống
                </td>
                <td className="p-3 font-semibold text-emerald-300">
                  Tình thế cấp thiết (Điều 11 Luật Xử lý vi phạm hành chính)
                </td>
                <td className="p-3 font-mono text-emerald-400 font-bold">Hủy bỏ biên bản phạt</td>
                <td className="p-3 font-mono text-emerald-400 font-bold">Hủy bỏ biên bản phạt</td>
                <td className="p-3 text-emerald-400 font-medium">Không phạt</td>
              </tr>

              {/* Row 5: Qua vạch khi đèn vàng */}
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-purple-400">
                  Đã qua vạch khi đèn còn vàng
                </td>
                <td className="p-3">
                  Bánh trước đã qua vạch 7.1 trước thời điểm rơ-le đèn đỏ kích hoạt
                </td>
                <td className="p-3 font-semibold text-purple-300">
                  Được phép đi tiếp theo QCVN 41:2019
                </td>
                <td className="p-3 font-mono text-emerald-400 font-bold">Không vi phạm</td>
                <td className="p-3 font-mono text-emerald-400 font-bold">Không vi phạm</td>
                <td className="p-3 text-emerald-400 font-medium">Không phạt</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
