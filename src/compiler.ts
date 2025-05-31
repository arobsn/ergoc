import { existsSync, readFileSync } from "node:fs";
import { type CompilerOutput, compile } from "@fleet-sdk/compiler";
import { cyan, dim } from "kleur/colors";
import { log, size } from "./console";
import { parseEncoding, parseErgoTreeVersion, parseNetwork } from "./flags";
import { FileNotFoundError } from "./errors";

export interface CompilerFlags {
  network: string;
  ergotreeVersion: string;
  constSegregation: boolean;
  sizeInfo: boolean;
  encoding: string;
  compact: boolean;
  verbose: boolean;
}

export interface CompileState {
  recompiling: boolean;
}

export function compileScript(
  filename: string,
  flags: CompilerFlags,
  { recompiling }: CompileState = { recompiling: true }
): CompilerOutput {
  const startTime = performance.now();

  const encoding = parseEncoding(flags.encoding);
  const version = parseErgoTreeVersion(flags.ergotreeVersion);
  const commonOptions = {
    network: parseNetwork(flags.network),
    segregateConstants: flags.constSegregation
  };
  const options =
    version === 0
      ? { version, includeSize: flags.sizeInfo, ...commonOptions }
      : { version, ...commonOptions };

  if (!flags.compact) {
    let action = "Compiling";
    if (recompiling) {
      console.clear();
      action = "Recompiling";
    }

    log.task(`${action} ${cyan(filename)}...`);

    if (flags.verbose) {
      log.info(dim("ErgoTree version  "), options.version);
      log.info(dim("Const segregation "), options.segregateConstants);
      log.info(dim("Size info         "), options.version === 0 ? options.includeSize : true);
      log.info(dim("Network           "), options.network);
      log.info(
        dim("Encoding          "),
        encoding === "base16" ? "base16 (hex)" : "base58 (address)"
      );
    }
  }

  if (!existsSync(filename)) throw new FileNotFoundError(filename);

  const script = readFileSync(filename, "utf-8");
  const tree = compile(script, options);
  const treeBytes = tree.toBytes();
  const encodedTree = encoding === "base16" ? tree.toHex() : tree.toAddress().encode();

  if (flags.compact) {
    console.log(encodedTree);
  } else {
    log.success(`Done in ${Math.floor(performance.now() - startTime)}ms\n`);

    console.log(dim(encoding === "base16" ? "ErgoTree" : "P2S Address"), size(treeBytes.length));
    console.log(encodedTree);
  }

  return tree;
}
