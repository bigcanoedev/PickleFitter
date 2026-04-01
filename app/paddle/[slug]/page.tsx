import type { Metadata } from "next";
import { paddleData } from "@/lib/paddle-data";
import { Paddle } from "@/lib/types";
import { paddleSlug } from "@/lib/utils";
import PaddleDetail from "./PaddleDetail";

const BASE_URL = "https://picklefitter.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (paddleData as Paddle[]).map((p) => ({
    slug: paddleSlug(p.brand, p.name),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const paddle = (paddleData as Paddle[]).find(
    (p) => paddleSlug(p.brand, p.name) === slug
  );

  if (!paddle) {
    return { title: "Paddle Not Found — PickleFitter" };
  }

  const specs = [
    paddle.shape,
    paddle.core_thickness_mm ? `${paddle.core_thickness_mm}mm` : null,
    paddle.power_mph ? `${paddle.power_mph} MPH power` : null,
    paddle.spin_rpm ? `${paddle.spin_rpm} RPM spin` : null,
  ].filter(Boolean).join(", ");

  return {
    title: `${paddle.brand} ${paddle.name} Review — Specs, Pros & Cons | PickleFitter`,
    description: `${paddle.brand} ${paddle.name} ($${paddle.price}) — ${specs}. Swing weight ${paddle.swing_weight}, twist weight ${paddle.twist_weight}. See pros, cons, who it's best for, and optimize with lead tape.`,
  };
}

function buildJsonLd(paddle: Paddle) {
  const slug = paddleSlug(paddle.brand, paddle.name);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${paddle.brand} ${paddle.name}`,
    brand: {
      "@type": "Brand",
      name: paddle.brand,
    },
    description: paddle.description,
    category: "Pickleball Paddles",
    url: `${BASE_URL}/paddle/${slug}`,
    offers: {
      "@type": "Offer",
      price: paddle.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Swing Weight", value: String(paddle.swing_weight) },
      { "@type": "PropertyValue", name: "Twist Weight", value: String(paddle.twist_weight) },
      { "@type": "PropertyValue", name: "Weight", value: `${paddle.weight_oz} oz` },
      paddle.shape && { "@type": "PropertyValue", name: "Shape", value: paddle.shape },
      paddle.core_thickness_mm && { "@type": "PropertyValue", name: "Core Thickness", value: `${paddle.core_thickness_mm}mm` },
      paddle.face_material && { "@type": "PropertyValue", name: "Face Material", value: paddle.face_material },
      paddle.power_mph && { "@type": "PropertyValue", name: "Power", value: `${paddle.power_mph} MPH` },
      paddle.spin_rpm && { "@type": "PropertyValue", name: "Spin", value: `${paddle.spin_rpm} RPM` },
      paddle.pop_mph && { "@type": "PropertyValue", name: "Pop", value: `${paddle.pop_mph} MPH` },
    ].filter(Boolean),
  };

  if (paddle.image_url) {
    jsonLd.image = paddle.image_url;
  }

  return jsonLd;
}

export default async function PaddlePage({ params }: PageProps) {
  const { slug } = await params;
  const paddle = (paddleData as Paddle[]).find(
    (p) => paddleSlug(p.brand, p.name) === slug
  );

  return (
    <>
      {paddle && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(paddle)) }}
        />
      )}
      <PaddleDetail />
    </>
  );
}
