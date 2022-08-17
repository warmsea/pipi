import { WalkerEntry } from "@warmsea/cl";
import { throttle, DebouncedFunc } from "lodash";
import { Reporter } from "./Reporter";

export class TimeReporter implements Reporter {
  private dirRemoved = 0;
  private filesRemoved = 0;
  private throttleWait = 5000;
  private throttledPrint: DebouncedFunc<() => void>;

  constructor() {
    this.throttledPrint = throttle(this.printStatus, this.throttleWait, { leading: false });
  }

  public onStart(path: string): void {
    console.log(`Removing ${path}...`);
  }

  public onRemovedDir(_entry: WalkerEntry): void {
    this.dirRemoved++;
    this.throttledPrint();
  }

  public onRemovedFile(_entry: WalkerEntry): void {
    this.filesRemoved++;
    this.throttledPrint();
  }

  public onEnd(_path: string): void {
    this.throttledPrint.cancel();
    this.printStatus();
  }

  private printStatus(): void {
    console.log(`  Removed directories: ${this.dirRemoved}, files: ${this.filesRemoved}`);
  }
}
