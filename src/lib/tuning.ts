import { ComputedNote } from "@/types";
import { NOTE_NAMES, JUST_RATIOS_5LIMIT } from "./constants";

function noteNameForSemitone(rootNoteIndex: number, semitone: number, octaveOffset: number): string {
  const noteIndex = (rootNoteIndex + semitone) % 12;
  const octave = 4 + octaveOffset + Math.floor((rootNoteIndex + semitone) / 12);
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

function getRootNoteIndex(rootNoteName: string): number {
  const notePart = rootNoteName.replace(/\d+$/, "");
  return NOTE_NAMES.indexOf(notePart as (typeof NOTE_NAMES)[number]);
}

export function equalTemperament(
  rootFreq: number,
  rootNoteName: string,
  divisions: number = 12,
  octaves: number = 1
): ComputedNote[] {
  const notes: ComputedNote[] = [];
  const totalSteps = divisions * octaves + 1;
  const rootIndex = divisions === 12 ? getRootNoteIndex(rootNoteName) : -1;

  for (let i = 0; i < totalSteps; i++) {
    const freq = rootFreq * Math.pow(2, i / divisions);
    const cents = (1200 / divisions) * i;
    const name =
      divisions === 12
        ? noteNameForSemitone(rootIndex, i, 0)
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
  const rootIndex = getRootNoteIndex(rootNoteName);

  return JUST_RATIOS_5LIMIT.map(([intervalName, num, den], i) => {
    const ratio = num / den;
    const freq = rootFreq * ratio;
    const cents = 1200 * Math.log2(ratio);
    const noteName = i === 0 || i === 12
      ? noteNameForSemitone(rootIndex, i === 12 ? 12 : 0, 0)
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
    let num = Math.pow(3, i);
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

  const rootIndex = getRootNoteIndex(rootNoteName);

  const notes: ComputedNote[] = rawNotes.map((n, idx) => ({
    index: idx,
    name: noteNameForSemitone(rootIndex, n.semitoneApprox, 0),
    frequency: n.freq,
    ratio: `3^${n.numPow}/2^${n.denPow}`,
    pipeLengthMeters: 0,
    centsFromRoot: Math.round(n.cents * 100) / 100,
  }));

  // Add octave
  notes.push({
    index: 12,
    name: noteNameForSemitone(rootIndex, 12, 0),
    frequency: rootFreq * 2,
    ratio: "2:1",
    pipeLengthMeters: 0,
    centsFromRoot: 1200,
  });

  return notes;
}
