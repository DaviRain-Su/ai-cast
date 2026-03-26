import * as cheerio from "cheerio";

export interface Article {
  title: string;
  content: string;
  url: string;
}

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

export async function fetchArticle(url: string): Promise<Article> {
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

  return { title, content: content.slice(0, 8000), url };
}
