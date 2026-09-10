import { memo } from 'react'

interface Props {
  summary: {
    totalInvestment: number
    totalPresentValue: number
    totalGainLoss: number
  }
}

function formatINR(n: number | string) {
  if (typeof n === 'string') return n
  return `₹${n.toLocaleString('en-IN')}`
}

function SummaryCards({ summary }: Props) {
  const isGain = summary.totalGainLoss >= 0
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl shadow border">
        <p className="text-sm text-slate-500">Total Investment</p>
        <p className="text-xl font-bold">{formatINR(summary.totalInvestment)}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow border">
        <p className="text-sm text-slate-500">Total Present Value</p>
        <p className="text-xl font-bold">{formatINR(summary.totalPresentValue)}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow border">
        <p className="text-sm text-slate-500">Total Gain/Loss</p>
        <p className={`text-xl font-bold ${isGain ? 'text-green-600' : 'text-red-600'}`}>
          {formatINR(summary.totalGainLoss)} {isGain ? '↑' : '↓'}
        </p>
      </div>
    </div>
  )
}

export default memo(SummaryCards)
