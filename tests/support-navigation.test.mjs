import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getSupportReturnLink,
  shouldRestoreSupportSettings,
} from "../lib/support/navigation.ts";

test("support return labels match actual access", () => {
  assert.deepEqual(getSupportReturnLink(false, false), {
    href: "/",
    label: "Back to Rovei →",
  });

  assert.deepEqual(getSupportReturnLink(true, false), {
    href: "/?rovei=activation",
    label: "Back to activation →",
  });

  assert.deepEqual(getSupportReturnLink(true, true), {
    href: "/?rovei=app&fromSupport=settings",
    label: "Back to Settings →",
  });
});

test("support return cannot restore Settings without dashboard access", () => {
  assert.equal(shouldRestoreSupportSettings("app", "settings"), true);
  assert.equal(shouldRestoreSupportSettings("activation", "settings"), false);
  assert.equal(shouldRestoreSupportSettings("landing", "settings"), false);
  assert.equal(shouldRestoreSupportSettings("app", "invalid"), false);
});
