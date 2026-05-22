# AlphaSynth Project Report
## v2.0 — Live AI Alpha Discovery Engine
### Generated: May 22, 2026

---

## 1. Project Overview

**AlphaSynth** is an **On-Chain Alpha Discovery Engine** — a multi-agent AI system that detects early crypto opportunities by cross-referencing on-chain events, social signals, GitHub activity, and DeFi metrics before the crowd arrives.

### Mission Statement
**"Solve scarce human attention in a world of thousands of daily crypto signals."**

### Core Problem Solved
- Thousands of crypto signals emerge daily (new contracts, whale movements, protocol launches)
- Human attention is finite — signals get missed
- By the time alpha reaches public Telegram/Twitter, it's already crowded
- **AlphaSynth detects patterns early** through convergent signals across multiple sources

---

## 2. Architecture & Agent System

### Multi-Agent Pipeline (4 Agents)

```
[ Signals ] → [ Scout ] → [ Analyst ] → [ Risk ] → [ Synthesize ]
                                                    ↓
                                              [ Final Decision ]
```

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| **Scout** | Pattern detection & signal correlation | Raw signals (on-chain, social, GitHub, docs) | Pattern matches, convergent signal count, confidence score |
| **Analyst** | Deep reasoning & opportunity assessment | Scout's patterns + signal context | Analysis text, tags, reasoning chain |
| **Risk** | Security assessment & risk scoring | Raw signal data (contracts, bridges, flash loans) | Risk score (0-100), risk level, security tags |
| **Synthesize** | Final decision & recommendation | Outputs from Scout + Analyst + Risk | Action: Act / Monitor / Research / Ignore, final confidence, summary |

### Reasoning Chain
Every agent produces a **reasoning chain** — an audit trail of observations → hypotheses → confidences. This enables:
- Debugging agent decisions
- Learning from past analysis
- Building institutional knowledge

---

## 3. Development Flow

### Phase 1: Foundation (Session 1 — May 21, 2026)
- Scaffolded Next.js 16 app with TypeScript + Tailwind
- Built mock data layer with realistic crypto signals
- Created 4 agent API routes (Scout, Analyst, Risk, Synthesize)
- Built frontend components: hero, opportunity cards, filter system
- **Status:** Demo mode with mock data
- **Repo created:** `bsyrlhabibi/alphasynth`

### Phase 2: Live AI Upgrade (Session 2 — May 22, 2026)
- Built universal AI client (`src/lib/ai/index.ts`)
  - Supports ANY OpenAI-compatible endpoint
  - Auto-retry, timeout, JSON mode
  - Works with OpenRouter, Groq, OpenAI, Ollama, local endpoints
- Upgraded all agent routes to call live LLM
  - Scout: AI pattern detection
  - Analyst: AI deep reasoning
  - Risk: AI security scoring
  - Synthesize: AI decision aggregation
- Added fallback to mock reasoning if AI fails
- **Build:** First successful live AI build
- **Commit:** `bdcce86`

### Phase 3: Live Data Sources (Session 3 — May 22, 2026)
- Integrated live external data APIs:
  - **DeFiLlama** — TVL, yields, protocol metrics (free, no key needed)
  - **CoinGecko** — Trending tokens, market rank (free tier)
  - **Alchemy** — Whale transfers, block data, ERC20 activity (API key)
- Enhanced AI signal enrichment:
  - AI automatically adds: whyMatters, suggestedAction, urgencyScore (0-100)
- Built `/api/live` — unified live data endpoint
- Built `/api/pipeline` — full multi-agent orchestration
- Added `/api/health` — system diagnostics

---

## 4. API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/live` | GET | Fetches live data from all sources + AI enhancement |
| `/api/scout` | POST | Run Scout agent on signals |
| `/api/analyst` | POST | Run Analyst agent on signals |
| `/api/risk` | POST | Run Risk agent on signals |
| `/api/synthesize` | POST | Aggregate all agent outputs |
| `/api/pipeline` | POST | Full pipeline: Scout → Analyst → Risk → Synthesize |
| `/api/health` | GET | System health + AI endpoint status |

---

## 5. Data Sources Integration

### Active Sources
| Source | Type | Data | Auth |
|--------|------|------|------|
| DeFiLlama | DeFi/TVL | Protocol TVL changes, yield rates | None (free) |
| CoinGecko | Market | Trending tokens, market cap rank | None (free tier) |
| Alchemy | On-chain | Whale transfers, block activity, token balances | API Key |

### Planned Sources
| Source | Data | Auth Required |
|--------|------|--------------|
| Twitter/X API | Social mentions, trending crypto, whale tweets | Bearer Token |
| LunarCrush | Social volume, sentiment, influencer data | API Key |
| Etherscan | New contract deployments, verified source | API Key |
| GitHub API | Commits, releases, airdrop contracts | Token (optional) |

---

## 6. Technology Stack

```
Frontend:    Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
Backend:     Next.js API Routes (serverless functions)
AI Engine:   Custom AI client supporting ANY OpenAI-compatible endpoint
Deployment:  Vercel (serverless)
Build Tool:  Turbopack
```

### Key Dependencies
- `next` — Framework
- `framer-motion` — Animations
- `lucide-react` — Icons
- `recharts` — Charts
- `tailwind-merge` + `clsx` — Class handling

---

## 7. Configuration

### Environment Variables (`.env.local`)

```bash
# Required: AI Endpoint
AI_BASE_URL=https://openrouter.ai/api/v1    # Or your endpoint
AI_API_KEY=sk-or-v1-xxx                      # Or your key
AI_MODEL=router:general-01                   # Or gpt-4o-mini

# Optional: External APIs
ALCHEMY_API_KEY=                             # For whale/ethereum data
ETHERSCAN_API_KEY=                           # For contract data
LUNARCRUSH_API_KEY=                          # For social data

# Optional: Cache
UPSTASH_REDIS_REST_URL=                      # For caching
UPSTASH_REDIS_REST_TOKEN=
```

### Supported AI Providers
| Provider | AI_BASE_URL | AI_MODEL Example |
|----------|-------------|-----------------|
| OpenRouter | `https://openrouter.ai/api/v1` | `openai/gpt-4o-mini` |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.1-8b-instant` |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| Ollama | `http://localhost:11434/v1` | `llama3.1` |
| Digital Ocean AI | `https://inference.do-ai.run/v1` | `router:general-01` |

---

## 8. Deployment History

| Date | Commit | Description |
|------|--------|-------------|
| May 21 | `79c7e84` | Initial scaffold, mock data, frontend |
| May 22 | `bdcce86` | Live AI upgrade, 4 agents with AI |
| May 22 | *upcoming* | Live data integration, AI enhancement |

### Live URL
- **Vercel:** `https://alphasynth-iota.vercel.app/`
- **GitHub:** `https://github.com/bsyrlhabibi/alphasynth`

---

## 9. Key Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-agent pipeline | ✅ Live | All 4 agents use AI reasoning |
| Live data fetching | ✅ Ready | DeFiLlama, CoinGecko, Alchemy |
| AI signal enhancement | ✅ Ready | Auto whyMatters + urgencyScore |
| Reasoning chain display | ✅ Ready | Per-agent audit trail |
| Frontend filtering | ✅ Ready | By action, risk, category |
| AI search (natural language) | 🔄 Planned | Coming next phase |
| Cron scheduling (auto-refresh) | 🔄 Planned | Vercel cron jobs |
| Wallet tracking | 🔄 Planned | Whale wallet monitors |
| Telegram/Discord alerts | 🔄 Planned | Push notifications |

---

## 10. AI Performance Metrics

Example live signal enhancement:
```json
{
  "title": "TVL Spike: Binance CEX (+35.7% 24h)",
  "aiEnhancement": {
    "whyMatters": "Binance's TVL surged 36% to $154B — a significant inflow suggesting institutional/retail FOMO ahead",
    "suggestedAction": "monitor",
    "urgencyScore": 78
  }
}
```

---

## 11. Known Issues & Resolutions

| Issue | Resolution |
|-------|-----------|
| AI endpoint 401 Unauthorized | Use correct API key format per provider. e.g. OpenRouter uses `sk-or-v1-xxx` |
| Alchemy whale transfers empty | Transfer thresholds too high (100+ ETH). Lower to 10+ for more signals |
| Frontend build type errors | Fixed by removing `output: "export"` from next.config |

---

## 12. Roadmap

### Phase 4 — AI Search (Next)
- Natural language query to agent system
- Search → Scout → Analyst → Result
- Example: *"airdrop yang belum announce tapi udah ada clue"*

### Phase 5 — Cron Automation
- Auto-refresh every 15 minutes via Vercel Cron
- Auto-alert if confidence + urgency score crosses threshold
- Telegram/Discord integration

### Phase 6 — Advanced Intelligence
- Wallet portfolio tracking
- On-chain DEX volume analysis
- Sentiment analysis + Twitter scraping
- GitHub commit monitoring for airdrop clues

---

## 13. How to Use

### Local Development
```bash
cd /root/projects/alphasynth
npm install
# Setup .env.local
cp .env.local.example .env.local
# Edit with your API keys
npm run dev
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel login
vercel --prod
# Set environment variables in Vercel Dashboard
```

### Test API Endpoints
```bash
# Health check
curl https://alphasynth-iota.vercel.app/api/health

# Live data
curl https://alphasynth-iota.vercel.app/api/live

# Run agent
curl -X POST "https://alphasynth-iota.vercel.app/api/pipeline" \
  -H "Content-Type: application/json" \
  -d '{"signals":[{"id":"test","source":"DeFiLlama","sourceType":"defi","title":"TVL Spike: Uniswap","description":"+20% TVL surge","timestamp":"2026-05-22T00:00:00Z"}]}'
```

---

## 14. Credits

**AlphaSynth** — Built by Bita with AI agent assistance  
**Repository:** `https://github.com/bsyrlhabibi/alphasynth`  
**Deploy:** `https://alphasynth-iota.vercel.app/`

---

*Report generated automatically. Next update post-Phase 4 deployment.*
