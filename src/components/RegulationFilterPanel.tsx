import React from 'react';
import { RotateCcw, Tag } from 'lucide-react';
import { REGULATION_CATEGORIES, RegulationCategory } from '../hooks/useRegulationFilters';

interface RegulationFilterPanelProps {
  category: RegulationCategory;
  onCategoryChange: (category: RegulationCategory) => void;
  availableTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  activeCount: number;
  onReset: () => void;
}

/** Bộ lọc danh mục/tag dạng pill nằm ngang ngay dưới ô tìm kiếm, theo bản mock. */
export const RegulationFilterPanel: React.FC<RegulationFilterPanelProps> = ({
  category,
  onCategoryChange,
  availableTags,
  selectedTags,
  onToggleTag,
  activeCount,
  onReset,
}) => (
  <div className="space-y-2.5 text-xs">
    <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Danh mục">
      {REGULATION_CATEGORIES.map(({ id, label, icon: Icon, iconClass }) => {
        const active = category === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onCategoryChange(id)}
            aria-pressed={active}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              active
                ? 'bg-dut-800 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Icon className={`w-[15px] h-[15px] ${active ? '' : iconClass}`} />
            <span>{label}</span>
          </button>
        );
      })}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="ml-auto shrink-0 inline-flex items-center gap-1 text-dut-700 font-bold hover:underline"
        >
          <RotateCcw className="w-3 h-3" />
          Xóa bộ lọc
        </button>
      )}
    </div>

    {availableTags.length > 0 && (
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Tag">
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold mr-1">
          <Tag className="w-3 h-3" />
          Tag
        </span>
        {availableTags.map((tag) => {
          const selected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              aria-pressed={selected}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-all ${
                selected
                  ? 'bg-blue-50 text-dut-700 border-blue-200 font-semibold'
                  : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    )}
  </div>
);
