import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '../data/initialData';
import { Copy, Check, ExternalLink, FileSpreadsheet, Code2, AlertCircle } from 'lucide-react';

export const SheetGuideModal: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="py-6 sm:py-8 space-y-6 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="bg-white rounded-2xl p-6 border border-[#e2d9d0] shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#5c3d2e]">
              คู่มือการติดตั้ง Google Sheet + Real-time Apps Script
            </h2>
            <p className="text-xs sm:text-sm text-[#7a6e67]">
              ขั้นตอนการตั้งค่าตารางและสคริปต์เพื่อบันทึกออเดอร์และตัดสต็อกสินค้าอัตโนมัติ
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Create Google Sheets */}
      <div className="bg-white rounded-2xl p-6 border border-[#e2d9d0] shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
            1
          </span>
          <h3 className="font-bold text-base text-[#5c3d2e]">
            สร้าง Google Sheet และกำหนด 2 แผ่นงาน (Tabs)
          </h3>
        </div>

        <p className="text-xs text-[#7a6e67] leading-relaxed">
          สร้าง Google Spreadsheet ใหม่ขึ้นมา แล้วสร้าง Sheet ย่อย 2 แผ่นตามชื่อและหัวคอลัมน์ดังนี้:
        </p>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-[#faf6f0] border border-[#e2d9d0]">
            <h4 className="font-bold text-[#5c3d2e] mb-1.5 flex items-center gap-2">
              <span>📋 Sheet ที่ 1: ตั้งชื่อว่า</span>
              <code className="bg-white px-2 py-0.5 rounded border border-gray-300 text-rose-600 font-bold">
                Orders
              </code>
            </h4>
            <p className="text-[#7a6e67] mb-2">แถวที่ 1 (หัวตาราง):</p>
            <div className="overflow-x-auto bg-white p-2.5 rounded-lg border border-gray-200 font-mono text-[11px] text-[#2c221e]">
              A: วันที่/เวลา | B: ประเภท | C: ชื่อลูกค้า | D: เบอร์โทร | E: รสชาติ | F: ตัวเลือก/ไซส์ | G: ท็อปปิ้ง | H: ราคารวม | I: ที่อยู่/หมายเหตุ | J: สถานะ
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#faf6f0] border border-[#e2d9d0]">
            <h4 className="font-bold text-[#5c3d2e] mb-1.5 flex items-center gap-2">
              <span>📦 Sheet ที่ 2: ตั้งชื่อว่า</span>
              <code className="bg-white px-2 py-0.5 rounded border border-gray-300 text-emerald-600 font-bold">
                Stock
              </code>
            </h4>
            <p className="text-[#7a6e67] mb-2">แถวที่ 1 (หัวตาราง):</p>
            <div className="overflow-x-auto bg-white p-2.5 rounded-lg border border-gray-200 font-mono text-[11px] text-[#2c221e] mb-2">
              A: item_id | B: category | C: name | D: qty | E: unit
            </div>
            <p className="text-[#7a6e67] mb-1">ตัวอย่างข้อมูลแถวที่ 2 เป็นต้นไป:</p>
            <div className="overflow-x-auto bg-white p-2.5 rounded-lg border border-gray-200 font-mono text-[10px] text-gray-600 space-y-0.5">
              <div>1 | Base Yogurt | กรีกโยเกิร์ต (สกูป/60g) | 50 | สกูป</div>
              <div>2 | Topping ธรรมดา | กล้วยหอม | 30 | ชุด</div>
              <div>3 | Topping ธรรมดา | แอปเปิ้ลแดง | 30 | ชุด</div>
              <div>4 | Topping ธรรมดา | ส้ม | 30 | ชุด</div>
              <div>5 | Topping Premium | อโวคาโด้ | 20 | ชุด</div>
              <div>6 | ขนม / กรุบกรอบ | Biscoff | 25 | ชิ้น</div>
              <div>7 | ของแถม | น้ำผึ้งแท้ (1 oz) | 50 | ถ้วย</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Google Apps Script */}
      <div className="bg-white rounded-2xl p-6 border border-[#e2d9d0] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-base text-[#5c3d2e]">
              นำโค้ด Apps Script ไปวางใน Google Sheet
            </h3>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3.5 py-1.5 bg-[#5c3d2e] hover:bg-[#754a35] text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'คัดลอกเรียบร้อยแล้ว!' : 'คัดลอกโค้ด Apps Script'}</span>
          </button>
        </div>

        <p className="text-xs text-[#7a6e67]">
          ที่เมนูด้านบนของ Google Sheet ไปที่ <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong> ลบโค้ดเดิมทั้งหมดออกแล้ววางโค้ดชุดนี้ลงไป:
        </p>

        <div className="relative">
          <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 border border-gray-800">
            <code>{GOOGLE_APPS_SCRIPT_TEMPLATE}</code>
          </pre>
        </div>
      </div>

      {/* Step 3: Deploy */}
      <div className="bg-white rounded-2xl p-6 border border-[#e2d9d0] shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
            3
          </span>
          <h3 className="font-bold text-base text-[#5c3d2e]">
            Deploy เป็น Web App (สิทธิ์: ทุกคน / Anyone)
          </h3>
        </div>

        <ol className="list-decimal list-inside text-xs text-[#7a6e67] space-y-2 leading-relaxed">
          <li>คลิกปุ่มสีน้ำเงิน <strong>ทำให้ใช้งานได้ (Deploy)</strong> &gt; <strong>การทำให้ใช้งานได้ใหม่ (New deployment)</strong></li>
          <li>เลือกประเภทเป็น <strong>เว็บแอป (Web app)</strong></li>
          <li>กำหนดการตั้งค่า:
            <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
              <li><strong>เรียกใช้ในฐานะ (Execute as):</strong> ฉัน (อีเมลของคุณเอง)</li>
              <li><strong>ผู้ที่มีสิทธิ์เข้าถึง (Who has access):</strong> <strong className="text-rose-600">ทุกคน (Anyone)</strong> *(สำคัญมาก เพื่อให้หน้าเว็บสั่งซื้อสามารถส่งข้อมูลได้)*</li>
            </ul>
          </li>
          <li>คลิก <strong>ทำให้ใช้งานได้ (Deploy)</strong> แล้วคัดลอก <strong>URL เว็บแอป (Web app URL)</strong> ที่ลงท้ายด้วย <code>/exec</code></li>
          <li>นำ URL นั้นมาวางในช่อง <strong>ตั้งค่า Google Sheet</strong> ในหน้า Admin หรือในไฟล์ <code>greekyo.html</code> และ <code>admin.html</code></li>
        </ol>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>หมายเหตุ:</strong> ระบบได้บรรจุโค้ดและไฟล์ตัวอย่างต้นฉบับไว้ที่ <code>/public/greekyo.html</code>, <code>/public/login.html</code>, <code>/public/admin.html</code> และ <code>/public/GoogleAppsScript_Code.js</code> ครบถ้วนเรียบร้อยแล้วครับ
          </span>
        </div>
      </div>

    </div>
  );
};
