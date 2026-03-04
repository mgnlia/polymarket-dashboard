'use client'
import { useMarkets } from '@/lib/hooks'
import LiveMarketsTable from '@/components/LiveMarketsTable'
import AirdropScore from '@/components/AirdropScore'
import OpportunitiesFeed from '@/components/OpportunitiesFeed'
import { fmt$ } from '@/lib/utils'

function StatCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: string
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${accent ?? 'text-slate-200'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function MarketsPage() {
  const hook = useMarkets({ limit: 100, active: true })
  const { markets, loading } = hook

  // Aggregate stats from live data
  const totalVol24h    = markets.reduce((s, m) => s + m.volume_24h, 0)
  const totalLiquidity = markets.reduce((s, m) => s + m.liquidity, 0)
  const rewardCount    = markets.filter(m => m.has_rewards).length
  const avgSpread      = markets.length
    ? markets.reduce((s, m) => s + m.spread, 0) / markets.length
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Live Markets</h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time data from Polymarket Gamma API · auto-refreshes every 30s
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="24h Volume"
          value={loading ? '…' : fmt$(totalVol24h, 0)}
          sub="across tracked markets"
          accent="text-green-400"
        />
        <StatCard
          label="Total Liquidity"
          value={loading ? '…' : fmt$(totalLiquidity, 0)}
          sub="available in orderbooks"
          accent="text-blue-400"
        />
        <StatCard
          label="Reward Markets"
          value={loading ? '…' : String(rewardCount)}
          sub={`of ${markets.length} active markets`}
          accent="text-yellow-400"
        />
        <StatCard
          label="Avg Spread"
          value={loading ? '…' : `${(avgSpread * 100).toFixed(2)}%`}
          sub="market-wide average"
          accent="text-purple-400"
        />
      </div>

      {/* Main layout: table + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Markets table */}
        <LiveMarketsTable hook={hook} />

        {/* Sidebar */}
        <div className="space-y-6">
          <AirdropScore markets={markets} loading={loading} />
          <OpportunitiesFeed />
        </div>
      </div>
    </div>
  )
}
