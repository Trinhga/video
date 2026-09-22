import React, { useState } from 'react';
import { 
  Camera, 
  ShieldAlert, 
  Mic, 
  CheckSquare, 
  Square, 
  Video, 
  Music, 
  Lightbulb, 
  FileCheck 
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: 'equipment' | 'safety' | 'props' | 'post';
  title: string;
  description: string;
  completed: boolean;
}

export const ProductionChecklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>([
    // Equipment
    {
      id: 'eq-1',
      category: 'equipment',
      title: 'Thiết bị ghi hình chính (Camera / Smartphone 4K)',
      description: 'Máy ảnh hoặc điện thoại quay tối thiểu 4K 60fps để có thể làm hiệu ứng Slow-motion lúc phanh xe hoặc đèn chuyển đỏ.',
      completed: true,
    },
    {
      id: 'eq-2',
      category: 'equipment',
      title: 'Camera hành trình (Action Cam) gắn mũ bảo hiểm / Kính lái',
      description: 'Dùng GoPro hoặc Insta360 quay góc nhìn người lái (POV) tạo cảm giác chân thực và dồn dập cho người xem.',
      completed: true,
    },
    {
      id: 'eq-3',
      category: 'equipment',
      title: 'Micro không dây cài áo (Wireless Lavalier Mic)',
      description: 'Thu âm thanh đối thoại diễn viên rõ ràng giữa tiếng ồn phố thị (loại bỏ tiếng gió rít).',
      completed: false,
    },
    {
      id: 'eq-4',
      category: 'equipment',
      title: 'Gimbal chống rung cầm tay',
      description: 'Đảm bảo các cú máy lia theo xe chạy mượt mà, không bị rung lắc làm giảm chất lượng video.',
      completed: false,
    },

    // Safety & Set Stunt
    {
      id: 'sf-1',
      category: 'safety',
      title: 'Tuyệt đối KHÔNG thực hiện vượt đèn đỏ thật trên đường công cộng',
      description: 'Nguy hiểm tính mạng và vi phạm pháp luật! Quay cảnh xe dừng và xe rẽ ở các khung giờ khác nhau, sau đó ghép nối trong hậu kỳ.',
      completed: true,
    },
    {
      id: 'sf-2',
      category: 'safety',
      title: 'Kỹ thuật quay cảnh phanh gấp an toàn (Film Stunt)',
      description: 'Xe chạy tốc độ rất chậm (15 - 20 km/h) rồi phanh. Khi dựng hậu kỳ tăng tốc video (Speed ramp) lên 200% kết hợp âm thanh tiếng phanh chát chúa để tạo cảm giác phóng nhanh.',
      completed: true,
    },
    {
      id: 'sf-3',
      category: 'safety',
      title: 'Góc máy ép phối cảnh (Forced Perspective)',
      description: 'Đặt ống kính Tele ở khoảng cách xa để làm hai xe trông như suýt chạm vào nhau, trong khi thực tế hai xe cách nhau tới 5 - 10 mét an toàn.',
      completed: false,
    },

    // Props
    {
      id: 'pr-1',
      category: 'props',
      title: 'Trang phục diễn viên & Mũ bảo hiểm',
      description: 'Trang phục công sở vội vã, áo chống nắng, mũ bảo hiểm đôi, trang phục Cảnh sát Giao thông (nếu có cảnh tại chốt).',
      completed: false,
    },
    {
      id: 'pr-2',
      category: 'props',
      title: 'Màn hình điện thoại hiển thị app phạt nguội VNeID',
      description: 'Chụp ảnh màn hình sẵn giao diện thông báo vi phạm để diễn viên cầm tương tác.',
      completed: false,
    },

    // Post-Production
    {
      id: 'po-1',
      category: 'post',
      title: 'Thư viện tiếng động (SFX Library)',
      description: 'Tải sẵn: Tiếng phanh xe rít lốp (tires screech), tiếng còi ô tô gấp, tiếng tim đập hồi hộp, tiếng máy chụp ảnh phạt nguội.',
      completed: true,
    },
    {
      id: 'po-2',
      category: 'post',
      title: 'Nhạc nền chuyển biến cảm xúc (BGM)',
      description: 'Đoạn đầu nhạc căng thẳng dồn dập -> đoạn phanh im bặt (dramatic drop) -> đoạn kết thúc nhạc sâu lắng nhân văn.',
      completed: false,
    },
  ]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it))
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              Checklist Chuẩn Bị Sản Xuất Video Cảnh Báo Giao Thông
            </h2>
            <p className="text-xs text-slate-400">
              Cẩm nang thực chiến dành cho đạo diễn, quay phim và nhóm sáng tạo nội dung
            </p>
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-lg text-xs text-amber-200 flex items-start gap-2.5 mb-6">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 block mb-0.5">
              LƯU Ý AN TOÀN TUYỆT ĐỐI KHI QUAY PHIM:
            </strong>
            <span>
              Tuyệt đối <strong>không cho diễn viên vượt đèn đỏ thật</strong> hay thực hiện các cú phanh nguy hiểm trên đường phố công cộng. Toàn bộ các cảnh suýt va chạm trong điện ảnh đều được dàn dựng ở tốc độ chậm (15km/h) hoặc quay trên đường nội bộ/bãi tập, sau đó xử lý tăng tốc (speed ramping) và lồng ghép âm thanh trong hậu kỳ.
            </span>
          </div>
        </div>

        {/* Checklist Categories */}
        <div className="space-y-6">
          {/* Equipment */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              <span>1. Thiết Bị Ghi Hình & Âm Thanh (Equipment):</span>
            </h3>
            <div className="space-y-2">
              {items
                .filter((i) => i.category === 'equipment')
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3 cursor-pointer hover:border-slate-700 transition-colors"
                  >
                    <button className="mt-0.5 text-blue-400">
                      {item.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          item.completed ? 'text-slate-300 line-through' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Safety & Film Stunts */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              <span>2. Kỹ Thuật Dàn Dựng Cảnh Quay An Toàn (Safety & Stunt Direction):</span>
            </h3>
            <div className="space-y-2">
              {items
                .filter((i) => i.category === 'safety')
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3 cursor-pointer hover:border-slate-700 transition-colors"
                  >
                    <button className="mt-0.5 text-amber-400">
                      {item.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          item.completed ? 'text-slate-300 line-through' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Props & Post Production */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-1.5">
                <Video className="w-4 h-4" />
                <span>3. Đạo Cụ & Bối Cảnh (Props):</span>
              </h3>
              <div className="space-y-2">
                {items
                  .filter((i) => i.category === 'props')
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3 cursor-pointer hover:border-slate-700 transition-colors"
                    >
                      <button className="mt-0.5 text-purple-400">
                        {item.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                      <div>
                        <div
                          className={`text-xs font-bold ${
                            item.completed ? 'text-slate-300 line-through' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-3 flex items-center gap-1.5">
                <Music className="w-4 h-4" />
                <span>4. Hậu Kỳ & Âm Thanh (Post-Production):</span>
              </h3>
              <div className="space-y-2">
                {items
                  .filter((i) => i.category === 'post')
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3 cursor-pointer hover:border-slate-700 transition-colors"
                    >
                      <button className="mt-0.5 text-pink-400">
                        {item.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                      <div>
                        <div
                          className={`text-xs font-bold ${
                            item.completed ? 'text-slate-300 line-through' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
