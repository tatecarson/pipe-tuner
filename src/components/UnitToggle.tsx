"use client";

import { UnitSystem } from "@/types";

interface UnitToggleProps {
  unit: UnitSystem;
  onChange: (unit: UnitSystem) => void;
}

export function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-zinc-800 rounded-md p-0.5 border border-zinc-700">
      <button
        onClick={() => onChange("metric")}
        className={`px-3 py-1 rounded text-xs font-mono tracking-wider transition-all ${
          unit === "metric"
            ? "bg-amber-700/80 text-amber-100 shadow-inner"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        CM
      </button>
      <button
        onClick={() => onChange("imperial")}
        className={`px-3 py-1 rounded text-xs font-mono tracking-wider transition-all ${
          unit === "imperial"
            ? "bg-amber-700/80 text-amber-100 shadow-inner"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        IN
      </button>
    </div>
  );
}
