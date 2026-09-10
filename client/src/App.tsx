import { usePortfolio } from './hooks/usePortfolio'
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import SectorSummary from './components/SectorSummary'
import SectorCharts from './components/SectorCharts'
import PortfolioTable from './components/PortfolioTable'

function App() {
  const { data, loading, error, lastUpdated } = usePortfolio(15000)

  if (loading) return <div className="p-10 text-center">Loading portfolio...</div>
  if (error) return <div className="p-10 text-center text-red-600">Error: {error}</div>
  if (!data) return null

  const { holdings, sectors, summary } = data

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lastUpdated={lastUpdated} />
      <SummaryCards summary={summary} />
      <SectorSummary sectors={sectors} />
      <SectorCharts sectors={sectors} />

      <div className="max-w-7xl mx-auto px-4 pb-10">
        <PortfolioTable holdings={holdings} />
        <p className="text-xs text-slate-400 mt-2">
          * CMP, P/E, Earnings — Live via Yahoo/Google Finance strategy (15s cache + refresh). Falls back to N/A on rate-limit.
        </p>
      </div>
    </div>
  )
}

export default App
