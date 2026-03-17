"use client";

import { TuningSystem, TuningSystemKind, UnitSystem } from "@/types";
import { ROOT_NOTE_OPTIONS } from "@/lib/constants";
import { UnitToggle } from "./UnitToggle";

interface TuningControlsProps {
  tuningSystem: TuningSystem;
  temperatureCelsius: number;
  unitSystem: UnitSystem;
  onTuningChange: (system: TuningSystem) => void;
  onTemperatureChange: (temp: number) => void;
  onUnitChange: (unit: UnitSystem) => void;
}

export function TuningControls({
  tuningSystem,
  temperatureCelsius,
  unitSystem,
  onTuningChange,
  onTemperatureChange,
  onUnitChange,
}: TuningControlsProps) {
  const handleKindChange = (kind: TuningSystemKind) => {
    const base = {
      rootFrequency: tuningSystem.rootFrequency,
      rootNoteName: tuningSystem.rootNoteName,
    };
    switch (kind) {
      case "12-tet":
        onTuningChange({ ...base, kind: "12-tet" });
        break;
      case "just":
        onTuningChange({ ...base, kind: "just" });
        break;
      case "pythagorean":
        onTuningChange({ ...base, kind: "pythagorean" });
        break;
      case "custom-tet":
        onTuningChange({ ...base, kind: "custom-tet", divisions: 19 });
        break;
    }
  };

  const handleRootChange = (noteName: string) => {
    const root = ROOT_NOTE_OPTIONS.find((r) => r.name === noteName);
    if (!root) return;
    onTuningChange({
      ...tuningSystem,
      rootFrequency: root.frequency,
      rootNoteName: root.name,
    });
  };

  const handleDivisionsChange = (val: string) => {
    const divisions = parseInt(val, 10);
    if (isNaN(divisions) || divisions < 2) return;
    if (tuningSystem.kind === "custom-tet") {
      onTuningChange({ ...tuningSystem, divisions });
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Tuning System */}
      <div className="space-y-1.5">
        <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
          Tuning System
        </label>
        <select
          value={tuningSystem.kind}
          onChange={(e) => handleKindChange(e.target.value as TuningSystemKind)}
          className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-colors"
        >
          <option value="12-tet">12-TET (Equal)</option>
          <option value="just">Just Intonation</option>
          <option value="pythagorean">Pythagorean</option>
          <option value="custom-tet">Custom N-TET</option>
        </select>
      </div>

      {/* Root Note */}
      <div className="space-y-1.5">
        <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
          Root Note
        </label>
        <select
          value={tuningSystem.rootNoteName}
          onChange={(e) => handleRootChange(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-colors"
        >
          {ROOT_NOTE_OPTIONS.map((opt) => (
            <option key={opt.name} value={opt.name}>
              {opt.name} — {opt.frequency} Hz
            </option>
          ))}
        </select>
      </div>

      {/* Custom Divisions (only for custom-tet) */}
      {tuningSystem.kind === "custom-tet" ? (
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
            Divisions / Octave
          </label>
          <input
            type="number"
            min={2}
            max={96}
            value={tuningSystem.divisions}
            onChange={(e) => handleDivisionsChange(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-colors"
          />
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
            Temperature (°C)
          </label>
          <input
            type="number"
            min={-20}
            max={50}
            value={temperatureCelsius}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) onTemperatureChange(val);
            }}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-colors"
          />
        </div>
      )}

      {/* Temperature (for custom-tet, show in 4th slot) / Unit Toggle */}
      <div className="space-y-1.5">
        {tuningSystem.kind === "custom-tet" ? (
          <>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
              Temperature (°C)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={-20}
                max={50}
                value={temperatureCelsius}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) onTemperatureChange(val);
                }}
                className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-colors"
              />
              <UnitToggle unit={unitSystem} onChange={onUnitChange} />
            </div>
          </>
        ) : (
          <>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
              Display Units
            </label>
            <div className="flex items-center h-[38px]">
              <UnitToggle unit={unitSystem} onChange={onUnitChange} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
