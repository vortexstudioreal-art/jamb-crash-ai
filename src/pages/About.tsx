import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Target, BookOpen, Brain, Trophy, Users } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';

const About = () => {
  useSeo({
    title: 'About Us | Jamb Crash AI',
    description: 'Jamb Crash AI helps Nigerian students pass the JAMB UTME with real past questions, AI tutoring, offline study, and score prediction.',
    path: '/about',
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
            <h1 className="text-3xl font-bold">About Jamb Crash AI</h1>
            <p className="text-sm text-muted-foreground">
              Built for Nigerian students, by people who remember the pressure of UTME morning.
            </p>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold">What we do</h2>
            <p>
              Jamb Crash AI is a JAMB UTME preparation platform. We combine thousands of real
              UTME past questions with AI-generated practice in the exact JAMB style, so students
              walk into the exam hall having already met every question format the exam can throw
              at them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Why we exist</h2>
            <p>
              Every year, over a million candidates sit the UTME and most score below 200 — not
              for lack of effort, but for lack of structured, exam-focused preparation. Textbooks
              are broad, lesson notes are scattered, and data is expensive. We built Jamb Crash AI
              so a student with a single phone — even with unreliable internet — can study the
              right things, track real progress, and predict their score before exam day.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">What you get</h2>
            <ul className="list-none pl-0 space-y-3">
              <li className="flex gap-3">
                <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Real past questions</strong> across all UTME subjects, plus AI practice questions written to JAMB standard.</span>
              </li>
              <li className="flex gap-3">
                <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span><strong>AI tutoring and explanations</strong> for every question, with diagrams for science and mathematics topics.</span>
              </li>
              <li className="flex gap-3">
                <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Score prediction and study plans</strong> that adapt to your weak topics and exam date.</span>
              </li>
              <li className="flex gap-3">
                <Trophy className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Timed quizzes, mock exams and leaderboards</strong> that simulate real exam pressure.</span>
              </li>
              <li className="flex gap-3">
                <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Offline study packs</strong> — download once and keep studying with no data, plus novels, syllabus and lessons.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">How we sustain it</h2>
            <p>
              Core practice is free. Premium plans (Basic, ACE and SCHOLAR) unlock unlimited AI
              explanations, full mocks and advanced predictions, and free users can earn extra
              access by watching ads or inviting friends. Advertising on the free tier is what
              keeps the lights on — it is clearly labelled and never interrupts an active quiz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Talk to us</h2>
            <p>
              Questions, feedback or partnership ideas? Reach us any time via our{' '}
              <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
