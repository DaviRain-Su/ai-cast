import chalk from "chalk";
import { Transaction } from "@mysten/sui/transactions";
import { loadConfig } from "../config.js";
import { getAddress, signAndExecute } from "../sui.js";
import { log, outputResult, outputError } from "../output.js";

export async function profileCreateCommand(options: {
  name: string;
  bio: string;
}) {
  const config = loadConfig();
  if (!config.packageId) {
    outputError("尚未设置 packageId", "请先运行 ai-cast init --package-id <ID>");
    log(chalk.red("✗ 尚未设置 packageId，请先部署合约并运行 ai-cast init --package-id <ID>"));
    process.exit(1);
  }

  const address = getAddress(config);
  log(chalk.bold("\n🎙️  创建创作者档案\n"));
  log("  地址:", chalk.cyan(address));
  log("  名称:", options.name);
  log("  简介:", options.bio);
  log();

  const tx = new Transaction();
  const profile = tx.moveCall({
    target: `${config.packageId}::creator::create_profile`,
    arguments: [
      tx.pure.string(options.name),
      tx.pure.string(options.bio),
    ],
  });
  tx.transferObjects([profile], address);

  try {
    const result = await signAndExecute(tx);
    const profileObj = result.objectChanges?.find(
      (c) => c.type === "created" && c.objectType.includes("CreatorProfile")
    );

    const objectId = profileObj?.type === "created" ? profileObj.objectId : null;

    log(chalk.green("✓ 创作者档案已创建"));
    if (objectId) log("  Object ID:", chalk.cyan(objectId));
    log("  Digest:   ", chalk.dim(result.digest));
    log();

    outputResult({
      status: "ok",
      objectId,
      digest: result.digest,
      address,
    });
  } catch (err) {
    outputError("创建失败", (err as Error).message);
    log(chalk.red("✗ 创建失败"));
    log(chalk.dim(`  ${(err as Error).message}`));
    process.exit(1);
  }
}
