import type { ServiceCategoryId } from "@/types/onboarding";

export type ServiceCategoryIcon =
  | "lashes"
  | "brows"
  | "nails"
  | "makeup"
  | "facials"
  | "other";

export type ServiceCategory = {
  id: ServiceCategoryId;
  name: string;
  description: string;
  examples: string[];
  icon: ServiceCategoryIcon;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "lashes",
    name: "Lashes",
    description: "Extensions, fills & lifts",
    examples: ["Extensions", "Fills", "Lifts"],
    icon: "lashes",
  },
  {
    id: "brows",
    name: "Brows",
    description: "Lamination, tint & shaping",
    examples: ["Lamination", "Tint", "Shaping"],
    icon: "brows",
  },
  {
    id: "nails",
    name: "Nails",
    description: "Manicures, gel & extensions",
    examples: ["Manicures", "Gel", "Extensions"],
    icon: "nails",
  },
  {
    id: "makeup",
    name: "Makeup",
    description: "Soft glam, full glam & occasion",
    examples: ["Soft glam", "Full glam", "Occasion"],
    icon: "makeup",
  },
  {
    id: "facials",
    name: "Facials",
    description: "Skin treatments & consultations",
    examples: ["Skin treatments", "Consultations"],
    icon: "facials",
  },
  {
    id: "other",
    name: "Other",
    description: "Something else? Rovei can still fit your studio.",
    examples: ["Other beauty services"],
    icon: "other",
  },
];

const SERVICE_CATEGORY_IDS = new Set<ServiceCategoryId>(SERVICE_CATEGORIES.map((category) => category.id));

export function isServiceCategoryId(value: unknown): value is ServiceCategoryId {
  return typeof value === "string" && SERVICE_CATEGORY_IDS.has(value as ServiceCategoryId);
}

export function getServiceCategory(id: ServiceCategoryId) {
  return SERVICE_CATEGORIES.find((category) => category.id === id);
}
