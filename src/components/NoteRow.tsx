"use client";

import { memo } from "react";
import { ComputedNote, UnitSystem } from "@/types";
import { formatLength } from "@/lib/pipe";
import { PlayButton } from "./PlayButton";

interface NoteRowProps {
  note: ComputedNote;
  unitSystem: UnitSystem;
  maxPipeLength: number;
  showRatio: boolean;
  onPlay: (freq: number) => void;
}

export const NoteRow = memo(function NoteRow({
  note,
  unitSystem,
  maxPipeLength,
  showRatio,
  onPlay,
}: NoteRowProps) {
  const barWidth = maxPipeLength > 0 ? (note.pipeLengthMeters / maxPipeLength) * 100 : 0;

  return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group">
      <td className="py-2 px-3 font-mono text-xs text-zinc-500 text-right">
        {note.index}
      </td>
      <td className="py-2 px-3 font-semibold text-zinc-100 text-sm">
        {note.name}
      </td>
      <td className="py-2 px-3 font-mono text-sm text-zinc-300 text-right tabular-nums">
        {note.frequency.toFixed(2)}
      </td>
      {showRatio && (
        <td className="py-2 px-3 font-mono text-xs text-amber-400/70 text-center">
          {note.ratio || "—"}
        </td>
      )}
      <td className="py-2 px-3 font-mono text-xs text-zinc-500 text-right tabular-nums">
        {note.centsFromRoot.toFixed(0)}¢
      </td>
      <td className="py-2 px-3 font-mono text-sm text-amber-300 text-right tabular-nums whitespace-nowrap">
        {formatLength(note.pipeLengthMeters, unitSystem)}
      </td>
      <td className="py-2 px-3 w-[140px] hidden sm:table-cell">
        <div className="relative h-3 bg-zinc-800/50 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
            style={{
              width: `${barWidth}%`,
              background: `linear-gradient(90deg, #b45309, #d97706)`,
            }}
          />
        </div>
      </td>
      <td className="py-2 px-2">
        <PlayButton frequency={note.frequency} onPlay={onPlay} />
      </td>
    </tr>
  );
});
