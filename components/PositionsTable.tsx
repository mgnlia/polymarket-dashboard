'use client'
import { cn, fmt$, fmtPct } from '@/lib/utils'
import type { Position } from '@/lib/api'

export default function PositionsTable({ positions }: { positions: Position[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-sm">
      <div className="px-5 py-4 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300">Open Positions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Market','YES Shares','YES Avg','NO Shares','NO Avg','Net Exp.','Realized P&L'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map((p, i) => {
              const netExp = p.yes_shares * p.yes_avg_cost - p.no_shares * p.no_avg_cost
              return (
                <tr key={p.condition_id} className={cn('border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors', i % 2 === 0 ? '' : 'bg-slate-900/30')}>
                  <td className="px-4 py-3 text-slate-200 max-w-xs truncate">{p.question}</td>
                  <td className="px-4 py-3 font-mono text-green-300">{p.yes_shares}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{fmtPct(p.yes_avg_cost)}</td>
                  <td className="px-4 py-3 font-mono text-red-300">{p.no_shares}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{fmtPct(p.no_avg_cost)}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{fmt$(netExp)}</td>
                  <td className={cn('px-4 py-3 font-mono font-semibold', p.realized_pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {p.realized_pnl >= 0 ? '+' : ''}{fmt$(p.realized_pnl)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
