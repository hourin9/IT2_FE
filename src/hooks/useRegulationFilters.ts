import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, ClipboardList, Gavel, LayoutGrid, LucideIcon } from 'lucide-react';
import { Regulation } from '../types';

export type RegulationCategory = 'ALL' | Regulation['category'];

/** Danh mục + icon/màu theo bản mock. */
export const REGULATION_CATEGORIES: {
  id: RegulationCategory;
  label: string;
  icon: LucideIcon;
  iconClass: string;
  badgeClass: string;
}[] = [
  {
    id: 'ALL',
    label: 'Tất cả văn bản',
    icon: LayoutGrid,
    iconClass: 'text-slate-500',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    id: 'HOC_BONG',
    label: 'Học bổng & Hỗ trợ tài chính',
    icon: Award,
    iconClass: 'text-amber-600',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'THU_TUC_MOT_CUA',
    label: 'Thủ tục một cửa',
    icon: ClipboardList,
    iconClass: 'text-blue-600',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    id: 'HOC_VU',
    label: 'Quy chế đào tạo',
    icon: Gavel,
    iconClass: 'text-purple-600',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
  },
];

const isCategory = (v: string | null): v is RegulationCategory =>
  REGULATION_CATEGORIES.some((c) => c.id === v);

/**
 * State bộ lọc tra cứu quy chế, lưu trên URL (?q=&category=&tag=)
 * để giữ được khi reload, chia sẻ link và bấm Back.
 */
export function useRegulationFilters() {
  const [params, setParams] = useSearchParams();

  const keyword = params.get('q') ?? '';
  const rawCategory = params.get('category');
  const category: RegulationCategory = isCategory(rawCategory) ? rawCategory : 'ALL';
  const tagKey = params.getAll('tag').join('\u0000');
  const tags = useMemo(() => (tagKey ? tagKey.split('\u0000') : []), [tagKey]);

  const update = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          mutate(next);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setKeyword = useCallback(
    (value: string) =>
      update((next) => {
        if (value) next.set('q', value);
        else next.delete('q');
      }),
    [update],
  );

  const setCategory = useCallback(
    (value: RegulationCategory) =>
      update((next) => {
        if (value === 'ALL') next.delete('category');
        else next.set('category', value);
        // Tag phụ thuộc vào tập văn bản của danh mục nên bỏ chọn khi đổi danh mục.
        next.delete('tag');
      }),
    [update],
  );

  const toggleTag = useCallback(
    (tag: string) =>
      update((next) => {
        const current = next.getAll('tag');
        next.delete('tag');
        const updated = current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag];
        updated.forEach((t) => next.append('tag', t));
      }),
    [update],
  );

  const reset = useCallback(
    () =>
      update((next) => {
        next.delete('q');
        next.delete('category');
        next.delete('tag');
      }),
    [update],
  );

  const activeCount = (keyword ? 1 : 0) + (category !== 'ALL' ? 1 : 0) + tags.length;

  return { keyword, category, tags, activeCount, setKeyword, setCategory, toggleTag, reset };
}
