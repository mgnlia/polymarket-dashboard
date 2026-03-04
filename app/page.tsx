'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { api, MOCK_STATUS, MOCK_RISK, MOCK_REWARDS, MOCK_MARKETS, MOCK_POSITIONS, type BotStatus, type RiskSummary, type RewardSummary, type Market, type Position } from '../lib/api'
import { fmt$, fmtUptime } from '../lib/utils'
import StatCard from '../components/StatCard'
import BotStatusBadge from '../components/BotStatusBadge'
import RewardChart from '../components/RewardChart'
import MarketsTable from '../components/MarketsTable'
import PositionsTable from '../components/PositionsTable'
import RewardBreakdown from '../components/RewardBreakdown'

interface DashData { status: BotStatus; risk: RiskSummary; rewards: RewardSummary; markets: Market[]; positions: Position[]; live: boolean }
const MOCK_DATA: DashData = { status: MOCK_STATUS, risk: MOCK_RISK, rewards: MOCK_REWARDS, markets: MOCK_MARKETS, positions: MOCK_POSITIONS, live: false }

export default function DashboardPage() {
  const [data, setData] = useState<DashData>(MOCK_DATA)
  const refresh = useCallback(async () => {
    try {
      const [status, risk, rewards, marketsResp, positionsResp] = await Promise.all([
        api.status(), api.risk(), api.rewards(), api.markets(), api.positions()
      ])
      setData({ status, risk, rewards, markets: marketsResp.markets, positions: positionsResp.positions, live: true })
    } catch { setData(MOCK_DATA) }
  }, [])
  useEffect(() => { refresh(); const id = setInterval(refresh, 15000); return () => clearInterval(id) }, [refresh])
  const { status, risk, rewards, markets, positions, live } = data
  const pnlPositive = risk.daily_pnl >= 0
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-xs font-black text-white">P</div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Polymarket MM</h1>
              <p className="text-xs text-slate-400 mt-0.5">Market Maker Dashboard</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Overview</Link>
            <Link href="/markets" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold">Live Markets →</Link>
            <Link href="/airdrop" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Airdrop</Link>
            {!live && <span className="px-2 py-1 rounded text-xs bg-slate-800 text-slate-400 border border-slate-700">Demo Mode</span>}
            <BotStatusBadge status={status.status} halted={risk.trading_halted} dryRun={status.dry_run} />
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Live Markets CTA banner */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-300">🔴 Live Market Data Available</p>
            <p className="text-xs text-slate-400 mt-0.5">Real Polymarket markets, prices, and airdrop opportunities — updated every 30s</p>
          </div>
          <Link
            href="/markets"
            className="shrink-0 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold transition-colors"
          >
            View Live Markets →
          </Link>
        </div>

        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Portfolio" value={fmt$(risk.cash_usdc)} sub="Available USDC" trend="neutral" />
          <StatCard label="Daily P&L" value={(pnlPositive?'+':'')+fmt$(risk.daily_pnl)} sub={pnlPositive?'▲ today':'▼ today'} trend={pnlPositive?'up':'down'} accent={pnlPositive?'text-green-400':'text-red-400'} />
          <StatCard label="Total P&L" value={(risk.total_realized_pnl>=0?'+':'')+fmt$(risk.total_realized_pnl)} trend={risk.total_realized_pnl>=0?'up':'down'} accent={risk.total_realized_pnl>=0?'text-green-400':'text-red-400'} />
          <StatCard label="Today Rewards" value={fmt$(rewards.today_usdc)} sub={`Week: ${fmt$(rewards.week_usdc)}`} trend="up" accent="text-green-400" />
          <StatCard label="Total Rewards" value={fmt$(rewards.total_usdc)} sub={`Month: ${fmt$(rewards.month_usdc)}`} trend="up" accent="text-green-400" />
          <StatCard label="Uptime" value={fmtUptime(status.uptime_s)} sub={`${status.quote_cycles} cycles`} trend="neutral" />
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><RewardChart /></div>
          <RewardBreakdown rewards={rewards} />
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><MarketsTable markets={markets} /></div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Risk Summary</h3>
            <div className="space-y-2 text-sm">
              {([
                ['Open Positions', risk.open_positions.toString()],
                ['Total Exposure', fmt$(risk.total_exposure)],
                ['Trading Status', risk.trading_halted ? '🔴 HALTED' : '🟢 Active'],
                ['Halt Reason', risk.halt_reason ?? '—'],
                ['Quote Cycles', status.quote_cycles.toString()],
                ['Markets Quoted', status.markets_quoted.toString()],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-mono text-slate-200">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section><PositionsTable positions={positions} /></section>
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Bot Error Log</h3>
            {status.errors.length === 0
              ? <p className="text-sm text-green-400 font-mono">✓ No errors</p>
              : <ul className="space-y-1">{status.errors.slice(-5).map((e,i) => (
                  <li key={i} className="text-xs font-mono text-red-400 bg-red-900/20 px-3 py-1.5 rounded">{e}</li>
                ))}</ul>
            }
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/markets" className="block text-sm text-blue-400 hover:text-blue-300">→ Live Markets (real Polymarket data)</Link>
              <Link href="/airdrop" className="block text-sm text-blue-400 hover:text-blue-300">→ Airdrop Score Calculator</Link>
              <a href="https://polymarket.com" target="_blank" rel="noreferrer" className="block text-sm text-slate-400 hover:text-slate-300">→ Polymarket.com ↗</a>
            </div>
          </div>
        </section>
        <footer className="text-center text-xs text-slate-600 pb-4">
          Polymarket MM Dashboard · Auto-refreshes every 15s ·{' '}
          {live ? <span className="text-green-600">Live data</span> : <span className="text-yellow-600">Demo mode — connect backend for live bot data</span>}
        </footer>
      </main>
    </div>
  )
}
