# Batch — 批量生成并发布

从 URL 列表文件批量生成播客，支持两种模式。

## 准备 URL 列表

创建文本文件，每行一个 URL，`#` 开头为注释：

```
# 本周 AI 相关文章
https://example.com/article-1
https://example.com/article-2
https://example.com/article-3
```

## 模式一：分别发布（默认）

每个 URL 生成一期独立播客：

```bash
npx ai-cast-cli --json batch \
  -f urls.txt \
  --style deep_dive \
  --voice serena \
  --tags ai,weekly
```

输出：
```json
{
  "status": "ok",
  "total": 3,
  "success": 3,
  "failed": 0,
  "results": [
    {"url": "https://...", "title": "Article 1", "status": "ok"},
    {"url": "https://...", "title": "Article 2", "status": "ok"},
    {"url": "https://...", "title": "Article 3", "status": "ok"}
  ]
}
```

失败的 URL 会跳过并继续，不会中断整个批次。

## 模式二：聚合发布

所有 URL 合并为一期综合播客（适合周报/汇总）：

```bash
npx ai-cast-cli --json batch \
  -f urls.txt \
  --aggregate \
  --style news \
  --voice ryan \
  --tags weekly,summary
```

LLM 会综合所有文章内容，找出共同主题和差异，生成一期聚合解读。

## 选项

| 选项 | 说明 |
|------|------|
| `-f, --file` | URL 列表文件路径（必需） |
| `--style` | 播客风格（默认 deep_dive） |
| `--voice` | 声音（默认 serena） |
| `--tags` | 标签，逗号分隔 |
| `--tier` | free / premium |
| `--aggregate` | 聚合为一期（默认分别发布） |

## 典型用法

### 日报

每天收集当日文章 URL，批量分别发布：
```bash
npx ai-cast-cli --json batch -f today-urls.txt --style news --tags daily
```

### 周刊

每周收集重要文章，聚合为一期周报播客：
```bash
npx ai-cast-cli --json batch -f weekly-urls.txt --aggregate --style deep_dive --tags weekly
```
