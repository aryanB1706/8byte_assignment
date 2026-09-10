import portfolio from '../data/portfolio';
import { fetchCMP } from './yahooService';
import { fetchPE, fetchEarnings } from './googleService';

export async function getPortfolioData() {
  let totalInv = 0;
  const withInv = portfolio.map(p => {
    const inv = p.purchasePrice * p.qty;
    totalInv += inv;
    return { ...p, investment: inv };
  });

  const holdings = await Promise.all(withInv.map(async (p) => {
    const cmp = await fetchCMP(p.exchange);
    const peRes = await fetchPE(p.exchange);
    const earnRes = await fetchEarnings(p.exchange);

    const isNA = cmp === "N/A";
    const presentValue = isNA ? "N/A" : Number((Number(cmp) * p.qty).toFixed(2));
    const gainLoss = isNA ? "N/A" : Number((Number(presentValue) - p.investment).toFixed(2));
    const portfolioPercent = Number(((p.investment / totalInv) * 100).toFixed(2));

    return {
      ...p,
      investment: p.investment,
      portfolioPercent,
      cmp,
      presentValue,
      gainLoss,
      peRatio: peRes.value,
      peSource: peRes.source,
      latestEarnings: earnRes.value,
      earningsSource: earnRes.source
    };
  }));

  // sector grouping
  const sectors: any = {};
  holdings.forEach((h: any) => {
    if (!sectors[h.sector]) {
      sectors[h.sector] = { stocks: [], totalInvestment: 0, totalPresentValue: 0, totalGainLoss: 0 };
    }
    sectors[h.sector].stocks.push(h);
    sectors[h.sector].totalInvestment += h.investment;
    if (typeof h.presentValue === 'number') sectors[h.sector].totalPresentValue += h.presentValue;
  });

  Object.keys(sectors).forEach(sec => {
    const s = sectors[sec];
    s.totalGainLoss = Number((s.totalPresentValue - s.totalInvestment).toFixed(2));
    s.totalInvestment = Number(s.totalInvestment.toFixed(2));
    s.totalPresentValue = Number(s.totalPresentValue.toFixed(2));
  });

  const totalPresentValue = holdings.reduce((a: number, b: any) => a + (typeof b.presentValue === 'number' ? b.presentValue : 0), 0);
  const summary = {
    totalInvestment: Number(totalInv.toFixed(2)),
    totalPresentValue: Number(totalPresentValue.toFixed(2)),
    totalGainLoss: Number((totalPresentValue - totalInv).toFixed(2))
  };

  return { holdings, sectors, summary };
}

// simple in-memory cache 15 sec
let cache: any = null;
let cacheTime = 0;

export async function getCachedPortfolio() {
  const now = Date.now();
  if (cache && now - cacheTime < 15000) {
    return { ...cache, cached: true };
  }
  const data = await getPortfolioData();
  cache = data;
  cacheTime = now;
  return { ...data, cached: false };
}

export async function refreshPortfolio() {
  const data = await getPortfolioData();
  cache = data;
  cacheTime = Date.now();
  return { ...data, cached: false };
}
