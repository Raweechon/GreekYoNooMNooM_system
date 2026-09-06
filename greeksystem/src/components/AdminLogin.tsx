import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToStore,
}) => {
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('password123');
  const [error, setError] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password.trim() === 'password123') {
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      setError(false);
      onLoginSuccess();
    } else {
      setError(true);
    }
  };

  const fillTestCredentials = () => {
    setUsername('admin');
    setPassword('password123');
    setError(false);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-[#e2d9d0] text-center">
        
        {/* Icon & Title */}
        <div className="w-16 h-16 rounded-2xl bg-[#faf6f0] text-[#5c3d2e] flex items-center justify-center text-3xl mx-auto mb-4 border border-[#e2d9d0]">
          🥣
        </div>
        <h2 className="text-2xl font-bold text-[#5c3d2e] mb-1">
          เข้าสู่ระบบผู้ดูแล
        </h2>
        <p className="text-xs sm:text-sm text-[#7a6e67] mb-6">
          Greek NOOM NOOM Back-office (login.html)
        </p>

        {/* Demo Credentials Quick Note */}
        <div className="mb-6 p-3.5 bg-[#faf6f0] rounded-2xl text-left border border-[#e2d9d0] text-xs">
          <div className="flex items-center justify-between font-semibold text-[#5c3d2e] mb-1">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#e0a96d]" />
              ข้อมูลเข้าใช้งานระบบ:
            </span>
            <button
              type="button"
              onClick={fillTestCredentials}
              className="text-[#8b5a42] hover:text-[#5c3d2e] underline font-medium text-[11px]"
            >
              คลิกเพื่อเติมอัตโนมัติ
            </button>
          </div>
          <div className="text-[#7a6e67] text-[11px] font-mono space-y-0.5">
            <div>User: <span className="text-[#2c221e] font-semibold">admin</span></div>
            <div>Pass: <span className="text-[#2c221e] font-semibold">password123</span></div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-[#2c221e] mb-1.5">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอก Username"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#5c3d2e] focus:ring-1 focus:ring-[#5c3d2e] bg-[#fcfbfa]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2c221e] mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอก Password"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#5c3d2e] focus:ring-1 focus:ring-[#5c3d2e] bg-[#fcfbfa]"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (ลอง admin / password123)</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 bg-[#5c3d2e] hover:bg-[#754a35] text-white font-semibold rounded-xl text-sm transition shadow-md cursor-pointer"
          >
            เข้าสู่ระบบผู้ดูแล
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onBackToStore}
            className="text-xs text-[#8b5a42] hover:text-[#5c3d2e] font-medium inline-flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับไปยังหน้าร้านหลัก (greekyo.html)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
