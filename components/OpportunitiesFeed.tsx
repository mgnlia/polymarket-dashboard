'use client'
import { useOpportunities } from '@/lib/hooks'
import { fmt$, fmtPct } from '@/lib/utils'

export default function OpportunitiesFeed() {
  const { data: opps, loading, error, lastUpdated } = useOpportunities(8)

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">🔥 Live Opportunities</h2>
        {lastUpdated && (
          <span className="text-[10px] text-slate-600">
            {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
      <p className="text-[10px] text-slate-600">High-volume markets with wide spreads — best for market making rewards</p>

      {error && (
        <p className="text-xs text-red-400">⚠ {error}</p>
      )}

      <div className="space-y-2">
        {loading && opps.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-800 rounded-lg animate-pulse" />
          ))
        ) : opps.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No opportunities found</p>
        ) : (
          opps.map(m => (
            <a
              key={m.condition_id}
              href={`https://polymarket.com/event/${m.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors group border border-slate-800 hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] text-slate-300 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug flex-1">
                  {m.question}
                </p>
                {m.has_rewards && (
                  <span className="text-[9px] text-yellow-400 bg-yellow-400/10 px-1 py-0.5 rounded font-semibold flex-shrink-0">
                    REWARDS
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] font-mono text-green-400">YES {Math.round(m.yes_price * 100)}¢</span>
                <span className="text-[10px] font-mono text-red-400">NO {Math.round(m.no_price * 100)}¢</span>
                <span className="text-[10px] font-mono text-slate-500">Vol {fmt$(m.volume_24h, 0)}</span>
                <span className={`text-[10px] font-mono ml-auto ${m.spread > 0.03 ? 'text-orange-400' : 'text-slate-500'}`}>
                  Spread {fmtPct(m.spread)}
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}
