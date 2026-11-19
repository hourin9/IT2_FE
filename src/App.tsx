import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { AcademicStatusStrip } from './components/AcademicStatusStrip';
import { CatalogPage } from './pages/CatalogPage';
import { ProcedurePage } from './pages/ProcedurePage';
import { AiChatPage } from './pages/AiChatPage';
import { CalendarPage } from './pages/CalendarPage';
import { StudentProvider } from './contexts/StudentContext';
import { ToastProvider } from './contexts/ToastContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const isChatRoute = pathname === '/ai-chat';

  return (
    <div className="min-h-screen flex flex-col bg-dut-surface text-dut-on-surface">
      <Navbar />
      <AcademicStatusStrip compact={isChatRoute} />
      <main className={isChatRoute ? 'flex-1 min-h-0 flex flex-col' : 'flex-1'}>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/procedure" element={<ProcedurePage />} />
          <Route path="/ai-chat" element={<AiChatPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </main>
      {!isChatRoute && (
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          © 2026 Cổng Dịch vụ và Hỗ trợ Sinh viên — Trường Đại học Bách khoa, Đại học Đà Nẵng
        </footer>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <StudentProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </ToastProvider>
      </StudentProvider>
    </QueryClientProvider>
  );
};

export default App;
