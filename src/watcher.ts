import { watch as fileWatch } from "node:fs";
import { gray, green, white } from "picocolors";
import { compile } from "./compiler";
import type { CompilerFlags } from "./flags";
import { log } from "./logger";

const EXIT_ON_ERROR = false;

export async function watch(filename: string, flags: CompilerFlags) {
  watchCompile(filename, flags);

  if (flags.watch) {
    const watcher = fileWatch(filename as string, async (e) => {
      if (e !== "change") return;
      await watchCompile(filename, flags);
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

async function watchCompile(filename: string, flags: CompilerFlags) {
  console.clear();
  await compile(filename, flags, EXIT_ON_ERROR);
  logWatchingUI(flags);
}

function logWatchingUI(flags: CompilerFlags): void {
  if (flags.compact) return;

  log
    .nl()
    .content(green("Waiting for changes..."))
    .content(gray(`Press ${white("Ctrl+C")} to exit`));
}
