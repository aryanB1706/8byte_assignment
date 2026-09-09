export interface PortfolioItem {
  id: number;
  particulars: string;
  purchasePrice: number;
  qty: number;
  exchange: string;
  sector: string;
}

const portfolio: PortfolioItem[] = [
  { id: 1, particulars: "HDFC Bank", purchasePrice: 1520, qty: 50, exchange: "NSE: HDFCBANK", sector: "Financials" },
  { id: 2, particulars: "Infosys", purchasePrice: 1450, qty: 40, exchange: "NSE: INFY", sector: "Technology" },
  { id: 3, particulars: "TCS", purchasePrice: 3250, qty: 20, exchange: "NSE: TCS", sector: "Technology" },
  { id: 4, particulars: "ICICI Bank", purchasePrice: 900, qty: 60, exchange: "NSE: ICICIBANK", sector: "Financials" },
  { id: 5, particulars: "Reliance Industries", purchasePrice: 2450, qty: 30, exchange: "NSE: RELIANCE", sector: "Energy" },
  { id: 6, particulars: "Bajaj Finance", purchasePrice: 6200, qty: 10, exchange: "NSE: BAJFINANCE", sector: "Financials" },
];

export default portfolio;
