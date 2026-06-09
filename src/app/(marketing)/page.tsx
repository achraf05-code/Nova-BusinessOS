import Hero from "@/components/marketing/Hero";
import FeatureGrid from "@/components/marketing/FeatureGrid";
import AiCfoSpotlight from "@/components/marketing/AiCfoSpotlight";
import Testimonials from "@/components/marketing/Testimonials";
import Pricing from "@/components/marketing/Pricing";
import Faq from "@/components/marketing/Faq";
import Cta from "@/components/marketing/Cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <AiCfoSpotlight />
      <Testimonials />
      <Pricing />
      <Faq />
      <Cta />
    </>
  );
}
