export const DEFAULT_ROOT_FREQUENCY = 440;
export const DEFAULT_TEMPERATURE = 20;
export const DEFAULT_A4 = 440;

export const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B",
] as const;

export const ROOT_NOTE_OPTIONS = [
  { name: "C4", frequency: 261.63 },
  { name: "C#4", frequency: 277.18 },
  { name: "D4", frequency: 293.66 },
  { name: "D#4", frequency: 311.13 },
  { name: "E4", frequency: 329.63 },
  { name: "F4", frequency: 349.23 },
  { name: "F#4", frequency: 369.99 },
  { name: "G4", frequency: 392.0 },
  { name: "G#4", frequency: 415.3 },
  { name: "A4", frequency: 440.0 },
  { name: "A#4", frequency: 466.16 },
  { name: "B4", frequency: 493.88 },
] as const;

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
