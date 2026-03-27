import { existsSync } from "fs";
import chalk from "chalk";
import {
  configExists,
  getDefaultConfig,
  saveConfig,
  getConfigDir,
  loadConfig,
} from "../config.js";
import { getAddress } from "../sui.js";
import { log, outputResult } from "../output.js";
import { handleError } from "../utils.js";

export async function initCommand(options: {
  network?: string;
  packageId?: string;
  keystore?: string;
}) {
  log(chalk.bold("\n🎙️  AI-Cast CLI 初始化\n"));

  const config = configExists() ? loadConfig() : getDefaultConfig();

  if (options.network) {
    config.network = options.network as "testnet" | "mainnet" | "devnet";
  }
  if (options.packageId) {
    config.packageId = options.packageId;
  }
  if (options.keystore) {
    config.keystorePath = options.keystore;
  }

  if (!existsSync(config.keystorePath)) {
    handleError("Sui keystore 不存在", new Error(`${config.keystorePath}\n  请先运行 sui client 创建地址，或使用 --keystore 指定路径`));
  }

  try {
    const address = getAddress(config);
    config.activeAddress = address;
    saveConfig(config);

    log(chalk.green("✓ 配置已保存到"), getConfigDir());
    log();
    log("  网络:     ", chalk.cyan(config.network));
    log("  地址:     ", chalk.cyan(address));
    log("  Keystore: ", chalk.dim(config.keystorePath));
    if (config.packageId) {
      log("  Package ID:", chalk.cyan(config.packageId));
    } else {
      log("  Package ID:", chalk.yellow("未设置（部署合约后使用 --package-id 设置）"));
    }
    log();

    outputResult({
      status: "ok",
      network: config.network,
      address,
      packageId: config.packageId || null,
      configDir: getConfigDir(),
    });
  } catch (err) {
    handleError("无法读取 Sui keystore", err);
  }
}
