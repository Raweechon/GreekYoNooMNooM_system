import { StockItem, YogurtSizeOption, ToppingOption, OrderRecord } from '../types';

export const DEFAULT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwZNZiHd1ZAB-S0CnrzpuLtsh43HKeneXK6LLB2NnWloQ9hVGy1gIxFQEX0n5sMA4OUuA/exec";

export const LINE_ACCOUNT_ID = "@212nfhof";

export const INITIAL_STOCK: StockItem[] = [
  { item_id: 1, category: "Base Yogurt", name: "กรีกโยเกิร์ต (สกูป/60g)", qty: 50, unit: "สกูป" },
  { item_id: 2, category: "Topping ธรรมดา", name: "กล้วยหอม", qty: 30, unit: "ชุด" },
  { item_id: 3, category: "Topping ธรรมดา", name: "แอปเปิ้ลแดง", qty: 30, unit: "ชุด" },
  { item_id: 4, category: "Topping ธรรมดา", name: "ส้ม", qty: 30, unit: "ชุด" },
  { item_id: 5, category: "Topping Premium", name: "อโวคาโด้", qty: 20, unit: "ชุด" },
  { item_id: 6, category: "ขนม / กรุบกรอบ", name: "Biscoff", qty: 25, unit: "ชิ้น" },
  { item_id: 7, category: "ของแถม", name: "น้ำผึ้งแท้ (1 oz)", qty: 50, unit: "ถ้วย" },
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    "วันที่/เวลา": "06/09/2026 14:30:10",
    "ประเภท": "สั่งซื้อทันที",
    "ชื่อลูกค้า": "คุณกัญญา",
    "เบอร์โทร": "081-234-5678",
    "รสชาติ": "รสออริจินัล",
    "ตัวเลือก/ไซส์": "1 สกูป + ผลไม้",
    "ท็อปปิ้ง": "กล้วยหอม, ส้ม",
    "ราคารวม": 50,
    "ที่อยู่/หมายเหตุ": "ส่งที่ชั้น 4 อาคาร A",
    "สถานะ": "จัดส่งเรียบร้อย"
  },
  {
    "วันที่/เวลา": "06/09/2026 15:15:22",
    "ประเภท": "Pre-order",
    "ชื่อลูกค้า": "คุณธนวัฒน์",
    "เบอร์โทร": "089-987-6543",
    "รสชาติ": "รสออริจินัล",
    "ตัวเลือก/ไซส์": "2 สกูป + ผลไม้",
    "ท็อปปิ้ง": "อโวคาโด้ (+10฿), Biscoff (+5฿)",
    "ราคารวม": 95,
    "ที่อยู่/หมายเหตุ": "รับพรุ่งนี้เช้า 09:00 น.",
    "สถานะ": "รอดำเนินการ"
  }
];

export const SIZES: YogurtSizeOption[] = [
  {
    id: "1scoop",
    name: "1 สกูป (60g)",
    price: 40,
    scoops: 1,
    allowsFruit: false,
    icon: "🍨"
  },
  {
    id: "1scoop-fruit",
    name: "1 สกูป + ผลไม้",
    price: 50,
    scoops: 1,
    allowsFruit: true,
    icon: "🍨🍓"
  },
  {
    id: "2scoop",
    name: "2 สกูป (120g)",
    price: 60,
    scoops: 2,
    allowsFruit: false,
    icon: "🍨🍨"
  },
  {
    id: "2scoop-fruit",
    name: "2 สกูป + ผลไม้",
    price: 80,
    scoops: 2,
    allowsFruit: true,
    icon: "🍨🍨🍓"
  }
];

export const TOPPINGS: ToppingOption[] = [
  { id: "top-banana", category: "normal", name: "กล้วยหอม", price: 0, icon: "🍌" },
  { id: "top-apple", category: "normal", name: "แอปเปิ้ลแดง", price: 0, icon: "🍎" },
  { id: "top-orange", category: "normal", name: "ส้ม", price: 0, icon: "🍊" },
  { id: "top-avocado", category: "premium", name: "อโวคาโด้", price: 10, icon: "🥑" },
  { id: "snack-biscoff", category: "snack", name: "Biscoff", price: 5, icon: "🍪" }
];

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action;
  
  if (action === "getStock") {
    const sheet = ss.getSheetByName("Stock");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const result = [];
    
    for (let i = 1; i < data.length; i++) {
      let row = data[i];
      let item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      result.push(item);
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getOrders") {
    const sheet = ss.getSheetByName("Orders");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const result = [];
    
    for (let i = data.length - 1; i >= 1; i--) { // ดึงจากล่าสุดขึ้นมา
      let row = data[i];
      let order = {};
      headers.forEach((header, index) => {
        order[header] = row[index];
      });
      result.push(order);
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rawData = JSON.parse(e.postData.contents);
  const action = rawData.action || "createOrder";

  // 1. บันทึกออเดอร์ใหม่ พร้อมตัดสต็อกอัตโนมัติ (Real-time)
  if (action === "createOrder") {
    let orderSheet = ss.getSheetByName("Orders");
    if (!orderSheet) orderSheet = ss.insertSheet("Orders");
    if (orderSheet.getLastRow() === 0) {
      orderSheet.appendRow(["วันที่/เวลา", "ประเภท", "ชื่อลูกค้า", "เบอร์โทร", "รสชาติ", "ตัวเลือก/ไซส์", "ท็อปปิ้ง", "ราคารวม", "ที่อยู่/หมายเหตุ", "สถานะ"]);
    }
    
    const timestamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    orderSheet.appendRow([
      timestamp,
      rawData.orderType || "สั่งซื้อทันที",
      rawData.customerName || "-",
      \`'\${rawData.customerPhone || "-"}\`,
      rawData.baseName || "รสออริจินัล",
      rawData.sizeName || "-",
      (rawData.toppings || []).join(", "),
      rawData.totalPrice || 0,
      rawData.addressNote || "-",
      "รอดำเนินการ"
    ]);

    // ตัดสต็อกอัตโนมัติ
    const stockSheet = ss.getSheetByName("Stock");
    if (stockSheet) {
      const stockData = stockSheet.getDataRange().getValues();
      
      // คำนวณจำนวนสกูปที่ต้องหัก
      let scoopDeduct = 1;
      if (rawData.sizeName && rawData.sizeName.includes("2 สกูป")) {
        scoopDeduct = 2;
      }

      // วนลูปตัดสต็อก
      for (let i = 1; i < stockData.length; i++) {
        let itemName = String(stockData[i][2]); // คอลัมน์ C: name
        
        // ตัดกรีกโยเกิร์ต
        if (itemName.includes("กรีกโยเกิร์ต")) {
          let currentQty = Number(stockData[i][3]);
          stockSheet.getRange(i + 1, 4).setValue(Math.max(0, currentQty - scoopDeduct));
        }

        // ตัด Topping ตามชื่อที่เลือก
        if (rawData.rawToppings && Array.isArray(rawData.rawToppings)) {
          rawData.rawToppings.forEach(top => {
            if (itemName.includes(top)) {
              let currentQty = Number(stockData[i][3]);
              stockSheet.getRange(i + 1, 4).setValue(Math.max(0, currentQty - 1));
            }
          });
        }

        // แถมน้ำผึ้ง 1 ถ้วยต่อ 1 ออเดอร์
        if (itemName.includes("น้ำผึ้ง")) {
          let currentQty = Number(stockData[i][3]);
          stockSheet.getRange(i + 1, 4).setValue(Math.max(0, currentQty - 1));
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  // 2. แอดมินกดปรับสต็อกผ่านหน้า Admin
  if (action === "updateStock") {
    const stockSheet = ss.getSheetByName("Stock");
    if (stockSheet) {
      const stockData = stockSheet.getDataRange().getValues();
      
      for (let i = 1; i < stockData.length; i++) {
        if (stockData[i][0] == rawData.id) { // เช็คจาก item_id
          let newQty = Number(stockData[i][3]) + Number(rawData.change);
          stockSheet.getRange(i + 1, 4).setValue(Math.max(0, newQty));
          break;
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
