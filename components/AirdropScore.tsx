'use client'
import { type LiveMarket } from '@/lib/gamma'
import { fmt$ } from '@/lib/utils'

interface Props {
  markets: LiveMarket[]
  loading: boolean
}

interface ScoreCategory {
  label: string
  score: number
  max: number
  description: string
  color: string
}

function computeAirdropScore(markets: LiveMarket[]): {
  total: number
  categories: ScoreCategory[]
  tier: string
  tierColor: string
  tierEmoji: string
} {
  if (markets.length === 0) {
    return {
      total: 0,
      categories: [],
      tier: 'No Data',
      tierColor: 'text-slate-500',
      tierEmoji: '❓',
    }
  }

  // 1. Reward Markets (30 pts) — how many reward markets are active
  const rewardMarkets = markets.filter(m => m.has_rewards).length
  const rewardScore   = Math.min(30, Math.round((rewardMarkets / Math.max(markets.length, 1)) * 30 * 3))

  // 2. Market Diversity (25 pts) — unique categories engaged
  const uniqueCats   = new Set(markets.map(m => m.category).filter(Boolean)).size
  const diversityScore = Math.min(25, Math.round((uniqueCats / 8) * 25))

  // 3. Liquidity Depth (25 pts) — total liquidity available
  const totalLiquidity = markets.reduce((s, m) => s + m.liquidity, 0)
  const liquidityScore = Math.min(25, Math.round((totalLiquidity / 10_000_000) * 25))

  // 4. Volume Activity (20 pts) — 24h volume signals active farming
  const totalVol24h  = markets.reduce((s, m) => s + m.volume_24h, 0)
  const volumeScore  = Math.min(20, Math.round((totalVol24h / 50_000_000) * 20))

  const total = rewardScore + diversityScore + liquidityScore + volumeScore

  let tier = 'Bronze', tierColor = 'text-orange-400', tierEmoji = '🥉'
  if (total >= 85) { tier = 'Diamond'; tierColor = 'text-cyan-300'; tierEmoji = '💎' }
  else if (total >= 70) { tier = 'Platinum'; tierColor = 'text-slate-300'; tierEmoji = '🏆' }
  else if (total >= 55) { tier = 'Gold'; tierColor = 'text-yellow-400'; tierEmoji = '🥇' }
  else if (total >= 35) { tier = 'Silver'; tierColor = 'text-slate-400'; tierEmoji = '🥈' }

  return {
    total,
    tier,
    tierColor,
    tierEmoji,
    categories: [
      {
        label: 'Reward Markets',
        score: rewardScore,
        max: 30,
        description: `${rewardMarkets} active reward markets tracked`,
        color: 'bg-yellow-400',
      },
      {
        label: 'Market Diversity',
        score: diversityScore,
        max: 25,
        description: `${uniqueCats} categories — breadth signals genuine engagement`,
        color: 'bg-blue-400',
      },
      {
        label: 'Liquidity Depth',
        score: liquidityScore,
        max: 25,
        description: `${fmt$(markets.reduce((s, m) => s + m.liquidity, 0), 1)} total liquidity in tracked markets`,
        color: 'bg-green-400',
      },
      {
        label: 'Volume Activity',
        score: volumeScore,
        max: 20,
        description: `${fmt$(markets.reduce((s, m) => s + m.volume_24h, 0), 1)} 24h volume across tracked markets`,
        color: 'bg-purple-400',
      },
    ],
  }
}

export default function AirdropScore({ markets, loading }: Props) {
  const { total, categories, tier, tierColor, tierEmoji } = computeAirdropScore(markets)

  const topOpps = markets
    .filter(m => m.volume_24h > 5_000 && m.spread > 0)
    .sort((a, b) => (b.volume_24h * b.spread) - (a.volume_24h * a.spread))
    .slice(0, 5)

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">$POLY Airdrop Score</h2>
        <span className="text-xs text-slate-500">Live market activity</span>
      </div>

      {/* Score ring */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#1e293b" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="32"
              fill="none"
              stroke={loading ? '#334155' : total >= 70 ? '#22d3ee' : total >= 55 ? '#facc15' : total >= 35 ? '#94a3b8' : '#f97316'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - total / 100)}`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-100 font-mono">{loading ? '…' : total}</span>
            <span className="text-[10px] text-slate-500">/ 100</span>
          </div>
        </div>
        <div>
          <p className={`text-lg font-bold ${tierColor}`}>{tierEmoji} {tier} Tier</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-snug">
            {tier === 'Bronze' && 'Casual user — small allocation possible'}
            {tier === 'Silver' && 'Active trader — solid airdrop chance'}
            {tier === 'Gold'   && 'Power user — strong allocation expected'}
            {tier === 'Platinum' && 'Top-tier farmer — high allocation likely'}
            {tier === 'Diamond' && 'Elite farmer — maximum allocation'}
            {tier === 'No Data' && 'Loading market data…'}
          </p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-2.5">
        {categories.map(cat => (
          <div key={cat.label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">{cat.label}</span>
              <span className="text-xs font-mono text-slate-300">{cat.score} / {cat.max}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${cat.color} rounded-full transition-all duration-700`}
                style={{ width: `${(cat.score / cat.max) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-0.5">{cat.description}</p>
          </div>
        ))}
      </div>

      {/* Top opportunities */}
      {topOpps.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-400 mb-2">🎯 Top Opportunities</p>
          <p className="text-[10px] text-slate-600 mb-2">Ranked by volume × spread</p>
          <div className="space-y-1.5">
            {topOpps.map(m => (
              <a
                key={m.condition_id}
                href={`https://polymarket.com/event/${m.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors group"
              >
                <span className="text-[11px] text-slate-300 group-hover:text-blue-400 transition-colors line-clamp-1 flex-1">
                  {m.question}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] font-mono text-green-400">{Math.round(m.yes_price * 100)}¢</span>
                  <span className="text-[10px] font-mono text-slate-500">{(m.spread * 100).toFixed(1)}%</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
