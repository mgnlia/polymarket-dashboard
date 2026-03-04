# Polymarket MM Dashboard

Real-time dashboard for monitoring your Polymarket market-maker bot — positions, rewards, P&L, and $POLY airdrop score.

## Stack

- **Next.js 14** (App Router, server components)
- **Tailwind CSS** — dark theme
- **Recharts** — area + pie charts
- **lucide-react** — icons

## Features

| Section | Description |
|---------|-------------|
| KPI Row | Portfolio USDC, daily/total P&L, today/total rewards, uptime |
| Reward Chart | 14-day area chart of rewards + P&L |
| $POLY Airdrop Score | Volume/diversity/longevity tier estimator |
| Markets Table | Active markets with YES/NO prices, volume, incentive, reward score |
| Reward Breakdown | Donut chart of rewards by market |
| Positions Table | Open positions with avg cost and realized P&L |
| Bot Status | Error log, risk summary, halt status |

## Setup

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Bot FastAPI base URL | `http://localhost:8000` |

When `NEXT_PUBLIC_API_URL` is not set or the bot is offline, the dashboard shows **demo mode** with mock data.

## Bot API Endpoints

The dashboard connects to these endpoints from `mgnlia/polymarket-mm-bot`:

- `GET /api/status` — bot status, uptime, cycles
- `GET /api/risk` — risk summary, P&L, exposure
- `GET /api/rewards` — daily/weekly/monthly rewards
- `GET /api/markets` — active markets being quoted
- `GET /api/positions` — current open positions

## Deploy

Deployed on Vercel. Set `NEXT_PUBLIC_API_URL` in Vercel environment variables once the bot backend is live.
