"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import {
  AcknowledgementStep,
} from "@/components/client-experience/acknowledgement-step";

import {
  ClientComplete,
} from "@/components/client-experience/client-complete";

import {
  ClientExperienceShell,
} from "@/components/client-experience/client-experience-shell";

import {
  ClientExperienceUnavailable,
} from "@/components/client-experience/client-experience-unavailable";

import {
  ClientProgress,
} from "@/components/client-experience/client-progress";

import {
  ClientReview,
} from "@/components/client-experience/client-review";

import {
  ClientWelcome,
} from "@/components/client-experience/client-welcome";

import {
  ConsultationStep,
} from "@/components/client-experience/consultation-step";

import {
  PhotoStep,
} from "@/components/client-experience/photo-step";

import {
  PreferencesStep,
} from "@/components/client-experience/preferences-step";

import {
  getClientPrepCopy,
} from "@/lib/client-prep-copy";

import {
  loadCloudClientExperience,
  saveCloudClientExperience,
  submitCloudClientExperience,
} from "@/lib/client-experience-cloud";

import {
  areAllClientExperienceModulesComplete,
  createClientExperiencePrototype,
  isClientExperienceModuleComplete,
  readClientExperiencePrototype,
  writeClientExperiencePrototype,
} from "@/lib/client-experience-prototype";

import {
  readPrototypePhotos,
} from "@/lib/client-experience-photo-store";

import {
  doesPrototypeClientTokenMatch,
  isValidPrototypeClientToken,
} from "@/lib/client-link-prototype";

import {
  EXPERIENCE_OPTIONS,
} from "@/lib/experience-options";

import {
  getRecommendedExperienceModules,
} from "@/lib/experience-recommendations";

import {
  readNewClientDraft,
} from "@/lib/new-client-draft";

import {
  readOnboardingDraft,
} from "@/lib/onboarding-storage";

import {
  resolveClientTheme,
} from "@/lib/theme-resolver";

import type {
  ClientTheme,
} from "@/types";

import type {
  NewClientDraft,
} from "@/types/client-creation";

import type {
  ClientExperiencePrototype,
} from "@/types/client-experience";

import type {
  ExperienceModuleId,
} from "@/types/onboarding";

type ExperienceMode =
  | "prototype"
  | "cloud";

type ReadyState = {
  draft:
    NewClientDraft;

  studioName:
    string;

  theme:
    ClientTheme;

  response:
    ClientExperiencePrototype;

  mode:
    ExperienceMode;
};

type PageState =
  | {
      status:
        "loading";
    }
  | {
      status:
        "unavailable";
    }
  | ({
      status:
        "ready";
    } & ReadyState);

function canonicalizeModules(
  selected:
    ExperienceModuleId[],
) {
  const chosen =
    new Set(
      selected,
    );

  return EXPERIENCE_OPTIONS
    .filter(
      (option) =>
        chosen.has(
          option.id,
        ),
    )
    .map(
      (option) =>
        option.id,
    );
}

async function reconcilePhotoIds(
  record:
    ClientExperiencePrototype,
) {
  if (
    record.status ===
    "complete"
  ) {
    return record;
  }

  try {
    const [
      inspiration,
      current,
    ] =
      await Promise.all([
        readPrototypePhotos(
          record.token,
          "inspiration",
        ),

        readPrototypePhotos(
          record.token,
          "current",
        ),
      ]);

    const inspirationIds =
      inspiration.map(
        (photo) =>
          photo.id,
      );

    const currentIds =
      current.map(
        (photo) =>
          photo.id,
      );

    return {
      ...record,

      inspiration:
        record.inspiration
          ? {
              ...record.inspiration,
              photoIds:
                inspirationIds,
            }
          : inspirationIds.length >
              0
            ? {
                skipped:
                  false,

                photoIds:
                  inspirationIds,
              }
            : undefined,

      currentPhotos:
        record.currentPhotos
          ? {
              ...record.currentPhotos,
              photoIds:
                currentIds,
            }
          : currentIds.length >
              0
            ? {
                skipped:
                  false,

                photoIds:
                  currentIds,
              }
            : undefined,
    } satisfies ClientExperiencePrototype;
  } catch {
    return record;
  }
}

export function ClientExperiencePage({
  token,
}: {
  token: string;
}) {
  const [
    state,
    setState,
  ] =
    useState<PageState>({
      status:
        "loading",
    });

  const [
    attemptedContinue,
    setAttemptedContinue,
  ] = useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        if (
          isValidPrototypeClientToken(
            token,
          )
        ) {
          if (
            !doesPrototypeClientTokenMatch(
              token,
            )
          ) {
            if (active) {
              setState({
                status:
                  "unavailable",
              });
            }

            return;
          }

          const draft =
            readNewClientDraft();

          if (!draft) {
            if (active) {
              setState({
                status:
                  "unavailable",
              });
            }

            return;
          }

          const onboarding =
            readOnboardingDraft();

          const configured =
            onboarding.experienceSelections;

          const modules =
            configured !==
            undefined
              ? canonicalizeModules(
                  configured,
                )
              : getRecommendedExperienceModules(
                  [
                    draft.service,
                  ],
                );

          const studioName =
            onboarding.studioName
              ?.trim() ||
            "Your Studio";

          const theme =
            resolveClientTheme(
              onboarding.theme,
              onboarding.customPrimary,
            );

          let response =
            readClientExperiencePrototype(
              token,
            );

          if (!response) {
            response =
              createClientExperiencePrototype(
                token,
                modules,
              );

            writeClientExperiencePrototype(
              response,
            );
          }

          response =
            await reconcilePhotoIds(
              response,
            );

          if (
            response.status ===
              "in-progress" &&
            response.currentStep >
              0
          ) {
            const hydratedResponse =
              response;

            const firstIncomplete =
              hydratedResponse.modules.findIndex(
                (
                  moduleId,
                  index,
                ) =>
                  index <
                    hydratedResponse.currentStep &&
                  !isClientExperienceModuleComplete(
                    hydratedResponse,
                    moduleId,
                  ),
              );

            if (
              firstIncomplete >=
              0
            ) {
              response = {
                ...hydratedResponse,
                currentStep:
                  firstIncomplete,
              };
            }
          }

          writeClientExperiencePrototype(
            response,
          );

          if (active) {
            setState({
              status:
                "ready",

              draft,
              studioName,
              theme,
              response,
              mode:
                "prototype",
            });
          }

          return;
        }

        const cloud =
          await loadCloudClientExperience(
            token,
          );

        const response:
          ClientExperiencePrototype =
          {
            token,
            ...cloud.response,
          };

        const theme =
          resolveClientTheme(
            cloud.theme,
            cloud.customPrimary,
          );

        if (active) {
          setState({
            status:
              "ready",

            draft:
              cloud.draft,

            studioName:
              cloud.studioName,

            theme,

            response,

            mode:
              "cloud",
          });
        }
      } catch {
        if (active) {
          setState({
            status:
              "unavailable",
          });
        }
      }
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, [
    token,
  ]);

  const currentModule =
    useMemo(() => {
      if (
        state.status !==
        "ready"
      ) {
        return undefined;
      }

      const {
        response,
      } = state;

      if (
        response.currentStep <
          0 ||
        response.currentStep >=
          response.modules.length
      ) {
        return undefined;
      }

      return response.modules[
        response.currentStep
      ];
    }, [
      state,
    ]);

  if (
    state.status ===
    "loading"
  ) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--surface-muted)] px-5">
        <div
          className="h-48 w-full max-w-lg animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white"
          aria-hidden="true"
        />

        <span className="sr-only">
          Loading client experience
        </span>
      </main>
    );
  }

  if (
    state.status ===
    "unavailable"
  ) {
    return (
      <ClientExperienceUnavailable />
    );
  }

  const {
    draft,
    studioName,
    theme,
    response,
    mode,
  } = state;

  function updateLocal(
    next:
      ClientExperiencePrototype,
  ) {
    setState(
      (current) =>
        current.status ===
        "ready"
          ? {
              ...current,
              response:
                next,
            }
          : current,
    );
  }

  async function persist(
    next:
      ClientExperiencePrototype,
  ) {
    const normalized = {
      ...next,
      updatedAt:
        new Date()
          .toISOString(),
    };

    updateLocal(
      normalized,
    );

    setSaveError(false);
    setSaving(true);

    try {
      if (
        mode ===
        "prototype"
      ) {
        const saved =
          writeClientExperiencePrototype(
            normalized,
          );

        if (!saved) {
          throw new Error(
            "Prototype progress could not be saved.",
          );
        }
      } else {
        await saveCloudClientExperience(
          token,
          normalized,
        );
      }

      return true;
    } catch {
      setSaveError(true);
      return false;
    } finally {
      setSaving(false);
    }
  }

  function patch(
    patchValue:
      Partial<ClientExperiencePrototype>,
  ) {
    const next = {
      ...response,
      ...patchValue,
      updatedAt:
        new Date()
          .toISOString(),
    };

    updateLocal(
      next,
    );

    void persist(
      next,
    );
  }

  function goBack() {
    if (saving) {
      return;
    }

    setAttemptedContinue(
      false,
    );

    const nextStep =
      response.currentStep <=
      0
        ? -1
        : response.currentStep ===
            response.modules
              .length
          ? response.modules
              .length -
            1
          : response.currentStep -
            1;

    void persist({
      ...response,
      currentStep:
        nextStep,
    });
  }

  function continueForward() {
    if (
      !currentModule ||
      saving
    ) {
      return;
    }

    if (
      !isClientExperienceModuleComplete(
        response,
        currentModule,
      )
    ) {
      setAttemptedContinue(
        true,
      );

      return;
    }

    setAttemptedContinue(
      false,
    );

    void persist({
      ...response,
      currentStep:
        response.currentStep +
        1,
    });
  }

  async function submitExperience() {
    if (saving) {
      return;
    }

    if (
      !areAllClientExperienceModulesComplete(
        response,
      )
    ) {
      setSaveError(true);
      return;
    }

    const timestamp =
      new Date()
        .toISOString();

    const completeRecord:
      ClientExperiencePrototype =
      {
        ...response,

        status:
          "complete",

        currentStep:
          response.modules
            .length,

        updatedAt:
          timestamp,

        submittedAt:
          timestamp,
      };

    setSaving(true);
    setSaveError(false);

    try {
      if (
        mode ===
        "prototype"
      ) {
        if (
          !writeClientExperiencePrototype(
            completeRecord,
          )
        ) {
          throw new Error(
            "Prototype completion could not be saved.",
          );
        }
      } else {
        const result =
          await submitCloudClientExperience(
            token,
            completeRecord,
          );

        if (
          !result.completed
        ) {
          throw new Error(
            "The client experience was not completed.",
          );
        }

        if (
          result.completedAt
        ) {
          completeRecord.submittedAt =
            result.completedAt;

          completeRecord.updatedAt =
            result.completedAt;
        }
      }

      updateLocal(
        completeRecord,
      );
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  if (
    response.status ===
    "complete"
  ) {
    return (
      <ClientExperienceShell
        studioName={
          studioName
        }
        theme={theme}
      >
        <ClientComplete
          draft={draft}
          studioName={
            studioName
          }
          theme={theme}
        />
      </ClientExperienceShell>
    );
  }

  if (
    response.currentStep ===
    -1
  ) {
    return (
      <ClientExperienceShell
        studioName={
          studioName
        }
        theme={theme}
      >
        <ClientWelcome
          draft={draft}
          studioName={
            studioName
          }
          theme={theme}
          onStart={() => {
            if (saving) {
              return;
            }

            setAttemptedContinue(
              false,
            );

            void persist({
              ...response,
              currentStep:
                0,
            });
          }}
        />

        {saveError && (
          <p className="mt-5 text-center text-xs font-semibold text-[var(--warning)]">
            Progress could not be saved. Please try again before leaving this page.
          </p>
        )}
      </ClientExperienceShell>
    );
  }

  const isReview =
    response.currentStep ===
    response.modules.length;

  return (
    <ClientExperienceShell
      studioName={
        studioName
      }
      theme={theme}
    >
      {!isReview &&
        response.modules
          .length >
          0 && (
          <ClientProgress
            current={
              response.currentStep +
              1
            }
            total={
              response.modules
                .length
            }
            theme={theme}
          />
        )}

      {currentModule ===
        "consultation" && (
        <ConsultationStep
          value={
            response
              .consultation
              ?.goal ??
            ""
          }
          theme={theme}
          showError={
            attemptedContinue
          }
          onChange={(
            goal,
          ) =>
            patch({
              consultation: {
                goal,
              },
            })
          }
        />
      )}

      {currentModule ===
        "preferences" && (
        <PreferencesStep
          finish={
            response
              .preferences
              ?.finish
          }
          appointmentFeel={
            response
              .preferences
              ?.appointmentFeel
          }
          theme={theme}
          showError={
            attemptedContinue
          }
          onFinishChange={(
            finish,
          ) =>
            patch({
              preferences: {
                ...response.preferences,
                finish,
              },
            })
          }
          onAppointmentFeelChange={(
            appointmentFeel,
          ) =>
            patch({
              preferences: {
                ...response.preferences,
                appointmentFeel,
              },
            })
          }
        />
      )}

      {currentModule ===
        "inspiration" && (
        <PhotoStep
          token={token}
          kind="inspiration"
          storageMode={
            mode
          }
          title="Your inspiration"
          description="Share up to 3 images that show the direction you like."
          maxFiles={3}
          skipLabel="I don't have inspiration to add"
          photoIds={
            response
              .inspiration
              ?.photoIds ??
            []
          }
          skipped={
            response
              .inspiration
              ?.skipped ??
            false
          }
          theme={theme}
          showError={
            attemptedContinue
          }
          onChange={(
            inspiration,
          ) =>
            patch({
              inspiration,
            })
          }
        />
      )}

      {currentModule ===
        "current-photos" && (
        <PhotoStep
          token={token}
          kind="current"
          storageMode={
            mode
          }
          title="Your current look"
          description="Add up to 2 current photos if they'll help your professional prepare."
          maxFiles={2}
          skipLabel="I don't have a current photo to add"
          photoIds={
            response
              .currentPhotos
              ?.photoIds ??
            []
          }
          skipped={
            response
              .currentPhotos
              ?.skipped ??
            false
          }
          theme={theme}
          showError={
            attemptedContinue
          }
          onChange={(
            currentPhotos,
          ) =>
            patch({
              currentPhotos,
            })
          }
        />
      )}

      {currentModule ===
        "consent" && (
        <AcknowledgementStep
          eyebrow="Consent acknowledgement"
          title="Consent acknowledgement"
          description="Review the studio's appointment acknowledgement before continuing."
          checkboxLabel="I have read and acknowledge the studio's consent information for this appointment."
          acknowledged={
            response
              .consent
              ?.acknowledged ??
            false
          }
          theme={theme}
          showError={
            attemptedContinue
          }
          onChange={(
            acknowledged,
          ) =>
            patch({
              consent: {
                acknowledged,
              },
            })
          }
        >
          <p>
            This is a simple appointment acknowledgement. It is not a signature or a claim of legal sufficiency.
          </p>
        </AcknowledgementStep>
      )}

      {currentModule ===
        "prep" && (
        <AcknowledgementStep
          eyebrow="Before your appointment"
          title="Before your appointment"
          description="A little preparation helps your professional start with the right context."
          checkboxLabel="I've read the prep notes."
          acknowledged={
            response
              .prep
              ?.acknowledged ??
            false
          }
          theme={theme}
          showError={
            attemptedContinue
          }
          onChange={(
            acknowledged,
          ) =>
            patch({
              prep: {
                acknowledged,
              },
            })
          }
        >
          <p>
            {getClientPrepCopy(
              draft.service,
            )}
          </p>
        </AcknowledgementStep>
      )}

      {isReview && (
        <ClientReview
          draft={draft}
          record={
            response
          }
          theme={theme}
        />
      )}

      {saveError && (
        <p className="mt-5 text-xs font-semibold text-[var(--warning)]">
          Progress could not be saved. Please try again before leaving this page.
        </p>
      )}

      <div
        className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
        style={{
          borderColor:
            theme.border,
        }}
      >
        <button
          type="button"
          onClick={
            goBack
          }
          disabled={
            saving
          }
          className="focus-ring motion-soft inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-bold disabled:opacity-50"
          style={{
            borderColor:
              theme.border,

            color:
              theme.text,
          }}
        >
          <ArrowLeft
            size={16}
            aria-hidden="true"
          />

          Back
        </button>

        {isReview ? (
          <button
            type="button"
            onClick={() => {
              void submitExperience();
            }}
            disabled={
              saving
            }
            className="focus-ring motion-soft pressable inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold disabled:opacity-50"
            style={{
              backgroundColor:
                theme.primary,

              color:
                theme.onPrimary,
            }}
          >
            {saving
              ? "Submitting…"
              : "Submit experience"}

            {!saving && (
              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={
              continueForward
            }
            disabled={
              saving
            }
            className="focus-ring motion-soft pressable inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold disabled:opacity-50"
            style={{
              backgroundColor:
                theme.primary,

              color:
                theme.onPrimary,
            }}
          >
            {saving
              ? "Saving…"
              : "Continue"}

            {!saving && (
              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            )}
          </button>
        )}
      </div>
    </ClientExperienceShell>
  );
}
