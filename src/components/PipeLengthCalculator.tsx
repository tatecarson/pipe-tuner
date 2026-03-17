"use client";

import { useState, useMemo, useCallback } from "react";
import { TuningSystem, UnitSystem } from "@/types";
import { DEFAULT_PIPE_DIAMETER_MM, DEFAULT_TEMPERATURE, TUNE_PRESET_OPTIONS } from "@/lib/constants";
import { equalTemperament, justIntonation, pythagorean } from "@/lib/tuning";
import { endCorrectionMeters, pipeLengthMeters } from "@/lib/pipe";
import { playFrequency } from "@/lib/audio";
import { generateTunePreset } from "@/lib/tune";
import { TuningControls } from "./TuningControls";
import { NoteTable } from "./NoteTable";
import { Sequencer } from "./Sequencer";

export function PipeLengthCalculator() {
  const [tuningSystem, setTuningSystem] = useState<TuningSystem>({
    kind: "12-tet",
    rootFrequency: 261.63,
    rootNoteName: "C4",
  });
  const [temperatureCelsius, setTemperatureCelsius] = useState(DEFAULT_TEMPERATURE);
  const [pipeDiameterMm, setPipeDiameterMm] = useState(DEFAULT_PIPE_DIAMETER_MM);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [activeTab, setActiveTab] = useState<"table" | "sequencer">("table");

  const computedNotes = useMemo(() => {
    let raw;
    switch (tuningSystem.kind) {
      case "12-tet":
        raw = equalTemperament(tuningSystem.rootFrequency, tuningSystem.rootNoteName, 12);
        break;
      case "just":
        raw = justIntonation(tuningSystem.rootFrequency, tuningSystem.rootNoteName);
        break;
      case "pythagorean":
        raw = pythagorean(tuningSystem.rootFrequency, tuningSystem.rootNoteName);
        break;
      case "custom-tet":
        raw = equalTemperament(tuningSystem.rootFrequency, tuningSystem.rootNoteName, tuningSystem.divisions);
        break;
      case "tunejs":
        raw = generateTunePreset(
          tuningSystem.rootFrequency,
          tuningSystem.rootNoteName,
          tuningSystem.preset,
        );
        break;
    }
    return raw.map((n) => ({
      ...n,
      pipeLengthMeters: pipeLengthMeters(n.frequency, temperatureCelsius, pipeDiameterMm),
    }));
  }, [tuningSystem, temperatureCelsius, pipeDiameterMm]);

  const showRatio = tuningSystem.kind === "just" || tuningSystem.kind === "pythagorean";
  const tunePresetLabel = tuningSystem.kind === "tunejs"
    ? TUNE_PRESET_OPTIONS.find((option) => option.id === tuningSystem.preset)?.label ?? tuningSystem.preset
    : null;
  const totalEndCorrectionMm = endCorrectionMeters(pipeDiameterMm) * 1000;

  const handlePlay = useCallback(async (freq: number) => {
    await playFrequency(freq);
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <TuningControls
          tuningSystem={tuningSystem}
          temperatureCelsius={temperatureCelsius}
          pipeDiameterMm={pipeDiameterMm}
          unitSystem={unitSystem}
          onTuningChange={setTuningSystem}
          onTemperatureChange={setTemperatureCelsius}
          onPipeDiameterChange={setPipeDiameterMm}
          onUnitChange={setUnitSystem}
        />
      </div>

      {/* Tuning info badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {tuningSystem.kind === "12-tet" && "12-tone Equal Temperament"}
          {tuningSystem.kind === "just" && "5-limit Just Intonation"}
          {tuningSystem.kind === "pythagorean" && "Pythagorean Tuning"}
          {tuningSystem.kind === "custom-tet" && `${tuningSystem.divisions}-TET`}
          {tuningSystem.kind === "tunejs" && `Tune.js - ${tunePresetLabel}`}
        </span>
        <span className="text-xs font-mono text-zinc-500">
          {computedNotes.length} notes · root {tuningSystem.rootNoteName} ({tuningSystem.rootFrequency} Hz)
        </span>
        <span className="text-xs font-mono text-zinc-500">
          diameter {pipeDiameterMm} mm · end correction {totalEndCorrectionMm.toFixed(1)} mm
        </span>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-zinc-900/60 rounded-lg p-1 border border-zinc-800 w-fit">
        <button
          onClick={() => setActiveTab("table")}
          className={`px-4 py-1.5 rounded-md text-sm font-mono tracking-wide transition-all ${
            activeTab === "table"
              ? "bg-zinc-700 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Pipe Lengths
        </button>
        <button
          onClick={() => setActiveTab("sequencer")}
          className={`px-4 py-1.5 rounded-md text-sm font-mono tracking-wide transition-all ${
            activeTab === "sequencer"
              ? "bg-zinc-700 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Sequencer
        </button>
      </div>

      {/* Content — both always mounted, hidden via CSS to preserve state */}
      <div className={activeTab === "table" ? "" : "hidden"}>
        <NoteTable
          notes={computedNotes}
          unitSystem={unitSystem}
          showRatio={showRatio}
          onPlay={handlePlay}
        />
      </div>
      <div className={activeTab === "sequencer" ? "" : "hidden"}>
        <Sequencer notes={computedNotes} />
      </div>
    </div>
  );
}
