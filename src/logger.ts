import { blue, cyan, dim, gray, green, magenta, red, white, yellow } from "picocolors";
import { formatData, isNumberRelevant, isNumeric } from "./data";
import type { ConstantInfo } from "./sigma/compiler";
import type { PlaceholderInfo } from "./parser";

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
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(green("➜"), white(title), tag);
    return this;
  },
  subtitle(title: string, tag: string) {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(magenta("➜"), white(title), tag);
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

  constants(constants: ConstantInfo[], verbose: boolean) {
    const toLog = verbose
      ? constants
      : constants.filter((c) => {
          if (isNumeric(c.value)) return isNumberRelevant(c.value as number | bigint);
          if (Array.isArray(c.value)) return c.value.length > 0;
          if (c.type === "Boolean") return c.value === false;
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

    const maxIndexLen = Math.max(...toLog.map((c) => c.index.length));
    const maxTypeLen = Math.max(
      ...toLog.map(
        (c) => c.type.length + (c.placeholder?.name?.length ? c.placeholder.name.length + 2 : 0)
      )
    );

    for (const c of toLog) {
      this.constant(
        c.index,
        c.type,
        formatData(c.value, c.type),
        c.placeholder,
        maxIndexLen,
        maxTypeLen
      );
    }

    return this;
  },
  constant(
    i: string,
    type: string,
    data: unknown,
    placeholder: PlaceholderInfo | undefined,
    iPad: number,
    tPad: number
  ) {
    if (placeholder) {
      const nameAndType = `${white(placeholder.name)}: ${cyan(type)}`;
      const padLen = tPad - (placeholder.name.length + type.length + 2);
      const pad = padLen ? " ".repeat(padLen) : "";
      // biome-ignore lint/suspicious/noConsoleLog: <explanation>
      console.log(
        `${`[${yellow(i.padStart(iPad))}]`} ${nameAndType}${pad} =`,
        data,
        placeholder.description ? gray(` // ${placeholder.description}`) : ""
      );
      return this;
    }

    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(`${`[${yellow(i.padStart(iPad))}]`} ${cyan(type.padEnd(tPad))} =`, data);
    return this;
  }
};
