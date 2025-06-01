import { InvalidParameterError } from "./errors";

export const base16Encodings = new Set(["hex", "base16", "b16"]);
export const base58Encodings = new Set(["base58", "b58", "addr", "address"]);
export const allEncodings = new Set([...base16Encodings.keys(), ...base58Encodings.keys()]);
export const networks = new Set(["mainnet", "testnet"]);
export const ergoTreeVersions = new Set(["0", "1", "2", "3", "latest"]);

export function parseEncoding(encoding: string): "base16" | "base58" {
  if (!allEncodings.has(encoding)) throw new InvalidParameterError(encoding, allEncodings);
  return base16Encodings.has(encoding) ? "base16" : "base58";
}

export function parseNetwork(network: string): "mainnet" | "testnet" {
  if (!networks.has(network)) throw new InvalidParameterError(network, networks);
  return network as "mainnet" | "testnet";
}

export function parseErgoTreeVersion(version: string): number {
  if (!ergoTreeVersions.has(version)) throw new InvalidParameterError(version, ergoTreeVersions);
  if (version === "latest") return 2; // 2 is the latest activated ErgoTree version
  return Number.parseInt(version, 10) as number;
}

export interface CompilerFlags {
  network: string;
  ergotreeVersion: string;
  constSegregation: boolean;
  sizeInfo: boolean;
  encoding: string;
  compact: boolean;
  verbose: boolean;
  watch: boolean;
}
