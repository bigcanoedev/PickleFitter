import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — PickleFitter",
  description: "Terms of Service for PickleFitter, the data-driven pickleball paddle recommendation tool.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
      >
        &larr; Back to PickleFitter
      </Link>

      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: April 1, 2026</p>

      <div className="prose prose-neutral dark:prose-invert space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using PickleFitter (&quot;the Service&quot;), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not use the
            Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            PickleFitter provides pickleball paddle recommendations based on publicly available,
            lab-tested performance data. The Service includes a quiz, paddle database, customization
            tools, and lead tape placement guides. The Service is provided free of charge.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Data Sources &amp; Attribution</h2>
          <p className="text-muted-foreground leading-relaxed">
            Paddle performance data displayed on PickleFitter is sourced from publicly available
            databases, including data compiled by{" "}
            <a
              href="https://thepickleballstudio.notion.site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              The Pickleball Studio
            </a>
            . All factual data (measurements, specifications, and test results) is presented for
            informational purposes. We make no claim of ownership over third-party data and provide
            attribution to original sources where applicable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. No Warranty</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties
            of any kind, either express or implied. Paddle recommendations are algorithmic
            suggestions based on the preferences you provide and publicly available data. We do not
            guarantee that any recommendation will suit your play style, skill level, or personal
            preferences. Always try a paddle before purchasing when possible.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Affiliate Links &amp; Purchases</h2>
          <p className="text-muted-foreground leading-relaxed">
            PickleFitter may contain affiliate links to third-party retailers. If you make a
            purchase through these links, we may earn a small commission at no additional cost to
            you. We are not responsible for the products, services, pricing, or policies of
            third-party retailers. All purchases are subject to the respective retailer&apos;s terms
            and conditions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            To the fullest extent permitted by law, PickleFitter and its operators shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages arising
            from your use of the Service, including but not limited to dissatisfaction with a paddle
            purchase made based on our recommendations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            The PickleFitter name, logo, quiz logic, recommendation algorithms, and original site
            content are the property of their respective owners. Third-party trademarks, brand
            names, and product names referenced on this site belong to their respective owners and
            are used for identification purposes only.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. User Conduct</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree not to scrape, reproduce, or redistribute the compiled data presented on
            PickleFitter without prior written permission. You may not use the Service for any
            unlawful purpose or in any way that could damage or impair the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Changes to These Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these Terms of Service at any time. Changes will be
            effective immediately upon posting to this page. Your continued use of the Service
            following any changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about these Terms of Service, please reach out via the contact
            information provided on the site.
          </p>
        </section>
      </div>
    </div>
  );
}
