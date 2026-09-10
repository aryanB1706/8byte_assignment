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
    const price = res.data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return price ? Number(price) : "N/A";
  } catch (err) {
    return "N/A";
  }
}
