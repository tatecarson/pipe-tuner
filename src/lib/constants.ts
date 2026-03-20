import { TunePresetId } from "@/types";

export const DEFAULT_ROOT_FREQUENCY = 440;
export const DEFAULT_TEMPERATURE = 20;
export const DEFAULT_A4 = 440;
export const DEFAULT_PIPE_DIAMETER_MM = 25;
export const DEFAULT_CHIME_REFERENCE_LENGTH_MM = 300;

export const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B",
] as const;

const ROOT_NOTE_START_OCTAVE = 1;
const ROOT_NOTE_END_OCTAVE = 5;
const A4_INDEX = NOTE_NAMES.indexOf("A");

export const ROOT_NOTE_OPTIONS = Array.from(
  { length: (ROOT_NOTE_END_OCTAVE - ROOT_NOTE_START_OCTAVE + 1) * NOTE_NAMES.length },
  (_, index) => {
    const octave = ROOT_NOTE_START_OCTAVE + Math.floor(index / NOTE_NAMES.length);
    const noteIndex = index % NOTE_NAMES.length;
    const semitonesFromA4 = (octave - 4) * 12 + (noteIndex - A4_INDEX);
    const frequency = 440 * Math.pow(2, semitonesFromA4 / 12);

    return {
      name: `${NOTE_NAMES[noteIndex]}${octave}`,
      frequency: Math.round(frequency * 100) / 100,
    };
  }
);

// 5-limit just intonation ratios: [name, numerator, denominator]
export const JUST_RATIOS_5LIMIT: [string, number, number][] = [
  ["Unison (P1)", 1, 1],
  ["Minor 2nd", 16, 15],
  ["Major 2nd", 9, 8],
  ["Minor 3rd", 6, 5],
  ["Major 3rd", 5, 4],
  ["Perfect 4th", 4, 3],
  ["Tritone", 45, 32],
  ["Perfect 5th", 3, 2],
  ["Minor 6th", 8, 5],
  ["Major 6th", 5, 3],
  ["Minor 7th", 9, 5],
  ["Major 7th", 15, 8],
  ["Octave (P8)", 2, 1],
];

export const PYTHAGOREAN_NOTE_NAMES = [
  "P1", "m2", "M2", "m3", "M3", "P4",
  "TT", "P5", "m6", "M6", "m7", "M7", "P8",
];

export const DEFAULT_SEQUENCER_STEPS = 16;
export const DEFAULT_BPM = 120;

export const TUNE_PRESET_OPTIONS: { id: TunePresetId; label: string; description: string }[] = [
  {
    id: "ji_12",
    label: "JI 12",
    description: "Basic 12-tone just intonation",
  },
  {
    id: "ji_12a",
    label: "JI 12A",
    description: "7-limit 12-tone scale",
  },
  {
    id: "ji_12b",
    label: "JI 12B",
    description: "Alternate 7-limit 12-tone scale",
  },
  {
    id: "ji_12c",
    label: "JI 12C",
    description: "Sauveur/Kurzweil natural b7",
  },
  {
    id: "johnston",
    label: "Johnston",
    description: "Combined otonal-utonal scale",
  },
  {
    id: "ji_19",
    label: "JI 19",
    description: "5-limit 19-tone scale",
  },
  {
    id: "johnston_21",
    label: "Johnston 21",
    description: "21-note just enharmonic scale",
  },
  {
    id: "mean19",
    label: "Mean19",
    description: "5/19-comma meantone scale",
  },
  {
    id: "pyth_12",
    label: "Pyth 12",
    description: "12-tone Pythagorean scale",
  },
  {
    id: "pyth_31",
    label: "Pyth 31",
    description: "31-tone Pythagorean scale",
  },
  {
    id: "slendro",
    label: "Slendro",
    description: "Observed Javanese Slendro scale",
  },
  {
    id: "xenakis_chrom",
    label: "Xenakis Chrom",
    description: "Byzantine liturgical mode",
  },
  {
    id: "couperin",
    label: "Couperin",
    description: "Couperin modified meantone",
  },
  {
    id: "partch_43",
    label: "Partch 43",
    description: "Harry Partch's 43-tone pure scale",
  },
  {
    id: "ptolemy",
    label: "Ptolemy",
    description: "Intense Diatonic Syntonon",
  },
  {
    id: "ptolemy_iast",
    label: "Ptolemy Iast",
    description: "Iastia or Lydia tuning",
  },
  {
    id: "ptolemy_meta",
    label: "Ptolemy Meta",
    description: "Metabolika lyra tuning",
  },
  {
    id: "zarlino2",
    label: "Zarlino 16",
    description: "16-note Zarlino choice system",
  },
  {
    id: "young-lm_piano",
    label: "Young Piano",
    description: "LaMonte Young's Well-Tempered Piano",
  },
  {
    id: "helmholtz_pure",
    label: "Helmholtz Pure",
    description: "Helmholtz's two-keyboard harmonium tuning",
  },
];
