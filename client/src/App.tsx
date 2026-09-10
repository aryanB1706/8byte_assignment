import { useEffect, useState } from 'react'
import type { PortfolioResponse } from './types'

function App() {
  const [data, setData] = useState<PortfolioResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/portfolio')
      if (!res.ok) throw new Error('API failed')
      const json: PortfolioResponse = await res.json()
      setData(json)
      setLastUpdated(new Date().toLocaleTimeString())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()
    const interval = setInterval(fetchPortfolio, 15000) // 15 sec auto refresh - assignment requirement
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="p-10 text-center">Loading portfolio...</div>
  if (error) return <div className="p-10 text-center text-red-600">Error: {error}</div>
  if (!data) return null

  const { holdings, sectors, summary } = data

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Dynamic Portfolio Dashboard</h1>
          <div className="text-sm text-slate-500">
            Last updated: {lastUpdated} <span className="ml-2 w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse"></span>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-sm text-slate-500">Total Investment</p>
          <p className="text-xl font-bold">₹{summary.totalInvestment.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-sm text-slate-500">Total Present Value</p>
          <p className="text-xl font-bold">₹{summary.totalPresentValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-sm text-slate-500">Total Gain/Loss</p>
          <p className={`text-xl font-bold ${summary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{summary.totalGainLoss.toLocaleString()} {summary.totalGainLoss >=0 ? '↑' : '↓'}
          </p>
        </div>
      </div>

      {/* Sector Summaries */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <h2 className="font-semibold mb-2">Sector Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(sectors).map(([sector, info]) => (
            <div key={sector} className="bg-white p-4 rounded-lg border">
              <h3 className="font-bold text-slate-700">{sector}</h3>
              <p className="text-sm">Investment: ₹{info.totalInvestment.toLocaleString()}</p>
              <p className="text-sm">Present Value: ₹{info.totalPresentValue.toLocaleString()}</p>
              <p className={`text-sm font-semibold ${info.totalGainLoss >=0 ? 'text-green-600' : 'text-red-600'}`}>
                Gain/Loss: ₹{info.totalGainLoss.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Table */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="bg-white rounded-xl shadow border overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3 whitespace-nowrap">Particulars</th>
                <th className="p-3">Purchase</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Investment</th>
                <th className="p-3">Portfolio %</th>
                <th className="p-3">NSE/BSE</th>
                <th className="p-3">CMP</th>
                <th className="p-3">Present Value</th>
                <th className="p-3">Gain/Loss</th>
                <th className="p-3">P/E Ratio</th>
                <th className="p-3">Latest Earnings</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-medium">{h.particulars}</td>
                  <td className="p-3">₹{h.purchasePrice}</td>
                  <td className="p-3">{h.qty}</td>
                  <td className="p-3">₹{h.investment.toLocaleString()}</td>
                  <td className="p-3">{h.portfolioPercent}%</td>
                  <td className="p-3 text-xs">{h.exchange}</td>
                  <td className="p-3 font-semibold">₹{h.cmp}</td>
                  <td className="p-3">₹{h.presentValue.toLocaleString()}</td>
                  <td className={`p-3 font-bold ${h.gainLoss >=0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{h.gainLoss.toLocaleString()}
                  </td>
                  <td className="p-3">{h.peRatio}</td>
                  <td className="p-3 whitespace-nowrap">{h.latestEarnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-2">* CMP, P/E, Earnings - Mock data using Yahoo/Google Finance strategy (caching + 15s refresh). Real API can be plugged via yahoo-finance2 in server.</p>
      </div>
    </div>
  )
}

export default App
