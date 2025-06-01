import { blue, green, red, yellow } from "picocolors";

export const log = {
  task(message: string): void {
    console.log(yellow("➜"), message);
  },
  error(message: string): void {
    console.error(red("✖ Error:"), red(message));
  },
  info(...content: unknown[]): void {
    console.info(blue("ℹ"), ...content);
  },
  success(...content: unknown[]): void {
    console.log(green("✔"), ...content);
  }
};
