import MainLayout from '../components/layout/MainLayout';
import Starfield from '../components/layout/Starfield';
import Hero from '../components/ui/Hero';
import Image from 'next/image';

export default function Home() {
  return (
    <MainLayout>
      <div className="relative">
        <Starfield />
        <Hero />
      </div>
      <section className="py-20 text-center space-y-6">
        <h2 className="text-3xl font-display">Residential Solutions</h2>
        <Image
          src="https://placehold.co/1200x600/121212/F0F0F0/png?text=Residential+Roof"
          alt="Placeholder residential roof"
          width={1200}
          height={600}
          className="mx-auto rounded"
        />
      </section>
      <section className="py-20 text-center space-y-6">
        <h2 className="text-3xl font-display">Commercial Insights</h2>
        <Image
          src="https://placehold.co/1200x600/121212/F0F0F0/png?text=Commercial+Roof"
          alt="Placeholder commercial roof"
          width={1200}
          height={600}
          className="mx-auto rounded"
        />
      </section>
    </MainLayout>
  );
}
