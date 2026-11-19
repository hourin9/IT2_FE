import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Tag } from 'lucide-react';
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

const COLLAPSED_TAG_LIMIT = 10;

export const RegulationFilterPanel: React.FC<RegulationFilterPanelProps> = ({
  category,
  onCategoryChange,
  availableTags,
  selectedTags,
  onToggleTag,
  activeCount,
  onReset,
}) => {
  const [showAllTags, setShowAllTags] = useState(false);

  const visibleTags = showAllTags
    ? availableTags
    : [
        ...selectedTags.filter((t) => availableTags.includes(t)),
        ...availableTags.filter((t) => !selectedTags.includes(t)),
      ].slice(0, COLLAPSED_TAG_LIMIT);

  const hiddenCount = Math.max(0, availableTags.length - visibleTags.length);

  return (
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
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 border ${
                active
                  ? 'bg-dut-800 text-white border-dut-800'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <Icon className={`w-[15px] h-[15px] ${active ? 'text-white' : iconClass}`} />
              <span>{label}</span>
            </button>
          );
        })}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto shrink-0 inline-flex items-center gap-1 text-dut-700 font-semibold hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa bộ lọc ({activeCount})</span>
          </button>
        )}
      </div>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Nhãn chủ đề">
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium mr-1">
            <Tag className="w-3 h-3" />
            <span>Chủ đề:</span>
          </span>
          {visibleTags.map((tag) => {
            const selected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                aria-pressed={selected}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                  selected
                    ? 'bg-blue-50 text-dut-800 border-blue-200 font-semibold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tag}
              </button>
            );
          })}
          {(hiddenCount > 0 || (showAllTags && availableTags.length > COLLAPSED_TAG_LIMIT)) && (
            <button
              type="button"
              onClick={() => setShowAllTags((v) => !v)}
              className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-dut-700 hover:underline px-1.5 py-0.5"
            >
              {showAllTags ? (
                <>
                  <span>Thu gọn</span>
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span>+{hiddenCount} chủ đề</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
