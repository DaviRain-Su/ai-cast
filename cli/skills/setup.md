# Setup — 首次环境安装

在使用 ai-cast 之前，必须完成以下设置步骤。

## 前置条件

- macOS（Apple Silicon 推荐，MLX TTS 加速）
- Node.js >= 18
- Sui 钱包（`sui client` 已初始化）

## 步骤

### 1. 检查环境

```bash
npx ai-cast-cli --json install --check
```

输出示例：
```json
{
  "status": "ok",
  "checks": [
    {"name": "Node.js", "status": "ok", "detail": "v20.0.0"},
    {"name": "ffmpeg", "status": "ok"},
    {"name": "Python", "status": "ok"},
    {"name": "uv", "status": "ok"},
    {"name": "Sui CLI", "status": "ok"},
    {"name": "mlx-audio", "status": "ok"},
    {"name": "TTS 模型", "status": "ok"}
  ],
  "missingCount": 0
}
```

如果有 `"status": "missing"` 的项，运行安装：

### 2. 安装缺失依赖

```bash
npx ai-cast-cli install
```

自动安装 uv、mlx-audio、下载 TTS 模型（~500MB，首次需几分钟）。

### 3. 初始化钱包连接

```bash
npx ai-cast-cli --json init --package-id 0x10c32bf076865c211bec10e170e2640d08e3515a957754cfdeac890b5a7f2214
```

或通过环境变量（免交互）：
```bash
export AI_CAST_PACKAGE_ID=0x10c32bf076865c211bec10e170e2640d08e3515a957754cfdeac890b5a7f2214
export AI_CAST_KEYSTORE=~/.sui/sui_config/sui.keystore
```

### 4. 创建创作者档案

```bash
npx ai-cast-cli --json profile create --name "播客名称" --bio "简介" --category tech
```

类别: `tech` / `finance` / `news` / `culture` / `education` / `entertainment`

输出：
```json
{"status": "ok", "objectId": "0x...", "digest": "...", "address": "0x..."}
```

## 验证

设置完成后，运行以下命令确认一切正常：
```bash
npx ai-cast-cli --json list
```

应返回 `{"status": "ok", "podcasts": []}`.
