import type { Metadata } from "next";
import { paddleData } from "@/lib/paddle-data";
import { Paddle } from "@/lib/types";
import { paddleSlug } from "@/lib/utils";
import PaddleDetail from "./PaddleDetail";

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

export default function PaddlePage() {
  return <PaddleDetail />;
}
