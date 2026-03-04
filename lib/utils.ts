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

/** Format a date string to "MMM DD" */
export function fmtDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}

/** Time since last update */
export function timeSince(d: Date | null): string {
  if (!d) return '—'
  const secs = Math.floor((Date.now() - d.getTime()) / 1000)
  if (secs < 60)  return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

/** Clamp a number between min and max */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
