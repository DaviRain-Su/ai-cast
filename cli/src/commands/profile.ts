import chalk from "chalk";
import { Transaction } from "@mysten/sui/transactions";
import { getAddress, signAndExecute } from "../sui.js";
import { log, outputResult } from "../output.js";
import { loadConfigWithPackageId, handleError } from "../utils.js";

export async function profileCreateCommand(options: {
  name: string;
  bio: string;
}) {
  const config = loadConfigWithPackageId();
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

    outputResult({ status: "ok", objectId, digest: result.digest, address });
  } catch (err) {
    handleError("创建失败", err);
  }
}
