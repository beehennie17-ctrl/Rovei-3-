"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BeautyPacksHeader,
} from "@/components/beauty-packs/beauty-packs-header";

import {
  BeautyPackEmpty,
} from "@/components/beauty-packs/beauty-pack-empty";

import {
  BeautyPackList,
} from "@/components/beauty-packs/beauty-pack-list";

import {
  formatBeautyPackCount,
} from "@/lib/beauty-pack";

import {
  loadBeautyPacks,
} from "@/lib/data/rovei-data-source";

import type {
  BackendMode,
} from "@/lib/backend/api-client";

import type {
  BeautyPack,
} from "@/types/beauty-pack";

export function BeautyPacksPage() {
  const [
    packs,
    setPacks,
  ] = useState<
    BeautyPack[]
  >([]);

  const [
    hydrated,
    setHydrated,
  ] = useState(false);

  const [
    backendMode,
    setBackendMode,
  ] =
    useState<BackendMode | null>(
      null,
    );

  const [
    loadError,
    setLoadError,
  ] = useState("");

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const result =
          await loadBeautyPacks();

        if (!active) {
          return;
        }

        setPacks(
          result.data,
        );

        setBackendMode(
          result.mode,
        );
      } catch {
        if (!active) {
          return;
        }

        setLoadError(
          "Rovei couldn’t load your Beauty Packs. Please refresh and try again.",
        );
      } finally {
        if (active) {
          setHydrated(true);
        }
      }
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8 lg:space-y-10 page-enter">
      <BeautyPacksHeader />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-4 py-3">
        <p className="caption">
          {hydrated
            ? formatBeautyPackCount(
                packs.length,
              )
            : "Loading Beauty Packs…"}
        </p>

        {hydrated &&
          !loadError && (
            <p className="caption">
              <span className="font-semibold text-[var(--wine)]">
                {backendMode ===
                "supabase"
                  ? "Cloud data"
                  : "Prototype setup"}
              </span>

              {backendMode ===
              "supabase"
                ? " · Synced with your Rovei Studio."
                : " · Saved in this browser until Rovei’s backend is connected."}
            </p>
          )}
      </div>

      {loadError ? (
        <div
          role="alert"
          className="rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white p-6 shadow-[var(--shadow-card)]"
        >
          <p className="text-sm font-semibold text-[var(--wine)]">
            {loadError}
          </p>
        </div>
      ) : (
        hydrated &&
        (packs.length === 0 ? (
          <BeautyPackEmpty />
        ) : (
          <BeautyPackList
            packs={packs}
          />
        ))
      )}
    </div>
  );
}
