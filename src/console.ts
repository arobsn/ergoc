import type { CompilerOutput } from "@fleet-sdk/compiler";
import { parseEncoding } from "./flags";

export function error(message: string): never {
  console.error(message);
  process.exit(1);
}

interface OutputLogFlags {
  encoding: string;
  compact: boolean;
}

export function output(tree: CompilerOutput, flags: OutputLogFlags): void {
  const encoding = parseEncoding(flags.encoding);
  const encodedTree = encoding === "base16" ? tree.toHex() : tree.toAddress().encode();

  if (flags.compact) {
    console.log(encodedTree);
  } else {
    console.log("Contract:", encodedTree);
  }
}
