'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { RewardSummary } from '@/lib/api'

const COLORS = ['#22c55e', '#60a5fa', '#f59e0b', '#a78bfa', '#f87171', '#34d399']

export default function RewardBreakdown({ rewards }: { rewards: RewardSummary }) {
  const data = Object.entries(rewards.by_market).map(([name, value]) => ({ name, value }))

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Rewards by Market (Today)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
               paddingAngle={3} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
            formatter={(v: number) => [`$${v.toFixed(2)}`, 'Reward']}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
