import React, { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ExternalLink, Eye, Download, SearchX } from 'lucide-react';
import { regulationApi } from '../services/api';
import { Regulation } from '../types';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { SearchBar } from '../components/SearchBar';
import { RegulationFilterPanel } from '../components/RegulationFilterPanel';
import { useRegulationFilters } from '../hooks/useRegulationFilters';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-dut-primary to-blue-800 text-white p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-blue-200">
            Kho dữ liệu số hóa
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Tra cứu Văn bản Pháp quy & Quy chế
          </h2>
          <p className="text-sm text-blue-100 mt-2 max-w-2xl">
            Chuẩn hóa hệ thống văn bản pháp quy, quy định đào tạo tín chỉ và chính sách sinh viên của Trường Đại học Bách khoa – ĐHĐN.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://dut.udn.vn/VanBanPhapQuy/page/1"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-sm transition-colors"
          >
            <span>Cổng Pháp quy DUT</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] gap-5 items-start">
        <RegulationFilterPanel
          category={category}
          onCategoryChange={setCategory}
          availableTags={availableTags}
          selectedTags={tags}
          onToggleTag={toggleTag}
          activeCount={activeCount}
          onReset={reset}
        />

        <div className="space-y-4 min-w-0">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-dut-outline-variant/30 space-y-2">
            <SearchBar
              value={keyword}
              onSearch={setKeyword}
              isLoading={isFetching}
              placeholder="Tìm theo số hiệu (1414/QĐ), tên quy định hoặc trích yếu..."
            />
            <p className="text-xs text-dut-on-surface-variant" aria-live="polite">
              {isLoading
                ? 'Đang tải danh mục văn bản...'
                : isError
                  ? 'Không tải được danh mục văn bản. Vui lòng thử lại.'
                  : `${visibleRegulations.length} văn bản${keyword ? ` cho "${keyword}"` : ''}`}
            </p>
          </div>

          {!isLoading && !isError && visibleRegulations.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-dut-outline-variant p-10 text-center">
              <SearchX className="w-8 h-8 text-dut-outline mx-auto" />
              <p className="mt-3 text-sm font-semibold text-dut-on-surface">
                Không tìm thấy văn bản phù hợp
              </p>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="mt-2 text-xs font-semibold text-dut-primary hover:underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}

          <div
            className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 transition-opacity ${
              isFetching ? 'opacity-60' : ''
            }`}
          >
            {visibleRegulations.map((doc) => (

            <div
              key={doc.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-dut-outline-variant/30 hover:border-dut-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-dut-primary/10 text-dut-primary">
                    {doc.documentNumber}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {doc.issuedDate}
                  </span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-dut-on-surface line-clamp-2 hover:text-dut-primary transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                  {doc.summary || 'Chưa có trích yếu tóm tắt.'}
                </p>
                <div className="mt-3 text-[11px] text-gray-400 font-medium">
                  Ban hành: {doc.issuer}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-dut-primary hover:text-dut-primary-container"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem số hóa</span>
                </button>
                {doc.pdfUrl && (
                  <a
                    href={doc.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-xs text-gray-500 hover:text-dut-primary"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>
                )}
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Modal Document Viewer */}
      <DocumentViewerModal
        regulation={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
};
