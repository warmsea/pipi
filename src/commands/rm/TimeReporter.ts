import { WalkerEntry } from "@warmsea/cl";
import { debounce, DebouncedFunc } from "lodash";
import { Reporter } from "./Reporter";

export class TimeReporter implements Reporter {
  private dirRemoved = 0;
  private filesRemoved = 0;
  private debouncedPrint: DebouncedFunc<() => void>;

  constructor() {
    this.debouncedPrint = debounce(this.printStatus, 5000);
  }

  public onStart(path: string): void {
    console.log(`Removing ${path}...`);
  }

  public onRemovedDir(_entry: WalkerEntry): void {
    this.dirRemoved++;
    this.debouncedPrint();
  }

  public onRemovedFile(_entry: WalkerEntry): void {
    this.filesRemoved++;
    this.debouncedPrint();
  }

  public onEnd(_path: string): void {
    this.debouncedPrint.cancel();
    this.printStatus();
  }

  private printStatus(): void {
    console.log(`  Removed directories: ${this.dirRemoved}, files: ${this.filesRemoved}`);
  }
}
