import { blue, bold, cyan, green } from "kleur/colors";
import meow from "meow";
import { description, version } from "../package.json";

export function buildCli() {
  return meow(
    `
      ${bold("ergoc")}/${version} - ${description}

      Usage
        $ ${ergoc} ${ip("<script-file>", "<script-string>")} ${cyan("[options]")}

      Options
        ${op("-w", "--watch")}      Watch for script file changes
        ${op("-h", "--help")}       Show help
        ${op("-v", "--version")}    Show version

      Examples
        $ ${ex("./script.es")}
        $ ${ex("./script.es", ["--watch"])}
        $ ${ex('"sigmaProp(HEIGHT > 1000)"')}
    `,
    {
      importMeta: import.meta,
      version,
      allowUnknownFlags: false,
      helpIndent: 0,
      autoVersion: true,
      description: false,
      autoHelp: true,
      flags: {
        help: { type: "boolean", shortFlag: "h" },
        version: { type: "boolean", shortFlag: "v" }
      }
    }
  );
}

const ergoc = bold(green("ergoc"));

function ip(...inputs: string[]): string {
  return `${inputs.map((f) => blue(f)).join(" | ")}`;
}

function op(...flags: string[]): string {
  return `${flags.map((f) => cyan(f)).join(", ")}`;
}

function ex(input: string, flags?: string[]): string {
  const e = `${ergoc} ${blue(input)}`;
  return flags ? `${e} ${cyan(flags.join(" "))}` : e;
}
