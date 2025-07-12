import dynamicImport from "next/dynamic";
const HomeClient = dynamicImport(() => import("./HomeClient"), { ssr: false });

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MyRoofGenius | Roofing Software & Marketplace",
  description:
    "Discover AI-powered calculators, mobile field apps and digital templates for every roofing project.",
};

export default function HomePage() {
  return <HomeClient />;
}
