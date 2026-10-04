"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/form-controls";

import type {
  SignupCredentials,
} from "@/lib/auth/signup";

import {
  FIRST_NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  isValidEmail,
  isValidFirstName,
  isValidPassword,
} from "@/lib/signup-validation";

type SignupFormProps = {
  onValidSubmit: (
    credentials:
      SignupCredentials,
  ) => Promise<{
    needsEmailConfirmation:
      boolean;
  }>;
};

type FieldName =
  | "firstName"
  | "email"
  | "password"
  | "terms";

type TouchedState =
  Record<
    FieldName,
    boolean
  >;

const untouched:
  TouchedState = {
    firstName: false,
    email: false,
    password: false,
    terms: false,
  };

export function SignupForm({
  onValidSubmit,
}: SignupFormProps) {
  const [
    firstName,
    setFirstName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    termsAccepted,
    setTermsAccepted,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    touched,
    setTouched,
  ] =
    useState<TouchedState>(
      untouched,
    );

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const [
    confirmationEmail,
    setConfirmationEmail,
  ] = useState("");

  const firstNameValid =
    isValidFirstName(
      firstName,
    );

  const emailValid =
    isValidEmail(email);

  const passwordValid =
    isValidPassword(
      password,
    );

  const formValid =
    firstNameValid &&
    emailValid &&
    passwordValid &&
    termsAccepted;

  const shouldShowError = (
    field:
      FieldName,
  ) =>
    submitted ||
    touched[field];

  function markTouched(
    field:
      FieldName,
  ) {
    setTouched(
      (current) => ({
        ...current,
        [field]: true,
      }),
    );
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitted(true);

    setTouched({
      firstName: true,
      email: true,
      password: true,
      terms: true,
    });

    setSubmitError("");

    if (
      !formValid ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const result =
        await onValidSubmit({
          firstName:
            firstName.trim(),

          email:
            email.trim(),

          password,
        });

      if (
        result.needsEmailConfirmation
      ) {
        setConfirmationEmail(
          email.trim(),
        );
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Rovei couldn’t create your account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmationEmail) {
    return (
      <div className="mt-9 rounded-[2rem] border border-[var(--border-soft)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-7">
        <p className="eyebrow">
          Confirm your email
        </p>

        <h2 className="section-title mt-3">
          Check your inbox.
        </h2>

        <p className="body-text mt-3">
          We sent a confirmation link to{" "}
          <strong className="text-[var(--text-primary)]">
            {confirmationEmail}
          </strong>
          .
        </p>

        <p className="caption mt-3">
          Open the confirmation link in this browser and Rovei will continue with the Studio you designed.
        </p>
      </div>
    );
  }

  return (
    <form
      className="mt-9 space-y-5"
      noValidate
      onSubmit={
        handleSubmit
      }
    >
      <div>
        <label
          htmlFor="signup-first-name"
          className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
        >
          First name
        </label>

        <Input
          id="signup-first-name"
          name="firstName"
          value={firstName}
          onChange={(
            event,
          ) =>
            setFirstName(
              event.target.value,
            )
          }
          onBlur={() =>
            markTouched(
              "firstName",
            )
          }
          placeholder="Mia"
          autoComplete="given-name"
          maxLength={
            FIRST_NAME_MAX_LENGTH
          }
          aria-invalid={
            shouldShowError(
              "firstName",
            ) &&
            !firstNameValid
              ? true
              : undefined
          }
          aria-describedby={
            shouldShowError(
              "firstName",
            ) &&
            !firstNameValid
              ? "signup-first-name-error"
              : undefined
          }
        />

        {shouldShowError(
          "firstName",
        ) &&
          !firstNameValid && (
            <p
              id="signup-first-name-error"
              className="mt-2 text-xs font-medium text-[var(--wine)]"
            >
              Enter at least 2 characters.
            </p>
          )}
      </div>

      <div>
        <label
          htmlFor="signup-email"
          className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
        >
          Email
        </label>

        <Input
          id="signup-email"
          name="email"
          type="email"
          inputMode="email"
          value={email}
          onChange={(
            event,
          ) =>
            setEmail(
              event.target.value,
            )
          }
          onBlur={() =>
            markTouched(
              "email",
            )
          }
          placeholder="mia@lashandco.com"
          autoComplete="email"
          aria-invalid={
            shouldShowError(
              "email",
            ) &&
            !emailValid
              ? true
              : undefined
          }
          aria-describedby={
            shouldShowError(
              "email",
            ) &&
            !emailValid
              ? "signup-email-error"
              : undefined
          }
        />

        {shouldShowError(
          "email",
        ) &&
          !emailValid && (
            <p
              id="signup-email-error"
              className="mt-2 text-xs font-medium text-[var(--wine)]"
            >
              Enter a valid email address.
            </p>
          )}
      </div>

      <div>
        <label
          htmlFor="signup-password"
          className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
        >
          Password
        </label>

        <div className="relative">
          <Input
            id="signup-password"
            name="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(
              event,
            ) =>
              setPassword(
                event.target.value,
              )
            }
            onBlur={() =>
              markTouched(
                "password",
              )
            }
            autoComplete="new-password"
            className="pr-20"
            aria-invalid={
              shouldShowError(
                "password",
              ) &&
              !passwordValid
                ? true
                : undefined
            }
            aria-describedby={
              shouldShowError(
                "password",
              ) &&
              !passwordValid
                ? "signup-password-error"
                : "signup-password-help"
            }
          />

          <button
            type="button"
            className="focus-ring absolute right-2 top-1/2 inline-flex h-9 -translate-y-1/2 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-[var(--wine)] transition hover:bg-[var(--wine-soft)]"
            onClick={() =>
              setShowPassword(
                (value) =>
                  !value,
              )
            }
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={
              showPassword
            }
          >
            {showPassword ? (
              <EyeOff
                size={15}
                aria-hidden="true"
              />
            ) : (
              <Eye
                size={15}
                aria-hidden="true"
              />
            )}

            <span>
              {showPassword
                ? "Hide"
                : "Show"}
            </span>
          </button>
        </div>

        {shouldShowError(
          "password",
        ) &&
        !passwordValid ? (
          <p
            id="signup-password-error"
            className="mt-2 text-xs font-medium text-[var(--wine)]"
          >
            Use at least{" "}
            {PASSWORD_MIN_LENGTH}{" "}
            characters.
          </p>
        ) : (
          <p
            id="signup-password-help"
            className="mt-2 text-xs text-[var(--text-secondary)]"
          >
            At least{" "}
            {PASSWORD_MIN_LENGTH}{" "}
            characters.
          </p>
        )}
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3.5 text-sm leading-6 text-[var(--text-primary)]">
          <input
            type="checkbox"
            checked={
              termsAccepted
            }
            onChange={(
              event:
                ChangeEvent<HTMLInputElement>,
            ) => {
              setTermsAccepted(
                event.target
                  .checked,
              );

              markTouched(
                "terms",
              );
            }}
            className="mt-1 size-4 shrink-0 accent-[var(--wine)]"
            aria-invalid={
              shouldShowError(
                "terms",
              ) &&
              !termsAccepted
                ? true
                : undefined
            }
            aria-describedby={
              shouldShowError(
                "terms",
              ) &&
              !termsAccepted
                ? "signup-terms-error"
                : undefined
            }
          />

          <span>
            I agree to the{" "}
            <span className="font-semibold text-[var(--wine)]">
              Terms
            </span>{" "}
            and{" "}
            <span className="font-semibold text-[var(--wine)]">
              Privacy Policy
            </span>
            .
          </span>
        </label>

        {shouldShowError(
          "terms",
        ) &&
          !termsAccepted && (
            <p
              id="signup-terms-error"
              className="mt-2 text-xs font-medium text-[var(--wine)]"
            >
              Please confirm before continuing.
            </p>
          )}
      </div>

      {submitError && (
        <p
          role="alert"
          className="rounded-2xl bg-[var(--wine-soft)] px-4 py-3 text-sm font-semibold text-[var(--wine)]"
        >
          {submitError}
        </p>
      )}

      <Button
        type="submit"
        disabled={
          !formValid ||
          submitting
        }
        className="w-full disabled:cursor-not-allowed disabled:opacity-45"
      >
        <span>
          {submitting
            ? "Creating account…"
            : "Create account & continue"}
        </span>

        {!submitting && (
          <ArrowRight
            size={17}
            aria-hidden="true"
          />
        )}
      </Button>

      <div className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3.5 text-sm leading-6 text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">
          No payment yet.
        </span>{" "}
        You’ll review your Rovei plan before your studio goes live.
      </div>
    </form>
  );
}
