import { hex } from "@fleet-sdk/crypto";
import type { CompilerOutput } from "../sigma/compiler";

interface ConstantInfo {
  value: string;
  type: string;
  name?: string;
  description?: string;
}

interface JsonOutput {
  header: string;
  expressionTree: string;
  constants?: ConstantInfo[]; // if constants are not segregated, this will be undefined
}

export function outputJson(compilerOutput: CompilerOutput): void {
  const { tree, parseConstants } = compilerOutput;
  const jsonOutput: JsonOutput = {
    header: hex.encode(Uint8Array.from([tree.header])),
    expressionTree: hex.encode(tree.template),
    constants: tree.hasSegregatedConstants
      ? parseConstants().map((c) => ({
          value: c.toHex(),
          type: c.type,
          name: c.placeholder?.name,
          description: c.placeholder?.description // this check can look redundant, but it ensures that empty strings are not included
            ? c.placeholder.description
            : undefined
        }))
      : undefined
  };

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(JSON.stringify(jsonOutput, null, 2));
}
