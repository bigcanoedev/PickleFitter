import { LandingHero } from "@/components/LandingHero";
import Link from "next/link";
import { guides } from "@/lib/guides";

export default function HomePage() {
  return (
    <>
      {/* Server-rendered SEO content visible to all crawlers */}
      <div className="sr-only">
        <h1>PickleFitter — Find Your Perfect Pickleball Paddle</h1>
        <p>
          Data-driven pickleball paddle recommendations powered by lab-tested performance data.
          The 13-dimension scoring engine matches your play style
          to the ideal paddle from 727 options — using real swing weight, twist weight, power (MPH),
          and spin (RPM) data, not marketing claims.
        </p>
        <h2>How It Works</h2>
        <p>
          Take a 2-minute quiz about your skill level, play style, swing speed, and preferences.
          The algorithm scores every paddle across 13 dimensions including power, control, spin,
          stability, comfort, and value to find your best match.
        </p>
        <h2>Popular Paddle Guides</h2>
        <ul>
          {guides.map((g) => (
            <li key={g.slug}>
              <Link href={`/best/${g.slug}`}>{g.title}</Link>: {g.description}
            </li>
          ))}
        </ul>
      </div>
      <LandingHero />
    </>
  );
}
