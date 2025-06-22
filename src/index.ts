import { buildCli } from "./cli";
import { watch } from "./watcher";
import { compile } from "./compiler";

const cli = buildCli();

if (!cli.input.length || !cli.input[0]) cli.showHelp();

const filename = cli.input[0] as string;
if (cli.flags.watch) {
  await watch(filename, cli.flags);
} else {
  await compile(filename, cli.flags);
}
