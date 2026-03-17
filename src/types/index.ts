export type TuningSystemKind = "12-tet" | "just" | "pythagorean" | "custom-tet";

interface TuningSystemBase {
  kind: TuningSystemKind;
  rootFrequency: number;
  rootNoteName: string;
}

export interface TwelveTET extends TuningSystemBase {
  kind: "12-tet";
}

export interface JustIntonation extends TuningSystemBase {
  kind: "just";
}

export interface Pythagorean extends TuningSystemBase {
  kind: "pythagorean";
}

export interface CustomTET extends TuningSystemBase {
  kind: "custom-tet";
  divisions: number;
}

export type TuningSystem = TwelveTET | JustIntonation | Pythagorean | CustomTET;

export interface ComputedNote {
  index: number;
  name: string;
  frequency: number;
  ratio: string | null;
  pipeLengthMeters: number;
  centsFromRoot: number;
}

export type UnitSystem = "metric" | "imperial";

export interface SequencerState {
  steps: number;
  bpm: number;
  grid: boolean[][];
  playing: boolean;
}
