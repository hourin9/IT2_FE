import React, { useMemo, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { PROMPT_SUGGESTIONS, PromptSuggestion } from '../data/promptSuggestions';
import { useModalDismiss } from '../hooks/useModalDismiss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (query: string) => void;
  disabled?: boolean;
}

const CATEGORY_TABS: { code: 'popular' | PromptSuggestion['category_code']; label: string }[] = [
  { code: 'popular', label: 'Phổ biến' },
  { code: 'scholarship', label: 'Học bổng' },
  { code: 'academic_warning', label: 'Cảnh cáo HV' },
  { code: 'graduation', label: 'Tốt nghiệp' },
  { code: 'registration', label: 'Tín chỉ' },
  { code: 'student_affairs', label: 'Thủ tục SV' },
];

export const PromptSuggestComponent: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectPrompt,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<'popular' | PromptSuggestion['category_code']>('popular');
  const { backdropProps } = useModalDismiss(isOpen, onClose);

  const visiblePrompts = useMemo(() => {
    if (activeTab === 'popular') {
      return PROMPT_SUGGESTIONS.filter((p) => p.popular);
    }
    return PROMPT_SUGGESTIONS.filter((p) => p.category_code === activeTab);
  }, [activeTab]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-drawer-title"
      {...backdropProps}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-[1px]"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[82vh] flex flex-col overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-dut-800" />
            <h3 id="prompt-drawer-title" className="text-sm font-bold text-slate-900">
              Thư viện câu hỏi học vụ thường gặp
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng danh sách gợi ý"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 flex flex-wrap gap-1.5 bg-white">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.code;
            return (
              <button
                key={tab.code}
                type="button"
                onClick={() => setActiveTab(tab.code)}
                className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${
                  isActive
                    ? 'bg-dut-800 text-white border-dut-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
          {visiblePrompts.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                onSelectPrompt(item.query);
                onClose();
              }}
              className="w-full text-left p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-dut-600/60 transition-colors disabled:opacity-50 space-y-1"
            >
              <div className="text-xs font-bold text-dut-800">{item.label}</div>
              <div className="text-xs text-slate-600 leading-relaxed">{item.query}</div>
            </button>
          ))}
        </div>

        <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Chọn một câu hỏi để gửi ngay cho trợ lý</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-md border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
