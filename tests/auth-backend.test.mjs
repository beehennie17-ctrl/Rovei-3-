import assert from "node:assert/strict";
import { test } from "node:test";

import { mapAuthError } from "../lib/auth/auth-errors.ts";
import { getSafeNext } from "../lib/auth/safe-next.ts";
import { executeBootstrapStudioRpc } from "../lib/backend/bootstrap-rpc.ts";

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
  assert.equal(getSafeNext("https://example.com"), "/app");
  assert.equal(getSafeNext("//example.com"), "/app");
  assert.equal(getSafeNext("/\\example.com"), "/app");
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
