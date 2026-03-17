"use client";

import { useCallback, useState } from "react";

interface PlayButtonProps {
  frequency: number;
  onPlay: (freq: number) => void;
}

export function PlayButton({ frequency, onPlay }: PlayButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = useCallback(() => {
    setIsPlaying(true);
    onPlay(frequency);
    setTimeout(() => setIsPlaying(false), 300);
  }, [frequency, onPlay]);

  return (
    <button
      onClick={handleClick}
      aria-label={`Play ${frequency.toFixed(1)} Hz`}
      className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150 ${
        isPlaying
          ? "bg-amber-500 text-zinc-900 scale-110 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
          : "bg-zinc-700/50 text-zinc-400 hover:bg-amber-700/60 hover:text-amber-200 hover:shadow-[0_0_8px_rgba(245,158,11,0.2)]"
      }`}
    >
      <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
        <polygon points="0,0 10,6 0,12" />
      </svg>
    </button>
  );
}
