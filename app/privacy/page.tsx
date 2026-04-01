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
      <p className="text-muted-foreground mb-8">Last updated: April 1, 2026</p>

      <div className="prose prose-neutral dark:prose-invert space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            PickleFitter (&quot;we,&quot; &quot;us,&quot; or &quot;the Service&quot;) respects your
            privacy. This Privacy Policy explains what information we collect, how we use it, and
            your choices regarding that information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            PickleFitter is designed to minimize data collection. We do not require account
            creation or login. Here is what we may collect:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>
              <strong>Quiz Responses:</strong> Your answers to the paddle recommendation quiz
              (play style, skill level, preferences) are processed in your browser and are not
              stored on our servers.
            </li>
            <li>
              <strong>Usage Data:</strong> We may collect anonymous, aggregated usage data such as
              page views, referral sources, and general device/browser information through
              third-party analytics services.
            </li>
            <li>
              <strong>Local Storage:</strong> We may use your browser&apos;s local storage to save
              quiz results so you can return to them. This data stays on your device and is not
              transmitted to us.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Information We Do Not Collect</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>We do not collect your name, email address, or other personal contact information unless you voluntarily provide it (e.g., by contacting us).</li>
            <li>We do not collect payment or financial information. All purchases happen on third-party retailer sites.</li>
            <li>We do not sell, rent, or trade any user data to third parties.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Cookies &amp; Tracking</h2>
          <p className="text-muted-foreground leading-relaxed">
            PickleFitter may use cookies or similar technologies for analytics purposes. These
            cookies help us understand how visitors use the site so we can improve the experience.
            You can disable cookies in your browser settings at any time, though this may affect
            site functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            The Service may include links to or integrations with third-party services. These
            third parties have their own privacy policies, and we encourage you to review them:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>
              <strong>Affiliate Links:</strong> When you click an affiliate link, the destination
              retailer (e.g., Amazon) may collect information about your visit according to their
              own privacy policy.
            </li>
            <li>
              <strong>Analytics:</strong> We may use third-party analytics tools (e.g., Vercel
              Analytics, Google Analytics) that collect anonymous usage data. These services have
              their own data handling practices.
            </li>
            <li>
              <strong>Hosting:</strong> The site is hosted on third-party infrastructure that may
              log standard server access information (IP addresses, request timestamps).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            Since we do not collect personal data, there is generally nothing to retain or delete.
            Any anonymous analytics data is retained according to the respective analytics
            provider&apos;s policies. Data stored in your browser&apos;s local storage can be
            cleared by you at any time through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            PickleFitter is not directed at children under the age of 13. We do not knowingly
            collect personal information from children. If you believe a child has provided us with
            personal information, please contact us so we can take appropriate action.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            Depending on your location, you may have rights under data protection laws (such as
            GDPR or CCPA) including the right to access, correct, or delete your personal data. As
            we do not collect personal data, these rights are generally not applicable. If you have
            concerns, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated &quot;Last updated&quot; date. Your continued use of the Service
            after changes are posted constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions or concerns about this Privacy Policy, please reach out via the
            contact information provided on the site.
          </p>
        </section>
      </div>
    </div>
  );
}
