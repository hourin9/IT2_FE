import React, { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ExternalLink, Eye, Download, SearchX } from 'lucide-react';
import { regulationApi } from '../services/api';
import { Regulation } from '../types';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { SearchBar } from '../components/SearchBar';
import { RegulationFilterPanel } from '../components/RegulationFilterPanel';
import { REGULATION_CATEGORIES, useRegulationFilters } from '../hooks/useRegulationFilters';

export const CatalogPage: React.FC = () => {
  const { keyword, category, tags, activeCount, setKeyword, setCategory, toggleTag, reset } =
    useRegulationFilters();
  const [selectedDoc, setSelectedDoc] = useState<Regulation | null>(null);

  // `keyword` đã được SearchBar debounce nên mỗi lần ngừng gõ chỉ phát sinh một request;
  // `signal` hủy request cũ nếu bộ lọc đổi trước khi có kết quả.
  const {
    data: regulations,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['regulations', category, keyword],
    queryFn: ({ signal }) => regulationApi.search(category, keyword, signal),
    placeholderData: keepPreviousData,
  });

  // Tag được lọc phía client trên tập kết quả của danh mục + từ khóa hiện tại.
  const availableTags = useMemo(() => {
    const all = new Set<string>(tags);
    regulations?.forEach((doc) => doc.tags?.forEach((t) => all.add(t)));
    return [...all].sort((x, y) => x.localeCompare(y, 'vi'));
  }, [regulations, tags]);

  const visibleRegulations = useMemo(
    () =>
      tags.length === 0
        ? regulations ?? []
        : (regulations ?? []).filter((doc) => tags.every((t) => doc.tags?.includes(t))),
    [regulations, tags],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Search & Filters Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
              <span>Tra cứu Quy chế &amp; Văn bản Học vụ ĐHBK Đà Nẵng</span>
              <span className="text-[11px] font-semibold text-dut-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                Nguồn chính thống
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống văn bản pháp quy, quy định đào tạo tín chỉ và chính sách sinh viên của Trường ĐHBK – ĐHĐN.
            </p>
          </div>
          <a
            href="https://dut.udn.vn/VanBanPhapQuy/page/1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-dut-700 font-bold hover:underline self-start sm:self-auto shrink-0"
          >
            <span>Mở trang Văn bản Pháp quy DUT</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <SearchBar
          value={keyword}
          onSearch={setKeyword}
          isLoading={isFetching}
          placeholder="Nhập từ khóa tìm kiếm (Ví dụ: 1414, học bổng loại giỏi, tín chỉ, tạm hoãn nghĩa vụ quân sự...)"
        />

        <RegulationFilterPanel
          category={category}
          onCategoryChange={setCategory}
          availableTags={availableTags}
          selectedTags={tags}
          onToggleTag={toggleTag}
          activeCount={activeCount}
          onReset={reset}
        />
      </div>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2" aria-live="polite">
          <span className="font-bold text-slate-900">
            {keyword ? `Kết quả cho "${keyword}"` : 'Danh mục văn bản được áp dụng'}
          </span>
          <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full text-[11px]">
            {isLoading ? 'Đang tải...' : `${visibleRegulations.length} văn bản`}
          </span>
        </div>
        <div className="text-slate-500 text-[11px]">
          Căn cứ số liệu: <strong className="text-slate-700">Trường ĐH Bách khoa - ĐH Đà Nẵng</strong>
        </div>
      </div>

      {isError && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-xl px-4 py-3 text-xs font-medium">
          Không tải được danh mục văn bản. Vui lòng thử lại.
        </div>
      )}

      {!isLoading && !isError && visibleRegulations.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <SearchX className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="mt-3 text-sm font-bold text-slate-900">Không tìm thấy văn bản phù hợp</p>
          <p className="mt-1 text-xs text-slate-500">Thử từ khóa khác hoặc bỏ bớt bộ lọc.</p>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={reset}
              className="mt-3 text-xs font-bold text-dut-700 hover:underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Results Cards Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${
          isFetching ? 'opacity-60' : ''
        }`}
      >
        {visibleRegulations.map((doc) => {
          const cat = REGULATION_CATEGORIES.find((c) => c.id === doc.category);
          const CatIcon = cat?.icon;
          return (
            <div
              key={doc.id}
              className="bg-white border border-slate-200 hover:border-dut-600 hover:shadow-md rounded-xl p-5 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  {cat && CatIcon && (
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold border flex items-center gap-1 ${cat.badgeClass}`}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      {cat.label}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded ml-auto">
                    {doc.issuer}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Số: {doc.documentNumber} (Ban hành {doc.issuedDate})
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 leading-snug line-clamp-2">
                    {doc.title}
                  </h2>
                </div>
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {doc.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-500 line-clamp-3">
                  {doc.summary || 'Chưa có trích yếu tóm tắt.'}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem số hóa</span>
                </button>
                {doc.pdfUrl && (
                  <a
                    href={doc.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Document Viewer */}
      <DocumentViewerModal
        regulation={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
};
