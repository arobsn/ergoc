import { Network, ensureDefaults, ergoTreeHeaderFlags } from "@fleet-sdk/common";
import { ErgoTree } from "@fleet-sdk/core";
import { SigmaCompiler$, type Value } from "sigmastate-js/main";

function createMemoizedCompiler(factory: () => ReturnType<typeof SigmaCompiler$.forMainnet>) {
  let instance: ReturnType<typeof factory> | undefined;
  return () => {
    if (!instance) instance = factory();
    return instance;
  };
}

const _getMainnetCompiler = createMemoizedCompiler(() => SigmaCompiler$.forMainnet());
const _getTestnetCompiler = createMemoizedCompiler(() => SigmaCompiler$.forTestnet());

export function compile(script: string, options?: CompilerOptions): ErgoTree {
  const opt = ensureDefaults(options, COMPILER_DEFAULTS);

  let headerFlags = 0x00 | opt.version;
  if (opt.version > 0 || (opt.version === 0 && opt.includeSize)) {
    headerFlags |= ergoTreeHeaderFlags.sizeInclusion;
  }

  const compiler = opt.network === "mainnet" ? _getMainnetCompiler() : _getTestnetCompiler();

  const output = compiler
    .compile(opt.map, opt.segregateConstants, headerFlags, script)
    // use .toHex() to avoid production errors as fullOpt builder of Sigma-JS renames .bytes().u
    // to something else
    .toHex();

  return new ErgoTree(output, opt.network === "mainnet" ? Network.Mainnet : Network.Testnet);
}

type CompilerOptionsBase = {
  version?: number;
  map?: Record<string, Value>;
  segregateConstants?: boolean;
  network?: "mainnet" | "testnet";
};

export type CompilerOptionsForErgoTreeV0 = CompilerOptionsBase & {
  version?: 0;
  includeSize?: boolean;
};

export type CompilerOptionsForErgoTreeNonV0 = CompilerOptionsBase & {
  version?: 1 | 2 | 3; // future versions can be added here
};

export type CompilerOptions = CompilerOptionsForErgoTreeV0 | CompilerOptionsForErgoTreeNonV0;

export const COMPILER_DEFAULTS: Required<CompilerOptions> = {
  version: 1,
  map: {},
  segregateConstants: true,
  network: "mainnet"
};
