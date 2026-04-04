import type { Metadata } from "next";
import { paddleData } from "@/lib/paddle-data";
import { Paddle } from "@/lib/types";
import { paddleSlug } from "@/lib/utils";
import CompareClient from "./CompareClient";
import { generatePros, generateCons, generateBestFor, getSpecVerdict } from "@/lib/paddle-analysis";

const BASE_URL = "https://picklefitter.com";

interface PageProps {
  params: Promise<{ slugs: string }>;
}

function findPaddle(slug: string): Paddle | undefined {
  return (paddleData as Paddle[]).find(
    (p) => paddleSlug(p.brand, p.name) === slug
  );
}

function parseSlugs(slugs: string): [string, string] | null {
  const parts = slugs.split("-vs-");
  if (parts.length !== 2) return null;
  return [parts[0], parts[1]];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) return { title: "Paddle Comparison — PickleFitter" };

  const [a, b] = parsed;
  const paddleA = findPaddle(a);
  const paddleB = findPaddle(b);

  if (!paddleA || !paddleB) return { title: "Paddle Comparison — PickleFitter" };

  const nameA = `${paddleA.brand} ${paddleA.name}`;
  const nameB = `${paddleB.brand} ${paddleB.name}`;
  const title = `${nameA} vs ${nameB} — Head-to-Head Comparison | PickleFitter`;
  const description = `Compare the ${nameA} ($${paddleA.price}) vs ${nameB} ($${paddleB.price}). Side-by-side specs, pros, cons, and our recommendation based on lab-tested data.`;
  const url = `${BASE_URL}/compare/${slugs}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  };
}

export default async function ComparePage({ params }: PageProps) {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);

  if (!parsed) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-black">Invalid comparison URL</h1>
        <p className="text-muted-foreground mt-2">Use the format: /compare/paddle-a-vs-paddle-b</p>
      </div>
    );
  }

  const [slugA, slugB] = parsed;
  const paddleA = findPaddle(slugA);
  const paddleB = findPaddle(slugB);

  if (!paddleA || !paddleB) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-black">Paddle not found</h1>
        <p className="text-muted-foreground mt-2">One or both paddles in this comparison could not be found.</p>
      </div>
    );
  }

  const nameA = `${paddleA.brand} ${paddleA.name}`;
  const nameB = `${paddleB.brand} ${paddleB.name}`;

  const analysisA = {
    pros: generatePros(paddleA),
    cons: generateCons(paddleA),
    bestFor: generateBestFor(paddleA),
    verdict: getSpecVerdict(paddleA),
  };
  const analysisB = {
    pros: generatePros(paddleB),
    cons: generateCons(paddleB),
    bestFor: generateBestFor(paddleB),
    verdict: getSpecVerdict(paddleB),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${nameA} vs ${nameB} Comparison`,
    description: `Side-by-side comparison of ${nameA} and ${nameB} pickleball paddles with lab-tested specs.`,
    url: `${BASE_URL}/compare/${slugs}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Compare Paddles", item: `${BASE_URL}/compare` },
        { "@type": "ListItem", position: 3, name: `${nameA} vs ${nameB}` },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Server-rendered content for SEO crawlers */}
      <div className="sr-only">
        <h1>{nameA} vs {nameB} — Pickleball Paddle Comparison</h1>
        <h2>{nameA}</h2>
        <p>{analysisA.verdict}</p>
        <p>Price: ${paddleA.price}. Swing weight: {paddleA.swing_weight}. Twist weight: {paddleA.twist_weight}. Weight: {paddleA.weight_oz} oz.{paddleA.power_mph ? ` Power: ${paddleA.power_mph} MPH.` : ""}{paddleA.spin_rpm ? ` Spin: ${paddleA.spin_rpm} RPM.` : ""}</p>
        <h3>Pros</h3>
        <ul>{analysisA.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
        <h3>Cons</h3>
        <ul>{analysisA.cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
        <h2>{nameB}</h2>
        <p>{analysisB.verdict}</p>
        <p>Price: ${paddleB.price}. Swing weight: {paddleB.swing_weight}. Twist weight: {paddleB.twist_weight}. Weight: {paddleB.weight_oz} oz.{paddleB.power_mph ? ` Power: ${paddleB.power_mph} MPH.` : ""}{paddleB.spin_rpm ? ` Spin: ${paddleB.spin_rpm} RPM.` : ""}</p>
        <h3>Pros</h3>
        <ul>{analysisB.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
        <h3>Cons</h3>
        <ul>{analysisB.cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </div>
      <CompareClient slugA={slugA} slugB={slugB} />
    </>
  );
}
