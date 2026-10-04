"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Trash2,
} from "lucide-react";

import {
  BeautyPackDeleteDialog,
} from "@/components/beauty-packs/beauty-pack-delete-dialog";

import {
  BeautyPackForm,
} from "@/components/beauty-packs/beauty-pack-form";

import {
  BeautyPackNotFound,
} from "@/components/beauty-packs/beauty-pack-not-found";

import {
  BeautyPackPreview,
} from "@/components/beauty-packs/beauty-pack-preview";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
} from "@/components/ui/card";

import {
  canonicalizeBeautyPackModules,
  isValidBeautyPackName,
} from "@/lib/beauty-pack";

import {
  createBeautyPackData,
  deleteBeautyPackData,
  loadBeautyPack,
  loadStudio,
  updateBeautyPackData,
} from "@/lib/data/rovei-data-source";

import {
  RoveiApiError,
  type BackendMode,
} from "@/lib/backend/api-client";

import {
  getRecommendedExperienceModules,
} from "@/lib/experience-recommendations";

import {
  isServiceCategoryId,
} from "@/lib/service-categories";

import {
  resolveClientTheme,
} from "@/lib/theme-resolver";

import type {
  ClientTheme,
} from "@/types";

import type {
  BeautyPack,
} from "@/types/beauty-pack";

import type {
  ExperienceModuleId,
  ServiceCategoryId,
} from "@/types/onboarding";

type EditorMode =
  | "create"
  | "edit";

type TouchedState = {
  name: boolean;
  service: boolean;
  modules: boolean;
};

const untouched:
  TouchedState = {
    name: false,
    service: false,
    modules: false,
  };

export function BeautyPackEditor({
  mode,
  packId,
}: {
  mode: EditorMode;
  packId?: string;
}) {
  const router =
    useRouter();

  const [
    hydrated,
    setHydrated,
  ] = useState(false);

  const [
    notFound,
    setNotFound,
  ] = useState(false);

  const [
    loadedPack,
    setLoadedPack,
  ] =
    useState<BeautyPack | null>(
      null,
    );

  const [
    name,
    setName,
  ] = useState("");

  const [
    service,
    setService,
  ] = useState<
    ServiceCategoryId | ""
  >("");

  const [
    modules,
    setModules,
  ] = useState<
    ExperienceModuleId[]
  >([]);

  const [
    modulesCustomized,
    setModulesCustomized,
  ] = useState(
    mode === "edit",
  );

  const [
    touched,
    setTouched,
  ] =
    useState<TouchedState>(
      untouched,
    );

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    saved,
    setSaved,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState("");

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    studioName,
    setStudioName,
  ] =
    useState("Your Studio");

  const [
    theme,
    setTheme,
  ] = useState<ClientTheme>(
    () =>
      resolveClientTheme(
        "wine",
      ),
  );

  const [
    backendMode,
    setBackendMode,
  ] =
    useState<BackendMode | null>(
      null,
    );

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const studioResult =
          await loadStudio();

        if (!active) {
          return;
        }

        setBackendMode(
          studioResult.mode,
        );

        setStudioName(
          studioResult.data
            .settings
            .studioName
            .trim() ||
            "Your Studio",
        );

        setTheme(
          resolveClientTheme(
            studioResult.data
              .settings.theme,

            studioResult.data
              .settings
              .customPrimary,
          ),
        );

        if (
          mode === "edit"
        ) {
          if (!packId) {
            setNotFound(true);
            return;
          }

          const packResult =
            await loadBeautyPack(
              packId,
            );

          if (!active) {
            return;
          }

          const pack =
            packResult.data;

          if (!pack) {
            setNotFound(true);
            return;
          }

          setLoadedPack(
            pack,
          );

          setName(
            pack.name,
          );

          setService(
            pack.service,
          );

          setModules(
            pack.modules,
          );

          setModulesCustomized(
            true,
          );
        }
      } catch (error) {
        if (!active) {
          return;
        }

        if (
          error instanceof
            RoveiApiError &&
          error.status === 404
        ) {
          setNotFound(true);
          return;
        }

        setSaveError(
          "Rovei couldn’t load this Beauty Pack. Please refresh and try again.",
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
  }, [
    mode,
    packId,
  ]);

  const recommendedModules =
    useMemo(
      () =>
        service
          ? getRecommendedExperienceModules(
              [service],
            )
          : [],
      [
        service,
      ],
    );

  const nameValid =
    isValidBeautyPackName(
      name,
    );

  const serviceValid =
    isServiceCategoryId(
      service,
    );

  const modulesValid =
    modules.length > 0;

  const formValid =
    nameValid &&
    serviceValid &&
    modulesValid;

  const nameError =
    (
      submitted ||
      touched.name
    ) &&
    !nameValid
      ? "Enter a name between 2 and 60 characters."
      : undefined;

  const serviceError =
    (
      submitted ||
      touched.service
    ) &&
    !serviceValid
      ? "Choose a service."
      : undefined;

  const modulesError =
    (
      submitted ||
      touched.modules
    ) &&
    !modulesValid
      ? "Choose at least one client-experience module."
      : undefined;

  const handleServiceChange =
    useCallback(
      (
        next:
          | ServiceCategoryId
          | "",
      ) => {
        setService(next);
        setSaved(false);
        setSaveError("");

        if (!next) {
          if (
            !modulesCustomized
          ) {
            setModules([]);
          }

          return;
        }

        if (
          mode ===
            "create" &&
          !modulesCustomized
        ) {
          setModules(
            getRecommendedExperienceModules(
              [next],
            ),
          );
        }
      },
      [
        mode,
        modulesCustomized,
      ],
    );

  function toggleModule(
    moduleId:
      ExperienceModuleId,
  ) {
    setModulesCustomized(
      true,
    );

    setTouched(
      (current) => ({
        ...current,
        modules: true,
      }),
    );

    setSaved(false);
    setSaveError("");

    setModules(
      (current) =>
        canonicalizeBeautyPackModules(
          current.includes(
            moduleId,
          )
            ? current.filter(
                (id) =>
                  id !==
                  moduleId,
              )
            : [
                ...current,
                moduleId,
              ],
        ),
    );
  }

  function applyRecommendations() {
    if (!service) {
      return;
    }

    setModules(
      getRecommendedExperienceModules(
        [service],
      ),
    );

    setModulesCustomized(
      true,
    );

    setTouched(
      (current) => ({
        ...current,
        modules: true,
      }),
    );

    setSaved(false);
    setSaveError("");
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitted(true);

    setTouched({
      name: true,
      service: true,
      modules: true,
    });

    setSaveError("");

    if (
      !formValid ||
      !service ||
      saving
    ) {
      return;
    }

    const input = {
      name:
        name.trim(),

      service,

      modules:
        canonicalizeBeautyPackModules(
          modules,
        ),
    };

    setSaving(true);

    try {
      if (
        mode === "create"
      ) {
        const result =
          await createBeautyPackData(
            input,
          );

        if (!result.data) {
          throw new Error(
            "Beauty Pack was not created.",
          );
        }

        router.push(
          "/app/beauty-packs",
        );

        return;
      }

      if (!packId) {
        return;
      }

      const result =
        await updateBeautyPackData(
          packId,
          input,
        );

      if (!result.data) {
        throw new Error(
          "Beauty Pack was not updated.",
        );
      }

      setLoadedPack(
        result.data,
      );

      setSaved(true);

      window.setTimeout(
        () =>
          setSaved(false),
        2400,
      );
    } catch {
      setSaveError(
        backendMode ===
        "supabase"
          ? "Couldn’t save this Beauty Pack to Rovei. Please try again."
          : "Couldn’t save this Beauty Pack in this browser. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !packId ||
      saving
    ) {
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const result =
        await deleteBeautyPackData(
          packId,
        );

      if (!result.deleted) {
        throw new Error(
          "Beauty Pack was not deleted.",
        );
      }

      router.push(
        "/app/beauty-packs",
      );
    } catch {
      setDeleteOpen(
        false,
      );

      setSaveError(
        backendMode ===
        "supabase"
          ? "Couldn’t delete this Beauty Pack from Rovei. Please try again."
          : "Couldn’t delete this Beauty Pack in this browser. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!hydrated) {
    return (
      <div
        className="min-h-72 rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-white"
        aria-label="Loading Beauty Pack"
      />
    );
  }

  if (notFound) {
    return (
      <BeautyPackNotFound />
    );
  }

  const isEdit =
    mode === "edit";

  return (
    <div className="mx-auto max-w-7xl space-y-8 page-enter">
      <div>
        <Link
          href="/app/beauty-packs"
          className="focus-ring inline-flex items-center gap-2 rounded-full text-sm font-semibold text-[var(--wine)] hover:underline"
        >
          <ArrowLeft
            size={16}
            aria-hidden="true"
          />

          Beauty Packs
        </Link>

        <p className="eyebrow mt-8">
          {isEdit
            ? "Beauty Pack"
            : "New Beauty Pack"}
        </p>

        <h1 className="page-title mt-3">
          {isEdit ? (
            <>
              Edit{" "}
              <span className="editorial-accent">
                {loadedPack
                  ?.name ??
                  "Beauty Pack"}
              </span>
            </>
          ) : (
            <>
              Create a{" "}
              <span className="editorial-accent">
                Beauty Pack.
              </span>
            </>
          )}
        </h1>

        <p className="body-text mt-3 max-w-2xl">
          {isEdit
            ? "Update the experience you'll reuse for this service."
            : "Choose the service and the client experience you want ready to reuse."}
        </p>
      </div>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.95fr)] lg:items-start">
        <Card className="p-6 sm:p-8">
          <form
            onSubmit={
              handleSubmit
            }
            noValidate
          >
            <BeautyPackForm
              name={name}
              service={
                service
              }
              modules={
                modules
              }
              recommendedModules={
                recommendedModules
              }
              nameError={
                nameError
              }
              serviceError={
                serviceError
              }
              modulesError={
                modulesError
              }
              onNameChange={(
                value,
              ) => {
                setName(value);
                setSaved(false);
                setSaveError("");
              }}
              onNameBlur={() =>
                setTouched(
                  (
                    current,
                  ) => ({
                    ...current,
                    name: true,
                  }),
                )
              }
              onServiceChange={
                handleServiceChange
              }
              onServiceBlur={() =>
                setTouched(
                  (
                    current,
                  ) => ({
                    ...current,
                    service:
                      true,
                  }),
                )
              }
              onToggleModule={
                toggleModule
              }
              onApplyRecommendations={
                applyRecommendations
              }
            />

            <div className="mt-8 border-t border-[var(--border-soft)] pt-6">
              {saveError && (
                <p
                  role="status"
                  className="mb-4 text-sm font-medium text-[var(--wine)]"
                >
                  {saveError}
                </p>
              )}

              {saved && (
                <p
                  role="status"
                  className="mb-4 text-sm font-semibold text-[var(--success)]"
                >
                  Saved
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="submit"
                  disabled={
                    !formValid ||
                    saving
                  }
                  className="w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span>
                    {saving
                      ? "Saving…"
                      : isEdit
                        ? "Save changes"
                        : "Create Beauty Pack"}
                  </span>

                  {!isEdit &&
                    !saving && (
                      <ArrowRight
                        size={
                          16
                        }
                        aria-hidden="true"
                      />
                    )}
                </Button>

                {isEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={
                      saving
                    }
                    onClick={() =>
                      setDeleteOpen(
                        true,
                      )
                    }
                    className="w-full text-[var(--wine)] sm:w-auto"
                    icon={
                      <Trash2
                        size={
                          15
                        }
                        aria-hidden="true"
                      />
                    }
                  >
                    Delete Beauty
                    Pack
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>

        <div className="lg:sticky lg:top-7">
          <BeautyPackPreview
            studioName={
              studioName
            }
            packName={name}
            service={service}
            modules={modules}
            theme={theme}
          />

          <p className="caption mt-4 text-center">
            <span className="font-semibold text-[var(--wine)]">
              {backendMode ===
              "supabase"
                ? "Cloud data"
                : "Prototype setup"}
            </span>

            {backendMode ===
            "supabase"
              ? " · Changes sync with your Rovei Studio."
              : " · Beauty Packs are saved in this browser until the backend is connected."}
          </p>
        </div>
      </div>

      {isEdit && (
        <BeautyPackDeleteDialog
          packName={
            loadedPack
              ?.name ??
            name
          }
          open={
            deleteOpen
          }
          onClose={() =>
            setDeleteOpen(
              false,
            )
          }
          onConfirm={() => {
            void handleDelete();
          }}
        />
      )}
    </div>
  );
}
