import { readFileSync, existsSync, unlinkSync, statSync } from "fs";
import { execFileSync } from "child_process";
import { tmpdir } from "os";
import { join, extname } from "path";
import chalk from "chalk";
import { Transaction } from "@mysten/sui/transactions";
import { loadConfig } from "../config.js";
import { getAddress, signAndExecute } from "../sui.js";
import { uploadBlob } from "../walrus.js";
import { encryptWithSeal } from "../seal.js";
import { log, outputResult, outputError } from "../output.js";

const MAX_AUDIO_SIZE = 500 * 1024 * 1024; // 500MB

function convertToOpus(inputPath: string): Uint8Array {
  const outputPath = join(tmpdir(), `ai-cast-${Date.now()}.opus`);
  try {
    // 使用 execFileSync 避免命令注入
    execFileSync("ffmpeg", ["-i", inputPath, "-c:a", "libopus", "-b:a", "64k", "-y", outputPath], {
      stdio: "pipe",
    });
    const data = readFileSync(outputPath);
    try { unlinkSync(outputPath); } catch {}
    return new Uint8Array(data);
  } catch (err) {
    throw new Error(`ffmpeg 转换失败，请确保已安装 ffmpeg: ${(err as Error).message}`);
  }
}

function getAudioDuration(filePath: string): number {
  try {
    // 使用 execFileSync 避免命令注入
    const output = execFileSync("ffprobe", [
      "-i", filePath,
      "-show_entries", "format=duration",
      "-v", "quiet",
      "-of", "csv=p=0",
    ], { encoding: "utf-8" }).trim();
    const duration = Math.round(parseFloat(output));
    return Number.isNaN(duration) ? 0 : duration;
  } catch {
    return 0;
  }
}

export async function publishCommand(options: {
  audio: string;
  script?: string;
  title: string;
  description?: string;
  style?: string;
  sourceUrl?: string;
  tier?: string;
  retention?: string;
}) {
  const config = loadConfig();
  if (!config.packageId) {
    outputError("尚未设置 packageId", "请先运行 ai-cast init --package-id <ID>");
    log(chalk.red("✗ 尚未设置 packageId"));
    process.exit(1);
  }

  if (!existsSync(options.audio)) {
    outputError("音频文件不存在", options.audio);
    log(chalk.red(`✗ 音频文件不存在: ${options.audio}`));
    process.exit(1);
  }

  const fileSize = statSync(options.audio).size;
  if (fileSize > MAX_AUDIO_SIZE) {
    outputError("音频文件过大", `${(fileSize / 1024 / 1024).toFixed(0)}MB 超过 500MB 限制`);
    log(chalk.red(`✗ 音频文件过大: ${(fileSize / 1024 / 1024).toFixed(0)}MB (最大 500MB)`));
    process.exit(1);
  }

  if (options.script && !existsSync(options.script)) {
    outputError("文字稿文件不存在", options.script);
    log(chalk.red(`✗ 文字稿文件不存在: ${options.script}`));
    process.exit(1);
  }

  const address = getAddress(config);
  const tier = options.tier === "premium" ? 1 : 0;
  const retention = parseInt(options.retention ?? "5");
  const style = options.style ?? "deep_dive";
  const description = options.description ?? "";

  log(chalk.bold("\n🎙️  发布播客\n"));
  log("  创作者:", chalk.cyan(address));
  log("  标题:  ", options.title);
  log("  风格:  ", style);
  log("  级别:  ", tier === 0 ? chalk.green("免费") : chalk.yellow("付费"));
  log("  存储:  ", `${retention} 个 epoch`);
  log();

  // Step 1: 转换音频格式
  const ext = extname(options.audio).toLowerCase();
  let audioData: Uint8Array;

  if (ext === ".wav") {
    log(chalk.dim("⏳ 转换 WAV → Opus..."));
    audioData = convertToOpus(options.audio);
    log(chalk.green(`✓ 转换完成 (${(audioData.length / 1024 / 1024).toFixed(1)} MB)`));
  } else {
    audioData = new Uint8Array(readFileSync(options.audio));
    log(chalk.dim(`  音频大小: ${(audioData.length / 1024 / 1024).toFixed(1)} MB`));
  }

  const durationSecs = getAudioDuration(options.audio);
  if (durationSecs > 0) {
    const mins = Math.floor(durationSecs / 60);
    const secs = durationSecs % 60;
    log(chalk.dim(`  时长: ${mins}:${secs.toString().padStart(2, "0")}`));
  }

  // Step 2: SEAL 加密（仅付费内容）
  if (tier === 1) {
    log(chalk.dim("\n⏳ SEAL 加密音频..."));
    try {
      const { encryptedData } = await encryptWithSeal(audioData, address);
      audioData = encryptedData;
      log(chalk.green(`✓ 加密完成 (${(audioData.length / 1024 / 1024).toFixed(1)} MB)`));
    } catch (err) {
      log(chalk.red("✗ SEAL 加密失败"));
      log(chalk.dim(`  ${(err as Error).message}`));
      log(chalk.dim("  将以未加密方式上传"));
    }
  }

  // Step 3: 上传音频到 Walrus
  log(chalk.dim("\n⏳ 上传音频到 Walrus..."));
  const audioResult = await uploadBlob(audioData, { epochs: retention });
  log(chalk.green("✓ 音频已上传"));
  log("  Blob ID:", chalk.cyan(audioResult.blobId));

  // Step 4: 上传文字稿到 Walrus（可选）
  let scriptBlobId: string | null = null;
  if (options.script) {
    log(chalk.dim("\n⏳ 上传文字稿到 Walrus..."));
    const scriptData = new Uint8Array(readFileSync(options.script));
    const scriptResult = await uploadBlob(scriptData, { epochs: retention });
    scriptBlobId = scriptResult.blobId;
    log(chalk.green("✓ 文字稿已上传"));
    log("  Blob ID:", chalk.cyan(scriptBlobId));
  }

  // Step 5: 创建链上播客记录
  log(chalk.dim("\n⏳ 注册到 Sui 链上..."));

  const tx = new Transaction();
  const podcast = tx.moveCall({
    target: `${config.packageId}::podcast::publish`,
    arguments: [
      tx.pure.string(options.title),
      tx.pure.string(description),
      tx.pure.string(audioResult.blobId),
      tx.pure.option("string", scriptBlobId),
      tx.pure.option("string", null),
      tx.pure.u64(durationSecs),
      tx.pure.string(style),
      tx.pure.option("string", options.sourceUrl ?? null),
      tx.pure.u8(tier),
    ],
  });
  tx.transferObjects([podcast], address);

  try {
    const result = await signAndExecute(tx);
    const podcastObj = result.objectChanges?.find(
      (c) => c.type === "created" && c.objectType.includes("Podcast")
    );
    const podcastId = podcastObj?.type === "created" ? podcastObj.objectId : null;

    log(chalk.green("\n✓ 播客发布成功！\n"));
    if (podcastId) log("  Podcast ID: ", chalk.cyan(podcastId));
    log("  Audio Blob:  ", chalk.cyan(audioResult.blobId));
    if (scriptBlobId) log("  Script Blob: ", chalk.cyan(scriptBlobId));
    log("  Tx Digest:   ", chalk.dim(result.digest));
    log();

    outputResult({
      status: "ok",
      podcastId,
      audioBlobId: audioResult.blobId,
      scriptBlobId,
      digest: result.digest,
      creator: address,
      title: options.title,
      style,
      tier: tier === 0 ? "free" : "premium",
      durationSecs,
    });
  } catch (err) {
    outputError("链上注册失败", (err as Error).message);
    log(chalk.red("\n✗ 链上注册失败"));
    log(chalk.dim(`  ${(err as Error).message}`));
    log(chalk.dim("  音频已上传到 Walrus，可手动重试链上注册"));
    process.exit(1);
  }
}
