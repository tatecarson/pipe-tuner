"use client";

import { ComputedNote, UnitSystem } from "@/types";
import { NoteRow } from "./NoteRow";

interface NoteTableProps {
  notes: ComputedNote[];
  unitSystem: UnitSystem;
  showRatio: boolean;
  onPlay: (freq: number) => void;
}

export function NoteTable({ notes, unitSystem, showRatio, onPlay }: NoteTableProps) {
  const maxPipeLength = notes.length > 0 ? Math.max(...notes.map((n) => n.pipeLengthMeters)) : 0;

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-700 bg-zinc-900/80">
            <th className="py-2.5 px-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono font-normal text-right w-10">
              #
            </th>
            <th className="py-2.5 px-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono font-normal">
              Note
            </th>
            <th className="py-2.5 px-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono font-normal text-right">
              Freq (Hz)
            </th>
            {showRatio && (
              <th className="py-2.5 px-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono font-normal text-center">
                Ratio
              </th>
            )}
            <th className="py-2.5 px-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono font-normal text-right">
              Cents
            </th>
            <th className="py-2.5 px-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono font-normal text-right">
              Pipe Length
            </th>
            <th className="py-2.5 px-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono font-normal hidden sm:table-cell w-[140px]">
              Relative
            </th>
            <th className="py-2.5 px-2 w-10" />
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => (
            <NoteRow
              key={note.index}
              note={note}
              unitSystem={unitSystem}
              maxPipeLength={maxPipeLength}
              showRatio={showRatio}
              onPlay={onPlay}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
