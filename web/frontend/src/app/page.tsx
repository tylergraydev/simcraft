export default function Home() {
  return (
    <div className="flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
        SimHammer
      </h1>
      <p className="text-sm text-muted mb-12">
        Run SimulationCraft simulations from your browser
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        <a
          href="/quick-sim"
          className="card p-6 group hover:border-gold/30 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 8l-5 5-5-5M3 3h10" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">
              Quick Sim
            </h2>
          </div>
          <p className="text-sm text-muted">
            Simulate your character as-is. Get DPS, ability breakdown, and stat weights.
          </p>
        </a>

        <a
          href="/top-gear"
          className="card p-6 group hover:border-gold/30 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 1l2 4 4.5.7-3.2 3.1.8 4.5L8 11l-4.1 2.3.8-4.5L1.5 5.7 6 5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">
              Top Gear
            </h2>
          </div>
          <p className="text-sm text-muted">
            Find the best gear combination from your bags, bank, and vault.
          </p>
        </a>
      </div>
    </div>
  );
}
