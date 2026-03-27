# Query — 查询播客和收入

查看已发布的播客列表、余额、打赏和订阅收入。

## 列出我的播客

```bash
npx ai-cast-cli --json list
```

输出：
```json
{
  "status": "ok",
  "address": "0x...",
  "podcasts": [
    {
      "objectId": "0x...",
      "title": "Episode 1",
      "style": "deep_dive",
      "durationSecs": 300,
      "tier": "free",
      "audioBlobId": "xIYEkg...",
      "tipTotal": 500000000,
      "playCount": 42
    }
  ]
}
```

## 查看余额和收入

```bash
npx ai-cast-cli --json balance
```

输出：
```json
{
  "status": "ok",
  "address": "0x...",
  "suiBalance": 0.89,
  "tipsReceived": 0.5,
  "tipsSent": 0.1,
  "subscriptionIncome": 0.4,
  "subscriptionCount": 3
}
```

金额单位为 SUI。1 SUI = 1,000,000,000 MIST。
