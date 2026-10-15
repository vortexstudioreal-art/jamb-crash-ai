import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Music2, Clock } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';

const SUPPORT_EMAIL = 'support@jambcrash.ai';

const Contact = () => {
  useSeo({
    title: 'Contact Us | Jamb Crash AI',
    description: 'Contact the Jamb Crash AI team for support, feedback, school partnerships and reseller enquiries.',
    path: '/contact',
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
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Contact Us</h1>
            <p className="text-sm text-muted-foreground">
              Support, feedback, partnerships and reseller enquiries.
            </p>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold">Email support</h2>
            <p>
              For account issues, payments, bug reports and everything else, email us at{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline font-medium">
                {SUPPORT_EMAIL}
              </a>
              . Include your account email and a screenshot where possible — it halves the
              back-and-forth.
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" /> We reply within 24 hours on school days, 48 hours on weekends.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Community channels</h2>
            <ul className="list-none pl-0 space-y-3">
              <li>
                <a
                  href="https://whatsapp.com/channel/0029VbBXiJs1nozBfLioDZ1X"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-medium text-foreground hover:text-primary"
                >
                  <MessageCircle className="w-5 h-5 text-primary" /> WhatsApp Channel — study reminders and announcements
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@jamb.crash.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-medium text-foreground hover:text-primary"
                >
                  <Music2 className="w-5 h-5 text-primary" /> TikTok — quick JAMB tips and walkthroughs
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Schools and resellers</h2>
            <p>
              Want Jamb Crash AI for your school, tutorial centre or as a reseller? Email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}?subject=School%20partnership`} className="text-primary hover:underline font-medium">
                {SUPPORT_EMAIL}
              </a>{' '}
              with the subject "School partnership" and tell us about your students — we offer
              bulk access and PIN-based enrolment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Advertising enquiries</h2>
            <p>
              We show clearly labelled ads on our free tier to keep core practice free for
              students. For direct advertising enquiries, email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}?subject=Advertising`} className="text-primary hover:underline font-medium">
                {SUPPORT_EMAIL}
              </a>{' '}
              with the subject "Advertising".
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Contact;
