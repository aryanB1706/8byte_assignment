import portfolio from '../data/portfolio';
import { fetchCMP } from './yahooService';
import { fetchPE, fetchEarnings } from './googleService';

// --- Per-ticker cache to avoid hammering Yahoo/Google on every refresh ---
type CacheEntry<T> = { value: T; time: number };
const cmpCache = new Map<string, CacheEntry<string | number>>();
const peCache = new Map<string, CacheEntry<{ value: string; source: 'live' | 'mock' }>>();
const earnCache = new Map<string, CacheEntry<{ value: string; source: 'live' | 'mock' }>>();

const CMP_TTL = 60 * 1000;      // 60s - price changes but not every second
const PE_TTL = 5 * 60 * 1000;   // 5min - PE rarely changes
const EARN_TTL = 5 * 60 * 1000; // 5min - earnings rarely changes

function getCached<T>(cache: Map<string, CacheEntry<T>>, key: string, ttl: number): T | null {
  const e = cache.get(key);
  if (e && Date.now() - e.time < ttl) return e.value;
  return null;
}
function setCached<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T) {
  cache.set(key, { value, time: Date.now() });
}

async function getCMPWithCache(exchange: string) {
  const cached = getCached(cmpCache, exchange, CMP_TTL);
  if (cached !== null) return cached;
  const v = await fetchCMP(exchange);
  setCached(cmpCache, exchange, v);
  return v;
}
async function getPEWithCache(exchange: string) {
  const cached = getCached(peCache, exchange, PE_TTL);
  if (cached !== null) return cached;
  const v = await fetchPE(exchange);
  setCached(peCache, exchange, v);
  return v;
}
async function getEarningsWithCache(exchange: string) {
  const cached = getCached(earnCache, exchange, EARN_TTL);
  if (cached !== null) return cached;
  const v = await fetchEarnings(exchange);
  setCached(earnCache, exchange, v);
  return v;
}

// simple concurrency limiter - run max 5 parallel fetches (throttling)
async function runWithLimit<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const chunk = tasks.slice(i, i + limit);
    const chunkResults = await Promise.allSettled(chunk.map((t) => t()));
    chunkResults.forEach((r, idx) => {
      if (r.status === 'fulfilled') results[i + idx] = r.value as T;
      else results[i + idx] = null as unknown as T; // will be handled as N/A
    });
  }
  return results;
}

export async function getPortfolioData() {
  let totalInv = 0;
  const withInv = portfolio.map(p => {
    const inv = p.purchasePrice * p.qty;
    totalInv += inv;
    return { ...p, investment: inv };
  });

  // Build throttled tasks (max 5 concurrent stocks)
  const tasks = withInv.map((p) => async () => {
    const [cmp, peRes, earnRes] = await Promise.all([
      getCMPWithCache(p.exchange),
      getPEWithCache(p.exchange),
      getEarningsWithCache(p.exchange),
    ]);

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
      peRatio: (peRes as any)?.value ?? "N/A",
      peSource: (peRes as any)?.source ?? "mock",
      latestEarnings: (earnRes as any)?.value ?? "N/A",
      earningsSource: (earnRes as any)?.source ?? "mock",
    };
  });

  const holdings = await runWithLimit(tasks, 8); // 8 concurrent stocks = ~12s for 29 stocks (vs 87 parallel before)

  // sector grouping
  const sectors: any = {};
  holdings.forEach((h: any) => {
    if (!h) return;
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

  const totalPresentValue = holdings.reduce((a: number, b: any) => a + (b && typeof b.presentValue === 'number' ? b.presentValue : 0), 0);
  const summary = {
    totalInvestment: Number(totalInv.toFixed(2)),
    totalPresentValue: Number(totalPresentValue.toFixed(2)),
    totalGainLoss: Number((totalPresentValue - totalInv).toFixed(2))
  };

  return { holdings, sectors, summary };
}

// simple in-memory cache 15 sec for full portfolio (reduces 87 -> 0 calls on rapid refresh)
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
