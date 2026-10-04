import {
  z,
} from "zod";

export const clientLinkIssueSchema =
  z.object({
    appointmentId:
      z.string().uuid(),
  }).strict();

export const finishPreferenceSchema =
  z.enum([
    "natural",
    "soft",
    "defined",
    "glam",
    "not-sure",
  ]);

export const appointmentFeelSchema =
  z.enum([
    "quiet",
    "chatty",
    "no-preference",
  ]);

export const consultationAnswerSchema =
  z.object({
    goal:
      z.string()
        .max(500),
  }).strict();

export const preferencesAnswerSchema =
  z.object({
    finish:
      finishPreferenceSchema
        .optional(),

    appointmentFeel:
      appointmentFeelSchema
        .optional(),
  })
    .strict()
    .refine(
      (value) =>
        value.finish !==
          undefined ||
        value.appointmentFeel !==
          undefined,

      "Choose at least one preference.",
    );

function photoAnswerSchema(
  maxFiles: number,
) {
  return z.object({
    skipped:
      z.boolean(),

    photoIds:
      z.array(
        z.string()
          .min(8)
          .max(128)
          .regex(
            /^[A-Za-z0-9_-]+$/,
          ),
      )
        .max(maxFiles),
  })
    .strict()
    .refine(
      (value) =>
        !(
          value.skipped &&
          value.photoIds.length >
            0
        ),

      "Skipped photo steps cannot contain photos.",
    );
}

export const acknowledgementAnswerSchema =
  z.object({
    acknowledged:
      z.boolean(),
  }).strict();

export const clientExperienceProgressSchema =
  z.object({
    currentStep:
      z.number()
        .int()
        .min(-1)
        .max(20),

    consultation:
      consultationAnswerSchema
        .optional(),

    preferences:
      preferencesAnswerSchema
        .optional(),

    inspiration:
      photoAnswerSchema(3)
        .optional(),

    currentPhotos:
      photoAnswerSchema(2)
        .optional(),

    consent:
      acknowledgementAnswerSchema
        .optional(),

    prep:
      acknowledgementAnswerSchema
        .optional(),
  }).strict();

export type ClientExperienceProgressInput =
  z.infer<
    typeof clientExperienceProgressSchema
  >;
