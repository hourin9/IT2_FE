import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, ClipboardCheck, MessageSquareText, CalendarDays, ExternalLink } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Tra cứu Quy chế', icon: BookOpen },
    { to: '/procedure', label: 'Thủ tục & Biểu mẫu', icon: ClipboardCheck },
    { to: '/ai-chat', label: 'Hỏi đáp Quy chế', icon: MessageSquareText },
    { to: '/calendar', label: 'Lịch & Thông báo', icon: CalendarDays },
  ];

  return (
    <header className="bg-dut-800 text-white border-b border-dut-900/40 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
          {/* Institutional Logo & Title */}
          <NavLink to="/" className="flex items-center gap-2.5 min-w-0 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-white text-dut-800 flex items-center justify-center font-extrabold text-sm tracking-tight shrink-0 shadow-sm">
              DUT
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm lg:text-[15px] font-bold leading-tight whitespace-nowrap">
                Cổng Dịch vụ &amp; Hỗ trợ SV
              </h1>
              <p className="text-[11px] text-blue-100/85 whitespace-nowrap">
                ĐH Bách khoa — ĐH Đà Nẵng
              </p>
            </div>
          </NavLink>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center h-full gap-0.5 lg:gap-1" aria-label="Điều hướng chính">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `relative h-full flex items-center gap-1.5 px-2.5 lg:px-3 text-xs lg:text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'text-white font-semibold bg-white/10'
                        : 'text-blue-100/80 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">{item.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 inset-x-2 h-0.5 bg-amber-300 rounded-t" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* External Official Portal Link */}
          <div className="hidden lg:flex items-center text-xs shrink-0">
            <a
              href="https://sv.dut.udn.vn/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-md border border-white/15 transition-colors text-blue-50"
            >
              <span>sv.dut.udn.vn</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav
        aria-label="Điều hướng di động"
        className="md:hidden flex border-t border-white/10 bg-dut-900/60 overflow-x-auto px-2 py-1 gap-1"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
                  isActive ? 'bg-white/15 text-white font-semibold' : 'text-blue-100/75'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
};
