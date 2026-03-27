import { readFileSync } from "fs";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { join } from "path";
import chalk from "chalk";
import { log, outputResult } from "../output.js";
import { handleError } from "../utils.js";

const execFileAsync = promisify(execFile);

const MODEL =
  process.env.TTS_MODEL_PATH ??
  `${process.env.HOME}/.cache/huggingface/hub/models--mlx-community--Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit/snapshots/41d3337e8b7f2843a75841595fc14e4b9a7a4b96`;

const VOICES = [
  "serena", "vivian", "sohee",  // 女声
  "ryan", "aiden", "eric", "dylan",  // 男声
];

export async function speakCommand(options: {
  input: string;
  voice: string;
  output?: string;
  lang?: string;
}) {
  const voice = options.voice;
  if (!VOICES.includes(voice)) {
    handleError(`无效的声音: ${voice}`, new Error(`可选: ${VOICES.join(", ")}`));
  }

  log(chalk.bold("\n🎙️  合成语音\n"));

  // 读取脚本
  let text: string;
  try {
    text = readFileSync(options.input, "utf-8").trim();
  } catch (err) {
    handleError("无法读取脚本文件", err);
  }

  if (!text) {
    handleError("脚本内容为空", new Error(options.input));
  }

  // 清理文本
  const cleanText = text
    .replace(/\[.*?\]/g, "")
    .replace(/\*+/g, "")
    .replace(/#+\s*/g, "")
    .replace(/---+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    + "。";

  log(`  声音:  ${voice}`);
  log(`  语言:  ${options.lang ?? "zh"}`);
  log(`  长度:  ${cleanText.length} 字符`);
  log();

  const outputPath = options.output ?? join(tmpdir(), `podcast_${Date.now()}.wav`);

  log(chalk.dim("⏳ 正在合成语音（首次运行需加载模型，可能较慢）..."));

  try {
    await execFileAsync("uv", [
      "run", "python", "-m", "mlx_audio.tts.generate",
      "--model", MODEL,
      "--text", cleanText,
      "--voice", voice,
      "--lang_code", options.lang ?? "zh",
      "--max_tokens", "10000",
      "--join_audio",
      "--file_prefix", outputPath.replace(/\.wav$/, ""),
    ], {
      maxBuffer: 50 * 1024 * 1024,
      timeout: 10 * 60 * 1000,
    });

    // --join_audio 输出为 {prefix}.wav
    const wavPath = outputPath.endsWith(".wav") ? outputPath : `${outputPath}.wav`;

    log(chalk.green(`\n✓ 语音合成完成`));
    log(`  输出: ${wavPath}`);
    log();

    outputResult({
      status: "ok",
      output: wavPath,
      voice,
      lang: options.lang ?? "zh",
      chars: cleanText.length,
    });
  } catch (err) {
    log(chalk.dim("  确保已安装: uv, python, mlx-audio"));
    handleError("TTS 合成失败", err);
  }
}
