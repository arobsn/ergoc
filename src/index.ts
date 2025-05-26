import { buildCli } from "./cli";
import { compileScript } from "./compiler";
import { error, output } from "./console";
import { parseNetwork } from "./flags";

const cli = buildCli();

if (!cli.input.length || !cli.input[0]) cli.showHelp();

try {
  const tree = compileScript(cli.input[0] as string, parseNetwork(cli.flags.network));
  output(tree, cli.flags);
} catch (e) {
  error(String(e));
}
