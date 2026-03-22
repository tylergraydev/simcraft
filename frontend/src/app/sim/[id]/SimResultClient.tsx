"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ResultsChart from "../../components/ResultsChart";
import SimStatus from "../../components/SimStatus";
import StatWeightsTable from "../../components/StatWeightsTable";
import TopGearResults from "../../components/TopGearResults";

import { API_URL, apiFetch } from "../../lib/api";

interface JobData {
  id: string;
  status: string;
  progress: number;
  progress_stage?: string;
  progress_detail?: string;
  stages_completed?: string[];
  result: Record<string, unknown> | null;
  error: string | null;
}

export default function SimResultClient() {
  const params = useParams();
  const paramId = params.id as string;

  // In static export, useParams() may initially return "_" (the generateStaticParams
  // placeholder) before the router reconciles with the actual URL. Fall back to the URL.
  let id = paramId;
  if ((!paramId || paramId === "_") && typeof window !== "undefined") {
    const match = window.location.pathname.match(/\/sim\/(.+)/);
    if (match) id = match[1];
  }

  const [job, setJob] = useState<JobData | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!id || id === "_") return;
    setFetchError("");
    const controller = new AbortController();
    let failCount = 0;
    const MAX_RETRIES = 5;

    async function poll() {
      if (controller.signal.aborted) return;
      try {
        const res = await apiFetch(`${API_URL}/api/sim/${id}`, {
          signal: controller.signal,
          timeoutMs: 15_000,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: JobData = await res.json();
        if (controller.signal.aborted) return;
        failCount = 0;
        setRetrying(false);
        setJob(data);
        if (data.status === "pending" || data.status === "running") {
          setTimeout(poll, 2000);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;

        failCount++;
        if (failCount <= MAX_RETRIES) {
          setRetrying(true);
          const backoff = Math.min(2000 * Math.pow(2, failCount - 1), 16000);
          setTimeout(poll, backoff);
        } else {
          setRetrying(false);
          setFetchError(
            err instanceof Error ? err.message : "Failed to fetch status"
          );
        }
      }
    }
    poll();
    return () => controller.abort();
  }, [id]);

  if (fetchError) {
    return (
      <div className="card border-red-500/20 p-6 text-center space-y-3">
        <p className="text-sm font-medium text-red-400">Error</p>
        <p className="text-sm text-red-400/70">{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-xs font-medium text-white bg-surface-2 border border-border rounded-lg hover:border-gray-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-border border-t-gold rounded-full animate-spin" />
        {retrying && (
          <p className="text-xs text-yellow-500/80">
            Connection lost — retrying…
          </p>
        )}
      </div>
    );
  }

  if (job.status === "failed") {
    return (
      <div className="card border-red-500/20 p-6">
        <p className="text-sm font-medium text-red-400 mb-2">
          Simulation Failed
        </p>
        <p className="font-mono text-xs text-red-400/60 whitespace-pre-wrap">
          {job.error || "Unknown error"}
        </p>
      </div>
    );
  }

  if (job.status === "pending" || job.status === "running") {
    return (
      <SimStatus
        status={job.status}
        progress={job.progress}
        progressStage={job.progress_stage}
        progressDetail={job.progress_detail}
        stagesCompleted={job.stages_completed}
      />
    );
  }

  if (!job.result) {
    return <p className="text-sm text-muted">No result data available.</p>;
  }

  const r = job.result;
  const isTopGear = r.type === "top_gear";

  return (
    <div className="space-y-6">
      {isTopGear ? (
        <TopGearResults
          playerName={r.player_name as string}
          playerClass={r.player_class as string}
          baseDps={r.base_dps as number}
          results={
            r.results as Array<{
              name: string;
              items: Array<{
                slot: string;
                item_id: number;
                ilevel: number;
                name: string;
                bonus_ids?: number[];
                enchant_id?: number;
                gem_id?: number;
                is_kept?: boolean;
              }>;
              dps: number;
              delta: number;
            }>
          }
          equippedGear={r.equipped_gear as Record<string, {
            slot: string;
            item_id: number;
            ilevel: number;
            name: string;
            bonus_ids?: number[];
            enchant_id?: number;
            gem_id?: number;
          }>}
        />
      ) : (
        <>
          <ResultsChart
            dps={r.dps as number}
            dpsError={r.dps_error as number}
            fightLength={r.fight_length as number}
            playerName={r.player_name as string}
            playerClass={r.player_class as string}
            abilities={
              (r.abilities as Array<{
                name: string;
                portion_dps: number;
                school: string;
              }>) || []
            }
          />
          {r.stat_weights && (
            <StatWeightsTable
              statWeights={r.stat_weights as Record<string, number>}
            />
          )}
        </>
      )}

      <div className="flex items-center justify-center gap-3 text-xs text-muted pb-4">
        {typeof r.simc_version === "string" && (
          <>
            <span>{r.simc_version as string}</span>
            <span className="w-px h-3 bg-border" />
          </>
        )}
        <a
          href={`${API_URL}/api/sim/${id}/raw`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          View raw JSON
        </a>
      </div>
    </div>
  );
}
