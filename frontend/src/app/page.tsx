import Link from "next/link";

const FEATURES = [
  {
    title: "Quick Sim",
    href: "/quick-sim",
    description: "Paste your SimC addon string and get your DPS, ability breakdown, and stat weights in seconds.",
    icon: "M13 8l-5 5-5-5M3 3h10",
  },
  {
    title: "Top Gear",
    href: "/top-gear",
    description: "Compare every combination of gear from your bags, bank, and vault to find your best setup.",
    icon: "M8 1l2 4 4.5.7-3.2 3.1.8 4.5L8 11l-4.1 2.3.8-4.5L1.5 5.7 6 5z",
  },
  {
    title: "Drop Finder",
    href: "/drop-finder",
    description: "Browse loot tables for raids and M+ dungeons. Find out which drops are the biggest upgrades.",
    icon: "M7 7m-4.5 0a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0-9 0M10.5 10.5L14 14",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Hero */}
      <div className="py-8">
        <h1 className="text-4xl font-bold text-fg tracking-tight">
          Sim<span className="text-gold">Hammer</span>
        </h1>
        <p className="text-fg-muted text-sm max-w-md mx-auto mt-4">
          Run SimulationCraft simulations from your browser or desktop.
          Paste your addon export and start simming.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4">
        {FEATURES.map((f) => (
          <Link key={f.title} href={f.href} className="card p-5 text-left group transition-all hover:border-gold/20">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-gold" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={f.icon} />
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-fg group-hover:text-gold transition-colors mb-1">{f.title}</h3>
            <p className="text-[12px] text-muted leading-relaxed">{f.description}</p>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <p className="text-muted text-xs mt-8">
        Select a simulation type to get started.
      </p>
    </div>
  );
}
