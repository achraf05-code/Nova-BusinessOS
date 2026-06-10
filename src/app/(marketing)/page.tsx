import Hero from "@/components/marketing/Hero";
import ProductShowcase from "@/components/marketing/ProductShowcase";
import FeatureGrid from "@/components/marketing/FeatureGrid";
import ProblemSolution from "@/components/marketing/ProblemSolution";
import AiCfoSpotlight from "@/components/marketing/AiCfoSpotlight";
import Roi from "@/components/marketing/Roi";
import Testimonials from "@/components/marketing/Testimonials";
import Pricing from "@/components/marketing/Pricing";
import Security from "@/components/marketing/Security";
import Integrations from "@/components/marketing/Integrations";
import Faq from "@/components/marketing/Faq";
import Cta from "@/components/marketing/Cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductShowcase />
      <ProblemSolution />
      <AiCfoSpotlight />
      <FeatureGrid />
      <Roi />
      <Testimonials />
      <Security />
      <Integrations />
      <Pricing />
      <Faq />
      <Cta />
    </>
  );
}
