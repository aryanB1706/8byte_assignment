import { memo, useMemo, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import type { Stock } from '../types'

const col = createColumnHelper<Stock>()

function fmt(n: number | string) {
  if (n === 'N/A' || n === null || n === undefined) return 'N/A'
  if (typeof n === 'string') return n
  return n.toLocaleString('en-IN')
}
function fmtMoney(n: number | string) {
  if (n === 'N/A') return 'N/A'
  if (typeof n === 'string') return n
  return `₹${n.toLocaleString('en-IN')}`
}

interface Props {
  holdings: Stock[]
  onRetry?: () => void
}

function RetryCell({ value, onRetry }: { value: string | number; onRetry?: () => void }) {
  const isNA = value === 'N/A'
  if (!isNA) return <span className="font-semibold">{`₹${(value as number).toLocaleString('en-IN')}`}</span>
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-slate-400">—</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border font-medium"
          title="Retry live CMP fetch"
        >
          ↻ Retry
        </button>
      )}
    </span>
  )
}

function PortfolioTable({ holdings, onRetry }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo(
    () => [
      col.accessor('particulars', {
        header: 'Particulars',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      col.accessor('purchasePrice', {
        header: 'Purchase',
        cell: (info) => fmtMoney(info.getValue() as number),
      }),
      col.accessor('qty', { header: 'Qty', cell: (info) => fmt(info.getValue() as number) }),
      col.accessor('investment', {
        header: 'Investment',
        cell: (info) => fmtMoney(info.getValue() as number),
      }),
      col.accessor('portfolioPercent', {
        header: 'Portfolio %',
        cell: (info) => `${fmt(info.getValue() as number)}%`,
      }),
      col.accessor('exchange', { header: 'NSE/BSE', cell: (info) => <span className="text-xs">{info.getValue()}</span> }),
      col.accessor('cmp', {
        header: 'CMP',
        cell: (info) => <RetryCell value={info.getValue() as string | number} onRetry={onRetry} />,
      }),
      col.accessor('presentValue', {
        header: 'Present Value',
        cell: (info) => {
          const v = info.getValue() as string | number
          if (v === 'N/A') return <span className="inline-flex items-center gap-2"><span className="text-slate-400">—</span>{onRetry && <button onClick={onRetry} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border font-medium">↻ Retry</button>}</span>
          return fmtMoney(v)
        },
      }),
      col.accessor('gainLoss', {
        header: 'Gain/Loss',
        cell: (info) => {
          const v = info.getValue() as string | number
          if (v === 'N/A') return <span className="inline-flex items-center gap-2"><span className="text-slate-400">—</span>{onRetry && <button onClick={onRetry} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border font-medium">↻ Retry</button>}</span>
          const isGain = typeof v === 'number' ? v >= 0 : false
          return <span className={`font-bold ${isGain ? 'text-green-600' : 'text-red-600'}`}>{fmtMoney(v)}</span>
        },
      }),
      col.accessor('peRatio', {
        header: 'P/E Ratio',
        cell: (info) => {
          const v = info.getValue() as string | number
          const src = (info.row.original as Stock).peSource
          return (
            <span className="inline-flex items-center gap-1.5">
              {fmt(v)}
              {src && <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${src === 'live' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{src === 'live' ? 'Live' : 'Fallback'}</span>}
            </span>
          )
        },
      }),
      col.accessor('latestEarnings', {
        header: 'Latest Earnings',
        cell: (info) => {
          const v = info.getValue() as string
          const src = (info.row.original as Stock).earningsSource
          return (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              {v ?? 'N/A'}
              {src && <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${src === 'live' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{src === 'live' ? 'Live' : 'Fallback'}</span>}
            </span>
          )
        },
      }),
    ],
    [onRetry]
  )

  const table = useReactTable({
    data: holdings,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
  })

  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">
      <div className="p-3 flex justify-between items-center border-b bg-slate-50">
        <h3 className="font-semibold text-slate-700">Holdings ({holdings.length})</h3>
        <input
          placeholder="Search stock..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-600">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 whitespace-nowrap select-none"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    <span className="flex items-center gap-1">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {table.getRowModel().rows.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-6">No results found.</p>
        )}
      </div>
    </div>
  )
}

export default memo(PortfolioTable)
