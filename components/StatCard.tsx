'use client'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  accent?: string
  className?: string
}

export default function StatCard({ label, value, sub, icon, trend, accent, className }: StatCardProps) {
  const trendColor =
    trend === 'up'   ? 'text-green-400' :
    trend === 'down' ? 'text-red-400' :
                       'text-gray-400'

  return (
    <div className={cn(
      'rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col gap-2 backdrop-blur',
      className,
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <div className={cn('text-2xl font-bold tracking-tight', accent ?? 'text-white')}>
        {value}
      </div>
      {sub && (
        <div className={cn('text-xs', trendColor)}>{sub}</div>
      )}
    </div>
  )
}
