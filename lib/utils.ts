import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fmt$ = (n: number, d = 2) => `$${n.toFixed(d)}`
export const fmtPct = (n: number, d = 1) => `${(n * 100).toFixed(d)}%`

export function fmtUptime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${m}m`
}

export function categoryBadge(cat: string): string {
  const map: Record<string, string> = {
    crypto:    'bg-orange-500/20 text-orange-300 border-orange-500/30',
    politics:  'bg-blue-500/20 text-blue-300 border-blue-500/30',
    economics: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    science:   'bg-teal-500/20 text-teal-300 border-teal-500/30',
    sports:    'bg-red-500/20 text-red-300 border-red-500/30',
  }
  return map[cat] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30'
}

export function scoreColor(score: number): string {
  if (score >= 0.7) return 'text-green-400'
  if (score >= 0.4) return 'text-yellow-400'
  return 'text-red-400'
}
