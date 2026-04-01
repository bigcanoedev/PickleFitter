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

  return {
    title: guide.metaTitle,
    description: guide.description,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: guide.title,
    description: guide.description,
    url: `${BASE_URL}/best/${guide.slug}`,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuideContent slug={slug} />
    </>
  );
}
