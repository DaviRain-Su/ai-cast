import "dotenv/config";
import express from "express";
import { createReadStream } from "fs";
import { resolve } from "path";
import { fetchArticle } from "./scraper.js";
import { generatePodcastScript } from "./llm.js";
import { textToSpeech, VOICES } from "./tts.js";

// 清除代理变量，防止 localhost 请求被拦截
for (const key of ["http_proxy", "https_proxy", "HTTP_PROXY", "HTTPS_PROXY"]) {
  delete process.env[key];
}
process.env.no_proxy = "localhost,127.0.0.1";
process.env.NO_PROXY = "localhost,127.0.0.1";

const app = express();
app.use(express.json());
app.use(express.static(resolve("src/public")));

app.get("/api/voices", (_req, res) => {
  res.json(VOICES);
});

app.post("/api/generate-script", async (req, res) => {
  const { url, style } = req.body as { url: string; style: string };

  if (!process.env.KIMI_API_KEY) {
    res.status(500).json({ error: "未设置 KIMI_API_KEY 环境变量" });
    return;
  }
  if (!url) {
    res.status(400).json({ error: "缺少文章链接" });
    return;
  }

  try {
    const article = await fetchArticle(url);
    const script = await generatePodcastScript(article.content, style);
    res.json({ script, title: article.title });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.post("/api/generate-audio", async (req, res) => {
  const { script, voice } = req.body as { script: string; voice: string };

  if (!script) {
    res.status(400).json({ error: "缺少脚本内容" });
    return;
  }

  try {
    const { path: audioPath, contentType } = await textToSpeech(
      script,
      voice ?? "serena"
    );
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", 'attachment; filename="podcast.wav"');
    createReadStream(audioPath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

const PORT = Number(process.env.PORT ?? 7868);
app.listen(PORT, "0.0.0.0", () => {
  console.log("🎙️  AI Podcast - TypeScript 版");
  console.log("=".repeat(40));
  console.log(`🚀 运行在: http://127.0.0.1:${PORT}`);
});
