export interface Stock {
  id: number;
  particulars: string;
  purchasePrice: number;
  qty: number;
  exchange: string;
  sector: string;
  investment: number;
  portfolioPercent: number;
  cmp: number | string;
  presentValue: number | string;
  gainLoss: number | string;
  peRatio: number | string;
  latestEarnings: string;
}

export interface SectorInfo {
  stocks: Stock[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
}

export interface PortfolioResponse {
  holdings: Stock[];
  sectors: Record<string, SectorInfo>;
  summary: {
    totalInvestment: number;
    totalPresentValue: number;
    totalGainLoss: number;
  };
  cached?: boolean;
}
