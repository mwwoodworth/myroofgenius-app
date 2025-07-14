import Image from "next/image";

export default function TrustSection() {
  return (
    <section className="py-10 text-center">
      <h2 className="text-2xl font-bold mb-6">Trusted by Roofing Professionals Everywhere</h2>
      <div className="flex flex-wrap justify-center items-center gap-6 px-4 max-w-5xl mx-auto">
        <Image src="/badges/roof-cert.svg" alt="Roofing Certified" width={100} height={50} className="opacity-60 grayscale" />
        <Image src="/badges/nrca-logo.png" alt="NRCA Member" width={120} height={60} className="opacity-60 grayscale" />
        <Image src="/badges/oc.svg" alt="Owens Corning Partner" width={120} height={60} className="opacity-60 grayscale" />
        <Image src="/badges/abc-supply.png" alt="ABC Supply" width={120} height={50} className="opacity-60 grayscale" />
        {/* Add more logos as needed */}
      </div>
    </section>
  );
}
