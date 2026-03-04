import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind class merger — used by UI components */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Format a dollar amount with optional decimal places */
export function fmt$(n: number, decimals = 2): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(decimals)}`
}

/** Format a percentage (0.62 → "62.0%") */
export function fmtPct(n: number, decimals = 1): string {
  return `${(n * 100).toFixed(decimals)}%`
}

/** Format a date string to "MMM DD 'YY" */
export function fmtDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}

/** Format uptime seconds to human-readable string */
export function fmtUptime(secs: number): string {
  if (secs < 60)   return `${secs}s`
  if (secs < 3600) return `${Math.floor(secs / 60)}m`
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/** Time since last update */
export function timeSince(d: Date | null): string {
  if (!d) return '—'
  const secs = Math.floor((Date.now() - d.getTime()) / 1000)
  if (secs < 60)   return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

/** Clamp a number between min and max */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

/** Tailwind classes for market category badges */
export function categoryBadge(category: string): string {
  const map: Record<string, string> = {
    crypto:    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    politics:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
    economics: 'bg-green-500/20 text-green-300 border-green-500/30',
    sports:    'bg-orange-500/20 text-orange-300 border-orange-500/30',
    science:   'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    general:   'bg-slate-500/20 text-slate-300 border-slate-500/30',
  }
  return map[category] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
}

/** Tailwind text-color class for a reward score 0–1 */
export function scoreColor(score: number): string {
  if (score >= 0.75) return 'text-green-400'
  if (score >= 0.50) return 'text-yellow-400'
  if (score >= 0.25) return 'text-orange-400'
  return 'text-red-400'
}
