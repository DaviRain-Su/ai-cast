import { execFileSync, execSync } from "child_process";
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import chalk from "chalk";
import { log, outputResult } from "../output.js";
import { handleError } from "../utils.js";

const TTS_MODEL_ID = "mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit";
const TTS_MODEL_CACHE = join(
  homedir(),
  ".cache/huggingface/hub/models--mlx-community--Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit"
);

interface CheckResult {
  name: string;
  status: "ok" | "missing" | "installing";
  detail?: string;
}

function checkCommand(cmd: string): boolean {
  try {
    execFileSync("which", [cmd], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function getVersion(cmd: string, flag = "--version"): string {
  try {
    return execFileSync(cmd, [flag], { encoding: "utf-8", stdio: "pipe" }).trim().split("\n")[0];
  } catch {
    return "unknown";
  }
}

export async function installCommand(options: {
  check?: boolean;
}) {
  const checkOnly = options.check ?? false;

  log(chalk.bold("\n🎙️  AI-Cast 环境安装\n"));

  const results: CheckResult[] = [];

  // 1. 检查 Node.js
  const nodeVersion = process.version;
  results.push({ name: "Node.js", status: "ok", detail: nodeVersion });
  log(chalk.green(`  ✓ Node.js ${nodeVersion}`));

  // 2. 检查 ffmpeg
  if (checkCommand("ffmpeg")) {
    const ver = getVersion("ffmpeg", "-version");
    results.push({ name: "ffmpeg", status: "ok", detail: ver });
    log(chalk.green(`  ✓ ffmpeg (${ver.slice(0, 30)})`));
  } else {
    results.push({ name: "ffmpeg", status: "missing", detail: "brew install ffmpeg" });
    log(chalk.red("  ✗ ffmpeg 未安装"));
    log(chalk.dim("    brew install ffmpeg"));
  }

  // 3. 检查 Python
  if (checkCommand("python3") || checkCommand("python")) {
    const pyCmd = checkCommand("python3") ? "python3" : "python";
    const ver = getVersion(pyCmd, "--version");
    results.push({ name: "Python", status: "ok", detail: ver });
    log(chalk.green(`  ✓ ${ver}`));
  } else {
    results.push({ name: "Python", status: "missing", detail: "需要 Python 3.10+" });
    log(chalk.red("  ✗ Python 未安装"));
    log(chalk.dim("    需要 Python 3.10+"));
  }

  // 4. 检查 uv
  if (checkCommand("uv")) {
    const ver = getVersion("uv", "--version");
    results.push({ name: "uv", status: "ok", detail: ver });
    log(chalk.green(`  ✓ uv (${ver})`));
  } else {
    if (checkOnly) {
      results.push({ name: "uv", status: "missing", detail: "curl -LsSf https://astral.sh/uv/install.sh | sh" });
      log(chalk.red("  ✗ uv 未安装"));
      log(chalk.dim("    curl -LsSf https://astral.sh/uv/install.sh | sh"));
    } else {
      log(chalk.dim("  ⏳ 安装 uv..."));
      try {
        execSync("curl -LsSf https://astral.sh/uv/install.sh | sh", { stdio: "pipe" });
        results.push({ name: "uv", status: "ok", detail: "刚安装" });
        log(chalk.green("  ✓ uv 已安装"));
      } catch {
        results.push({ name: "uv", status: "missing" });
        log(chalk.red("  ✗ uv 安装失败，请手动安装"));
      }
    }
  }

  // 5. 检查 Sui CLI
  if (checkCommand("sui")) {
    const ver = getVersion("sui", "--version");
    results.push({ name: "Sui CLI", status: "ok", detail: ver });
    log(chalk.green(`  ✓ ${ver}`));
  } else {
    results.push({ name: "Sui CLI", status: "missing", detail: "brew install sui" });
    log(chalk.red("  ✗ Sui CLI 未安装"));
    log(chalk.dim("    brew install sui"));
  }

  // 6. 检查 mlx-audio Python 包
  log();
  let mlxInstalled = false;
  try {
    execFileSync("uv", ["run", "python", "-c", "import mlx_audio; print(mlx_audio.__version__)"], {
      stdio: "pipe",
      timeout: 30000,
    });
    mlxInstalled = true;
    results.push({ name: "mlx-audio", status: "ok" });
    log(chalk.green("  ✓ mlx-audio 已安装"));
  } catch {
    if (checkOnly) {
      results.push({ name: "mlx-audio", status: "missing", detail: "uv add mlx-audio" });
      log(chalk.red("  ✗ mlx-audio 未安装"));
    } else {
      log(chalk.dim("  ⏳ 安装 mlx-audio（Python TTS 包）..."));
      try {
        execSync("uv add mlx-audio", { stdio: "pipe", timeout: 120000 });
        mlxInstalled = true;
        results.push({ name: "mlx-audio", status: "ok", detail: "刚安装" });
        log(chalk.green("  ✓ mlx-audio 已安装"));
      } catch {
        results.push({ name: "mlx-audio", status: "missing" });
        log(chalk.red("  ✗ mlx-audio 安装失败"));
        log(chalk.dim("    手动安装: uv add mlx-audio"));
      }
    }
  }

  // 7. 检查 TTS 模型（~500MB）
  if (existsSync(TTS_MODEL_CACHE)) {
    results.push({ name: "TTS 模型", status: "ok", detail: TTS_MODEL_ID });
    log(chalk.green(`  ✓ TTS 模型已下载`));
  } else {
    if (checkOnly) {
      results.push({ name: "TTS 模型", status: "missing", detail: `~500MB, ${TTS_MODEL_ID}` });
      log(chalk.yellow("  ○ TTS 模型未下载 (~500MB)"));
      log(chalk.dim(`    运行 ai-cast install 自动下载`));
    } else if (mlxInstalled) {
      log(chalk.dim("  ⏳ 下载 TTS 模型 (~500MB)，首次需要几分钟..."));
      try {
        // 通过运行一次极短的 TTS 来触发模型下载
        execSync(
          `uv run python -c "from huggingface_hub import snapshot_download; snapshot_download('${TTS_MODEL_ID}')"`,
          { stdio: "pipe", timeout: 600000 }
        );
        results.push({ name: "TTS 模型", status: "ok", detail: "刚下载" });
        log(chalk.green("  ✓ TTS 模型下载完成"));
      } catch {
        results.push({ name: "TTS 模型", status: "missing" });
        log(chalk.yellow("  ○ TTS 模型下载失败，首次运行 speak 时会自动下载"));
      }
    }
  }

  // 总结
  log();
  const missing = results.filter((r) => r.status === "missing");
  if (missing.length === 0) {
    log(chalk.green(chalk.bold("  ✓ 所有依赖就绪！可以开始使用 ai-cast\n")));
  } else {
    log(chalk.yellow(`  ${missing.length} 项缺失，请安装后重试\n`));
  }

  outputResult({
    status: missing.length === 0 ? "ok" : "incomplete",
    checks: results,
    missingCount: missing.length,
  });
}
