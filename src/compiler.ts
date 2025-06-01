import { existsSync, readFileSync } from "node:fs";
import { type CompilerOutput, compile as build } from "@fleet-sdk/compiler";
import { blue, cyan, dim, magenta, yellow } from "picocolors";
import { formatData, formatSize, isNumberRelevant, isNumeric } from "./data";
import { FileNotFoundError, InvalidParameterError } from "./errors";
import { type CompilerFlags, parseEncoding, parseErgoTreeVersion, parseNetwork } from "./flags";
import { log } from "./logger";

export function compileScript(filename: string, flags: CompilerFlags): CompilerOutput {
  const startTime = performance.now();

  const enc = parseEncoding(flags.encoding);
  const version = parseErgoTreeVersion(flags.ergotreeVersion) as 0 | 1; // todo: support v2 and v3 in fleet
  const commonOptions = {
    network: parseNetwork(flags.network),
    segregateConstants: flags.constSegregation
  };
  const options =
    version === 0
      ? { version, includeSize: flags.sizeInfo, ...commonOptions }
      : { version, ...commonOptions };

  if (!flags.compact) {
    log.task(`Compiling ${cyan(filename)}...`);
    if (flags.verbose) {
      log.info(dim("ErgoTree version  "), options.version);
      log.info(dim("Const segregation "), options.segregateConstants);
      log.info(dim("Size info         "), options.version === 0 ? options.includeSize : true);
      log.info(dim("Network           "), options.network);
      log.info(dim("Encoding          "), enc === "base16" ? "base16 (hex)" : "base58 (address)");
    }
  }

  if (!existsSync(filename)) throw new FileNotFoundError(filename);

  const script = readFileSync(filename, "utf-8");
  const tree = build(script, options);
  const treeBytes = tree.toBytes();
  const encodedTree = enc === "base16" ? tree.toHex() : tree.toAddress().encode();

  if (flags.compact) {
    console.log(encodedTree);
  } else {
    log.success(`Done in ${Math.floor(performance.now() - startTime)}ms\n`);

    console.log(dim(enc === "base16" ? "ErgoTree" : "P2S Address"), formatSize(treeBytes.length));
    console.log(encodedTree);
    console.log();

    if (flags.constSegregation) {
      const formattedConsts: FormattedConst[] = [];
      let i = 0;
      for (const constant of tree.constants) {
        formattedConsts.push([i.toString(), constant.tpe.name, constant.data]);
        i++;
      }

      logConstants(formattedConsts, flags);
    }
  }

  return tree;
}

type FormattedConst = [string, string, unknown];

function logConstants(constants: FormattedConst[], flags: CompilerFlags): void {
  const toLog = flags.verbose
    ? constants
    : constants.filter(([_i, type, data]) => {
        if (isNumeric(data)) return isNumberRelevant(data as number | bigint);
        if (type === "Boolean") return data === false;
        return true; // Log all other types
      });

  const logCountDisplay = flags.verbose
    ? toLog.length.toString()
    : `${toLog.length} ${dim(`out of ${constants.length}`)}`;

  const title = flags.verbose ? "Constants" : "Relevant Constants";

  console.log(dim(title), blue(logCountDisplay));

  if (toLog.length === 0) {
    console.log(dim(flags.verbose ? "No constants found" : "No relevant constants found"));
    return;
  }

  const maxIndexLen = Math.max(...toLog.map(([i]) => i.length));
  const maxTypeLen = Math.max(...toLog.map(([_i, type]) => type.length));

  for (const [i, type, data] of toLog) {
    logConstant(i, type, formatData(data, type), maxIndexLen, maxTypeLen);
  }
}

function logConstant(i: string, type: string, data: unknown, iPad: number, tPad: number): void {
  console.log(`${`[${yellow(i.padStart(iPad))}]:`} ${magenta(type.padEnd(tPad))} =`, data);
}

export function compile(
  input: string,
  flags: CompilerFlags,
  { exitOnError } = { exitOnError: true }
): void {
  try {
    compileScript(input as string, flags);
  } catch (e) {
    if (e instanceof FileNotFoundError || e instanceof InvalidParameterError) {
      log.error(e.message);
      process.exit(1);
    }

    log.error(e instanceof Error ? e.message : String(e));
    if (exitOnError) process.exit(1);
  }
}
