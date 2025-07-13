import Link from "next/link";
import Button from "../../components/Button";
import { buildMeta } from "../../lib/metadata";

export const generateMetadata = () =>
  buildMeta({
    title: "Get Started | MyRoofGenius",
    description:
      "Create your free account to access professional roofing tools.",
  });

export default function GetStarted() {
  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex items-center justify-center p-8">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Start Your Free Trial
        </h1>
        <p className="text-lg text-slate-300 mb-6">
          Create your account to access professional roofing calculators and
          templates.
        </p>
        <Button
          as={Link}
          href="/signup"
          variant="primary"
          size="lg"
          className="inline-block"
        >
          Create Account
        </Button>
        <p className="mt-4 text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-secondary-700 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
