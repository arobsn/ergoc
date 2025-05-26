export const base16Encodings = new Set(["hex", "base16", "b16"]);
export const base58Encodings = new Set(["base58", "b58", "addr", "address"]);
export const allEncodings = new Set([...base16Encodings.keys(), ...base58Encodings.keys()]);
export const networks = new Set(["mainnet", "testnet"]);
export const ergoTreeVersions = new Set(["0", "1", "latest"]);

export function parseEncoding(encoding: string): "base16" | "base58" {
  if (!allEncodings.has(encoding)) throw invalidParameterError(encoding, allEncodings);
  return base16Encodings.has(encoding) ? "base16" : "base58";
}

export function parseNetwork(network: string): "mainnet" | "testnet" {
  if (!networks.has(network)) throw invalidParameterError(network, networks);
  return network as "mainnet" | "testnet";
}

export function parseErgoTreeVersion(version: string): 0 | 1 {
  if (!ergoTreeVersions.has(version)) throw invalidParameterError(version, ergoTreeVersions);
  if (version === "0") return 0;
  return 1; // "1" or "latest" both map to ErgoTree version 1
}

function invalidParameterError(param: string, validOptions: Set<string>): Error {
  return new Error(
    `Invalid parameter: '${param}'. Valid options are: ${Array.from(validOptions).join(", ")}`
  );
}
