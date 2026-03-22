"use client";

const FIGHT_STYLES = [
  { value: "Patchwerk", label: "Patchwerk" },
  { value: "HecticAddCleave", label: "Hectic Add Cleave" },
  { value: "LightMovement", label: "Light Movement" },
];

interface FightStyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function FightStyleSelector({
  value,
  onChange,
}: FightStyleSelectorProps) {
  return (
    <div className="flex gap-1.5">
      {FIGHT_STYLES.map((fs) => {
        const active = value === fs.value;
        return (
          <button
            key={fs.value}
            type="button"
            onClick={() => onChange(fs.value)}
            className={`flex-1 py-2 px-2 rounded-lg text-[12px] font-medium transition-all border ${
              active
                ? "bg-gold/10 text-gold border-gold"
                : "bg-surface-2 text-fg-muted border-border hover:border-muted hover:text-fg"
            }`}
          >
            {fs.label}
          </button>
        );
      })}
    </div>
  );
}
