import { areBeautyPackModulesCanonical, canonicalizeBeautyPackModules, isValidBeautyPackName } from "@/lib/beauty-pack";
import { isExperienceModuleId } from "@/lib/experience-options";
import { isServiceCategoryId } from "@/lib/service-categories";
import type { BeautyPack, BeautyPackInput, BeautyPackPrototypeStore } from "@/types/beauty-pack";

export const BEAUTY_PACK_PROTOTYPE_KEY = "rovei:beauty-packs-prototype";

const PACK_ID_PATTERN = /^bp_(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|[0-9a-f]{32})$/i;
const PACK_FIELDS = ["id", "name", "service", "modules", "createdAt", "updatedAt"];
const STORE_FIELDS = ["packs", "updatedAt"];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function hasExactFields(value: Record<string, unknown>, expected: string[]) {
  const keys = Object.keys(value).sort();
  const target = [...expected].sort();
  return keys.length === target.length && keys.every((key, index) => key === target[index]);
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || !value) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

export function isValidBeautyPackId(value: unknown): value is string {
  return typeof value === "string" && PACK_ID_PATTERN.test(value);
}

export function isValidBeautyPack(value: unknown): value is BeautyPack {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if (!hasExactFields(record, PACK_FIELDS)) return false;
  if (!isValidBeautyPackId(record.id)) return false;
  if (typeof record.name !== "string" || !isValidBeautyPackName(record.name) || record.name !== record.name.trim()) return false;
  if (!isServiceCategoryId(record.service)) return false;
  if (!Array.isArray(record.modules) || record.modules.length < 1 || !record.modules.every(isExperienceModuleId)) return false;
  if (!areBeautyPackModulesCanonical(record.modules)) return false;
  if (!isIsoTimestamp(record.createdAt) || !isIsoTimestamp(record.updatedAt)) return false;
  if (Date.parse(record.updatedAt) < Date.parse(record.createdAt)) return false;
  return true;
}

export function isValidBeautyPackStore(value: unknown): value is BeautyPackPrototypeStore {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if (!hasExactFields(record, STORE_FIELDS)) return false;
  if (!Array.isArray(record.packs) || !record.packs.every(isValidBeautyPack)) return false;
  if (!isIsoTimestamp(record.updatedAt)) return false;
  const ids = record.packs.map((pack) => pack.id);
  return new Set(ids).size === ids.length;
}

function removeCorruptStore() {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(BEAUTY_PACK_PROTOTYPE_KEY);
  } catch {
    // Browser storage is best-effort in this frontend prototype.
  }
}

export function readBeautyPackStore(): BeautyPackPrototypeStore {
  if (!canUseStorage()) return { packs: [], updatedAt: new Date(0).toISOString() };

  try {
    const raw = window.localStorage.getItem(BEAUTY_PACK_PROTOTYPE_KEY);
    if (!raw) return { packs: [], updatedAt: new Date(0).toISOString() };
    const parsed: unknown = JSON.parse(raw);
    if (!isValidBeautyPackStore(parsed)) {
      removeCorruptStore();
      return { packs: [], updatedAt: new Date(0).toISOString() };
    }
    return parsed;
  } catch {
    removeCorruptStore();
    return { packs: [], updatedAt: new Date(0).toISOString() };
  }
}

export function writeBeautyPackStore(store: BeautyPackPrototypeStore) {
  if (!isValidBeautyPackStore(store) || !canUseStorage()) return false;
  try {
    window.localStorage.setItem(BEAUTY_PACK_PROTOTYPE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

function generateFallbackPackId() {
  if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") return null;
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `bp_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function generateBeautyPackId() {
  if (typeof crypto === "undefined") return null;
  if (typeof crypto.randomUUID === "function") return `bp_${crypto.randomUUID()}`;
  return generateFallbackPackId();
}

export function createBeautyPack(input: BeautyPackInput): BeautyPack | null {
  if (!isValidBeautyPackName(input.name) || !isServiceCategoryId(input.service) || input.modules.length < 1 || !input.modules.every(isExperienceModuleId)) return null;
  const id = generateBeautyPackId();
  if (!id) return null;
  const now = new Date().toISOString();
  const pack: BeautyPack = {
    id,
    name: input.name.trim(),
    service: input.service,
    modules: canonicalizeBeautyPackModules(input.modules),
    createdAt: now,
    updatedAt: now,
  };
  if (!isValidBeautyPack(pack)) return null;
  const current = readBeautyPackStore();
  const next = { packs: [...current.packs, pack], updatedAt: now };
  return writeBeautyPackStore(next) ? pack : null;
}

export function updateBeautyPack(id: string, input: BeautyPackInput): BeautyPack | null {
  if (!isValidBeautyPackId(id) || !isValidBeautyPackName(input.name) || !isServiceCategoryId(input.service) || input.modules.length < 1 || !input.modules.every(isExperienceModuleId)) return null;
  const current = readBeautyPackStore();
  const existing = current.packs.find((pack) => pack.id === id);
  if (!existing) return null;
  const currentTime = Date.now();
  const previousTime = Date.parse(existing.updatedAt);
  const now = new Date(Math.max(currentTime, previousTime + 1)).toISOString();
  const updated: BeautyPack = {
    ...existing,
    name: input.name.trim(),
    service: input.service,
    modules: canonicalizeBeautyPackModules(input.modules),
    updatedAt: now,
  };
  const next = {
    packs: current.packs.map((pack) => (pack.id === id ? updated : pack)),
    updatedAt: now,
  };
  return writeBeautyPackStore(next) ? updated : null;
}

export function deleteBeautyPack(id: string) {
  if (!isValidBeautyPackId(id)) return false;
  const current = readBeautyPackStore();
  if (!current.packs.some((pack) => pack.id === id)) return false;
  const now = new Date().toISOString();
  return writeBeautyPackStore({ packs: current.packs.filter((pack) => pack.id !== id), updatedAt: now });
}

export function getBeautyPackById(id: string) {
  if (!isValidBeautyPackId(id)) return null;
  return readBeautyPackStore().packs.find((pack) => pack.id === id) ?? null;
}
