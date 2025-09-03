import { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Terms of Service - Hector Analytics",
  description:
    "Terms of Service for Hector Analytics - Privacy-first web analytics platform",
};

export default function TermsOfServicePage() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: sept 3, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By using Hector Analytics, you accept and agree to be bound by
              these terms of service. The service is operated by Quentin
              Bassalair, sole proprietor, SIRET: 843 309 725 00037.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Service Description
            </h2>
            <p>
              Hector Analytics is a privacy-first web analytics service that
              doesn&apos;t use cookies and is fully GDPR compliant. We help you
              understand your website traffic while respecting visitor privacy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Account Registration
            </h2>
            <p>
              Registration requires a valid email address. You&apos;re
              responsible for maintaining the confidentiality of your account
              credentials and all activity under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. Pricing and Payment
            </h2>
            <ul className="list-disc pl-6">
              <li>
                <strong>Free plan:</strong> Available without commitment
              </li>
              <li>
                <strong>Paid plans:</strong> Billed monthly or annually
              </li>
              <li>
                <strong>Payment:</strong> Via Stripe (credit cards)
              </li>
              <li>
                <strong>Cancellation:</strong> Possible at any time, effective
                at end of billing period
              </li>
              <li>
                <strong>Refunds:</strong> No refunds are provided
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6">
              <li>Comply with all applicable laws</li>
              <li>Not use the service for illegal purposes</li>
              <li>Not attempt to harm the service or other users</li>
              <li>Not resell the service without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data and Privacy</h2>
            <p>
              Your data is processed according to our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              . Analytics data is retained for a maximum of 5 years and can be
              deleted upon request to{" "}
              <a
                href="mailto:bassalair.quentin@gmail.com"
                className="text-primary hover:underline"
              >
                bassalair.quentin@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Liability</h2>
            <p>
              The service is provided &quot;as is&quot;. We don&apos;t guarantee
              continuous availability and disclaim liability for indirect
              damages. Our liability is limited to the amount paid in the last
              12 months.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
            <p>
              We may suspend or terminate your account for violation of these
              terms. You can terminate your account at any time from your
              settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Modifications</h2>
            <p>
              We reserve the right to modify these terms. Significant changes
              will be notified by email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
            <p>
              These terms are governed by French law. Any disputes will be
              subject to the jurisdiction of French courts.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <div className="p-4 bg-muted rounded-lg">
              <p>
                <strong>Quentin Bassalair</strong>
              </p>
              <p>33 Avenue de la Redoute, 92600 Asnières-sur-Seine, France</p>
              <p>SIRET: 843 309 725 00037</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:bassalair.quentin@gmail.com"
                  className="text-primary hover:underline"
                >
                  bassalair.quentin@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
