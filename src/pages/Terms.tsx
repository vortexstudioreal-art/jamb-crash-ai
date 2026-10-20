import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="text-xl font-semibold">{title}</h2>
    <div className="mt-2 space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
  </section>
);

const Terms = () => {
  useSeo({
    title: 'Terms of Service | Jamb Crash AI',
    description:
      'Terms of service for Jamb Crash AI, covering accounts, subscription plans, acceptable use of the JAMB practice questions, and the AI explanation allowance.',
    path: '/terms',
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-3xl py-10 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: October 2026</p>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <Section title="1. These terms">
            <p>
              By creating an account or using Jamb Crash AI you agree to these terms. If you do
              not agree, please do not use the service. We may update these terms, and continued
              use after an update means you accept the revised version.
            </p>
          </Section>

          <Section title="2. What the service is">
            <p>
              Jamb Crash AI is a JAMB UTME preparation tool. It provides practice questions,
              timed mock exams, topic mastery tracking, study materials, and AI-assisted
              explanations. It is a revision aid, not an official JAMB product, and it is not
              affiliated with the Joint Admissions and Matriculation Board.
            </p>
          </Section>

          <Section title="3. Accounts">
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide an accurate email address and keep your password confidential.</li>
              <li>You are responsible for activity under your account.</li>
              <li>One person per account. Sharing login credentials is not permitted.</li>
              <li>You must not create accounts with automated tools or scripts.</li>
            </ul>
          </Section>

          <Section title="4. Subscription plans">
            <p>
              Some features require a paid plan. Prices are shown in Nigerian Naira at checkout
              and are charged through our payment processor. Plans grant access for the duration
              stated at purchase.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access begins once payment is confirmed by our payment processor.</li>
              <li>Free tiers include a daily allowance of AI explanations, which resets each day.</li>
              <li>Watching a rewarded ad grants additional uses where that option is available.</li>
              <li>Subscriptions are non-refundable except where required by Nigerian consumer law.</li>
            </ul>
          </Section>

          <Section title="5. Acceptable use">
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the service for your own study and revision.</li>
              <li>Do not scrape, bulk-download, or resell the question bank.</li>
              <li>Do not attempt to bypass usage limits, paywalls, or trial limits.</li>
              <li>Do not upload content you do not have the right to share.</li>
            </ul>
          </Section>

          <Section title="6. Content and accuracy">
            <p>
              Past questions are reproduced from publicly available UTME past papers for revision
              purposes. Practice questions, explanations and AI output may occasionally contain
              errors. Always confirm key facts against the official JAMB syllabus and past papers.
            </p>
            <p>
              AI-generated content is provided for study support and is not professional,
              academic or examination advice.
            </p>
          </Section>

          <Section title="7. Availability">
            <p>
              The app is designed to work offline after an initial load, but a network connection
              is required for sign-in, payments, and live AI features. We do not guarantee
              uninterrupted availability.
            </p>
          </Section>

          <Section title="8. Contact">
            <p>
              Questions about these terms can be sent through our{' '}
              <Link to="/contact" className="text-primary underline">contact page</Link>.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
