'use client'
import { cn } from '@/lib/utils'
import type { LiveMarket } from '@/lib/gamma'

interface Props {
  markets: LiveMarket[]
  loading?: boolean
}

// ── Airdrop tier thresholds (based on Polymarket $POLY research) ──────────
// Polymarket rewards: volume, unique markets, consistency, LP provision
// Tiers based on community research and official hints

interface Tier {
  name: string
  emoji: string
  minScore: number
  color: string
  border: string
  description: string
}

const TIERS: Tier[] = [
  {
    name: 'Diamond',
    emoji: '💎',
    minScore: 85,
    color: 'text-cyan-300',
    border: 'border-cyan-500/40',
    description: 'Top-tier farmer — maximum airdrop allocation',
  },
  {
    name: 'Gold',
    emoji: '🥇',
    minScore: 60,
    color: 'text-yellow-300',
    border: 'border-yellow-500/40',
    description: 'Active power user — strong airdrop likely',
  },
  {
    name: 'Silver',
    emoji: '🥈',
    minScore: 35,
    color: 'text-slate-300',
    border: 'border-slate-500/40',
    description: 'Regular trader — moderate airdrop expected',
  },
  {
    name: 'Bronze',
    emoji: '🥉',
    minScore: 0,
    color: 'text-orange-400',
    border: 'border-orange-700/40',
    description: 'Casual user — small allocation possible',
  },
]

function getTier(score: number): Tier {
  return TIERS.find(t => score >= t.minScore) ?? TIERS[TIERS.length - 1]
}

// ── Score sub-metrics derived from market data ────────────────────────────

interface SubScore {
  label: string
  value: number
  max: number
  tip: string
}

function computeSubScores(markets: LiveMarket[]): SubScore[] {
  const rewardMarkets  = markets.filter(m => m.has_rewards)
  const totalLiquidity = markets.reduce((s, m) => s + m.liquidity, 0)
  const totalVolume    = markets.reduce((s, m) => s + m.volume_24h, 0)
  const categories     = new Set(markets.map(m => m.category)).size
  const avgScore       = markets.length
    ? markets.reduce((s, m) => s + m.reward_score, 0) / markets.length
    : 0

  return [
    {
      label: 'Reward Markets',
      value: Math.min(30, rewardMarkets.length * 2),
      max: 30,
      tip: `${rewardMarkets.length} active reward markets tracked`,
    },
    {
      label: 'Market Diversity',
      value: Math.min(25, categories * 5),
      max: 25,
      tip: `${categories} categories — breadth signals genuine engagement`,
    },
    {
      label: 'Liquidity Depth',
      value: Math.min(25, Math.round((totalLiquidity / 2_000_000) * 25)),
      max: 25,
      tip: `$${(totalLiquidity / 1e6).toFixed(1)}M total liquidity in tracked markets`,
    },
    {
      label: 'Volume Activity',
      value: Math.min(20, Math.round((totalVolume / 5_000_000) * 20)),
      max: 20,
      tip: `$${(totalVolume / 1e6).toFixed(1)}M 24h volume across tracked markets`,
    },
  ]
}

// ── Farming tips based on market data ────────────────────────────────────

function FarmingTips({ markets }: { markets: LiveMarket[] }) {
  const topReward = markets
    .filter(m => m.has_rewards)
    .sort((a, b) => b.reward_score - a.reward_score)
    .slice(0, 3)

  const tips = [
    '✅ Trade in markets with rewards enabled (green dot)',
    '✅ Keep positions open — LP rewards accrue over time',
    '✅ Spread trades across multiple categories',
    '✅ Focus on markets near 50/50 (better reward rates)',
    '✅ Larger positions = more LP rewards earned',
  ]

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Farming Strategy</p>
      {tips.map((tip, i) => (
        <p key={i} className="text-xs text-slate-400">{tip}</p>
      ))}
      {topReward.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Top Reward Markets Right Now
          </p>
          {topReward.map(m => (
            <a
              key={m.condition_id}
              href={`https://polymarket.com/event/${m.slug}`}
              target="_blank"
              rel="noreferrer"
              className="block text-xs text-blue-400 hover:text-blue-300 truncate"
            >
              → {m.question.slice(0, 60)}{m.question.length > 60 ? '…' : ''}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

export default function AirdropScore({ markets, loading }: Props) {
  const subScores  = computeSubScores(markets)
  const totalScore = subScores.reduce((s, m) => s + m.value, 0)
  const maxScore   = subScores.reduce((s, m) => s + m.max, 0)
  const pct        = Math.round((totalScore / maxScore) * 100)
  const tier       = getTier(pct)

  return (
    <div className={cn(
      'rounded-xl border bg-slate-900/60 p-5 backdrop-blur-sm space-y-4',
      tier.border,
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-300">$POLY Airdrop Score</h3>
          <p className="text-xs text-slate-500 mt-0.5">Based on live market activity</p>
        </div>
        <div className="text-right">
          <p className={cn('text-3xl font-bold font-mono', tier.color)}>
            {loading ? '—' : pct}
          </p>
          <p className="text-xs text-slate-500">/ 100</p>
        </div>
      </div>

      {/* Tier badge */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border',
        tier.border, 'bg-slate-800/40',
      )}>
        <span className="text-xl">{tier.emoji}</span>
        <div>
          <p className={cn('text-sm font-semibold', tier.color)}>{tier.name} Tier</p>
          <p className="text-xs text-slate-500">{tier.description}</p>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="space-y-3">
        {subScores.map(sub => (
          <div key={sub.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">{sub.label}</span>
              <span className="text-xs font-mono text-slate-300">
                {loading ? '—' : sub.value}/{sub.max}
              </span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                style={{ width: loading ? '0%' : `${(sub.value / sub.max) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-0.5">{sub.tip}</p>
          </div>
        ))}
      </div>

      {/* Farming tips */}
      {!loading && <FarmingTips markets={markets} />}
    </div>
  )
}
