import Image from "next/image";
import { buildMeta } from "../../lib/metadata";

export const generateMetadata = () =>
  buildMeta({
    title: "Integrations | MyRoofGenius",
    description: "Connect MyRoofGenius with your existing software tools.",
  });

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-4xl font-bold text-center text-white mb-4">
          Your Systems, Connected and Protected
        </h1>
        <p className="text-xl text-center text-slate-300 mb-12 max-w-3xl mx-auto">
          MyRoofGenius connects with the tools you already use, creating a
          protective network that catches issues before they cascade.
        </p>
        <div className="space-y-12">
          <IntegrationCategory
            title="Financial Protection"
            description="Keep cash flow visible and margins protected"
            integrations={[
              {
                name: "QuickBooks",
                description:
                  "Automatic invoice sync, payment tracking, job costing",
                status: "active",
                // Icon from simple-icons CDN
                icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/quickbooks.svg",
              },
              {
                name: "Stripe",
                description: "Payment processing with automatic reconciliation",
                status: "active",
                // Icon from simple-icons CDN
                icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/stripe.svg",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function IntegrationCategory({ title, description, integrations }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2 text-white">{title}</h2>
      <p className="text-slate-300 mb-4">{description}</p>
      <div className="grid md:grid-cols-2 gap-6">
        {integrations.map((intg, i) => (
          <div
            key={i}
            className="bg-white/10 backdrop-blur-lg rounded-lg shadow p-4 flex items-center space-x-4"
          >
            <Image
              src={intg.icon}
              alt={intg.name}
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{intg.name}</h3>
              <p className="text-sm text-slate-300">{intg.description}</p>
            </div>
            <span className="text-sm text-accent-emerald font-medium">
              {intg.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
