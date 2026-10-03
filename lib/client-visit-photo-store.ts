import { isValidPrototypeClientToken } from "@/lib/client-link-prototype";
import { isValidPrototypeVisitId } from "@/lib/client-visit";
import type { PrototypeVisitPhotoKind, PrototypeVisitPhotoRecord } from "@/types/client-visit";

export const VISIT_PHOTO_DATABASE = "rovei-visit-prototype";
export const VISIT_PHOTO_STORE = "visit-photos";
const DATABASE_VERSION = 1;
const MAX_FILES_PER_KIND = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function canUseIndexedDb() {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error("IndexedDB is unavailable in this browser."));
      return;
    }

    const request = window.indexedDB.open(VISIT_PHOTO_DATABASE, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(VISIT_PHOTO_STORE)) {
        const store = database.createObjectStore(VISIT_PHOTO_STORE, { keyPath: "id" });
        store.createIndex("token", "token", { unique: false });
        store.createIndex("token-visit", ["token", "visitId"], { unique: false });
        store.createIndex("token-visit-kind", ["token", "visitId", "kind"], { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open prototype visit photo storage."));
  });
}

function isVisitPhotoKind(value: unknown): value is PrototypeVisitPhotoKind {
  return value === "before" || value === "after";
}

function isPrototypeVisitPhotoRecord(value: unknown): value is PrototypeVisitPhotoRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const allowed = new Set(["id", "token", "visitId", "kind", "name", "type", "size", "blob"]);
  const keys = Object.keys(record);
  if (keys.length !== allowed.size || keys.some((key) => !allowed.has(key))) return false;
  return (
    isValidPrototypeVisitId(record.id) &&
    isValidPrototypeClientToken(record.token) &&
    isValidPrototypeVisitId(record.visitId) &&
    isVisitPhotoKind(record.kind) &&
    typeof record.name === "string" &&
    record.name.length > 0 &&
    typeof record.type === "string" &&
    record.type.startsWith("image/") &&
    typeof record.size === "number" &&
    Number.isFinite(record.size) &&
    record.size >= 0 &&
    typeof Blob !== "undefined" &&
    record.blob instanceof Blob
  );
}

export function generatePrototypeVisitPhotoId(): string {
  if (typeof window === "undefined" || !window.crypto) {
    throw new Error("Prototype visit photo IDs require the browser Web Crypto API.");
  }
  if (typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  if (!window.crypto.getRandomValues) throw new Error("Prototype visit photo IDs require Web Crypto randomness.");

  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function savePrototypeVisitPhotos(
  token: string,
  visitId: string,
  kind: PrototypeVisitPhotoKind,
  files: File[],
): Promise<PrototypeVisitPhotoRecord[]> {
  if (!isValidPrototypeClientToken(token) || !isValidPrototypeVisitId(visitId)) {
    throw new Error("Invalid prototype visit photo association.");
  }
  if (files.length === 0) return [];
  if (files.length > MAX_FILES_PER_KIND || files.some((file) => !file.type.startsWith("image/") || file.size > MAX_FILE_SIZE)) {
    throw new Error("Prototype visit photos must be images, at most 3 per kind, and no larger than 10 MB each.");
  }
  const database = await openDatabase();
  try {
    const records = files.map<PrototypeVisitPhotoRecord>((file) => ({
      id: generatePrototypeVisitPhotoId(),
      token,
      visitId,
      kind,
      name: file.name,
      type: file.type,
      size: file.size,
      blob: file,
    }));

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(VISIT_PHOTO_STORE, "readwrite");
      const store = transaction.objectStore(VISIT_PHOTO_STORE);
      records.forEach((record) => store.put(record));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Unable to store prototype visit photos."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Prototype visit photo storage was interrupted."));
    });
    return records;
  } finally {
    database.close();
  }
}

export async function readPrototypeVisitPhotos(
  token: string,
  visitId?: string,
  kind?: PrototypeVisitPhotoKind,
): Promise<PrototypeVisitPhotoRecord[]> {
  const database = await openDatabase();
  try {
    const values = await new Promise<unknown[]>((resolve, reject) => {
      const transaction = database.transaction(VISIT_PHOTO_STORE, "readonly");
      const store = transaction.objectStore(VISIT_PHOTO_STORE);
      let request: IDBRequest;
      if (visitId && kind) request = store.index("token-visit-kind").getAll([token, visitId, kind]);
      else if (visitId) request = store.index("token-visit").getAll([token, visitId]);
      else request = store.index("token").getAll(token);
      request.onsuccess = () => resolve(request.result as unknown[]);
      request.onerror = () => reject(request.error ?? new Error("Unable to read prototype visit photos."));
    });
    return values.filter(isPrototypeVisitPhotoRecord);
  } finally {
    database.close();
  }
}

export async function clearPrototypeVisitPhotosForVisit(token: string, visitId: string): Promise<void> {
  const database = await openDatabase();
  try {
    const records = await new Promise<unknown[]>((resolve, reject) => {
      const transaction = database.transaction(VISIT_PHOTO_STORE, "readonly");
      const request = transaction.objectStore(VISIT_PHOTO_STORE).index("token-visit").getAll([token, visitId]);
      request.onsuccess = () => resolve(request.result as unknown[]);
      request.onerror = () => reject(request.error ?? new Error("Unable to read prototype visit photos."));
    });
    const ids = records.filter(isPrototypeVisitPhotoRecord).map((record) => record.id);
    if (ids.length === 0) return;

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(VISIT_PHOTO_STORE, "readwrite");
      const store = transaction.objectStore(VISIT_PHOTO_STORE);
      ids.forEach((id) => store.delete(id));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Unable to clear prototype visit photos."));
    });
  } finally {
    database.close();
  }
}
