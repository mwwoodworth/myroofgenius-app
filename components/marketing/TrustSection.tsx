"use client";
import Image from "next/image";
export default function TrustSection() {
  return (
    <section className="trust bg-gradient-to-b from-[#002D5B] to-[#001A33]">
      <h2>Trusted by Roofing Pros</h2>
      <blockquote>
        "MyRoofGenius saved us $20k on project estimates!" – John, ABC Roofing
      </blockquote>
      <div className="badges">
        <Image
          src="/badges/roof-cert.svg"
          alt="Roofing Certified badge"
          width={80}
          height={80}
          loading="lazy"
        />
      </div>
    </section>
  );
}
