'use client'
import { useState } from 'react'
import { type UseMarketsReturn, type SortKey } from '@/lib/hooks'
import { fmt$, fmtPct, cn } from '@/lib/utils'
import type { LiveMarket } from '@/lib/gamma'

interface Props {
  hook: UseMarketsReturn
}

const SORT_COLS: { key: SortKey; label: string }[] = [
  { key: 'volume_24h',   label: 'Vol 24h' },
  { key: 'liquidity',    label: 'Liquidity' },
  { key: 'reward_score', label: 'Score' },
  { key: 'spread',       label: 'Spread' },
  { key: 'end_date',     label: 'Ends' },
]

function ScoreBadge({ score }: { score: number }) {
  const color = score > 0.7 ? 'text-green-400 bg-green-400/10 border-green-500/30'
              : score > 0.4 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30'
              :                'text-slate-400 bg-slate-400/10 border-slate-600/30'
  return (
    <span className={cn('px-2 py-0.5 rounded border text-xs font-mono font-semibold', color)}>
      {score.toFixed(2)}
    </span>
  )
}

function CategoryBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    politics:   'text-blue-300 bg-blue-500/10 border-blue-500/30',
    crypto:     'text-orange-300 bg-orange-500/10 border-orange-500/30',
    sports:     'text-green-300 bg-green-500/10 border-green-500/30',
    economics:  'text-purple-300 bg-purple-500/10 border-purple-500/30',
    science:    'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
    general:    'text-slate-300 bg-slate-500/10 border-slate-600/30',
  }
  const c = colors[cat?.toLowerCase()] ?? colors.general
  return (
    <span className={cn('px-1.5 py-0.5 rounded border text-xs truncate max-w-[80px]', c)}>
      {cat}
    </span>
  )
}

function MarketRow({ m }: { m: LiveMarket }) {
  const [expanded, setExpanded] = useState(false)
  const daysLeft = m.end_date
    ? Math.ceil((new Date(m.end_date).getTime() - Date.now()) / 86_400_000)
    : null
  const urgent = daysLeft !== null && daysLeft <= 7

  return (
    <>
      <tr
        onClick={() => setExpanded(e => !e)}
        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
      >
        <td className="px-4 py-3 max-w-[260px]">
          <div className="flex items-start gap-2">
            {m.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.image} alt="" className="w-6 h-6 rounded shrink-0 mt-0.5 object-cover" />
            )}
            <div className="min-w-0">
              <p className="text-slate-200 text-xs leading-snug line-clamp-2">{m.question}</p>
              {m.has_rewards && (
                <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Rewards
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="px-3 py-3"><CategoryBadge cat={m.category} /></td>
        <td className="px-3 py-3 font-mono text-green-400 text-sm">{fmtPct(m.yes_price)}</td>
        <td className="px-3 py-3 font-mono text-red-400 text-sm">{fmtPct(m.no_price)}</td>
        <td className="px-3 py-3 text-slate-300 font-mono text-sm whitespace-nowrap">{fmt$(m.volume_24h, 0)}</td>
        <td className="px-3 py-3 text-slate-300 font-mono text-sm whitespace-nowrap">{fmt$(m.liquidity, 0)}</td>
        <td className="px-3 py-3 font-mono text-sm">
          <span className={m.spread > 0.03 ? 'text-yellow-400' : 'text-slate-400'}>
            {(m.spread * 100).toFixed(1)}%
          </span>
        </td>
        <td className="px-3 py-3">
          {daysLeft !== null && (
            <span className={cn('text-xs font-mono', urgent ? 'text-red-400' : 'text-slate-400')}>
              {daysLeft}d
            </span>
          )}
        </td>
        <td className="px-3 py-3"><ScoreBadge score={m.reward_score} /></td>
      </tr>
      {expanded && (
        <tr className="border-b border-slate-800/50 bg-slate-900/40">
          <td colSpan={9} className="px-4 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-slate-500 mb-0.5">Total Volume</p>
                <p className="text-slate-200 font-mono">{fmt$(m.volume_total, 0)}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Best Bid / Ask</p>
                <p className="text-slate-200 font-mono">{fmtPct(m.best_bid)} / {fmtPct(m.best_ask)}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Rewards Min Size</p>
                <p className="text-slate-200 font-mono">${m.rewards_min_size}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Max Spread for Rewards</p>
                <p className="text-slate-200 font-mono">{m.rewards_max_spread}¢</p>
              </div>
              <div className="col-span-2 sm:col-span-4">
                <p className="text-slate-500 mb-0.5">Polymarket Link</p>
                <a
                  href={`https://polymarket.com/event/${m.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  polymarket.com/event/{m.slug}
                </a>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function LiveMarketsTable({ hook }: Props) {
  const {
    filtered, categories, loading, error, lastUpdated, refresh,
    category, setCategory, sortBy, setSortBy, sortAsc, setSortAsc,
    searchQuery, setSearchQuery, rewardsOnly, setRewardsOnly,
  } = hook

  function toggleSort(key: SortKey) {
    if (sortBy === key) setSortAsc(!sortAsc)
    else { setSortBy(key); setSortAsc(false) }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-300 whitespace-nowrap">Live Markets</h3>
          {loading && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
          {!loading && !error && <span className="w-2 h-2 rounded-full bg-green-400" />}
          {error && <span className="text-xs text-red-400">{error}</span>}
          {lastUpdated && (
            <span className="text-xs text-slate-500 hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <button
          onClick={refresh}
          className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded border border-slate-700 hover:border-slate-500 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap gap-2 items-center">
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search markets…"
          className="flex-1 min-w-[160px] max-w-xs bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500"
        />
        {/* Category pills */}
        <div className="flex flex-wrap gap-1">
          {categories.slice(0, 8).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-2 py-1 rounded text-xs border transition-colors capitalize',
                category === cat
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Rewards toggle */}
        <label className="flex items-center gap-2 cursor-pointer ml-auto">
          <span className="text-xs text-slate-400">Rewards only</span>
          <button
            onClick={() => setRewardsOnly(!rewardsOnly)}
            className={cn(
              'w-8 h-4 rounded-full transition-colors relative',
              rewardsOnly ? 'bg-green-500' : 'bg-slate-700',
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform',
              rewardsOnly ? 'translate-x-4' : 'translate-x-0.5',
            )} />
          </button>
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Market</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cat</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">YES</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">NO</th>
              {SORT_COLS.map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-slate-200 select-none"
                >
                  {col.label} {sortBy === col.key ? (sortAsc ? '↑' : '↓') : ''}
                </th>
              ))}
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">Ends</th>
            </tr>
          </thead>
          <tbody>
            {loading && filtered.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-3 py-3">
                      <div className="h-3 bg-slate-800 rounded animate-pulse" style={{ width: `${40 + (i * j * 7) % 50}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500 text-sm">
                  No markets match your filters
                </td>
              </tr>
            ) : (
              filtered.slice(0, 50).map(m => <MarketRow key={m.condition_id} m={m} />)
            )}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-slate-800 text-xs text-slate-500">
        Showing {Math.min(filtered.length, 50)} of {filtered.length} markets · Auto-refreshes every 30s
      </div>
    </div>
  )
}
