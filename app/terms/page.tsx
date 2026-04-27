import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LoginModal } from "@/components/login-modal";
import { SignupModal } from "@/components/signup-modal";

export const metadata: Metadata = {
  title: "Terms of Service | Dormr",
  description: "Dormr terms of service for platform usage.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last updated: March 23, 2026
          </p>

          <div className="space-y-8 text-sm sm:text-base leading-7 text-foreground/90">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Acceptance</h2>
              <p>
                This page is a placeholder Terms of Service for Dormr. A full
                legal version will be added with enforceable terms and
                jurisdiction-specific language.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Platform Use</h2>
              <p>
                Users are expected to provide accurate information, use the
                platform lawfully, and respect other members during all housing
                interactions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">
                3. Accounts & Content
              </h2>
              <p>
                You are responsible for your account security and for content
                posted through your profile, listings, and requests.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Contact</h2>
              <p>
                For legal questions, contact us at
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
