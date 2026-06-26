import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — GradPath",
  description: "The terms governing your use of GradPath.",
};

const UPDATED = "26 June 2026";
const CONTACT = "adeyemioluwakorede8@gmail.com";

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#F9F8F6", color: "#0F0F0F" }}>
      <header style={{ borderBottom: "1px solid #ECEAE5", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 18, color: "#1B2B5E", textDecoration: "none" }}>GradPath</Link>
          <Link href="/" style={{ fontSize: 14, color: "#6B7280", textDecoration: "none" }}>← Back to home</Link>
        </div>
      </header>

      <article style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 40 }}>Last updated: {UPDATED}</p>

        <Section title="1. Acceptance of Terms">
          <p>By accessing or using GradPath (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service. The Service is operated by an individual developer.</p>
        </Section>

        <Section title="2. Description of Service">
          <p>GradPath helps you track and manage graduate-school applications, organize deadlines and tasks, store related documents, and obtain AI-assisted feedback on documents such as statements of purpose and CVs.</p>
        </Section>

        <Section title="3. Your Account">
          <p>You are responsible for maintaining the confidentiality of your account and for all activity that occurs under it. You agree to provide accurate information and to notify us of any unauthorized use. You must be at least 16 years old to use the Service.</p>
        </Section>

        <Section title="4. Acceptable Use">
          <p>You agree not to misuse the Service. In particular, you will not: upload unlawful, infringing, or harmful content; attempt to disrupt or gain unauthorized access to the Service or its infrastructure; use automated means to circumvent usage limits; or use the Service to violate the rights of others.</p>
        </Section>

        <Section title="5. Your Content">
          <p>You retain ownership of the documents and information you upload. By using the Service, you grant us a limited license to store, process, and display your content solely to provide the Service to you — including sending documents you submit for review to our AI provider to generate feedback. We claim no ownership of your content.</p>
        </Section>

        <Section title="6. AI Feedback Disclaimer">
          <p>The AI Review feature provides automated suggestions to help you improve your writing. This feedback is for guidance only. It is not professional admissions advice and does not guarantee admission, scholarship, or any particular outcome. You are solely responsible for the content you submit in your applications. Always use your own judgment.</p>
        </Section>

        <Section title="7. Plans and Payments">
          <p>GradPath offers a free plan with usage limits and a paid &quot;Pro&quot; plan (which may be introduced in the future) offering expanded features. Paid subscriptions, when available, are billed through our payment processor. Fees, billing cycles, and any applicable taxes will be disclosed at the point of purchase. Except where required by law, payments are non-refundable. You may cancel a subscription at any time, and it will remain active until the end of the current billing period.</p>
        </Section>

        <Section title="8. Service Availability">
          <p>We aim to keep the Service available and reliable, but we provide it &quot;as is&quot; and &quot;as available&quot;. We may modify, suspend, or discontinue features at any time. We do not warrant that the Service will be uninterrupted or error-free.</p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>To the maximum extent permitted by law, the Service and its operator will not be liable for any indirect, incidental, or consequential damages, or for any loss of data, opportunities, or admission outcomes, arising from your use of the Service. Your use of the Service is at your own risk.</p>
        </Section>

        <Section title="10. Termination">
          <p>You may stop using the Service and delete your account at any time. We may suspend or terminate access if you violate these Terms or use the Service in a way that could cause harm. Upon termination, your right to use the Service ceases.</p>
        </Section>

        <Section title="11. Changes to These Terms">
          <p>We may revise these Terms from time to time. Material changes will be reflected by updating the &quot;Last updated&quot; date above. Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>
        </Section>

        <Section title="12. Contact">
          <p>Questions about these Terms? Contact us at <a href={`mailto:${CONTACT}`} style={linkStyle}>{CONTACT}</a>.</p>
        </Section>

        <footer style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid #ECEAE5", fontSize: 13, color: "#9AA0AB", display: "flex", gap: 18 }}>
          <Link href="/privacy" style={{ color: "#6B7280", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms" style={{ color: "#6B7280", textDecoration: "none" }}>Terms</Link>
          <Link href="/" style={{ color: "#6B7280", textDecoration: "none" }}>Home</Link>
        </footer>
      </article>
    </main>
  );
}

const linkStyle: React.CSSProperties = { color: "#1B2B5E", textDecoration: "underline" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10, color: "#1B2B5E" }}>{title}</h2>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: "#27303F" }}>{children}</div>
    </section>
  );
}
