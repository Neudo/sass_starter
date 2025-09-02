import { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Privacy Policy - Hector Analytics",
  description:
    "How Hector Analytics protects your data and respects your privacy",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-8">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <div className="mb-8 p-6 bg-primary/10 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Our Commitment</h2>
            <p className="mb-0">
              Hector Analytics is built for privacy. We don&apos;t use cookies,
              don&apos;t collect personal data from your website visitors, and
              don&apos;t sell any data to third parties.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Data Controller</h2>
            <div className="p-4 bg-muted rounded-lg">
              <p>
                <strong>Quentin Bassalair</strong>
              </p>
              <p>Sole Proprietor</p>
              <p>33 Avenue de la Redoute, 92600 Asnières-sur-Seine, France</p>
              <p>
                Email:{" "}
                <Link
                  href="mailto:bassalair.quentin@gmail.com"
                  className="text-primary hover:underline"
                >
                  bassalair.quentin@gmail.com
                </Link>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>

            <h3 className="text-xl font-semibold mb-2">
              For Service Users (You)
            </h3>
            <ul className="list-disc pl-6">
              <li>Email and password (for your account)</li>
              <li>
                Payment information (via Stripe, we don&apos;t store card
                details)
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">
              For Your Website Visitors
            </h3>
            <p>
              We only collect <strong>anonymous</strong> data:
            </p>
            <ul className="list-disc pl-6">
              <li>Pages visited</li>
              <li>Browser and operating system</li>
              <li>Country, region, city (without storing IP addresses)</li>
              <li>Traffic source</li>
            </ul>
            <p className="mt-4">
              <strong>We DO NOT collect:</strong> names, emails, IP addresses,
              cookies, or any personally identifiable information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Data</h2>
            <p>Your data is used to:</p>
            <ul className="list-disc pl-6">
              <li>Provide analytics services</li>
              <li>Manage your account and billing</li>
              <li>Contact you for support</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
            <ul className="list-disc pl-6">
              <li>
                <strong>Analytics data:</strong> Maximum 5 years
              </li>
              <li>
                <strong>Account data:</strong> As long as your account is active
              </li>
              <li>
                <strong>Deletion:</strong> Upon request via email, no
                justification required
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              5. Location and Security
            </h2>
            <ul className="list-disc pl-6">
              <li>All data stored in France (EU)</li>
              <li>No transfers outside the EU</li>
              <li>SSL/TLS encryption for all connections</li>
              <li>Encrypted database</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              6. Third-Party Services
            </h2>
            <ul className="list-disc pl-6">
              <li>
                <strong>Supabase:</strong> Database (France/EU)
              </li>
              <li>
                <strong>Stripe:</strong> Payments (we don&apos;t store cards)
              </li>
              <li>
                <strong>Resend:</strong> Transactional emails
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              7. Your Rights (GDPR)
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6">
              <li>Access your data</li>
              <li>Rectify or delete it</li>
              <li>Object to processing</li>
              <li>Export your data</li>
            </ul>
            <p className="mt-4">
              To exercise these rights:{" "}
              <Link
                href="mailto:bassalair.quentin@gmail.com"
                className="text-primary hover:underline"
              >
                bassalair.quentin@gmail.com
              </Link>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
            <p>
              <strong>No tracking cookies.</strong> Only essential technical
              cookies are used for logged-in user authentication.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Complaints</h2>
            <p>
              For privacy concerns, you can contact the French data protection
              authority:
            </p>
            <div className="p-4 bg-muted rounded-lg mt-4">
              <p>
                <strong>CNIL</strong>
              </p>
              <p>3 Place de Fontenoy, 75334 Paris Cedex 07, France</p>
              <p>
                <Link
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.cnil.fr
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
