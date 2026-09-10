import { memo } from 'react'
import type { SectorInfo } from '../types'

interface Props {
  sectors: Record<string, SectorInfo>
}

function formatINR(n: number | string) {
  if (typeof n === 'string') return n
  return `₹${n.toLocaleString('en-IN')}`
}

function SectorSummary({ sectors }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-4">
      <h2 className="font-semibold mb-2">Sector Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(sectors).map(([sector, info]) => {
          const isGain = info.totalGainLoss >= 0
          return (
            <div key={sector} className="bg-white p-4 rounded-lg border">
              <h3 className="font-bold text-slate-700">{sector}</h3>
              <p className="text-sm">Investment: {formatINR(info.totalInvestment)}</p>
              <p className="text-sm">Present Value: {formatINR(info.totalPresentValue)}</p>
              <p className={`text-sm font-semibold ${isGain ? 'text-green-600' : 'text-red-600'}`}>
                Gain/Loss: {formatINR(info.totalGainLoss)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(SectorSummary)
