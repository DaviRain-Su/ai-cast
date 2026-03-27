import { writeFileSync } from "fs";
import * as cheerio from "cheerio";
import chalk from "chalk";
import { log, outputResult } from "../output.js";
import { handleError } from "../utils.js";

const ARTICLE_SELECTORS = [
  "article",
  '[class*="article"]',
  '[class*="content"]',
  '[class*="post"]',
  "main",
  ".entry-content",
  "#content",
  ".post-content",
];

const MAX_CHARS = 8000;

export interface Article {
  title: string;
  content: string;
  url: string;
  fetchedAt: string;
}

async function fetchOneArticle(url: string): Promise<Article> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const title = $("h1").first().text().trim() || "未命名文章";

  let content = "";
  for (const selector of ARTICLE_SELECTORS) {
    const el = $(selector).first();
    if (el.length) {
      el.find("script, style, nav, footer").remove();
      content = el.text().replace(/\n+/g, "\n").trim();
      if (content.length > 500) break;
    }
  }

  if (!content) {
    $("script, style, nav, footer").remove();
    content = $("body").text().replace(/\n+/g, "\n").trim();
  }

  return {
    title,
    content: content.slice(0, MAX_CHARS),
    url,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchCommand(options: {
  url: string[];
  output?: string;
}) {
  const urls = options.url;
  if (!urls || urls.length === 0) {
    handleError("至少需要一个 URL", new Error("使用 -u <url> 指定"));
  }

  log(chalk.bold("\n🎙️  抓取文章\n"));

  const articles: Article[] = [];

  for (const url of urls) {
    log(chalk.dim(`⏳ 抓取 ${url}...`));
    try {
      const article = await fetchOneArticle(url);
      articles.push(article);
      log(chalk.green(`✓ ${article.title}`));
      log(chalk.dim(`  ${article.content.length} 字符`));
    } catch (err) {
      log(chalk.red(`✗ 抓取失败: ${(err as Error).message}`));
    }
  }

  if (articles.length === 0) {
    handleError("所有 URL 抓取失败", new Error("请检查 URL 是否可访问"));
  }

  // 输出文件
  const outputPath = options.output ?? "articles.json";
  const data = { articles, count: articles.length };
  writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");

  log();
  log(chalk.green(`✓ 已保存到 ${outputPath}`));
  log(chalk.dim(`  ${articles.length} 篇文章, ${articles.reduce((s, a) => s + a.content.length, 0)} 字符`));
  log();

  outputResult({
    status: "ok",
    output: outputPath,
    count: articles.length,
    articles: articles.map((a) => ({
      title: a.title,
      url: a.url,
      chars: a.content.length,
    })),
  });
}
