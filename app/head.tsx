// app/head.tsx
export default function Head() {
  return (
    <>
      <title>MyRoofGenius | AI-Powered Roofing Software</title>
      <meta name="description" content="Next-gen AI tools for commercial roofing contractors. Estimate, manage, and win more bids with MyRoofGenius." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* SEO / OG / Twitter tags */}
      <meta property="og:title" content="MyRoofGenius | AI-Powered Roofing Software" />
      <meta property="og:description" content="Next-gen AI tools for commercial roofing contractors." />
      <meta property="og:image" content="https://myroofgenius.com/og-image.jpg" />
      <meta property="og:url" content="https://myroofgenius.com" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://myroofgenius.com/og-image.jpg" />
      {/* JSON-LD structured data (optional) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "http://schema.org",
            "@type": "Organization",
            "name": "MyRoofGenius",
            "url": "https://myroofgenius.com",
            "logo": "https://myroofgenius.com/logo.svg"
          })
        }}
      />
    </>
  );
}
