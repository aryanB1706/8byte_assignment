import axios from 'axios';

export async function fetchCMP(exchange: string) {
  let ticker = "";
  if (exchange.startsWith('NSE:')) {
    ticker = exchange.replace('NSE:', '').trim() + '.NS';
  } else if (/^\d+$/.test(exchange.trim())) {
    ticker = exchange.trim() + '.BO';
  } else {
    return "N/A";
  }

  try {
    const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 5000
    });
    const meta = res.data?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    if (!price || typeof price !== 'number') return "N/A";
    // Validate price against 52-week range to catch Yahoo bad data (e.g., 541557.BO => 10B vs 52W high 7326)
    const high = meta?.fiftyTwoWeekHigh;
    const low = meta?.fiftyTwoWeekLow;
    if (typeof high === 'number' && price > high * 5) return "N/A";
    if (typeof low === 'number' && price < low * 0.1) return "N/A";
    if (price > 100000 || price < 0.5) return "N/A"; // sanity bounds for Indian equities
    if (meta?.instrumentType && meta.instrumentType !== 'EQUITY' && meta.currency === null) return "N/A";
    return Number(price);
  } catch (err) {
    return "N/A";
  }
}
