import { buildCli } from "./cli";

const cli = buildCli();

if (!cli.input.length) cli.showHelp(0);
