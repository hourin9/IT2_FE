import React, { useState } from 'react';
import { ChevronDown, Filter, RotateCcw } from 'lucide-react';
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

/** Bộ lọc danh mục/tag: sidebar trên desktop, dropdown thu gọn trên mobile. */
export const RegulationFilterPanel: React.FC<RegulationFilterPanelProps> = ({
  category,
  onCategoryChange,
  availableTags,
  selectedTags,
  onToggleTag,
  activeCount,
  onReset,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-dut-outline-variant/30 lg:sticky lg:top-4">
      <div className="flex items-center justify-between gap-2 p-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-2 text-sm font-bold text-dut-on-surface lg:pointer-events-none"
        >
          <Filter className="w-4 h-4 text-dut-primary" />
          <span>Bộ lọc</span>
          {activeCount > 0 && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-dut-primary text-white">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-dut-outline transition-transform lg:hidden ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-dut-primary hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div className={`${open ? 'block' : 'hidden'} lg:block px-4 pb-4 space-y-5`}>
        <fieldset>
          <legend className="text-[11px] uppercase tracking-wider font-semibold text-dut-outline mb-2">
            Danh mục
          </legend>
          <div className="flex flex-col gap-1">
            {REGULATION_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onCategoryChange(c.id)}
                aria-pressed={category === c.id}
                className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  category === c.id
                    ? 'bg-dut-primary text-white shadow-sm'
                    : 'hover:bg-dut-surface-container text-dut-on-surface-variant'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>

        {availableTags.length > 0 && (
          <fieldset>
            <legend className="text-[11px] uppercase tracking-wider font-semibold text-dut-outline mb-2">
              Tag
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onToggleTag(tag)}
                    aria-pressed={selected}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      selected
                        ? 'bg-dut-primary/10 border-dut-primary text-dut-primary'
                        : 'border-dut-outline-variant/60 text-dut-on-surface-variant hover:border-dut-primary/50'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
      </div>
    </aside>
  );
};
