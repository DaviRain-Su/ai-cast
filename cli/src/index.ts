#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { profileCreateCommand } from "./commands/profile.js";
import { publishCommand } from "./commands/publish.js";
import { listCommand } from "./commands/list.js";
import { balanceCommand } from "./commands/balance.js";
import { fetchCommand } from "./commands/fetch.js";
import { scriptCommand } from "./commands/script.js";
import { speakCommand } from "./commands/speak.js";
import { setJsonMode } from "./output.js";

const program = new Command();

program
  .name("ai-cast")
  .description("AI-Cast CLI — generate and publish AI podcasts to Sui/Walrus")
  .version("0.2.0")
  .option("--json", "输出 JSON 格式（适合 Agent 和脚本调用）")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.json) setJsonMode(true);
  });

// === 生成流程 ===

// ai-cast fetch
program
  .command("fetch")
  .description("抓取文章内容（支持多 URL 聚合）")
  .requiredOption("-u, --url <urls...>", "文章 URL（可多个）")
  .option("-o, --output <path>", "输出文件路径", "articles.json")
  .action(fetchCommand);

// ai-cast script
program
  .command("script")
  .description("从文章生成播客脚本（调用 LLM）")
  .requiredOption("-i, --input <path>", "输入文章 JSON 文件（fetch 命令输出）")
  .option("-s, --style <style>", "播客风格 (deep_dive/news/story/interview)", "deep_dive")
  .option("-o, --output <path>", "输出脚本文件路径", "script.txt")
  .action(scriptCommand);

// ai-cast speak
program
  .command("speak")
  .description("将脚本合成为语音音频（MLX TTS）")
  .requiredOption("-i, --input <path>", "输入脚本文件（script 命令输出）")
  .option("-v, --voice <voice>", "声音 (serena/vivian/sohee/ryan/aiden/eric/dylan)", "serena")
  .option("-o, --output <path>", "输出音频文件路径")
  .option("-l, --lang <lang>", "语言代码", "zh")
  .action(speakCommand);

// === 发布流程 ===

// ai-cast publish
program
  .command("publish")
  .description("发布播客到 Walrus 和 Sui")
  .requiredOption("-a, --audio <path>", "音频文件路径 (.wav/.mp3/.opus)")
  .option("-s, --script <path>", "文字稿文件路径")
  .requiredOption("-t, --title <title>", "播客标题")
  .option("-d, --description <desc>", "播客描述")
  .option("--style <style>", "播客风格 (deep_dive/news/story/interview)", "deep_dive")
  .option("--source-url <url>", "原始文章 URL")
  .option("--tier <tier>", "免费或付费 (free/premium)", "free")
  .option("--retention <epochs>", "Walrus 存储周期数", "5")
  .action(publishCommand);

// === 账户管理 ===

// ai-cast init
program
  .command("init")
  .description("初始化 CLI 配置，连接 Sui 钱包")
  .option("-n, --network <network>", "Sui 网络 (testnet/mainnet/devnet)", "testnet")
  .option("-p, --package-id <id>", "合约 Package ID")
  .option("-k, --keystore <path>", "Sui keystore 路径")
  .action(initCommand);

// ai-cast profile create
const profile = program
  .command("profile")
  .description("管理创作者档案");

profile
  .command("create")
  .description("创建链上创作者档案")
  .requiredOption("--name <name>", "创作者名称")
  .option("--bio <bio>", "个人简介", "")
  .action(profileCreateCommand);

// ai-cast list
program
  .command("list")
  .description("列出已发布的播客")
  .action(listCommand);

// ai-cast balance
program
  .command("balance")
  .description("查看 SUI 余额和收入统计")
  .action(balanceCommand);

program.parse();
