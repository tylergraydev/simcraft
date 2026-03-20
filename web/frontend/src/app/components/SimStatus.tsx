"use client";

import { useEffect, useRef, useState } from "react";

interface SimStatusProps {
  status: string;
  progress: number;
  progressStage?: string;
  progressDetail?: string;
  stagesCompleted?: string[];
}

/**
 * Smoothly interpolates the displayed progress between backend updates.
 * The backend only reports progress at a few milestones (e.g. 10%, 40%, 70%),
 * so we gradually advance the bar in between to avoid it looking frozen.
 */
function useSmoothedProgress(serverProgress: number, isRunning: boolean): number {
  const [display, setDisplay] = useState(serverProgress);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Jump forward immediately when the server reports a higher value
    setDisplay((prev) => Math.max(prev, serverProgress));
  }, [serverProgress]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!isRunning) {
      intervalRef.current = null;
      return;
    }

    // Slowly creep toward 95% while the sim is running.
    // The remaining 5% is reserved for the actual completion jump.
    intervalRef.current = setInterval(() => {
      setDisplay((prev) => {
        const ceiling = Math.max(serverProgress + 15, 95);
        if (prev >= ceiling) return prev;
        // Slow down as we approach the ceiling
        const step = Math.max(0.3, (ceiling - prev) * 0.04);
        return Math.min(prev + step, ceiling);
      });
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, serverProgress]);

  return Math.round(display);
}

export default function SimStatus({
  status,
  progress,
  progressStage,
  progressDetail,
  stagesCompleted,
}: SimStatusProps) {
  const isRunning = status === "running";
  const displayProgress = useSmoothedProgress(progress, isRunning);
  const title = progressStage || (status === "pending" ? "Queued" : "Simulating");
  const hasStages = stagesCompleted && stagesCompleted.length > 0;

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="w-10 h-10 border-2 border-border border-t-gold rounded-full animate-spin" />

      <div className="text-center">
        <p className="text-sm text-white font-medium">{title}</p>
        {progressDetail && (
          <p className="text-xs text-muted mt-1">{progressDetail}</p>
        )}
      </div>

      <div className="w-72">
        <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gold h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.max(displayProgress, status === "pending" ? 2 : 5)}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-1.5 font-mono tabular-nums">
          {displayProgress}%
        </p>
      </div>

      {hasStages && (
        <div className="w-72 space-y-1 pt-2">
          {stagesCompleted!.map((stage, i) => (
            <div key={i} className="flex items-center gap-2">
              <svg className="w-3 h-3 text-emerald-500 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5L6.5 10.5L4 8" />
              </svg>
              <span className="text-[11px] text-muted">{stage}</span>
            </div>
          ))}
          {progressStage && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              </div>
              <span className="text-[11px] text-gray-400">
                {progressStage}
                {progressDetail && <span className="text-muted"> · {progressDetail}</span>}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
