'use client'
import { useMarkets } from '@/lib/hooks'
import AirdropScore from '@/components/AirdropScore'
import OpportunitiesFeed from '@/components/OpportunitiesFeed'
import { fmt$ } from '@/lib/utils'

const FARMING_GUIDE = [
  {
    step: '1',
    title: 'Trade in Reward Markets',
    desc: 'Markets with "Rewards" enabled pay LP fees. Look for the green dot in the Live Markets table. Prioritise markets with rewardsMinSize < $50 and rewardsMaxSpread > 2¢.',
    icon: '💰',
  },
  {
    step: '2',
    title: 'Spread Across Categories',
    desc: 'Polymarket rewards breadth. Trade in politics, crypto, sports, and economics to signal genuine engagement. Accounts with 5+ categories get higher airdrop multipliers.',
    icon: '🌐',
  },
  {
    step: '3',
    title: 'Maintain Consistent Activity',
    desc: 'Daily/weekly activity beats one-time volume spikes. Set a routine: check top markets, place small trades, let LP rewards compound. Account age and consistency matter.',
    icon: '📅',
  },
  {
    step: '4',
    title: 'Focus on Mid-Price Markets',
    desc: 'Markets near 50/50 generate the most LP activity and reward payouts. Extreme markets (>95% or <5%) have low reward rates. Target 30–70% price range.',
    icon: '⚖️',
  },
  {
    step: '5',
    title: 'Use CLOB (Order Book)',
    desc: 'The CLOB (Central Limit Order Book) is the native trading mechanism. Placing limit orders and being a liquidity provider earns more than market orders. Use the Polymarket interface.',
    icon: '📊',
  },
  {
    step: '6',
    title: 'Track Your Volume',
    desc: 'Airdrop allocation likely scales with total trading volume. Community estimates suggest: Bronze <$1K, Silver $1K–$10K, Gold $10K–$100K, Diamond >$100K cumulative volume.',
    icon: '📈',
  },
]

export default function AirdropPage() {
  const { markets, loading } = useMarkets({ limit: 100, active: true })
  const rewardMarkets = markets.filter(m => m.has_rewards)
  const topRewards = [...rewardMarkets].sort((a, b) => b.reward_score - a.reward_score).slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">$POLY Airdrop Farming Guide</h1>
        <p className="text-sm text-slate-400 mt-1">
          Evidence-based strategies for maximising your Polymarket airdrop allocation
        </p>
      </div>

      {/* Score + Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AirdropScore markets={markets} loading={loading} />
        <OpportunitiesFeed />
      </div>

      {/* Live reward markets */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">
            🏆 Top Reward Markets Right Now
          </h3>
          <span className="text-xs text-slate-500">
            {rewardMarkets.length} reward markets live
          </span>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        ) : topRewards.length === 0 ? (
          <p className="text-sm text-slate-500">No reward markets found — API may be loading</p>
        ) : (
          <div className="space-y-3">
            {topRewards.map((m, i) => (
              <a
                key={m.condition_id}
                href={`https://polymarket.com/event/${m.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 hover:border-slate-600 hover:bg-slate-800/40 transition-colors group"
              >
                <span className="text-xs font-mono text-slate-600 w-5">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 line-clamp-1 group-hover:text-slate-100">{m.question}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-green-400 font-mono">{(m.yes_price * 100).toFixed(1)}¢ YES</span>
                    <span className="text-[10px] text-slate-500">Min size: ${m.rewards_min_size}</span>
                    <span className="text-[10px] text-slate-500">Max spread: {m.rewards_max_spread}¢</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono text-yellow-400">{fmt$(m.volume_24h, 0)}</p>
                  <p className="text-[10px] text-slate-500">24h vol</p>
                </div>
                <span className="text-xs text-slate-500 group-hover:text-slate-300">↗</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Farming guide */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Farming Playbook</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FARMING_GUIDE.map(item => (
            <div
              key={item.step}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-yellow-800/30 bg-yellow-900/10 p-4">
        <p className="text-xs text-yellow-600/80">
          ⚠️ <strong className="text-yellow-500">Disclaimer:</strong> Airdrop criteria are not officially published by Polymarket.
          This guide is based on community research, on-chain analysis, and historical precedent from similar protocols.
          Trading involves risk. This is not financial advice.
        </p>
      </div>
    </div>
  )
}
