"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ComputedNote } from "@/types";
import { startSequence, stopSequence, disposeSequence } from "@/lib/audio";
import { DEFAULT_SEQUENCER_STEPS, DEFAULT_BPM } from "@/lib/constants";

interface SequencerProps {
  notes: ComputedNote[];
}

export function Sequencer({ notes }: SequencerProps) {
  const [steps] = useState(DEFAULT_SEQUENCER_STEPS);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [grid, setGrid] = useState<boolean[][]>(() =>
    Array.from({ length: notes.length }, () => Array(DEFAULT_SEQUENCER_STEPS).fill(false))
  );
  const gridRef = useRef(grid);
  gridRef.current = grid;

  // Reset grid when notes change (different tuning system / root)
  useEffect(() => {
    const wasPlaying = playing;
    if (wasPlaying) {
      stopSequence();
      setPlaying(false);
      setCurrentStep(-1);
    }
    setGrid(Array.from({ length: notes.length }, () => Array(steps).fill(false)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.length, steps]);

  const toggleCell = useCallback((noteIndex: number, step: number) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[noteIndex][step] = !next[noteIndex][step];
      return next;
    });
  }, []);

  const handlePlay = useCallback(async () => {
    if (playing) {
      stopSequence();
      setPlaying(false);
      setCurrentStep(-1);
      return;
    }
    setPlaying(true);
    await startSequence(gridRef.current, notes, steps, bpm, (step) => {
      setCurrentStep(step);
    });
  }, [playing, notes, steps, bpm]);

  const handleClear = useCallback(() => {
    if (playing) {
      stopSequence();
      setPlaying(false);
      setCurrentStep(-1);
    }
    setGrid(Array.from({ length: notes.length }, () => Array(steps).fill(false)));
  }, [playing, notes.length, steps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposeSequence();
    };
  }, []);

  // Re-start sequence when grid changes during playback
  useEffect(() => {
    if (playing) {
      startSequence(grid, notes, steps, bpm, (step) => {
        setCurrentStep(step);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid]);

  return (
    <div className="space-y-4">
      {/* Transport controls */}
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
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="w-24 accent-amber-600"
          />
          <span className="font-mono text-sm text-zinc-300 tabular-nums w-8">
            {bpm}
          </span>
        </div>
      </div>

      {/* Sequencer grid */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <div className="min-w-fit">
          {/* Step numbers */}
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

          {/* Note rows (reversed so highest pitch is at top) */}
          {[...notes].reverse().map((note, reversedIdx) => {
            const noteIndex = notes.length - 1 - reversedIdx;
            return (
              <div key={note.index} className="flex items-center">
                <div className="w-20 shrink-0 px-2 py-0.5 text-xs font-mono text-zinc-400 truncate text-right border-r border-zinc-800">
                  {note.name}
                </div>
                {Array.from({ length: steps }, (_, step) => {
                  const active = grid[noteIndex]?.[step] ?? false;
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
