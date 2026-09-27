import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  X, 
  Zap, 
  Eye, 
  EyeOff, 
  AlertCircle,
  HelpCircle,
  Loader2,
  CheckCircle2,
  Film
} from 'lucide-react';

export interface VideoApiKeysConfig {
  // Kling AI Developer API (https://kling.ai/dev/api-key)
  klingAccessKey: string;
  klingSecretKey: string;
  klingApiKey: string;

  // Fal.ai proxy
  falKey: string;

  // RunwayML
  runwayKey: string;

  // Luma Labs
  lumaKey: string;

  // Google Veo
  geminiKey: string;

  // Kling AI Model
  klingModel?: string;

  defaultProvider: 'kling_official' | 'fal_kling' | 'fal_minimax' | 'runway_gen3' | 'luma_dream' | 'gemini_veo' | 'simulation';
}

const STORAGE_KEY = 'ai_video_api_keys_config_v2';
const LEGACY_STORAGE_KEY = 'ai_video_api_keys_config_v1';

export function getSavedVideoApiKeys(): VideoApiKeysConfig {
  const defaults: VideoApiKeysConfig = {
    klingAccessKey: '',
    klingSecretKey: '',
    klingApiKey: '',
    klingModel: 'kling-v2-6',
    falKey: '',
    runwayKey: '',
    lumaKey: '',
    geminiKey: '',
    defaultProvider: 'kling_official',
  };

  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged: VideoApiKeysConfig = {
        ...defaults,
        ...parsed,
        klingModel: parsed.klingModel || 'kling-v2-6',
        defaultProvider: parsed.defaultProvider || 'kling_official',
      };
      // Auto-migrate: If user previously entered key into klingAccessKey and had no secret key, sync to klingApiKey
      if (merged.klingAccessKey && !merged.klingSecretKey && !merged.klingApiKey) {
        merged.klingApiKey = merged.klingAccessKey;
      }
      if (merged.klingApiKey && !merged.klingAccessKey) {
        merged.klingAccessKey = merged.klingApiKey;
      }
      return merged;
    }
  } catch (e) {
    console.error('Error loading video API keys:', e);
  }
  return defaults;
}

export function saveVideoApiKeys(config: VideoApiKeysConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving video API keys:', e);
  }
}

interface VideoApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: VideoApiKeysConfig) => void;
}

export const VideoApiKeyModal: React.FC<VideoApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState<VideoApiKeysConfig>(getSavedVideoApiKeys());
  const [klingKeyType, setKlingKeyType] = useState<'single' | 'ak_sk'>('single');
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [serverProviders, setServerProviders] = useState<{ [key: string]: boolean }>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Kling Connection Test State
  const [klingTestStatus, setKlingTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [klingTestMessage, setKlingTestMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedVideoApiKeys();
      setConfig(saved);
      if (saved.klingSecretKey && saved.klingAccessKey) {
        setKlingKeyType('ak_sk');
      } else {
        setKlingKeyType('single');
      }
      setKlingTestStatus('idle');
      setKlingTestMessage('');

      // Check server configured keys
      fetch('/api/video/providers')
        .then((r) => r.json())
        .then((data) => {
          if (data?.providers) {
            const map: { [key: string]: boolean } = {};
            Object.keys(data.providers).forEach((k) => {
              map[k] = !!data.providers[k].configured;
            });
            setServerProviders(map);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Smart paste handler: if user pastes AccessKey:SecretKey in either field, auto-split!
  const handleKlingAccessKeyChange = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.includes(':') || trimmed.includes('/')) {
      const parts = trimmed.split(/[:/]/);
      if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
        setConfig((prev) => ({
          ...prev,
          klingAccessKey: parts[0].trim(),
          klingSecretKey: parts[1].trim(),
        }));
        return;
      }
    }
    setConfig((prev) => ({ ...prev, klingAccessKey: val }));
  };

  const handleTestKlingConnection = async () => {
    setKlingTestStatus('testing');
    setKlingTestMessage('Đang kết nối và kiểm tra API Key với máy chủ Kling AI (api.klingai.com)...');

    try {
      const keyToSend = config.klingApiKey || (!config.klingSecretKey ? config.klingAccessKey : '');
      const res = await fetch('/api/video/kling/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessKey: config.klingAccessKey,
          secretKey: config.klingSecretKey,
          apiKey: keyToSend,
        }),
      });

      const data = await res.json();
      if (data?.success) {
        setKlingTestStatus('success');
        setKlingTestMessage(data.message || 'Xác thực thành công! Khóa API Kling AI chính hãng hoạt động tốt và đã sẵn sàng tạo video.');
      } else {
        setKlingTestStatus('error');
        setKlingTestMessage(data?.error || 'Xác thực thất bại. Vui lòng kiểm tra lại dãy mã API Key đã dán.');
      }
    } catch (err: any) {
      setKlingTestStatus('error');
      setKlingTestMessage(`Lỗi mạng khi kiểm tra kết nối: ${err?.message || 'Không thể kết nối máy chủ'}`);
    }
  };

  const handleSave = () => {
    const toSave: VideoApiKeysConfig = {
      ...config,
      klingSecretKey: klingKeyType === 'single' ? '' : config.klingSecretKey,
      klingAccessKey: config.klingAccessKey || config.klingApiKey,
      klingApiKey: config.klingApiKey || config.klingAccessKey,
      klingModel: config.klingModel || 'kling-v2-6',
    };
    saveVideoApiKeys(toSave);
    setSavedSuccess(true);
    if (onSave) onSave(toSave);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Cài Đặt API KEY Tạo Video 8 Giây AI</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  Hỗ Trợ Kling.ai Chính Hãng
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Gắn API Key của Kling AI, Veo, Runway, Luma để bấm tạo video trực tiếp tại mỗi phân đoạn 8s
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Quick Notice */}
          <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-slate-300 leading-relaxed text-[11px]">
              <strong className="text-white block mb-0.5">Bảo mật thông tin API Key:</strong>
              Khóa API của bạn được lưu an toàn trên trình duyệt của bạn (Local Storage) và chỉ dùng để gửi yêu cầu kết xuất video 8s. Hệ thống tự động ký mã xác thực JWT HS256 chuẩn cho Kling AI.
            </div>
          </div>

          {/* Engine Selector */}
          <div>
            <label className="font-bold text-slate-200 block mb-1.5 text-xs">
              Mô hình AI Video mặc định khi bấm nút Tạo Video 8s:
            </label>
            <select
              value={config.defaultProvider}
              onChange={(e) => setConfig({ ...config, defaultProvider: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
            >
              <option value="kling_official">✨ Kling AI Chính Hãng (Khuyên dùng - https://kling.ai/dev/api-key)</option>
              <option value="gemini_veo">🌟 Google Veo (Gemini AI Video - Google DeepMind)</option>
              <option value="fal_kling">⚡ Kling 1.5 HD (qua cổng trung gian Fal.ai)</option>
              <option value="fal_minimax">🎥 Minimax Hailuo Video-01 (qua cổng Fal.ai)</option>
              <option value="runway_gen3">🎬 Runway Gen-3 Alpha (Chất lượng Hollywood - RunwayML)</option>
              <option value="luma_dream">🌌 Luma Dream Machine (Ray - Luma Labs)</option>
              <option value="simulation">🧪 Chế độ Render Thử Nghiệm (Cinematic Simulation - Xem ngay)</option>
            </select>
          </div>

          {/* Provider 1: Kling AI Official Developer API (https://kling.ai/dev/api-key) */}
          <div className="bg-slate-950 p-4 rounded-xl border-2 border-amber-500/60 shadow-lg shadow-amber-900/10 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>1. Kling AI Developer API Key (Chính Hãng kling.ai)</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Khuyên Dùng • Kuaishou
                </span>
                {serverProviders.kling_official && (
                  <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Đã có trên Server
                  </span>
                )}
              </div>
              <a
                href="https://kling.ai/dev/api-key"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Mở trang lấy Key: kling.ai/dev/api-key</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Direct Reassurance Banner for users with single key */}
            <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-600/40 flex flex-col gap-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Bạn chỉ có 1 dãy mã API Key (không có Secret Key / SK)?</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-5">
                Hoàn toàn chính xác! Giao diện mới tại <strong className="text-white">kling.ai/dev/api-key</strong> chỉ cấp <strong className="text-amber-300">1 chuỗi API Key duy nhất</strong> (Bearer Token). Bạn <strong>không cần tìm SK</strong>, chỉ cần dán dãy mã đó vào ô bên dưới là xong!
              </p>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setKlingKeyType('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  klingKeyType === 'single'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                🔑 1 Chuỗi API Key Duy Nhất (Chuẩn mới kling.ai - Khuyên dùng)
              </button>
              <button
                type="button"
                onClick={() => setKlingKeyType('ak_sk')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  klingKeyType === 'ak_sk'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                ⚙️ Cặp mã cũ: Access Key (AK) & Secret Key (SK)
              </button>
            </div>

            {/* Mode 1: Single API Key (Default & Recommended) */}
            {klingKeyType === 'single' && (
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-200 block">
                  Dãy mã Kling API Key của bạn (sao chép từ cột API Key tại kling.ai/dev/api-key):
                </label>
                <div className="relative">
                  <input
                    type={showKeys.klingSingle ? 'text' : 'password'}
                    placeholder="Dán dãy API Key vào đây (ví dụ: chuỗi ký tự bạn vừa copy)..."
                    value={config.klingApiKey || (!config.klingSecretKey ? config.klingAccessKey : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfig((prev) => ({
                        ...prev,
                        klingApiKey: val,
                        klingAccessKey: val, // Keep in sync for seamless fallback
                      }));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500 pr-10 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('klingSingle')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showKeys.klingSingle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  💡 Hệ thống sẽ tự động xác thực Bearer Token trực tiếp đến máy chủ Kling AI mà không yêu cầu thêm bất kỳ khóa bí mật (SK) nào.
                </p>
              </div>
            )}

            {/* Mode 2: Legacy AK/SK Pair */}
            {klingKeyType === 'ak_sk' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Access Key (AK) */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Access Key (AK):
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys.klingAk ? 'text' : 'password'}
                      placeholder="Dán Access Key (AK)..."
                      value={config.klingAccessKey}
                      onChange={(e) => handleKlingAccessKeyChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('klingAk')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showKeys.klingAk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Secret Key (SK) */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Secret Key (SK):
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys.klingSk ? 'text' : 'password'}
                      placeholder="Dán Secret Key (SK)..."
                      value={config.klingSecretKey}
                      onChange={(e) => setConfig({ ...config, klingSecretKey: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('klingSk')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showKeys.klingSk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Kling Model Selector */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-200 flex items-center justify-between">
                <span>Phiên bản mô hình Kling AI:</span>
                <span className="text-[10px] text-amber-400 font-semibold">Tự động Fallback thông minh</span>
              </label>
              <select
                value={config.klingModel || 'kling-v2-6'}
                onChange={(e) => setConfig({ ...config, klingModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
              >
                <option value="kling-v2-6">🚀 Kling 2.6 (Khuyên dùng - Phiên bản mới nhất, sắc nét & mượt mà)</option>
                <option value="kling-v2-5">⚡ Kling 2.5 (Tốc độ render nhanh, tối ưu chi phí)</option>
                <option value="kling-v2">🎬 Kling 2.0 (Tiêu chuẩn ổn định)</option>
                <option value="kling-v3-0">🔮 Kling 3.0 (Thế hệ mới nhất)</option>
              </select>
              <p className="text-[10px] text-slate-400">
                💡 Hệ thống đã được nâng cấp lên chuẩn Kling 2.6 mới nhất (thay thế cho v1.6 đã ngừng phục vụ). Nếu tài khoản có hạn ngạch riêng, hệ thống sẽ tự động thử các phiên bản tương thích mà không làm gián đoạn trải nghiệm của bạn.
              </p>
            </div>

            {/* Test Connection Button & Status */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestKlingConnection}
                  disabled={klingTestStatus === 'testing' || (!config.klingApiKey && !config.klingAccessKey)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    !config.klingApiKey && !config.klingAccessKey
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                  }`}
                >
                  {klingTestStatus === 'testing' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang kiểm tra kết nối...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Kiểm Tra Kết Nối Kling AI</span>
                    </>
                  )}
                </button>

                {(config.klingApiKey || (config.klingAccessKey && config.klingSecretKey)) && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{config.klingApiKey ? 'Đã nhập API Key' : 'Đã nhập đủ AK & SK'}</span>
                  </span>
                )}
              </div>

              {klingTestStatus !== 'idle' && (
                <div
                  className={`p-2.5 rounded-lg text-[11px] flex items-start gap-2 ${
                    klingTestStatus === 'testing'
                      ? 'bg-blue-950/40 border border-blue-800/50 text-blue-300'
                      : klingTestStatus === 'success'
                      ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300'
                      : 'bg-rose-950/40 border border-rose-800/50 text-rose-300'
                  }`}
                >
                  {klingTestStatus === 'testing' && <Loader2 className="w-4 h-4 shrink-0 animate-spin mt-0.5" />}
                  {klingTestStatus === 'success' && <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />}
                  {klingTestStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />}
                  <div className="leading-relaxed">
                    {klingTestMessage}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Provider 2: Google Veo / Gemini AI Video */}
          <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/60 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2. Google Veo API Key (Gemini Video AI)</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Google DeepMind
                </span>
                {serverProviders.gemini_veo && (
                  <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Đã cấu hình Server
                  </span>
                )}
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Lấy key Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-400">
              Sử dụng mô hình Google Veo để tạo video 8 giây siêu sắc nét.
            </p>
            <div className="relative mt-1">
              <input
                type={showKeys.gemini ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={config.geminiKey}
                onChange={(e) => setConfig({ ...config, geminiKey: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('gemini')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Provider 3: Fal.ai (Proxy) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">3. Fal.ai API Key (Cổng trung gian Fal.ai)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                  Proxy fal.ai
                </span>
                {serverProviders.fal_kling && (
                  <span className="text-[10px] text-blue-400 font-medium bg-blue-500/10 px-1.5 py-0.5 rounded">
                    Đã có trên Server
                  </span>
                )}
              </div>
              <a
                href="https://fal.ai/dashboard/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Lấy key tại fal.ai</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-400">
              Lưu ý: Nếu bạn có API key từ <strong>kling.ai/dev/api-key</strong>, hãy điền vào mục số 1 bên trên. Mục này chỉ dành cho tài khoản có API key tại nền tảng trung gian <strong>fal.ai</strong>.
            </p>
            <div className="relative mt-1">
              <input
                type={showKeys.fal ? 'text' : 'password'}
                placeholder="fal_key_..."
                value={config.falKey}
                onChange={(e) => setConfig({ ...config, falKey: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('fal')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showKeys.fal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Provider 4: Runway Gen-3 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">4. RunwayML API Key (Runway Gen-3 Alpha)</span>
                {serverProviders.runway_gen3 && (
                  <span className="text-[10px] text-blue-400 font-medium bg-blue-500/10 px-1.5 py-0.5 rounded">
                    Đã có trên Server
                  </span>
                )}
              </div>
              <a
                href="https://runwayml.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Lấy key tại RunwayML</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative mt-1">
              <input
                type={showKeys.runway ? 'text' : 'password'}
                placeholder="key_runway_..."
                value={config.runwayKey}
                onChange={(e) => setConfig({ ...config, runwayKey: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('runway')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showKeys.runway ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Provider 5: Luma Dream Machine */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">5. Luma Labs API Key (Dream Machine)</span>
                {serverProviders.luma_dream && (
                  <span className="text-[10px] text-blue-400 font-medium bg-blue-500/10 px-1.5 py-0.5 rounded">
                    Đã có trên Server
                  </span>
                )}
              </div>
              <a
                href="https://lumalabs.ai/dream-machine/api"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Lấy key tại Luma Labs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative mt-1">
              <input
                type={showKeys.luma ? 'text' : 'password'}
                placeholder="luma-..."
                value={config.lumaKey}
                onChange={(e) => setConfig({ ...config, lumaKey: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('luma')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showKeys.luma ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Đã Lưu Cài Đặt!</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Lưu Cấu Hình API Key</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
