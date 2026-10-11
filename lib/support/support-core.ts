import { z } from "zod";

export const supportRequestSchema = z.object({
  kind: z.enum(["ticket", "feedback"]),
  category: z.enum(["account", "billing", "studio", "clients", "technical", "other"]),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(15).max(4000),
}).strict();

export type SupportKind = z.infer<typeof supportRequestSchema>["kind"];

export function isSupportAdmin(userId: string | null | undefined, ids = process.env.ROVEI_SUPPORT_ADMIN_USER_IDS) {
  if (!userId || !ids) return false;
  return ids.split(",").some(id => id.trim() === userId);
}
