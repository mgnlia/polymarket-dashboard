const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

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

// Note: no `next: { revalidate }` — incompatible with static export builds
async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  return res.json()
}

export const api = {
  status:    () => fetchJSON<BotStatus>('/api/status'),
  risk:      () => fetchJSON<RiskSummary>('/api/risk'),
  rewards:   () => fetchJSON<RewardSummary>('/api/rewards'),
  markets:   () => fetchJSON<{ markets: Market[]; count: number }>('/api/markets'),
  positions: () => fetchJSON<{ positions: Position[] }>('/api/positions'),
}

// ── Mock / demo data ───────────────────────────────────────────────────────

export const MOCK_STATUS: BotStatus = {
  status: 'running', uptime_s: 86400, quote_cycles: 1440,
  markets_quoted: 5, dry_run: true, errors: [],
}

export const MOCK_RISK: RiskSummary = {
  cash_usdc: 423.50, total_realized_pnl: 12.80, daily_pnl: 3.20,
  total_exposure: 76.50, trading_halted: false, halt_reason: null, open_positions: 5,
}

export const MOCK_REWARDS: RewardSummary = {
  today_usdc: 4.20, week_usdc: 28.70, month_usdc: 112.40, total_usdc: 312.60,
  by_market: {
    'BTC $100k?': 1.40, 'US Election 2026': 0.90,
    'Fed rate cut Q3?': 0.70, 'ETH ETF?': 0.60, 'Other': 0.60,
  },
  last_updated: new Date().toISOString(),
}

export const MOCK_MARKETS: Market[] = [
  { condition_id: 'c1', question: 'Will BTC hit $100k by end of 2026?', yes_price: 0.62, no_price: 0.38, volume_24h: 84200,  incentive_size: 250, category: 'crypto',    is_extreme: false, reward_score: 0.81 },
  { condition_id: 'c2', question: 'US midterms — Dems win House?',       yes_price: 0.44, no_price: 0.56, volume_24h: 210000, incentive_size: 500, category: 'politics',  is_extreme: false, reward_score: 0.76 },
  { condition_id: 'c3', question: 'Fed rate cut before Sep 2026?',       yes_price: 0.71, no_price: 0.29, volume_24h: 54000,  incentive_size: 180, category: 'economics', is_extreme: false, reward_score: 0.68 },
  { condition_id: 'c4', question: 'ETH spot ETF approved by SEC?',       yes_price: 0.88, no_price: 0.12, volume_24h: 32000,  incentive_size: 120, category: 'crypto',    is_extreme: true,  reward_score: 0.54 },
  { condition_id: 'c5', question: 'SpaceX reaches Mars by 2030?',        yes_price: 0.08, no_price: 0.92, volume_24h: 18000,  incentive_size: 80,  category: 'science',   is_extreme: true,  reward_score: 0.41 },
]

export const MOCK_POSITIONS: Position[] = [
  { condition_id: 'c1', question: 'Will BTC hit $100k by end of 2026?', yes_shares: 12, no_shares: 10, yes_avg_cost: 0.61, no_avg_cost: 0.38, realized_pnl: 2.40 },
  { condition_id: 'c2', question: 'US midterms — Dems win House?',       yes_shares: 8,  no_shares: 14, yes_avg_cost: 0.44, no_avg_cost: 0.55, realized_pnl: 1.80 },
  { condition_id: 'c3', question: 'Fed rate cut before Sep 2026?',       yes_shares: 6,  no_shares: 6,  yes_avg_cost: 0.70, no_avg_cost: 0.29, realized_pnl: 0.60 },
]

export function mockRewardHistory() {
  // deterministic seed so SSR and client match
  const base = [3.1,4.2,2.8,5.1,3.9,4.7,3.3,5.8,4.1,3.6,4.9,5.2,4.4,4.2]
  const pnl  = [0.8,1.2,-0.4,1.8,0.6,2.1,0.3,2.4,1.1,-0.2,1.6,1.9,1.3,1.2]
  const today = new Date('2026-07-01')
  return base.map((rewards, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (13 - i))
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rewards,
      pnl: pnl[i],
    }
  })
}
