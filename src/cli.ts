import { blue, bold, cyan, green } from "kleur/colors";
import meow from "meow";
import { description, version } from "../package.json";

export function buildCli() {
  // follow the docopt style, http://docopt.org/
  return meow(
    `
      ${bold("ergoc")}/${version} - ${description}

      Usage
        $ ${ergoc} ${ip("<script-file>")} ${cyan("[options]")} 

      Options
        ${op("-w", "--watch")}               Watch for script changes
        ${op("-h", "--help")}                Show help
        ${op("-v", "--version")}             Show version
        ${op("-c", "--compact")}             Compact output
        ${op("-e TYPE", "--encoding TYPE")}  ErgoTree output encoding (hex, base58) [default: hex]
        ${op("-n TYPE", "--network TYPE")}   Contract network (mainnet, testnet) [default: mainnet]
        ${op("--ergotree-version")}        Output Ergotree version (0, 1, latest) [default: latest]
        ${op("--segregate-consts")}        Segregate output constants [default: true]
        ${op("--no-size-info")}            Don't include size info if ErgoTree version is set to 0
        ${op("--verbose")}                 Enable verbose mode, showing additional information

      Examples
        $ ${ex("./script.es")}
        $ ${ex("./script.es", ["--watch"])}
        $ ${ex("./script.es", ["--encoding hex"])}
        $ ${ex("./script.es", ["--encoding base58", "--network testnet"])}
        $ ${ex("./script.es", ["--ergotree-version 0", "--verbose"])}
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
        version: { type: "boolean", shortFlag: "v" },
        compact: { type: "boolean", shortFlag: "c", default: false },
        encoding: { type: "string", shortFlag: "e", default: "hex" }, //     hex, base58
        network: { type: "string", shortFlag: "n", default: "mainnet" }, //  mainnet, testnet
        ergoTreeVersion: { type: "string", default: "latest" }, //           0, 1, latest
        segregateConsts: { type: "boolean", default: true },
        noSizeInfo: { type: "boolean", default: false },
        verbose: { type: "boolean", default: false }
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
