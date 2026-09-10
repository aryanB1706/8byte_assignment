import { Router, Request, Response } from 'express';
import portfolio, { PortfolioItem } from '../data/portfolio';

const router = Router();

interface EnrichedStock extends PortfolioItem {
  investment: number;
  portfolioPercent: number;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  peRatio: number;
  latestEarnings: string;
}

interface SectorSummary {
  stocks: EnrichedStock[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
}

interface PortfolioResponse {
  holdings: EnrichedStock[];
  sectors: Record<string, SectorSummary>;
  summary: {
    totalInvestment: number;
    totalPresentValue: number;
    totalGainLoss: number;
  };
  cached: boolean;
}

let cache: { data: PortfolioResponse | null; timestamp: number } = {
  data: null,
  timestamp: 0
};
const CACHE_DURATION = 15 * 1000;

// TODO: Replace with Yahoo Finance API (yahoo-finance2)
// Yahoo Finance has no official public API - using unofficial library
// For now returns purchasePrice as placeholder, excel data will be enriched here
async function getCMP(stock: PortfolioItem): Promise<number> {
  // const quote = await yahooFinance.quote(stock.exchange.replace('NSE: ', '') + '.NS');
  // return quote.regularMarketPrice as number;
  return stock.purchasePrice; // placeholder - will be replaced with live data from excel holdings
}

function getPERatio(stock: PortfolioItem): number {
  // TODO: fetch from Google Finance scraping
  return 0; // placeholder - to be filled from live source
}

function getLatestEarnings(stock: PortfolioItem): string {
  // TODO: fetch from Google Finance
  return "TBD"; // placeholder
}

function buildPortfolioResponse(): Omit<PortfolioResponse, 'cached'> {
  let totalInvestment = 0;

  const withInvestment = portfolio.map(p => {
    const investment = p.purchasePrice * p.qty;
    totalInvestment += investment;
    return { ...p, investment };
  });

  const enriched: EnrichedStock[] = withInvestment.map(p => {
    // Note: getCMP is async in real implementation, for now sync placeholder
    const cmp = p.purchasePrice; // will be await getCMP(p) after Yahoo integration
    const presentValue = Number((cmp * p.qty).toFixed(2));
    const gainLoss = Number((presentValue - p.investment).toFixed(2));
    const portfolioPercent = Number(((p.investment / totalInvestment) * 100).toFixed(2));
    const peRatio = getPERatio(p);
    const latestEarnings = getLatestEarnings(p);

    return {
      ...p,
      investment: p.investment,
      portfolioPercent,
      cmp,
      presentValue,
      gainLoss,
      peRatio,
      latestEarnings
    };
  });

  const sectors: Record<string, SectorSummary> = {};
  enriched.forEach(stock => {
    if (!sectors[stock.sector]) {
      sectors[stock.sector] = { stocks: [], totalInvestment: 0, totalPresentValue: 0, totalGainLoss: 0 };
    }
    sectors[stock.sector].stocks.push(stock);
    sectors[stock.sector].totalInvestment += stock.investment;
    sectors[stock.sector].totalPresentValue += stock.presentValue;
  });

  Object.keys(sectors).forEach(sec => {
    sectors[sec].totalGainLoss = Number((sectors[sec].totalPresentValue - sectors[sec].totalInvestment).toFixed(2));
    sectors[sec].totalInvestment = Number(sectors[sec].totalInvestment.toFixed(2));
    sectors[sec].totalPresentValue = Number(sectors[sec].totalPresentValue.toFixed(2));
  });

  const summary = {
    totalInvestment: Number(totalInvestment.toFixed(2)),
    totalPresentValue: Number(enriched.reduce((a, b) => a + b.presentValue, 0).toFixed(2)),
    totalGainLoss: Number(enriched.reduce((a, b) => a + b.gainLoss, 0).toFixed(2)),
  };

  return { holdings: enriched, sectors, summary };
}

router.get('/', (req: Request, res: Response) => {
  const now = Date.now();
  if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
    return res.json({ ...cache.data, cached: true });
  }

  try {
    const data = buildPortfolioResponse();
    const response: PortfolioResponse = { ...data, cached: false };
    cache = { data: response, timestamp: now };
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

router.get('/refresh', (req: Request, res: Response) => {
  try {
    const data = buildPortfolioResponse();
    const response: PortfolioResponse = { ...data, cached: false };
    cache = { data: response, timestamp: Date.now() };
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh' });
  }
});

export default router;
