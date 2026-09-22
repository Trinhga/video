import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Download, 
  Check, 
  Copy, 
  ExternalLink, 
  X, 
  Laptop, 
  Terminal, 
  Sparkles,
  ShieldCheck,
  Tv,
  ArrowRight
} from 'lucide-react';

interface DesktopExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopExportModal: React.FC<DesktopExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'electron'>('pwa');

  useEffect(() => {
    // Check if already running as standalone desktop app
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // In iframe or browser without prompt, instruct opening in new tab
      window.open(window.location.href, '_blank');
    }
  };

  const electronCommand = `npm install electron electron-builder --save-dev\nnpx electron-builder --win --mac`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(electronCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Xuất Bản & Cài Đặt Ứng Dụng Desktop</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Windows • Mac • Linux
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Chạy ứng dụng trong cửa sổ độc lập, mượt mà và tối ưu cho trường quay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between 1-Click PWA and Native Installer (.exe/.dmg) */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'pwa'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Cách 1: Cài Đặt Desktop App Tức Thì (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('electron')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'electron'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Cách 2: Đóng Gói File .EXE / .DMG (Electron)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto text-xs text-slate-300 flex flex-col gap-4">
          {activeTab === 'pwa' ? (
            <div className="flex flex-col gap-4">
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Cài đặt ứng dụng trực tiếp từ trình duyệt</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Ứng dụng sẽ được cài thẳng vào máy tính của bạn như một phần mềm độc lập, có biểu tượng icon riêng trên Desktop, Start Menu và thanh Taskbar.
                  </p>
                </div>

                <button
                  onClick={handleInstallPWA}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>{deferredPrompt ? 'Cài Đặt Ngay' : 'Mở Cửa Sổ Riêng / Cài Đặt'}</span>
                </button>
              </div>

              {/* Instructions Steps */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Hướng Dẫn Cài Đặt Nhanh Trong 3 Bước:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                    <span className="h-6 w-6 rounded bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <strong className="text-white text-xs">Mở tab độc lập</strong>
                    <span className="text-[11px] text-slate-400">
                      Nếu đang xem trong khung iFrame, bấm nút mở sang tab mới ở góc trên.
                    </span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                    <span className="h-6 w-6 rounded bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <strong className="text-white text-xs">Bấm biểu tượng Cài đặt</strong>
                    <span className="text-[11px] text-slate-400">
                      Trên thanh địa chỉ Chrome / Edge, bấm biểu tượng màn hình máy tính 🖥️ <strong>"Cài đặt / Install App"</strong>.
                    </span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                    <span className="h-6 w-6 rounded bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <strong className="text-white text-xs">Khởi động từ Desktop</strong>
                    <span className="text-[11px] text-slate-400">
                      Icon phần mềm xuất hiện trên Desktop & Taskbar, khởi động không cần gõ URL!
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-400 text-[11px]">
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Không cần cài thêm NodeJS hay phần mềm thứ 3</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <Tv className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Cửa sổ máy nhắc chữ Teleprompter tràn viền</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <Monitor className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Tự động cập nhật tính năng mới nhất</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Đóng Gói File Cài Đặt Độc Lập (.EXE / .DMG)</span>
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Dự án đã được tích hợp sẵn tệp cấu hình <code>electron-main.cjs</code>. Bạn có thể xuất mã nguồn về máy tính và đóng gói thành phần mềm cài đặt riêng cho Windows hoặc macOS.
                </p>

                <div className="flex flex-col gap-2">
                  <span className="text-slate-300 font-bold text-xs">
                    Bước 1: Tải mã nguồn về máy tính
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Bấm vào biểu tượng <strong>Cài đặt (Settings)</strong> trên thanh công cụ góc trên của AI Studio ➔ Chọn <strong>Export to ZIP</strong> (hoặc Push to GitHub).
                  </p>

                  <span className="text-slate-300 font-bold text-xs mt-2">
                    Bước 2: Giải nén và chạy lệnh đóng gói trong Terminal / CMD:
                  </span>
                  <div className="relative bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-[11px] text-emerald-300">
                    <pre className="whitespace-pre-wrap">{electronCommand}</pre>
                    <button
                      onClick={handleCopyCommand}
                      className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1 transition-colors"
                    >
                      {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCmd ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  <span className="text-slate-300 font-bold text-xs mt-2">
                    Bước 3: Nhận file cài đặt Desktop
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Sau khi lệnh hoàn tất, tệp cài đặt <code>Traffic-Studio-Setup.exe</code> (trên Windows) hoặc <code>.dmg</code> (trên Mac) sẽ nằm trong thư mục <code>dist/</code>, sẵn sàng cài đặt trên mọi máy tính!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Khuyên dùng: <strong>Cách 1 (PWA)</strong> nhanh nhất, không cần cài thêm công cụ lập trình!
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
