# AI Podcast - Mac 本地版

使用 `uv` 管理的 AI 播客生成器。输入文章链接，自动生成播客脚本并朗读。

## 🚀 快速开始

### 1. 安装 uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. 创建虚拟环境

```bash
cd ai-podcast
uv venv
source .venv/bin/activate
```

### 3. 安装依赖

**推荐：MeloTTS 版本（效果最好）**

```bash
# 先安装 MeloTTS 的依赖
uv pip install torch torchaudio numpy transformers phonemizer unidecode pypinyin inflect jieba cn2an pyopenjtalk-prebuilt

# 从 GitHub 安装 melotts
uv pip install git+https://github.com/myshell-ai/MeloTTS.git

# 再安装其他依赖
uv pip install gradio openai requests beautifulsoup4
```

**或 Edge TTS 版本（最简单）**

```bash
uv pip install gradio openai requests beautifulsoup4 edge-tts
```

**或 MLX 版本（M1/M2/M3 最快）**

```bash
uv pip install gradio openai requests beautifulsoup4 mlx mlx-audio
```

### 4. 运行

```bash
export KIMI_API_KEY="sk-你的API密钥"

# 运行推荐版本
python app_melo.py

# 或 Edge TTS 版本
python app.py

# 或 MLX 版本
python app_mlx.py
```

浏览器自动打开 http://localhost:7860

## 📦 三个版本

| 版本 | 适用 | 安装命令 | 特点 |
|------|------|---------|------|
| **app_melo.py** ⭐ | 所有 Mac | 见上方 | **推荐**，中文效果顶尖，500MB 模型 |
| **app_mlx.py** | M1/M2/M3 | `uv pip install mlx mlx-audio` | 速度最快，1.7GB 模型 |
| **app.py** | 快速试用 | `uv pip install edge-tts` | 无需下载模型 |

## 🎙️ 选择建议

- **追求效果** → MeloTTS（`app_melo.py`）
- **追求速度** → MLX（`app_mlx.py`，仅限 M1/M2/M3）
- **快速试用** → Edge TTS（`app.py`）

## 📝 首次使用

**MeloTTS**：首次运行自动下载 500MB 模型到 `~/.cache/`，约 5-20 分钟。

**MLX**：首次运行自动下载 1.7GB 模型，Python 3.11 最佳。

**模型下载慢？**
```bash
export HF_ENDPOINT=https://hf-mirror.com
python app_melo.py
```

## 📄 License

MIT
