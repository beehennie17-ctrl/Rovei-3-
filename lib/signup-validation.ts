export const FIRST_NAME_MAX_LENGTH = 50;
export const PASSWORD_MIN_LENGTH = 8;

export function isValidFirstName(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 2 && trimmed.length <= FIRST_NAME_MAX_LENGTH;
}

export function isValidEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function isValidPassword(value: string) {
  return value.length >= PASSWORD_MIN_LENGTH;
}
