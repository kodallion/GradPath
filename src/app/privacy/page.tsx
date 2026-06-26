import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — GradPath",
  description: "How GradPath collects, uses, and protects your data.",
};

const UPDATED = "26 June 2026";
const CONTACT = "adeyemioluwakorede8@gmail.com";

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#F9F8F6", color: "#0F0F0F" }}>
      <header style={{ borderBottom: "1px solid #ECEAE5", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 18, color: "#1B2B5E", textDecoration: "none" }}>GradPath</Link>
          <Link href="/" style={{ fontSize: 14, color: "#6B7280", textDecoration: "none" }}>← Back to home</Link>
        </div>
      </header>

      <article style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 40 }}>Last updated: {UPDATED}</p>

        <Section title="1. Introduction">
          <p>GradPath (&quot;we&quot;, &quot;us&quot;, or &quot;the Service&quot;) is a graduate-school application management tool operated by an individual developer. This policy explains what information we collect, how we use it, and the choices you have. By using GradPath, you agree to the practices described here.</p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following categories of information:</p>
          <ul style={ulStyle}>
            <li><b>Account information.</b> When you sign up, our authentication provider collects your name and email address to create and secure your account.</li>
            <li><b>Application data.</b> Information you enter about your graduate applications — university names, programs, countries, deadlines, tasks, and status.</li>
            <li><b>Documents you upload.</b> Files you choose to upload, such as statements of purpose, CVs, and transcripts.</li>
            <li><b>Usage data.</b> Basic technical information such as how you interact with features, used to keep the Service running reliably.</li>
            <li><b>Payment information.</b> If you subscribe to a paid plan, payment details are handled by our payment processor. We do not store your full card details on our servers.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your information to provide and improve the Service: to operate your account, store and display your applications and documents, generate AI-assisted feedback on documents you submit for review, process payments for paid plans, and communicate with you about your account.</p>
        </Section>

        <Section title="4. AI Review and Document Processing">
          <p>When you choose to run an AI Review on a document, the text of that document is sent to our AI processing provider (Anthropic) to generate feedback. This happens only when you actively request a review. The feedback is guidance to help you improve your writing — it does not guarantee any admission outcome. We do not use your documents to train AI models.</p>
        </Section>

        <Section title="5. Third-Party Service Providers">
          <p>We rely on trusted third parties to operate GradPath. Each processes data only as needed to provide their service:</p>
          <ul style={ulStyle}>
            <li><b>Clerk</b> — account authentication and management.</li>
            <li><b>Supabase</b> — database and secure file storage for your applications and documents.</li>
            <li><b>Anthropic</b> — AI analysis of documents you submit for review.</li>
            <li><b>Flutterwave</b> — payment processing for paid plans.</li>
            <li><b>Vercel</b> — application hosting and delivery.</li>
          </ul>
          <p>These providers may process and store data on servers located outside your country of residence.</p>
        </Section>

        <Section title="6. Data Retention">
          <p>We retain your information for as long as your account is active. You can delete individual applications and documents at any time. When you delete your account, your personal data and associated records are removed from our systems, subject to any retention our providers require for legal or operational reasons.</p>
        </Section>

        <Section title="7. Your Rights and Choices">
          <p>You have control over your data. From your account settings you can:</p>
          <ul style={ulStyle}>
            <li><b>Export your data</b> — download a copy of your applications, tasks, documents, and reviews.</li>
            <li><b>Delete your account</b> — permanently remove your account and associated data.</li>
            <li><b>Update your information</b> — edit your profile and notification preferences.</li>
          </ul>
          <p>If you have questions or requests regarding your data, contact us at the address below.</p>
        </Section>

        <Section title="8. Security">
          <p>We take reasonable measures to protect your information, including encrypted connections and access controls. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>GradPath is intended for users pursuing graduate education and is not directed at children under 16. We do not knowingly collect personal information from children.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this policy from time to time. Material changes will be reflected by updating the &quot;Last updated&quot; date above. Continued use of the Service after changes constitutes acceptance of the revised policy.</p>
        </Section>

        <Section title="11. Contact">
          <p>For any questions about this Privacy Policy or your data, contact us at <a href={`mailto:${CONTACT}`} style={linkStyle}>{CONTACT}</a>.</p>
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

const ulStyle: React.CSSProperties = { margin: "12px 0", paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 };
const linkStyle: React.CSSProperties = { color: "#1B2B5E", textDecoration: "underline" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10, color: "#1B2B5E" }}>{title}</h2>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: "#27303F" }}>{children}</div>
    </section>
  );
}
