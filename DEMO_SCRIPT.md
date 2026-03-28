# AI-CAST Demo Day 脚本

> ⏱️ 总时长: 7 分钟
> 🎯 目标: 展示 Agent-First 设计理念 + 完整产品功能

---

## 开场 (30s)

**[Slide 1 - 封面]**

"大家好，我是 DavidRain。今天介绍 AI-CAST——

一个为 AI Agent 经济构建的去中心化播客平台。

我们解决一个简单问题：
文章太多看不完？让 AI 帮你转成播客，上链存储，随时听。"

---

## 问题 (30s)

**[Slide 2 - 问题]**

"有三个痛点：
1. 内容爆炸——文章、论文、新闻堆积如山
2. 音频缺口——没有简单方式把文字转成高质量音频
3. AI Agent 需求——Agent 也需要消费音频内容

我们需要一个桥接文字和音频的基础设施。"

---

## 解决方案 (1min)

**[Slide 3 - Pipeline]**

"AI-CAST 的解决方案是一个完全去中心化的流水线：

文章 URL → 抓取 → LLM 生成脚本 → 语音合成 → Walrus 存储 → Sui 上链 → 播客播放器

输入文章，输出播客。全程自动化。"

---

## Agent-First 设计 (1.5min) ⭐ 重点

**[Slide - Agent Quick Start]**

"关键创新：这是为 AI Agent 设计的，不是人类优先。

传统平台：人类点按钮 → 等待 → 下载
AI-CAST：Agent 一行命令 → 获得 JSON → 自动处理

看这个例子：
```bash
npx ai-cast-cli batch \
  --url https://example.com/article \
  --title "AI News" \
  --voice serena \
  --publish
```

输出是机器可读的 JSON，Agent 可以解析并自动处理。"

---

## 技术架构 (1min)

**[Slide 6-7 - 架构 + 合约]**

"技术栈：
- Sui 区块链——对象导向，适合资源管理
- Walrus——去中心化存储音频文件
- MLX TTS——Apple Silicon 优化的语音合成
- Move 语言——5 个合约模块

合约已部署在 Testnet：
0x10c32...a7f2214"

---

## 变现模式 (30s)

**[Slide 5 - 变现]**

"创作者可以通过三种方式变现：
1. 直接打赏——听众用 SUI 打赏
2. 订阅制——按周期付费访问内容
3. premium 内容——SEAL 加密，只有订阅者能解密

全部链上，没有中间商。"

---

## Web 平台展示 (1min)

**[Slide 8 - Web 平台]**

"除了 CLI，我们还有美观的 Web 界面：

- 发现页——搜索、筛选播客
- 黑胶唱片播放器——视觉化体验
- 创作者主页——订阅和打赏
- 移动端适配"

---

## 进展和路线图 (30s)

**[Slide 10 - 路线图]**

"已完成：
✅ 5 个智能合约
✅ 8 个 CLI 命令
✅ Next.js Web 平台
✅ npm 包发布

下一步：
🔲 X-Layer/Mainnet 部署
🔲 多语言 TTS
🔲 创作者分析面板"

---

## 结尾 (30s)

**[Slide 12 - 感谢]**

"总结：
AI-CAST 是 Agent 经济的音频基础设施。

一行命令，文章变播客，上链存储，自主变现。

代码开源，欢迎试用：
- GitHub: github.com/DaviRain-Su/ai-cast
- npm: npx ai-cast-cli

谢谢！"

---

## 评委可能的问题

**Q: 和现有播客平台有什么区别？**
A: 现有平台都是人类优先。AI-CAST 是 Agent-First——CLI 输出 JSON，让 AI Agent 能自主操作。

**Q: 为什么用 Sui？**
A: Sui 的对象模型非常适合管理播客资源，而且 Walrus 存储和 Sui 生态整合很好。

**Q: 怎么防止滥用？**
A: 创作者需要质押 SUI 才能发布，恶意内容可以被举报下架。
