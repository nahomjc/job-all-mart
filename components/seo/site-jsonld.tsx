const CANONICAL_HOST = "https://www.makadverts.com";

interface SiteJsonLdProps {
  appName: string;
  locale: string;
}

export function SiteJsonLd({ appName, locale }: SiteJsonLdProps) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${CANONICAL_HOST}/#organization`,
    name: appName,
    url: CANONICAL_HOST,
    logo: `${CANONICAL_HOST}/logo.png`,
    description: "Ethiopia's job board for Dire Dawa, Harar, and the Somali region. Post job vacancies to Telegram channels and the web.",
    areaServed: {
      "@type": "Country",
      name: "Ethiopia",
    },
    sameAs: [
      "https://t.me/+OQm7tPHrOO5iNjNk",
    ],
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${CANONICAL_HOST}/#website`,
    name: appName,
    url: CANONICAL_HOST,
    description: "Ethiopia's job board for Dire Dawa, Harar, and the Somali region.",
    publisher: {
      "@id": `${CANONICAL_HOST}/#organization`,
    },
    inLanguage: [
      { "@type": "Language", name: "English", alternateName: "en" },
      { "@type": "Language", name: "Amharic", alternateName: "am" },
    ],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${CANONICAL_HOST}/${locale}/jobs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
    </>
  );
}
