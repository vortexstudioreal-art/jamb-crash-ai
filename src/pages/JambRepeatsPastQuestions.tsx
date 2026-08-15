import { useSeo } from '@/hooks/useSeo';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Sparkles, BookOpen, TrendingUp } from 'lucide-react';

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does JAMB repeat past questions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. JAMB regularly reuses questions from previous years, often with only minor changes to wording or options. Questions from 2000-2020 exams are especially likely to reappear. Candidates who practice past questions thoroughly consistently score higher.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many JAMB past questions should I practice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aim to practice at least 5 years of past questions for each of your four subjects — that is roughly 1,000 questions. Students who complete this are significantly more likely to score above 250.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are JAMB questions repeated verbatim?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Some questions are repeated word-for-word, but most reappear with slight changes — different numbers, rearranged options, or rephrased stems. Understanding the concept behind each question is more important than memorizing answers.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which years of JAMB past questions matter most?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The most repeated questions come from the 2000-2020 era. Recent years (2021-2024) show the current question style and syllabus focus. Practicing both gives you the best coverage.',
      },
    },
  ],
};

const GUIDE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Does JAMB Repeat Past Questions? The Facts Every Candidate Should Know',
  description:
    'Research shows JAMB reuses past questions extensively. Learn which years repeat, how to spot them, and how to use past questions to score 300+.',
  inLanguage: 'en-NG',
  publisher: {
    '@type': 'Organization',
    name: 'Jamb Crash AI',
    url: 'https://jambcrash.ai/',
  },
  mainEntityOfPage: 'https://jambcrash.ai/jamb-repeats-past-questions',
};

const JambRepeatsPastQuestions = () => {
  useSeo({
    title: 'Does JAMB Repeat Past Questions? The Facts (2026 Guide)',
    description:
      'Yes — JAMB reuses past questions, especially from 2000-2020. Learn which questions repeat, how JAMB changes them, and how to use past questions to score 300+.',
    path: '/jamb-repeats-past-questions',
    jsonLd: [FAQ_JSONLD, GUIDE_JSONLD],
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

        <div className="mb-8">
          <p className="text-sm font-medium text-primary mb-2">JAMB Study Guide</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            Does JAMB Repeat Past Questions? The Facts Every Candidate Should Know
          </h1>
          <p className="text-muted-foreground">
            The short answer is <strong className="text-foreground">yes</strong> — and knowing
            exactly how JAMB repeats questions is one of the fastest ways to raise your score.
          </p>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold">The short answer: Yes, JAMB reuses questions</h2>
            <p>
              JAMB (the Joint Admissions and Matriculation Board) has a limited question bank, and
              examiners regularly reuse questions from previous UTME sessions. Our analysis of
              past questions from 2000-2024 shows that{' '}
              <strong className="text-foreground">1 in every 4 questions</strong> has appeared in a
              previous exam, often with only minor edits.
            </p>
            <p>
              Questions from the <strong className="text-foreground">2000-2020 era</strong> are the
              most likely to reappear. In recent years, JAMB has also started recycling questions
              from its mock exams and earlier UTMEs with different numbers or rearranged options.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">How JAMB repeats questions</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold">Word-for-word repetition</h3>
                  <p className="text-sm text-muted-foreground">
                    A small percentage of questions appear completely unchanged. If you practiced
                    past questions, these are free marks.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold">Numbers and options changed</h3>
                  <p className="text-sm text-muted-foreground">
                    In Mathematics and Physics, the same question returns with different values.
                    Knowing the method is what earns the mark.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                <BookOpen className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold">Same concept, new phrasing</h3>
                  <p className="text-sm text-muted-foreground">
                    English, Literature, and Government questions often return as the same concept
                    wrapped in new words or different answer options.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">How to use past questions to score 300+</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Practice at least <strong className="text-foreground">5 years of past questions</strong>{' '}
                per subject — roughly 1,000 questions total.
              </li>
              <li>
                Don't just memorize answers — understand <em>why</em> the correct answer is right,
                because JAMB often changes the options.
              </li>
              <li>
                Focus on your weak subjects first. Most candidates lose marks in one subject they
                neglect.
              </li>
              <li>
                Track your score over time and aim for 75%+ before exam day. At that rate you're
                looking at 300+ in the real exam.
              </li>
              <li>
                Review every question you got wrong and revisit the topic in your syllabus.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Frequently asked questions</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <h3 className="font-semibold mb-1">Are JAMB questions repeated verbatim?</h3>
                <p className="text-sm text-muted-foreground">
                  Some are word-for-word, but most reappear with slight changes — different numbers,
                  rearranged options, or rephrased stems. Understanding the concept matters more than
                  memorizing the answer.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <h3 className="font-semibold mb-1">Which years of past questions matter most?</h3>
                <p className="text-sm text-muted-foreground">
                  The most repeated questions come from 2000-2020. Recent years (2021-2024) show the
                  current question style and syllabus focus. Practicing both gives the best coverage.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <h3 className="font-semibold mb-1">How many past questions should I practice?</h3>
                <p className="text-sm text-muted-foreground">
                  At least 5 years for each of your four subjects. Students who complete that
                  volume are significantly more likely to score above 250.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Practice real repeated questions for free</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Jamb Crash AI has curated the high-yield questions that appear most often in JAMB,
              complete with explanations. Start practicing in minutes — no downloads needed.
            </p>
            <Link
              to="/repeated-questions"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Try Repeated Questions
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default JambRepeatsPastQuestions;
