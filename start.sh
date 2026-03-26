#!/bin/bash
# AI Podcast 启动脚本

echo "🎙️ AI Podcast - TypeScript 版"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
  echo "❌ 未找到 Node.js，请先安装: https://nodejs.org"
  exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
fi

# 检查 API Key
if [ -z "$KIMI_API_KEY" ]; then
  echo ""
  echo "⚠️  未设置 KIMI_API_KEY 环境变量"
  echo "请先执行: export KIMI_API_KEY='sk-你的API密钥'"
  echo ""
  read -rp "输入 Kimi API Key（或按回车跳过）: " api_key
  if [ -n "$api_key" ]; then
    export KIMI_API_KEY="$api_key"
  fi
fi

echo ""
echo "🚀 启动应用..."
echo ""

npx tsx src/server.ts
