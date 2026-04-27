import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LoginModal } from "@/components/login-modal";
import { SignupModal } from "@/components/signup-modal";

export const metadata: Metadata = {
  title: "Privacy Policy | Dormr",
  description: "Dormr privacy policy and data handling overview.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last updated: March 23, 2026
          </p>

          <div className="space-y-8 text-sm sm:text-base leading-7 text-foreground/90">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Overview</h2>
              <p>
                This page is a placeholder privacy policy for Dormr. It will be
                expanded with complete legal language, regional compliance
                details, and role-specific data handling terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Data We Collect</h2>
              <p>
                We may collect account details, profile information, listing
                data, messages, and usage analytics required to operate the
                platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. How We Use Data</h2>
              <p>
                We use data to provide matching, improve product quality,
                communicate updates, and support account and security workflows.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Contact</h2>
              <p>
                For privacy requests or questions, contact us at
                moh.hamza.contactme@gmail.com.
              </p>
            </section>
          </div>
        </section>
      </main>

      <Footer />
      <LoginModal />
      <SignupModal />
    </div>
  );
}
