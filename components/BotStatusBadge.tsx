'use client'
import { cn } from '@/lib/utils'

interface Props { status: string; halted: boolean; dryRun: boolean }

export default function BotStatusBadge({ status, halted, dryRun }: Props) {
  const running = status === 'running' && !halted
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {running && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
        <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5',
          halted ? 'bg-red-500' : running ? 'bg-green-400' : 'bg-yellow-400')} />
      </span>
      <span className={cn('text-sm font-semibold',
        halted ? 'text-red-400' : running ? 'text-green-400' : 'text-yellow-400')}>
        {halted ? 'HALTED' : status.toUpperCase()}
      </span>
      {dryRun && (
        <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-300 font-mono border border-yellow-500/30">
          DRY-RUN
        </span>
      )}
    </div>
  )
}
