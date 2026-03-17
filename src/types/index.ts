export type TuningSystemKind = "12-tet" | "just" | "pythagorean" | "custom-tet" | "tunejs";
export type TunePresetId =
  | "ji_12"
  | "ji_12a"
  | "ji_12b"
  | "ji_12c"
  | "johnston"
  | "ji_19"
  | "johnston_21"
  | "mean19"
  | "pyth_12"
  | "pyth_31"
  | "slendro"
  | "xenakis_chrom"
  | "couperin"
  | "partch_43"
  | "ptolemy"
  | "ptolemy_iast"
  | "ptolemy_meta"
  | "zarlino2"
  | "young-lm_piano"
  | "helmholtz_pure";

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

export interface TunePresetSystem extends TuningSystemBase {
  kind: "tunejs";
  preset: TunePresetId;
}

export type TuningSystem = TwelveTET | JustIntonation | Pythagorean | CustomTET | TunePresetSystem;

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
