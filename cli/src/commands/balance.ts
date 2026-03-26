import chalk from "chalk";
import { loadConfig } from "../config.js";
import { getAddress, getSuiClient } from "../sui.js";
import { log, outputResult, outputError } from "../output.js";

export async function balanceCommand() {
  const config = loadConfig();
  const address = getAddress(config);
  const client = getSuiClient(config);

  log(chalk.bold("\n🎙️  账户余额\n"));
  log("  地址:", chalk.cyan(address));
  log();

  try {
    const balance = await client.getBalance({ owner: address });
    const suiBalance = (parseInt(balance.totalBalance) / 1_000_000_000).toFixed(4);
    log("  SUI 余额:", chalk.green(`${suiBalance} SUI`));

    let totalTipsReceived = 0;
    let totalTipsSent = 0;
    let subIncome = 0;
    let subCount = 0;

    if (config.packageId) {
      const events = await client.queryEvents({
        query: { MoveEventType: `${config.packageId}::tipping::TipSent` },
        limit: 50,
      });

      for (const event of events.data) {
        const parsed = event.parsedJson as Record<string, any>;
        const amount = parseInt(parsed.amount ?? "0");
        if (parsed.creator === address) totalTipsReceived += amount;
        if (parsed.tipper === address) totalTipsSent += amount;
      }

      if (totalTipsReceived > 0) log("  收到打赏:", chalk.green(`${(totalTipsReceived / 1e9).toFixed(4)} SUI`));
      if (totalTipsSent > 0) log("  发出打赏:", chalk.dim(`${(totalTipsSent / 1e9).toFixed(4)} SUI`));

      const subEvents = await client.queryEvents({
        query: { MoveEventType: `${config.packageId}::subscription::SubscriptionCreated` },
        limit: 50,
      });

      for (const event of subEvents.data) {
        const parsed = event.parsedJson as Record<string, any>;
        if (parsed.creator === address) {
          subIncome += parseInt(parsed.amount ?? "0");
          subCount++;
        }
      }

      if (subCount > 0) {
        log("  订阅收入:", chalk.green(`${(subIncome / 1e9).toFixed(4)} SUI`), chalk.dim(`(${subCount} 笔)`));
      }
    }

    log();

    outputResult({
      status: "ok",
      address,
      suiBalance: parseFloat(suiBalance),
      tipsReceived: totalTipsReceived / 1e9,
      tipsSent: totalTipsSent / 1e9,
      subscriptionIncome: subIncome / 1e9,
      subscriptionCount: subCount,
    });
  } catch (err) {
    outputError("查询失败", (err as Error).message);
    log(chalk.red("✗ 查询失败"));
    log(chalk.dim(`  ${(err as Error).message}`));
    process.exit(1);
  }
}
