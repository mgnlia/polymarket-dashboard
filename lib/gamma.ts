// Polymarket Gamma API — public, no auth required
// https://gamma-api.polymarket.com

const GAMMA_BASE = 'https://gamma-api.polymarket.com'

// ── Raw API types ─────────────────────────────────────────────────────────

export interface GammaMarket {
  id: string
  conditionId: string
  question: string
  slug: string
  image: string
  icon: string
  description: string
  endDate: string
  endDateIso: string
  outcomes: string          // JSON string: ["Yes","No"]
  outcomePrices: string     // JSON string: ["0.62","0.38"]
  volume: string
  volumeNum: number
  volume24hr: number
  volume1wk: number
  volume1mo: number
  liquidityNum: number
  liquidityClob: number
  spread: number
  bestBid: number
  bestAsk: number
  lastTradePrice: number
  active: boolean
  closed: boolean
  archived: boolean
  restricted: boolean
  rewardsMinSize: number
  rewardsMaxSpread: number
  acceptingOrders: boolean
  clobTokenIds: string      // JSON string: ["tokenId0","tokenId1"]
  events: GammaEvent[]
  competitive: number
  negRisk: boolean
  enableOrderBook: boolean
  oneWeekPriceChange: number
}

export interface GammaEvent {
  id: string
  title: string
  slug: string
  category: string
  image: string
  icon: string
  volume24hr: number
  volume: number
  liquidity: number
  active: boolean
  closed: boolean
  endDate: string
  commentCount: number
}

// ── Normalised app type ───────────────────────────────────────────────────

export interface LiveMarket {
  condition_id: string
  question: string
  slug: string
  image: string
  yes_price: number
  no_price: number
  volume_24h: number
  volume_total: number
  liquidity: number
  spread: number
  best_bid: number
  best_ask: number
  last_price: number
  end_date: string
  category: string
  event_title: string
  has_rewards: boolean
  rewards_min_size: number
  rewards_max_spread: number
  reward_score: number       // computed
  is_extreme: boolean        // price < 0.05 or > 0.95
  clob_token_yes: string
  clob_token_no: string
  price_change_1w: number
  accepting_orders: boolean
  competitive: number
}

// ── Helpers ───────────────────────────────────────────────────────────────

function parseJSON<T>(s: string, fallback: T): T {
  try { return JSON.parse(s) } catch { return fallback }
}

/** Compute a reward farming score (0–1):
 *  - Rewards enabled  → big boost
 *  - High liquidity   → better fills
 *  - Mid price (near 0.5) → more two-sided action
 *  - High 24h volume  → active market
 */
function computeRewardScore(m: GammaMarket, yesPrice: number): number {
  const hasRewards = (m.rewardsMinSize ?? 0) > 0 && (m.rewardsMaxSpread ?? 0) > 0
  const rewardBoost    = hasRewards ? 0.40 : 0
  const liquidityScore = Math.min(0.25, ((m.liquidityNum ?? 0) / 500_000) * 0.25)
  const midnessScore   = 0.20 * (1 - Math.abs(yesPrice - 0.5) * 2)
  const volumeScore    = Math.min(0.15, ((m.volume24hr ?? 0) / 5_000_000) * 0.15)
  return Math.min(1, rewardBoost + liquidityScore + midnessScore + volumeScore)
}

export function normaliseMarket(m: GammaMarket): LiveMarket {
  const prices    = parseJSON<string[]>(m.outcomePrices, ['0.5', '0.5'])
  const tokenIds  = parseJSON<string[]>(m.clobTokenIds, ['', ''])
  const yesPrice  = parseFloat(prices[0]) || 0.5
  const noPrice   = parseFloat(prices[1]) || 0.5
  const category  = m.events?.[0]?.category ?? 'general'
  const isExtreme = yesPrice < 0.05 || yesPrice > 0.95

  return {
    condition_id:       m.conditionId,
    question:           m.question,
    slug:               m.slug,
    image:              m.icon || m.image,
    yes_price:          yesPrice,
    no_price:           noPrice,
    volume_24h:         m.volume24hr ?? 0,
    volume_total:       m.volumeNum ?? 0,
    liquidity:          m.liquidityNum ?? 0,
    spread:             m.spread ?? 0,
    best_bid:           m.bestBid ?? 0,
    best_ask:           m.bestAsk ?? 1,
    last_price:         m.lastTradePrice ?? yesPrice,
    end_date:           m.endDateIso ?? m.endDate?.slice(0, 10) ?? '',
    category:           category,
    event_title:        m.events?.[0]?.title ?? m.question,
    has_rewards:        (m.rewardsMinSize ?? 0) > 0,
    rewards_min_size:   m.rewardsMinSize ?? 0,
    rewards_max_spread: m.rewardsMaxSpread ?? 0,
    reward_score:       computeRewardScore(m, yesPrice),
    is_extreme:         isExtreme,
    clob_token_yes:     tokenIds[0] ?? '',
    clob_token_no:      tokenIds[1] ?? '',
    price_change_1w:    m.oneWeekPriceChange ?? 0,
    accepting_orders:   m.acceptingOrders ?? false,
    competitive:        m.competitive ?? 0,
  }
}

// ── Fetch functions (client-side, CORS allowed) ───────────────────────────

export interface FetchMarketsOptions {
  limit?: number
  offset?: number
  active?: boolean
  closed?: boolean
  order?: 'volume24hr' | 'liquidityNum' | 'volumeNum' | 'endDate' | 'spread'
  ascending?: boolean
  category?: string
  rewardsOnly?: boolean
}

export async function fetchLiveMarkets(opts: FetchMarketsOptions = {}): Promise<LiveMarket[]> {
  const params = new URLSearchParams()
  params.set('limit',     String(opts.limit    ?? 50))
  params.set('offset',    String(opts.offset   ?? 0))
  params.set('active',    String(opts.active   ?? true))
  params.set('closed',    String(opts.closed   ?? false))
  params.set('order',     opts.order           ?? 'volume24hr')
  params.set('ascending', String(opts.ascending ?? false))

  const url = `${GAMMA_BASE}/markets?${params}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Gamma API error: ${res.status}`)
  const raw: GammaMarket[] = await res.json()

  // Only skip truly archived markets — keep restricted ones (most real markets are restricted)
  return raw
    .filter(m => !m.archived)
    .map(normaliseMarket)
}

export async function fetchTopRewardMarkets(limit = 20): Promise<LiveMarket[]> {
  const markets = await fetchLiveMarkets({ limit: 100, active: true })
  return markets
    .filter(m => m.has_rewards && m.accepting_orders)
    .sort((a, b) => b.reward_score - a.reward_score)
    .slice(0, limit)
}

export async function fetchTopOpportunities(limit = 10): Promise<LiveMarket[]> {
  const markets = await fetchLiveMarkets({ limit: 100, active: true, order: 'volume24hr' })
  // Top opportunities = high volume + wide spread (market maker profit opportunity)
  return markets
    .filter(m => m.volume_24h > 1_000 && m.spread > 0)
    .sort((a, b) => (b.volume_24h * b.spread) - (a.volume_24h * a.spread))
    .slice(0, limit)
}

// Derive categories from a list of markets
export function extractCategories(markets: LiveMarket[]): string[] {
  const cats = new Set(markets.map(m => m.category).filter(Boolean))
  return ['all', ...Array.from(cats).sort()]
}
