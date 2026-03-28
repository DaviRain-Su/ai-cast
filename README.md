<div align="center">

# 🎙️ AI-CAST

**Decentralized AI Podcast Platform on Sui & Walrus**

[![npm](https://img.shields.io/npm/v/ai-cast-cli)](https://www.npmjs.com/package/ai-cast-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Demo](https://img.shields.io/badge/Demo-Live-green)](https://slides-2e0ff5ro4-davirainsus-projects.vercel.app)

**Article URL → AI Script → TTS Audio → On-chain Podcast**

Built for AI agents. Agent-first CLI with JSON output.

[📖 Documentation](#quick-start) • [🎬 Demo Day](https://slides-2e0ff5ro4-davirainsus-projects.vercel.app) • [📦 npm](https://www.npmjs.com/package/ai-cast-cli)

</div>

---

## 🎯 What is AI-CAST?

AI-CAST transforms articles into decentralized podcasts:

```
📄 Article URL 
    ↓
🕷️ Web Scraping (Cheerio)
    ↓
🧠 LLM Script (Kimi)
    ↓
🔊 TTS Audio (MLX)
    ↓
💾 Walrus Storage
    ↓
⛓️ Sui Blockchain
    ↓
🎧 Podcast Player
```

**Key Innovation**: Built for AI agents. The CLI outputs JSON for autonomous agents to consume and act upon.

---

## Quick Start (for Agents)

```bash
# Install environment (TTS model ~500MB, first time only)
npx ai-cast-cli install

# Setup wallet
npx ai-cast-cli init --package-id 0x10c32bf076865c211bec10e170e2640d08e3515a957754cfdeac890b5a7f2214

# Create creator profile
npx ai-cast-cli --json profile create --name "My Podcast" --category tech

# Generate and publish
npx ai-cast-cli --json fetch -u https://example.com/article
KIMI_API_KEY=sk-xxx npx ai-cast-cli --json script -i articles.json
npx ai-cast-cli --json speak -i script.txt -v serena
npx ai-cast-cli --json publish -a /tmp/podcast_*.wav -t "Episode Title" --tags ai,web3
```

See [CLI documentation](cli/README.md) and [skills/](cli/skills/) for full agent integration guide.

## Architecture

```
ai-cast/
├── src/           Local podcast generator (Express + Cheerio + Kimi + MLX TTS)
├── cli/           Agent-friendly CLI (npm: ai-cast-cli)
├── contracts/     Sui Move smart contracts
└── web/           Next.js web platform (Vercel)
```

### Smart Contracts (Sui Move)

| Module | Description |
|---|---|
| `creator` | Creator profiles, subscriber count, tip stats |
| `podcast` | Publish, update, delete podcasts with metadata |
| `subscription` | Subscribe/renew/cancel, epoch-based billing |
| `tipping` | Direct SUI tips to creators |
| `seal_policy` | SEAL access control for premium/paywalled content |

Testnet Package: `0x10c32bf076865c211bec10e170e2640d08e3515a957754cfdeac890b5a7f2214`

### CLI (`ai-cast-cli`)

[![npm](https://img.shields.io/npm/v/ai-cast-cli)](https://www.npmjs.com/package/ai-cast-cli)

| Command | Description |
|---|---|
| `install` | Check/install runtime (TTS model, ffmpeg, uv) |
| `fetch` | Fetch articles (multi-URL aggregation) |
| `script` | Generate podcast script via LLM |
| `speak` | Text-to-speech (MLX TTS, 7 voices) |
| `publish` | Upload to Walrus + register on Sui |
| `batch` | Batch generate + publish from URL list |
| `list` | List published podcasts |
| `balance` | SUI balance + tip/subscription income |

All commands support `--json` for structured output. See [cli/README.md](cli/README.md).

### Web Platform

- Discovery page with search, filtering, pagination
- Podcast player (neumorphic vinyl record UI)
- Creator profiles with subscribe + tip
- SEAL-encrypted premium content with paywall
- Wallet connect + zkLogin (Enoki) ready
- Mobile responsive

### Data Flow

| Data | Storage | Access |
|---|---|---|
| Audio (free) | Walrus blob | Direct playback |
| Audio (premium) | Walrus blob (SEAL encrypted) | Decrypt with active subscription |
| Transcript | Walrus blob | Always free |
| Metadata | Sui on-chain objects | Public |
| Tips/Subscriptions | Sui transactions | Direct SUI transfer |

## Development

### Local generator

```bash
npm install && npm run dev    # http://localhost:7868
```

### Contracts

```bash
cd contracts && sui move build && sui move test
```

### CLI

```bash
cd cli && npm install && npm run dev -- --help
```

### Web

```bash
cd web && npm install && npm run dev    # http://localhost:3000
```

## Requirements

- Node.js >= 18
- Python >= 3.10 + [uv](https://docs.astral.sh/uv/)
- Apple Silicon Mac (for MLX TTS)
- [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install)
- [ffmpeg](https://ffmpeg.org/)

## License

MIT
