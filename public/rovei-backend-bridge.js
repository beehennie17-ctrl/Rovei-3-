(() => {
  "use strict";

  const STORAGE_KEY = "rovei:full-process-preview-v3";

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeState(state) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state),
      );
      return true;
    } catch {
      return false;
    }
  }

  function getTimezone() {
    try {
      return (
        Intl.DateTimeFormat()
          .resolvedOptions()
          .timeZone || "UTC"
      );
    } catch {
      return "UTC";
    }
  }

  function studioPayload(state) {
    const studio = state?.studio || {};

    return {
      studioName: studio.name || "",
      services: Array.isArray(studio.services)
        ? studio.services
        : [],
      theme: studio.theme || "wine",
      customPrimary:
        studio.customPrimary || "#941651",
      experienceSelections:
        Array.isArray(studio.modules)
          ? studio.modules
          : [],
      timezone: getTimezone(),
    };
  }

  function elements() {
    return {
      validation:
        document.getElementById("signupValidation"),
      first:
        document.getElementById("firstName"),
      email:
        document.getElementById("email"),
      password:
        document.getElementById("password"),
      terms:
        document.getElementById("terms"),
      consent:
        document.getElementById("consentBox"),
      submit:
        document.getElementById("signupSubmit"),
    };
  }

  function clearValidation() {
    const els = elements();

    els.validation?.classList.remove("show");

    if (els.validation) {
      els.validation.textContent = "";
    }

    els.first?.classList.remove("invalid");
    els.email?.classList.remove("invalid");
    els.password?.classList.remove("invalid");
    els.consent?.classList.remove("invalid");
  }

  function showValidation(message, target) {
    const els = elements();

    if (els.validation) {
      els.validation.textContent = message;
      els.validation.classList.add("show");
    }

    if (target === "first") {
      els.first?.classList.add("invalid");
      els.first?.focus();
    }

    if (target === "email") {
      els.email?.classList.add("invalid");
      els.email?.focus();
    }

    if (target === "password") {
      els.password?.classList.add("invalid");
      els.password?.focus();
    }

    if (target === "terms") {
      els.consent?.classList.add("invalid");
      els.terms?.focus();
    }
  }

  function setBusy(busy) {
    const button =
      document.getElementById("signupSubmit");

    if (!button) return;

    button.disabled = busy;

    if (busy) {
      button.setAttribute("aria-busy", "true");
    } else {
      button.removeAttribute("aria-busy");
    }
  }

  async function bootstrapStudio(state) {
    const response = await fetch(
      "/api/studio/bootstrap",
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          studioPayload(state),
        ),
      },
    );

    let payload = {};

    try {
      payload = await response.json();
    } catch {}

    if (!response.ok) {
      throw new Error(
        payload.message ||
          "Your Rovei Studio could not be saved.",
      );
    }

    return payload;
  }

  function continueToActivation(state) {
    state.screen = "activation";

    if (state.signupDraft) {
      state.signupDraft.password = "";
    }

    writeState(state);
    window.location.replace("/");
  }

  async function handleSignup() {
    const els = elements();

    if (
      !els.first ||
      !els.email ||
      !els.password ||
      !els.terms
    ) {
      return;
    }

    clearValidation();

    const firstName = els.first.value.trim();
    const email = els.email.value.trim();
    const password = els.password.value;

    if (!els.terms.checked) {
      showValidation(
        "Please agree to the Terms & Conditions and Privacy Policy to continue.",
        "terms",
      );
      return;
    }

    if (!firstName) {
      showValidation(
        "Please enter your first name.",
        "first",
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      showValidation(
        "Please enter a valid email address.",
        "email",
      );
      return;
    }

    if (password.length < 8) {
      showValidation(
        "Your password must be at least 8 characters.",
        "password",
      );
      return;
    }

    const state = readState();

    if (!state?.studio) {
      showValidation(
        "Your Studio setup could not be read. Please return to preview and try again.",
      );
      return;
    }

    state.account = {
      ...(state.account || {}),
      firstName,
      email,
      terms: true,
    };

    writeState(state);
    setBusy(true);

    try {
      const signupResponse = await fetch(
        "/api/auth/signup",
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            email,
            password,
          }),
        },
      );

      let signupPayload = {};

      try {
        signupPayload =
          await signupResponse.json();
      } catch {}

      if (!signupResponse.ok) {
        throw new Error(
          signupPayload.message ||
            "Your Rovei account could not be created.",
        );
      }

      if (
        signupPayload.requiresEmailConfirmation
      ) {
        showValidation(
          "Check your email to confirm your Rovei account. Your Studio setup is saved in this browser and will continue after confirmation.",
        );

        setBusy(false);
        return;
      }

      await bootstrapStudio(state);
      continueToActivation(state);
    } catch (error) {
      showValidation(
        error instanceof Error
          ? error.message
          : "Your Rovei account could not be created.",
      );

      setBusy(false);
    }
  }

  async function finishConfirmedSignup() {
    const params =
      new URLSearchParams(window.location.search);

    if (
      params.get("rovei") !==
      "complete-signup"
    ) {
      return;
    }

    const state = readState();

    if (!state?.studio) {
      history.replaceState({}, "", "/");
      return;
    }

    try {
      await bootstrapStudio(state);
      continueToActivation(state);
    } catch (error) {
      history.replaceState({}, "", "/");

      showValidation(
        error instanceof Error
          ? error.message
          : "Your Studio could not be saved after email confirmation.",
      );
    }
  }

  document.addEventListener(
    "click",
    (event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest(
              "#signupSubmit",
            )
          : null;

      if (!target) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      void handleSignup();
    },
    true,
  );

  document.addEventListener(
    "submit",
    (event) => {
      const form =
        event.target instanceof HTMLFormElement
          ? event.target
          : null;

      if (
        !form ||
        form.id !== "signupForm"
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      void handleSignup();
    },
    true,
  );

  void finishConfirmedSignup();
})();
