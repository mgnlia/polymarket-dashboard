'use client'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface Props {
  label: string
  value: string
  sub?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  valueClass?: string
}

export default function StatCard({ label, value, sub, icon, trend, valueClass }: Props) {
  const subColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col gap-2 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <div className={cn('text-2xl font-bold tracking-tight', valueClass ?? 'text-white')}>{value}</div>
      {sub && <div className={cn('text-xs', subColor)}>{sub}</div>}
    </div>
  )
}
