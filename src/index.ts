import { buildCli } from "./cli";
import { compileScript } from "./compiler";
import { error } from "./console";

const cli = buildCli();

if (!cli.input.length || !cli.input[0]) cli.showHelp();

try {
  compileScript(cli.input[0] as string, cli.flags);
} catch (e) {
  error(String(e));
}
