"use client";

import { useState, useRef, useEffect } from "react";

interface VinylPlayerProps {
  audioUrl: string | null;
  title?: string;
  isLoading?: boolean;
}

export function VinylPlayer({ audioUrl, title, isLoading }: VinylPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const spinning = isPlaying || isLoading;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Vinyl Assembly */}
      <div className="relative w-[200px] h-[200px]">
        {/* Bezel */}
        <div className="absolute -inset-3 rounded-full bg-base neu-inset" />

        {/* Disc */}
        <div
          className={`absolute inset-0 rounded-full bg-vinyl flex justify-center items-center z-[2] shadow-[0_8px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)] ${spinning ? "vinyl-spinning" : ""}`}
          style={{
            backgroundImage: `
              radial-gradient(circle, transparent 28%, rgba(255,255,255,0.03) 29%, transparent 30%),
              radial-gradient(circle, transparent 44%, rgba(255,255,255,0.05) 45%, transparent 46%),
              radial-gradient(circle, transparent 60%, rgba(255,255,255,0.04) 61%, transparent 62%),
              radial-gradient(circle, transparent 76%, rgba(255,255,255,0.06) 77%, transparent 78%)
            `,
          }}
        >
          {/* Reflection */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none z-[3]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.07) 45deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.07) 225deg, transparent 270deg)",
            }}
          />

          {/* Label */}
          <div className="w-[72px] h-[72px] rounded-full bg-[#D9D3C8] border-2 border-[#111] flex flex-col justify-center items-center relative z-[4]">
            <span className="text-[0.45rem] font-bold tracking-[1px] text-text">AI</span>
            <div className="w-2 h-2 rounded-full bg-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] my-1" />
            <span className="text-[0.45rem] font-bold tracking-[1px] text-text">CAST</span>
          </div>
        </div>

        {/* Tonearm base */}
        <div className="absolute -top-3 -right-5 w-8 h-8 rounded-full bg-[#D2CBC0] shadow-[0_4px_8px_rgba(0,0,0,0.2),inset_0_2px_2px_rgba(255,255,255,0.8)] z-10" />

        {/* Tonearm */}
        <div
          className="absolute top-[2px] -right-[5px] w-[100px] h-2 rounded bg-gradient-to-r from-[#A8A196] to-[#C4BDB1] origin-right shadow-[0_4px_6px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)] z-[9] transition-transform duration-600"
          style={{
            transform: spinning ? "rotate(-15deg)" : "rotate(-52deg)",
            transitionTimingFunction: "cubic-bezier(0.5, 0, 0.2, 1)",
          }}
        />
      </div>

      {/* Play Controls */}
      {audioUrl && (
        <div className="w-full max-w-xs flex flex-col gap-3">
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-surface neu-inset overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[0.6rem] text-text-muted font-mono">
              {formatTime(progress)}
            </span>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-gradient-to-b from-[#FAFAF8] to-[#E8E4DB] neu-outset flex items-center justify-center cursor-pointer border-none active:neu-active active:translate-y-0.5 transition-all"
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-text)">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-text)">
                  <polygon points="6,4 20,12 6,20" />
                </svg>
              )}
            </button>

            <span className="text-[0.6rem] text-text-muted font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

      {/* Title */}
      {title && (
        <p className="text-[0.65rem] tracking-[2px] text-text-muted text-center font-mono uppercase">
          {isLoading ? "LOADING..." : isPlaying ? "ON AIR" : "READY"}
        </p>
      )}
    </div>
  );
}
