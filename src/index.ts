import { watch } from "node:fs";
import { buildCli } from "./cli";
import { compileScript } from "./compiler";
import { error, logWatchingUI } from "./console";

const cli = buildCli();

if (!cli.input.length || !cli.input[0]) cli.showHelp();

safeCompile({ exitOnError: !cli.flags.watch, recompiling: false });
if (cli.flags.watch) {
  const watcher = watch(cli.input[0] as string, () => {
    console.clear();
    safeCompile({ exitOnError: false, recompiling: true });
  });

  process.on("SIGINT", () => watcher.close()); // Close the watcher on Ctrl+C
  process.on("SIGTERM", () => watcher.close()); // Close the watcher on termination
} else {
  process.exit(0);
}

function safeCompile(
  { exitOnError, recompiling } = { exitOnError: true, recompiling: false }
): void {
  try {
    compileScript(cli.input[0] as string, cli.flags, { recompiling });
  } catch (e) {
    error(String(e));
    if (exitOnError) process.exit(1);
  }

  if (!cli.flags.compact && cli.flags.watch) logWatchingUI();
}
