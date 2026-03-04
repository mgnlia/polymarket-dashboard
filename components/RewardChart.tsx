'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { mockRewardHistory } from '@/lib/api'
import { useMemo } from 'react'

interface Point { date: string; rewards: number; pnl: number }

export default function RewardChart({ data }: { data?: Point[] }) {
  const chart = useMemo(() => data ?? mockRewardHistory(), [data])
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Rewards &amp; P&amp;L — Last 14 Days</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chart} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(v: number, n: string) => [`$${v.toFixed(2)}`, n]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <Area type="monotone" dataKey="rewards" name="Rewards (USDC)" stroke="#22c55e" fill="url(#gR)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="pnl"     name="P&L (USDC)"     stroke="#60a5fa" fill="url(#gP)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
