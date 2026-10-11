export function getSupportReturnLink(
  authenticated: boolean,
  subscriptionActive: boolean,
) {
  if (!authenticated) {
    return { href: "/", label: "Back to Rovei →" };
  }

  if (!subscriptionActive) {
    return {
      href: "/?rovei=activation",
      label: "Back to activation →",
    };
  }

  return {
    href: "/?rovei=app&fromSupport=settings",
    label: "Back to Settings →",
  };
}

export function shouldRestoreSupportSettings(
  screen: string,
  fromSupport: string | null,
) {
  return screen === "app" && fromSupport === "settings";
}
