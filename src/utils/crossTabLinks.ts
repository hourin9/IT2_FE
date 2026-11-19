import { Regulation } from '../types';

export interface ProcedureReference {
  docId: number;
  label: string;
  regulationQuery: string;
  regulationLabel: string;
  notes: string[];
}

export const PROCEDURE_REFERENCES: Record<number, ProcedureReference> = {
  1: {
    docId: 1,
    label: 'Học bổng Khuyến khích Học tập',
    regulationQuery: '1414/QĐ-ĐHBK',
    regulationLabel: 'QĐ 1414/QĐ-ĐHBK — Quy định xét cấp học bổng KKHT',
    notes: [
      'Tích lũy tối thiểu 15 tín chỉ trong kỳ học chính (hoặc theo kế hoạch đào tạo chuẩn).',
      'Không có học phần thi lần đầu dưới điểm D hoặc điểm F.',
      'Không trong thời gian chịu hình thức kỷ luật từ mức khiển trách trở lên.',
    ],
  },
  2: {
    docId: 2,
    label: 'Xin cấp Giấy xác nhận sinh viên',
    regulationQuery: 'xác nhận sinh viên',
    regulationLabel: 'Quy trình bộ phận Một cửa — Phòng Công tác Sinh viên',
    notes: [
      'Mang theo thẻ sinh viên khi nộp và nhận kết quả tại bộ phận Một cửa.',
      'Ghi rõ mục đích xác nhận (NVQS, vay vốn ngân hàng chính sách, thực tập...).',
      'Thời gian trả kết quả thông thường từ 1–2 ngày làm việc.',
    ],
  },
  3: {
    docId: 3,
    label: 'Phúc khảo điểm thi kết thúc học phần',
    regulationQuery: 'phúc khảo',
    regulationLabel: 'Quy chế đào tạo trình độ đại học — Điều khoản về khảo thí & phúc khảo',
    notes: [
      'Đơn phúc khảo chỉ được tiếp nhận trong vòng 7 ngày kể từ ngày công bố điểm.',
      'Điền chính xác mã học phần, mã lớp học phần, ngày thi và điểm đã công bố.',
      'Theo dõi cập nhật điểm mới trên hệ thống sv.dut.udn.vn sau tối đa 10 ngày làm việc.',
    ],
  },
  4: {
    docId: 4,
    label: 'Xin nghỉ học tạm thời & bảo lưu',
    regulationQuery: 'nghỉ học tạm thời',
    regulationLabel: 'Quy chế đào tạo — Nghỉ học tạm thời và bảo lưu kết quả',
    notes: [
      'Cần kèm minh chứng hợp lệ (giấy xác nhận bệnh viện, lệnh gọi NVQS, xác nhận địa phương...).',
      'Xin chữ ký Cố vấn học tập và Trưởng khoa trước khi nộp về Phòng Đào tạo.',
      'Nộp đơn xin học lại ít nhất 1 tuần trước khi bắt đầu học kỳ mới.',
    ],
  },
  5: {
    docId: 5,
    label: 'Đăng ký ở Ký túc xá sinh viên',
    regulationQuery: 'ký túc xá',
    regulationLabel: 'Quy định nội trú Ký túc xá Trường ĐHBK – ĐHĐN',
    notes: [
      'Chuẩn bị bản sao thẻ sinh viên/giấy báo nhập học, CCCD và giấy tờ diện ưu tiên (nếu có).',
      'Hoàn tất đóng phí nội trú đúng thời hạn thông báo để giữ chỗ.',
    ],
  },
};

/** Tìm ID thủ tục liên quan dựa trên thông tin văn bản quy chế. */
export function findRelatedProcedureId(reg: Pick<Regulation, 'title' | 'documentNumber' | 'category' | 'tags'>): number | null {
  const haystack = `${reg.documentNumber} ${reg.title} ${(reg.tags || []).join(' ')}`.toLowerCase();
  if (haystack.includes('1414') || haystack.includes('khuyến khích học tập') || reg.category === 'HOC_BONG') {
    return 1;
  }
  if (haystack.includes('phúc khảo')) {
    return 3;
  }
  if (haystack.includes('bảo lưu') || haystack.includes('tạm dừng') || haystack.includes('nghỉ học tạm thời')) {
    return 4;
  }
  if (haystack.includes('ký túc xá') || haystack.includes('nội trú')) {
    return 5;
  }
  if (haystack.includes('xác nhận sinh viên') || haystack.includes('một cửa') || reg.category === 'THU_TUC_MOT_CUA') {
    return 2;
  }
  return null;
}

export function buildCatalogUrl(opts: {
  q?: string;
  category?: string;
  openDoc?: string;
}): string {
  const params = new URLSearchParams();
  if (opts.q) params.set('q', opts.q);
  if (opts.category && opts.category !== 'ALL') params.set('category', opts.category);
  if (opts.openDoc) params.set('openDoc', opts.openDoc);
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

export function buildProcedureUrl(docId: number): string {
  return `/procedure?docId=${docId}`;
}

export function buildAiChatUrl(opts: {
  q: string;
  doc?: string;
  autoSend?: boolean;
}): string {
  const params = new URLSearchParams();
  params.set('q', opts.q);
  if (opts.doc) params.set('doc', opts.doc);
  if (opts.autoSend) params.set('autoSend', '1');
  return `/ai-chat?${params.toString()}`;
}

export function buildCalendarUrl(type?: string): string {
  return type && type !== 'ALL' ? `/calendar?type=${encodeURIComponent(type)}` : '/calendar';
}
