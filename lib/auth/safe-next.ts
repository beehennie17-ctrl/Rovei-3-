export function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/app";
  }

  const base = new URL("https://rovei.invalid");
  const destination = new URL(value, base);

  if (destination.origin !== base.origin) {
    return "/app";
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
}
