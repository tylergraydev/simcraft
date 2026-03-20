import SimForm from "../components/SimForm";

export default function QuickSimPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Quick Sim
        </h2>
        <p className="text-sm text-muted mt-1">
          Paste your SimC addon export and run a simulation.
        </p>
      </div>
      <SimForm />
    </div>
  );
}
