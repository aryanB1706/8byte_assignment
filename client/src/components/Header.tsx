import { memo } from 'react'

interface Props {
  lastUpdated: string | null
}

function Header({ lastUpdated }: Props) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Dynamic Portfolio Dashboard</h1>
        <div className="text-sm text-slate-500 flex items-center gap-2">
          <span>Last updated: {lastUpdated ?? '--'}</span>
          <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
        </div>
      </div>
    </header>
  )
}

export default memo(Header)
