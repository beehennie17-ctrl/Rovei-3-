import type { PrototypePhotoKind, PrototypePhotoRecord } from "@/types/client-experience";

export const PROTOTYPE_PHOTO_DATABASE = "rovei-prototype";
export const PROTOTYPE_PHOTO_STORE = "client-experience-photos";
const DATABASE_VERSION = 1;

function canUseIndexedDb() {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error("IndexedDB is unavailable in this browser."));
      return;
    }

    const request = window.indexedDB.open(PROTOTYPE_PHOTO_DATABASE, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PROTOTYPE_PHOTO_STORE)) {
        const store = database.createObjectStore(PROTOTYPE_PHOTO_STORE, { keyPath: "id" });
        store.createIndex("token", "token", { unique: false });
        store.createIndex("token-kind", ["token", "kind"], { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open prototype photo storage."));
  });
}

function isPhotoKind(value: unknown): value is PrototypePhotoKind {
  return value === "inspiration" || value === "current";
}

function isPrototypePhotoRecord(value: unknown): value is PrototypePhotoRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const allowed = new Set(["id", "token", "kind", "name", "type", "size", "blob"]);
  if (Object.keys(record).length !== allowed.size || Object.keys(record).some((key) => !allowed.has(key))) return false;
  return (
    typeof record.id === "string" &&
    record.id.length >= 8 &&
    typeof record.token === "string" &&
    record.token.startsWith("rv_") &&
    isPhotoKind(record.kind) &&
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

export function generatePrototypePhotoId(): string {
  if (typeof window === "undefined" || !window.crypto) {
    throw new Error("Prototype photo IDs require the browser Web Crypto API.");
  }
  if (typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  if (!window.crypto.getRandomValues) throw new Error("Prototype photo IDs require Web Crypto randomness.");

  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function savePrototypePhotos(
  token: string,
  kind: PrototypePhotoKind,
  files: File[],
): Promise<PrototypePhotoRecord[]> {
  if (files.length === 0) return [];
  const database = await openDatabase();

  try {
    const records = files.map<PrototypePhotoRecord>((file) => ({
      id: generatePrototypePhotoId(),
      token,
      kind,
      name: file.name,
      type: file.type,
      size: file.size,
      blob: file,
    }));

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(PROTOTYPE_PHOTO_STORE, "readwrite");
      const store = transaction.objectStore(PROTOTYPE_PHOTO_STORE);
      records.forEach((record) => store.put(record));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Unable to store prototype photos."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Prototype photo storage was interrupted."));
    });

    return records;
  } finally {
    database.close();
  }
}

export async function readPrototypePhotos(
  token: string,
  kind?: PrototypePhotoKind,
): Promise<PrototypePhotoRecord[]> {
  const database = await openDatabase();
  try {
    const values = await new Promise<unknown[]>((resolve, reject) => {
      const transaction = database.transaction(PROTOTYPE_PHOTO_STORE, "readonly");
      const store = transaction.objectStore(PROTOTYPE_PHOTO_STORE);
      const index = kind ? store.index("token-kind") : store.index("token");
      const request = kind ? index.getAll([token, kind]) : index.getAll(token);
      request.onsuccess = () => resolve(request.result as unknown[]);
      request.onerror = () => reject(request.error ?? new Error("Unable to read prototype photos."));
    });
    return values.filter(isPrototypePhotoRecord);
  } finally {
    database.close();
  }
}

export async function deletePrototypePhoto(id: string, token: string): Promise<boolean> {
  const database = await openDatabase();
  try {
    const existing = await new Promise<unknown>((resolve, reject) => {
      const transaction = database.transaction(PROTOTYPE_PHOTO_STORE, "readonly");
      const request = transaction.objectStore(PROTOTYPE_PHOTO_STORE).get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Unable to read prototype photo."));
    });
    if (!isPrototypePhotoRecord(existing) || existing.token !== token) return false;

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(PROTOTYPE_PHOTO_STORE, "readwrite");
      transaction.objectStore(PROTOTYPE_PHOTO_STORE).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Unable to delete prototype photo."));
    });
    return true;
  } finally {
    database.close();
  }
}

export async function clearPrototypePhotosForToken(token: string): Promise<void> {
  const database = await openDatabase();
  try {
    const records = await new Promise<unknown[]>((resolve, reject) => {
      const transaction = database.transaction(PROTOTYPE_PHOTO_STORE, "readonly");
      const request = transaction.objectStore(PROTOTYPE_PHOTO_STORE).index("token").getAll(token);
      request.onsuccess = () => resolve(request.result as unknown[]);
      request.onerror = () => reject(request.error ?? new Error("Unable to read prototype photos."));
    });
    const ids = records.filter(isPrototypePhotoRecord).map((record) => record.id);
    if (ids.length === 0) return;

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(PROTOTYPE_PHOTO_STORE, "readwrite");
      const store = transaction.objectStore(PROTOTYPE_PHOTO_STORE);
      ids.forEach((id) => store.delete(id));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Unable to clear prototype photos."));
    });
  } finally {
    database.close();
  }
}
