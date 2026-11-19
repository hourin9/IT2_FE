import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CheckCircle2,
  AlertCircle,
  Send,
  CheckSquare,
  Award,
  Download,
  FileText,
  Tag,
  BookOpen,
  MessageSquareText,
  RotateCcw,
} from 'lucide-react';
import { procedureApi, docApi, regulationApi } from '../services/api';
import { downloadFile } from '../utils/download';
import { useStudent } from '../contexts/StudentContext';
import { useToast } from '../contexts/ToastContext';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { Regulation } from '../types';
import {
  PROCEDURE_REFERENCES,
  buildAiChatUrl,
  buildCatalogUrl,
} from '../utils/crossTabLinks';

const DEFAULT_DOC_ID = Number(import.meta.env.VITE_DOC_ID) || 1;
const STORAGE_PREFIX = 'dut_proc_steps_';

const GRADE_LABEL: Record<string, string> = {
  LOAI_XUAT_SAC: 'Loại Xuất sắc',
  LOAI_GIOI: 'Loại Giỏi',
  LOAI_KHA: 'Loại Khá',
};

const ELIGIBLE_BADGE: Record<string, { label: string; className: string }> = {
  LOAI_XUAT_SAC: { label: 'ĐỦ TIÊU CHUẨN LOẠI XUẤT SẮC', className: 'bg-purple-50 text-purple-800 border-purple-200' },
  LOAI_GIOI: { label: 'ĐỦ TIÊU CHUẨN LOẠI GIỎI', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  LOAI_KHA: { label: 'ĐỦ TIÊU CHUẨN LOẠI KHÁ', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  KHONG_DU_DIEU_KIEN: { label: 'CHƯA ĐỦ TIÊU CHUẨN', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const getFileName = (url: string, fallback: string) => {
  try {
    const name = decodeURIComponent(new URL(url, window.location.origin).pathname.split('/').pop() || '');
    return name && name !== 'download' ? name : fallback;
  } catch {
    return fallback;
  }
};

function loadSavedSteps(docId: number): number[] {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${docId}`);
    if (!raw) return [0];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'number') : [0];
  } catch {
    return [0];
  }
}

export const ProcedurePage: React.FC = () => {
  const { student } = useStudent();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeDocId = Number(searchParams.get('docId')) || DEFAULT_DOC_ID;

  const [feedbackReason, setFeedbackReason] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<{ ticketCode: string } | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => loadSavedSteps(activeDocId));
  const [previewReg, setPreviewReg] = useState<Regulation | null>(null);

  useEffect(() => {
    setCompletedSteps(loadSavedSteps(activeDocId));
  }, [activeDocId]);

  const { data: docList } = useQuery({
    queryKey: ['docs-list'],
    queryFn: () => docApi.list(),
  });

  const { data: doc, isLoading: docLoading, isError: docError } = useQuery({
    queryKey: ['doc', activeDocId],
    queryFn: () => docApi.getById(activeDocId),
  });

  const selectDoc = (id: number) => {
    setSearchParams({ docId: String(id) }, { replace: true });
  };

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!doc?.file_url) return;
    setDownloadError(null);

    const isSameOrigin = new URL(doc.file_url, window.location.origin).origin === window.location.origin;
    if (!isSameOrigin) {
      window.open(doc.file_url, '_blank', 'noopener,noreferrer');
      return;
    }

    setDownloading(true);
    try {
      await downloadFile(
        doc.file_url,
        getFileName(doc.file_url, `bieu-mau-thu-tuc-${doc.id}.doc`),
      );
      showToast('Đã tải xuống biểu mẫu thành công.', 'success');
    } catch {
      setDownloadError('Không tải được tệp. Vui lòng thử lại sau hoặc liên hệ phòng Đào tạo & CTSV.');
    } finally {
      setDownloading(false);
    }
  };

  const isScholarshipProcedure = activeDocId === 1;
  const procRef = PROCEDURE_REFERENCES[activeDocId] || PROCEDURE_REFERENCES[1];

  const { data: criteriaList } = useQuery({
    queryKey: ['procedure-criteria', 'Học bổng Khuyến khích Học tập'],
    queryFn: () => procedureApi.getCriteria('Học bổng Khuyến khích Học tập'),
    enabled: isScholarshipProcedure,
  });

  const { data: evaluation } = useQuery({
    queryKey: ['procedure-evaluation', student.studentCode],
    queryFn: () => procedureApi.evaluate(student.studentCode),
    enabled: isScholarshipProcedure,
  });

  const ticketMutation = useMutation({
    mutationFn: (reason: string) =>
      procedureApi.submitTicket({
        studentCode: student.studentCode,
        procedureName: doc?.title || 'Học bổng Khuyến khích Học tập',
        reason,
      }),
    onSuccess: (data) => {
      setSubmittedTicket(data);
      setFeedbackReason('');
      showToast(`Đã gửi đề nghị (Mã: ${data.ticketCode})`, 'success');
    },
    onError: () => {
      showToast('Gửi phản hồi chưa thành công. Vui lòng thử lại.', 'error');
    },
  });

  const toggleStep = (index: number) => {
    const next = completedSteps.includes(index)
      ? completedSteps.filter((i) => i !== index)
      : [...completedSteps, index];
    setCompletedSteps(next);
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}${activeDocId}`, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  };

  const resetSteps = () => {
    setCompletedSteps([]);
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}${activeDocId}`, JSON.stringify([]));
    } catch {
      // Ignore
    }
  };

  const handleOpenGoverningRegulation = async () => {
    if (activeDocId === 1) {
      try {
        const reg = await regulationApi.getByNumber('1414/QĐ-ĐHBK');
        if (reg) {
          setPreviewReg(reg);
          return;
        }
      } catch {
        // Fallback below
      }
    }
    try {
      const list = await regulationApi.search('ALL', procRef.regulationQuery);
      if (list && list.length > 0) {
        setPreviewReg(list[0]);
        return;
      }
    } catch {
      // Ignore
    }
    showToast('Chưa tìm thấy văn bản chi tiết cục bộ; hãy mở trang Tra cứu Quy chế.', 'info');
  };

  const docSteps = doc?.steps ?? [];
  const totalStepsCount = docSteps.length > 0 ? docSteps.length : (evaluation?.checklistSteps?.length ?? 4);
  const completedInRange = completedSteps.filter((i) => i >= 0 && i < totalStepsCount).length;
  const progressPercent = totalStepsCount > 0 ? Math.round((completedInRange / totalStepsCount) * 100) : 0;

  const badge = ELIGIBLE_BADGE[evaluation?.eligibleLevel || 'LOAI_GIOI'] || ELIGIBLE_BADGE.KHONG_DU_DIEU_KIEN;
  const procedureTitle = doc?.title || procRef.label;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header & Procedure Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Thủ tục Hành chính &amp; Biểu mẫu Sinh viên
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hướng dẫn quy trình từng bước, tải biểu mẫu trực tiếp và đối soát điều kiện áp dụng theo quy định Nhà trường.
          </p>
        </div>

        {/* Procedure Switcher Pills */}
        {docList && docList.length > 0 && (
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Danh sách thủ tục">
            {docList.map((item) => {
              const active = item.id === activeDocId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectDoc(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    active
                      ? 'bg-dut-800 text-white border-dut-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.title}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Step-by-Step Guide + Context Card (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step-by-Step Procedure Card */}
          <section className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <h2 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-dut-800 shrink-0" />
                  <span>{procedureTitle}</span>
                </h2>
                {doc?.summary && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{doc.summary}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-dut-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                  {completedInRange}/{totalStepsCount} bước ({progressPercent}%)
                </span>
                {completedInRange > 0 && (
                  <button
                    type="button"
                    onClick={resetSteps}
                    title="Đặt lại tiến độ"
                    className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {doc?.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {doc.tags.map((t) => (
                  <Link
                    key={t}
                    to={buildCatalogUrl({ q: t })}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            )}

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-dut-800 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Steps list */}
            {docLoading ? (
              <div className="space-y-2.5 animate-pulse">
                <div className="h-14 bg-slate-100 rounded-lg" />
                <div className="h-14 bg-slate-100 rounded-lg" />
                <div className="h-14 bg-slate-100 rounded-lg" />
              </div>
            ) : docSteps.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                {docSteps.map((step, idx) => {
                  const isChecked = completedSteps.includes(idx);
                  return (
                    <label
                      key={step.order}
                      className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50/50 border-blue-200 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleStep(idx)}
                        className="mt-1 h-4 w-4 rounded text-dut-800 focus:ring-dut-600 border-slate-300 cursor-pointer"
                      />
                      <div className="text-xs sm:text-sm space-y-0.5">
                        <p className="font-bold text-dut-800">
                          Bước {step.order}: {step.title}
                        </p>
                        <p className="text-slate-600 leading-relaxed">{step.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {(evaluation?.checklistSteps || []).map((step, idx) => {
                  const isChecked = completedSteps.includes(idx);
                  return (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50/50 border-blue-200 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleStep(idx)}
                        className="mt-1 h-4 w-4 rounded text-dut-800 focus:ring-dut-600 border-slate-300 cursor-pointer"
                      />
                      <div className="text-xs sm:text-sm">
                        <span className="font-bold mr-1">Chặng {idx + 1}:</span>
                        <span>{step}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          {/* Context-specific Legal Reference / Scholarship Evaluation */}
          {isScholarshipProcedure ? (
            <section className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-dut-800" />
                  <span>Đối soát điều kiện Học bổng KKHT ({student.studentCode})</span>
                </h2>
                <span className={`px-3 py-1 rounded-md border text-xs font-bold ${badge.className}`}>
                  {badge.label}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                {evaluation?.statusMessage || 'Đang đối soát kết quả học tập với bảng tiêu chuẩn QĐ 1414/QĐ-ĐHBK...'}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                      <th className="py-2.5 px-3">Hạng mức Học bổng</th>
                      <th className="py-2.5 px-3">Điểm TBCHK (Thang 10)</th>
                      <th className="py-2.5 px-3">Điểm Rèn luyện</th>
                      <th className="py-2.5 px-3">Tình trạng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(criteriaList && criteriaList.length > 0
                      ? criteriaList
                      : [
                          { id: 1, procedureName: '', gradeLevel: 'LOAI_XUAT_SAC', minGpa: 9.0, maxGpa: 10.0, minTrainingPoint: 90, description: '' },
                          { id: 2, procedureName: '', gradeLevel: 'LOAI_GIOI', minGpa: 8.0, maxGpa: 8.99, minTrainingPoint: 80, description: '' },
                          { id: 3, procedureName: '', gradeLevel: 'LOAI_KHA', minGpa: 7.0, maxGpa: 7.99, minTrainingPoint: 65, description: '' },
                        ]
                    ).map((row) => {
                      const isMatched = evaluation?.eligibleLevel === row.gradeLevel;
                      const meetsRow =
                        evaluation &&
                        evaluation.gpa >= row.minGpa &&
                        evaluation.trainingPoint >= row.minTrainingPoint;
                      return (
                        <tr
                          key={row.id}
                          className={isMatched ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50/60'}
                        >
                          <td className="py-3 px-3 font-semibold text-dut-800 flex items-center gap-1.5">
                            {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            <span>{GRADE_LABEL[row.gradeLevel] || row.gradeLevel}</span>
                          </td>
                          <td className="py-3 px-3">
                            {row.maxGpa && row.maxGpa < 10
                              ? `${Number(row.minGpa).toFixed(2)} – ${Number(row.maxGpa).toFixed(2)}`
                              : `≥ ${Number(row.minGpa).toFixed(2)}`}
                            {isMatched && evaluation && ` (Đạt: ${Number(evaluation.gpa).toFixed(2)})`}
                          </td>
                          <td className="py-3 px-3">
                            ≥ {row.minTrainingPoint} đ
                            {isMatched && evaluation && ` (Đạt: ${evaluation.trainingPoint} đ)`}
                          </td>
                          <td className={`py-3 px-3 ${isMatched ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                            {isMatched ? 'Đủ điều kiện' : meetsRow ? 'Đạt mức cao hơn' : 'Chưa đạt'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <p className="font-semibold text-slate-800">Điều kiện kỹ thuật loại trừ cần lưu ý:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {procRef.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            </section>
          ) : (
            <section className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-dut-800" />
                  <span>Căn cứ quy định &amp; Lưu ý hồ sơ</span>
                </h2>
                <button
                  type="button"
                  onClick={handleOpenGoverningRegulation}
                  className="text-xs font-semibold text-dut-700 hover:underline"
                >
                  Đọc văn bản căn cứ →
                </button>
              </div>
              <p className="text-xs font-medium text-slate-700 bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200">
                Văn bản tham chiếu: <strong>{procRef.regulationLabel}</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600">
                {procRef.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right Column: Downloads, Cross-tab Help & Ticket Submission */}
        <div className="space-y-6">
          {/* Downloads & Links Card */}
          <section className="bg-white rounded-xl p-5 border border-slate-200 space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900">
              <Download className="w-4 h-4 text-dut-800" />
              <h3 className="font-bold text-sm sm:text-base">Biểu mẫu &amp; Liên kết nhanh</h3>
            </div>

            {doc?.title && (
              <p className="text-xs text-slate-500">{doc.title}</p>
            )}

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !doc?.file_url}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-dut-800 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-dut-700 disabled:opacity-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>{downloading ? 'Đang tải...' : 'Tải biểu mẫu (.doc)'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to={buildCatalogUrl({ q: procRef.regulationQuery })}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tra cứu quy chế</span>
              </Link>
              <Link
                to={buildAiChatUrl({
                  q: `Hướng dẫn chi tiết hồ sơ, thời hạn và nơi nộp cho thủ tục: ${procedureTitle}`,
                  autoSend: true,
                })}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-dut-800 transition-colors"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>Hỏi thủ tục này</span>
              </Link>
            </div>

            {docLoading && (
              <p className="text-xs text-slate-500">Đang tải thông tin tài liệu...</p>
            )}

            {docError && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                Không lấy được thông tin tài liệu từ máy chủ.
              </p>
            )}

            {doc && !doc.file_url && (
              <p className="text-xs text-slate-500">Tài liệu này chưa có tệp đính kèm.</p>
            )}

            {downloadError && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                {downloadError}
              </p>
            )}
          </section>

          {/* Ticket / Feedback Card */}
          <section className="bg-white rounded-xl p-5 border border-slate-200 space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm sm:text-base">Gửi đề nghị hỗ trợ / đối soát</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nếu cần hỗ trợ thêm hoặc phát hiện sai sót số liệu học vụ, sinh viên gửi yêu cầu trực tuyến tới bộ phận Một cửa.
            </p>

            {submittedTicket && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã tiếp nhận đề nghị thành công!</span>
                </p>
                <p>
                  Mã biên nhận:{' '}
                  <strong className="font-mono text-sm text-emerald-800">
                    {submittedTicket.ticketCode}
                  </strong>
                </p>
                <p className="text-[11px] text-emerald-700">
                  Thời gian phản hồi dự kiến: 24 – 48 giờ làm việc.
                </p>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (feedbackReason.trim()) {
                  ticketMutation.mutate(feedbackReason);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung đề nghị / khiếu nại:
                </label>
                <textarea
                  rows={4}
                  value={feedbackReason}
                  onChange={(e) => setFeedbackReason(e.target.value)}
                  placeholder={`Ví dụ: Cần đối soát hồ sơ liên quan đến "${procedureTitle}"...`}
                  className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dut-600/20 focus:border-dut-800 focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={ticketMutation.isPending || !feedbackReason.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-dut-800 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-dut-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{ticketMutation.isPending ? 'Đang gửi...' : 'Gửi đề nghị xem xét'}</span>
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Modal preview for governing regulation */}
      <DocumentViewerModal
        regulation={previewReg}
        onClose={() => setPreviewReg(null)}
      />
    </div>
  );
};
