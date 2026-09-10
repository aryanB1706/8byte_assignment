import axios from 'axios';

function toYahooTicker(exchange: string): string | null {
  if (exchange.startsWith('NSE:')) return exchange.replace('NSE:', '').trim() + '.NS';
  if (/^\d+$/.test(exchange.trim())) return exchange.trim() + '.BO';
  return null;
}

// deterministic mock fallback so column never stays N/A (acknowledges scraping fragility)
function mockPE(exchange: string): string {
  const seed = exchange.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (12 + (seed % 28) + (seed % 10) * 0.1).toFixed(1); // 12.0 - 39.9
}
function mockEarnings(exchange: string): string {
  const seed = exchange.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const quarter = ['Q1', 'Q2', 'Q3', 'Q4'][seed % 4];
  const year = 2024 + (seed % 2);
  const val = (5 + (seed % 90) + (seed % 7) * 0.3).toFixed(1);
  const eps = (2 + (seed % 15) + (seed % 5) * 0.1).toFixed(1);
  return `${quarter} FY${String(year).slice(-2)}: ₹${val} Cr (EPS ${eps})`;
}

export async function fetchPE(exchange: string): Promise<{ value: string; source: 'live' | 'mock' }> {
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
    // Google shows P/E like "P/E ratio<span>24.5</span>" - need decimal to avoid matching class names like "dO6"
    const patterns = [
      /P\/E ratio[^0-9]*([0-9]+\.[0-9]+)/i,
      /"peRatio"[^0-9]*([0-9]+\.[0-9]+)/i,
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m) {
        const val = parseFloat(m[1]);
        if (val >= 5 && val <= 100) return { value: m[1], source: 'live' };
      }
    }
  } catch (e) {
    // fall through to Yahoo / mock
  }

  // Try Yahoo as fallback for P/E
  const yTicker = toYahooTicker(exchange);
  if (yTicker) {
    try {
      const yRes = await axios.get(`https://finance.yahoo.com/quote/${yTicker}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 4000
      });
      const html2 = yRes.data as string;
      const m2 = html2.match(/PE Ratio[^0-9]*([0-9.]+)/i) || html2.match(/trailingPE[^0-9]*([0-9.]+)/i);
      if (m2) {
        const v = parseFloat(m2[1]);
        if (v >= 5 && v <= 100) return { value: m2[1], source: 'live' };
      }
    } catch {}
  }

  // Final fallback: deterministic mock (avoids N/A column per assignment's scraping disclaimer)
  return { value: mockPE(exchange), source: 'mock' };
}

export async function fetchEarnings(exchange: string): Promise<{ value: string; source: 'live' | 'mock' }> {
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
    // Google finance earnings patterns - require decimal to avoid matching class names like "dO6"
    const patterns = [
      /EPS[^<]*<\/div>[^0-9]*([0-9]+\.[0-9]+)/i,
      /Earnings per share[^0-9]*([0-9]+\.[0-9]+)/i,
      /Net income[^0-9₹]*₹?\s*([0-9]+\.[0-9]+)\s*Cr/i,
      /"eps"[^0-9]*([0-9]+\.[0-9]+)/i,
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m) {
        // return compact earnings string
        const val = m[1].replace(/,/g, '');
        if (re.source.includes('Net income')) return { value: `Net: ₹${val} Cr`, source: 'live' };
        if (re.source.includes('EPS') || re.source.includes('eps')) return { value: `EPS ${val}`, source: 'live' };
        return { value: m[1], source: 'live' };
      }
    }
    // If page loaded but no pattern matched, still consider page valid - fall through to mock rather than N/A
  } catch (e) {
    // network fail -> mock
  }

  // Yahoo quote page as secondary attempt
  const yTicker2 = toYahooTicker(exchange);
  if (yTicker2) {
    try {
      const yRes2 = await axios.get(`https://finance.yahoo.com/quote/${yTicker2}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 4000
      });
      const html2 = yRes2.data as string;
      const m2 = html2.match(/EPS[^0-9]*([0-9]+\.[0-9]+)/i);
      if (m2) {
        const v = parseFloat(m2[1]);
        if (v >= 1 && v <= 100) return { value: `EPS ${m2[1]}`, source: 'live' };
      }
    } catch {}
  }

  return { value: mockEarnings(exchange), source: 'mock' };
}
