import * as Tone from "tone";
import { ComputedNote } from "@/types";

let synth: Tone.Synth | null = null;
let polySynth: Tone.PolySynth | null = null;
let sequenceRef: Tone.Sequence | null = null;
let currentStepCallback: ((step: number) => void) | null = null;

export async function ensureAudioReady(): Promise<void> {
  if (Tone.getContext().state !== "running") {
    await Tone.start();
  }
  if (!synth) {
    synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 },
    }).toDestination();
  }
}

export async function playFrequency(freq: number, duration = "8n"): Promise<void> {
  await ensureAudioReady();
  synth!.triggerAttackRelease(freq, duration);
}

function getPolySynth(): Tone.PolySynth {
  if (!polySynth) {
    polySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.3 },
    }).toDestination();
    polySynth.maxPolyphony = 16;
  }
  return polySynth;
}

export async function startSequence(
  grid: boolean[][],
  notes: ComputedNote[],
  steps: number,
  bpm: number,
  onStep?: (step: number) => void,
): Promise<void> {
  await ensureAudioReady();
  const poly = getPolySynth();
  Tone.getTransport().bpm.value = bpm;
  currentStepCallback = onStep || null;

  sequenceRef?.dispose();

  const stepIndices = Array.from({ length: steps }, (_, i) => i);

  sequenceRef = new Tone.Sequence(
    (time, stepIndex) => {
      const freqs: number[] = [];
      for (let noteIdx = 0; noteIdx < notes.length; noteIdx++) {
        if (grid[noteIdx]?.[stepIndex]) {
          freqs.push(notes[noteIdx].frequency);
        }
      }
      if (freqs.length > 0) {
        poly.triggerAttackRelease(freqs, "16n", time);
      }
      const onStep = currentStepCallback;
      if (onStep) {
        Tone.getDraw().schedule(() => {
          onStep(stepIndex);
        }, time);
      }
    },
    stepIndices,
    "8n",
  );

  sequenceRef.start(0);
  Tone.getTransport().start();
}

export function stopSequence(): void {
  Tone.getTransport().stop();
  sequenceRef?.stop();
  currentStepCallback = null;
}

export function disposeSequence(): void {
  stopSequence();
  sequenceRef?.dispose();
  sequenceRef = null;
}
