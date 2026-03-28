---
theme: seriph
background: https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop
class: text-center
highlighter: shiki
lineNumbers: false
title: AI-CAST Demo Day
transition: slide-left
---

# AI-CAST

## Decentralized AI Podcast Platform

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-4 py-2 rounded cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
    Start Demo <carbon:arrow-right class="inline"/>
  </span>
</div>

<div class="abs-br m-6 flex gap-2">
  <a href="https://github.com/DaviRain-Su/ai-cast" target="_blank" alt="GitHub"
    class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
</div>

---
layout: center
class: text-center
---

# The Problem

<div class="grid grid-cols-3 gap-8 mt-12">
  <div class="p-6 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20">
    <div class="text-4xl mb-4">📚</div>
    <h3 class="text-xl font-bold">Too Much Content</h3>
    <p class="text-sm opacity-70 mt-2">Articles, papers, newsletters pile up unread</p>
  </div>
  <div class="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
    <div class="text-4xl mb-4">🎧</div>
    <h3 class="text-xl font-bold">Audio Gap</h3>
    <p class="text-sm opacity-70 mt-2">No easy way to convert text to quality audio</p>
  </div>
  <div class="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
    <div class="text-4xl mb-4">🤖</div>
    <h3 class="text-xl font-bold">AI Agent Need</h3>
    <p class="text-sm opacity-70 mt-2">Agents need content they can consume</p>
  </div>
</div>

---
layout: center
class: text-center
---

# The Solution

## AI-CAST Pipeline

<div class="flex items-center justify-center gap-4 text-sm font-mono mt-8">
  <div class="p-4 rounded-lg bg-blue-900/50">📄 Article</div>
  <span class="text-2xl">→</span>
  <div class="p-4 rounded-lg bg-green-900/50">🕷️ Scrape</div>
  <span class="text-2xl">→</span>
  <div class="p-4 rounded-lg bg-purple-900/50">🧠 LLM</div>
  <span class="text-2xl">→</span>
  <div class="p-4 rounded-lg bg-orange-900/50">🔊 TTS</div>
  <span class="text-2xl">→</span>
  <div class="p-4 rounded-lg bg-red-900/50">⛓️ On-chain</div>
</div>

<div class="mt-8 text-xl">
  <span class="text-gradient">Article in → Podcast out</span>
</div>

---

# Key Features

<div class="grid grid-cols-2 gap-8">
  <div class="p-4">
    <h3 class="text-2xl font-bold text-purple-400 mb-4">For AI Agents</h3>
    <ul class="space-y-2">
      <li class="flex items-center gap-2"><carbon:checkmark-filled class="text-green-400"/> CLI-first design</li>
      <li class="flex items-center gap-2"><carbon:checkmark-filled class="text-green-400"/> JSON output for parsing</li>
      <li class="flex items-center gap-2"><carbon:checkmark-filled class="text-green-400"/> Agent skill integration</li>
      <li class="flex items-center gap-2"><carbon:checkmark-filled class="text-green-400"/> Batch processing</li>
    </ul>
  </div>
  <div class="p-4">
    <h3 class="text-2xl font-bold text-pink-400 mb-4">For Humans</h3>
    <ul class="space-y-2">
      <li class="flex items-center gap-2"><carbon:checkmark-filled class="text-green-400"/> Beautiful web player</li>
      <li class="flex items-center gap-2"><carbon:checkmark-filled class="text-green-400"/> Subscribe & tip creators</li>
      <li class="flex items-center gap-2"><carbon:checkmark-filled class="text-green-400"/> Premium content (SEAL)</li>
      <li class="flex items-center gap-2"><carbon:checkmark-filled class="text-green-400"/> On-chain ownership</li>
    </ul>
  </div>
</div>

---

# Architecture

<div class="grid grid-cols-4 gap-4 text-center">
  <div class="p-4 rounded-xl bg-blue-900/30 border border-blue-500/30">
    <div class="text-2xl mb-2">🖥️</div>
    <div class="font-bold">Frontend</div>
    <div class="text-xs opacity-70">Next.js 14</div>
    <div class="text-xs opacity-70">Vinyl UI</div>
  </div>
  <div class="p-4 rounded-xl bg-green-900/30 border border-green-500/30">
    <div class="text-2xl mb-2">⌨️</div>
    <div class="font-bold">CLI</div>
    <div class="text-xs opacity-70">ai-cast-cli</div>
    <div class="text-xs opacity-70">8 commands</div>
  </div>
  <div class="p-4 rounded-xl bg-purple-900/30 border border-purple-500/30">
    <div class="text-2xl mb-2">📜</div>
    <div class="font-bold">Contracts</div>
    <div class="text-xs opacity-70">Sui Move</div>
    <div class="text-xs opacity-70">5 modules</div>
  </div>
  <div class="p-4 rounded-xl bg-orange-900/30 border border-orange-500/30">
    <div class="text-2xl mb-2">💾</div>
    <div class="font-bold">Storage</div>
    <div class="text-xs opacity-70">Walrus</div>
    <div class="text-xs opacity-70">SEAL encrypt</div>
  </div>
</div>

---
layout: center
class: text-center
---

# Smart Contracts

<div class="grid grid-cols-5 gap-4 mt-8">
  <div class="p-4 rounded-lg bg-blue-900/30 border border-blue-500/30">
    <div class="text-3xl mb-2">👤</div>
    <div class="font-bold">Creator</div>
    <div class="text-xs opacity-70">Profiles & stats</div>
  </div>
  <div class="p-4 rounded-lg bg-purple-900/30 border border-purple-500/30">
    <div class="text-3xl mb-2">🎙️</div>
    <div class="font-bold">Podcast</div>
    <div class="text-xs opacity-70">Publish & manage</div>
  </div>
  <div class="p-4 rounded-lg bg-green-900/30 border border-green-500/30">
    <div class="text-3xl mb-2">💎</div>
    <div class="font-bold">Subscription</div>
    <div class="text-xs opacity-70">Epoch billing</div>
  </div>
  <div class="p-4 rounded-lg bg-orange-900/30 border border-orange-500/30">
    <div class="text-3xl mb-2">💰</div>
    <div class="font-bold">Tipping</div>
    <div class="text-xs opacity-70">Direct SUI tips</div>
  </div>
  <div class="p-4 rounded-lg bg-red-900/30 border border-red-500/30">
    <div class="text-3xl mb-2">🔒</div>
    <div class="font-bold">SEAL</div>
    <div class="text-xs opacity-70">Access control</div>
  </div>
</div>

<div class="mt-8 text-sm opacity-60 font-mono">
  Package: 0x10c32...a7f2214
</div>

---

# Live Demo

## CLI in Action

```bash
# Install (one-time setup)
npx ai-cast-cli install

# Setup wallet
npx ai-cast-cli init --package-id 0x10c32...

# Create profile
npx ai-cast-cli profile create --name "AI Daily" --category tech

# Generate podcast
npx ai-cast-cli fetch -u https://example.com/article
npx ai-cast-cli script -i articles.json
npx ai-cast-cli speak -i script.txt -v serena
npx ai-cast-cli publish -a /tmp/podcast.wav -t "Episode 1"
```

---
---

# Agent Quick Start

## 🚀 One-liner for AI Agents

```bash
# Complete pipeline in one command
npx ai-cast-cli batch \
  --url https://example.com/article \
  --title "AI News" \
  --voice serena \
  --publish
```

**Output:**
```json
{
  "status": "success",
  "podcastId": "0x123...",
  "audioUrl": "https://walrus.io/blob/abc...",
  "txHash": "0xdef..."
}
```

✅ Agent parses JSON → Auto-uploads → On-chain in 30s

---

# Why Agent-First?

## 🤖 Built for Autonomous Agents

| Feature | Human Use | Agent Use |
|---------|-----------|-----------|
| **Install** | `npx ai-cast-cli install` | Pre-installed in container |
| **Input** | Interactive prompts | `--json` flag for structured I/O |
| **Output** | Pretty tables | Machine-readable JSON |
| **Auth** | Manual wallet setup | Environment variables |
| **Batch** | One by one | 100 articles at once |

```bash
# Agent reads output and acts
npx ai-cast-cli --json batch -f urls.txt | jq '.[].podcastId'
```

---
layout: center
class: text-center
---

# Web Platform

<div class="grid grid-cols-3 gap-8">
  <div class="p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900">
    <div class="text-4xl mb-4">🎵</div>
    <h3 class="text-xl font-bold">Vinyl Player</h3>
    <p class="text-sm opacity-70">Spinning record UI</p>
  </div>
  <div class="p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900">
    <div class="text-4xl mb-4">🔍</div>
    <h3 class="text-xl font-bold">Discovery</h3>
    <p class="text-sm opacity-70">Browse & search</p>
  </div>
  <div class="p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900">
    <div class="text-4xl mb-4">💳</div>
    <h3 class="text-xl font-bold">Monetize</h3>
    <p class="text-sm opacity-70">Tips & subscriptions</p>
  </div>
</div>

---

# Tech Stack

<div class="grid grid-cols-4 gap-4 text-center">
  <div class="p-4">
    <div class="text-4xl mb-2">⚡</div>
    <div class="font-bold">Sui</div>
    <div class="text-xs opacity-70">Object blockchain</div>
  </div>
  <div class="p-4">
    <div class="text-4xl mb-2">🦭</div>
    <div class="font-bold">Walrus</div>
    <div class="text-xs opacity-70">Decentralized storage</div>
  </div>
  <div class="p-4">
    <div class="text-4xl mb-2">🔊</div>
    <div class="font-bold">MLX TTS</div>
    <div class="text-xs opacity-70">Apple Silicon audio</div>
  </div>
  <div class="p-4">
    <div class="text-4xl mb-2">🧠</div>
    <div class="font-bold">Kimi</div>
    <div class="text-xs opacity-70">Long-context LLM</div>
  </div>
</div>

<div class="grid grid-cols-4 gap-4 text-center mt-4">
  <div class="p-4">
    <div class="text-4xl mb-2">⚛️</div>
    <div class="font-bold">Move</div>
    <div class="text-xs opacity-70">Resource language</div>
  </div>
  <div class="p-4">
    <div class="text-4xl mb-2">▲</div>
    <div class="font-bold">Next.js</div>
    <div class="text-xs opacity-70">React framework</div>
  </div>
  <div class="p-4">
    <div class="text-4xl mb-2">📦</div>
    <div class="font-bold">npm</div>
    <div class="text-xs opacity-70">Package distribution</div>
  </div>
  <div class="p-4">
    <div class="text-4xl mb-2">🔐</div>
    <div class="font-bold">SEAL</div>
    <div class="text-xs opacity-70">Access control</div>
  </div>
</div>

---
layout: center
class: text-center
---

# Progress & Roadmap

<div class="grid grid-cols-2 gap-12">
  <div class="text-left">
    <h3 class="text-2xl font-bold text-green-400 mb-4">✅ Completed</h3>
    <ul class="space-y-2">
      <li>✅ Smart contracts (5 modules)</li>
      <li>✅ CLI tool (8 commands)</li>
      <li>✅ Web platform (Next.js)</li>
      <li>✅ Testnet deployment</li>
      <li>✅ npm package published</li>
    </ul>
  </div>
  <div class="text-left">
    <h3 class="text-2xl font-bold text-blue-400 mb-4">🚀 Next Steps</h3>
    <ul class="space-y-2">
      <li>🔲 Mainnet launch</li>
      <li>🔲 Mobile app</li>
      <li>🔲 Multi-language TTS</li>
      <li>🔲 Creator analytics</li>
      <li>🔲 AI agent marketplace</li>
    </ul>
  </div>
</div>

---
layout: center
class: text-center
---

# Why AI-CAST?

<div class="text-3xl font-bold mb-8">
  <span class="text-gradient">Content for AI, by AI, on-chain</span>
</div>

<div class="grid grid-cols-3 gap-8">
  <div class="p-6">
    <div class="text-5xl mb-4">🤖</div>
    <h3 class="text-xl font-bold">Agent-Native</h3>
    <p class="opacity-70">CLI-first for autonomous agents</p>
  </div>
  <div class="p-6">
    <div class="text-5xl mb-4">⛓️</div>
    <h3 class="text-xl font-bold">Decentralized</h3>
    <p class="opacity-70">Sui + Walrus, no central servers</p>
  </div>
  <div class="p-6">
    <div class="text-5xl mb-4">💎</div>
    <h3 class="text-xl font-bold">Monetization</h3>
    <p class="opacity-70">Tips, subs, premium content</p>
  </div>
</div>

---
layout: center
class: text-center
---

# Thank You

## AI-CAST

<div class="text-2xl mt-8 mb-8">
  Decentralized AI Podcast Platform
</div>

<div class="flex justify-center gap-4">
  <a href="https://github.com/DaviRain-Su/ai-cast" class="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold flex items-center gap-2 no-underline">
    <span>GitHub</span>
  </a>
  <a href="https://www.npmjs.com/package/ai-cast-cli" class="px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold flex items-center gap-2 no-underline">
    <span>npm</span>
  </a>
</div>

<div class="mt-12 text-sm opacity-50">
  Built with ❤️ for AI agents
</div>

<style>
.text-gradient {
  background: linear-gradient(120deg, #a78bfa 0%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
