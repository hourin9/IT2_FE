import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  Bell,
  BellRing,
  Filter,
  ClipboardCheck,
  BookOpen,
  MessageSquareText,
} from 'lucide-react';
import { eventApi } from '../services/api';
import { useStudent } from '../contexts/StudentContext';
import { useToast } from '../contexts/ToastContext';
import { AcademicEvent } from '../types';
import {
  buildAiChatUrl,
  buildCatalogUrl,
  buildProcedureUrl,
} from '../utils/crossTabLinks';

const REMINDER_STORAGE_KEY = 'dut_calendar_reminders';

function loadReminders(): number[] {
  try {
    const raw = window.localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'number') : [];
  } catch {
    return [];
  }
}

export const CalendarPage: React.FC = () => {
  const { student } = useStudent();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterType = searchParams.get('type') || 'ALL';

  const [remindedIds, setRemindedIds] = useState<number[]>(loadReminders);

  const setFilterType = (nextType: string) => {
    setSearchParams(nextType === 'ALL' ? {} : { type: nextType }, { replace: true });
  };

  const { data: events, isLoading } = useQuery({
    queryKey: ['academic-events', filterType, student.faculty, student.className],
    queryFn: () => eventApi.getEvents(filterType, student.faculty, student.className),
  });

  const toggleReminder = (ev: AcademicEvent) => {
    const exists = remindedIds.includes(ev.id);
    const next = exists
      ? remindedIds.filter((id) => id !== ev.id)
      : [...remindedIds, ev.id];
    setRemindedIds(next);
    try {
      window.localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage failure
    }
    showToast(
      exists
        ? `Đã tắt nhắc hẹn: "${ev.title}"`
        : `Đã lưu nhắc hẹn cho sự kiện: "${ev.title}"`,
      exists ? 'info' : 'success',
    );
  };

  const filterOptions = [
    { id: 'ALL', label: 'Tất cả mốc sự kiện' },
    { id: 'HOC_BONG', label: 'Học bổng' },
    { id: 'HOC_VU', label: 'Học vụ tín chỉ' },
    { id: 'HOC_PHI', label: 'Học phí' },
  ];

  const getEventActionLink = (ev: AcademicEvent) => {
    if (ev.eventType === 'HOC_BONG') {
      return {
        to: buildProcedureUrl(1),
        label: 'Thủ tục học bổng',
        icon: ClipboardCheck,
      };
    }
    if (ev.eventType === 'HOC_PHI') {
      return {
        to: buildCatalogUrl({ category: 'HOC_BONG', q: 'học phí' }),
        label: 'Xem quy định học phí',
        icon: BookOpen,
      };
    }
    return {
      to: buildCatalogUrl({ category: 'HOC_VU' }),
      label: 'Quy chế học vụ',
      icon: BookOpen,
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Header & Filter Bar */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-dut-800 shrink-0" />
            <span>Lịch &amp; Thông báo Học vụ</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mốc thời hạn dành cho lớp <strong className="text-slate-700">{student.className}</strong> —{' '}
            <strong className="text-slate-700">{student.faculty}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          <Filter className="w-4 h-4 text-slate-400 mr-1 hidden sm:block" />
          {filterOptions.map((opt) => {
            const active = filterType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilterType(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  active
                    ? 'bg-dut-800 text-white border-dut-800'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Events Timeline / Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="h-44 bg-white border border-slate-200 rounded-xl p-5 animate-pulse" />
          ))}
        </div>
      ) : !events || events.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-xs text-slate-500">
          Chưa có sự kiện nào thuộc nhóm bộ lọc này.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => {
            const isReminded = remindedIds.includes(ev.id);
            const action = getEventActionLink(ev);
            const ActionIcon = action.icon;

            return (
              <article
                key={ev.id}
                className={`bg-white rounded-xl p-5 border transition-colors flex flex-col justify-between ${
                  ev.isDeadline
                    ? 'border-amber-300'
                    : 'border-slate-200 hover:border-dut-600/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border inline-flex items-center gap-1 ${
                        ev.isDeadline
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-blue-50 text-dut-800 border-blue-200'
                      }`}
                    >
                      {ev.isDeadline && <AlertTriangle className="w-3 h-3" />}
                      <span>{ev.isDeadline ? 'Hạn chót' : 'Thông báo'}</span>
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(ev.eventDate).toLocaleDateString('vi-VN')}</span>
                    </span>
                  </div>

                  <h2 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2">
                    {ev.title}
                  </h2>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {ev.description || 'Xem thông báo chi tiết trên cổng sinh viên sv.dut.udn.vn.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-slate-400">
                      Phạm vi: {ev.classScope !== 'ALL' ? ev.classScope : 'Toàn trường'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleReminder(ev)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        isReminded
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'text-dut-800 hover:bg-slate-100'
                      }`}
                    >
                      {isReminded ? (
                        <BellRing className="w-3.5 h-3.5" />
                      ) : (
                        <Bell className="w-3.5 h-3.5" />
                      )}
                      <span>{isReminded ? 'Đã nhắc hẹn' : 'Nhắc hẹn'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-medium pt-1">
                    <Link
                      to={action.to}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <ActionIcon className="w-3 h-3" />
                      <span>{action.label}</span>
                    </Link>
                    <Link
                      to={buildAiChatUrl({
                        q: `Cho biết lưu ý, điều kiện và thủ tục cần làm liên quan đến "${ev.title}"`,
                        autoSend: true,
                      })}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-dut-800 transition-colors ml-auto"
                    >
                      <MessageSquareText className="w-3 h-3" />
                      <span>Hỏi lưu ý</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
