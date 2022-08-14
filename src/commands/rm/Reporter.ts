import { WalkerEntry } from "@warmsea/cl";

export interface Reporter {
  onStart(path: string): void;
  onRemovedDir(entry: WalkerEntry): void;
  onRemovedFile(entry: WalkerEntry): void;
  onEnd(path: string): void;
}
