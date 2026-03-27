# Publish — 生成并发布播客

从文章 URL 生成 AI 播客并发布到 Sui/Walrus。

## 完整流程

```
fetch (抓取文章) → script (生成脚本) → speak (合成语音) → publish (发布上链)
```

每一步独立，可以在任意步骤停下来让用户审阅。

## Step 1: 抓取文章

```bash
npx ai-cast-cli --json fetch -u <URL> -o /tmp/articles.json
```

多源聚合（多篇文章合成一期）：
```bash
npx ai-cast-cli --json fetch -u <URL1> -u <URL2> -u <URL3> -o /tmp/articles.json
```

输出：
```json
{"status": "ok", "output": "/tmp/articles.json", "count": 2, "articles": [{"title": "...", "url": "...", "chars": 4500}]}
```

## Step 2: 生成脚本

需要 `KIMI_API_KEY` 环境变量。

```bash
KIMI_API_KEY=sk-xxx npx ai-cast-cli --json script -i /tmp/articles.json -s <style> -o /tmp/script.txt
```

风格选项：
- `deep_dive` — 深度解读，逻辑层层递进（默认）
- `news` — 新闻资讯，节奏快信息密
- `story` — 故事叙事，情感引人入胜
- `interview` — 对话访谈，轻松自然

输出：
```json
{"status": "ok", "output": "/tmp/script.txt", "chars": 2800, "style": "deep_dive", "sourceCount": 1}
```

**建议：** 这一步后让用户审阅脚本，确认满意再继续合成。

## Step 3: 合成语音

```bash
npx ai-cast-cli --json speak -i /tmp/script.txt -v <voice> -o /tmp/episode.wav
```

声音选项：
- 女声: `serena`（默认）、`vivian`、`sohee`
- 男声: `ryan`、`aiden`、`eric`、`dylan`

输出：
```json
{"status": "ok", "output": "/tmp/episode.wav", "voice": "serena", "chars": 2800}
```

注意：首次运行需加载 TTS 模型，可能需要 1-2 分钟。

## Step 4: 发布上链

```bash
npx ai-cast-cli --json publish \
  -a /tmp/episode.wav \
  -t "播客标题" \
  -s /tmp/script.txt \
  --style deep_dive \
  --tags ai,web3 \
  --source-url https://original-article.com
```

输出：
```json
{
  "status": "ok",
  "podcastId": "0x...",
  "audioBlobId": "xIYEkg...",
  "scriptBlobId": "O_tprA...",
  "digest": "9bsbvQ...",
  "creator": "0x...",
  "title": "播客标题",
  "style": "deep_dive",
  "tier": "free",
  "durationSecs": 180
}
```

### 发布选项

| 选项 | 必需 | 说明 |
|------|------|------|
| `-a, --audio` | 是 | 音频文件路径（WAV 自动转 Opus） |
| `-t, --title` | 是 | 播客标题 |
| `-s, --script` | 否 | 文字稿文件（上传到 Walrus） |
| `--tags` | 否 | 标签，逗号分隔: `ai,web3,defi` |
| `--style` | 否 | 播客风格（默认 deep_dive） |
| `--source-url` | 否 | 原始文章链接 |
| `--tier` | 否 | `free`（默认）/ `premium`（SEAL 加密） |

## 错误处理

所有错误返回：
```json
{"error": "错误描述", "details": "详细信息"}
```

常见错误：
- `"未设置 KIMI_API_KEY"` → 设置环境变量 `export KIMI_API_KEY=sk-xxx`
- `"音频文件不存在"` → 检查文件路径
- `"Walrus 上传失败"` → 网络问题，会自动重试 3 次
- `"链上注册失败"` → 检查 SUI 余额，音频已上传可手动重试
