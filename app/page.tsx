
import { constructMetadata } from "./lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = constructMetadata({
  title: "MyRoofGenius | AI-Powered Roofing Software & Marketplace",
  description:
    "Discover AI-powered calculators, mobile field apps, and digital templates for every roofing project. Streamline estimates, manage projects, and grow your business.",
  keywords: ["roofing software", "roofing calculator", "roofing estimates", "contractor tools", "roofing marketplace", "AI roofing", "construction software", "roofing apps"],
});

export default async function HomePage() {
  const HomeClient = (await import("./HomeClient")).default;
  return (
    <main className="relative z-0 overflow-hidden pb-28 sm:pb-0">
      <HomeClient />
    </main>
  );
}
