import chalk from "chalk";
import { log, outputError } from "./output.js";
import { loadConfig, type AiCastConfig } from "./config.js";

/**
 * 统一错误处理 — 同时输出人类可读和 JSON 格式
 */
export function handleError(title: string, err: unknown): never {
  const message = err instanceof Error ? err.message : String(err);
  outputError(title, message);
  log(chalk.red(`✗ ${title}`));
  log(chalk.dim(`  ${message}`));
  process.exit(1);
}

/**
 * 加载配置并验证 packageId 存在
 */
export function loadConfigWithPackageId(): AiCastConfig & { packageId: string } {
  const config = loadConfig();
  if (!config.packageId) {
    handleError("尚未设置 packageId", new Error("请先运行 ai-cast init --package-id <ID>"));
  }
  return config as AiCastConfig & { packageId: string };
}

/**
 * 格式化秒数为 m:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
