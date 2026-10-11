export function getConfiguredPublicOrigin(
  configuredUrl = process.env.NEXT_PUBLIC_SITE_URL,
) {
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    const hostname = url.hostname.toLowerCase();

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname === "127.0.0.1"
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}
