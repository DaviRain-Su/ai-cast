# AI-CAST

输入文章链接，AI 自动生成播客脚本并合成语音。

**技术栈**：TypeScript + Express + [@mariozechner/pi-ai](https://github.com/badlogic/pi-mono) + mlx-audio Qwen3-TTS

---

## 快速开始

### 1. 安装依赖

```bash
npm install   # Node.js 依赖
uv sync       # Python TTS 依赖 (mlx-audio)
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`：

```
KIMI_API_KEY=sk-kimi-你的API密钥
```

### 3. 启动

```bash
npm run dev
```

访问 http://127.0.0.1:7868

---

## 使用方式

1. 粘贴文章链接，选择播客风格
2. 点击 **GENERATE SCRIPT** 生成脚本（可手动编辑）
3. 选择声音，点击 **BROADCAST** 合成语音
4. 播放或下载音频

---

## 项目结构

```
src/
├── server.ts       # Express 服务器
├── scraper.ts      # 文章抓取 (cheerio)
├── llm.ts          # 脚本生成 (pi-ai + Kimi coding API)
├── tts.ts          # 语音合成 (mlx-audio Qwen3-TTS)
└── public/
    └── index.html  # 前端 UI（neumorphic 黑胶唱片风格）
pyproject.toml      # Python TTS 依赖 (uv)
```

## 环境要求

- Node.js >= 20
- Python >= 3.10（通过 [uv](https://docs.astral.sh/uv/) 管理）
- Apple Silicon Mac（mlx-audio 依赖 MLX）

## TTS 模型

使用 [mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit](https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit)，首次运行自动下载到 HuggingFace 缓存（`~/.cache/huggingface/`）。

可用声音：`serena`、`vivian`、`sohee`、`ryan`、`aiden`、`eric`、`dylan`

## License

MIT
