import { blue, dim, green, magenta, red, yellow } from "picocolors";
import { formatData, isNumberRelevant, isNumeric } from "./data";

export type ParsedConstants = [string, string, unknown];

export const log = {
  task(message: string) {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(yellow("➤"), message);
    return this;
  },
  error(message: string) {
    console.error(red("✖ Error:"), red(message));
    return this;
  },
  info(...content: unknown[]) {
    console.info(blue("ℹ"), ...content);
    return this;
  },
  success(...content: unknown[]) {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(green("✔"), ...content);
    return this;
  },

  title(title: string, tag: string) {
    this.nl();
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(dim("➜"), dim(title), tag);
    return this;
  },
  nl() {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log();
    return this;
  },
  content(...content: unknown[]) {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(...content);
    return this;
  },

  constants(constants: ParsedConstants[], verbose: boolean) {
    const toLog = verbose
      ? constants
      : constants.filter(([_i, type, data]) => {
          if (isNumeric(data)) return isNumberRelevant(data as number | bigint);
          if (type === "Boolean") return data === false;
          return true; // Log all other types
        });

    const logCountDisplay = verbose
      ? toLog.length.toString()
      : `${toLog.length} ${dim(`out of ${constants.length}`)}`;

    const title = verbose ? "Constants" : "Relevant Constants";

    log.title(title, blue(logCountDisplay));

    if (toLog.length === 0) {
      log.content(verbose ? "No constants found" : "No relevant constants found");
      return this;
    }

    const maxIndexLen = Math.max(...toLog.map(([i]) => i.length));
    const maxTypeLen = Math.max(...toLog.map(([_i, type]) => type.length));

    for (const [i, type, data] of toLog) {
      this.constant(i, type, formatData(data, type), maxIndexLen, maxTypeLen);
    }

    return this;
  },
  constant(i: string, type: string, data: unknown, iPad: number, tPad: number) {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(`${`[${yellow(i.padStart(iPad))}]:`} ${magenta(type.padEnd(tPad))} =`, data);
    return this;
  }
};
