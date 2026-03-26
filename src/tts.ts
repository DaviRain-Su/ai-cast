import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { join } from "path";

const execFileAsync = promisify(execFile);

const MODEL =
  process.env.TTS_MODEL_PATH ??
  `${process.env.HOME}/.cache/huggingface/hub/models--mlx-community--Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit/snapshots/41d3337e8b7f2843a75841595fc14e4b9a7a4b96`;

export const VOICES = [
  { label: "Serena - 女声", value: "serena" },
  { label: "Vivian - 女声", value: "vivian" },
  { label: "Sohee - 女声", value: "sohee" },
  { label: "Ryan - 男声", value: "ryan" },
  { label: "Aiden - 男声", value: "aiden" },
  { label: "Eric - 男声", value: "eric" },
  { label: "Dylan - 男声", value: "dylan" },
];

export async function textToSpeech(
  text: string,
  voice: string
): Promise<{ path: string; contentType: string }> {
  const cleanText = text
    .replace(/\[.*?\]/g, "")
    .replace(/\*+/g, "")
    .replace(/#+\s*/g, "")
    .replace(/---+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    // 结尾加句号确保最后一句能完整收音
    + "。";

  const prefix = join(tmpdir(), `podcast_${Date.now()}`);

  await execFileAsync("uv", [
    "run", "python", "-m", "mlx_audio.tts.generate",
    "--model", MODEL,
    "--text", cleanText,
    "--voice", voice,
    "--lang_code", "zh",
    "--max_tokens", "10000",  // 12Hz × 约13分钟
    "--join_audio",
    "--file_prefix", prefix,
  ], { maxBuffer: 50 * 1024 * 1024, timeout: 10 * 60 * 1000 });

  // --join_audio 合并后输出为 {prefix}.wav，否则为 {prefix}_000.wav
  return { path: `${prefix}.wav`, contentType: "audio/wav" };
}
