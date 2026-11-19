import axios from 'axios';
import {
  Student,
  Regulation,
  RegulationContent,
  SearchResponse,
  DocDetail,
  ProcedureCriteria,
  EvaluationResult,
  ChatResponse,
  AcademicEvent,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const studentApi = {
  getCurrentStudent: async (): Promise<Student> => {
    const res = await api.get('/students/me');
    return res.data;
  },
};

export const regulationApi = {
  search: async (category = 'ALL', keyword = '', signal?: AbortSignal): Promise<Regulation[]> => {
    const res = await api.get('/regulations', {
      params: { category, keyword },
      signal,
    });
    return res.data;
  },
  getById: async (id: number): Promise<Regulation> => {
    const res = await api.get(`/regulations/${id}`);
    return res.data;
  },
  getByNumber: async (documentNumber: string): Promise<Regulation> => {
    const res = await api.get('/regulations/by-number', {
      params: { documentNumber },
    });
    return res.data;
  },
  getContent: async (id: number): Promise<RegulationContent> => {
    const res = await api.get(`/regulations/${id}/content`);
    return res.data;
  },
  getPdfUrl: (id: number): string => `${API_BASE_URL}/regulations/${id}/pdf`,
};

export const searchApi = {
  search: async (
    params: { q?: string; category?: string; tags?: string[]; page?: number; size?: number; limit?: number },
    signal?: AbortSignal,
  ): Promise<SearchResponse> => {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.set('q', params.q);
    if (params.category) queryParams.set('category', params.category);
    if (params.page) queryParams.set('page', String(params.page));
    if (params.size) queryParams.set('size', String(params.size));
    if (params.limit) queryParams.set('limit', String(params.limit));
    params.tags?.forEach((t) => queryParams.append('tag', t));
    const res = await api.get(`/search?${queryParams.toString()}`, { signal });
    return res.data;
  },
};

export const docApi = {
  list: async (): Promise<DocDetail[]> => {
    const res = await api.get('/docs');
    return res.data;
  },
  getById: async (id: number): Promise<DocDetail> => {
    const res = await api.get(`/docs/${id}`);
    return res.data;
  },
};

export const procedureApi = {
  getCriteria: async (procedureName = 'Học bổng Khuyến khích Học tập'): Promise<ProcedureCriteria[]> => {
    const res = await api.get('/procedures/criteria', {
      params: { procedureName },
    });
    return res.data;
  },
  evaluate: async (studentCode: string): Promise<EvaluationResult> => {
    const res = await api.get(`/procedures/evaluate/${studentCode}`);
    return res.data;
  },
  submitTicket: async (data: { studentCode: string; procedureName: string; reason: string }) => {
    const res = await api.post('/procedures/tickets', data);
    return res.data;
  },
};

export const chatApi = {
  ask: async (message: string, studentCode?: string): Promise<ChatResponse> => {
    const res = await api.post('/ai-chat/query', { message, studentCode });
    return res.data;
  },
};

export const eventApi = {
  getEvents: async (eventType = 'ALL', faculty = '', className = ''): Promise<AcademicEvent[]> => {
    const res = await api.get('/events', {
      params: { eventType, faculty, className },
    });
    return res.data;
  },
};

export default api;
