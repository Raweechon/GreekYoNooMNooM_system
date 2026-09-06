import React, { useState } from 'react';
import { SIZES, TOPPINGS, LINE_ACCOUNT_ID } from '../data/initialData';
import { StockItem, OrderRecord, OrderType } from '../types';
import { Send, CheckCircle2, AlertCircle, Sparkles, Clock, Calendar, Check, ExternalLink } from 'lucide-react';

interface YogurtBuilderProps {
  stock: StockItem[];
  scriptUrl: string;
  onOrderSuccess: (newOrder: OrderRecord, scoopDeduct: number, rawToppings: string[]) => void;
  onGoToAdmin: () => void;
}

export const YogurtBuilder: React.FC<YogurtBuilderProps> = ({
  stock,
  scriptUrl,
  onOrderSuccess,
  onGoToAdmin,
}) => {
  const [orderType, setOrderType] = useState<OrderType>('สั่งซื้อทันที');
  const [baseFlavor, setBaseFlavor] = useState<string>('รสออริจินัล');
  const [selectedSizeId, setSelectedSizeId] = useState<string>('1scoop');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  
  // Customer details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState<OrderRecord | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const selectedSize = SIZES.find((s) => s.id === selectedSizeId) || SIZES[0];
  const isFruitAllowed = selectedSize.allowsFruit;

  // Find yogurt stock count
  const yogurtStockItem = stock.find((s) => s.name.includes('กรีกโยเกิร์ต'));
  const currentYogurtStock = yogurtStockItem ? yogurtStockItem.qty : 0;

  // Handle size change
  const handleSizeChange = (sizeId: string) => {
    setSelectedSizeId(sizeId);
    const newSize = SIZES.find((s) => s.id === sizeId);
    if (newSize && !newSize.allowsFruit) {
      setSelectedToppings([]);
    }
  };

  // Handle topping toggle
  const handleToppingToggle = (toppingId: string) => {
    if (!isFruitAllowed) return;

    if (selectedToppings.includes(toppingId)) {
      setSelectedToppings(selectedToppings.filter((id) => id !== toppingId));
    } else {
      if (selectedToppings.length >= 3) {
        alert('สามารถเลือกท็อปปิ้งและขนมรวมกันได้ไม่เกิน 3 ชนิดครับ');
        return;
      }
      setSelectedToppings([...selectedToppings, toppingId]);
    }
  };

  // Price calculations
  const chosenToppingObjects = TOPPINGS.filter((t) => selectedToppings.includes(t.id));
  const normalToppings = chosenToppingObjects.filter((t) => t.category === 'normal');
  const premiumToppings = chosenToppingObjects.filter((t) => t.category === 'premium');
  const snackToppings = chosenToppingObjects.filter((t) => t.category === 'snack');

  const premiumPrice = premiumToppings.reduce((sum, t) => sum + t.price, 0);
  const snackPrice = snackToppings.reduce((sum, t) => sum + t.price, 0);
  const totalPrice = selectedSize.price + premiumPrice + snackPrice;

  // Formatted names
  const toppingDisplayStrings = chosenToppingObjects.map((t) => {
    if (t.price > 0) return `${t.name} (+${t.price}฿)`;
    return t.name;
  });
  const rawToppingNames = chosenToppingObjects.map((t) => t.name);

  // Submit Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์ก่อนกดสั่งซื้อครับ');
      return;
    }

    if (currentYogurtStock < selectedSize.scoops) {
      const confirmProceed = confirm(
        `ขณะนี้กรีกโยเกิร์ตในสต็อกเหลือ ${currentYogurtStock} สกูป (ต้องการ ${selectedSize.scoops} สกูป) คุณต้องการสั่งซื้อแบบ Pre-order หรือไม่?`
      );
      if (!confirmProceed) return;
    }

    setIsSubmitting(true);
    setFeedbackMsg('กำลังส่งข้อมูลไปยัง Google Sheet และตัดสต็อกแบบ Real-time...');

    const now = new Date();
    const formattedTime = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}:${String(
      now.getSeconds()
    ).padStart(2, '0')}`;

    const orderPayload = {
      action: 'createOrder',
      orderType,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      baseName: baseFlavor,
      sizeName: selectedSize.name,
      toppings: toppingDisplayStrings,
      rawToppings: rawToppingNames,
      totalPrice,
      addressNote: customerAddress.trim(),
    };

    // 1. Post to Google Sheet Web App
    try {
      if (scriptUrl) {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });
      }
    } catch (err) {
      console.warn('Google Sheet request finished (or no-cors):', err);
    }

    // 2. Register new order record
    const newRecord: OrderRecord = {
      'วันที่/เวลา': formattedTime,
      'ประเภท': orderType,
      'ชื่อลูกค้า': customerName.trim(),
      'เบอร์โทร': customerPhone.trim(),
      'รสชาติ': baseFlavor,
      'ตัวเลือก/ไซส์': selectedSize.name,
      'ท็อปปิ้ง': toppingDisplayStrings.join(', '),
      'ราคารวม': totalPrice,
      'ที่อยู่/หมายเหตุ': customerAddress.trim(),
      'สถานะ': 'รอดำเนินการ',
    };

    onOrderSuccess(newRecord, selectedSize.scoops, rawToppingNames);
    setLastSubmittedOrder(newRecord);
    setFeedbackMsg('✅ บันทึกออเดอร์และตัดสต็อกใน Google Sheet เรียบร้อยแล้ว!');

    // 3. Prepare Line message
    let message = `🛒 *ออเดอร์กรีกโยเกิร์ต (${orderType})*\n`;
    message += `------------------------------\n`;
    message += `🥣 *รสชาติ:* ${baseFlavor}\n`;
    message += `🍨 *ตัวเลือก:* ${selectedSize.name} (${selectedSize.price} บาท)\n`;
    message +=
      toppingDisplayStrings.length > 0
        ? `🍓 *ท็อปปิ้ง/ขนม:*\n  • ${toppingDisplayStrings.join('\n  • ')}\n`
        : `🍓 *ท็อปปิ้ง/ขนม:* ไม่เลือก\n`;
    message += `------------------------------\n`;
    message += `💰 *ราคารวม:* ${totalPrice} บาท\n`;
    message += `------------------------------\n`;
    message += `👤 *ชื่อลูกค้า:* ${customerName.trim()}\n`;
    message += `📞 *เบอร์โทร:* ${customerPhone.trim()}\n`;
    if (customerAddress.trim()) {
      message += `📍 *ที่อยู่/หมายเหตุ:* ${customerAddress.trim()}\n`;
    }

    const encodedMessage = encodeURIComponent(message);
    const lineRedirectUrl = `https://line.me/R/oaMessage/${LINE_ACCOUNT_ID}/?${encodedMessage}`;

    setIsSubmitting(false);

    // Open LINE in new tab
    try {
      window.open(lineRedirectUrl, '_blank');
    } catch (e) {
      console.log('Opened line', e);
    }
  };

  return (
    <div className="py-6 sm:py-8">
      {/* Banner / Store Header */}
      <div className="bg-gradient-to-r from-[#5c3d2e] via-[#754a35] to-[#8b5a42] text-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-1.5 bg-[#e0a96d] text-[#5c3d2e] font-bold text-xs sm:text-sm px-3.5 py-1 rounded-full mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Homemade & Fresh Daily</span>
        </div>
        
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 text-white">
          Greek NOOM NOOM DIY
        </h1>
        <p className="text-sm sm:text-base text-[#f4e8c1] max-w-xl mx-auto">
          กรีกโยเกิร์ตในสไตล์คุณ สด ใหม่ เข้มข้น อร่อยทุกคำ พร้อมระบบตัดสต็อกอัตโนมัติ Real-time
        </p>

        {/* Real-time stock status badge */}
        <div className="mt-4 inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs text-white/90 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>สต็อกโยเกิร์ตพร้อมจำหน่าย: </span>
          <strong className="text-[#f4e8c1]">{currentYogurtStock} สกูป</strong>
        </div>
      </div>

      {/* Success Notification Alert */}
      {lastSubmittedOrder && (
        <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-emerald-900 text-base">
                ออเดอร์ถูกบันทึกและตัดสต็อกใน Google Sheet แล้ว!
              </h4>
              <p className="text-xs text-emerald-700">
                คุณ {lastSubmittedOrder['ชื่อลูกค้า']} • {lastSubmittedOrder['ตัวเลือก/ไซส์']} • ยอดรวม {lastSubmittedOrder['ราคารวม']} บาท
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onGoToAdmin}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
            >
              ดูสต็อกและออเดอร์ในหน้า Admin →
            </button>
          </div>
        </div>
      )}

      {/* Form & Summary Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Selection Steps */}
        <div className="lg:col-span-8 space-y-6">

          {/* Step 0: Order Type */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2d9d0]">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-gray-100">
              <span className="w-7 h-7 rounded-full bg-[#f4e8c1] text-[#5c3d2e] font-bold text-xs flex items-center justify-center">
                0
              </span>
              <h3 className="font-semibold text-lg text-[#5c3d2e]">รูปแบบการสั่งซื้อ</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('สั่งซื้อทันที')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                  orderType === 'สั่งซื้อทันที'
                    ? 'border-[#5c3d2e] bg-[#faf6f0] shadow-sm -translate-y-0.5'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                }`}
              >
                <span className="text-2xl">⚡</span>
                <span className="font-medium text-sm text-[#2c221e]">สั่งซื้อทันที</span>
                <span className="text-xs font-semibold text-[#8b5a42]">พร้อมส่ง</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('Pre-order')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                  orderType === 'Pre-order'
                    ? 'border-[#5c3d2e] bg-[#faf6f0] shadow-sm -translate-y-0.5'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                }`}
              >
                <span className="text-2xl">📅</span>
                <span className="font-medium text-sm text-[#2c221e]">Pre-order</span>
                <span className="text-xs font-semibold text-[#8b5a42]">จองล่วงหน้า</span>
              </button>
            </div>
          </div>

          {/* Step 1: Base Yogurt */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2d9d0]">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-gray-100">
              <span className="w-7 h-7 rounded-full bg-[#f4e8c1] text-[#5c3d2e] font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-semibold text-lg text-[#5c3d2e]">เลือกรสชาติกรีกโยเกิร์ต (Base)</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border-2 border-[#5c3d2e] bg-[#faf6f0] flex items-center gap-3 shadow-sm">
                <span className="text-3xl">🥛</span>
                <div>
                  <div className="font-medium text-sm text-[#2c221e]">รสออริจินัล</div>
                  <div className="text-xs text-[#8b5a42] font-semibold">เนื้อแน่น เข้มข้น ไม่หวาน (รวมในแพ็กเกจ)</div>
                </div>
                <Check className="w-5 h-5 text-[#5c3d2e] ml-auto" />
              </div>
            </div>
          </div>

          {/* Step 2: Size & Options */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2d9d0]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#f4e8c1] text-[#5c3d2e] font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-semibold text-lg text-[#5c3d2e]">เลือกตัวเลือกโยเกิร์ต (Size & Combo)</h3>
              </div>
              <span className="text-xs text-stone-500 hidden sm:inline">* เลือกแบบมีผลไม้เพื่อเลือกท็อปปิ้ง</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SIZES.map((size) => {
                const isSelected = selectedSizeId === size.id;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleSizeChange(size.id)}
                    className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center relative ${
                      isSelected
                        ? 'border-[#5c3d2e] bg-white shadow-md -translate-y-1'
                        : 'border-gray-100 hover:border-gray-200 bg-[#faf6f0]/70'
                    }`}
                  >
                    <span className="text-2xl">{size.icon}</span>
                    <span className="font-medium text-xs sm:text-sm text-[#2c221e] line-clamp-1">{size.name}</span>
                    <span className="text-xs font-bold text-[#8b5a42] bg-[#f4e8c1]/60 px-2 py-0.5 rounded-md">
                      {size.price} ฿
                    </span>
                    {size.allowsFruit && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 font-medium px-1.5 py-0.5 rounded">
                        ฟรี 3 ท็อปปิ้ง
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Toppings & Snacks */}
          <div
            className={`bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2d9d0] transition-opacity duration-200 ${
              !isFruitAllowed ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#f4e8c1] text-[#5c3d2e] font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="font-semibold text-lg text-[#5c3d2e]">
                  เลือกท็อปปิ้ง & ขนม
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#faf6f0] text-[#8b5a42] border border-[#e2d9d0]">
                เลือกแล้ว {selectedToppings.length}/3 ชนิด
              </span>
            </div>

            {!isFruitAllowed && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>ตัวเลือกของคุณเป็นแบบไม่มีผลไม้ หากต้องการเลือกท็อปปิ้งกรุณาเลือกตัวเลือก "สกูป + ผลไม้" ในขั้นตอนที่ 2 ครับ</span>
              </div>
            )}

            {/* Normal Toppings (Free) */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-[#8b5a42] mb-2 flex items-center gap-1">
                <span>🍎 ผลไม้ธรรมดา (ฟรี ไม่บวกเพิ่ม)</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {TOPPINGS.filter((t) => t.category === 'normal').map((top) => {
                  const isChecked = selectedToppings.includes(top.id);
                  const stockItem = stock.find((s) => s.name.includes(top.name));
                  const isOutOfStock = stockItem && stockItem.qty <= 0;

                  return (
                    <button
                      key={top.id}
                      type="button"
                      disabled={!isFruitAllowed || isOutOfStock}
                      onClick={() => handleToppingToggle(top.id)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                        isChecked
                          ? 'border-[#5c3d2e] bg-[#faf6f0] shadow-sm'
                          : isOutOfStock
                          ? 'bg-gray-100 border-dashed border-gray-300 opacity-50 cursor-not-allowed'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <span className="text-2xl">{top.icon}</span>
                      <span className="font-medium text-xs text-[#2c221e]">{top.name}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        {isOutOfStock ? 'หมด' : 'ฟรี'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Premium Toppings (+10฿) */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-[#8b5a42] mb-2">
                🥑 ผลไม้ Premium (+10 บาท)
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {TOPPINGS.filter((t) => t.category === 'premium').map((top) => {
                  const isChecked = selectedToppings.includes(top.id);
                  const stockItem = stock.find((s) => s.name.includes(top.name));
                  const isOutOfStock = stockItem && stockItem.qty <= 0;

                  return (
                    <button
                      key={top.id}
                      type="button"
                      disabled={!isFruitAllowed || isOutOfStock}
                      onClick={() => handleToppingToggle(top.id)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                        isChecked
                          ? 'border-[#5c3d2e] bg-[#faf6f0] shadow-sm'
                          : isOutOfStock
                          ? 'bg-gray-100 border-dashed border-gray-300 opacity-50 cursor-not-allowed'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <span className="text-2xl">{top.icon}</span>
                      <span className="font-medium text-xs text-[#2c221e]">{top.name}</span>
                      <span className="text-[10px] text-amber-700 font-bold">
                        {isOutOfStock ? 'หมด' : `+${top.price} ฿`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Snacks (+5฿) */}
            <div>
              <div className="text-xs font-semibold text-[#8b5a42] mb-2">
                🍪 ขนม / กรุบกรอบ (+5 บาท)
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {TOPPINGS.filter((t) => t.category === 'snack').map((top) => {
                  const isChecked = selectedToppings.includes(top.id);
                  const stockItem = stock.find((s) => s.name.includes(top.name));
                  const isOutOfStock = stockItem && stockItem.qty <= 0;

                  return (
                    <button
                      key={top.id}
                      type="button"
                      disabled={!isFruitAllowed || isOutOfStock}
                      onClick={() => handleToppingToggle(top.id)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                        isChecked
                          ? 'border-[#5c3d2e] bg-[#faf6f0] shadow-sm'
                          : isOutOfStock
                          ? 'bg-gray-100 border-dashed border-gray-300 opacity-50 cursor-not-allowed'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <span className="text-2xl">{top.icon}</span>
                      <span className="font-medium text-xs text-[#2c221e]">{top.name}</span>
                      <span className="text-[10px] text-amber-700 font-bold">
                        {isOutOfStock ? 'หมด' : `+${top.price} ฿`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Free honey reminder */}
            <div className="mt-4 p-2.5 bg-[#faf6f0] rounded-xl text-[11px] text-[#8b5a42] flex items-center gap-2">
              <span>🍯</span>
              <span><strong>ของแถมพิเศษ:</strong> ฟรีน้ำผึ้งแท้ 1 oz ทุกถ้วย (ระบบจะตัดสต็อกน้ำผึ้งอัตโนมัติด้วยครับ)</span>
            </div>
          </div>

          {/* Step 4: Customer Details */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#e2d9d0]">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-gray-100">
              <span className="w-7 h-7 rounded-full bg-[#f4e8c1] text-[#5c3d2e] font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="font-semibold text-lg text-[#5c3d2e]">ข้อมูลการจัดส่ง</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2c221e] mb-1.5">
                  ชื่อผู้สั่งซื้อ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ระบุชื่อของคุณ เช่น คุณกัญญา"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#5c3d2e] focus:ring-1 focus:ring-[#5c3d2e] bg-[#fcfbfa]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2c221e] mb-1.5">
                  เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="เช่น 081-234-5678"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#5c3d2e] focus:ring-1 focus:ring-[#5c3d2e] bg-[#fcfbfa]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2c221e] mb-1.5">
                  สถานที่จัดส่ง / หมายเหตุเพิ่มเติม
                </label>
                <textarea
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="ระบุที่อยู่จัดส่ง หรือเวลาที่ต้องการรับในกรณี Pre-order"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#5c3d2e] focus:ring-1 focus:ring-[#5c3d2e] bg-[#fcfbfa]"
                ></textarea>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Summary & Checkout */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-white rounded-2xl p-6 shadow-sm border border-[#e2d9d0]">
            <h3 className="font-semibold text-lg text-[#5c3d2e] pb-3 border-b border-gray-100 flex items-center justify-between">
              <span>สรุปรายการสั่งซื้อ</span>
              <span className="text-xs bg-[#f4e8c1] text-[#5c3d2e] px-2 py-0.5 rounded-full font-bold">
                Real-time
              </span>
            </h3>

            <div className="space-y-3 py-4 text-xs sm:text-sm border-b border-gray-100">
              <div className="flex justify-between items-center text-[#7a6e67]">
                <span>รูปแบบ:</span>
                <span className="font-medium text-[#2c221e]">{orderType}</span>
              </div>

              <div className="flex justify-between items-center text-[#7a6e67]">
                <span>รสชาติ:</span>
                <span className="font-medium text-[#2c221e]">{baseFlavor}</span>
              </div>

              <div className="flex justify-between items-center text-[#7a6e67]">
                <span>ตัวเลือก:</span>
                <span className="font-medium text-[#2c221e]">{selectedSize.name} ({selectedSize.price}฿)</span>
              </div>

              <div>
                <div className="flex justify-between items-center text-[#7a6e67] mb-1">
                  <span>ท็อปปิ้ง & ขนม:</span>
                  <span className="font-medium text-[#2c221e]">
                    {chosenToppingObjects.length} รายการ
                  </span>
                </div>
                {toppingDisplayStrings.length > 0 ? (
                  <div className="pl-3 py-1.5 bg-[#faf6f0] rounded-lg text-xs text-[#7a6e67] space-y-0.5">
                    {toppingDisplayStrings.map((t, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-[#e0a96d]">•</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 pl-3">- ไม่มีท็อปปิ้ง -</div>
                )}
              </div>

              <div className="flex justify-between items-center text-[#7a6e67]">
                <span>ของแถม:</span>
                <span className="font-medium text-emerald-700">ฟรีน้ำผึ้งแท้ 1 oz 🍯</span>
              </div>
            </div>

            {/* Total */}
            <div className="py-4 flex justify-between items-center">
              <span className="font-bold text-base text-[#2c221e]">ราคารวม</span>
              <span className="font-extrabold text-2xl text-[#5c3d2e]">{totalPrice} ฿</span>
            </div>

            {/* Submit LINE Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#06c755] hover:bg-[#05b34c] text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึกและตัดสต็อก...' : 'สั่งซื้อผ่าน LINE'}</span>
            </button>

            {/* Real-time sync feedback */}
            <div className="mt-3 text-center">
              <p className="text-[11px] text-[#7a6e67]">
                {feedbackMsg || '⚡ เชื่อมต่อ Google Sheet บันทึกออเดอร์และตัดสต็อก Real-time'}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={onGoToAdmin}
                className="text-xs text-[#8b5a42] hover:text-[#5c3d2e] font-medium underline flex items-center justify-center gap-1 mx-auto"
              >
                เข้าหน้าผู้ดูแลระบบเพื่อดูสต็อกและออเดอร์ →
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
