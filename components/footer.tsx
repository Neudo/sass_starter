import React from "react";
import { Logo } from "./logo";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-16 theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Logo size="md" showText={true} />
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Next-generation analytics. Privacy-respectful, GDPR compliant, and
              revolutionary, simlpe to use even for non-technical users.
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 Hector Analytics. All rights reserved.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/faq"
                  className="hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              {/* <li>
                  <a
                    href="/pricing"
                    className="hover:text-primary transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <button
                    onClick={onNavigateToDemo}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Live Demo
                  </button>
                </li> */}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
