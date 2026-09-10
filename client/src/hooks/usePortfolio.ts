import { useEffect, useState, useCallback } from 'react'
import type { PortfolioResponse } from '../types'

export function usePortfolio(refreshInterval = 15000) {
  const [data, setData] = useState<PortfolioResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio')
      if (!res.ok) throw new Error(`API failed: ${res.status}`)
      const json: PortfolioResponse = await res.json()
      setData(json)
      setLastUpdated(new Date().toLocaleTimeString())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPortfolio()
    const id = setInterval(fetchPortfolio, refreshInterval)
    return () => clearInterval(id)
  }, [fetchPortfolio, refreshInterval])

  return { data, loading, error, lastUpdated, refetch: fetchPortfolio }
}
