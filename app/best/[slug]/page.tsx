import type { Metadata } from "next";
import { guides, getGuideBySlug, getGuideRanking } from "@/lib/guides";
import { paddleSlug } from "@/lib/utils";
import GuideContent from "./GuideContent";

const BASE_URL = "https://picklefitter.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return { title: "Guide Not Found — PickleFitter" };
  }

  const url = `${BASE_URL}/best/${slug}`;
  return {
    title: guide.metaTitle,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: { title: guide.metaTitle, description: guide.description, url },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-black">Guide not found</h1>
      </div>
    );
  }

  const topPaddles = getGuideRanking(guide);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: guide.title,
    description: guide.description,
    url: `${BASE_URL}/best/${guide.slug}`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: topPaddles.length,
    itemListElement: topPaddles.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/paddle/${paddleSlug(p.brand, p.name)}`,
      name: `${p.brand} ${p.name}`,
      item: {
        "@type": "Product",
        name: `${p.brand} ${p.name}`,
        brand: { "@type": "Brand", name: p.brand },
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Best Paddles", item: `${BASE_URL}/best` },
      { "@type": "ListItem", position: 3, name: guide.title },
    ],
  };

  const faqJsonLd = guide.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: guide.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            [itemListJsonLd, breadcrumbJsonLd, faqJsonLd].filter(Boolean)
          ),
        }}
      />
      {/* Server-rendered content for SEO crawlers */}
      <div className="sr-only">
        <h1>{guide.title}</h1>
        <p>{guide.intro}</p>
        <h2>Top {topPaddles.length} {guide.title}</h2>
        <ol>
          {topPaddles.map((p, i) => (
            <li key={p.id}>
              #{i + 1}: {p.brand} {p.name} — ${p.price}.
              {p.swing_weight ? ` Swing weight ${p.swing_weight}.` : ""}
              {p.twist_weight ? ` Twist weight ${p.twist_weight}.` : ""}
              {p.power_mph ? ` ${p.power_mph} MPH power.` : ""}
              {p.spin_rpm ? ` ${p.spin_rpm} RPM spin.` : ""}
            </li>
          ))}
        </ol>
        {guide.faqs && guide.faqs.length > 0 && (
          <>
            <h2>FAQ</h2>
            {guide.faqs.map((faq, i) => (
              <div key={i}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </>
        )}
      </div>
      <GuideContent slug={slug} />
    </>
  );
}
