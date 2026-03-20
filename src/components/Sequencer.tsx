"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { ComputedNote, UnitSystem } from "@/types";
import { startSequence, stopSequence, disposeSequence } from "@/lib/audio";
import { DEFAULT_SEQUENCER_STEPS, DEFAULT_BPM } from "@/lib/constants";
import { formatLength } from "@/lib/pipe";

interface SequencerProps {
  notes: ComputedNote[];
  unitSystem: UnitSystem;
  noteLengthFactor: number;
  lengthLabel: string;
}

interface EuclideanTrack {
  position: number;
  pulses: number;
  rotation?: number;
}

interface EuclideanPreset {
  id: string;
  name: string;
  description: string;
  tracks: EuclideanTrack[];
  expandedTracks?: EuclideanTrack[];
}

interface SequenceTrack {
  anchorCents: number;
  pattern: boolean[];
}

const EUCLIDEAN_PRESETS: EuclideanPreset[] = [
  {
    id: "foundry",
    name: "Foundry Pulse",
    description: "Root drone with a staggered fifth and octave accents.",
    tracks: [
      { position: 0, pulses: 5, rotation: 0 },
      { position: 7 / 12, pulses: 3, rotation: 2 },
      { position: 1, pulses: 2, rotation: 8 },
    ],
  },
  {
    id: "bronze",
    name: "Bronze Clave",
    description: "Interlocking lower partials with a clipped top accent.",
    tracks: [
      { position: 0, pulses: 3, rotation: 0 },
      { position: 4 / 12, pulses: 5, rotation: 1 },
      { position: 7 / 12, pulses: 4, rotation: 5 },
      { position: 10 / 12, pulses: 2, rotation: 11 },
    ],
  },
  {
    id: "spiral",
    name: "Spiral Steps",
    description: "Ascending Euclidean hits that climb into the octave.",
    tracks: [
      { position: 0, pulses: 2, rotation: 0 },
      { position: 2 / 12, pulses: 3, rotation: 2 },
      { position: 5 / 12, pulses: 4, rotation: 4 },
      { position: 7 / 12, pulses: 5, rotation: 6 },
      { position: 1, pulses: 3, rotation: 10 },
    ],
  },
  {
    id: "anvil",
    name: "Anvil March",
    description: "Heavy downbeats with a sparse upper strike pattern.",
    tracks: [
      { position: 0, pulses: 4, rotation: 0 },
      { position: 3 / 12, pulses: 2, rotation: 3 },
      { position: 7 / 12, pulses: 3, rotation: 6 },
      { position: 1, pulses: 2, rotation: 12 },
    ],
  },
  {
    id: "lattice",
    name: "Lattice Bloom",
    description: "Dense inner motion wrapped around a steady root pulse.",
    tracks: [
      { position: 0, pulses: 5, rotation: 0 },
      { position: 1 / 12, pulses: 7, rotation: 1 },
      { position: 4 / 12, pulses: 5, rotation: 4 },
      { position: 8 / 12, pulses: 3, rotation: 9 },
      { position: 1, pulses: 2, rotation: 13 },
    ],
    expandedTracks: [
      { position: 3 / 12, pulses: 4, rotation: 2 },
      { position: 6 / 12, pulses: 6, rotation: 8 },
      { position: 10 / 12, pulses: 5, rotation: 11 },
    ],
  },
  {
    id: "orbit",
    name: "Orbit Bell",
    description: "Wide-spaced bell tones circling around the octave.",
    tracks: [
      { position: 0, pulses: 2, rotation: 0 },
      { position: 5 / 12, pulses: 3, rotation: 5 },
      { position: 9 / 12, pulses: 2, rotation: 9 },
      { position: 1, pulses: 3, rotation: 12 },
    ],
  },
  {
    id: "weave",
    name: "Cross Weave",
    description: "Three interlocking Euclidean strands with offset accents.",
    tracks: [
      { position: 0, pulses: 3, rotation: 0 },
      { position: 2 / 12, pulses: 5, rotation: 2 },
      { position: 6 / 12, pulses: 7, rotation: 4 },
      { position: 10 / 12, pulses: 4, rotation: 11 },
    ],
  },
  {
    id: "lantern",
    name: "Lantern Drift",
    description: "Slow root lanterns with a shimmering upper halo.",
    tracks: [
      { position: 0, pulses: 2, rotation: 0 },
      { position: 4 / 12, pulses: 3, rotation: 7 },
      { position: 7 / 12, pulses: 2, rotation: 10 },
      { position: 11 / 12, pulses: 5, rotation: 1 },
      { position: 1, pulses: 2, rotation: 14 },
    ],
  },
  {
    id: "engine",
    name: "Engine Room",
    description: "Dense low-cycle drive with faster upper interlocks.",
    tracks: [
      { position: 0, pulses: 9, rotation: 0 },
      { position: 2 / 12, pulses: 5, rotation: 1 },
      { position: 4 / 12, pulses: 11, rotation: 3 },
      { position: 7 / 12, pulses: 7, rotation: 6 },
      { position: 10 / 12, pulses: 13, rotation: 8 },
      { position: 1, pulses: 4, rotation: 12 },
    ],
    expandedTracks: [
      { position: 1 / 12, pulses: 6, rotation: 1 },
      { position: 6 / 12, pulses: 9, rotation: 5 },
      { position: 11 / 12, pulses: 8, rotation: 10 },
    ],
  },
  {
    id: "cascade",
    name: "Cascade Relay",
    description: "Stacked fast and slow strands that tumble through the octave.",
    tracks: [
      { position: 0, pulses: 4, rotation: 0 },
      { position: 1 / 12, pulses: 12, rotation: 1 },
      { position: 3 / 12, pulses: 6, rotation: 4 },
      { position: 6 / 12, pulses: 10, rotation: 7 },
      { position: 8 / 12, pulses: 14, rotation: 9 },
      { position: 1, pulses: 5, rotation: 13 },
    ],
    expandedTracks: [
      { position: 2 / 12, pulses: 8, rotation: 3 },
      { position: 5 / 12, pulses: 11, rotation: 6 },
      { position: 11 / 12, pulses: 9, rotation: 14 },
    ],
  },
  {
    id: "mesh",
    name: "Mesh Drive",
    description: "Polyrhythmic mesh with short-cycle accents over a dense bed.",
    tracks: [
      { position: 0, pulses: 8, rotation: 0 },
      { position: 2 / 12, pulses: 15, rotation: 2 },
      { position: 5 / 12, pulses: 5, rotation: 5 },
      { position: 7 / 12, pulses: 12, rotation: 6 },
      { position: 9 / 12, pulses: 7, rotation: 10 },
      { position: 1, pulses: 3, rotation: 14 },
    ],
    expandedTracks: [
      { position: 1 / 12, pulses: 10, rotation: 1 },
      { position: 4 / 12, pulses: 6, rotation: 4 },
      { position: 11 / 12, pulses: 9, rotation: 12 },
    ],
  },
  {
    id: "torrent",
    name: "Torrent Bells",
    description: "Bright upper-register shimmer riding over slower anchor tones.",
    tracks: [
      { position: 0, pulses: 3, rotation: 0 },
      { position: 4 / 12, pulses: 6, rotation: 3 },
      { position: 7 / 12, pulses: 9, rotation: 5 },
      { position: 10 / 12, pulses: 15, rotation: 7 },
      { position: 11 / 12, pulses: 11, rotation: 11 },
      { position: 1, pulses: 5, rotation: 13 },
    ],
  },
  {
    id: "chorale",
    name: "Glass Chorale",
    description: "Polyphonic chord tones moving in slow overlapping phrases.",
    tracks: [
      { position: 0, pulses: 4, rotation: 0 },
      { position: 2 / 12, pulses: 4, rotation: 2 },
      { position: 4 / 12, pulses: 5, rotation: 4 },
      { position: 7 / 12, pulses: 5, rotation: 6 },
      { position: 9 / 12, pulses: 4, rotation: 9 },
      { position: 1, pulses: 3, rotation: 12 },
    ],
    expandedTracks: [
      { position: 1 / 12, pulses: 4, rotation: 1 },
      { position: 6 / 12, pulses: 4, rotation: 7 },
      { position: 11 / 12, pulses: 3, rotation: 14 },
    ],
  },
  {
    id: "counterline",
    name: "Counterline Bloom",
    description: "Two inner melodic lines braided around a steady bass and top voice.",
    tracks: [
      { position: 0, pulses: 5, rotation: 0 },
      { position: 3 / 12, pulses: 6, rotation: 1 },
      { position: 5 / 12, pulses: 7, rotation: 4 },
      { position: 7 / 12, pulses: 5, rotation: 7 },
      { position: 10 / 12, pulses: 6, rotation: 9 },
      { position: 1, pulses: 4, rotation: 13 },
    ],
  },
  {
    id: "canon",
    name: "Canon Steps",
    description: "Layered entrances that feel like a short canon across chord tones.",
    tracks: [
      { position: 0, pulses: 6, rotation: 0 },
      { position: 2 / 12, pulses: 6, rotation: 2 },
      { position: 4 / 12, pulses: 6, rotation: 4 },
      { position: 7 / 12, pulses: 6, rotation: 6 },
      { position: 9 / 12, pulses: 6, rotation: 8 },
      { position: 1, pulses: 6, rotation: 10 },
    ],
  },
  {
    id: "veil",
    name: "Velvet Voicings",
    description: "Close-position polyphony with drifting upper extensions.",
    tracks: [
      { position: 0, pulses: 7, rotation: 0 },
      { position: 1 / 12, pulses: 5, rotation: 2 },
      { position: 4 / 12, pulses: 8, rotation: 3 },
      { position: 6 / 12, pulses: 6, rotation: 6 },
      { position: 8 / 12, pulses: 7, rotation: 8 },
      { position: 11 / 12, pulses: 5, rotation: 11 },
      { position: 1, pulses: 4, rotation: 14 },
    ],
    expandedTracks: [
      { position: 2 / 12, pulses: 6, rotation: 3 },
      { position: 5 / 12, pulses: 7, rotation: 5 },
      { position: 9 / 12, pulses: 5, rotation: 9 },
    ],
  },
  {
    id: "cathedral",
    name: "Cathedral Weave",
    description: "Seven-voice polyphony with wide-register entrances and overlapping cadences.",
    tracks: [
      { position: 0, pulses: 4, rotation: 0 },
      { position: 1 / 12, pulses: 5, rotation: 1 },
      { position: 3 / 12, pulses: 6, rotation: 3 },
      { position: 5 / 12, pulses: 5, rotation: 5 },
      { position: 7 / 12, pulses: 6, rotation: 7 },
      { position: 9 / 12, pulses: 4, rotation: 10 },
      { position: 1, pulses: 3, rotation: 13 },
    ],
    expandedTracks: [
      { position: 2 / 12, pulses: 5, rotation: 2 },
      { position: 6 / 12, pulses: 7, rotation: 6 },
      { position: 11 / 12, pulses: 4, rotation: 15 },
    ],
  },
  {
    id: "prism",
    name: "Prism Run",
    description: "Eight-note melodic lattice with bright upper spillover in larger tunings.",
    tracks: [
      { position: 0, pulses: 8, rotation: 0 },
      { position: 1 / 12, pulses: 5, rotation: 1 },
      { position: 2 / 12, pulses: 9, rotation: 2 },
      { position: 4 / 12, pulses: 6, rotation: 4 },
      { position: 6 / 12, pulses: 10, rotation: 6 },
      { position: 8 / 12, pulses: 7, rotation: 9 },
      { position: 10 / 12, pulses: 5, rotation: 11 },
      { position: 1, pulses: 4, rotation: 14 },
    ],
    expandedTracks: [
      { position: 3 / 12, pulses: 8, rotation: 3 },
      { position: 7 / 12, pulses: 9, rotation: 8 },
      { position: 11 / 12, pulses: 6, rotation: 13 },
    ],
  },
  {
    id: "constellation",
    name: "Constellation Choir",
    description: "Nine-part melodic cloud that opens up when the tuning has extra degrees.",
    tracks: [
      { position: 0, pulses: 3, rotation: 0 },
      { position: 1 / 12, pulses: 6, rotation: 1 },
      { position: 2 / 12, pulses: 5, rotation: 2 },
      { position: 4 / 12, pulses: 7, rotation: 4 },
      { position: 5 / 12, pulses: 4, rotation: 6 },
      { position: 7 / 12, pulses: 6, rotation: 8 },
      { position: 8 / 12, pulses: 5, rotation: 10 },
      { position: 10 / 12, pulses: 4, rotation: 12 },
      { position: 1, pulses: 3, rotation: 15 },
    ],
    expandedTracks: [
      { position: 3 / 12, pulses: 5, rotation: 3 },
      { position: 6 / 12, pulses: 7, rotation: 7 },
      { position: 11 / 12, pulses: 5, rotation: 14 },
    ],
  },
];

export function Sequencer({ notes, unitSystem, noteLengthFactor, lengthLabel }: SequencerProps) {
  const [steps] = useState(DEFAULT_SEQUENCER_STEPS);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [selectedPresetId, setSelectedPresetId] = useState(EUCLIDEAN_PRESETS[0]?.id ?? "");
  const [tracks, setTracks] = useState<SequenceTrack[]>([]);
  const [exportStatus, setExportStatus] = useState<string>("");
  const [expandedPresetMode, setExpandedPresetMode] = useState(true);
  const noteSignature = notes
    .map((note) => `${note.index}:${note.name}:${note.frequency.toFixed(5)}`)
    .join("|");

  const visibleGrid = useMemo(() => buildVisibleGrid(notes, steps, tracks), [notes, steps, tracks]);
  const activeNotes = useMemo(
    () => notes.filter((_, noteIndex) => visibleGrid[noteIndex]?.some(Boolean)),
    [notes, visibleGrid]
  );
  const pipeLengthLines = useMemo(
    () => activeNotes.map((note) => `${note.name}\t${note.frequency.toFixed(2)} Hz\t${formatLength(note.pipeLengthMeters, unitSystem)}`),
    [activeNotes, unitSystem]
  );
  const pipeLengthText = useMemo(
    () => {
      if (pipeLengthLines.length === 0) {
        return "No active sequencer notes.";
      }

      return [`Note\tFrequency\t${lengthLabel}`, ...pipeLengthLines].join("\n");
    },
    [lengthLabel, pipeLengthLines]
  );
  const hasLargeTuning = notes.length > 13;

  const toggleCell = useCallback((noteIndex: number, step: number) => {
    const next = visibleGrid.map((row) => [...row]);
    if (!next[noteIndex]) return;

    next[noteIndex][step] = !next[noteIndex][step];
    setTracks(tracksFromGrid(next, notes));
  }, [notes, visibleGrid]);

  const handlePlay = useCallback(() => {
    if (playing) {
      stopSequence();
      disposeSequence();
      setPlaying(false);
      setCurrentStep(-1);
      return;
    }

    setCurrentStep(-1);
    setPlaying(true);
  }, [playing]);

  const handleClear = useCallback(() => {
    setTracks([]);
  }, []);

  const handleLoadPreset = useCallback(() => {
    const preset = EUCLIDEAN_PRESETS.find((candidate) => candidate.id === selectedPresetId);
    if (!preset) return;

    setTracks(buildPresetTracks(notes, steps, preset, hasLargeTuning && expandedPresetMode));
  }, [notes, selectedPresetId, steps, hasLargeTuning, expandedPresetMode]);

  const handleCopyPipeLengths = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pipeLengthText);
      setExportStatus("Pipe lengths copied.");
    } catch {
      setExportStatus("Clipboard copy failed.");
    }
  }, [pipeLengthText]);

  const handleDownloadPipeLengths = useCallback(() => {
    const blob = new Blob([pipeLengthText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${lengthLabel.toLowerCase().replace(/\s+/g, "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setExportStatus("Pipe lengths saved.");
  }, [lengthLabel, pipeLengthText]);

  useEffect(() => {
    return () => {
      disposeSequence();
    };
  }, []);

  useEffect(() => {
    if (!exportStatus) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setExportStatus("");
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [exportStatus]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    let cancelled = false;

    void startSequence(visibleGrid, notes, steps, bpm, noteLengthFactor, (step) => {
      if (!cancelled) {
        setCurrentStep(step);
      }
    });

    return () => {
      cancelled = true;
      stopSequence();
    };
  }, [playing, visibleGrid, notes, steps, bpm, noteLengthFactor, noteSignature]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={handlePlay}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm tracking-wide transition-all ${
            playing
              ? "bg-red-900/60 text-red-300 border border-red-800 hover:bg-red-900/80"
              : "bg-amber-800/50 text-amber-200 border border-amber-700 hover:bg-amber-800/70"
          }`}
        >
          {playing ? (
            <>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <rect width="3" height="10" /><rect x="7" width="3" height="10" />
              </svg>
              STOP
            </>
          ) : (
            <>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                <polygon points="0,0 10,6 0,12" />
              </svg>
              PLAY
            </>
          )}
        </button>

        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-md font-mono text-sm tracking-wide bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200 hover:border-zinc-600 transition-all"
        >
          CLEAR
        </button>

        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
            BPM
          </label>
          <input
            type="range"
            min={40}
            max={240}
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            className="w-24 accent-amber-600"
          />
          <span className="font-mono text-sm text-zinc-300 tabular-nums w-8">
            {bpm}
          </span>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
            Euclidean Preset
          </label>
          <select
            value={selectedPresetId}
            onChange={(e) => setSelectedPresetId(e.target.value)}
            className="min-w-[13rem] bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-colors"
          >
            {EUCLIDEAN_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleLoadPreset}
            className="px-4 py-2 rounded-md font-mono text-sm tracking-wide bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-zinc-100 hover:border-zinc-600 transition-all"
          >
            LOAD
          </button>
        </div>

        {hasLargeTuning ? (
          <label className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-xs font-mono text-zinc-300">
            <input
              type="checkbox"
              checked={expandedPresetMode}
              onChange={(e) => setExpandedPresetMode(e.target.checked)}
              className="accent-amber-600"
            />
            Fuller Voicings
          </label>
        ) : null}
      </div>

      <div className="text-xs font-mono text-zinc-500">
        {EUCLIDEAN_PRESETS.find((preset) => preset.id === selectedPresetId)?.description}
        {hasLargeTuning ? ` Fuller voicings ${expandedPresetMode ? "enabled" : "disabled"} for large tunings.` : ""}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950/40">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
              {lengthLabel}s
            </div>
            <div className="mt-1 text-xs text-zinc-400">
              Cut list for notes currently active in the sequence.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPipeLengths}
              className="px-3 py-2 rounded-md font-mono text-xs tracking-wide bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-zinc-100 hover:border-zinc-600 transition-all"
            >
              COPY
            </button>
            <button
              onClick={handleDownloadPipeLengths}
              className="px-3 py-2 rounded-md font-mono text-xs tracking-wide bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-zinc-100 hover:border-zinc-600 transition-all"
            >
              SAVE FILE
            </button>
          </div>
        </div>
        <div className="max-h-56 overflow-y-auto px-4 py-3">
          {activeNotes.length > 0 ? (
            <div className="space-y-2">
              {activeNotes.map((note) => (
                <div
                  key={`${note.index}-${note.name}`}
                  className="flex items-center justify-between gap-3 font-mono text-xs text-zinc-300"
                >
                  <span className="text-zinc-400">{note.name}</span>
                  <span className="text-zinc-500">{note.frequency.toFixed(2)} Hz</span>
                  <span>{formatLength(note.pipeLengthMeters, unitSystem)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="font-mono text-xs text-zinc-500">
              No active notes in the current sequence.
            </div>
          )}
        </div>
        {exportStatus ? (
          <div className="border-t border-zinc-800 px-4 py-2 text-xs font-mono text-amber-300">
            {exportStatus}
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <div className="min-w-fit">
          <div className="flex">
            <div className="w-20 shrink-0" />
            {Array.from({ length: steps }, (_, i) => (
              <div
                key={i}
                className={`w-10 h-6 flex items-center justify-center text-[10px] font-mono shrink-0 ${
                  currentStep === i ? "text-amber-400" : "text-zinc-600"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {[...notes].reverse().map((note, reversedIdx) => {
            const noteIndex = notes.length - 1 - reversedIdx;
            return (
              <div key={note.index} className="flex items-center">
                <div className="w-20 shrink-0 px-2 py-0.5 text-xs font-mono text-zinc-400 truncate text-right border-r border-zinc-800">
                  {note.name}
                </div>
                {Array.from({ length: steps }, (_, step) => {
                  const active = visibleGrid[noteIndex]?.[step] ?? false;
                  const isCurrent = currentStep === step;

                  return (
                    <button
                      key={step}
                      onClick={() => toggleCell(noteIndex, step)}
                      className={`w-10 h-8 shrink-0 border border-zinc-800/50 transition-all duration-75 ${
                        active
                          ? isCurrent
                            ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                            : "bg-amber-700/80"
                          : isCurrent
                            ? "bg-zinc-700/50"
                            : step % 4 === 0
                              ? "bg-zinc-800/60 hover:bg-zinc-700/40"
                              : "bg-zinc-900/40 hover:bg-zinc-700/40"
                      }`}
                      aria-label={`${note.name} step ${step + 1} ${active ? "on" : "off"}`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function buildPresetTracks(
  notes: ComputedNote[],
  steps: number,
  preset: EuclideanPreset,
  useExpandedVoicings: boolean,
): SequenceTrack[] {
  const maxCents = getMaxCents(notes);
  const sourceTracks = useExpandedVoicings
    ? [...preset.tracks, ...(preset.expandedTracks ?? [])]
    : preset.tracks;

  return sourceTracks.map((track) => ({
    anchorCents: track.position * maxCents,
    pattern: createEuclideanPattern(steps, Math.min(track.pulses, steps), track.rotation ?? 0),
  }));
}

function buildVisibleGrid(notes: ComputedNote[], steps: number, tracks: SequenceTrack[]): boolean[][] {
  const grid = Array.from({ length: notes.length }, () => Array(steps).fill(false));

  for (const track of tracks) {
    const noteIndex = findClosestNoteIndex(notes, track.anchorCents);
    if (noteIndex < 0) continue;

    for (let step = 0; step < steps; step += 1) {
      grid[noteIndex][step] = grid[noteIndex][step] || !!track.pattern[step];
    }
  }

  return grid;
}

function tracksFromGrid(grid: boolean[][], notes: ComputedNote[]): SequenceTrack[] {
  return grid.flatMap((row, noteIndex) => {
    if (!row.some(Boolean)) {
      return [];
    }

    return [{
      anchorCents: notes[noteIndex]?.centsFromRoot ?? 0,
      pattern: [...row],
    }];
  });
}

function findClosestNoteIndex(notes: ComputedNote[], anchorCents: number): number {
  if (notes.length === 0) {
    return -1;
  }

  let closestIndex = 0;
  let closestDistance = Math.abs(notes[0].centsFromRoot - anchorCents);

  for (let index = 1; index < notes.length; index += 1) {
    const distance = Math.abs(notes[index].centsFromRoot - anchorCents);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }

  return closestIndex;
}

function getMaxCents(notes: ComputedNote[]): number {
  if (notes.length === 0) {
    return 1200;
  }

  return Math.max(...notes.map((note) => note.centsFromRoot), 1200);
}

function createEuclideanPattern(steps: number, pulses: number, rotation: number): boolean[] {
  if (steps <= 0 || pulses <= 0) {
    return Array(Math.max(steps, 0)).fill(false);
  }

  const pattern = Array.from({ length: steps }, (_, step) => ((step * pulses) % steps) < pulses);

  return rotatePattern(pattern, rotation);
}

function rotatePattern(pattern: boolean[], rotation: number): boolean[] {
  if (pattern.length === 0) return pattern;

  const offset = ((rotation % pattern.length) + pattern.length) % pattern.length;
  if (offset === 0) return pattern;

  return pattern.map((_, index) => pattern[(index - offset + pattern.length) % pattern.length]);
}
