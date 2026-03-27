# CLAUDE.md — AI-Cast 项目规范

## 项目概述

去中心化 AI 播客平台：文章 URL → AI 脚本 → TTS 语音 → Walrus 存储 → Sui 链上注册。面向 AI Agent 设计，通过 CLI 完成全流程。

**四个模块**
- `src/` — 本地播客生成器（Express + Cheerio + Kimi + MLX TTS）
- `cli/` — Agent 友好的 CLI 工具（npm: ai-cast-cli）
- `contracts/` — Sui Move 智能合约（creator, podcast, subscription, tipping, seal_policy）
- `web/` — Next.js 平台（发现页 + 播放器 + 订阅/打赏）

**启动方式**
```bash
# 本地生成器
npm run dev                           # http://localhost:7868

# CLI（任何人可用）
npx ai-cast-cli --help

# Web 平台
cd web && npm run dev                 # http://localhost:3000

# 合约构建
cd contracts && sui move build
```

---

## 项目结构

```
ai-cast/
├── src/                    # 本地播客生成器
│   ├── server.ts           # Express API 服务器
│   ├── scraper.ts          # 文章抓取 (cheerio)
│   ├── llm.ts              # LLM 脚本生成 (Kimi API)
│   ├── tts.ts              # 语音合成 (MLX TTS)
│   └── public/index.html   # 前端 UI（neumorphic 黑胶唱片）
├── cli/                    # CLI 工具
│   ├── src/
│   │   ├── index.ts        # 命令入口
│   │   ├── commands/       # fetch, script, speak, publish, batch, install, init, profile, list, balance
│   │   ├── config.ts       # 配置管理（文件 + 环境变量）
│   │   ├── sui.ts          # Sui 客户端
│   │   ├── walrus.ts       # Walrus 上传/下载（含重试）
│   │   ├── seal.ts         # SEAL 加密
│   │   ├── output.ts       # JSON/人类双模式输出
│   │   └── utils.ts        # handleError, loadConfigWithPackageId, formatDuration
│   └── skills/             # Agent 指令文档
├── contracts/              # Sui Move 合约
│   └── sources/
│       ├── creator.move
│       ├── podcast.move
│       ├── subscription.move
│       ├── tipping.move
│       └── seal_policy.move
└── web/                    # Next.js 平台
    └── src/
        ├── app/            # 页面路由
        ├── components/     # VinylPlayer, PodcastCard, TipButton, SubscribeButton, Paywall, Toast, Skeleton
        ├── hooks/          # usePodcasts, useCreator, useSubscription
        └── lib/            # sui-client, seal-client, constants
```

---

## 代码质量原则

### 函数分解
每个函数只做一件事。CLI 的 fetch/script/speak/publish 是独立步骤，不要合并。

### 命名
- 函数名描述**做什么**: `fetchArticle`, `uploadBlob`, `signAndExecute`
- 变量名描述**角色**: `podcast`, `creator`, `subscription`

### 提前返回
```typescript
// CLI 命令中用 handleError 提前退出
if (!existsSync(options.audio)) {
  handleError("音频文件不存在", new Error(options.audio));
}
```

### 错误处理
- CLI: 统一使用 `handleError()` 从 `utils.ts`，同时输出人类可读和 JSON
- Web: 使用 Toast 通知用户，不要静默 `console.error`
- 合约: 使用 `assert!` + 错误码常量

### JSON/人类双模式
CLI 所有命令通过 `log()` 输出人类可读文本，通过 `outputResult()` 输出 JSON。`--json` 标志切换模式。

### 安全
- CLI: 使用 `execFileSync`（不是 `execSync`）避免命令注入
- 合约: 所有修改操作必须验证 `ctx.sender()` 是 owner
- 合约: tipping/subscription 必须验证 `creator_profile` 与操作对象匹配
- Web: `URL.revokeObjectURL()` 防止内存泄漏

### Walrus 网络调用
- 超时: 5 分钟（上传）/ 60 秒（下载）
- 重试: 3 次指数退避
- 文件大小限制: 500MB

---

## 依赖管理

```bash
# 根目录（本地生成器）
npm install

# CLI
cd cli && npm install

# Web
cd web && npm install

# Python TTS
uv sync

# 合约
cd contracts && sui move build
```

---

## 合约部署

Testnet Package ID: `0x10c32bf076865c211bec10e170e2640d08e3515a957754cfdeac890b5a7f2214`

```bash
cd contracts
sui move build
sui client publish --gas-budget 100000000
```

新增模块需要重新发布（`rm Published.toml` 后 `sui client publish`）。
