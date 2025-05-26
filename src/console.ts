import { blue, green, red, yellow } from "kleur/colors";

export function task(message: string): void {
  console.log(yellow("➜"), message);
}

export function error(message: string): never {
  console.error(message);
  process.exit(1);
}

export function info(...content: unknown[]): void {
  console.info(blue("ℹ"), ...content);
}

export function success(...content: unknown[]): void {
  console.log(green("✔"), ...content);
}

const MAX_TREE_SIZE = 4_096;
const EIGHTY_PERCENT_OF_MAX_TREE_SIZE = (MAX_TREE_SIZE * 80) / 100;
const FIFTY_PERCENT_OF_MAX_TREE_SIZE = (MAX_TREE_SIZE * 50) / 100;

export function size(bytes: number): string {
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
