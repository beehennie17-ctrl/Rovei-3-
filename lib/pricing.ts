export type BillingCadence = "monthly" | "annual";

export type PricingOption = {
  cadence: BillingCadence;
  label: string;
  price: number;
  currency: "USD";
  billingLabel: "month" | "year";
  billedCopy: string;
  savings?: number;
  equivalentMonthly?: number;
};

const monthlyPrice = 129;
const annualPrice = 1290;

export const monthlyAnnualTotal = monthlyPrice * 12;
export const annualSavings = monthlyAnnualTotal - annualPrice;
export const annualEquivalentMonthly = annualPrice / 12;

export const pricing: Record<BillingCadence, PricingOption> = {
  monthly: {
    cadence: "monthly",
    label: "Monthly",
    price: monthlyPrice,
    currency: "USD",
    billingLabel: "month",
    billedCopy: "Billed monthly.",
  },
  annual: {
    cadence: "annual",
    label: "Annual",
    price: annualPrice,
    currency: "USD",
    billingLabel: "year",
    billedCopy: "Billed annually.",
    savings: annualSavings,
    equivalentMonthly: annualEquivalentMonthly,
  },
};

export function isBillingCadence(value: unknown): value is BillingCadence {
  return value === "monthly" || value === "annual";
}

export function getBillingCadence(value: unknown): BillingCadence {
  return isBillingCadence(value) ? value : "monthly";
}

export function formatUsd(amount: number): string {
  const hasCents = !Number.isInteger(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount);
}
