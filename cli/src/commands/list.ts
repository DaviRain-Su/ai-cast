import chalk from "chalk";
import { loadConfig } from "../config.js";
import { getAddress, getSuiClient } from "../sui.js";
import { log, outputResult, outputError } from "../output.js";

export async function listCommand() {
  const config = loadConfig();
  if (!config.packageId) {
    outputError("尚未设置 packageId", "请先运行 ai-cast init --package-id <ID>");
    log(chalk.red("✗ 尚未设置 packageId"));
    process.exit(1);
  }

  const address = getAddress(config);
  const client = getSuiClient(config);

  log(chalk.bold("\n🎙️  我的播客\n"));
  log("  地址:", chalk.cyan(address));
  log();

  try {
    const podcastType = `${config.packageId}::podcast::Podcast`;
    const objects = await client.getOwnedObjects({
      owner: address,
      filter: { StructType: podcastType },
      options: { showContent: true },
    });

    if (!objects.data || objects.data.length === 0) {
      log(chalk.dim("  暂无已发布的播客"));
      log();
      outputResult({ status: "ok", address, podcasts: [] });
      return;
    }

    const podcasts: any[] = [];

    for (const obj of objects.data) {
      const content = obj.data?.content;
      if (content?.dataType !== "moveObject") continue;
      const fields = content.fields as Record<string, any>;

      const tier = fields.tier === 0 ? chalk.green("免费") : chalk.yellow("付费");
      const duration = parseInt(fields.duration_secs ?? "0");
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      const timeStr = duration > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : "未知";

      log(chalk.bold(`  ${fields.title}`));
      log(`    ID:       ${chalk.dim(obj.data?.objectId)}`);
      log(`    风格:     ${fields.style}`);
      log(`    时长:     ${timeStr}`);
      log(`    级别:     ${tier}`);
      log(`    Audio:    ${chalk.dim(fields.audio_blob_id)}`);
      log(`    打赏:     ${fields.tip_total ?? 0} SUI`);
      log(`    播放:     ${fields.play_count ?? 0} 次`);
      log();

      podcasts.push({
        objectId: obj.data?.objectId,
        title: fields.title,
        style: fields.style,
        durationSecs: duration,
        tier: fields.tier === 0 ? "free" : "premium",
        audioBlobId: fields.audio_blob_id,
        tipTotal: parseInt(fields.tip_total ?? "0"),
        playCount: parseInt(fields.play_count ?? "0"),
      });
    }

    log(chalk.dim(`  共 ${objects.data.length} 个播客\n`));

    outputResult({ status: "ok", address, podcasts });
  } catch (err) {
    outputError("查询失败", (err as Error).message);
    log(chalk.red("✗ 查询失败"));
    log(chalk.dim(`  ${(err as Error).message}`));
    process.exit(1);
  }
}
