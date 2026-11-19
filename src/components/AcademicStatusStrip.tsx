import React from 'react';
import { Link } from 'react-router-dom';
import { User, Award, BookOpen, GraduationCap, ChevronRight } from 'lucide-react';
import { useStudent } from '../contexts/StudentContext';
import { buildCalendarUrl, buildProcedureUrl } from '../utils/crossTabLinks';

interface Props {
  compact?: boolean;
}

export const AcademicStatusStrip: React.FC<Props> = ({ compact = false }) => {
  const { student } = useStudent();

  if (compact) {
    return (
      <div className="bg-white border-b border-slate-200 py-1.5 px-4 sm:px-6 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-700 min-w-0">
            <User className="w-3.5 h-3.5 text-dut-700 shrink-0" />
            <span className="font-semibold text-slate-900 truncate">{student.fullName}</span>
            <span className="font-mono text-slate-500">({student.studentCode})</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <Link
              to={buildCalendarUrl()}
              className="hidden sm:inline text-slate-600 hover:text-dut-700 hover:underline truncate"
            >
              {student.className} — {student.faculty}
            </Link>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <Link
              to={buildProcedureUrl(1)}
              title="Xem đối soát tiêu chuẩn học bổng"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-dut-800 transition-colors"
            >
              <span>ĐTBCHK:</span>
              <strong className="text-dut-800">{Number(student.gpa).toFixed(2)}</strong>
              <span>• ĐRL:</span>
              <strong className="text-emerald-700">{student.trainingPoint}</strong>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              TC: <strong className="text-slate-800">{student.accumulatedCredits}/{student.totalCredits}</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-slate-200 py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs">
        {/* Student Info -> Calendar link */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-dut-800 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-slate-900">{student.fullName}</span>
            <span className="text-slate-500 ml-1.5 font-mono">({student.studentCode})</span>
            <span className="hidden sm:inline text-slate-300 mx-2">•</span>
            <Link
              to={buildCalendarUrl()}
              title="Xem lịch học vụ theo lớp & khoa"
              className="hidden sm:inline-flex items-center gap-0.5 text-slate-600 hover:text-dut-800 hover:underline font-medium"
            >
              <span>
                {student.className} — {student.faculty}
              </span>
            </Link>
          </div>
        </div>

        {/* Academic metrics -> Scholarship check shortcut */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-slate-700">
          <Link
            to={buildProcedureUrl(1)}
            title="Đối soát điều kiện học bổng với điểm hiện tại"
            className="group flex items-center gap-1.5 hover:text-dut-800 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-dut-700" />
            <span className="text-slate-500">ĐTBCHK:</span>
            <span className="font-bold text-dut-800 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
              {Number(student.gpa).toFixed(2)}
            </span>
          </Link>

          <Link
            to={buildProcedureUrl(1)}
            title="Đối soát điều kiện học bổng với điểm rèn luyện"
            className="flex items-center gap-1.5 hover:text-emerald-800 transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-500">ĐRL:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
              {student.trainingPoint} đ
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">Tín chỉ:</span>
            <span className="font-semibold text-slate-900">
              {student.accumulatedCredits}/{student.totalCredits}
            </span>
          </div>

          <Link
            to={buildProcedureUrl(1)}
            className="hidden md:inline-flex items-center gap-0.5 text-[11px] font-semibold text-dut-700 hover:underline"
          >
            <span>Xét học bổng</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
