"use client";

import { useEffect, useState } from "react";
import { AcousticMode, TuningSystem, TuningSystemKind, UnitSystem } from "@/types";
import { ROOT_NOTE_OPTIONS, TUNE_PRESET_OPTIONS } from "@/lib/constants";
import { inchesToMm, mmToInches } from "@/lib/pipe";
import { UnitToggle } from "./UnitToggle";

interface TuningControlsProps {
  tuningSystem: TuningSystem;
  temperatureCelsius: number;
  acousticMode: AcousticMode;
  pipeDiameterMm: number;
  chimeReferenceLengthMm: number;
  noteSustain: number;
  noteLengthFactor: number;
  unitSystem: UnitSystem;
  onTuningChange: (system: TuningSystem) => void;
  onTemperatureChange: (temp: number) => void;
  onAcousticModeChange: (mode: AcousticMode) => void;
  onPipeDiameterChange: (diameterMm: number) => void;
  onChimeReferenceLengthChange: (lengthMm: number) => void;
  onNoteSustainChange: (sustain: number) => void;
  onNoteLengthFactorChange: (lengthFactor: number) => void;
  onUnitChange: (unit: UnitSystem) => void;
}

export function TuningControls({
  tuningSystem,
  temperatureCelsius,
  acousticMode,
  pipeDiameterMm,
  chimeReferenceLengthMm,
  noteSustain,
  noteLengthFactor,
  unitSystem,
  onTuningChange,
  onTemperatureChange,
  onAcousticModeChange,
  onPipeDiameterChange,
  onChimeReferenceLengthChange,
  onNoteSustainChange,
  onNoteLengthFactorChange,
  onUnitChange,
}: TuningControlsProps) {
  const [pipeDiameterInput, setPipeDiameterInput] = useState(() =>
    formatPipeDiameterValue(pipeDiameterMm, unitSystem)
  );
  const [chimeReferenceInput, setChimeReferenceInput] = useState(() =>
    formatLinearValue(chimeReferenceLengthMm, unitSystem, 3)
  );

  useEffect(() => {
    setPipeDiameterInput(formatPipeDiameterValue(pipeDiameterMm, unitSystem));
  }, [pipeDiameterMm, unitSystem]);

  useEffect(() => {
    setChimeReferenceInput(formatLinearValue(chimeReferenceLengthMm, unitSystem, 3));
  }, [chimeReferenceLengthMm, unitSystem]);

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
      case "tunejs":
        onTuningChange({ ...base, kind: "tunejs", preset: "mean19" });
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

  const handlePresetChange = (preset: string) => {
    if (tuningSystem.kind === "tunejs") {
      onTuningChange({ ...tuningSystem, preset: preset as typeof tuningSystem.preset });
    }
  };

  const handlePipeDiameterChange = (val: string) => {
    setPipeDiameterInput(val);

    const diameter = parseFloat(val);
    if (!isNaN(diameter) && diameter >= 0) {
      onPipeDiameterChange(unitSystem === "imperial" ? inchesToMm(diameter) : diameter);
    }
  };

  const handleChimeReferenceChange = (val: string) => {
    setChimeReferenceInput(val);

    const length = parseFloat(val);
    if (!isNaN(length) && length > 0) {
      onChimeReferenceLengthChange(unitSystem === "imperial" ? inchesToMm(length) : length);
    }
  };

  const primaryLengthLabel = acousticMode === "pipe"
    ? unitSystem === "imperial" ? "Pipe Diameter (in)" : "Pipe Diameter (mm)"
    : unitSystem === "imperial" ? "Root Chime Length (in)" : "Root Chime Length (mm)";
  const pipeDiameterStep = unitSystem === "imperial" ? 0.01 : 0.1;
  const acousticDescription = acousticMode === "pipe"
    ? "Open pipe fundamental with end correction applied to both open ends."
    : "Struck chime mode scales from the selected root note using a reference chime length.";

  return (
    <div className="space-y-4">
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
            <option value="tunejs">Tune.js Presets</option>
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
        ) : tuningSystem.kind === "tunejs" ? (
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
              Tune.js Preset
            </label>
            <select
              value={tuningSystem.preset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-colors"
            >
              {TUNE_PRESET_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} - {opt.description}
                </option>
              ))}
            </select>
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
          {tuningSystem.kind === "custom-tet" || tuningSystem.kind === "tunejs" ? (
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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 pt-1">
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
            {primaryLengthLabel}
          </label>
          {acousticMode === "pipe" ? (
            <input
              type="number"
              min={0}
              step={pipeDiameterStep}
              value={pipeDiameterInput}
              onChange={(e) => handlePipeDiameterChange(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-colors"
            />
          ) : (
            <input
              type="number"
              min={0}
              step={pipeDiameterStep}
              value={chimeReferenceInput}
              onChange={(e) => handleChimeReferenceChange(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-colors"
            />
          )}
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
            Acoustic Mode
          </div>
          <select
            value={acousticMode}
            onChange={(e) => onAcousticModeChange(e.target.value as AcousticMode)}
            className="mt-2 w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30 transition-colors"
          >
            <option value="pipe">Open Pipe</option>
            <option value="chime">Struck Chime</option>
          </select>
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
            Note Sustain
          </div>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={noteSustain}
              onChange={(e) => onNoteSustainChange(parseFloat(e.target.value))}
              className="flex-1 accent-amber-600"
            />
            <span className="w-10 text-right text-sm font-mono text-zinc-300 tabular-nums">
              {noteSustain.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
            Note Length
          </div>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.05}
              value={noteLengthFactor}
              onChange={(e) => onNoteLengthFactorChange(parseFloat(e.target.value))}
              className="flex-1 accent-amber-600"
            />
            <span className="w-10 text-right text-sm font-mono text-zinc-300 tabular-nums">
              {noteLengthFactor.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
            Acoustic Model
          </div>
          <div className="mt-1 text-sm text-zinc-300">
            {acousticDescription}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPipeDiameterValue(pipeDiameterMm: number, unitSystem: UnitSystem): string {
  const value = unitSystem === "imperial" ? mmToInches(pipeDiameterMm) : pipeDiameterMm;
  if (!Number.isFinite(value)) return "";

  return Number(value.toFixed(unitSystem === "imperial" ? 4 : 3)).toString();
}

function formatLinearValue(lengthMm: number, unitSystem: UnitSystem, decimals: number): string {
  const value = unitSystem === "imperial" ? mmToInches(lengthMm) : lengthMm;
  if (!Number.isFinite(value)) return "";

  return Number(value.toFixed(unitSystem === "imperial" ? Math.max(2, decimals) : decimals)).toString();
}
