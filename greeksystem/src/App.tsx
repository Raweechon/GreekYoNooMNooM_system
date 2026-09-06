import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { YogurtBuilder } from './components/YogurtBuilder';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { SheetGuideModal } from './components/SheetGuideModal';
import { StockItem, OrderRecord } from './types';
import {
  INITIAL_STOCK,
  INITIAL_ORDERS,
  DEFAULT_SCRIPT_URL,
} from './data/initialData';

export default function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin' | 'guide'>('store');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('isAdminLoggedIn') === 'true';
  });

  const [scriptUrl, setScriptUrl] = useState<string>(() => {
    return localStorage.getItem('GOOGLE_SHEET_SCRIPT_URL') || DEFAULT_SCRIPT_URL;
  });

  const [stock, setStock] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('greek_local_stock');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_STOCK;
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    const saved = localStorage.getItem('greek_local_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ORDERS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch stock and orders from Google Sheet
  const refreshFromSheet = useCallback(async () => {
    if (!scriptUrl) return;
    setIsLoading(true);

    try {
      // 1. Fetch Stock
      const stockRes = await fetch(`${scriptUrl}?action=getStock`);
      if (stockRes.ok) {
        const stockData = await stockRes.json();
        if (Array.isArray(stockData) && stockData.length > 0) {
          setStock(stockData);
          localStorage.setItem('greek_local_stock', JSON.stringify(stockData));
        }
      }
    } catch (e) {
      console.warn('Could not fetch stock from Google Sheet directly (CORS or setup pending):', e);
    }

    try {
      // 2. Fetch Orders
      const ordersRes = await fetch(`${scriptUrl}?action=getOrders`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (Array.isArray(ordersData) && ordersData.length > 0) {
          setOrders(ordersData);
          localStorage.setItem('greek_local_orders', JSON.stringify(ordersData));
        }
      }
    } catch (e) {
      console.warn('Could not fetch orders from Google Sheet directly:', e);
    }

    setIsLoading(false);
  }, [scriptUrl]);

  // Initial fetch and auto-polling every 30 seconds
  useEffect(() => {
    refreshFromSheet();
    const timer = setInterval(() => {
      refreshFromSheet();
    }, 30000);
    return () => clearInterval(timer);
  }, [refreshFromSheet]);

  // Handle Order Success
  const handleOrderSuccess = (
    newOrder: OrderRecord,
    scoopDeduct: number,
    rawToppings: string[]
  ) => {
    // 1. Deduct Stock locally
    setStock((prevStock) => {
      const updated = prevStock.map((item) => {
        let newQty = item.qty;

        // Deduct Yogurt scoops
        if (item.name.includes('กรีกโยเกิร์ต')) {
          newQty = Math.max(0, newQty - scoopDeduct);
        }

        // Deduct selected toppings
        rawToppings.forEach((topName) => {
          if (item.name.includes(topName)) {
            newQty = Math.max(0, newQty - 1);
          }
        });

        // Deduct Honey
        if (item.name.includes('น้ำผึ้ง')) {
          newQty = Math.max(0, newQty - 1);
        }

        return { ...item, qty: newQty };
      });

      localStorage.setItem('greek_local_stock', JSON.stringify(updated));
      return updated;
    });

    // 2. Append Order locally
    setOrders((prevOrders) => {
      const updated = [newOrder, ...prevOrders];
      localStorage.setItem('greek_local_orders', JSON.stringify(updated));
      return updated;
    });
  };

  // Handle Admin Stock Update (+ / -)
  const handleUpdateStock = async (itemId: number, change: number) => {
    setStock((prevStock) => {
      const updated = prevStock.map((item) => {
        if (item.item_id === itemId) {
          const newQty = Math.max(0, Number(item.qty) + change);
          return { ...item, qty: newQty };
        }
        return item;
      });
      localStorage.setItem('greek_local_stock', JSON.stringify(updated));
      return updated;
    });

    // Send update to Google Sheet
    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateStock',
            id: itemId,
            change,
          }),
        });
      } catch (err) {
        console.error('Error updating stock in sheet:', err);
      }
    }
  };

  // Handle Reset Stock
  const handleResetStock = () => {
    if (confirm('คุณต้องการรีเซ็ตสต็อกทั้งหมดเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      setStock(INITIAL_STOCK);
      localStorage.setItem('greek_local_stock', JSON.stringify(INITIAL_STOCK));
    }
  };

  // Save new Google Apps Script URL
  const handleSaveScriptUrl = (url: string) => {
    setScriptUrl(url);
    localStorage.setItem('GOOGLE_SHEET_SCRIPT_URL', url);
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    setIsAdminLoggedIn(false);
    setCurrentView('store');
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#2c221e] flex flex-col font-['Kanit',sans-serif]">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
        scriptUrl={scriptUrl}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pb-16">
        {currentView === 'store' && (
          <YogurtBuilder
            stock={stock}
            scriptUrl={scriptUrl}
            onOrderSuccess={handleOrderSuccess}
            onGoToAdmin={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'admin' && (
          <>
            {isAdminLoggedIn ? (
              <AdminDashboard
                orders={orders}
                stock={stock}
                scriptUrl={scriptUrl}
                onUpdateStock={handleUpdateStock}
                onResetStock={handleResetStock}
                onSaveScriptUrl={handleSaveScriptUrl}
                onRefreshFromSheet={refreshFromSheet}
                isLoading={isLoading}
                onBackToStore={() => setCurrentView('store')}
              />
            ) : (
              <AdminLogin
                onLoginSuccess={handleLoginSuccess}
                onBackToStore={() => setCurrentView('store')}
              />
            )}
          </>
        )}

        {currentView === 'guide' && <SheetGuideModal />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2d9d0] py-6 text-center text-xs text-[#7a6e67]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Greek NOOM NOOM. สด สะอาด ทำสดใหม่ทุกวัน</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('guide')}
              className="hover:text-[#5c3d2e] underline cursor-pointer"
            >
              คู่มือตั้งค่า Google Sheet
            </button>
            <span>•</span>
            <a
              href="/greekyo.html"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#5c3d2e] underline"
            >
              หน้าร้าน HTML
            </a>
            <span>•</span>
            <a
              href="/admin.html"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#5c3d2e] underline"
            >
              หลังบ้าน HTML
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
