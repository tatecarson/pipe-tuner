"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { AcousticMode, TuningSystem, UnitSystem } from "@/types";
import {
  DEFAULT_CHIME_REFERENCE_LENGTH_MM,
  DEFAULT_PIPE_DIAMETER_MM,
  DEFAULT_TEMPERATURE,
  TUNE_PRESET_OPTIONS,
} from "@/lib/constants";
import { equalTemperament, justIntonation, pythagorean } from "@/lib/tuning";
import { chimeLengthMeters, endCorrectionMeters, pipeLengthMeters } from "@/lib/pipe";
import { playFrequency, setNoteLengthFactor, setNoteSustain } from "@/lib/audio";
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
  const [acousticMode, setAcousticMode] = useState<AcousticMode>("pipe");
  const [chimeReferenceLengthMm, setChimeReferenceLengthMm] = useState(DEFAULT_CHIME_REFERENCE_LENGTH_MM);
  const [noteSustain, setPlaybackSustain] = useState(0.3);
  const [noteLengthFactor, setPlaybackNoteLengthFactor] = useState(0.6);
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
      pipeLengthMeters: acousticMode === "pipe"
        ? pipeLengthMeters(n.frequency, temperatureCelsius, pipeDiameterMm)
        : chimeLengthMeters(n.frequency, tuningSystem.rootFrequency, chimeReferenceLengthMm / 1000),
    }));
  }, [tuningSystem, temperatureCelsius, pipeDiameterMm, acousticMode, chimeReferenceLengthMm]);

  const showRatio = tuningSystem.kind === "just" || tuningSystem.kind === "pythagorean";
  const tunePresetLabel = tuningSystem.kind === "tunejs"
    ? TUNE_PRESET_OPTIONS.find((option) => option.id === tuningSystem.preset)?.label ?? tuningSystem.preset
    : null;
  const totalEndCorrectionMm = endCorrectionMeters(pipeDiameterMm) * 1000;
  const lengthLabel = acousticMode === "pipe" ? "Pipe Length" : "Chime Length";

  useEffect(() => {
    setNoteSustain(noteSustain);
  }, [noteSustain]);

  useEffect(() => {
    setNoteLengthFactor(noteLengthFactor);
  }, [noteLengthFactor]);

  const handlePlay = useCallback(async (freq: number) => {
    await playFrequency(freq, 0.45 * noteLengthFactor);
  }, [noteLengthFactor]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <TuningControls
          tuningSystem={tuningSystem}
          temperatureCelsius={temperatureCelsius}
          acousticMode={acousticMode}
          pipeDiameterMm={pipeDiameterMm}
          chimeReferenceLengthMm={chimeReferenceLengthMm}
          noteSustain={noteSustain}
          noteLengthFactor={noteLengthFactor}
          unitSystem={unitSystem}
          onTuningChange={setTuningSystem}
          onTemperatureChange={setTemperatureCelsius}
          onAcousticModeChange={setAcousticMode}
          onPipeDiameterChange={setPipeDiameterMm}
          onChimeReferenceLengthChange={setChimeReferenceLengthMm}
          onNoteSustainChange={setPlaybackSustain}
          onNoteLengthFactorChange={setPlaybackNoteLengthFactor}
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
          model {acousticMode === "pipe" ? "open pipe" : "struck chime"}
        </span>
        <span className="text-xs font-mono text-zinc-500">
          {computedNotes.length} notes · root {tuningSystem.rootNoteName} ({tuningSystem.rootFrequency} Hz)
        </span>
        <span className="text-xs font-mono text-zinc-500">
          {acousticMode === "pipe"
            ? `diameter ${pipeDiameterMm} mm · end correction ${totalEndCorrectionMm.toFixed(1)} mm`
            : `reference ${chimeReferenceLengthMm} mm at root`}
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
          lengthLabel={lengthLabel}
          unitSystem={unitSystem}
          showRatio={showRatio}
          onPlay={handlePlay}
        />
      </div>
      <div className={activeTab === "sequencer" ? "" : "hidden"}>
        <Sequencer
          notes={computedNotes}
          unitSystem={unitSystem}
          noteLengthFactor={noteLengthFactor}
          lengthLabel={lengthLabel}
        />
      </div>
    </div>
  );
}
