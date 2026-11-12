import React, { useEffect, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

interface SearchBarProps {
  /** Từ khóa đang được áp dụng (đã debounce). */
  value: string;
  /** Gọi khi người dùng ngừng gõ `delay` ms, nhấn Enter hoặc xóa ô tìm kiếm. */
  onSearch: (keyword: string) => void;
  delay?: number;
  isLoading?: boolean;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onSearch,
  delay = 400,
  isLoading = false,
  placeholder = 'Tìm kiếm...',
}) => {
  const [text, setText] = useState(value);
  const debouncedText = useDebounce(text, delay);

  // Người dùng ngừng gõ -> đẩy từ khóa lên cho trang gọi API.
  useEffect(() => {
    const next = debouncedText.trim();
    if (next !== value) onSearch(next);
    // Chỉ chạy khi giá trị debounce đổi; `value` đổi từ bên ngoài được xử lý ở effect dưới.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText]);

  // Từ khóa đổi từ bên ngoài (xóa bộ lọc, nút Back) -> đồng bộ lại ô nhập.
  useEffect(() => {
    setText((prev) => (prev.trim() === value ? prev : value));
  }, [value]);

  const commit = (next: string) => {
    setText(next);
    if (next.trim() !== value) onSearch(next.trim());
  };

  const isPending = text.trim() !== value;

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        commit(text); // Enter: tìm ngay, không chờ debounce
      }}
    >
      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && text) commit('');
        }}
        placeholder={placeholder}
        aria-label="Tìm kiếm văn bản, quy chế"
        className="w-full pl-10 pr-16 py-2.5 text-sm bg-dut-surface-container-low border border-dut-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-dut-primary focus:bg-white transition-all"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {(isPending || isLoading) && (
          <Loader2 className="w-4 h-4 text-dut-primary animate-spin" aria-label="Đang tìm kiếm" />
        )}
        {text && (
          <button
            type="button"
            onClick={() => commit('')}
            aria-label="Xóa từ khóa"
            className="p-1 rounded-full text-gray-400 hover:text-dut-on-surface hover:bg-dut-surface-container transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </form>
  );
};
