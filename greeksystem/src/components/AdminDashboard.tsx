import React, { useState } from 'react';
import { StockItem, OrderRecord } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  RefreshCw, 
  TrendingUp, 
  ShoppingBag, 
  Layers, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface AdminDashboardProps {
  orders: OrderRecord[];
  stock: StockItem[];
  scriptUrl: string;
  onUpdateStock: (itemId: number, change: number) => void;
  onResetStock: () => void;
  onSaveScriptUrl: (url: string) => void;
  onRefreshFromSheet: () => Promise<void>;
  isLoading: boolean;
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  stock,
  scriptUrl,
  onUpdateStock,
  onResetStock,
  onSaveScriptUrl,
  onRefreshFromSheet,
  isLoading,
  onBackToStore,
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'stock' | 'settings'>('overview');
  const [customUrl, setCustomUrl] = useState<string>(scriptUrl);
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Calculate Metrics
  const totalSales = orders.reduce((sum, o) => sum + (Number(o['ราคารวม']) || 0), 0);
  const totalOrdersCount = orders.length;
  const nowOrdersCount = orders.filter((o) => (o['ประเภท'] || '').includes('ทันที')).length;
  const preOrdersCount = totalOrdersCount - nowOrdersCount;

  const yogurtStockItem = stock.find((s) => s.name.includes('กรีกโยเกิร์ต'));
  const currentYogurtStock = yogurtStockItem ? yogurtStockItem.qty : 0;

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSaveScriptUrl(customUrl.trim());
      setSaveMessage('✅ บันทึก Google Apps Script Web App URL สำเร็จ!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="py-6 sm:py-8 space-y-6">
      
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#e2d9d0] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#faf6f0] text-[#5c3d2e] flex items-center justify-center text-2xl border border-[#e2d9d0]">
            📊
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#5c3d2e]">
              Greek NOOM NOOM Back-Office
            </h2>
            <p className="text-xs text-[#7a6e67] flex items-center gap-2">
              <span>👤 สันติ (ผู้ดูแลระบบ)</span>
              <span>•</span>
              <span className="text-emerald-700 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ระบบสต็อก Real-time ซิงค์ Google Sheet
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => onRefreshFromSheet()}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-semibold bg-[#faf6f0] text-[#5c3d2e] hover:bg-[#f4e8c1] rounded-xl border border-[#e2d9d0] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="รีเฟรชข้อมูลจาก Google Sheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}</span>
          </button>

          <a
            href="/admin.html"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 text-xs text-[#8b5a42] hover:text-[#5c3d2e] hover:bg-[#faf6f0] rounded-xl border border-dashed border-[#e2d9d0] transition flex items-center gap-1"
            title="เปิดไฟล์ admin.html แบบเต็มหน้าจอ"
          >
            <span>admin.html</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Sales Card */}
        <div className="bg-white rounded-2xl p-5 border-l-4 border-l-[#e0a96d] border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#7a6e67] mb-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#e0a96d]" />
              <span>ยอดขายรวม</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#5c3d2e]">
              ฿{totalSales.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              อัปเดตแบบ Real-time
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#faf6f0] text-2xl flex items-center justify-center text-[#e0a96d]">
            💰
          </div>
        </div>

        {/* Orders Count Card */}
        <div className="bg-white rounded-2xl p-5 border-l-4 border-l-[#5c3d2e] border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#7a6e67] mb-1 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-[#5c3d2e]" />
              <span>จำนวนออเดอร์ทั้งหมด</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#5c3d2e]">
              {totalOrdersCount} <span className="text-sm font-normal text-[#7a6e67]">ออเดอร์</span>
            </div>
            <div className="text-[11px] text-[#8b5a42] font-medium mt-1">
              ทันที: {nowOrdersCount} | Pre-order: {preOrdersCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#faf6f0] text-2xl flex items-center justify-center text-[#5c3d2e]">
            📦
          </div>
        </div>

        {/* Greek Yogurt Stock Card */}
        <div className="bg-white rounded-2xl p-5 border-l-4 border-l-emerald-600 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#7a6e67] mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>โยเกิร์ตคงเหลือ</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#5c3d2e]">
              {currentYogurtStock} <span className="text-sm font-normal text-[#7a6e67]">สกูป</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              ตัดอัตโนมัติ 1-2 สกูปต่อออเดอร์
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-2xl flex items-center justify-center text-emerald-600">
            🍨
          </div>
        </div>

      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setAdminTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
            adminTab === 'overview'
              ? 'bg-[#5c3d2e] text-white shadow'
              : 'text-[#7a6e67] hover:bg-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>รายการสั่งซื้อล่าสุด ({orders.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('stock')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
            adminTab === 'stock'
              ? 'bg-[#5c3d2e] text-white shadow'
              : 'text-[#7a6e67] hover:bg-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>จัดการ Stock วัตถุดิบ ({stock.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
            adminTab === 'settings'
              ? 'bg-[#5c3d2e] text-white shadow'
              : 'text-[#7a6e67] hover:bg-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>ตั้งค่า Google Sheet</span>
        </button>
      </div>

      {/* Tab 1: Orders Table */}
      {adminTab === 'overview' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2d9d0]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#5c3d2e]">
                รายการสั่งซื้อล่าสุดจาก Google Sheet
              </h3>
              <p className="text-xs text-[#7a6e67]">
                ข้อมูลคำสั่งซื้อถูกบันทึกลงแผ่นงาน "Orders" แบบ Real-time
              </p>
            </div>
            <span className="text-xs text-[#8b5a42] bg-[#faf6f0] px-3 py-1 rounded-full border border-[#e2d9d0]">
              เรียงจากล่าสุด
            </span>
          </div>

          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#faf6f0] text-[#7a6e67] uppercase text-[11px] font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">วันที่/เวลา</th>
                  <th className="py-3 px-4">ประเภท</th>
                  <th className="py-3 px-4">ชื่อลูกค้า & เบอร์</th>
                  <th className="py-3 px-4">สินค้า & ท็อปปิ้ง</th>
                  <th className="py-3 px-4 text-right">ยอดรวม</th>
                  <th className="py-3 px-4 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      ยังไม่มีรายการสั่งซื้อ (สามารถทดลองสั่งซื้อได้ที่หน้าเว็ปหลัก)
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => {
                    const isNow = (order['ประเภท'] || '').includes('ทันที');
                    return (
                      <tr key={index} className="hover:bg-gray-50/70 transition">
                        <td className="py-3.5 px-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                          {order['วันที่/เวลา'] || '-'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              isNow
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {order['ประเภท'] || '-'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#2c221e]">
                            {order['ชื่อลูกค้า'] || '-'}
                          </div>
                          <div className="text-[11px] text-[#7a6e67]">
                            {order['เบอร์โทร'] || '-'}
                          </div>
                          {order['ที่อยู่/หมายเหตุ'] && (
                            <div className="text-[10px] text-gray-400 mt-0.5 max-w-xs truncate">
                              📍 {order['ที่อยู่/หมายเหตุ']}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#5c3d2e]">
                            {order['ตัวเลือก/ไซส์'] || '-'}
                          </div>
                          <div className="text-xs text-[#7a6e67]">
                            {order['ท็อปปิ้ง'] ? `+ ${order['ท็อปปิ้ง']}` : 'ไม่มีท็อปปิ้ง'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-sm text-[#5c3d2e] whitespace-nowrap">
                          {order['ราคารวม']} ฿
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            {order['สถานะ'] || 'รอดำเนินการ'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Stock Management */}
      {adminTab === 'stock' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2d9d0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#5c3d2e]">
                จัดการคลังวัตถุดิบ & สินค้าพร้อมขาย
              </h3>
              <p className="text-xs text-[#7a6e67]">
                กดปุ่ม (+) หรือ (-) เพื่อปรับสต็อก Real-time ข้อมูลจะบันทึกกลับไปยัง Google Sheet ทันที
              </p>
            </div>
            <button
              onClick={onResetStock}
              className="self-start sm:self-auto text-xs text-[#8b5a42] hover:text-[#5c3d2e] flex items-center gap-1 font-medium bg-[#faf6f0] px-3 py-1.5 rounded-xl border border-[#e2d9d0]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ตสต็อกเริ่มต้น</span>
            </button>
          </div>

          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#faf6f0] text-[#7a6e67] uppercase text-[11px] font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4">ชื่อวัตถุดิบ / สินค้า</th>
                  <th className="py-3 px-4">คงเหลือ</th>
                  <th className="py-3 px-4 text-center">ปรับจำนวน (Real-time)</th>
                  <th className="py-3 px-4 text-center">สถานะสต็อก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stock.map((item) => {
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> พร้อมขาย
                    </span>
                  );
                  if (item.qty <= 0) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3" /> สินค้าหมด
                      </span>
                    );
                  } else if (item.qty <= 5) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> ใกล้หมด
                      </span>
                    );
                  }

                  return (
                    <tr key={item.item_id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3.5 px-4 font-semibold text-[#8b5a42]">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#2c221e]">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-base text-[#5c3d2e]">
                          {item.qty}
                        </span>{' '}
                        <span className="text-xs text-[#7a6e67]">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-[#faf6f0] p-1 rounded-xl border border-[#e2d9d0]">
                          <button
                            type="button"
                            onClick={() => onUpdateStock(item.item_id, -1)}
                            disabled={item.qty <= 0}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 border border-gray-200 flex items-center justify-center font-bold text-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                            title="ลดจำนวน 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-xs font-bold w-6 text-center">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateStock(item.item_id, 1)}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200 flex items-center justify-center font-bold text-gray-700 transition shadow-xs cursor-pointer"
                            title="เพิ่มจำนวน 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">{statusBadge}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Settings */}
      {adminTab === 'settings' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2d9d0] max-w-2xl">
          <h3 className="font-bold text-lg text-[#5c3d2e] mb-2">
            ตั้งค่าเชื่อมต่อ Google Apps Script Web App
          </h3>
          <p className="text-xs text-[#7a6e67] mb-4 leading-relaxed">
            ระบุ URL ของ Google Apps Script ที่ได้จากการ Deploy เป็น Web app (สิทธิ์: ทุกคน / Anyone) เพื่อให้ระบบหน้าเว็บสามารถส่งออเดอร์ บันทึก และตัดสต็อกได้แบบ Real-time
          </p>

          <form onSubmit={handleSaveUrl} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2c221e] mb-1">
                Google Sheet Script URL (Web App Exec URL):
              </label>
              <input
                type="url"
                required
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-gray-200 focus:outline-none focus:border-[#5c3d2e] focus:ring-1 focus:ring-[#5c3d2e] bg-[#fcfbfa]"
              />
            </div>

            {saveMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
                {saveMessage}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#5c3d2e] hover:bg-[#754a35] text-white font-semibold rounded-xl text-xs transition shadow-sm cursor-pointer"
              >
                บันทึกการตั้งค่า
              </button>
              
              <button
                type="button"
                onClick={() => onRefreshFromSheet()}
                className="px-4 py-2.5 bg-[#faf6f0] text-[#5c3d2e] font-semibold rounded-xl text-xs border border-[#e2d9d0] hover:bg-[#f4e8c1] transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ทดสอบดึงข้อมูลสต็อก</span>
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="font-semibold text-xs text-[#5c3d2e] mb-2">
              ตรวจสอบไฟล์ HTML ต้นฉบับ:
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <a
                href="/greekyo.html"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-[#5c3d2e] hover:bg-[#faf6f0] flex items-center gap-1"
              >
                <span>greekyo.html</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/login.html"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-[#5c3d2e] hover:bg-[#faf6f0] flex items-center gap-1"
              >
                <span>login.html</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/admin.html"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-[#5c3d2e] hover:bg-[#faf6f0] flex items-center gap-1"
              >
                <span>admin.html</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
