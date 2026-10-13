import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { isSupportAdmin, supportRequestSchema } from "../lib/support/support-core.ts";

const payload = { kind: "ticket", category: "account", subject: "Login problem", message: "I am unable to open my account after confirming my email." };
const supportRoute = readFileSync("app/api/support/route.ts", "utf8");

test("support tickets and feedback require a real message and category", () => {
  assert.equal(supportRequestSchema.safeParse(payload).success, true);
  assert.equal(supportRequestSchema.safeParse({ ...payload, kind: "feedback" }).success, true);
  assert.equal(supportRequestSchema.safeParse({ ...payload, message: "too short" }).success, false);
  assert.equal(supportRequestSchema.safeParse({ ...payload, kind: "payment_override" }).success, false);
  assert.equal(supportRequestSchema.safeParse({ ...payload, user_id: "spoofed" }).success, false);
});

test("founder inbox denies access unless the user UUID is explicitly allowlisted", () => {
  const own = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const other = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  assert.equal(isSupportAdmin(own, undefined), false);
  assert.equal(isSupportAdmin(own, other), false);
  assert.equal(isSupportAdmin(own, ` ${other}, ${own} `), true);
  assert.equal(isSupportAdmin(other, own), false);
});

test("Codespaces support origin exception is development-only and host-restricted", () => {
  const forwardingGuard = supportRoute.match(/const trustedCodespacesForwarding =([\s\S]*?);/);
  assert.ok(forwardingGuard);
  assert.match(forwardingGuard[1], /process\.env\.NODE_ENV === "development"/);
  assert.match(forwardingGuard[1], /expectedHost !== null/);
  assert.match(forwardingGuard[1], /x-forwarded-host"\) === expectedHost/);
  assert.match(forwardingGuard[1], /x-forwarded-proto"\) === "https"/);

  const codespacesOrigin = supportRoute.match(/const expectedOrigin =([\s\S]*?);/);
  assert.ok(codespacesOrigin);
  assert.match(codespacesOrigin[1], /codespace/);
  assert.match(codespacesOrigin[1], /-3100\.\$\{domain\}/);
});

test("local forwarded origin exception requires the exact Codespaces request signature", () => {
  const sameSiteGuard = supportRoute.match(/const trustedDevRequest =([\s\S]*?);/);
  assert.ok(sameSiteGuard);
  assert.match(sameSiteGuard[1], /sec-fetch-site/);

  const localOriginGuard = supportRoute.match(/const trustedLocalForwardedRequest =([\s\S]*?);/);
  assert.ok(localOriginGuard);
  assert.match(localOriginGuard[1], /trustedDevRequest/);
  assert.match(localOriginGuard[1], /https:\/\/localhost:3100/);
  assert.match(localOriginGuard[1], /host"\) === "localhost:3100"/);
  assert.match(localOriginGuard[1], /https:\/\/0\.0\.0\.0:3100/);

  assert.match(supportRoute, /if \([\s\S]*?!trustedDevRequest[\s\S]*?requireSameOrigin\(request\)/);
});

test("bridge wires the three original Support buttons without modifying locked HTML", () => {
  const bridge = readFileSync("public/rovei-backend-bridge.js", "utf8");
  assert.match(bridge, /data-support-action/);
  assert.match(bridge, /\/support\/new\?kind=feedback/);
  assert.match(bridge, /\/support\/new\?kind=ticket/);
  assert.match(bridge, /\/support/);
});
