export interface Student {
  id: number;
  studentCode: string;
  fullName: string;
  className: string;
  faculty: string;
  gpa: number;
  trainingPoint: number;
  accumulatedCredits: number;
  totalCredits: number;
  email: string;
}

export interface Regulation {
  id: number;
  documentId?: string;
  documentNumber: string;
  title: string;
  category: 'HOC_BONG' | 'HOC_VU' | 'THU_TUC_MOT_CUA';
  field?: string;
  status?: string;
  tags?: string[];
  issuer: string;
  issuedDate?: string;
  effectiveDate?: string;
  pdfUrl?: string;
  summary?: string;
  contentHtml?: string;
  semanticScore?: number | null;
  matchedClause?: string | null;
  matchedExcerpt?: string | null;
}

export interface SearchResponse {
  query: string;
  category: string;
  tags: string[];
  total: number;
  page?: number;
  size?: number;
  totalItems?: number;
  totalPages?: number;
  availableTags?: string[];
  semanticUsed: boolean;
  guardrailBlocked: boolean;
  guardrailMessage?: string | null;
  items: Regulation[];
}

export interface RegulationContent {
  id: number;
  documentNumber: string;
  title: string;
  contentHtml?: string | null;
  markdown?: string | null;
}

export interface DocStep {
  order: number;
  title: string;
  description: string;
}

export interface DocDetail {
  id: number;
  title: string;
  summary?: string;
  steps?: DocStep[];
  file_url?: string;
  tags?: string[];
}

export interface ProcedureCriteria {
  id: number;
  procedureName: string;
  gradeLevel: 'LOAI_XUAT_SAC' | 'LOAI_GIOI' | 'LOAI_KHA';
  minGpa: number;
  maxGpa?: number;
  minTrainingPoint: number;
  description: string;
}

export interface EvaluationResult {
  studentCode: string;
  fullName: string;
  gpa: number;
  trainingPoint: number;
  eligibleLevel: 'LOAI_XUAT_SAC' | 'LOAI_GIOI' | 'LOAI_KHA' | 'KHONG_DU_DIEU_KIEN';
  statusMessage: string;
  checklistSteps: string[];
}

export interface Citation {
  documentNumber: string;
  documentTitle: string;
  clause: string;
  excerpt: string;
  pageNumber?: number;
  pdfUrl: string;
}

export interface ChatResponse {
  answer: string;
  sources: Citation[];
  suggestions: string[];
}

export interface AcademicEvent {
  id: number;
  title: string;
  eventType: 'HOC_BONG' | 'HOC_VU' | 'HOC_PHI' | 'SU_KIEN_CHUNG';
  eventDate: string;
  isDeadline: boolean;
  facultyScope: string;
  classScope: string;
  description: string;
}
