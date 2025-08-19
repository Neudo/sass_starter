import { PricingSection } from "@/components/pricing-section";

export default function BillingPlansPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Select the plan that best fits your analytics needs
        </p>
      </div>
      
      <PricingSection 
        showFullPage={true} 
        showUpgradeButtons={true}
      />
    </div>
  );
}