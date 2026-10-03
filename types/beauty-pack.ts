import type { ExperienceModuleId, ServiceCategoryId } from "@/types/onboarding";

export type BeautyPack = {
  id: string;
  name: string;
  service: ServiceCategoryId;
  modules: ExperienceModuleId[];
  createdAt: string;
  updatedAt: string;
};

export type BeautyPackPrototypeStore = {
  packs: BeautyPack[];
  updatedAt: string;
};

export type BeautyPackInput = {
  name: string;
  service: ServiceCategoryId;
  modules: ExperienceModuleId[];
};
