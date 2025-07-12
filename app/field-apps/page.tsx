import dynamicImport from "next/dynamic";
import { buildMeta } from "../../lib/metadata";

const FieldAppsClient = dynamicImport(() => import("./FieldAppsClient"), {
  ssr: false,
});

export const generateMetadata = () =>
  buildMeta({
    title: "Field Apps | MyRoofGenius",
    description: "Offline-capable mobile tools for crews on site.",
  });

export default function FieldAppsPage() {
  return <FieldAppsClient />;
}
