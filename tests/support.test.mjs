import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { isSupportAdmin, supportRequestSchema } from "../lib/support/support-core.ts";

const payload = { kind: "ticket", category: "account", subject: "Login problem", message: "I am unable to open my account after confirming my email." };

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

test("bridge wires the three original Support buttons without modifying locked HTML", () => {
  const bridge = readFileSync("public/rovei-backend-bridge.js", "utf8");
  assert.match(bridge, /data-support-action/);
  assert.match(bridge, /\/support\/new\?kind=feedback/);
  assert.match(bridge, /\/support\/new\?kind=ticket/);
  assert.match(bridge, /\/support/);
});
