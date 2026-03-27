import { readFileSync, writeFileSync } from "fs";
import chalk from "chalk";
import {
  complete,
  registerBuiltInApiProviders,
  type Model,
  type Context,
} from "@mariozechner/pi-ai";
import { log, outputResult } from "../output.js";
import { handleError } from "../utils.js";
import type { Article } from "./fetch.js";

registerBuiltInApiProviders();

const STYLE_PROMPTS: Record<string, string> = {
  deep_dive: "深度解读风格：逻辑清晰，层层递进",
  news: "新闻资讯风格：节奏快，信息密度高",
  story: "故事叙事风格：情感丰富，引人入胜",
  interview: "对话访谈风格：轻松自然",
};

const kimiModel: Model<"anthropic-messages"> = {
  id: "claude-sonnet-4-5",
  name: "Kimi (Claude Sonnet)",
  api: "anthropic-messages",
  provider: "kimi" as any,
  baseUrl: "https://api.kimi.com/coding",
  reasoning: false,
  input: ["text"],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 200000,
  maxTokens: 8096,
};

function buildPrompt(articles: Article[], style: string): string {
  const styleDesc = STYLE_PROMPTS[style] ?? STYLE_PROMPTS.deep_dive;

  if (articles.length === 1) {
    return `请将以下内容转化为播客脚本：\n\n${articles[0].content.slice(0, 6000)}`;
  }

  // 多源聚合模式
  let prompt = `请将以下 ${articles.length} 篇文章的内容综合总结，生成一期聚合解读播客脚本。\n`;
  prompt += `要求：覆盖各篇文章的核心观点，找出共同主题和差异，进行综合分析。\n\n`;

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const maxPerArticle = Math.floor(6000 / articles.length);
    prompt += `--- 文章 ${i + 1}: ${a.title} ---\n`;
    prompt += `${a.content.slice(0, maxPerArticle)}\n\n`;
  }

  return prompt;
}

export async function scriptCommand(options: {
  input: string;
  style: string;
  output?: string;
}) {
  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    handleError("未设置 KIMI_API_KEY 环境变量", new Error("export KIMI_API_KEY=sk-你的密钥"));
  }

  log(chalk.bold("\n🎙️  生成播客脚本\n"));

  // 读取文章
  let articles: Article[];
  try {
    const raw = readFileSync(options.input, "utf-8");
    const data = JSON.parse(raw);
    articles = data.articles ?? [data];
  } catch (err) {
    handleError("无法读取输入文件", err);
  }

  log(`  输入:  ${articles.length} 篇文章`);
  log(`  风格:  ${STYLE_PROMPTS[options.style] ?? options.style}`);
  log();

  const styleDesc = STYLE_PROMPTS[options.style] ?? STYLE_PROMPTS.deep_dive;

  const systemPrompt = `你是一个专业的播客主持人，负责将文章改写为播客独白脚本。

风格要求：${styleDesc}

输出要求：
1. 将文章转化为 5-8 分钟的播客独白，由一位主持人讲述
2. 使用口语化表达，像朋友聊天一样自然流畅
3. 结构：开场白（30秒）→ 正文（分段展开）→ 结尾（30秒）
4. 【重要】只输出纯文本，不要使用任何 Markdown 格式
5. 不要输出任何章节标签、提示词或说明文字，直接是主持人的台词
6. 保留原文核心观点

直接输出主持人台词，不含任何格式符号。`;

  const userContent = buildPrompt(articles, options.style);

  log(chalk.dim("⏳ 调用 LLM 生成脚本..."));

  try {
    const context: Context = {
      systemPrompt,
      messages: [
        { role: "user", content: userContent, timestamp: Date.now() },
      ],
    };

    const result = await complete(kimiModel, context, {
      apiKey,
      maxTokens: 3000,
    });

    const script = result.content
      .filter((c): c is { type: "text"; text: string } => c.type === "text")
      .map((c) => c.text)
      .join("");

    // 输出脚本文件
    const outputPath = options.output ?? "script.txt";
    writeFileSync(outputPath, script, "utf-8");

    log(chalk.green(`\n✓ 脚本已生成`));
    log(chalk.dim(`  ${script.length} 字符 → ${outputPath}`));
    log();

    outputResult({
      status: "ok",
      output: outputPath,
      chars: script.length,
      style: options.style,
      sourceCount: articles.length,
      titles: articles.map((a) => a.title),
    });
  } catch (err) {
    handleError("LLM 脚本生成失败", err);
  }
}
