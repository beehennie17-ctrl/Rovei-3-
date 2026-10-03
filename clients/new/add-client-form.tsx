"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-controls";
import {
  CLIENT_NAME_MAX_LENGTH,
  isValidClientNamePart,
  isValidDateOnly,
  isValidNewClientDraft,
  isValidTimeOnly,
} from "@/lib/client-creation";
import { SERVICE_CATEGORIES, isServiceCategoryId } from "@/lib/service-categories";
import type { NewClientDraft } from "@/types/client-creation";
import type { ServiceCategoryId } from "@/types/onboarding";

type AddClientFormProps = {
  initialDraft: NewClientDraft | null;
  onDraftChange: (draft: {
    firstName: string;
    lastName: string;
    service: ServiceCategoryId | "";
    appointmentDate: string;
    appointmentTime: string;
  }) => void;
  onValidSubmit: (draft: NewClientDraft) => void;
};

type FieldName = "firstName" | "lastName" | "service" | "appointmentDate" | "appointmentTime";
type TouchedState = Record<FieldName, boolean>;

const untouched: TouchedState = {
  firstName: false,
  lastName: false,
  service: false,
  appointmentDate: false,
  appointmentTime: false,
};

export function AddClientForm({ initialDraft, onDraftChange, onValidSubmit }: AddClientFormProps) {
  const [firstName, setFirstName] = useState(initialDraft?.firstName ?? "");
  const [lastName, setLastName] = useState(initialDraft?.lastName ?? "");
  const [service, setService] = useState<ServiceCategoryId | "">(initialDraft?.service ?? "");
  const [appointmentDate, setAppointmentDate] = useState(initialDraft?.appointmentDate ?? "");
  const [appointmentTime, setAppointmentTime] = useState(initialDraft?.appointmentTime ?? "");
  const [touched, setTouched] = useState<TouchedState>(untouched);
  const [submitted, setSubmitted] = useState(false);

  const firstNameValid = isValidClientNamePart(firstName);
  const lastNameValid = isValidClientNamePart(lastName);
  const serviceValid = isServiceCategoryId(service);
  const dateValid = isValidDateOnly(appointmentDate);
  const timeValid = isValidTimeOnly(appointmentTime);
  const formValid = firstNameValid && lastNameValid && serviceValid && dateValid && timeValid;

  const shouldShowError = (field: FieldName) => submitted || touched[field];
  const notify = (next: Partial<{ firstName: string; lastName: string; service: ServiceCategoryId | ""; appointmentDate: string; appointmentTime: string }>) => {
    onDraftChange({ firstName, lastName, service, appointmentDate, appointmentTime, ...next });
  };

  function markTouched(field: FieldName) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setTouched({ firstName: true, lastName: true, service: true, appointmentDate: true, appointmentTime: true });

    const draft = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      service,
      appointmentDate,
      appointmentTime,
    };

    if (!formValid || !isValidNewClientDraft(draft)) return;
    onValidSubmit(draft);
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="new-client-first-name" className="mb-2 block text-sm font-semibold">First name</label>
          <Input
            id="new-client-first-name"
            name="firstName"
            value={firstName}
            onChange={(event) => { setFirstName(event.target.value); notify({ firstName: event.target.value }); }}
            onBlur={() => markTouched("firstName")}
            placeholder="Emily"
            autoComplete="given-name"
            maxLength={CLIENT_NAME_MAX_LENGTH}
            aria-invalid={shouldShowError("firstName") && !firstNameValid ? true : undefined}
            aria-describedby={shouldShowError("firstName") && !firstNameValid ? "new-client-first-name-error" : undefined}
          />
          {shouldShowError("firstName") && !firstNameValid && <p id="new-client-first-name-error" className="mt-2 text-xs font-medium text-[var(--wine)]">Enter 2–50 characters.</p>}
        </div>

        <div>
          <label htmlFor="new-client-last-name" className="mb-2 block text-sm font-semibold">Last name</label>
          <Input
            id="new-client-last-name"
            name="lastName"
            value={lastName}
            onChange={(event) => { setLastName(event.target.value); notify({ lastName: event.target.value }); }}
            onBlur={() => markTouched("lastName")}
            placeholder="Carter"
            autoComplete="family-name"
            maxLength={CLIENT_NAME_MAX_LENGTH}
            aria-invalid={shouldShowError("lastName") && !lastNameValid ? true : undefined}
            aria-describedby={shouldShowError("lastName") && !lastNameValid ? "new-client-last-name-error" : undefined}
          />
          {shouldShowError("lastName") && !lastNameValid && <p id="new-client-last-name-error" className="mt-2 text-xs font-medium text-[var(--wine)]">Enter 2–50 characters.</p>}
        </div>
      </div>

      <div>
        <label htmlFor="new-client-service" className="mb-2 block text-sm font-semibold">Service</label>
        <Select
          id="new-client-service"
          name="service"
          value={service}
          onChange={(event) => {
            const next = isServiceCategoryId(event.target.value) ? event.target.value : "";
            setService(next);
            notify({ service: next });
          }}
          onBlur={() => markTouched("service")}
          aria-invalid={shouldShowError("service") && !serviceValid ? true : undefined}
          aria-describedby={shouldShowError("service") && !serviceValid ? "new-client-service-error" : undefined}
        >
          <option value="">Choose a service</option>
          {SERVICE_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </Select>
        {shouldShowError("service") && !serviceValid && <p id="new-client-service-error" className="mt-2 text-xs font-medium text-[var(--wine)]">Choose a service.</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="new-client-date" className="mb-2 block text-sm font-semibold">Appointment date</label>
          <Input
            id="new-client-date"
            name="appointmentDate"
            type="date"
            value={appointmentDate}
            onChange={(event) => { setAppointmentDate(event.target.value); notify({ appointmentDate: event.target.value }); }}
            onBlur={() => markTouched("appointmentDate")}
            aria-invalid={shouldShowError("appointmentDate") && !dateValid ? true : undefined}
            aria-describedby={shouldShowError("appointmentDate") && !dateValid ? "new-client-date-error" : undefined}
          />
          {shouldShowError("appointmentDate") && !dateValid && <p id="new-client-date-error" className="mt-2 text-xs font-medium text-[var(--wine)]">Choose an appointment date.</p>}
        </div>

        <div>
          <label htmlFor="new-client-time" className="mb-2 block text-sm font-semibold">Appointment time</label>
          <Input
            id="new-client-time"
            name="appointmentTime"
            type="time"
            value={appointmentTime}
            onChange={(event) => { setAppointmentTime(event.target.value); notify({ appointmentTime: event.target.value }); }}
            onBlur={() => markTouched("appointmentTime")}
            aria-invalid={shouldShowError("appointmentTime") && !timeValid ? true : undefined}
            aria-describedby={shouldShowError("appointmentTime") && !timeValid ? "new-client-time-error" : undefined}
          />
          {shouldShowError("appointmentTime") && !timeValid && <p id="new-client-time-error" className="mt-2 text-xs font-medium text-[var(--wine)]">Choose an appointment time.</p>}
        </div>
      </div>

      <Button type="submit" disabled={!formValid} className="w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-45">
        <span>Create client experience</span>
        <ArrowRight size={17} aria-hidden="true" />
      </Button>
    </form>
  );
}
