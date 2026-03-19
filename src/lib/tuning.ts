import { ComputedNote } from "@/types";
import { NOTE_NAMES, JUST_RATIOS_5LIMIT } from "./constants";

function parseRootNote(rootNoteName: string): { noteIndex: number; octave: number } {
  const match = rootNoteName.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) {
    return { noteIndex: 0, octave: 4 };
  }

  return {
    noteIndex: NOTE_NAMES.indexOf(match[1] as (typeof NOTE_NAMES)[number]),
    octave: Number(match[2]),
  };
}

function noteNameForSemitone(
  rootNoteIndex: number,
  rootOctave: number,
  semitone: number,
  octaveOffset: number
): string {
  const totalSemitones = rootNoteIndex + semitone;
  const normalizedNoteIndex = ((totalSemitones % 12) + 12) % 12;
  const octave = rootOctave + octaveOffset + Math.floor(totalSemitones / 12);
  return `${NOTE_NAMES[normalizedNoteIndex]}${octave}`;
}

export function equalTemperament(
  rootFreq: number,
  rootNoteName: string,
  divisions: number = 12,
  octaves: number = 1
): ComputedNote[] {
  const notes: ComputedNote[] = [];
  const totalSteps = divisions * octaves + 1;
  const { noteIndex: rootIndex, octave: rootOctave } = parseRootNote(rootNoteName);

  for (let i = 0; i < totalSteps; i++) {
    const freq = rootFreq * Math.pow(2, i / divisions);
    const cents = (1200 / divisions) * i;
    const name =
      divisions === 12
        ? noteNameForSemitone(rootIndex, rootOctave, i, 0)
        : `${i}/${divisions}`;

    notes.push({
      index: i,
      name,
      frequency: freq,
      ratio: null,
      pipeLengthMeters: 0,
      centsFromRoot: Math.round(cents * 100) / 100,
    });
  }
  return notes;
}

export function justIntonation(rootFreq: number, rootNoteName: string): ComputedNote[] {
  const { noteIndex: rootIndex, octave: rootOctave } = parseRootNote(rootNoteName);

  return JUST_RATIOS_5LIMIT.map(([intervalName, num, den], i) => {
    const ratio = num / den;
    const freq = rootFreq * ratio;
    const cents = 1200 * Math.log2(ratio);
    const noteName = i === 0 || i === 12
      ? noteNameForSemitone(rootIndex, rootOctave, i === 12 ? 12 : 0, 0)
      : intervalName;

    return {
      index: i,
      name: noteName,
      frequency: freq,
      ratio: `${num}:${den}`,
      pipeLengthMeters: 0,
      centsFromRoot: Math.round(cents * 100) / 100,
    };
  });
}

export function pythagorean(rootFreq: number, rootNoteName: string): ComputedNote[] {
  const rawNotes: { semitoneApprox: number; freq: number; numPow: number; denPow: number; cents: number }[] = [];

  // Generate 12 notes by stacking fifths
  for (let i = 0; i < 12; i++) {
    // ratio = 3^i / 2^i, then octave-reduce to [1, 2)
    const num = Math.pow(3, i);
    let den = Math.pow(2, i);
    while (num / den >= 2) den *= 2;
    const ratio = num / den;
    const cents = 1200 * Math.log2(ratio);
    rawNotes.push({
      semitoneApprox: Math.round(cents / 100),
      freq: rootFreq * ratio,
      numPow: i,
      denPow: Math.round(Math.log2(den)),
      cents,
    });
  }

  // Sort by frequency
  rawNotes.sort((a, b) => a.freq - b.freq);

  const { noteIndex: rootIndex, octave: rootOctave } = parseRootNote(rootNoteName);

  const notes: ComputedNote[] = rawNotes.map((n, idx) => ({
    index: idx,
    name: noteNameForSemitone(rootIndex, rootOctave, n.semitoneApprox, 0),
    frequency: n.freq,
    ratio: `3^${n.numPow}/2^${n.denPow}`,
    pipeLengthMeters: 0,
    centsFromRoot: Math.round(n.cents * 100) / 100,
  }));

  // Add octave
  notes.push({
    index: 12,
    name: noteNameForSemitone(rootIndex, rootOctave, 12, 0),
    frequency: rootFreq * 2,
    ratio: "2:1",
    pipeLengthMeters: 0,
    centsFromRoot: 1200,
  });

  return notes;
}
