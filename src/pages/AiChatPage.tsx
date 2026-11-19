import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  MessageSquareText,
  Send,
  FileText,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  HelpCircle,
  X,
} from 'lucide-react';
import { chatApi } from '../services/api';
import { ChatResponse, Citation } from '../types';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { PromptSuggestComponent } from '../components/PromptSuggestComponent';
import { PROMPT_SUGGESTIONS } from '../data/promptSuggestions';
import { renderSafeMarkdown } from '../utils/sanitize';
import { useStudent } from '../contexts/StudentContext';
import {
  buildCatalogUrl,
  buildProcedureUrl,
  findRelatedProcedureId,
} from '../utils/crossTabLinks';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  citations?: Citation[];
  suggestions?: string[];
  isError?: boolean;
}

const WELCOME_TEXT =
  'Xin chào! Tôi là kênh hỗ trợ giải đáp quy chế đào tạo, học bổng và thủ tục một cửa của Trường ĐHBK – ĐHĐN. Bạn có thể đặt câu hỏi trực tiếp hoặc chọn nhanh một chủ đề bên dưới.';

const STARTER_PROMPTS = PROMPT_SUGGESTIONS.filter((p) => p.popular).slice(0, 4);

export const AiChatPage: React.FC = () => {
  const { student } = useStudent();
  const [searchParams, setSearchParams] = useSearchParams();

  const [input, setInput] = useState('');
  const [contextDoc, setContextDoc] = useState<string | null>(null);
  const [isPromptDrawerOpen, setIsPromptDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: WELCOME_TEXT },
  ]);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handledQueryKeyRef = useRef<string | null>(null);

  const chatMutation = useMutation({
    mutationFn: (text: string) => chatApi.ask(text, student.studentCode),
    onSuccess: (data: ChatResponse) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.answer,
          citations: data.sources,
          suggestions: data.suggestions,
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Hiện chưa kết nối được tới máy chủ hỗ trợ tra cứu. Vui lòng kiểm tra kết nối hệ thống và thử lại sau.',
          isError: true,
        },
      ]);
    },
  });

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chatMutation.isPending) return;
    setMessages((prev) => [...prev, { sender: 'user', text: trimmed }]);
    setInput('');
    chatMutation.mutate(trimmed);
  };

  // Support cross-tab links: /ai-chat?q=...&doc=...&autoSend=1
  useEffect(() => {
    const qParam = searchParams.get('q');
    const docParam = searchParams.get('doc');
    const autoSend = searchParams.get('autoSend') === '1';

    if (!qParam && !docParam) return;
    const key = `${qParam ?? ''}|${docParam ?? ''}|${autoSend}`;
    if (handledQueryKeyRef.current === key) return;
    handledQueryKeyRef.current = key;

    if (docParam) {
      setContextDoc(docParam);
    }

    if (qParam) {
      if (autoSend) {
        setMessages((prev) => [...prev, { sender: 'user', text: qParam }]);
        chatMutation.mutate(qParam);
      } else {
        setInput(qParam);
      }
    }

    // Clear one-shot query params so F5 doesn't re-trigger autoSend
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Keep latest message scrolled into view inside the chat pane
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, chatMutation.isPending]);

  const handleReset = () => {
    setContextDoc(null);
    setMessages([
      {
        sender: 'ai',
        text: 'Phiên trao đổi đã được làm mới. Bạn cần tra cứu quy chế hoặc thủ tục nào tiếp theo?',
      },
    ]);
  };

  const hasConversationStarted = messages.length > 1;

  return (
    <div className="flex-1 min-h-0 flex flex-col max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 gap-3 h-[calc(100dvh-6.25rem)]">
      {/* Compact Workspace Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-dut-800 text-white flex items-center justify-center shrink-0">
            <MessageSquareText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              Hỏi đáp Quy chế &amp; Thủ tục Sinh viên
            </h2>
            <p className="text-xs text-slate-500 truncate">
              Đối soát trực tiếp theo kho văn bản pháp quy chính thức của Trường ĐHBK – ĐHĐN
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPromptDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-dut-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Câu hỏi gợi ý</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-dut-800 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Chat Container */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Scrollable Messages Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-dut-800 text-white rounded-br-sm'
                    : m.isError
                      ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-bl-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-sm'
                }`}
              >
                {m.sender === 'user' ? (
                  <div className="whitespace-pre-line">{m.text}</div>
                ) : m.isError ? (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{m.text}</span>
                  </div>
                ) : (
                  <div
                    className="legal-prose max-w-none prose-p:my-1.5"
                    dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(m.text) }}
                  />
                )}

                {/* Citations Box */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-dut-800 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Văn bản căn cứ &amp; Trích dẫn</span>
                    </span>
                    {m.citations.map((cite, cIdx) => {
                      const relatedProcId = findRelatedProcedureId({
                        documentNumber: cite.documentNumber,
                        title: cite.documentTitle || '',
                        category: 'HOC_VU',
                        tags: [],
                      });

                      return (
                        <div
                          key={cIdx}
                          className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-dut-800">
                              {cite.documentNumber} {cite.clause ? `(${cite.clause})` : ''}
                            </p>
                            <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                              {cite.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedCitation(cite)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-dut-800 text-white hover:bg-dut-700 rounded-md inline-flex items-center gap-1 whitespace-nowrap transition-colors"
                            >
                              <span>Đối chiếu</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                            <Link
                              to={buildCatalogUrl({ q: cite.documentNumber })}
                              title="Tìm văn bản này trong danh mục Tra cứu"
                              className="px-2 py-1 text-[11px] font-medium border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-md inline-flex items-center gap-1 whitespace-nowrap transition-colors"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span className="hidden sm:inline">Tra cứu</span>
                            </Link>
                            {relatedProcId && (
                              <Link
                                to={buildProcedureUrl(relatedProcId)}
                                className="px-2 py-1 text-[11px] font-medium border border-blue-200 bg-blue-50 text-dut-800 hover:bg-blue-100 rounded-md inline-flex items-center gap-1 whitespace-nowrap transition-colors"
                              >
                                <ClipboardCheck className="w-3 h-3" />
                                <span className="hidden sm:inline">Thủ tục</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Follow-up Suggestions */}
                {m.suggestions && m.suggestions.length > 0 && idx === messages.length - 1 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap gap-1.5">
                    {m.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        disabled={chatMutation.isPending}
                        onClick={() => handleSend(sug)}
                        className="text-[11px] bg-white hover:bg-blue-50 text-dut-800 px-2.5 py-1 rounded-md border border-slate-200 hover:border-blue-200 transition-colors text-left"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty-state Starter Cards ONLY before user starts chatting */}
          {!hasConversationStarted && !chatMutation.isPending && (
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Chủ đề hay gặp</span>
                <button
                  type="button"
                  onClick={() => setIsPromptDrawerOpen(true)}
                  className="text-dut-700 font-semibold hover:underline"
                >
                  Xem toàn bộ {PROMPT_SUGGESTIONS.length} câu hỏi →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTER_PROMPTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSend(item.query)}
                    className="text-left p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50/60 hover:border-dut-600/50 transition-colors space-y-0.5"
                  >
                    <p className="text-xs font-bold text-dut-800">{item.label}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.query}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Skeleton Loading */}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="w-full max-w-[75%] bg-slate-50 border border-slate-200 p-4 rounded-xl rounded-bl-sm space-y-2 animate-pulse">
                <div className="text-[11px] font-medium text-slate-400">
                  Đang đối soát văn bản quy chế...
                </div>
                <div className="h-3 bg-slate-200 rounded w-5/6" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pinned Composer Bar at Bottom (Always Visible Above the Fold) */}
        <div className="border-t border-slate-200 bg-slate-50 p-3 shrink-0 space-y-2">
          {contextDoc && (
            <div className="flex items-center justify-between gap-2 bg-blue-50 border border-blue-200 text-dut-800 px-2.5 py-1 rounded-md text-[11px]">
              <span>
                Ngữ cảnh tham chiếu: <strong className="font-mono">{contextDoc}</strong>
              </span>
              <button
                type="button"
                onClick={() => setContextDoc(null)}
                aria-label="Xóa ngữ cảnh văn bản"
                className="p-0.5 rounded hover:bg-blue-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-end gap-2"
          >
            <button
              type="button"
              onClick={() => setIsPromptDrawerOpen(true)}
              title="Mở thư viện câu hỏi gợi ý"
              aria-label="Mở thư viện câu hỏi gợi ý"
              className="p-2.5 rounded-lg bg-white border border-slate-300 text-slate-600 hover:text-dut-800 hover:bg-slate-100 transition-colors shrink-0"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Nhập câu hỏi về quy chế, điểm rèn luyện, học bổng hoặc thủ tục..."
              className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-dut-600/20 focus:border-dut-800 resize-none max-h-28"
            />

            <button
              type="submit"
              disabled={!input.trim() || chatMutation.isPending}
              className="px-4 py-2.5 bg-dut-800 hover:bg-dut-700 text-white rounded-lg font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </form>
        </div>
      </div>

      {/* Prompt Library Modal/Drawer (Closes on Backdrop Click or Esc) */}
      <PromptSuggestComponent
        isOpen={isPromptDrawerOpen}
        onClose={() => setIsPromptDrawerOpen(false)}
        onSelectPrompt={(q) => handleSend(q)}
        disabled={chatMutation.isPending}
      />

      {/* Citation Document Viewer Modal */}
      {selectedCitation && (
        <DocumentViewerModal
          regulation={{
            id: 0,
            documentNumber: selectedCitation.documentNumber,
            title: selectedCitation.documentTitle,
            category: 'HOC_BONG',
            issuer: 'Trường Đại học Bách khoa – ĐHĐN',
            summary: selectedCitation.excerpt,
            matchedExcerpt: selectedCitation.excerpt,
            pdfUrl: selectedCitation.pdfUrl,
          }}
          highlightClause={selectedCitation.clause}
          initialPage={selectedCitation.pageNumber || 1}
          onClose={() => setSelectedCitation(null)}
        />
      )}
    </div>
  );
};
