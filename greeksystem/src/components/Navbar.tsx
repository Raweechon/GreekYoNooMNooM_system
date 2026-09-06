import React from 'react';
import { ShoppingBag, ShieldCheck, FileSpreadsheet, ExternalLink, LogOut, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentView: 'store' | 'admin' | 'guide';
  setCurrentView: (view: 'store' | 'admin' | 'guide') => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  scriptUrl: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  isAdminLoggedIn,
  onLogout,
  scriptUrl,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#5c3d2e] text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentView('store')}
          >
            <span className="text-2xl sm:text-3xl">🥣</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-[#f4e8c1] group-hover:text-white transition-colors">
                  Greek NOOM NOOM
                </span>
                <span className="bg-[#e0a96d] text-[#5c3d2e] text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                  DIY & Real-time Stock
                </span>
              </div>
              <p className="text-xs text-white/70 hidden sm:block">
                ระบบสั่งซื้อพร้อมบันทึกและตัดสต็อกอัตโนมัติ (Google Sheet)
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentView('store')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentView === 'store'
                  ? 'bg-[#e0a96d] text-[#2c221e] shadow'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>หน้าร้าน</span>
              <span className="text-[10px] opacity-75 hidden md:inline">(greekyo.html)</span>
            </button>

            <button
              onClick={() => setCurrentView('admin')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentView === 'admin'
                  ? 'bg-[#e0a96d] text-[#2c221e] shadow'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
              {isAdminLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              )}
              <span className="text-[10px] opacity-75 hidden md:inline">(admin.html)</span>
            </button>

            <button
              onClick={() => setCurrentView('guide')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentView === 'guide'
                  ? 'bg-[#e0a96d] text-[#2c221e] shadow'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">คู่มือ Sheet</span>
              <span className="sm:hidden">Sheet</span>
            </button>

            {isAdminLoggedIn && currentView === 'admin' && (
              <button
                onClick={onLogout}
                className="p-2 text-rose-200 hover:text-rose-100 hover:bg-rose-900/40 rounded-lg text-xs flex items-center gap-1 transition"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">ออก</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real-time sync bar banner */}
      <div className="bg-[#482f23] py-1 px-4 text-center text-[11px] text-[#f4e8c1]/90 flex items-center justify-center gap-2 border-t border-white/5 overflow-x-auto whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>ระบบเชื่อมต่อ Google Sheet Real-time (ตัดสต็อกอัตโนมัติเมื่อกดสั่งซื้อ)</span>
        <span className="text-white/40">•</span>
        <div className="flex items-center gap-1">
          <span className="text-white/60">ไฟล์ต้นฉบับ:</span>
          <a href="/greekyo.html" target="_blank" rel="noreferrer" className="underline hover:text-white flex items-center gap-0.5">
            greekyo.html <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
          <span className="text-white/40">|</span>
          <a href="/login.html" target="_blank" rel="noreferrer" className="underline hover:text-white flex items-center gap-0.5">
            login.html <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
          <span className="text-white/40">|</span>
          <a href="/admin.html" target="_blank" rel="noreferrer" className="underline hover:text-white flex items-center gap-0.5">
            admin.html <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        </div>
      </div>
    </header>
  );
};
