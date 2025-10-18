"use client";

import { useState } from "react";
import { LandingNavbar } from "~/components/landing/landing-navbar";
import { AuthOverlay } from "~/components/landing/auth-overlay";
import { HeroSection } from "~/components/landing/hero-section";
import { ConceptsSection } from "~/components/landing/concepts-section";
import { FeaturesSection } from "~/components/landing/features-section";
import { HowToUseSection } from "~/components/landing/how-to-use-section";
import { CTASection } from "~/components/landing/cta-section";
import { Footer } from "~/components/landing/footer";
import { AuthForm } from "~/components/landing/auth-form";

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);

  const closeAuth = () => {
    setAuthMode(null);
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === "login" ? "register" : "login");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <LandingNavbar
        onLoginClick={() => setAuthMode("login")}
        onRegisterClick={() => setAuthMode("register")}
      />

      {/* Hero Section */}
      <HeroSection
        onLoginClick={() => setAuthMode("login")}
        onRegisterClick={() => setAuthMode("register")}
      />

      {/* Concepts Section */}
      <ConceptsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How to Use Section */}
      <HowToUseSection />

      {/* CTA Section */}
      <CTASection
        onLoginClick={() => setAuthMode("login")}
        onRegisterClick={() => setAuthMode("register")}
      />

      {/* Footer */}
      <Footer />

      {/* Auth Overlay */}
      <AuthOverlay
        isOpen={authMode !== null}
        mode={authMode ?? "login"}
        onClose={closeAuth}
        onSwitchMode={switchAuthMode}
      >
        <AuthForm mode={authMode ?? "login"} />
      </AuthOverlay>
    </main>
  );
}
