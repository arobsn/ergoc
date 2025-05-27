import { watch } from "node:fs";
import { buildCli } from "./cli";
import { compileScript } from "./compiler";
import { error, logWatchingUI } from "./console";

const cli = buildCli();

if (!cli.input.length || !cli.input[0]) cli.showHelp();

safeCompile({ exitOnError: !cli.flags.watch, recompiling: false });
if (cli.flags.watch) {
  const watcher = watch(cli.input[0] as string, (e) => {
    if (e !== "change") return;
    console.clear();
    safeCompile({ exitOnError: false, recompiling: true });
  });

  // Prevent watcher leak by handling process exit and uncaught exceptions
  const cleanup = () => watcher.close();

  process.on("SIGINT", cleanup); // Close the watcher on Ctrl+C
  process.on("SIGTERM", cleanup); // Close the watcher on termination
  process.on("exit", cleanup); // Close the watcher on normal exit
  process.on("uncaughtException", cleanup); // Close the watcher on uncaught exceptions
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
