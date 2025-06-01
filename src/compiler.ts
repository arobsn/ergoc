import { existsSync, readFileSync } from "node:fs";
import { compile as build } from "@fleet-sdk/compiler";
import { cyan, dim } from "picocolors";
import { formatSize } from "./data";
import { FileNotFoundError, InvalidParameterError } from "./errors";
import { type CompilerFlags, parseEncoding, parseErgoTreeVersion, parseNetwork } from "./flags";
import { type ParsedConstants, log } from "./logger";

export function compileScript(filename: string, flags: CompilerFlags): void {
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
      log
        .info(dim("ErgoTree version  "), options.version)
        .info(dim("Const segregation "), options.segregateConstants)
        .info(dim("Size info         "), options.version === 0 ? options.includeSize : true)
        .info(dim("Network           "), options.network)
        .info(dim("Encoding          "), enc === "base16" ? "base16 (hex)" : "base58 (address)");
    }
  }

  if (!existsSync(filename)) throw new FileNotFoundError(filename);

  const script = readFileSync(filename, "utf-8");
  const tree = build(script, options);
  const treeBytes = tree.toBytes();
  const encodedTree = enc === "base16" ? tree.toHex() : tree.toAddress().encode();

  if (flags.compact) {
    log.content(encodedTree);
    return;
  }

  log
    .success(`Done in ${Math.floor(performance.now() - startTime)}ms`)
    .title(enc === "base16" ? "ErgoTree" : "P2S Address", formatSize(treeBytes.length))
    .content(encodedTree);

  if (flags.constSegregation) {
    const consts: ParsedConstants[] = [];
    let i = 0;
    for (const constant of tree.constants) {
      consts.push([i.toString(), constant.tpe.name, constant.data]);
      i++;
    }

    log.constants(consts, flags.verbose);
  }
}

export function compile(input: string, flags: CompilerFlags, exitOnError = true): void {
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
