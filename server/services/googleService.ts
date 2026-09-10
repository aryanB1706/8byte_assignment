import axios from 'axios';

export async function fetchPE(exchange: string) {
  const gExchange = exchange.startsWith('NSE:') ? 'NSE' : 'BOM';
  const gTicker = exchange.startsWith('NSE:') ? exchange.replace('NSE:', '').trim() : exchange.trim();
  const url = `https://www.google.com/finance/quote/${gTicker}:${gExchange}`;

  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 5000
    });
    const html = res.data as string;
    const m = html.match(/P\/E ratio[^0-9]*([0-9.]+)/i);
    if (m) return m[1];
    return "N/A";
  } catch (e) {
    return "N/A";
  }
}

export async function fetchEarnings(exchange: string) {
  // Google doesn't give earnings directly, keep N/A for now
  return "N/A";
}
