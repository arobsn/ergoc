import { existsSync, readFileSync } from "node:fs";
import { type CompilerOutput, compile } from "@fleet-sdk/compiler";
import { parseErgoTreeVersion, parseNetwork } from "./flags";

interface CompilerFlags {
  network: string;
  ergoTreeVersion: string;
  segregateConsts: boolean;
  noSizeInfo: boolean;
}

export function compileScript(file: string, flags: CompilerFlags): CompilerOutput {
  if (!existsSync(file)) throw new Error(`Couldn't not find script file: ${file}`);

  const script = readFileSync(file, "utf-8");

  const version = parseErgoTreeVersion(flags.ergoTreeVersion);
  const commonOptions = {
    network: parseNetwork(flags.network),
    segregateConstants: flags.segregateConsts
  };
  const options =
    version === 0
      ? { version, includeSize: !flags.noSizeInfo, ...commonOptions }
      : { version, ...commonOptions };

  return compile(script, options);
}
