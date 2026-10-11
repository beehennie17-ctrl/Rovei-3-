import assert from "node:assert/strict";
import { test } from "node:test";

import { mapAuthError } from "../lib/auth/auth-errors.ts";
import {
  getEmailConfirmationRedirect,
  renderLockedShellDocument,
  requiresEmailConfirmation,
  resolveLockedShellScreen,
} from "../lib/auth/locked-shell.ts";
import { readLegacyCallbackSession, selectEmailConfirmationMethod } from "../lib/auth/confirmation-method.ts";
import { getSafeNext } from "../lib/auth/safe-next.ts";
import { executeBootstrapStudioRpc } from "../lib/backend/bootstrap-rpc.ts";
import {
  completeBrowserEmailConfirmation,
  completeServerEmailConfirmation,
} from "../lib/auth/confirmation-flow.ts";
import { getConfiguredPublicOrigin } from "../lib/auth/public-origin.ts";
import {
  effectiveSubscriptionStatus,
  hasActiveSubscription,
  getStudioSubscriptionAccess,
} from "../lib/backend/subscription-access.ts";

test("new signups wait for confirmation and use the server callback", () => {
  assert.equal(requiresEmailConfirmation(null), true);
  assert.equal(requiresEmailConfirmation({ access_token: "session" }), false);
  assert.equal(
    getEmailConfirmationRedirect("https://rovei.example/path"),
    "https://rovei.example/auth/callback",
  );
});

test("confirmed unpaid users go straight to the locked paywall", () => {
  assert.equal(
    resolveLockedShellScreen({
      authenticated: true,
      requestedScreen: "app",
      hasStudio: true,
      subscriptionStatus: "inactive",
    }),
    "activation",
  );
});

test("active and trialing subscribers reach the locked dashboard", () => {
  for (const subscriptionStatus of ["active", "trialing"]) {
    assert.equal(
      resolveLockedShellScreen({
        authenticated: true,
        requestedScreen: "activation",
        hasStudio: true,
        subscriptionStatus,
      }),
      "app",
    );
  }
});

test("expired or missing authentication cannot unlock the dashboard", () => {
  assert.equal(
    resolveLockedShellScreen({
      authenticated: false,
      requestedScreen: "app",
      hasStudio: true,
      subscriptionStatus: "active",
    }),
    "landing",
  );
});

test("returning users never repeat onboarding, regardless of query parameters", () => {
  assert.equal(
    resolveLockedShellScreen({
      authenticated: true,
      requestedScreen: "onboarding",
      hasStudio: true,
      subscriptionStatus: "inactive",
    }),
    "activation",
  );
  assert.equal(
    resolveLockedShellScreen({
      authenticated: true,
      requestedScreen: null,
      hasStudio: false,
      subscriptionStatus: null,
    }),
    "activation",
  );
});

test("Studio metadata restores onboarding after confirmation without browser state", () => {
  const document = renderLockedShellDocument(
    "<html><head></head><body><script>lockedApp()</script></body></html>",
    {
      screen: "activation",
      studio: { name: "Mia Studio" },
    },
    null,
  );

  assert.ok(
    document.indexOf("rovei-auth-prelude") <
      document.indexOf("lockedApp()"),
  );
  assert.match(document, /"name":"Mia Studio"/);
  assert.match(document, /localStorage\.setItem\(key, JSON\.stringify\(initialState\)\)/);
});

test("unauthenticated query parameters cannot skip the locked paywall", () => {
  const screen = resolveLockedShellScreen({
    authenticated: false,
    requestedScreen: "activation",
    hasStudio: false,
    subscriptionStatus: null,
  });
  const document = renderLockedShellDocument(
    "<html><head></head><body></body></html>",
    null,
    screen === "welcome" ? "onboarding" : null,
  );

  assert.equal(screen, "landing");
  assert.match(document, /state\.screen = "landing"/);
});

test("invalid credentials return a non-enumerating login error", () => {
  const result = mapAuthError(
    {
      code: "invalid_credentials",
      message: "Invalid login credentials",
    },
    "login",
  );

  assert.equal(result.status, 401);
  assert.equal(result.code, "invalid_credentials");
  assert.equal(result.message, "Email or password is incorrect.");
});

test("unconfirmed email and duplicate signup errors are actionable", () => {
  assert.deepEqual(
    mapAuthError(
      { code: "email_not_confirmed", message: "Email not confirmed" },
      "login",
    ),
    {
      status: 403,
      code: "email_not_confirmed",
      message: "Confirm your email before signing in.",
    },
  );
  assert.equal(
    mapAuthError(
      { code: "user_already_exists", message: "User already registered" },
      "signup",
    ).status,
    409,
  );
});

test("expired sessions require a fresh sign-in", () => {
  const result = mapAuthError(
    { code: "session_not_found", message: "Session not found" },
    "session",
  );

  assert.equal(result.status, 401);
  assert.equal(result.code, "session_expired");
});

test("callback destinations reject external and backslash-based paths", () => {
  assert.equal(getSafeNext("/app/studio"), "/app/studio");
  assert.equal(getSafeNext("/app?target=%2F"), "/app?target=%2F");
  assert.equal(getSafeNext("https://example.com"), "/app");
  assert.equal(getSafeNext("//example.com"), "/app");
  assert.equal(getSafeNext("/\\example.com"), "/app");
  assert.equal(getSafeNext("/%5c%5cexample.com"), "/%5c%5cexample.com");
});

test("studio bootstrap RPC returns created and already-existing studios", async () => {
  let calls = 0;
  const args = { p_name: "Mia Studio" };
  const create = await executeBootstrapStudioRpc(async (received) => {
    calls += 1;
    assert.equal(received, args);
    return {
      data: [{ studio_id: "studio-1", already_exists: false }],
      error: null,
    };
  }, args);

  const existing = await executeBootstrapStudioRpc(async () => ({
    data: { studio_id: "studio-1", already_exists: true },
    error: null,
  }), args);

  assert.equal(calls, 1);
  assert.deepEqual(create, { studioId: "studio-1", alreadyExists: false });
  assert.deepEqual(existing, { studioId: "studio-1", alreadyExists: true });
});

test("studio bootstrap RPC errors and malformed results fail explicitly", async () => {
  await assert.rejects(
    executeBootstrapStudioRpc(async () => ({
      data: null,
      error: { message: "database unavailable" },
    }), {}),
    /database unavailable/,
  );
  await assert.rejects(
    executeBootstrapStudioRpc(async () => ({
      data: [],
      error: null,
    }), {}),
    /invalid result/,
  );
});

test("email confirmation supports token hashes and existing OAuth codes", () => {
  assert.deepEqual(
    selectEmailConfirmationMethod({
      code: null,
      tokenHash: "example",
      type: "email",
    }),
    { kind: "token_hash", tokenHash: "example", type: "email" },
  );

  assert.deepEqual(
    selectEmailConfirmationMethod({
      code: "example",
      tokenHash: null,
      type: null,
    }),
    { kind: "code", code: "example" },
  );

  assert.deepEqual(
    selectEmailConfirmationMethod({
      code: null,
      tokenHash: "signup-token",
      type: "signup",
    }),
    { kind: "token_hash", tokenHash: "signup-token", type: "signup" },
  );

  assert.equal(
    selectEmailConfirmationMethod({
      code: null,
      tokenHash: "example",
      type: "recovery",
    }),
    "invalid_type",
  );

  assert.equal(
    selectEmailConfirmationMethod({
      code: null,
      tokenHash: null,
      type: null,
    }),
    "missing",
  );
});

test("server confirmation verifies signup tokens with the matching Supabase OTP type", async () => {
  const calls = [];
  const user = { id: "user-1", user_metadata: {} };
  const supabase = {
    auth: {
      verifyOtp: async (input) => {
        calls.push(["verifyOtp", input]);
        return { error: null };
      },
      exchangeCodeForSession: async () => {
        assert.fail("Signup token hashes must not be exchanged as PKCE codes.");
      },
      getUser: async () => ({
        data: { user },
        error: null,
      }),
    },
  };

  const result = await completeServerEmailConfirmation(
    supabase,
    new URLSearchParams("token_hash=signup-token&type=signup"),
  );

  assert.deepEqual(calls, [
    ["verifyOtp", { token_hash: "signup-token", type: "signup" }],
  ]);
  assert.deepEqual(result, { kind: "confirmed", user });
});

test("server confirmation uses PKCE codes and sends fragment-only links to the browser handler", async () => {
  let exchanges = 0;
  const supabase = {
    auth: {
      verifyOtp: async () => assert.fail("No OTP token was supplied."),
      exchangeCodeForSession: async (code) => {
        exchanges += 1;
        assert.equal(code, "pkce-code");
        return { error: null };
      },
      getUser: async () => ({
        data: { user: { id: "user-2", user_metadata: {} } },
        error: null,
      }),
    },
  };

  assert.deepEqual(
    await completeServerEmailConfirmation(
      supabase,
      new URLSearchParams("code=pkce-code"),
    ),
    { kind: "confirmed", user: { id: "user-2", user_metadata: {} } },
  );
  assert.deepEqual(
    await completeServerEmailConfirmation(
      supabase,
      new URLSearchParams(),
    ),
    { kind: "fragment_handoff" },
  );
  assert.equal(exchanges, 1);
});

test("expired or invalid confirmation cannot create a server-confirmed session", async () => {
  const supabase = {
    auth: {
      verifyOtp: async () => ({
        error: { code: "otp_expired" },
      }),
      exchangeCodeForSession: async () => assert.fail(),
      getUser: async () => assert.fail("Failed verification must not load a user."),
    },
  };

  assert.deepEqual(
    await completeServerEmailConfirmation(
      supabase,
      new URLSearchParams("token_hash=expired&type=signup"),
    ),
    { kind: "confirmation_failed", errorCode: "otp_expired" },
  );
  assert.deepEqual(
    await completeServerEmailConfirmation(
      supabase,
      new URLSearchParams("token_hash=invalid&type=recovery"),
    ),
    { kind: "invalid_confirmation" },
  );
});

test("fragment session handler persists a session and confirms its server-validated user", async () => {
  const calls = [];
  const user = { id: "fragment-user", user_metadata: {} };
  const supabase = {
    auth: {
      setSession: async (session) => {
        calls.push(["setSession", session]);
        return { data: { session: { user } }, error: null };
      },
      getUser: async () => ({
        data: { user },
        error: null,
      }),
    },
  };

  assert.deepEqual(
    await completeBrowserEmailConfirmation(supabase, {
      accessToken: "access",
      refreshToken: "refresh",
    }),
    user,
  );
  assert.deepEqual(calls, [[
    "setSession",
    { access_token: "access", refresh_token: "refresh" },
  ]]);
});

test("confirmation redirects require an HTTPS public origin", () => {
  assert.equal(
    getConfiguredPublicOrigin("https://studio.example:3100/path"),
    "https://studio.example:3100",
  );
  for (const invalidOrigin of [
    undefined,
    "not a URL",
    "http://studio.example",
    "https://localhost:3100",
    "https://0.0.0.0:3100",
  ]) {
    assert.equal(getConfiguredPublicOrigin(invalidOrigin), null);
  }
});

test("expired or unpaid subscriptions cannot use protected Studio APIs", async () => {
  const now = Date.parse("2026-10-11T12:00:00.000Z");

  assert.equal(hasActiveSubscription("active", null, now), true);
  assert.equal(
    hasActiveSubscription("trialing", "2026-10-12T00:00:00.000Z", now),
    true,
  );
  assert.equal(
    hasActiveSubscription("active", "2026-10-10T00:00:00.000Z", now),
    false,
  );
  assert.equal(hasActiveSubscription("inactive", null, now), false);
  assert.equal(hasActiveSubscription(null, null, now), false);
  assert.equal(
    effectiveSubscriptionStatus("active", "2026-10-10T00:00:00.000Z"),
    "inactive",
  );

  function subscriptionClient(data) {
    const query = {
      select() {
        return this;
      },
      eq(column, studioId) {
        assert.equal(column, "studio_id");
        assert.equal(studioId, "studio-1");
        return this;
      },
      async maybeSingle() {
        return data;
      },
    };
    return {
      from(table) {
        assert.equal(table, "subscriptions");
        return query;
      },
    };
  }

  assert.deepEqual(
    await getStudioSubscriptionAccess(
      subscriptionClient({
      data: { status: "trialing", current_period_end: null },
      error: null,
      }),
      "studio-1",
    ),
    { allowed: true, error: null },
  );
  assert.deepEqual(
    await getStudioSubscriptionAccess(
      subscriptionClient({
        data: { status: "cancelled", current_period_end: null },
        error: null,
      }),
      "studio-1",
    ),
    { allowed: false, error: null },
  );
  const databaseError = { message: "database unavailable" };
  assert.deepEqual(
    await getStudioSubscriptionAccess(
      subscriptionClient({ data: null, error: databaseError }),
      "studio-1",
    ),
    { allowed: false, error: databaseError },
  );
});


test("default email fragment can supply a session", () => {
  assert.deepEqual(
    readLegacyCallbackSession(
      "#access_token=exampleAccess&refresh_token=exampleRefresh&type=signup",
    ),
    {
      accessToken: "exampleAccess",
      refreshToken: "exampleRefresh",
    },
  );

  assert.equal(readLegacyCallbackSession(""), null);
  assert.equal(
    readLegacyCallbackSession("#access_token=missingRefresh"),
    null,
  );
  assert.equal(
    readLegacyCallbackSession("?code=abc"),
    null,
  );
});
