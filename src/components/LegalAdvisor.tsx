import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Send, 
  AlertCircle 
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  category: 'luat' | 'phat_nguoi' | 'ngoai_le' | 'vach_ke';
  answer: string;
  legalRef: string;
}

const FAQS: FAQItem[] = [
  {
    id: '1',
    question: 'Vượt đèn vàng có bị phạt mức tiền như vượt đèn đỏ không?',
    category: 'luat',
    answer: 'CÓ. Theo điểm a khoản 5 Điều 5 (với ô tô) và điểm e khoản 4 Điều 6 (với xe máy) Nghị định 100/2019/NĐ-CP (sửa đổi bởi NĐ 123/2021/NĐ-CP), hành vi "Không chấp hành hiệu lệnh của đèn tín hiệu giao thông" bao gồm cả vượt đèn đỏ và vượt đèn vàng trái quy định. Cả hai hành vi đều chịu chung một khung hình phạt (4 - 6 triệu đồng với ô tô; 800.000 - 1.000.000 đồng với xe máy; cùng tước GPLX 1 - 3 tháng). Tuy nhiên, theo Quy chuẩn QCVN 41:2019/BGTVT, nếu phương tiện đã đi quá vạch dừng xe trước khi đèn chuyển vàng, người điều khiển được phép đi tiếp.',
    legalRef: 'Điểm a Khoản 5 Điều 5 NĐ 100/2019 & Điều 10 QCVN 41:2019/BGTVT',
  },
  {
    id: '2',
    question: 'Dừng đè lên vạch dừng xe (vạch 7.1) khi đèn đỏ bị phạt bao nhiêu tiền?',
    category: 'vach_ke',
    answer: 'Hành vi dừng xe đè lên vạch số 7.1 (hoặc vượt qua vạch rồi dừng lại trên vạch đi bộ) KHÔNG BỊ COI LÀ VƯỢT ĐÈN ĐỎ, mà chỉ bị xử phạt lỗi "Không chấp hành hiệu lệnh, chỉ dẫn của biển báo hiệu, vạch kẻ đường". Mức phạt: 300.000 - 400.000 đồng đối với ô tô; 100.000 - 200.000 đồng đối với xe mô tô/xe máy, và KHÔNG BỊ TƯỚC GIẤY PHÉP LÁI XE. Hệ thống camera ITS hiện đại phân biệt rõ ràng 2 lỗi này nhờ khung hình thứ 3 (xe có tiếp tục đi qua giao lộ hay dừng lại).',
    legalRef: 'Điểm a Khoản 1 Điều 5 & Điểm a Khoản 1 Điều 6 NĐ 100/2019/NĐ-CP',
  },
  {
    id: '3',
    question: 'Vượt đèn đỏ để nhường đường cho xe cứu thương có bị phạt nguội không?',
    category: 'ngoai_le',
    answer: 'KHÔNG BỊ PHẠT. Theo Điều 11 Luật Xử lý vi phạm hành chính 2012, người thực hiện hành vi vi phạm hành chính trong "Tình thế cấp thiết" hoặc "Sự kiện bất ngờ" thì không bị xử phạt. Khi hệ thống camera ITS ghi nhận, hình ảnh trích xuất sẽ có sự xuất hiện của xe cứu thương hú còi ưu tiên phía sau. Nếu hệ thống tự động gửi giấy báo, chủ phương tiện chỉ cần làm đơn giải trình hoặc gửi phản ánh trên Cổng DVC Quốc gia kèm hình ảnh/video camera hành trình để được Cảnh sát giao thông hủy bỏ biên bản.',
    legalRef: 'Điều 11 Luật Xử lý vi phạm hành chính 2012 & Điều 22 Luật GTĐB 2008',
  },
  {
    id: '4',
    question: 'Xe đang đi giữa ngã tư khi đèn xanh, tới giữa giao lộ thì đèn đỏ bật thì có vi phạm không?',
    category: 'luat',
    answer: 'KHÔNG VI PHẠM. Theo Quy chuẩn 41:2019, điều kiện để cấu thành vi phạm vượt đèn đỏ là phương tiện phải vượt qua vạch dừng 7.1 sau khi đèn đỏ đã bật. Nếu phương tiện đã vượt qua vạch dừng khi đèn còn xanh hoặc vàng hợp lệ, tài xế có nghĩa vụ tiếp tục khẩn trương di chuyển ra khỏi giao lộ để tránh ùn tắc, và hành vi này hoàn toàn hợp pháp.',
    legalRef: 'Khoản 10.3 Điều 10 Quy chuẩn QCVN 41:2019/BGTVT',
  },
  {
    id: '5',
    question: 'Thời hạn gửi thông báo phạt nguội tối đa là bao nhiêu ngày?',
    category: 'phat_nguoi',
    answer: 'Theo Thông tư 15/2022/TT-BCA và Thông tư 51/2022/TT-BCA, trong thời hạn 10 ngày làm việc kể từ ngày phát hiện vi phạm, cơ quan công an nơi phát hiện sẽ gửi thông báo bằng văn bản đến chủ phương tiện. Đồng thời, thông tin vi phạm sẽ được cập nhật lên Trang thông tin điện tử Cục Cảnh sát giao thông (csgt.vn) và ứng dụng VNeID.',
    legalRef: 'Điều 15 Thông tư 15/2022/TT-BCA Bộ Công An',
  },
  {
    id: '6',
    question: 'Xe mượn hoặc xe thuê bị phạt nguội thì ai phải chịu trách nhiệm nộp phạt?',
    category: 'phat_nguoi',
    answer: 'Theo quy định tại Điều 80 Nghị định 100/2019/NĐ-CP, cơ quan công an sẽ gửi thông báo đến chủ phương tiện đứng tên trên đăng ký xe. Chủ xe có nghĩa vụ phối hợp với cơ quan công an để xác định người trực tiếp điều khiển phương tiện thực hiện hành vi vi phạm. Nếu chủ xe không chứng minh hoặc không giải trình được ai là người lái xe, chủ xe (cá nhân hoặc tổ chức) sẽ phải chịu trách nhiệm nộp phạt thay.',
    legalRef: 'Khoản 8 Điều 80 Nghị định 100/2019/NĐ-CP',
  },
];

export const LegalAdvisor: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [customAnalysis, setCustomAnalysis] = useState<string | null>(null);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.legalRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAnalyzeCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const q = customQuestion.toLowerCase();
    let response = '';

    if (q.includes('cấp cứu') || q.includes('cứu thương') || q.includes('nhường đường')) {
      response = `Phân tích tình huống "${customQuestion}":\n\n1. Căn cứ pháp lý: Căn cứ Điều 11 Luật Xử lý vi phạm hành chính 2012, hành vi vượt đèn đỏ để nhường đường cho xe ưu tiên đang làm nhiệm vụ được xác định thuộc "Tình thế cấp thiết".\n2. Kết luận: Người điều khiển KHÔNG BỊ XỬ PHẠT VI PHẠM HÀNH CHÍNH.\n3. Hướng dẫn xử lý: Nếu nhận được thông báo phạt nguội, bạn nộp đơn kiến nghị kèm trích xuất camera hành trình (hoặc yêu cầu CSGT kiểm tra camera giao lộ tại thời điểm đó) để được hủy bỏ quyết định xử phạt.`;
    } else if (q.includes('đè vạch') || q.includes('chẹt vạch') || q.includes('vạch 7.1')) {
      response = `Phân tích tình huống "${customQuestion}":\n\n1. Căn cứ pháp lý: Điểm a Khoản 1 Điều 5 (ô tô) và Điểm a Khoản 1 Điều 6 (xe máy) Nghị định 100/2019/NĐ-CP.\n2. Phân loại lỗi: Lỗi "Không chấp hành hiệu lệnh, chỉ dẫn của biển báo hiệu, vạch kẻ đường", KHÔNG PHẢI lỗi vượt đèn đỏ.\n3. Chế tài: Phạt 300.000 - 400.000đ với ô tô; 100.000 - 200.000đ với xe máy; KHÔNG bị tước giấy phép lái xe.`;
    } else if (q.includes('đèn vàng') || q.includes('vàng')) {
      response = `Phân tích tình huống "${customQuestion}":\n\n1. Căn cứ pháp lý: Nghị định 100/2019/NĐ-CP và Quy chuẩn QCVN 41:2019/BGTVT.\n2. Quy định: Người lái xe phải dừng lại trước vạch dừng khi đèn vàng bật sáng. Nếu xe đã vượt qua vạch dừng trước khi đèn chuyển vàng thì được phép đi tiếp.\n3. Chế tài nếu cố tình vượt: Xử phạt tương đương vượt đèn đỏ (Ô tô 4-6 triệu, xe máy 800k-1 triệu, tước GPLX 1-3 tháng).`;
    } else {
      response = `Phân tích tình huống "${customQuestion}":\n\n1. Nguyên tắc cơ bản: Mọi hành vi điều khiển phương tiện vượt qua vạch dừng số 7.1 sau khi đèn đỏ bật đều bị xem xét là vi phạm không chấp hành tín hiệu đèn giao thông (trừ xe ưu tiên theo Điều 22 Luật GTĐB).\n2. Căn cứ Nghị định 100/2019/NĐ-CP (sửa đổi NĐ 123/2021/NĐ-CP): Mức phạt ô tô 4-6 triệu, tước GPLX 1-3 tháng; Mô tô 800k - 1 triệu.\n3. Bạn có quyền tra cứu hình ảnh 3 khung hình minh chứng trực tiếp tại cơ quan CSGT hoặc trên Cổng DVC Quốc gia để xác minh tính chính xác.`;
    }

    setCustomAnalysis(response);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
        <div className="flex items-start gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              Cơ Sở Pháp Lý & Giải Đáp Tình Huống Vượt Đèn Đỏ
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Trích lục các quy định pháp luật hiện hành theo <strong>Nghị định 100/2019/NĐ-CP</strong>, 
              <strong> Nghị định 123/2021/NĐ-CP</strong>, <strong>QCVN 41:2019/BGTVT</strong> và Luật Trật tự, An toàn giao thông đường bộ.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Situation Analyzer Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Trợ Lý Tra Cứu & Phân Tích Tình Huống Giao Thông Tự Động</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Nhập tình huống của bạn (ví dụ: "Vượt đèn đỏ để nhường xe cứu thương có bị phạt nguội không?", "Dừng xe đè vạch người đi bộ phạt bao nhiêu?", "Mượn xe người khác bị phạt nguội thì sao?"):
        </p>

        <form onSubmit={handleAnalyzeCustom} className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Nhập câu hỏi hoặc tình huống cần tư vấn pháp lý..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Phân Tích</span>
          </button>
        </form>

        {customAnalysis && (
          <div className="mt-4 bg-slate-950 p-4 rounded-lg border border-blue-500/30 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
            {customAnalysis}
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'luat', label: 'Quy định luật' },
            { key: 'vach_ke', label: 'Đè vạch 7.1' },
            { key: 'ngoai_le', label: 'Xe ưu tiên & Ngoại lệ' },
            { key: 'phat_nguoi', label: 'Quy trình phạt nguội' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm điều luật..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>
      </div>

      {/* FAQs Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
            Không tìm thấy kết quả phù hợp với từ khóa "{searchQuery}".
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-sm font-bold text-white leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300 space-y-3 bg-slate-950/40">
                    <p className="leading-relaxed">{faq.answer}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-mono bg-blue-950/40 px-3 py-1.5 rounded border border-blue-900/50 w-fit">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Căn cứ pháp lý: {faq.legalRef}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
