import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, idx) => idx + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push('ellipsis');
  for (let p = left; p <= right; p += 1) {
    pages.push(p);
  }
  if (right < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  size,
  totalItems,
  totalPages,
  onPageChange,
  onSizeChange,
  pageSizeOptions = [12, 24, 48],
}) => {
  if (totalItems === 0) return null;

  const startItem = (page - 1) * size + 1;
  const endItem = Math.min(page * size, totalItems);
  const items = buildPageNumbers(page, Math.max(1, totalPages));

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs">
      <div className="flex flex-wrap items-center gap-3 text-slate-600">
        <span>
          Hiển thị{' '}
          <strong className="text-slate-900">
            {startItem}–{endItem}
          </strong>{' '}
          trên tổng <strong className="text-slate-900">{totalItems}</strong> văn bản
        </span>

        <label className="inline-flex items-center gap-1.5 text-slate-500">
          <span>Số dòng:</span>
          <select
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            aria-label="Số văn bản mỗi trang"
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-dut-600/20"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / trang
              </option>
            ))}
          </select>
        </label>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Phân trang văn bản" className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trước</span>
          </button>

          {items.map((entry, idx) =>
            entry === 'ellipsis' ? (
              <span key={`e-${idx}`} className="px-2 py-1 text-slate-400 select-none">
                ...
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => onPageChange(entry)}
                aria-current={entry === page ? 'page' : undefined}
                className={`min-w-[32px] px-2.5 py-1.5 rounded-lg font-semibold border transition-colors ${
                  entry === page
                    ? 'bg-dut-800 text-white border-dut-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {entry}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <span className="hidden sm:inline">Sau</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </nav>
      )}
    </div>
  );
};
