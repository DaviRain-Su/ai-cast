# CLAUDE.md — ai-boardcast 项目规范

## 项目概述

AI Podcast 生成器：输入文章 URL，调用 Kimi API 生成播客脚本，再通过 TTS（Edge TTS / MeloTTS / MLX）合成语音。界面使用 Gradio，设计为 Mac 本地运行。

**入口文件**
- `app.py` — Edge TTS 版（推荐，无需下载模型）
- `app_melo.py` — MeloTTS 版（中文效果更好，需下载 ~500MB 模型）
- `app_mlx.py` — MLX 版（Apple Silicon 加速）

**启动方式**
```bash
uv run app.py          # Edge TTS 版
uv run app_melo.py     # MeloTTS 版
```

---

## 代码质量原则（针对本项目）

### 函数分解（原则 1、5）
每个函数只做一件事。`fetch_article`、`summarize_with_kimi`、`text_to_speech` 等职责已分离，修改时不要把多个步骤合并进同一个函数。

### 命名（原则 2、8、12）
- 函数名描述**做什么**，不描述怎么做：`fetch_article` 好过 `http_get_and_parse`
- 变量名描述**角色**：`script` 不是 `script_string`，`article` 不是 `article_dict`
- 布尔变量/函数用 `is_` / `has_` 前缀

### 提前返回，避免深层嵌套（原则 9）
```python
# 好
def on_generate_script(url, api_key, style):
    if not api_key:
        return "", "❌ 缺少 API Key"
    if not url:
        return "", "❌ 缺少链接"
    # 主逻辑...

# 避免
def on_generate_script(url, api_key, style):
    if api_key:
        if url:
            # 主逻辑嵌套在里面...
```

### 查询与命令分离（原则 10）
- 返回数据的函数不产生副作用：`fetch_article` 只抓取，不写文件
- 修改状态的函数（如缓存 TTS 模型）清楚地命名为 `load_*` / `init_*`

### 延迟初始化（原则 18）
MeloTTS 模型用全局懒加载模式，首次调用时才加载。新增重型资源（大模型、数据库连接）同样使用此模式，不要在模块级直接初始化。

### 常量不写魔法数字（原则 19）
```python
# 好
MAX_ARTICLE_CHARS = 8000
MAX_SCRIPT_TOKENS = 3000

# 避免
content = content[:8000]
max_tokens=3000
```

### 不要重复 `fetch_article`（原则 6）
`app.py`、`app_melo.py`、`app_mlx.py` 三个文件都有相同的抓取逻辑。如果需要改动抓取行为，应提取到共享模块 `scraper.py`，而不是三处同步修改。

### 注释只写"为什么"（原则 3）
```python
# 好：解释意图
# 尝试多个选择器以兼容不同 CMS 结构
for selector in article_selectors:

# 避免：重复代码
# 遍历选择器列表
for selector in article_selectors:
```

### 错误处理只在边界（原则 9）
- 在 `fetch_article`、`summarize_with_kimi`、`text_to_speech` 这些外部调用边界捕获异常
- 内部函数之间不需要防御性 try/except，信任已验证的输入

### Gradio 回调保持纯净（原则 1、10）
`on_generate_script` 和 `on_generate_audio` 只负责协调调用，不包含业务逻辑。业务逻辑放在独立函数里，方便测试和复用。

---

## 项目结构约定

```
ai-boardcast/
├── app.py          # Edge TTS 版（主入口）
├── app_melo.py     # MeloTTS 版
├── app_mlx.py      # MLX 版
├── pyproject.toml  # 依赖管理（uv）
└── start.sh        # 启动脚本
```

如果项目扩展，提取共享逻辑时建议：
- `scraper.py` — 文章抓取
- `llm.py` — Kimi API 调用
- `tts/` — 各 TTS 后端

---

## 依赖管理

使用 `uv`，不要用 `pip install` 直接安装。

```bash
uv add <package>         # 添加依赖
uv run <script>          # 运行脚本
```

可选依赖组：
- `edgetts` — Edge TTS
- `mlx` — Apple Silicon MLX 推理
