import { memo, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import type { SectorInfo } from '../types'

interface Props {
  sectors: Record<string, SectorInfo>
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899']

function SectorCharts({ sectors }: Props) {
  const pieData = useMemo(
    () =>
      Object.entries(sectors).map(([name, info]) => ({
        name,
        value: info.totalInvestment,
      })),
    [sectors]
  )

  const barData = useMemo(
    () =>
      Object.entries(sectors).map(([name, info]) => ({
        name,
        Investment: info.totalInvestment,
        PresentValue: info.totalPresentValue,
        GainLoss: info.totalGainLoss,
      })),
    [sectors]
  )

  return (
    <div className="max-w-7xl mx-auto px-4 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-xl shadow border">
        <h3 className="font-semibold text-slate-700 mb-2">Allocation by Sector (Investment)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow border">
        <h3 className="font-semibold text-slate-700 mb-2">Sector Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
              <Legend />
              <Bar dataKey="Investment" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="PresentValue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default memo(SectorCharts)
