'use client'
import { fmt$ } from '@/lib/utils'
import type { RiskSummary, RewardSummary } from '@/lib/api'

interface Props { risk: RiskSummary; rewards: RewardSummary; marketCount: number }

export default function AirdropScore({ rewards, marketCount }: Props) {
  const volumeScore    = Math.min(100, rewards.total_usdc / 10)
  const diversityScore = Math.min(100, marketCount * 12)
  const monthsActive   = Math.max(1, Math.floor(rewards.total_usdc / rewards.month_usdc))
  const longevityScore = Math.min(100, monthsActive * 15)
  const totalScore     = Math.round(volumeScore * 0.4 + diversityScore * 0.35 + longevityScore * 0.25)

  const bars = [
    { label: 'Volume',    score: volumeScore,    color: 'bg-green-500' },
    { label: 'Diversity', score: diversityScore, color: 'bg-blue-500' },
    { label: 'Longevity', score: longevityScore, color: 'bg-purple-500' },
  ]
  const tier = totalScore >= 80 ? { label: 'Diamond', color: 'text-cyan-300' }
             : totalScore >= 60 ? { label: 'Gold',    color: 'text-yellow-300' }
             : totalScore >= 40 ? { label: 'Silver',  color: 'text-slate-300' }
             :                    { label: 'Bronze',  color: 'text-orange-400' }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300">$POLY Airdrop Score</h3>
        <span className={`text-xs font-bold ${tier.color}`}>{tier.label} Tier</span>
      </div>
      <div className="flex items-end gap-2 mb-5">
        <span className="text-5xl font-black text-white">{totalScore}</span>
        <span className="text-slate-400 text-sm mb-1">/ 100</span>
      </div>
      <div className="space-y-3">
        {bars.map(b => (
          <div key={b.label}>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{b.label}</span><span>{Math.round(b.score)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800">
              <div className={`h-full rounded-full ${b.color} transition-all`} style={{ width: `${b.score}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{fmt$(rewards.total_usdc, 0)}</div>
          <div className="text-xs text-slate-400">Total Rewards</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{marketCount}</div>
          <div className="text-xs text-slate-400">Markets</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{monthsActive}mo</div>
          <div className="text-xs text-slate-400">Active</div>
        </div>
      </div>
    </div>
  )
}
