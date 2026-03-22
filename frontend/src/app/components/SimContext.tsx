"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export const THEMES = [
  { id: "dark", label: "Dark", group: "dark" },
  { id: "midnight", label: "Midnight", group: "dark" },
  { id: "shadowforge", label: "Shadowforge", group: "dark" },
  { id: "light", label: "Light", group: "light" },
  { id: "parchment", label: "Parchment", group: "light" },
  { id: "frost", label: "Frost", group: "light" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

interface SimContextType {
  simcInput: string;
  setSimcInput: (v: string) => void;
  fightStyle: string;
  setFightStyle: (v: string) => void;
  threads: number;
  setThreads: (v: number) => void;
  selectedTalent: string;
  setSelectedTalent: (v: string) => void;
  targetCount: number;
  setTargetCount: (v: number) => void;
  fightLength: number;
  setFightLength: (v: number) => void;
  customSimc: string;
  setCustomSimc: (v: string) => void;
  theme: ThemeId;
  setTheme: (v: ThemeId) => void;
}

const SimContext = createContext<SimContextType | null>(null);

export function useSimContext() {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSimContext must be used within SimProvider");
  return ctx;
}

function readStoredThreads(): number {
  if (typeof window === "undefined") return 0;
  const v = localStorage.getItem("simhammer_threads");
  if (v == null) return 0;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "dark";
  const v = localStorage.getItem("simhammer_theme");
  if (v && THEMES.some((t) => t.id === v)) return v as ThemeId;
  return "dark";
}

export function SimProvider({ children }: { children: ReactNode }) {
  const [simcInput, setSimcInput] = useState("");
  const [fightStyle, setFightStyle] = useState("Patchwerk");
  const [threads, _setThreads] = useState(readStoredThreads);
  const [selectedTalent, setSelectedTalent] = useState("");
  const [targetCount, setTargetCount] = useState(1);
  const [fightLength, setFightLength] = useState(300);
  const [customSimc, setCustomSimc] = useState("");
  const [theme, _setTheme] = useState<ThemeId>(readStoredTheme);

  const setThreads = useCallback((v: number) => {
    _setThreads(v);
    try { localStorage.setItem("simhammer_threads", String(v)); } catch {}
  }, []);

  const setTheme = useCallback((v: ThemeId) => {
    _setTheme(v);
    try { localStorage.setItem("simhammer_theme", v); } catch {}
  }, []);

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <SimContext.Provider
      value={{ simcInput, setSimcInput, fightStyle, setFightStyle, threads, setThreads, selectedTalent, setSelectedTalent, targetCount, setTargetCount, fightLength, setFightLength, customSimc, setCustomSimc, theme, setTheme }}
    >
      {children}
    </SimContext.Provider>
  );
}
