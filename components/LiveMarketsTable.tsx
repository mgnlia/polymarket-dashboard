'use client'
import { type UseMarketsReturn, type SortKey } from '@/lib/hooks'
import { fmt$, fmtPct, fmtDate, timeSince } from '@/lib/utils'
import { type LiveMarket } from '@/lib/gamma'

interface Props { hook: UseMarketsReturn }

function PriceBar({ yes, no }: { yes: number; no: number }) {
  const yPct = Math.round(yes * 100)
  return (
    <div className="flex items-center gap-1">
      <div className="flex h-1.5 w-16 rounded-full overflow-hidden bg-slate-700">
        <div className="bg-green-500" style={{ width: `${yPct}%` }} />
        <div className="bg-red-500"   style={{ width: `${100 - yPct}%` }} />
      </div>
    </div>
  )
}

function MarketRow({ m }: { m: LiveMarket }) {
  const url = `https://polymarket.com/event/${m.slug}`
  const yPct = Math.round(m.yes_price * 100)
  const nPct = 100 - yPct

  return (
    <tr className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors group">
      {/* Market */}
      <td className="py-3 px-3">
        <div className="flex items-start gap-2.5 max-w-xs">
          {m.image && (
            <img
              src={m.image}
              alt=""
              className="w-7 h-7 rounded-md object-cover flex-shrink-0 mt-0.5"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug"
            >
              {m.question}
            </a>
            <div className="flex items-center gap-1.5 mt-1">
              {m.category && (
                <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                  {m.category}
                </span>
              )}
              {m.has_rewards && (
                <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded font-semibold">
                  REWARDS
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* YES price */}
      <td className="py-3 px-3 text-right">
        <div className="flex flex-col items-end gap-1">
          <span className={`text-sm font-mono font-semibold ${yPct >= 50 ? 'text-green-400' : 'text-slate-400'}`}>
            {yPct}¢
          </span>
          <span className={`text-xs font-mono ${nPct >= 50 ? 'text-red-400' : 'text-slate-500'}`}>
            {nPct}¢
          </span>
        </div>
      </td>

      {/* Price bar */}
      <td className="py-3 px-3">
        <PriceBar yes={m.yes_price} no={m.no_price} />
      </td>

      {/* 24h Volume */}
      <td className="py-3 px-3 text-right">
        <span className="text-xs font-mono text-slate-300">{fmt$(m.volume_24h, 0)}</span>
      </td>

      {/* Liquidity */}
      <td className="py-3 px-3 text-right">
        <span className="text-xs font-mono text-slate-400">{fmt$(m.liquidity, 0)}</span>
      </td>

      {/* Reward score */}
      <td className="py-3 px-3 text-right">
        <div className="flex flex-col items-end gap-0.5">
          <span className={`text-xs font-mono font-semibold ${
            m.reward_score >= 0.5 ? 'text-yellow-400' :
            m.reward_score >= 0.25 ? 'text-slate-300' : 'text-slate-500'
          }`}>
            {Math.round(m.reward_score * 100)}
          </span>
          <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${m.reward_score * 100}%` }}
            />
          </div>
        </div>
      </td>

      {/* Spread */}
      <td className="py-3 px-3 text-right">
        <span className={`text-xs font-mono ${m.spread > 0.02 ? 'text-orange-400' : 'text-slate-400'}`}>
          {m.spread > 0 ? fmtPct(m.spread) : '—'}
        </span>
      </td>

      {/* End date */}
      <td className="py-3 px-3 text-right">
        <span className="text-xs text-slate-500">{fmtDate(m.end_date)}</span>
      </td>
    </tr>
  )
}

export default function LiveMarketsTable({ hook }: Props) {
  const {
    filtered, loading, error, lastUpdated, refresh,
    category, setCategory, categories,
    sortBy, setSortBy,
    searchQuery, setSearchQuery,
    rewardsOnly, setRewardsOnly,
  } = hook

  function toggleSort(key: SortKey) {
    if (sortBy === key) hook.setSortAsc(!hook.sortAsc)
    else { setSortBy(key); hook.setSortAsc(false) }
  }

  const SortTh = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      className={`py-2 px-3 text-right text-[10px] uppercase tracking-wider cursor-pointer select-none whitespace-nowrap ${
        sortBy === k ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
      }`}
      onClick={() => toggleSort(k)}
    >
      {label}{sortBy === k ? (hook.sortAsc ? ' ↑' : ' ↓') : ''}
    </th>
  )

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-800">
        {/* Search */}
        <input
          type="text"
          placeholder="Search markets…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[160px] bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />

        {/* Category */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>

        {/* Rewards toggle */}
        <label className="flex items-center gap-2 cursor-pointer" onClick={() => setRewardsOnly(!rewardsOnly)}>
          <div className={`w-8 h-4 rounded-full transition-colors ${rewardsOnly ? 'bg-yellow-500' : 'bg-slate-700'}`}>
            <div className={`w-3 h-3 bg-white rounded-full mt-0.5 transition-transform ${rewardsOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-xs text-slate-400">Rewards only</span>
        </label>

        {/* Refresh */}
        <button
          onClick={refresh}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          ↻ {loading ? 'Loading…' : 'Refresh'}
        </button>

        {lastUpdated && (
          <span className="text-xs text-slate-600">
            {timeSince(lastUpdated)}
          </span>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-900/20 border-b border-red-800/40 text-xs text-red-400">
          ⚠ API error: {error}. Retrying in 30s…
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="py-2 px-3 text-left text-[10px] uppercase tracking-wider text-slate-500">Market</th>
              <th className="py-2 px-3 text-right text-[10px] uppercase tracking-wider text-slate-500">YES / NO</th>
              <th className="py-2 px-3 text-left text-[10px] uppercase tracking-wider text-slate-500">Bar</th>
              <SortTh k="volume_24h"   label="Vol 24h" />
              <SortTh k="liquidity"    label="Liquidity" />
              <SortTh k="reward_score" label="Score" />
              <SortTh k="spread"       label="Spread" />
              <SortTh k="end_date"     label="Ends" />
            </tr>
          </thead>
          <tbody>
            {loading && filtered.length === 0 ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/60">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="py-3 px-3">
                      <div className="h-3 bg-slate-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                  No markets found. Try adjusting filters.
                </td>
              </tr>
            ) : (
              filtered.map(m => <MarketRow key={m.condition_id} m={m} />)
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 border-t border-slate-800 text-xs text-slate-600">
        Showing {filtered.length} of {hook.markets.length} markets · Auto-refreshes every 30s
      </div>
    </div>
  )
}
