"use client";
import { Navigation } from "@/components/navigation";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground theme-transition flex flex-col">
      <Navigation />

      <main className="flex-1 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          ></motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-7xl sm:text-8xl lg:text-9xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-primary via-ring to-secondary bg-clip-text text-transparent">
              404
            </span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
          >
            Page Not Found
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-lg mx-auto"
          >
            Looks like this page went off the analytics grid. Don&apos;t worry,
            we&apos;re still tracking everything else perfectly!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                <Home className="mr-2 w-5 h-5" />
                Back to Home
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
              className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Go Back
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 pt-8 border-t border-border"
          >
            {/* <p className="text-sm text-muted-foreground mb-4">
              Quick links to help you navigate:
            </p> */}
            {/* <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/pricing"
                className="text-primary hover:underline flex items-center gap-1"
              >
                Pricing
              </Link>
              <Link
                href="/demo"
                className="text-primary hover:underline flex items-center gap-1"
              >
                Live Demo
              </Link>
              <Link
                href="/faq"
                className="text-primary hover:underline flex items-center gap-1"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-primary hover:underline flex items-center gap-1"
              >
                Contact
              </Link>
            </div> */}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
