import chalk from "chalk";
import { getAddress, getSuiClient } from "../sui.js";
import { log, outputResult } from "../output.js";
import { loadConfigWithPackageId, handleError, formatDuration } from "../utils.js";

export async function listCommand() {
  const config = loadConfigWithPackageId();
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
      const duration = parseInt(fields.duration_secs ?? "0");
      const tier = fields.tier === 0 ? chalk.green("免费") : chalk.yellow("付费");

      log(chalk.bold(`  ${fields.title}`));
      log(`    ID:       ${chalk.dim(obj.data?.objectId)}`);
      log(`    风格:     ${fields.style}`);
      log(`    时长:     ${duration > 0 ? formatDuration(duration) : "未知"}`);
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
    handleError("查询失败", err);
  }
}
