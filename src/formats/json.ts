import { hex } from "@fleet-sdk/crypto";
import type { CompilerOutput } from "../sigma/compiler";

type ConstantInfo = {
  value: string;
  type: string;
  name?: string;
  description?: string;
};

interface JsonOutput {
  expressionTree: string;
  version?: number;
  constantSegregated?: boolean;
  constants?: ConstantInfo[];
}

export function outputJson(compilerOutput: CompilerOutput): void {
  const { tree, parseConstants } = compilerOutput;
  const jsonOutput: JsonOutput = {
    expressionTree: hex.encode(tree.template),
    version: tree.version,
    constantSegregated: tree.hasSegregatedConstants,
    constants: tree.hasSegregatedConstants
      ? parseConstants().map((c) => ({
          value: c.toHex(),
          type: c.type,
          name: c.placeholder?.name,
          description: c.placeholder?.description ? c.placeholder.description : undefined
        }))
      : undefined
  };

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(JSON.stringify(jsonOutput, null, 2));
}
