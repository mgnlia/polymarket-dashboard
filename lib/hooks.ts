import { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchLiveMarkets,
  fetchTopOpportunities,
  extractCategories,
  type LiveMarket,
  type FetchMarketsOptions,
} from './gamma'

const REFRESH_INTERVAL = 30_000 // 30 seconds

// ── Generic polling hook ──────────────────────────────────────────────────

function usePolling<T>(
  fetcher: () => Promise<T>,
  initialData: T,
  intervalMs = REFRESH_INTERVAL,
) {
  const [data, setData]       = useState<T>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const refresh = useCallback(async () => {
    try {
      const result = await fetcherRef.current()
      setData(result)
      setError(null)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, intervalMs)
    return () => clearInterval(id)
  }, [refresh, intervalMs])

  return { data, loading, error, lastUpdated, refresh }
}

// ── Market data hook ──────────────────────────────────────────────────────

export interface UseMarketsReturn {
  markets: LiveMarket[]
  filtered: LiveMarket[]
  categories: string[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => void
  // filter/sort controls
  category: string
  setCategory: (c: string) => void
  sortBy: SortKey
  setSortBy: (s: SortKey) => void
  sortAsc: boolean
  setSortAsc: (a: boolean) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  rewardsOnly: boolean
  setRewardsOnly: (r: boolean) => void
}

export type SortKey = 'volume_24h' | 'liquidity' | 'reward_score' | 'spread' | 'yes_price' | 'end_date'

const SORT_FNS: Record<SortKey, (a: LiveMarket, b: LiveMarket) => number> = {
  volume_24h:   (a, b) => b.volume_24h   - a.volume_24h,
  liquidity:    (a, b) => b.liquidity    - a.liquidity,
  reward_score: (a, b) => b.reward_score - a.reward_score,
  spread:       (a, b) => b.spread       - a.spread,
  yes_price:    (a, b) => a.yes_price    - b.yes_price,
  end_date:     (a, b) => a.end_date.localeCompare(b.end_date),
}

export function useMarkets(opts: FetchMarketsOptions = {}): UseMarketsReturn {
  const [category,     setCategory]     = useState('all')
  const [sortBy,       setSortBy]       = useState<SortKey>('volume_24h')
  const [sortAsc,      setSortAsc]      = useState(false)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [rewardsOnly,  setRewardsOnly]  = useState(false)

  const fetcher = useCallback(
    () => fetchLiveMarkets({ limit: 100, active: true, ...opts }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const { data: markets, loading, error, lastUpdated, refresh } =
    usePolling<LiveMarket[]>(fetcher, [])

  const categories = extractCategories(markets)

  const filtered = markets
    .filter(m => {
      if (category !== 'all' && m.category !== category) return false
      if (rewardsOnly && !m.has_rewards) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!m.question.toLowerCase().includes(q) && !m.event_title.toLowerCase().includes(q)) return false
      }
      return true
    })
    .sort((a, b) => {
      const cmp = SORT_FNS[sortBy](a, b)
      return sortAsc ? -cmp : cmp
    })

  return {
    markets,
    filtered,
    categories,
    loading,
    error,
    lastUpdated,
    refresh,
    category,
    setCategory,
    sortBy,
    setSortBy,
    sortAsc,
    setSortAsc,
    searchQuery,
    setSearchQuery,
    rewardsOnly,
    setRewardsOnly,
  }
}

// ── Opportunities hook ────────────────────────────────────────────────────

export function useOpportunities(limit = 8) {
  const fetcher = useCallback(() => fetchTopOpportunities(limit), [limit])
  return usePolling<LiveMarket[]>(fetcher, [])
}
