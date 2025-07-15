import { Network, ensureDefaults, ergoTreeHeaderFlags } from "@fleet-sdk/common";
import { ErgoTree, SByte, SColl, SInt, SLong } from "@fleet-sdk/core";
import { SigmaCompiler$, Value$, type Value } from "sigmastate-js/main";
import { extractPlaceholders, type PlaceholderInfo } from "../parser";
import { hex, randomBytes } from "@fleet-sdk/crypto";
import { stringifyData } from "../data";

const MAX_I32 = 2_147_483_647;

function createMemoizedCompiler(factory: () => ReturnType<typeof SigmaCompiler$.forMainnet>) {
  let instance: ReturnType<typeof factory> | undefined;
  return () => {
    if (!instance) instance = factory();
    return instance;
  };
}

const _getMainnetCompiler = createMemoizedCompiler(() => SigmaCompiler$.forMainnet());
const _getTestnetCompiler = createMemoizedCompiler(() => SigmaCompiler$.forTestnet());

export function compile(script: string, options?: CompilerOptions): CompilerOutput {
  const opt = ensureDefaults(options, COMPILER_DEFAULTS);

  let headerFlags = 0x00 | opt.version;
  if (opt.version > 0 || (opt.version === 0 && opt.includeSize)) {
    headerFlags |= ergoTreeHeaderFlags.sizeInclusion;
  }

  const map: Record<string, Value> = { ...opt.map };
  const placeholders = extractPlaceholders(script);
  const valueMap = new Map<string, PlaceholderInfo>();
  let numericId = MAX_I32; // start from a high number to avoid collisions with user-defined values
  for (const placeholder of placeholders) {
    if (placeholder.name in map) {
      continue;
    }

    if (placeholder.type === "Coll[Byte]") {
      const data = placeholder.value || hex.encode(randomBytes(16));
      const value = SColl(SByte, data).toHex();
      valueMap.set(data, placeholder);

      map[placeholder.name] = Value$.fromHex(value);
    } else if (placeholder.type === "Int") {
      const value = SInt(Number(placeholder.value || numericId--));

      valueMap.set(value.data.toString(), placeholder);
      map[placeholder.name] = Value$.fromHex(value.toHex());
    } else if (placeholder.type === "Long") {
      const value = SLong(BigInt(placeholder.value || numericId--));

      valueMap.set(value.data.toString(), placeholder);
      map[placeholder.name] = Value$.fromHex(value.toHex());
    } else {
      throw new Error(
        `The "${placeholder.type}" type for placeholder "${placeholder.name}" is not supported.`
      );
    }
  }

  const compiler = opt.network === "mainnet" ? _getMainnetCompiler() : _getTestnetCompiler();
  const output = compiler
    .compile(map, opt.segregateConstants, headerFlags, script)
    // use .toHex() to avoid production errors as fullOpt builder of Sigma-JS renames .bytes().u
    // to something else
    .toHex();

  const tree = new ErgoTree(output, opt.network === "mainnet" ? Network.Mainnet : Network.Testnet);

  return {
    tree,
    parseConstants: () =>
      tree.constants.map((constant, i) => ({
        index: i.toString(),
        type: sanitizeTypeNamePrefix(constant.type.toString()),
        value: constant.data,
        placeholder: valueMap.get(stringifyData(constant.data))
      }))
  };
}

function sanitizeTypeNamePrefix(typeName: string): string {
  return typeName.replace(
    /S(BigInt|Bool|Byte|GroupElement|Int|Long|Short|Coll|Tuple|SigmaProp)/g,
    (_, key) => key.replace("S", "") // remove leading 'S' from type names
  );
}

export type ConstantInfo = {
  index: string;
  type: string;
  value: unknown;
  placeholder?: PlaceholderInfo;
};

type CompilerOutput = {
  tree: ErgoTree;
  parseConstants: () => ConstantInfo[];
};

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
