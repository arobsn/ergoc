import { existsSync, readFileSync } from "node:fs";
import { compile } from "@fleet-sdk/compiler";

export function compileScript(file: string, network: "mainnet" | "testnet") {
  if (!existsSync(file)) throw new Error(`Couldn't not find script file: ${file}`);

  const script = readFileSync(file, "utf-8");
  return compile(script, { network });
}
