import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — PickleFitter",
  description: "Privacy Policy for PickleFitter, the data-driven pickleball paddle recommendation tool.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
      >
        &larr; Back to PickleFitter
      </Link>

      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: April 5, 2026</p>

      <div className="prose prose-neutral dark:prose-invert space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            PickleFitter (&quot;we,&quot; &quot;us,&quot; or &quot;the Service&quot;) is operated by
            PickleFitter. This Privacy Policy explains what information we collect, how we use it,
            and your rights regarding that information. By using our Service, you agree to the
            collection and use of information as described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            We collect the following categories of information:
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">a. Email Address</h3>
          <p className="text-muted-foreground leading-relaxed">
            When you subscribe to receive your quiz results, deal alerts, or updates, we collect
            your email address. This is stored on our servers (hosted by Supabase) along with the
            date you signed up.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">b. Quiz Responses</h3>
          <p className="text-muted-foreground leading-relaxed">
            When you complete the paddle recommendation quiz, your answers (play style, skill level,
            swing speed, preferences, budget, and similar inputs) are sent to our server and stored
            in our database. These responses are associated with a randomly generated session ID
            and are used to improve our recommendation engine.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">c. Recommendation Data</h3>
          <p className="text-muted-foreground leading-relaxed">
            If you sign up to save your results, we store which paddles were recommended to you
            and their prices at the time of recommendation, linked to your email address and
            session ID.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">d. Usage and Analytics Data</h3>
          <p className="text-muted-foreground leading-relaxed">
            We use Vercel Analytics to collect anonymous usage data including page views, referral
            sources, device type, and browser information. We also track specific events such as
            affiliate link clicks (which paddle, which retailer, price), quiz completions, email
            signups, and share actions. This data helps us understand how the site is used and
            improve the experience.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">e. Server Logs</h3>
          <p className="text-muted-foreground leading-relaxed">
            Our hosting provider (Vercel) automatically collects standard server access information
            including IP addresses, request timestamps, and user agent strings. IP addresses are
            used for rate limiting and security purposes.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">f. Local Storage</h3>
          <p className="text-muted-foreground leading-relaxed">
            We may use your browser&apos;s local storage to save quiz progress and results so you
            can return to them. This data stays on your device.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>To provide personalized paddle recommendations based on your quiz answers</li>
            <li>To send you your quiz results, deal alerts, and occasional updates (if you subscribe)</li>
            <li>To improve our recommendation algorithm and site experience</li>
            <li>To analyze aggregate usage patterns and site performance</li>
            <li>To prevent abuse through rate limiting and bot detection</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Affiliate Links &amp; Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            PickleFitter contains affiliate links to third-party retailers including Amazon and
            paddle brand stores. When you click an affiliate link:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>
              We track the click event (paddle name, retailer, and price) through Vercel Analytics
              to measure our service effectiveness.
            </li>
            <li>
              The destination retailer may collect information about your visit according to their
              own privacy policy. We have no control over their data practices.
            </li>
            <li>
              We participate in the Amazon Services LLC Associates Program and other affiliate
              programs. We earn commissions on qualifying purchases made through our links at no
              additional cost to you.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Data Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not sell, rent, or trade your personal information to third parties. We may share
            data with the following service providers who process it on our behalf:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Supabase:</strong> Database hosting for email signups and quiz responses</li>
            <li><strong>Vercel:</strong> Site hosting and analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Cookies &amp; Tracking</h2>
          <p className="text-muted-foreground leading-relaxed">
            Vercel Analytics is designed to be privacy-friendly and may operate without cookies in
            some configurations. However, our site and third-party services may use cookies or
            similar technologies. You can disable cookies in your browser settings, though this
            may affect site functionality. For visitors in the European Union, we provide a cookie
            consent mechanism in accordance with applicable laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your email address and associated data for as long as you remain subscribed
            or until you request deletion. Quiz response data is retained indefinitely in aggregate
            form to improve our recommendation engine. You may request deletion of your personal
            data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data.</li>
            <li><strong>Portability:</strong> Request your data in a portable format.</li>
            <li><strong>Objection:</strong> Object to processing of your data for certain purposes.</li>
            <li><strong>Withdraw Consent:</strong> Withdraw consent for email communications at any time by unsubscribing.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            To exercise any of these rights, please email us at{" "}
            <a href="mailto:privacy@picklefitter.com" className="text-primary underline hover:no-underline">
              privacy@picklefitter.com
            </a>
            . We will respond within 30 days.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">For California Residents (CCPA)</h3>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to know what personal information we collect, request its deletion,
            and opt out of any sale of personal information. We do not sell personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            PickleFitter is not directed at children under the age of 13. We do not knowingly
            collect personal information from children. If you believe a child has provided us with
            personal information, please contact us so we can take appropriate action.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated &quot;Last updated&quot; date. Your continued use of the Service
            after changes are posted constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">11. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions or concerns about this Privacy Policy or your data, please
            contact us at{" "}
            <a href="mailto:privacy@picklefitter.com" className="text-primary underline hover:no-underline">
              privacy@picklefitter.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
