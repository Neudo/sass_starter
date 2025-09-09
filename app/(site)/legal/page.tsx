import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal Notice - Hector Analytics",
  description: "Legal information about Hector Analytics",
};

export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Legal Notice</h1>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Publisher</h2>
          <div className="p-4 bg-muted rounded-lg">
            <p>
              <strong>Sole Proprietor:</strong> Quentin Bassalair
            </p>
            <p>
              <strong>Address:</strong> 33 Avenue de la Redoute, 92600
              Asnières-sur-Seine, France
            </p>
            <p>
              <strong>SIRET:</strong> 843 309 725 00037
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <Link
                href="mailto:bassalair.quentin@gmail.com"
                className="text-primary hover:underline"
              >
                bassalair.quentin@gmail.com
              </Link>
            </p>
            <p>
              <strong>Phone:</strong> Available upon email request
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Hosting</h2>
          <div className="p-4 bg-muted rounded-lg">
            <p>
              <strong>Host:</strong> Vercel Inc.
            </p>
            <p>
              <strong>Address:</strong> 340 S Lemon Ave #4133, Walnut, CA 91789,
              USA
            </p>
            <p>
              <strong>Website:</strong>{" "}
              <Link
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                vercel.com
              </Link>
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg mt-4">
            <p>
              <strong>Database:</strong> Supabase
            </p>
            <p>
              <strong>Data Location:</strong> France (EU region)
            </p>
            <p>
              <strong>Website:</strong>{" "}
              <Link
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                supabase.com
              </Link>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <p>
            This entire website is subject to French and international copyright
            and intellectual property laws. All reproduction rights are
            reserved, including for downloadable documents and iconographic and
            photographic representations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Personal Data and GDPR
          </h2>
          <p>
            In accordance with the General Data Protection Regulation (GDPR),
            you have rights over your personal data. For more information,
            please see our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="mt-4">
            <strong>Data Protection Officer (DPO):</strong> Not applicable
            (company with fewer than 250 employees not processing sensitive data
            on a large scale)
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
          <p>
            Hector Analytics uses <strong>no tracking cookies</strong>. Only
            essential technical cookies are used for logged-in user
            authentication.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Complaints</h2>
          <p>For disputes, you may file a complaint with:</p>
          <div className="p-4 bg-muted rounded-lg mt-4">
            <p>
              <strong>
                Commission Nationale de l&apos;Informatique et des Libertés
                (CNIL)
              </strong>
            </p>
            <p>3 Place de Fontenoy - TSA 80715</p>
            <p>75334 PARIS CEDEX 07</p>
            <p>Phone: 01 53 73 22 22</p>
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

        <section>
          <h2 className="text-2xl font-semibold mb-4">Credits</h2>
          <p>
            <strong>Design and Development:</strong> Quentin Bassalair
            <br />
            <strong>Technologies:</strong> Next.js, Supabase, Tailwind CSS
          </p>
        </section>
      </div>
    </div>
  );
}
