# Dynamic Portfolio Dashboard — OctaByte Full-Stack Intern Assignment

> Real-time portfolio tracker that fetches live stock data from Yahoo Finance (CMP) and Google Finance (P/E, Earnings) with sector analytics, built with **React 19 + Vite + TypeScript + Tailwind** & **Node.js + Express**.

**Live Demo:** https://8byte-assignment-swart.vercel.app/
**API:** https://8byte-assignment-swart.vercel.app/api/portfolio · **Health:** https://8byte-assignment-swart.vercel.app/api/health

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss)
![TanStack Table](https://img.shields.io/badge/TanStack_Table-8-FF4154?style=flat-square)
![Recharts](https://img.shields.io/badge/Recharts-2-FF6384?style=flat-square)
![Node](https://img.shields.io/badge/Node-20-339933?style=flat-square&logo=node.js)

---

## Table of Contents

* [Tech Stack & Concepts Used](#tech-stack--concepts-used)
* [Features Implemented](#features-implemented)
* [Project Structure](#project-structure)
* [Setup and Usage Instructions](#setup-and-usage-instructions)
* [API & Data Fetching Strategy](#api--data-fetching-strategy)
* [Data Model & Calculations](#data-model--calculations)
* [Available Scripts](#available-scripts)
* [Verification](#verification)
* [Notes](#notes)

---

## Tech Stack & Concepts Used

| Concept / Library | Where Used | Why Used (per assignment) |
| :--- | :--- | :--- |
| **React 19 + Vite + TypeScript** | `client` | `ReactJs/Next.js` allowed — Vite chosen for fast HMR; TS for `number | string` union to guard `N/A` |
| **Tailwind CSS** | All components | Responsive grid, `Live`/`Fallback` badges, hover states |
| **TanStack Table v8** | `PortfolioTable.tsx` | Assignment recommended `react-table` — `createColumnHelper`, `getSortedRowModel`, `getFilteredRowModel`, global search |
| **Recharts** | `SectorCharts.tsx` | Assignment optional `recharts` — Pie (allocation by Investment) + Bar (Investment vs Present Value) via `ResponsiveContainer` |
| **Axios + fetch** | `yahooService`, `googleService`, `usePortfolio` | `Data Fetching: fetch, Axios, or similar` |
| **yahoo-finance2** | `googleService.ts` | Primary for `trailingPE` / `epsTrailingTwelveMonths` (NSE live) — fallback to scraping |
| **Unofficial Yahoo Chart API** | `yahooService.ts` | `https://query1.finance.yahoo.com/v8/finance/chart/{HDFCBANK.NS}` — no official Yahoo API (PDF note) |
| **Google Finance Scraping** | `googleService.ts` | `https://www.google.com/finance/quote/{HDFCBANK:NSE}` HTML regex `P/E ratio` / `EPS` with `decimal + range` validation to avoid `dO6` class false match |
| **Caching** | `portfolioService.ts` | Overall `15s` portfolio cache (0.2ms cached) + per-ticker `CMP 60s`, `P/E 5min`, `Earnings 5min` — `Rate Limiting: caching, throttling, batching` |
| **Throttling** | `portfolioService.ts` | `runWithLimit(8)` — was `87 parallel` every 15s → max 8 concurrent via `Promise.allSettled` (graceful) |
| **Validation** | `yahooService.ts` | `price > high*5` / `>100000` / `instrumentType` check to catch Yahoo bug `541557.BO → 10B vs 52W 7326` |
| **Error Handling** | `App.tsx`, `PortfolioTable.tsx`, `utils/format.ts` | `N/A → — + ↻ Retry`, `fmtMoney` guard before `toLocaleString`, `Live`/`Fallback` badges disclosed per `Data Accuracy` |
| **Memoization** | `Header`, `SummaryCards`, `SectorSummary`, `PortfolioTable`, `SectorCharts` | `React.memo` + `useMemo` for columns/pieData — `Performance Optimization` |
| **Async/Await** | `portfolioService.ts` | `async/await` + `Promise.all` per stock (CMP+P/E+Earnings concurrent) |

---

## Features Implemented

* **11-column table:** Particulars, Purchase Price, Qty, Investment (`Price×Qty`), Portfolio % (`Investment/Total`), NSE/BSE, **CMP (Yahoo)**, Present Value (`CMP×Qty`), Gain/Loss (`Present-Investment`), **P/E (Google)**, **Latest Earnings (Google)** — color-coded Gain/Loss (green/red)
* **Sector grouping:** Financial, Tech, Consumer, Power, Pipe, Others with `Total Investment / Present Value / GainLoss`
* **Dynamic updates:** `15s` `setInterval` in `usePortfolio` + `15s` server cache; `Last updated` pulse in `Header`
* **TanStack Table:** Click header to sort `↑↓`, search input filters globally
* **Recharts:** Pie shows allocation; Bar shows Investment (blue) vs Present Value (green) per sector
* **Badges & Retry:** P/E & Earnings per-cell `Live` (green) / `Fallback` (amber); CMP `N/A` → `—` + `↻ Retry` triggers `refetch`
* **Responsive:** `grid-cols-1 md:grid-cols-3`, `overflow-x-auto`, `ResponsiveContainer`

---

## Project Structure

```
8byte/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx (memo, lastUpdated)
│   │   │   ├── SummaryCards.tsx (Total Investment/Present/GainLoss)
│   │   │   ├── SectorSummary.tsx (sector cards)
│   │   │   ├── SectorCharts.tsx (Recharts Pie + Bar)
│   │   │   └── PortfolioTable.tsx (TanStack Table + Live/Fallback + Retry)
│   │   ├── hooks/
│   │   │   └── usePortfolio.ts (fetch + 15s interval + refetch)
│   │   ├── utils/
│   │   │   └── format.ts (fmtMoney/fmt with N/A guard)
│   │   ├── types.ts (Stock: peSource/earningsSource?: 'live'|'mock')
│   │   └── App.tsx (orchestrator)
│   ├── vite.config.ts (proxy /api → :5000)
│   └── package.json
├── server/
│   ├── data/
│   │   ├── portfolio.ts (29 holdings → 6 sectors, from Excel F900...)
│   │   └── F9001561_ADDBA737E8_B72562937A.xlsx
│   ├── services/
│   │   ├── yahooService.ts (CMP + validation)
│   │   ├── googleService.ts (P/E/Earnings: yahoo-finance2 → scraping → mock)
│   │   └── portfolioService.ts (aggregation, per-ticker cache, 8-limit, 15s cache)
│   ├── routes/ portfolio.ts
│   ├── controllers/ portfolioController.ts
│   ├── index.ts
│   └── package.json
└── README.md
```

---

## Setup and Usage Instructions

### Prerequisites

* Node.js 20+ and npm
* No API keys required (public unofficial endpoints)

### 1. Clone

```bash
git clone https://github.com/aryanB1706/8byte_assignment.git
cd 8byte
```

### 2. Server

```bash
cd server
npm install
cp .env.example .env   # PORT=5000
npm run dev            # http://localhost:5000
```

Verify:

```bash
curl http://localhost:5000/api/health          # {"status":"ok"}
curl http://localhost:5000/api/portfolio | head # holdings + sectors + summary
```

### 3. Client

New terminal:

```bash
cd client
npm install
npm run dev            # http://localhost:5173  (Vite proxies /api → :5000)
```

Open `http://localhost:5173` — table, sector cards, Pie/Bar, Live/Fallback badges, 15s auto-refresh.

### 4. Build for Production

```bash
# Client
cd client
npm run build          # tsc -b && vite build → dist/ (638kb, gz 186kb)

# Server
cd ../server
npm run build          # tsc → dist/
npm start              # node dist/index.js
```

### 5. Environment Variables

`server/.env.example`:

```
PORT=5000
```

### 6. Data Source Note

Holdings loaded from `server/data/portfolio.ts` (derived from `F900...xlsx` — 29 stocks across 6 sectors; Excel total `E35=1543060` excludes 3 below-total rows, our `1678627` includes all 29 for correct `Portfolio %`).

---

## API & Data Fetching Strategy

* **Yahoo CMP:** `query1` chart API, `HDFCBANK.NS` / `532174.BO`, `User-Agent`, `5s` timeout, sanity `> high*5 → N/A`
* **P/E/Earnings:** `yahoo-finance2` (`trailingPE`, `epsTrailingTwelveMonths`) → Google HTML regex (`P/E ratio` decimal + `5-100` range) → Yahoo HTML → deterministic mock `Q1 FY25: ₹77.8 Cr (EPS 13.1)` per exchange hash (disclosed via badges)
* **Throttling & Cache:** `87 parallel → 8 concurrent` + `Promise.allSettled`, `CMP 60s`, `P/E/Earnings 5min`, `portfolio 15s` (second refresh `0.2ms`)
* **UI Disclosure:** `CMP live via Yahoo • P/E/Earnings Live/Fallback • 15s cache+refresh` + per-cell badges

---

## Data Model & Calculations

```ts
investment        = purchasePrice * qty
portfolioPercent  = investment / totalInvestment * 100
presentValue      = cmp === "N/A" ? "N/A" : cmp * qty
gainLoss          = cmp === "N/A" ? "N/A" : presentValue - investment
sector.totalPresentValue = sum numeric presentValue only (skip N/A)
summary.totalGainLoss    = totalPresentValue - totalInvestment
```

`toLocaleString('en-IN')` guarded by `fmtMoney` (`N/A` check first) prevents `N/A.toLocaleString` crash.

---

## Available Scripts

| Location | Command | Description |
| :--- | :--- | :--- |
| `client` | `npm run dev` | Vite dev (5173) |
| `client` | `npm run build` | `tsc -b && vite build` |
| `server` | `npm run dev` | `tsx watch index.ts` (5000) |
| `server` | `npm run build` | `tsc` |
| `server` | `npm start` | `node dist/index.js` |

---

## Verification

```bash
curl http://localhost:5000/api/portfolio | python3 -c "import json,sys; d=json.load(sys.stdin); print({k: (v['totalInvestment'], v['totalPresentValue']) for k,v in d['sectors'].items()})"
# Financial 328450, Tech 337820, Consumer 263565... matches Excel
```

---

## Deployment

**Live:** https://8byte-assignment-swart.vercel.app/ (single Vercel deploy — client `dist` + serverless `api/index.ts`, no cold sleep)
* `vercel.json` rewrites `/api/(.*)` → `server/index.ts`, build `client + server`

## Notes

* PDF Goal `ReactJs/Next.js` — Vite is valid ReactJs; Next caching can be added via `revalidate`.

---

## License

Assignment for OctaByte AI Pvt Ltd — educational.
