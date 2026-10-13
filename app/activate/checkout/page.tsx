import { CheckoutExperience } from "@/components/activation/checkout-experience";
import {
  getPaddleClientToken,
  getPaddleConfigurationIssue,
} from "@/lib/billing/paddle-core";
import { getBillingCadence } from "@/lib/pricing";

type CheckoutPageProps = {
  searchParams: Promise<{ billing?: string | string[] }>;
};

export default async function Page({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const rawBilling = Array.isArray(params.billing) ? params.billing[0] : params.billing;

  return (
    <CheckoutExperience
      initialBilling={getBillingCadence(rawBilling)}
      clientToken={getPaddleClientToken()}
      configurationIssue={getPaddleConfigurationIssue()}
    />
  );
}
