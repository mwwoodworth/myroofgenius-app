import NavBar from "../components/NavBar";
import TrustBar from "../components/TrustBar";
import TestimonialCard from "../components/TestimonialCard";
import Button from "../components/Button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MyRoofGenius - Smart Roofing Solutions",
  description: "AI-powered roofing tools and marketplace for contractors.",
};

export default function HomePage() {
  return (
    <>
      <NavBar />
      <section className="flex flex-col items-center text-center py-16 px-4 space-y-6 bg-bg-card mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-bold max-w-2xl">
          Protect Your Margins with 98.7% Accurate Measurements in 30 Seconds
        </h1>
        <Button
          as="a"
          href="/get-started"
          variant="primary"
          size="lg"
          className="mx-auto"
        >
          Start Free Analysis
        </Button>
        <Button as="a" href="/demo" variant="ghost" size="lg">
          Watch a 2-min Demo
        </Button>
      </section>
      <TrustBar />
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          What Contractors Say
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <TestimonialCard
            quote="MyRoofGenius cut our estimation time in half while improving accuracy."
            name="Sarah Chen"
            title="Senior Estimator"
            company="ABC Roofing"
          />
          <TestimonialCard
            quote="The AI insights help us identify issues before they become problems."
            name="Michael Rodriguez"
            title="Operations Manager"
            company="Premier Roofing Co."
          />
          <TestimonialCard
            quote="Finally, a platform that understands the complexity of commercial roofing."
            name="Jennifer Park"
            title="Facility Director"
            company="Corporate Properties Inc."
          />
        </div>
      </section>
    </>
  );
}
