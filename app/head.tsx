export default function Head() {
  return (
    <>
      <title>MyRoofGenius | Roofing Software & Marketplace</title>
      <meta
        name="description"
        content="Discover AI-powered calculators, mobile field apps and digital templates for every roofing project."
      />
      <meta
        property="og:title"
        content="MyRoofGenius | Roofing Software & Marketplace"
      />
      <meta
        property="og:description"
        content="Discover AI-powered calculators, mobile field apps and digital templates for every roofing project."
      />
      <meta
        name="twitter:title"
        content="MyRoofGenius | Roofing Software & Marketplace"
      />
      <meta
        name="twitter:description"
        content="Discover AI-powered calculators, mobile field apps and digital templates for every roofing project."
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "MyRoofGenius",
            url: "https://myroofgenius.com",
            logo: "https://myroofgenius.com/logo.png",
          }),
        }}
      />
    </>
  );
}
