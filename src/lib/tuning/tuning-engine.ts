import { noteToHz } from "@/lib/audio/note-utils";
import type { OpenStringTarget, TuningConfig } from "./types";

/**
 * Encapsulates tuning schema and derived open-string targets.
 * Swap configs to change behavior without touching UI or audio code.
 */
export class TuningEngine {
  constructor(private config: TuningConfig) {}

  getConfig(): TuningConfig {
    return this.config;
  }

  setConfig(config: TuningConfig): void {
    this.config = config;
  }

  /** Open-string frequencies for the current tuning (low → high). */
  getOpenStringTargets(referenceHz = 440): OpenStringTarget[] {
    const { notes } = this.config;
    return notes.map((note, i) => ({
      stringIndex: notes.length - i,
      note,
      hz: noteToHz(note, referenceHz),
    }));
  }
}
