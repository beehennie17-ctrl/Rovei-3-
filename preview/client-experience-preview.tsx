"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Check, RefreshCw } from "lucide-react";
import type { PersonalPreviewModel } from "@/lib/preview-model";

type ClientPreviewStage = "welcome" | "flow" | "complete";

export function ClientExperiencePreview({ model }: { model: PersonalPreviewModel }) {
  const [stage, setStage] = useState<ClientPreviewStage>("welcome");
  const [stepIndex, setStepIndex] = useState(0);
  const { theme } = model;
  const currentStep = model.experience[stepIndex];

  function beginPreview() {
    setStepIndex(0);
    setStage(model.experience.length > 0 ? "flow" : "complete");
  }

  function previousStep() {
    if (stepIndex === 0) {
      setStage("welcome");
      return;
    }
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function nextStep() {
    if (stepIndex >= model.experience.length - 1) {
      setStage("complete");
      return;
    }
    setStepIndex((current) => current + 1);
  }

  function restart() {
    setStepIndex(0);
    setStage("welcome");
  }

  return (
    <div className="mx-auto w-full max-w-[500px]">
      <div
        className="texture-cosmetic motion-soft overflow-hidden rounded-[2.4rem] border p-3 shadow-[0_28px_70px_rgba(48,27,34,0.12)] sm:p-4"
        style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
      >
        {stage === "welcome" && (
          <div className="page-enter">
            <div
              className="shimmer-micro relative overflow-hidden rounded-[2rem] px-6 pb-8 pt-9 sm:px-8 sm:pb-10 sm:pt-11"
              style={{
                backgroundColor: theme.primary,
                color: theme.onPrimary,
                "--client-shimmer": theme.shimmer,
              } as CSSProperties}
            >
              <div className="relative z-[1]">
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] opacity-75">{model.studioName}</p>
                <h2 className="mt-5 text-[clamp(2.35rem,8vw,3.8rem)] leading-[0.92] tracking-[-0.045em]" style={{ fontFamily: "var(--font-serif)" }}>
                  Hi Emily.
                </h2>
                <p className="mt-5 max-w-sm text-sm font-semibold leading-6 opacity-85 sm:text-base">
                  Let&apos;s get you ready for your appointment.
                </p>
                {model.serviceNames.length > 0 && (
                  <p className="mt-5 text-xs font-semibold leading-5 opacity-75">{model.serviceNames.join(" · ")}</p>
                )}
              </div>
            </div>

            <div className="px-3 pb-4 pt-7 sm:px-5 sm:pb-5">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em]" style={{ color: theme.muted }}>
                Before your appointment
              </p>
              {model.experience.length > 0 ? (
                <div className="mt-4 grid gap-2.5">
                  {model.experience.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 rounded-2xl border px-4 py-3.5" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                      <span className="grid size-7 shrink-0 place-items-center rounded-full" style={{ backgroundColor: theme.secondary, color: theme.text }} aria-hidden="true">
                        <Check size={14} strokeWidth={2.2} />
                      </span>
                      <span className="text-sm font-bold" style={{ color: theme.text }}>{step.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border px-4 py-5 text-sm leading-6" style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.muted }}>
                  Your client experience is intentionally minimal.
                </div>
              )}

              <button
                type="button"
                onClick={beginPreview}
                className="focus-ring motion-soft pressable mt-5 flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left text-sm font-bold"
                style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
              >
                <span>Begin preview</span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
              <p className="mt-3 text-center text-[0.7rem]" style={{ color: theme.muted }}>This is a sample client experience.</p>
            </div>
          </div>
        )}

        {stage === "flow" && currentStep && (
          <div className="page-enter px-3 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
            <div className="rounded-[2rem] border px-5 py-7 sm:px-7 sm:py-9" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em]" style={{ color: theme.muted }}>
                  {stepIndex + 1} of {model.experience.length}
                </p>
                <span className="rounded-full px-2.5 py-1 text-[0.64rem] font-bold uppercase tracking-[0.1em]" style={{ backgroundColor: theme.secondary, color: theme.text }}>
                  Preview
                </span>
              </div>
              <div className="mt-10 grid size-12 place-items-center rounded-full" style={{ backgroundColor: theme.primary, color: theme.onPrimary }} aria-hidden="true">
                <Check size={20} />
              </div>
              <h3 className="mt-6 text-[2.15rem] leading-none tracking-[-0.035em]" style={{ color: theme.text, fontFamily: "var(--font-serif)" }}>
                {currentStep.name}
              </h3>
              <p className="mt-4 max-w-sm text-sm leading-6" style={{ color: theme.muted }}>{currentStep.description}</p>
              <div className="mt-10 h-px w-full" style={{ backgroundColor: theme.border }} />
              <p className="mt-5 text-xs leading-5" style={{ color: theme.muted }}>
                This step is illustrative only. No information is being entered or submitted.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={previousStep}
                className="focus-ring motion-soft pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-bold"
                style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="focus-ring motion-soft pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold"
                style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
              >
                {stepIndex === model.experience.length - 1 ? "Finish preview" : "Next"}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {stage === "complete" && (
          <div className="page-enter px-3 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
            <div className="shimmer-micro relative overflow-hidden rounded-[2rem] px-6 py-10 text-center sm:px-8 sm:py-12" style={{ backgroundColor: theme.primary, color: theme.onPrimary, "--client-shimmer": theme.shimmer } as CSSProperties}>
              <div className="relative z-[1] mx-auto grid size-12 place-items-center rounded-full border border-current/25 bg-white/10" aria-hidden="true">
                <Check size={20} />
              </div>
              <p className="relative z-[1] mt-6 text-[0.68rem] font-bold uppercase tracking-[0.14em] opacity-70">Preview complete</p>
              <h3 className="relative z-[1] mt-3 text-[2.45rem] leading-[0.96] tracking-[-0.04em]" style={{ fontFamily: "var(--font-serif)" }}>
                You&apos;re all set, Emily.
              </h3>
              <p className="relative z-[1] mx-auto mt-4 max-w-sm text-sm font-semibold leading-6 opacity-80">
                {model.experience.length > 0
                  ? "Your studio has everything it needs before the appointment."
                  : "Your intentionally minimal client experience is ready to preview."}
              </p>
            </div>
            <button
              type="button"
              onClick={restart}
              className="focus-ring motion-soft pressable mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-bold"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Start again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
