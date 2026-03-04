'use client'
import { cn, categoryBadge, scoreColor, fmtPct, fmt$ } from '@/lib/utils'
import type { Market } from '@/lib/api'

export default function MarketsTable({ markets }: { markets: Market[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-sm">
      <div className="px-5 py-4 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300">Active Markets</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Market', 'Category', 'YES', 'NO', 'Vol 24h', 'Incentive', 'Score'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {markets.map((m, i) => (
              <tr key={m.condition_id} className={cn('border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors', i % 2 === 0 ? '' : 'bg-slate-900/30')}>
                <td className="px-4 py-3 max-w-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200 truncate">{m.question}</span>
                    {m.is_extreme && <span className="shrink-0 px-1 py-0.5 rounded text-xs bg-red-500/20 text-red-300 border border-red-500/30">EXTREME</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs border', categoryBadge(m.category))}>{m.category}</span>
                </td>
                <td className="px-4 py-3 font-mono text-green-400">{fmtPct(m.yes_price)}</td>
                <td className="px-4 py-3 font-mono text-red-400">{fmtPct(m.no_price)}</td>
                <td className="px-4 py-3 text-slate-300 font-mono">{fmt$(m.volume_24h, 0)}</td>
                <td className="px-4 py-3 text-slate-300 font-mono">{fmt$(m.incentive_size, 0)}</td>
                <td className="px-4 py-3 font-mono font-semibold">
                  <span className={scoreColor(m.reward_score)}>{m.reward_score.toFixed(2)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
