/**
 * Google Apps Script Code สำหรับติดตั้งใน Google Sheet
 * ตารางที่ต้องสร้าง:
 * 1. Sheet ชื่อ "Orders" (คอลัมน์: วันที่/เวลา, ประเภท, ชื่อลูกค้า, เบอร์โทร, รสชาติ, ตัวเลือก/ไซส์, ท็อปปิ้ง, ราคารวม, ที่อยู่/หมายเหตุ, สถานะ)
 * 2. Sheet ชื่อ "Stock" (คอลัมน์: item_id, category, name, qty, unit)
 */

function doGet(e) {
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
  let rawData = {};
  try {
    rawData = JSON.parse(e.postData.contents);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
  const action = rawData.action || "createOrder";

  // 1. บันทึกออเดอร์ใหม่ พร้อมตัดสต็อกอัตโนมัติ (Real-time)
  if (action === "createOrder") {
    let orderSheet = ss.getSheetByName("Orders");
    if (!orderSheet) {
      orderSheet = ss.insertSheet("Orders");
    }
    if (orderSheet.getLastRow() === 0) {
      orderSheet.appendRow(["วันที่/เวลา", "ประเภท", "ชื่อลูกค้า", "เบอร์โทร", "รสชาติ", "ตัวเลือก/ไซส์", "ท็อปปิ้ง", "ราคารวม", "ที่อยู่/หมายเหตุ", "สถานะ"]);
    }
    
    const timestamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    orderSheet.appendRow([
      timestamp,
      rawData.orderType || "สั่งซื้อทันที",
      rawData.customerName || "-",
      `'${rawData.customerPhone || "-"}`,
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
}
