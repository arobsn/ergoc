import { watch as fileWatch } from "node:fs";
import { gray, green, white } from "picocolors";
import { compile } from "./compiler";
import type { CompilerFlags } from "./flags";

export async function watch(filename: string, flags: CompilerFlags) {
  watchCompile(filename, flags);

  if (flags.watch) {
    const watcher = fileWatch(filename as string, (e) => {
      if (e !== "change") return;

      watchCompile(filename, flags);
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
}

function watchCompile(filename: string, flags: CompilerFlags) {
  console.clear();
  compile(filename, flags, { exitOnError: false });
  logWatchingUI(flags);
}

function logWatchingUI(flags: CompilerFlags): void {
  if (flags.compact) return;

  console.log();
  console.log(green("Waiting for changes..."));
  console.log(gray(`Press ${white("Ctrl+C")} to exit`));
}
