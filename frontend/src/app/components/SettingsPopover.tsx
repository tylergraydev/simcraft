"use client";

import { useEffect, useRef, useState } from "react";
import { THEMES, useSimContext } from "./SimContext";
import { API_URL } from "../lib/api";

const PRESETS = [
  { label: "Balanced", pct: 0.3, desc: "30%" },
  { label: "Performance", pct: 0.6, desc: "60%" },
  { label: "Maximum", pct: 0.9, desc: "90%" },
] as const;

/** Preview swatches for each theme (bg, surface, accent) */
const THEME_SWATCHES: Record<string, [string, string, string]> = {
  dark: ["#0a0a0b", "#141416", "#D4A843"],
  midnight: ["#0b0e17", "#111827", "#7C9FE8"],
  shadowforge: ["#0f0a08", "#1a1210", "#E8734A"],
  light: ["#f5f5f5", "#ffffff", "#B08930"],
  parchment: ["#f5f0e8", "#faf6ef", "#A07840"],
  frost: ["#f0f4f8", "#f8fafc", "#3B82C8"],
};

export default function SettingsPopover() {
  const { threads, setThreads, theme, setTheme } = useSimContext();
  const [open, setOpen] = useState(false);
  const [maxThreads, setMaxThreads] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const desktop = !!window.electronAPI;
    setIsDesktop(desktop);
    if (!desktop) return;

    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.threads) {
          setMaxThreads(data.threads);
          if (threads === 0) {
            setThreads(Math.max(1, Math.round(data.threads * 0.6)));
          }
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — threads is intentionally captured once

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedIdx = PRESETS.findIndex(
    (p) => maxThreads > 0 && Math.max(1, Math.round(maxThreads * p.pct)) === threads
  );

  const showThreads = isDesktop && maxThreads > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="h-7 flex items-center gap-1.5 rounded-md px-2 hover:bg-surface-2 transition-colors"
        style={{ color: "var(--color-muted)" }}
        title="Settings"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="3" />
          <path d="M6.5 1.5h3l.5 2 1.5.7 1.8-1 2.1 2.1-1 1.8.7 1.5 2 .5v3l-2 .5-.7 1.5 1 1.8-2.1 2.1-1.8-1-1.5.7-.5 2h-3l-.5-2-1.5-.7-1.8 1-2.1-2.1 1-1.8-.7-1.5-2-.5v-3l2-.5.7-1.5-1-1.8 2.1-2.1 1.8 1 1.5-.7z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border rounded-xl shadow-xl shadow-black/40 p-4 z-[60] space-y-4">
          {/* Theme picker */}
          <div>
            <span className="text-[13px] font-medium block mb-2" style={{ color: "var(--color-text-secondary)" }}>Theme</span>
            <div className="grid grid-cols-3 gap-1.5">
              {THEMES.map((t) => {
                const active = theme === t.id;
                const [bg, surface, accent] = THEME_SWATCHES[t.id];
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`py-2 px-2 rounded-lg text-center transition-all border ${
                      active
                        ? "border-gold bg-gold/10"
                        : "bg-surface-2 border-border hover:border-muted"
                    }`}
                  >
                    {/* Color preview */}
                    <div className="flex justify-center gap-1 mb-1.5">
                      <span className="w-3 h-3 rounded-full border border-black/10" style={{ background: bg }} />
                      <span className="w-3 h-3 rounded-full border border-black/10" style={{ background: surface }} />
                      <span className="w-3 h-3 rounded-full border border-black/10" style={{ background: accent }} />
                    </div>
                    <span className={`text-[11px] font-medium block ${active ? "text-gold" : ""}`}
                      style={active ? undefined : { color: "var(--color-text-secondary)" }}
                    >
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CPU Threads (desktop only) */}
          {showThreads && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium" style={{ color: "var(--color-text-secondary)" }}>CPU Threads</span>
                <span className="text-xs font-mono bg-surface-2 border border-border px-2 py-0.5 rounded tabular-nums" style={{ color: "var(--color-text-primary)" }}>
                  {threads}/{maxThreads}
                </span>
              </div>
              <div className="flex gap-1.5">
                {PRESETS.map((preset, idx) => {
                  const t = Math.max(1, Math.round(maxThreads * preset.pct));
                  const active = selectedIdx === idx;
                  return (
                    <button
                      key={preset.label}
                      onClick={() => setThreads(t)}
                      className={`flex-1 py-2 px-2 rounded-lg text-center transition-all border ${
                        active
                          ? "border-gold bg-gold/10"
                          : "bg-surface-2 border-border hover:border-muted"
                      }`}
                    >
                      <span className={`text-[12px] font-medium block ${active ? "text-gold" : ""}`}
                        style={active ? undefined : { color: "var(--color-text-secondary)" }}
                      >
                        {preset.label}
                      </span>
                      <span className="text-[10px] block mt-0.5" style={{ color: "var(--color-muted)" }}>
                        {t} threads
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
