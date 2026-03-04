const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface BotStatus {
  status: string
  uptime_s: number
  quote_cycles: number
  markets_quoted: number
  dry_run: boolean
  errors: string[]
}

export interface RiskSummary {
  cash_usdc: number
  total_realized_pnl: number
  daily_pnl: number
  total_exposure: number
  trading_halted: boolean
  halt_reason: string | null
  open_positions: number
}

export interface RewardSummary {
  today_usdc: number
  week_usdc: number
  month_usdc: number
  total_usdc: number
  by_market: Record<string, number>
  last_updated: string | null
}

export interface Market {
  condition_id: string
  question: string
  yes_price: number
  no_price: number
  volume_24h: number
  incentive_size: number
  category: string
  is_extreme: boolean
  reward_score: number
}

export interface Position {
  condition_id: string
  question: string
  yes_shares: number
  no_shares: number
  yes_avg_cost: number
  no_avg_cost: number
  realized_pnl: number
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 10 } })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  status: () => fetchJSON<BotStatus>('/api/status'),
  risk: () => fetchJSON<RiskSummary>('/api/risk'),
  rewards: () => fetchJSON<RewardSummary>('/api/rewards'),
  markets: () => fetchJSON<{ markets: Market[]; count: number }>('/api/markets'),
  positions: () => fetchJSON<{ positions: Position[] }>('/api/positions'),
  stopBot: () => fetch(`${API_BASE}/api/bot/stop`, { method: 'POST' }),
  resumeBot: () => fetch(`${API_BASE}/api/bot/resume`, { method: 'POST' }),
}
