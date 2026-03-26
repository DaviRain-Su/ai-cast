import {
  complete,
  registerBuiltInApiProviders,
  type Model,
  type Context,
} from "@mariozechner/pi-ai";

registerBuiltInApiProviders();

const STYLE_PROMPTS: Record<string, string> = {
  deep_dive: "深度解读风格：逻辑清晰，层层递进",
  news: "新闻资讯风格：节奏快，信息密度高",
  story: "故事叙事风格：情感丰富，引人入胜",
  interview: "对话访谈风格：轻松自然",
};

// 使用 Kimi coding 接口（Anthropic 兼容格式）
const kimiModel: Model<"anthropic-messages"> = {
  id: "claude-sonnet-4-5",
  name: "Kimi (Claude Sonnet)",
  api: "anthropic-messages",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: "kimi" as any,
  baseUrl: "https://api.kimi.com/coding",
  reasoning: false,
  input: ["text"],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 200000,
  maxTokens: 8096,
};

export async function generatePodcastScript(
  articleContent: string,
  style = "deep_dive"
): Promise<string> {
  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) throw new Error("未设置 KIMI_API_KEY 环境变量");

  const styleDesc = STYLE_PROMPTS[style] ?? STYLE_PROMPTS.deep_dive;

  const context: Context = {
    systemPrompt: `你是一个专业的播客主持人，负责将文章改写为播客独白脚本。

风格要求：${styleDesc}

输出要求：
1. 将文章转化为 5-8 分钟的播客独白，由一位主持人讲述
2. 使用口语化表达，像朋友聊天一样自然流畅
3. 结构：开场白（30秒）→ 正文（分段展开）→ 结尾（30秒）
4. 【重要】只输出纯文本，不要使用任何 Markdown 格式（不要 **加粗**、不要 # 标题、不要 --- 分隔线、不要列表符号）
5. 不要输出任何章节标签、提示词或说明文字，直接是主持人的台词
6. 保留原文核心观点

直接输出主持人台词，不含任何格式符号。`,
    messages: [
      {
        role: "user",
        content: `请将以下内容转化为播客脚本：\n\n${articleContent.slice(0, 6000)}`,
        timestamp: Date.now(),
      },
    ],
  };

  const result = await complete(kimiModel, context, {
    apiKey,
    maxTokens: 3000,
  });

  return result.content
    .filter((c): c is { type: "text"; text: string } => c.type === "text")
    .map((c) => c.text)
    .join("");
}
