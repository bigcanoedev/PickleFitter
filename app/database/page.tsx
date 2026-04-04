import type { Metadata } from "next";
import DatabaseClient from "./DatabaseClient";

export const metadata: Metadata = {
  title: "Pickleball Paddle Database — All 727 Paddles with Specs | PickleFitter",
  description:
    "Browse all 727 pickleball paddles with lab-tested specs, swing weight, twist weight, power, spin, and prices. Sort, filter, and compare to find your paddle.",
  alternates: { canonical: "https://picklefitter.com/database" },
  openGraph: {
    title: "Pickleball Paddle Database — All 727 Paddles with Specs",
    description:
      "Browse all 727 pickleball paddles with lab-tested specs. Sort, filter, and compare.",
    url: "https://picklefitter.com/database",
  },
};

export default function DatabasePage() {
  return <DatabaseClient />;
}
