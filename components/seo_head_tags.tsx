import Head from 'next/head';

interface SeoHeadTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const defaultMeta = {
  title: 'MyRoofGenius – Instant Roof Estimates & Expert Advice',
  description:
    'Get accurate roof replacement estimates in minutes with MyRoofGenius. Trusted by homeowners nationwide.',
  image: '/og-image.png',
  url: 'https://myroofgenius.com',
};

/**
 * SeoHeadTags
 * Adds standard SEO + social meta tags. Override by passing props.
 */
const SeoHeadTags: React.FC<SeoHeadTagsProps> = ({
  title,
  description,
  image,
  url,
}) => {
  const meta = {
    ...defaultMeta,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(url ? { url } : {}),
  };

  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={meta.url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
    </Head>
  );
};

export default SeoHeadTags;
