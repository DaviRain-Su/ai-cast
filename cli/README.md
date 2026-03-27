# ai-cast-cli

Publish AI-generated podcasts to **Sui blockchain** + **Walrus** decentralized storage.

Zero-install CLI for AI agents — run with `npx`, get JSON output, no interaction needed.

## For Agents

```bash
# No install needed. Just run:
npx ai-cast-cli --json <command>
```

Every command outputs structured JSON when `--json` is set. Parse `status` field for success/failure.

### First-time setup (run once)

```bash
# Step 1: Check environment (TTS model, ffmpeg, etc.)
npx ai-cast-cli install --check

# Step 2: Install missing dependencies (TTS model ~500MB)
npx ai-cast-cli install

# Step 3: Connect Sui wallet
npx ai-cast-cli init --package-id 0x10c32bf076865c211bec10e170e2640d08e3515a957754cfdeac890b5a7f2214

# Step 4: Create creator profile
npx ai-cast-cli --json profile create --name "AI Weekly" --bio "AI-powered podcast" --category tech
# → {"status":"ok","objectId":"0x...","digest":"..."}
```

### Generate and publish a podcast (daily workflow)

```bash
# Step 1: Fetch article(s)
npx ai-cast-cli --json fetch -u https://example.com/article -o /tmp/articles.json
# → {"status":"ok","output":"/tmp/articles.json","count":1,"articles":[{"title":"...","chars":4500}]}

# Step 2: Generate script (requires KIMI_API_KEY env var)
KIMI_API_KEY=sk-xxx npx ai-cast-cli --json script -i /tmp/articles.json -s deep_dive -o /tmp/script.txt
# → {"status":"ok","output":"/tmp/script.txt","chars":2800,"style":"deep_dive"}

# Step 3: Text-to-speech (requires MLX TTS model installed via `install` command)
npx ai-cast-cli --json speak -i /tmp/script.txt -v serena -o /tmp/episode.wav
# → {"status":"ok","output":"/tmp/episode.wav","voice":"serena"}

# Step 4: Publish to Sui/Walrus
npx ai-cast-cli --json publish -a /tmp/episode.wav -t "Article Title" -s /tmp/script.txt --tags ai,tech --source-url https://example.com/article
# → {"status":"ok","podcastId":"0x...","audioBlobId":"...","digest":"..."}
```

### Batch publish (multiple URLs)

```bash
# Create a file with one URL per line
echo "https://article1.com
https://article2.com
https://article3.com" > urls.txt

# Publish each URL as a separate podcast
npx ai-cast-cli --json batch -f urls.txt --style deep_dive --voice serena --tags ai

# Or aggregate all into one podcast
npx ai-cast-cli --json batch -f urls.txt --aggregate --style news --tags weekly
```

### Query data

```bash
# List my podcasts
npx ai-cast-cli --json list
# → {"status":"ok","podcasts":[{"objectId":"0x...","title":"...","audioBlobId":"..."}]}

# Check balance and earnings
npx ai-cast-cli --json balance
# → {"status":"ok","suiBalance":0.89,"tipsReceived":0.5,"subscriptionIncome":0.4}
```

## Environment Variables

Skip interactive `init` by setting env vars (ideal for agents and CI/CD):

| Variable | Required | Description |
|---|---|---|
| `AI_CAST_PACKAGE_ID` | Yes | Smart contract package ID on Sui |
| `AI_CAST_KEYSTORE` | Yes | Path to Sui keystore file |
| `KIMI_API_KEY` | For `script` | LLM API key for podcast script generation |
| `AI_CAST_NETWORK` | No | `testnet` (default) / `mainnet` / `devnet` |
| `AI_CAST_ADDRESS` | No | Active wallet address (auto-detected from keystore) |

```bash
# Full agent usage with env vars — no init needed
AI_CAST_PACKAGE_ID=0x10c32bf076865c211bec10e170e2640d08e3515a957754cfdeac890b5a7f2214 \
AI_CAST_KEYSTORE=~/.sui/sui_config/sui.keystore \
KIMI_API_KEY=sk-xxx \
npx ai-cast-cli --json fetch -u https://example.com && \
npx ai-cast-cli --json script -i articles.json && \
npx ai-cast-cli --json speak -i script.txt && \
npx ai-cast-cli --json publish -a /tmp/podcast_*.wav -t "Auto Episode"
```

## All Commands

| Command | Description | Key Options |
|---|---|---|
| `install` | Check/install runtime environment | `--check` (check only) |
| `fetch` | Fetch article content | `-u <url>` (multiple allowed) |
| `script` | Generate podcast script via LLM | `-i <input>`, `-s <style>` |
| `speak` | Text-to-speech synthesis | `-i <input>`, `-v <voice>` |
| `publish` | Upload to Walrus + register on Sui | `-a <audio>`, `-t <title>`, `--tags` |
| `batch` | Batch generate + publish | `-f <file>`, `--aggregate` |
| `init` | Configure wallet connection | `--package-id <id>` |
| `profile create` | Create on-chain creator profile | `--name`, `--category` |
| `list` | List published podcasts | |
| `balance` | Show SUI balance + earnings | |

### Options for `publish`

| Option | Description |
|---|---|
| `-a, --audio <path>` | Audio file (required). WAV auto-converts to Opus |
| `-t, --title <title>` | Podcast title (required) |
| `-s, --script <path>` | Transcript file |
| `-d, --description` | Description text |
| `--style <style>` | `deep_dive` / `news` / `story` / `interview` |
| `--tags <tags>` | Comma-separated tags: `ai,web3,defi` |
| `--tier <tier>` | `free` (default) / `premium` (SEAL encrypted) |
| `--source-url <url>` | Original article URL |
| `--retention <n>` | Walrus storage epochs (default: 5) |

### Voices for `speak`

| Voice | Gender |
|---|---|
| `serena` (default) | Female |
| `vivian` | Female |
| `sohee` | Female |
| `ryan` | Male |
| `aiden` | Male |
| `eric` | Male |
| `dylan` | Male |

### Styles for `script`

| Style | Description |
|---|---|
| `deep_dive` (default) | In-depth analysis, logical structure |
| `news` | Fast-paced, information-dense |
| `story` | Narrative, emotionally engaging |
| `interview` | Conversational, casual |

### Categories for `profile create`

`tech` / `finance` / `news` / `culture` / `education` / `entertainment`

## Architecture

```
Article URL → fetch → LLM script → TTS audio → ffmpeg (WAV→Opus) → Walrus upload → Sui on-chain
```

- **Sui**: Creator profiles, podcast metadata, subscriptions, tips, SEAL policies
- **Walrus**: Audio files, transcripts (decentralized blob storage)
- **SEAL**: Encryption for premium/paywalled content

## JSON Output Schema

All commands with `--json` return:

```json
// Success
{"status": "ok", "key": "value", ...}

// Error
{"error": "error message", "details": "additional info"}
```

## License

MIT
