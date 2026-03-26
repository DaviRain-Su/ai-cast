import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".ai-cast");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface AiCastConfig {
  /** Sui 网络: testnet | mainnet | devnet */
  network: "testnet" | "mainnet" | "devnet";
  /** 合约 package ID（部署后填入） */
  packageId: string;
  /** Walrus aggregator URL */
  walrusAggregator: string;
  /** Walrus publisher URL */
  walrusPublisher: string;
  /** Sui keystore 路径 */
  keystorePath: string;
  /** 活跃地址 */
  activeAddress?: string;
}

const DEFAULT_CONFIG: AiCastConfig = {
  network: "testnet",
  packageId: "",
  walrusAggregator: "https://aggregator.walrus-testnet.walrus.space",
  walrusPublisher: "https://publisher.walrus-testnet.walrus.space",
  keystorePath: join(homedir(), ".sui", "sui_config", "sui.keystore"),
};

export function getConfigDir(): string {
  return CONFIG_DIR;
}

export function configExists(): boolean {
  return existsSync(CONFIG_FILE);
}

/**
 * 加载配置 — 优先级: 环境变量 > 配置文件 > 默认值
 *
 * 支持的环境变量（方便 Agent 无交互使用）:
 *   AI_CAST_NETWORK      — testnet / mainnet / devnet
 *   AI_CAST_PACKAGE_ID   — 合约 package ID
 *   AI_CAST_KEYSTORE     — Sui keystore 文件路径
 *   AI_CAST_ADDRESS      — 活跃钱包地址
 *   AI_CAST_WALRUS_PUB   — Walrus publisher URL
 *   AI_CAST_WALRUS_AGG   — Walrus aggregator URL
 */
export function loadConfig(): AiCastConfig {
  // 尝试从配置文件加载
  let fileConfig: Partial<AiCastConfig> = {};
  if (existsSync(CONFIG_FILE)) {
    const raw = readFileSync(CONFIG_FILE, "utf-8");
    fileConfig = JSON.parse(raw);
  }

  // 环境变量覆盖
  const env = process.env;
  const config: AiCastConfig = {
    network: (env.AI_CAST_NETWORK as AiCastConfig["network"]) ?? fileConfig.network ?? DEFAULT_CONFIG.network,
    packageId: env.AI_CAST_PACKAGE_ID ?? fileConfig.packageId ?? DEFAULT_CONFIG.packageId,
    keystorePath: env.AI_CAST_KEYSTORE ?? fileConfig.keystorePath ?? DEFAULT_CONFIG.keystorePath,
    activeAddress: env.AI_CAST_ADDRESS ?? fileConfig.activeAddress,
    walrusPublisher: env.AI_CAST_WALRUS_PUB ?? fileConfig.walrusPublisher ?? DEFAULT_CONFIG.walrusPublisher,
    walrusAggregator: env.AI_CAST_WALRUS_AGG ?? fileConfig.walrusAggregator ?? DEFAULT_CONFIG.walrusAggregator,
  };

  // 至少需要 keystore 存在
  if (!existsSync(config.keystorePath) && !env.AI_CAST_PACKAGE_ID && !existsSync(CONFIG_FILE)) {
    throw new Error(
      "配置未找到。请运行 ai-cast init 或设置环境变量 AI_CAST_PACKAGE_ID + AI_CAST_KEYSTORE"
    );
  }

  return config;
}

export function saveConfig(config: AiCastConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export function getDefaultConfig(): AiCastConfig {
  return { ...DEFAULT_CONFIG };
}
