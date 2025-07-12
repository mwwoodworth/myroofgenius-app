import dynamicImport from "next/dynamic";
const HomeClient = dynamicImport(() => import("./HomeClient"), { ssr: false });

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MyRoofGenius - Smart Roofing Solutions",
  description: "AI roofing calculators, field tools, and compliance resources.",
};

export default function HomePage() {
  return <HomeClient />;
}
