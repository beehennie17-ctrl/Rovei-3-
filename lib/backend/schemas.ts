import { z } from "zod";

export const serviceCategorySchema = z.enum([
  "lashes",
  "brows",
  "nails",
  "makeup",
  "facials",
  "other",
]);

export const experienceModuleSchema = z.enum([
  "consultation",
  "preferences",
  "inspiration",
  "consent",
  "prep",
  "current-photos",
]);

export const themeSchema = z.enum([
  "blush",
  "noir",
  "pearl",
  "wine",
  "mocha",
  "sage",
  "lilac",
  "custom",
]);

export const timezoneSchema = z
  .string()
  .min(1)
  .max(100)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("en", {
        timeZone: value,
      }).format();

      return true;
    } catch {
      return false;
    }
  }, "Invalid IANA timezone.");

export const studioSettingsSchema = z.object({
  studioName: z
    .string()
    .trim()
    .min(2)
    .max(60),

  services: z
    .array(serviceCategorySchema)
    .min(1)
    .max(6)
    .refine((values) => new Set(values).size === values.length),

  theme: themeSchema,

  customPrimary: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/),

  experienceSelections: z
    .array(experienceModuleSchema)
    .min(1)
    .max(6)
    .refine((values) => new Set(values).size === values.length),

  timezone:
    timezoneSchema.default("UTC"),
});

export const beautyPackInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(60),

  service:
    serviceCategorySchema,

  modules: z
    .array(experienceModuleSchema)
    .min(1),
});

export const newClientInputSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2)
    .max(50),

  lastName: z
    .string()
    .trim()
    .min(2)
    .max(50),

  service:
    serviceCategorySchema,

  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/),

  appointmentTime: z
    .string()
    .regex(
      /^(?:[01]\d|2[0-3]):[0-5]\d$/,
    ),
});

export const appointmentStatusSchema = z.object({
  status: z.enum([
    "scheduled",
    "cancelled",
  ]),
});
