export interface StockItem {
  item_id: number;
  category: string;
  name: string;
  qty: number;
  unit: string;
}

export interface OrderRecord {
  "วันที่/เวลา": string;
  "ประเภท": string;
  "ชื่อลูกค้า": string;
  "เบอร์โทร": string;
  "รสชาติ": string;
  "ตัวเลือก/ไซส์": string;
  "ท็อปปิ้ง": string;
  "ราคารวม": number;
  "ที่อยู่/หมายเหตุ": string;
  "สถานะ": string;
}

export type OrderType = "สั่งซื้อทันที" | "Pre-order";

export interface YogurtSizeOption {
  id: string;
  name: string;
  price: number;
  scoops: number;
  allowsFruit: boolean;
  icon: string;
}

export interface ToppingOption {
  id: string;
  category: "normal" | "premium" | "snack";
  name: string;
  price: number;
  icon: string;
}
