/**
 * 输出工具 — 支持人类可读和 JSON 两种模式
 * Agent 通过 --json 参数获取结构化输出
 */

let jsonMode = false;

export function setJsonMode(enabled: boolean) {
  jsonMode = enabled;
}

export function isJsonMode(): boolean {
  return jsonMode;
}

/** 仅在非 JSON 模式输出 */
export function log(...args: any[]) {
  if (!jsonMode) {
    console.log(...args);
  }
}

/** JSON 模式下输出结构化结果 */
export function outputResult(data: Record<string, any>) {
  if (jsonMode) {
    console.log(JSON.stringify(data));
  }
}

/** JSON 模式下输出错误 */
export function outputError(message: string, details?: string) {
  if (jsonMode) {
    console.log(JSON.stringify({ error: message, details }));
    process.exit(1);
  }
}
