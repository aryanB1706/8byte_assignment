export interface PortfolioItem {
  id: number;
  particulars: string;
  purchasePrice: number;
  qty: number;
  exchange: string;
  sector: string;
}

const portfolio: PortfolioItem[] = [
  { id: 1, particulars: "HDFC Bank", purchasePrice: 1490.0, qty: 50, exchange: "NSE: HDFCBANK", sector: "Financial" },
  { id: 2, particulars: "Bajaj Finance", purchasePrice: 6466.0, qty: 15, exchange: "NSE: BAJFINANCE", sector: "Financial" },
  { id: 3, particulars: "ICICI Bank", purchasePrice: 780.0, qty: 84, exchange: "532174", sector: "Financial" },
  { id: 4, particulars: "Bajaj Housing", purchasePrice: 130.0, qty: 504, exchange: "544252", sector: "Financial" },
  { id: 5, particulars: "Savani Financials", purchasePrice: 24.0, qty: 1080, exchange: "511577", sector: "Financial" },
  { id: 6, particulars: "Affle India", purchasePrice: 1151.0, qty: 50, exchange: "NSE: AFFLE", sector: "Tech" },
  { id: 7, particulars: "LTI Mindtree", purchasePrice: 4775.0, qty: 16, exchange: "NSE: LTIM", sector: "Tech" },
  { id: 8, particulars: "KPIT Tech", purchasePrice: 672.0, qty: 61, exchange: "542651", sector: "Tech" },
  { id: 9, particulars: "Tata Tech", purchasePrice: 1072.0, qty: 63, exchange: "544028", sector: "Tech" },
  { id: 10, particulars: "BLS E-Services", purchasePrice: 232.0, qty: 191, exchange: "544107", sector: "Tech" },
  { id: 11, particulars: "Tanla", purchasePrice: 1134.0, qty: 45, exchange: "532790", sector: "Tech" },
  { id: 12, particulars: "Dmart", purchasePrice: 3777.0, qty: 27, exchange: "NSE: DMART", sector: "Consumer" },
  { id: 13, particulars: "Tata Consumer", purchasePrice: 845.0, qty: 90, exchange: "532540", sector: "Consumer" },
  { id: 14, particulars: "Pidilite", purchasePrice: 2376.0, qty: 36, exchange: "500331", sector: "Consumer" },
  { id: 15, particulars: "Tata Power", purchasePrice: 224.0, qty: 225, exchange: "500400", sector: "Power" },
  { id: 16, particulars: "KPI Green", purchasePrice: 875.0, qty: 50, exchange: "542323", sector: "Power" },
  { id: 17, particulars: "Suzlon", purchasePrice: 44.0, qty: 450, exchange: "532667", sector: "Power" },
  { id: 18, particulars: "Gensol", purchasePrice: 998.0, qty: 45, exchange: "542851", sector: "Power" },
  { id: 19, particulars: "Hariom Pipes", purchasePrice: 580.0, qty: 60, exchange: "543517", sector: "Pipe" },
  { id: 20, particulars: "Astral", purchasePrice: 1517.0, qty: 56, exchange: "NSE: ASTRAL", sector: "Pipe" },
  { id: 21, particulars: "Polycab", purchasePrice: 2818.0, qty: 28, exchange: "542652", sector: "Pipe" },
  { id: 22, particulars: "Clean Science", purchasePrice: 1610.0, qty: 32, exchange: "543318", sector: "Others" },
  { id: 23, particulars: "Deepak Nitrite", purchasePrice: 2248.0, qty: 27, exchange: "506401", sector: "Others" },
  { id: 24, particulars: "Fine Organic", purchasePrice: 4284.0, qty: 16, exchange: "541557", sector: "Others" },
  { id: 25, particulars: "Gravita", purchasePrice: 2037.0, qty: 8, exchange: "533282", sector: "Others" },
  { id: 26, particulars: "SBI Life", purchasePrice: 1197.0, qty: 49, exchange: "540719", sector: "Others" },
  { id: 27, particulars: "Infy", purchasePrice: 1647.0, qty: 36, exchange: "500209", sector: "Others" },
  { id: 28, particulars: "Happeist Mind", purchasePrice: 1103.0, qty: 45, exchange: "543237", sector: "Others" },
  { id: 29, particulars: "Easemytrip", purchasePrice: 20.0, qty: 1332, exchange: "543272", sector: "Others" },
];

export default portfolio;
