import { hex } from "@fleet-sdk/crypto";
import { green, red, yellow } from "picocolors";

const MAX_TREE_SIZE = 4_096;
const EIGHTY_PERCENT_OF_MAX_TREE_SIZE = (MAX_TREE_SIZE * 80) / 100;
const FIFTY_PERCENT_OF_MAX_TREE_SIZE = (MAX_TREE_SIZE * 50) / 100;

export function formatSize(bytes: number): string {
  const formattedBytes = formatBytes(bytes);

  if (bytes > EIGHTY_PERCENT_OF_MAX_TREE_SIZE) return red(formattedBytes);
  if (bytes > FIFTY_PERCENT_OF_MAX_TREE_SIZE) return yellow(formattedBytes);
  return green(formattedBytes);
}

function formatBytes(bytes: number, decimals = 2) {
  const b = "bytes";
  if (!+bytes) return b;

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [b, "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

export function formatData(data: unknown, type: string): unknown {
  if (data === undefined || data === null) return yellow("null");
  if (isNumeric(data)) return yellow(data.toString());
  if (type === "Coll[Byte]" && Array.isArray(data)) {
    return data.length ? green(hex.encode(Uint8Array.from(data))) : yellow("[Empty]");
  }

  return data;
}

export function isNumeric(val: unknown): val is number | bigint {
  const type = typeof val;
  return type === "number" || type === "bigint";
}

export function isNumberRelevant(val: number | bigint): boolean {
  const t = typeof val;
  let n: number;

  if (t === "number") {
    n = val as number;
  } else if (t === "bigint") {
    n = Number(val as bigint);
  } else {
    return false; // Unsupported type
  }

  return n >= 5 || n < 0;
}
