import { buildCli } from "./cli";
import { compile } from "./compiler";
import { watch } from "./watcher";

const cli = buildCli();

if (!cli.input.length || !cli.input[0]) cli.showHelp();

const filename = cli.input[0] as string;
if (cli.flags.watch) {
  await watch(filename, cli.flags);
} else {
  await compile(filename, cli.flags);
}
