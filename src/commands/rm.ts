import { lstatSync, rmdirSync, unlinkSync } from "fs";

import { walk, WalkOnDir } from "@warmsea/cl";
import { Arguments, CommandModule } from "yargs";

import { TimeReporter } from "./rm/TimeReporter";

interface Argv {
  files: string[];

  dryRun: boolean;
  recursive: boolean;
}

const rm: CommandModule<Argv, Argv> = {
  command: "rm <files...>",
  describe: "Remove files and folders",
  builder: {
    dryRun: {
      describe: "Dry run, it will not remove anything",
      type: "boolean",
      default: true, // TODO
    },
    recursive: {
      alias: "r",
      describe: "Remove files and folders recursively",
      type: "boolean",
      default: false,
    },
  },
  handler: (argv: Arguments<Argv>) => {
    const remover = new Remover();
    argv.files.forEach((path) => {
      remover.remove(path, argv);
    });
  },
};

class Remover {
  public remove(path: string, argv: Argv): void {
    const { recursive } = argv;
    if (recursive) {
      this.removeRecursively(path, argv);
    } else {
      this.removeSingleFile(path, argv);
    }
  }

  private removeRecursively(path: string, argv: Argv): void {
    const { dryRun } = argv;
    const reporter = new TimeReporter();
    reporter.onStart(path);
    walk(path, {
      walkOnDir: WalkOnDir.Last,
      onEntry: (entry) => {
        if (entry.isDirectory()) {
          if (!dryRun) {
            rmdirSync(entry.pathname);
          }
          reporter.onRemovedDir(entry);
        } else {
          if (!dryRun) {
            unlinkSync(entry.pathname);
          }
          reporter.onRemovedFile(entry);
        }
      },
    }).then(() => {
      reporter.onEnd(path);
    });
  }

  private removeSingleFile(path: string, argv: Argv): void {
    const { dryRun } = argv;
    try {
      const stat = lstatSync(path);
      if (stat.isDirectory()) {
        console.error(`pipi rm: ${path} is a directory`);
      }
      if (!dryRun) {
        unlinkSync(path);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.code === "ENOENT") {
        console.error(`pipi rm: ${path}: No such file or directory`);
      } else {
        console.error(`pipi rm: ${path}: Something went wrong`);
      }
    }
  }
}

export = rm;
