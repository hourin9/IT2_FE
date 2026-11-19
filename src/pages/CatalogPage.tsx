import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  ExternalLink,
  Eye,
  Download,
  SearchX,
  ShieldAlert,
  LayoutGrid,
  List,
  MessageSquareText,
  ClipboardCheck,
} from 'lucide-react';
import { regulationApi, searchApi } from '../services/api';
import { Regulation } from '../types';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { SearchBar } from '../components/SearchBar';
import { RegulationFilterPanel } from '../components/RegulationFilterPanel';
import { Pagination } from '../components/Pagination';
import { REGULATION_CATEGORIES, useRegulationFilters } from '../hooks/useRegulationFilters';
import { cleanDisplayText } from '../utils/sanitize';
import {
  buildAiChatUrl,
  buildProcedureUrl,
  findRelatedProcedureId,
} from '../utils/crossTabLinks';

export const CatalogPage: React.FC = () => {
  const {
    keyword,
    category,
    tags,
    page,
    size,
    activeCount,
    setKeyword,
    setCategory,
    toggleTag,
    setPage,
    setSize,
    reset,
  } = useRegulationFilters();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDoc, setSelectedDoc] = useState<Regulation | null>(null);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const resultsTopRef = useRef<HTMLDivElement>(null);

  const openDocParam = searchParams.get('openDoc');

  const {
    data: searchResult,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['hybrid-search', category, keyword, tags, page, size],
    queryFn: ({ signal }) =>
      searchApi.search(
        {
          q: keyword || undefined,
          category,
          tags,
          page,
          size,
        },
        signal,
      ),
    placeholderData: keepPreviousData,
  });

  // Auto-open modal when arriving via ?openDoc=<documentNumber>
  useEffect(() => {
    if (!openDocParam) return;
    let cancelled = false;
    regulationApi
      .getByNumber(openDocParam)
      .then((doc) => {
        if (!cancelled && doc) {
          setSelectedDoc(doc);
        }
      })
      .catch(() => {
        // Ignore if document cannot be resolved directly
      })
      .finally(() => {
        if (!cancelled) {
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.delete('openDoc');
              return next;
            },
            { replace: true },
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [openDocParam, setSearchParams]);

  const rawItems = searchResult?.items ?? [];
  const totalItems = searchResult?.totalItems ?? searchResult?.total ?? rawItems.length;
  const totalPages =
    searchResult?.totalPages ?? Math.max(1, Math.ceil(totalItems / Math.max(1, size)));
  const regulations =
    searchResult?.totalPages !== undefined
      ? rawItems
      : rawItems.slice((page - 1) * size, page * size);

  const availableTags = useMemo(() => {
    if (searchResult?.availableTags && searchResult.availableTags.length > 0) {
      return searchResult.availableTags;
    }
    const all = new Set<string>(tags);
    regulations.forEach((doc) => doc.tags?.forEach((t) => all.add(t)));
    return [...all].sort((x, y) => x.localeCompare(y, 'vi'));
  }, [searchResult?.availableTags, regulations, tags]);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Search & Filters Container */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Tra cứu Quy chế &amp; Văn bản Học vụ
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kho văn bản pháp quy, quy định đào tạo tín chỉ và chính sách sinh viên Trường ĐHBK – ĐHĐN.
            </p>
          </div>
          <a
            href="https://dut.udn.vn/VanBanPhapQuy/page/1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-dut-700 font-semibold hover:underline self-start sm:self-auto shrink-0"
          >
            <span>Trang Văn bản Pháp quy DUT</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <SearchBar
          value={keyword}
          onSearch={setKeyword}
          isLoading={isFetching}
          placeholder="Nhập số hiệu hoặc nội dung cần tra (ví dụ: 1414, học bổng loại giỏi, tín chỉ, bảo lưu...)"
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
      </section>

      {/* Results Header & View Switcher */}
      <div
        ref={resultsTopRef}
        className="flex flex-wrap items-center justify-between gap-3 text-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 flex-wrap" aria-live="polite">
          <span className="font-bold text-slate-900 text-sm">
            {keyword ? `Kết quả tìm kiếm "${keyword}"` : 'Danh mục văn bản hiện hành'}
          </span>
          <span className="bg-slate-200/80 text-slate-700 font-semibold px-2 py-0.5 rounded-md text-[11px]">
            {isLoading ? 'Đang tải...' : `${totalItems} văn bản`}
          </span>
          {totalPages > 1 && !isLoading && (
            <span className="text-slate-500 text-[11px]">
              (Trang {page}/{totalPages})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-white border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              aria-pressed={viewLayout === 'grid'}
              title="Xem dạng lưới"
              className={`px-2 py-1 rounded-md flex items-center gap-1 text-[11px] font-medium transition-colors ${
                viewLayout === 'grid'
                  ? 'bg-dut-800 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lưới</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('list')}
              aria-pressed={viewLayout === 'list'}
              title="Xem dạng danh sách"
              className={`px-2 py-1 rounded-md flex items-center gap-1 text-[11px] font-medium transition-colors ${
                viewLayout === 'list'
                  ? 'bg-dut-800 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Danh sách</span>
            </button>
          </div>
        </div>
      </div>

      {isError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-xs font-medium">
          Không tải được danh mục văn bản. Vui lòng kiểm tra kết nối máy chủ và thử lại.
        </div>
      )}

      {searchResult?.guardrailBlocked && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Từ khóa ngoài phạm vi tra cứu quy chế học vụ DUT</p>
            <p className="mt-0.5">{searchResult.guardrailMessage}</p>
          </div>
        </div>
      )}

      {!isLoading && !isError && !searchResult?.guardrailBlocked && regulations.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <SearchX className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="mt-3 text-sm font-bold text-slate-900">Không tìm thấy văn bản phù hợp</p>
          <p className="mt-1 text-xs text-slate-500">
            Hãy thử rút gọn từ khóa hoặc xóa bớt bộ lọc danh mục/chủ đề.
          </p>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={reset}
              className="mt-3 text-xs font-semibold text-dut-700 hover:underline"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Results View: Grid or Compact List */}
      {regulations.length > 0 && viewLayout === 'grid' && (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${
            isFetching ? 'opacity-60' : ''
          }`}
        >
          {regulations.map((doc) => {
            const cat = REGULATION_CATEGORIES.find((c) => c.id === doc.category);
            const pdfHref = doc.id > 0 ? regulationApi.getPdfUrl(doc.id) : doc.pdfUrl;
            const relatedProcId = findRelatedProcedureId(doc);
            const visibleTags = (doc.tags ?? []).slice(0, 3);
            const extraTagCount = Math.max(0, (doc.tags?.length ?? 0) - 3);

            return (
              <article
                key={doc.id}
                className="bg-white border border-slate-200 hover:border-dut-600/70 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-semibold text-dut-800 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                        {doc.documentNumber}
                      </span>
                      {cat && (
                        <span className="text-slate-600 font-medium truncate">{cat.label}</span>
                      )}
                    </div>
                    {doc.issuedDate && (
                      <span className="text-slate-400 shrink-0">{doc.issuedDate}</span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug line-clamp-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDoc(doc)}
                        className="text-left hover:text-dut-800 transition-colors"
                      >
                        {cleanDisplayText(doc.title)}
                      </button>
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {cleanDisplayText(doc.issuer)}
                      {doc.matchedClause ? ` • Đoạn liên quan: ${doc.matchedClause}` : ''}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {cleanDisplayText(doc.matchedExcerpt || doc.summary) || 'Xem chi tiết trong văn bản đính kèm.'}
                  </p>

                  {visibleTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 text-[11px]">
                      {visibleTags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTag(t)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                      {extraTagCount > 0 && (
                        <span className="text-slate-400 px-1">+{extraTagCount}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-dut-800 hover:bg-dut-700 text-white inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Đọc văn bản</span>
                    </button>
                    {pdfHref && (
                      <a
                        href={pdfHref}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 inline-flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-medium">
                    <Link
                      to={buildAiChatUrl({
                        q: `Tóm tắt nội dung chính và các điều kiện áp dụng trong văn bản ${doc.documentNumber} ("${cleanDisplayText(doc.title)}")`,
                        doc: doc.documentNumber,
                        autoSend: true,
                      })}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-dut-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                    >
                      <MessageSquareText className="w-3.5 h-3.5" />
                      <span>Hỏi đáp</span>
                    </Link>
                    {relatedProcId && (
                      <Link
                        to={buildProcedureUrl(relatedProcId)}
                        className="inline-flex items-center gap-1 text-dut-700 hover:text-dut-900 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Thủ tục</span>
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {regulations.length > 0 && viewLayout === 'list' && (
        <div
          className={`bg-white border border-slate-200 rounded-xl overflow-hidden transition-opacity ${
            isFetching ? 'opacity-60' : ''
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-4 whitespace-nowrap">Số hiệu</th>
                  <th className="py-2.5 px-4">Tên văn bản &amp; Cơ quan ban hành</th>
                  <th className="py-2.5 px-4 whitespace-nowrap hidden md:table-cell">Lĩnh vực</th>
                  <th className="py-2.5 px-4 whitespace-nowrap text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regulations.map((doc) => {
                  const cat = REGULATION_CATEGORIES.find((c) => c.id === doc.category);
                  const pdfHref = doc.id > 0 ? regulationApi.getPdfUrl(doc.id) : doc.pdfUrl;
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 align-top font-mono font-semibold text-dut-800 whitespace-nowrap">
                        <div>{doc.documentNumber}</div>
                        {doc.issuedDate && (
                          <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                            {doc.issuedDate}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-top">
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          className="font-semibold text-slate-900 hover:text-dut-800 text-left line-clamp-2"
                        >
                          {cleanDisplayText(doc.title)}
                        </button>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {cleanDisplayText(doc.issuer)}
                          {doc.matchedClause ? ` • ${doc.matchedClause}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top whitespace-nowrap hidden md:table-cell text-slate-600">
                        {cat?.label || doc.field || 'Quy chế'}
                      </td>
                      <td className="py-3 px-4 align-top whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDoc(doc)}
                            className="px-2.5 py-1 rounded-md bg-dut-800 text-white font-semibold hover:bg-dut-700 transition-colors"
                          >
                            Đọc
                          </button>
                          {pdfHref && (
                            <a
                              href={pdfHref}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                            >
                              PDF
                            </a>
                          )}
                          <Link
                            to={buildAiChatUrl({
                              q: `Tóm tắt nội dung chính trong văn bản ${doc.documentNumber}`,
                              doc: doc.documentNumber,
                              autoSend: true,
                            })}
                            className="px-2 py-1 rounded-md border border-slate-200 text-dut-700 hover:bg-blue-50"
                          >
                            Hỏi đáp
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {!searchResult?.guardrailBlocked && (
        <Pagination
          page={page}
          size={size}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onSizeChange={setSize}
        />
      )}

      {/* Modal Document Viewer */}
      <DocumentViewerModal
        regulation={selectedDoc}
        highlightClause={selectedDoc?.matchedClause || undefined}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
};
