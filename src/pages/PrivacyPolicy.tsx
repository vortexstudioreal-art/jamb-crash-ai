import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';

const PrivacyPolicy = () => {
  useSeo({
    title: 'Privacy Policy | Jamb Crash AI',
    description: 'How Jamb Crash AI collects, uses, and protects your personal data while you prepare for JAMB with our AI-powered study platform.',
    path: '/privacy',
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
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p>
              Jamb Crash AI ("we", "us", "our") is committed to protecting your privacy.
              This policy explains what information we collect when you use our app and website,
              how we use it, and the choices you have.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account data:</strong> your email address and authentication details.</li>
              <li><strong>Study data:</strong> selected subjects, quiz attempts, scores, streaks, and time spent studying.</li>
              <li><strong>Payment data:</strong> transaction reference, plan, and amount (processed by Paystack — we never store card details).</li>
              <li><strong>Device data:</strong> basic information such as browser type and offline cache status to improve reliability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To personalize your study experience and predict your JAMB score.</li>
              <li>To sync your progress across devices and enable offline mode.</li>
              <li>To send you important service updates (never spam).</li>
              <li>To improve our AI tutoring and question quality.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Data Sharing</h2>
            <p>
              We do not sell your personal data. We share limited data only with trusted
              service providers who help us run the app (e.g. Supabase for storage,
              Paystack for payments, and AI providers for study tips). These providers are
              contractually bound to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Data Storage &amp; Security</h2>
            <p>
              Your data is stored securely on Supabase with row-level security enforced.
              Payments are processed by Paystack over encrypted connections. Passwords are
              hashed and never stored in plain text.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Offline Mode</h2>
            <p>
              When you enable offline mode, some of your study content and session data are
              cached on your device so you can continue learning without internet.
              You can clear this cache anytime from Settings → Clear Offline Cache.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access, update, or delete your account data at any time from Settings.</li>
              <li>Request a full data export by emailing us.</li>
              <li>Withdraw consent for optional processing at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Children's Privacy</h2>
            <p>
              Our app is intended for students preparing for JAMB. If you are under 13,
              please use the app with the consent of a parent or guardian.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be
              announced inside the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Contact Us</h2>
            <p>
              Questions about privacy? Email us at{' '}
              <a href="mailto:support@jambcrash.ai" className="text-primary hover:underline">
                support@jambcrash.ai
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;