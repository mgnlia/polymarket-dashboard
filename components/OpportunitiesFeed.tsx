'use client'
import { useOpportunities } from '@/lib/hooks'
import { fmt$, fmtPct, cn } from '@/lib/utils'

export default function OpportunitiesFeed() {
  const { data: opps, loading, lastUpdated } = useOpportunities(8)

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-sm">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
        <span className="text-lg">🎯</span>
        <h3 className="text-sm font-semibold text-slate-300">Top Opportunities</h3>
        {loading && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse ml-auto" />}
        {lastUpdated && (
          <span className="text-xs text-slate-500 ml-auto">
            {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="divide-y divide-slate-800/60">
        {loading && opps.length === 0
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 h-3 bg-slate-800 rounded animate-pulse" />
                <div className="w-16 h-3 bg-slate-800 rounded animate-pulse" />
              </div>
            ))
          : opps.map((m, i) => {
              const score = (m.volume_24h * m.spread) / 1_000
              return (
                <a
                  key={m.condition_id}
                  href={`https://polymarket.com/event/${m.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Rank */}
                  <span className="text-xs font-mono text-slate-600 w-5 shrink-0 pt-0.5">
                    #{i + 1}
                  </span>
                  {/* Market info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 line-clamp-2 group-hover:text-slate-100 transition-colors">
                      {m.question}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500 capitalize">{m.category}</span>
                      <span className="text-[10px] text-slate-600">·</span>
                      <span className="text-[10px] font-mono text-green-400">{fmtPct(m.yes_price)}</span>
                      <span className="text-[10px] text-slate-600">/</span>
                      <span className="text-[10px] font-mono text-red-400">{fmtPct(m.no_price)}</span>
                    </div>
                  </div>
                  {/* Metrics */}
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-mono text-slate-200">{fmt$(m.volume_24h, 0)}</p>
                    <p className="text-[10px] font-mono text-yellow-400">
                      {(m.spread * 100).toFixed(1)}% spread
                    </p>
                    <p className="text-[10px] text-slate-500">
                      score {score.toFixed(0)}
                    </p>
                  </div>
                </a>
              )
            })
        }
      </div>
      <div className="px-5 py-2 border-t border-slate-800 text-xs text-slate-500">
        Ranked by volume × spread · click to open on Polymarket
      </div>
    </div>
  )
}
