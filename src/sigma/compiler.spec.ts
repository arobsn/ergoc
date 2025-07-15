import { describe, expect, it, test } from "bun:test";
import { ErgoAddress, Network } from "@fleet-sdk/core";
import { hex } from "@fleet-sdk/crypto";
import { Value$ } from "sigmastate-js/main";
import { COMPILER_DEFAULTS, type CompilerOptions, compile } from "./compiler";

const compilerTestVectors: {
  name: string;
  script: string;
  tree: string;
  template: string;
  options: CompilerOptions;
}[] = [
  {
    name: "v0 - Segregated constants",
    script: "sigmaProp(HEIGHT > 100 && HEIGHT < 200)",
    tree: "100204c801049003d1ed91a373008fa37301",
    template: "d1ed91a373008fa37301",
    options: { version: 0, segregateConstants: true, includeSize: false }
  },
  {
    name: "v0 - Segregated constants",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "100104c801d191a37300",
    template: "d191a37300",
    options: { version: 0, segregateConstants: true, includeSize: false }
  },
  {
    name: "v0 - Embedded constants",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "00d191a304c801",
    template: "d191a304c801",
    options: { version: 0, segregateConstants: false, includeSize: false }
  },
  {
    name: "v0 - Tree size included",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "0806d191a304c801",
    template: "d191a304c801",
    options: { version: 0, segregateConstants: false, includeSize: true }
  },
  {
    name: "v0 - Tree size included and constant segregated",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "18090104c801d191a37300",
    template: "d191a37300",
    options: { version: 0, segregateConstants: true, includeSize: true }
  },
  {
    name: "v0 - Named constants",
    script: "sigmaProp(HEIGHT > deadline)",
    tree: "100104c801d191a37300",
    template: "d191a37300",
    options: {
      version: 0,
      segregateConstants: true,
      includeSize: false,
      map: { deadline: Value$.ofInt(100) }
    }
  },
  {
    name: "v1 - Segregated constants",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "19090104c801d191a37300",
    template: "d191a37300",
    options: { version: 1, segregateConstants: true }
  },
  {
    name: "v1 - Embedded constants",
    script: "sigmaProp(HEIGHT > 100)",
    tree: "0906d191a304c801",
    template: "d191a304c801",
    options: { version: 1, segregateConstants: false }
  },
  {
    name: "v1 - Named constants",
    script: "sigmaProp(HEIGHT > deadline)",
    tree: "19090104c801d191a37300",
    template: "d191a37300",
    options: {
      version: 1,
      segregateConstants: true,
      map: { deadline: Value$.ofInt(100) }
    }
  }
];

describe("ErgoScript Compiler", () => {
  test.each(compilerTestVectors)("Script compilation: $name", (tv) => {
    const output = compile(tv.script, tv.options);

    expect(output.tree.toHex()).toBe(tv.tree);
    expect(hex.encode(output.tree.template)).toBe(tv.template);
    expect(hex.encode(output.tree.template)).toBe(tv.template);

    expect(output.tree.hasSegregatedConstants).toBe(tv.options.segregateConstants ?? false);
    expect(output.tree.version).toBe(tv.options.version ?? 1);

    if (tv.options.version === 1) {
      expect(output.tree.hasSize).toBe(true);
    } else if (tv.options.version === 0) {
      expect(output.tree.hasSize).toBe(tv.options.includeSize ?? false);
    }

    if (tv.options.segregateConstants) {
      expect(output.tree.constants).not.toBeEmpty();
    } else {
      expect(output.tree.constants).toBeEmpty();
    }
  });

  const testnetScript = 'PK("3WzH5yEJongYHmBJnoMs3zeK3t3fouMi3pigKdEURWcD61pU6Eve")';
  const mainnetScript = 'PK("9f3iPJTiciBYA6DnTeGy98CvrwyEhiP7wNrhDrQ1QeKPRhTmaqQ")';

  it("Should compile for testnet", () => {
    expect(() => compile(testnetScript, { network: "testnet" })).not.toThrow();
  });

  it("should override network from compiler options", () => {
    const testnetOutput = compile(testnetScript, { network: "testnet" });
    expect(ErgoAddress.decode(testnetOutput.tree.encode()).network).toBe(Network.Testnet);

    const mainnetOutput = compile(mainnetScript, { network: "mainnet" });
    expect(ErgoAddress.decode(mainnetOutput.tree.encode()).network).toBe(Network.Mainnet);
  });

  it("Should compile for mainnet", () => {
    // should default to mainnet
    expect(() => compile(mainnetScript)).not.toThrow();
    // explicitly set mainnet
    expect(() => compile(mainnetScript, { network: "mainnet" })).not.toThrow();
  });

  it("Should use default if no compiler options is set", () => {
    const { version, segregateConstants } = COMPILER_DEFAULTS;

    const output = compile("sigmaProp(HEIGHT > 100)");
    expect(output.tree.toHex()).toBe("19090104c801d191a37300");
    expect(output.tree.hasSegregatedConstants).toBe(segregateConstants);
    expect(output.tree.version).toBe(version);
    expect(output.tree.hasSize).toBe(
      version > 0 || (version === 0 && COMPILER_DEFAULTS.includeSize)
    );
  });
});
