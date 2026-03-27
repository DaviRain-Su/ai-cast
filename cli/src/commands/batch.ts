import { readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import chalk from "chalk";
import { log, outputResult } from "../output.js";
import { handleError } from "../utils.js";
import { fetchCommand } from "./fetch.js";
import { scriptCommand } from "./script.js";
import { speakCommand } from "./speak.js";
import { publishCommand } from "./publish.js";
import { setJsonMode, isJsonMode } from "../output.js";

export async function batchCommand(options: {
  file: string;
  style: string;
  voice: string;
  tags?: string;
  tier: string;
  aggregate?: boolean;
}) {
  // 读取 URL 列表
  let lines: string[];
  try {
    lines = readFileSync(options.file, "utf-8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
  } catch (err) {
    handleError("无法读取 URL 列表文件", err);
  }

  if (lines.length === 0) {
    handleError("URL 列表为空", new Error(options.file));
  }

  log(chalk.bold(`\n🎙️  批量发布 — ${lines.length} 个 URL\n`));
  log(`  模式:  ${options.aggregate ? "聚合为一期" : "分别发布"}`);
  log(`  风格:  ${options.style}`);
  log(`  声音:  ${options.voice}`);
  if (options.tags) log(`  标签:  ${options.tags}`);
  log();

  const results: any[] = [];

  if (options.aggregate) {
    // 聚合模式 — 所有 URL 合成一期播客
    log(chalk.dim("=== 聚合模式: 所有文章合并为一期播客 ===\n"));

    const tmpDir = join(tmpdir(), `ai-cast-batch-${Date.now()}`);
    const articlesPath = join(tmpDir, "articles.json");
    const scriptPath = join(tmpDir, "script.txt");
    const audioPath = join(tmpDir, "episode.wav");

    // 创建临时目录
    const { mkdirSync } = await import("fs");
    mkdirSync(tmpDir, { recursive: true });

    // 保存原始 JSON 模式
    const wasJson = isJsonMode();
    setJsonMode(false); // 批量模式中间步骤用人类输出

    try {
      // Step 1: 抓取所有文章
      await fetchCommand({ url: lines, output: articlesPath });

      // Step 2: 生成脚本
      await scriptCommand({ input: articlesPath, style: options.style, output: scriptPath });

      // Step 3: 合成语音
      await speakCommand({ input: scriptPath, voice: options.voice, output: audioPath });

      // Step 4: 发布
      setJsonMode(wasJson);
      const title = `聚合播客 — ${lines.length} 篇文章`;
      await publishCommand({
        audio: audioPath,
        script: scriptPath,
        title,
        style: options.style,
        tags: options.tags,
        tier: options.tier,
        sourceUrl: lines[0],
      });
    } catch (err) {
      setJsonMode(wasJson);
      handleError("批量聚合失败", err);
    }
  } else {
    // 分别发布模式 — 每个 URL 单独一期
    for (let i = 0; i < lines.length; i++) {
      const url = lines[i];
      log(chalk.bold(`\n--- [${i + 1}/${lines.length}] ${url} ---\n`));

      const tmpDir = join(tmpdir(), `ai-cast-batch-${Date.now()}-${i}`);
      const articlesPath = join(tmpDir, "articles.json");
      const scriptPath = join(tmpDir, "script.txt");
      const audioPath = join(tmpDir, "episode.wav");

      const { mkdirSync } = await import("fs");
      mkdirSync(tmpDir, { recursive: true });

      try {
        await fetchCommand({ url: [url], output: articlesPath });

        // 从文章中提取标题
        const articles = JSON.parse(readFileSync(articlesPath, "utf-8"));
        const title = articles.articles?.[0]?.title ?? `播客 ${i + 1}`;

        await scriptCommand({ input: articlesPath, style: options.style, output: scriptPath });
        await speakCommand({ input: scriptPath, voice: options.voice, output: audioPath });
        await publishCommand({
          audio: audioPath,
          script: scriptPath,
          title,
          style: options.style,
          tags: options.tags,
          tier: options.tier,
          sourceUrl: url,
        });

        results.push({ url, title, status: "ok" });
      } catch (err) {
        log(chalk.red(`  ✗ 跳过: ${(err as Error).message}`));
        results.push({ url, status: "error", error: (err as Error).message });
      }
    }

    log(chalk.bold(`\n=== 批量完成 ===`));
    const ok = results.filter((r) => r.status === "ok").length;
    const fail = results.filter((r) => r.status === "error").length;
    log(`  成功: ${chalk.green(ok)}  失败: ${fail > 0 ? chalk.red(fail) : "0"}`);
    log();

    outputResult({
      status: fail === 0 ? "ok" : "partial",
      total: lines.length,
      success: ok,
      failed: fail,
      results,
    });
  }
}
