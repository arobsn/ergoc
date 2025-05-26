import { watch } from "node:fs";
import { buildCli } from "./cli";
import { compileScript } from "./compiler";
import { error } from "./console";

const cli = buildCli();

if (!cli.input.length || !cli.input[0]) cli.showHelp();

safeCompile({ exitOnError: !cli.flags.watch });
if (cli.flags.watch) {
  watch(cli.input[0] as string, () => safeCompile({ exitOnError: false }));
} else {
  process.exit(0);
}

function safeCompile(opt = { exitOnError: true }): void {
  try {
    compileScript(cli.input[0] as string, cli.flags);
  } catch (e) {
    error(String(e));
    if (opt.exitOnError) process.exit(1);
  }
}
