import { EXPERIENCE_OPTIONS } from "@/lib/experience-options";
import type { BeautyPack } from "@/types/beauty-pack";
import type { ExperienceModuleId } from "@/types/onboarding";

export const BEAUTY_PACK_NAME_MIN_LENGTH = 2;
export const BEAUTY_PACK_NAME_MAX_LENGTH = 60;

const MODULE_ORDER = new Map<ExperienceModuleId, number>(
  EXPERIENCE_OPTIONS.map((option, index) => [option.id, index]),
);

export function isValidBeautyPackName(value: string) {
  const length = value.trim().length;
  return length >= BEAUTY_PACK_NAME_MIN_LENGTH && length <= BEAUTY_PACK_NAME_MAX_LENGTH;
}

export function canonicalizeBeautyPackModules(modules: ExperienceModuleId[]): ExperienceModuleId[] {
  return [...new Set(modules)].sort(
    (a, b) => (MODULE_ORDER.get(a) ?? Number.MAX_SAFE_INTEGER) - (MODULE_ORDER.get(b) ?? Number.MAX_SAFE_INTEGER),
  );
}

export function areBeautyPackModulesCanonical(modules: ExperienceModuleId[]) {
  if (new Set(modules).size !== modules.length) return false;
  const canonical = canonicalizeBeautyPackModules(modules);
  return canonical.length === modules.length && canonical.every((moduleId, index) => moduleId === modules[index]);
}

export function sortBeautyPacksByUpdatedAt(packs: BeautyPack[]) {
  return [...packs].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function formatBeautyPackCount(count: number) {
  return `${count} Beauty Pack${count === 1 ? "" : "s"}`;
}

export function formatBeautyPackUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Updated recently";
  return `Updated ${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)}`;
}
