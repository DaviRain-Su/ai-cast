# ai-cast-cli

Publish AI-generated podcasts to the **Sui blockchain** with **Walrus** decentralized storage.

Agent-friendly CLI with JSON output mode — designed for both humans and AI agents.

## Install

```bash
npm install -g ai-cast-cli
```

Requires: Node.js >= 18, [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install) (for wallet), [ffmpeg](https://ffmpeg.org/) (for audio conversion).

## Quick Start

```bash
# 1. Initialize (connects to your Sui wallet)
ai-cast init --package-id 0x10c32bf076865c211bec10e170e2640d08e3515a957754cfdeac890b5a7f2214

# 2. Create creator profile
ai-cast profile create --name "My Podcast" --bio "AI-powered content"

# 3. Publish a podcast
ai-cast publish --audio episode.wav --title "Episode 1" --script transcript.txt

# 4. List your podcasts
ai-cast list

# 5. Check balance & earnings
ai-cast balance
```

## Agent Mode (--json)

All commands support `--json` for structured output:

```bash
ai-cast --json publish --audio ep.wav --title "EP 1"
# Output: {"status":"ok","podcastId":"0x...","audioBlobId":"...","digest":"..."}

ai-cast --json list
# Output: {"status":"ok","address":"0x...","podcasts":[...]}

ai-cast --json balance
# Output: {"status":"ok","suiBalance":0.89,"tipsReceived":0.5,...}
```

## Environment Variables

Skip `ai-cast init` by setting environment variables (ideal for CI/CD and agents):

| Variable | Description |
|---|---|
| `AI_CAST_PACKAGE_ID` | Smart contract package ID |
| `AI_CAST_KEYSTORE` | Path to Sui keystore file |
| `AI_CAST_ADDRESS` | Active wallet address |
| `AI_CAST_NETWORK` | `testnet` / `mainnet` / `devnet` |
| `AI_CAST_WALRUS_PUB` | Walrus publisher URL |
| `AI_CAST_WALRUS_AGG` | Walrus aggregator URL |

```bash
# Agent usage with env vars (no init needed)
AI_CAST_PACKAGE_ID=0x... AI_CAST_KEYSTORE=~/.sui/sui_config/sui.keystore \
  ai-cast --json publish --audio ep.opus --title "Agent Episode"
```

## Programmatic API

```typescript
import { loadConfig, getAddress, uploadBlob, signAndExecute } from "ai-cast-cli";

const config = loadConfig();
const address = getAddress(config);
const { blobId } = await uploadBlob(audioData, { epochs: 5 });
```

## Commands

### `ai-cast init`
Initialize CLI configuration.

### `ai-cast profile create`
Create an on-chain creator profile.

### `ai-cast publish`
Publish podcast: WAV→Opus conversion → Walrus upload → Sui registration.

Options:
- `--audio, -a` — Audio file path (required)
- `--title, -t` — Podcast title (required)
- `--script, -s` — Transcript file path
- `--description, -d` — Description
- `--style` — `deep_dive` | `news` | `story` | `interview`
- `--tier` — `free` | `premium` (premium uses SEAL encryption)
- `--retention` — Walrus storage epochs (default: 5)

### `ai-cast list`
List all podcasts published by your wallet.

### `ai-cast balance`
Show SUI balance, tips received, and subscription income.

## Architecture

```
Local audio → ffmpeg (WAV→Opus) → SEAL encrypt (premium) → Walrus upload → Sui on-chain
```

- **Sui**: Creator profiles, podcast metadata, subscriptions, tips
- **Walrus**: Audio files, transcripts (decentralized blob storage)
- **SEAL**: Encryption for premium/paywalled content

## License

MIT
