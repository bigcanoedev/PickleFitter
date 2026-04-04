import type { Metadata } from "next";
import { paddleData } from "@/lib/paddle-data";
import { Paddle } from "@/lib/types";
import { paddleSlug } from "@/lib/utils";
import PaddleDetail from "./PaddleDetail";
import { generatePros, generateCons, generateBestFor, getProPlayers, getSpecVerdict } from "@/lib/paddle-analysis";

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

  const title = `${paddle.brand} ${paddle.name} Review — Specs, Pros & Cons | PickleFitter`;
  const description = `${paddle.brand} ${paddle.name} ($${paddle.price}) — ${specs}. Swing weight ${paddle.swing_weight}, twist weight ${paddle.twist_weight}. See pros, cons, who it's best for, and optimize with lead tape.`;
  const url = `${BASE_URL}/paddle/${paddleSlug(paddle.brand, paddle.name)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
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

  // Pre-compute analysis server-side for SEO crawlability
  const analysis = paddle
    ? {
        pros: generatePros(paddle),
        cons: generateCons(paddle),
        bestFor: generateBestFor(paddle),
        proPlayers: getProPlayers(paddle.id),
        verdict: getSpecVerdict(paddle),
      }
    : null;

  const breadcrumbJsonLd = paddle
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Paddle Database", item: `${BASE_URL}/database` },
          { "@type": "ListItem", position: 3, name: `${paddle.brand} ${paddle.name}` },
        ],
      }
    : null;

  return (
    <>
      {paddle && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([buildJsonLd(paddle), breadcrumbJsonLd].filter(Boolean)),
          }}
        />
      )}
      {/* Server-rendered content for SEO crawlers */}
      {paddle && analysis && (
        <div className="sr-only">
          <h1>{paddle.brand} {paddle.name} Review</h1>
          <p>{analysis.verdict}</p>
          <p>Price: ${paddle.price}. Swing weight: {paddle.swing_weight}. Twist weight: {paddle.twist_weight}. Weight: {paddle.weight_oz} oz.{paddle.power_mph ? ` Power: ${paddle.power_mph} MPH.` : ""}{paddle.spin_rpm ? ` Spin: ${paddle.spin_rpm} RPM.` : ""}{paddle.core_thickness_mm ? ` Core: ${paddle.core_thickness_mm}mm.` : ""}{paddle.shape ? ` Shape: ${paddle.shape}.` : ""}{paddle.face_material ? ` Face: ${paddle.face_material}.` : ""}</p>
          <h2>Pros</h2>
          <ul>{analysis.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
          <h2>Cons</h2>
          <ul>{analysis.cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
          {analysis.bestFor.length > 0 && (
            <>
              <h2>Best For</h2>
              <ul>{analysis.bestFor.map((b) => <li key={b.label}>{b.label}: {b.description}</li>)}</ul>
            </>
          )}
          {analysis.proPlayers.length > 0 && (
            <>
              <h2>Pro Players</h2>
              <ul>{analysis.proPlayers.map((p) => <li key={p.name}>{p.name}{p.note ? ` (${p.note})` : ""}</li>)}</ul>
            </>
          )}
        </div>
      )}
      <PaddleDetail />
    </>
  );
}
