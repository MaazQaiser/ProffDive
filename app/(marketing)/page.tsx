import HeroSection from "@/components/marketing/HeroSection";
import HowItWorks from "@/components/marketing/HowItWorks";
import FeatureCards from "@/components/marketing/FeatureCards";
import DemoPreview from "@/components/marketing/DemoPreview";
import TrustPillars from "@/components/marketing/TrustPillars";
import CtaFooter from "@/components/marketing/CtaFooter";
import SiteHeader from "@/components/marketing/SiteHeader";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen flex-col items-center justify-between">
        <HeroSection />
      <HowItWorks />
      <FeatureCards />
      <DemoPreview />
      <TrustPillars />
        <CtaFooter />
      </main>
    </>
  );
}
