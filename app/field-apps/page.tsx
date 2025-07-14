import { buildMeta } from "../../lib/metadata";

export const generateMetadata = () =>
  buildMeta({
    title: "Field Apps | MyRoofGenius",
    description: "Offline-capable mobile tools for crews on site.",
  });

export default async function FieldAppsPage() {
  const { default: FieldAppsClient } = await import("./FieldAppsClient");
  return <FieldAppsClient />;
}
