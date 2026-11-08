import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import {
  PUBLIC_SUBJECTS,
  SUBJECT_LABELS,
  SUBJECT_BLURBS,
} from '../src/data/publicSubjects';
import { EDITORIAL_PAGES } from '../src/data/editorialPages';

/**
 * Prerender the public, content-bearing routes to static HTML *during*
 * `vite build`.
 *
 * Why this exists: the app is a client-rendered SPA, so the raw HTML for every
 * URL was just `<div id="root"></div>`. Search engines and the AdSense review
 * crawler saw a blank page on every route - which is the direct cause of
 * "site isn't ready to show ads" / "low value content" rejections.
 *
 * The previous implementation was a separate post-build script driven by a
 * headless Chromium binary hardcoded to a Windows path, and it did not run in
 * the deployed build at all. This one:
 *   - uses no browser, so it behaves identically on Windows/Linux/CI,
 *   - runs from `vite build`, so it cannot be skipped by a deploy pipeline,
 *   - writes the real question content into the shell's #root (React replaces
 *     it on load, crawlers keep it),
 *   - generates robots.txt + sitemap.xml from the same route list and
 *     VITE_SITE_URL, so they can never point at a different domain,
 *   - FAILS the build if any page would ship without substantive content.
 *
 * Local escape hatch (no network / no .env): PRERENDER_SKIP=1.
 */

const SITE_URL_FALLBACK = 'https://jamb-crash-ai.vercel.app';

interface QuestionRow {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  year: number | null;
}

interface Page {
  route: string;
  title: string;
  description: string;
  body: string;
  /** Minimum visible characters for the page to count as substantive. */
  minChars: number;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const stripTags = (html: string): string =>
  html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ');

const wrap = (body: string): string =>
  `<main style="max-width:760px;margin:0 auto;padding:32px 20px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.6">${body}</main>`;

/**
 * PostgREST returns at most 1000 rows per request whatever `limit` asks for,
 * so the bank has to be paged. Capping this at one request (the old `limit=200`)
 * shipped 200 questions per subject while the bank held 500-1200 — the subject
 * pages were a sample of the content, not the content.
 */
const ROW_PAGE_SIZE = 1000;

async function fetchQuestions(
  supabaseUrl: string,
  supabaseKey: string,
  subject: string,
): Promise<QuestionRow[]> {
  const base =
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/jamb_questions` +
    `?select=question,option_a,option_b,option_c,option_d,correct_answer,explanation,year` +
    `&subject=eq.${encodeURIComponent(subject)}&is_ai_generated=eq.false` +
    `&order=year.desc.nullslast,id.desc`;

  const rows: QuestionRow[] = [];
  for (let offset = 0; offset < 20_000; offset += ROW_PAGE_SIZE) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    try {
      const res = await fetch(`${base}&limit=${ROW_PAGE_SIZE}&offset=${offset}`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const batch = (await res.json()) as QuestionRow[];
      rows.push(...batch);
      if (batch.length < ROW_PAGE_SIZE) break;
    } finally {
      clearTimeout(timer);
    }
  }
  return rows;
}

function questionList(rows: QuestionRow[], label: string): string {
  if (rows.length === 0) return '';
  return `<ol>${rows
    .map((row) => {
      const correct = (row.correct_answer || '').trim().toUpperCase();
      const options = [
        ['A', row.option_a],
        ['B', row.option_b],
        ['C', row.option_c],
        ['D', row.option_d],
      ]
        .map(
          ([letter, text]) =>
            `<li>${letter}. ${escapeHtml(text || '')}${letter === correct ? ' <strong>(correct answer)</strong>' : ''}</li>`,
        )
        .join('');
      return (
        `<li><p>${escapeHtml(row.question)}</p>` +
        `<ul>${options}</ul>` +
        (row.explanation ? `<p><em>Why: ${escapeHtml(row.explanation)}</em></p>` : '') +
        `<p><small>${row.year ? `${label} UTME ${row.year}` : label} practice question.</small></p></li>`
      );
    })
    .join('')}</ol>`;
}

export function prerenderPublicPages(env: Record<string, string>): Plugin {
  return {
    name: 'prerender-public-pages',
    apply: 'build',
    async closeBundle() {
      if (process.env.PRERENDER_SKIP === '1') {
        this.warn(
          'PRERENDER_SKIP=1 — public pages were NOT prerendered. Do not deploy this build for review.',
        );
        return;
      }

      const siteUrl = (env.VITE_SITE_URL || SITE_URL_FALLBACK).replace(/\/$/, '');
      const supabaseUrl = env.VITE_SUPABASE_URL;
      const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          '[prerender] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are missing.\n' +
            'The public pages cannot be generated without them, and shipping an empty shell is\n' +
            'what gets the site rejected for AdSense. Set them in .env (or the deploy env),\n' +
            'or build with PRERENDER_SKIP=1 for a local-only build.',
        );
      }

      const distDir = path.resolve(process.cwd(), 'dist');
      const shellPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(shellPath)) {
        throw new Error(`[prerender] ${shellPath} not found — run this after vite build.`);
      }
      const shell = fs.readFileSync(shellPath, 'utf8');
      if (!shell.includes('<div id="root"></div>')) {
        throw new Error(
          '[prerender] Could not find an empty <div id="root"></div> in dist/index.html.',
        );
      }

      // ---- data ------------------------------------------------------------
      const counts: Record<string, number> = {};
      const questionsBySubject: Record<string, QuestionRow[]> = {};
      const failures: string[] = [];

      for (const subject of PUBLIC_SUBJECTS) {
        try {
          const rows = await fetchQuestions(supabaseUrl, supabaseKey, subject);
          questionsBySubject[subject] = rows;
          counts[subject] = rows.length;
        } catch (err) {
          questionsBySubject[subject] = [];
          counts[subject] = 0;
          failures.push(
            `${subject}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

      if (failures.length > 0) {
        throw new Error(
          `[prerender] Could not read the question bank for ${failures.length} subject(s):\n` +
            failures.map((f) => `  - ${f}`).join('\n') +
            '\n\nAdSense review crawls the static HTML. Fix the data source (project active,\n' +
            'env keys correct, network reachable) before building for review.',
        );
      }

      // ---- pages -----------------------------------------------------------
      const subjectLinks = PUBLIC_SUBJECTS.map(
        (subject) =>
          `<li><a href="/past-questions/${subject}">${SUBJECT_LABELS[subject]}</a> — ${counts[subject]} questions. ${SUBJECT_BLURBS[subject]}</li>`,
      ).join('');

      const pages: Page[] = [
        {
          route: '/',
          title: 'JAMB UTME Past Questions, Mock Exams and Study Plans | Jamb Crash AI',
          description:
            'Practise real JAMB UTME past questions with answers and explanations, sit timed mocks, and follow a study plan that targets your weak topics. Free to start, works offline.',
          minChars: 700,
          body: wrap(`
<h1>JAMB UTME preparation built on real past questions</h1>
<p>Jamb Crash AI is a revision platform for the Nigerian JAMB UTME. It publishes real UTME past questions with the correct answers and plain-language explanations, then turns them into timed practice, mock exams and study plans that adapt to the topics you keep getting wrong.</p>
<h2>What you can do here</h2>
<ul>
  <li><strong>Browse past questions by subject</strong> — twelve UTME subjects, with answers and explanations, no account needed.</li>
  <li><strong>Take timed quizzes and full mock exams</strong> that follow the real UTME structure: English plus three subjects.</li>
  <li><strong>Get AI explanations</strong> for the questions you miss, with a daily free allowance.</li>
  <li><strong>Study offline</strong> — the app caches your material so revision does not stop when data runs out.</li>
</ul>
<h2>Past questions by subject</h2>
<ul>${subjectLinks}</ul>
<p>${total.toLocaleString()} past questions and answers are published here for free.</p>
<h2>How to use it</h2>
<ol>
  <li>Pick a subject and work through the questions. Every one shows the correct option and why.</li>
  <li>Create a free account when you want timing, score tracking and topic mastery.</li>
  <li>Move to mock exams once your accuracy is steady, then let the study plan fill the gaps.</li>
</ol>
<p><a href="/jamb-utme-guide">UTME format and scoring guide</a> · <a href="/how-we-curate-questions">How we curate these questions</a> · <a href="/about">About us</a> · <a href="/contact">Contact</a></p>
`),
        },
        {
          route: '/past-questions',
          title: 'JAMB UTME Past Questions by Subject | Jamb Crash AI',
          description:
            'Real JAMB UTME past questions with answers and explanations, organised by subject. Browse English, Mathematics, Physics, Chemistry, Biology and more — free, no sign-up needed.',
          minChars: 700,
          body: wrap(`
<h1>JAMB UTME Past Questions by Subject</h1>
<p>Real past questions with the correct option and a plain-language explanation for each one. Choose a subject below to start revising. Nothing here needs an account.</p>
<ul>${subjectLinks}</ul>
<p><strong>${total.toLocaleString()} past questions</strong> across the twelve UTME subjects. Each question shows the four options, the correct answer and a short explanation of why it is correct.</p>
<h2>Practice properly</h2>
<p>Browsing past questions is only half the work. The Jamb Crash app times you under real exam conditions, adapts to the topics you keep getting wrong, and works fully offline.</p>
<p><a href="/auth">Start practising free</a></p>
`),
        },
        ...PUBLIC_SUBJECTS.map((subject): Page => {
          const label = SUBJECT_LABELS[subject];
          const rows = questionsBySubject[subject] || [];
          return {
            route: `/past-questions/${subject}`,
            title: `${label} Past Questions and Answers | Jamb Crash AI`,
            description: `${SUBJECT_BLURBS[subject]} Real ${label} JAMB UTME past questions with the correct options and explanations. Free, no sign-up.`,
            minChars: 700,
            body: wrap(`
<p><a href="/past-questions">All subjects</a> · <a href="/">Home</a></p>
<h1>${label} Past Questions</h1>
<p>${SUBJECT_BLURBS[subject]} Real UTME past questions with answers and explanations. Try each one before reading the answer.</p>
<p><strong>${rows.length} ${label} past questions</strong> published here, newest first.</p>
<p>Transcribed from past UTME papers and checked for a single correct option before publication. <a href="/how-we-curate-questions">How we curate these questions</a>. New to the exam? Read the <a href="/jamb-utme-guide">UTME format and scoring guide</a>.</p>
${questionList(rows, label)}
<p><a href="/auth">Practise ${label} under exam conditions</a></p>
`),
          };
        }),
        // Editorial pages. Content lives in src/data/editorialPages.ts and is
        // shared with the React router, so the crawler and a visitor read the
        // same text.
        ...EDITORIAL_PAGES.map((page): Page => ({
          route: page.route,
          title: page.title,
          description: page.description,
          minChars: 900,
          body: wrap(`
<p><a href="/past-questions">Past questions</a> · <a href="/">Home</a></p>
<h1>${escapeHtml(page.heading)}</h1>
<p>${escapeHtml(page.standfirst)}</p>
${page.html}
`),
        })),
        {
          route: '/about',
          title: 'About Us | Jamb Crash AI',
          description:
            'Jamb Crash AI helps Nigerian students prepare for the JAMB UTME with real past questions, AI tutoring, offline study and score prediction.',
          minChars: 500,
          body: wrap(`
<h1>About Jamb Crash AI</h1>
<p>Jamb Crash AI is a JAMB UTME preparation platform built for Nigerian students. The foundation is a curated bank of real UTME past questions, transcribed from past papers and published free with answers and explanations, which we check and correct each exam cycle. Candidates walk into the exam hall having already met the question formats the paper uses.</p>
<h2>Why we exist</h2>
<p>Every year over a million candidates sit the UTME and most score below 200 — not for lack of effort, but for lack of structured, exam-focused preparation. Textbooks are broad, lesson notes are scattered, and data is expensive. We built Jamb Crash AI so a student with a single phone, even on an unreliable connection, can study the right things, track real progress, and predict their score before exam day.</p>
<h2>What you get</h2>
<ul>
  <li><strong>Real past questions</strong> across all UTME subjects, free to browse on this site — see <a href="/how-we-curate-questions">how the bank is curated</a>.</li>
  <li><strong>AI tutoring and explanations</strong> for every question, with diagrams for science and mathematics topics.</li>
  <li><strong>Score prediction and study plans</strong> that adapt to your weak topics and exam date.</li>
  <li><strong>Timed quizzes, mock exams and leaderboards</strong> that simulate real exam pressure.</li>
  <li><strong>Offline study packs</strong> — download once and keep studying with no data, plus novels, syllabus and lessons.</li>
</ul>
<h2>How we sustain it</h2>
<p>Core practice is free. Premium plans unlock unlimited AI explanations, full mocks and advanced predictions, and free users can earn extra access by watching ads or inviting friends. Advertising on the free tier is what keeps the lights on — it is clearly labelled and never interrupts an active quiz.</p>
<p>Questions or partnership ideas? Reach us through the <a href="/contact">contact page</a>.</p>
`),
        },
        {
          route: '/contact',
          title: 'Contact Us | Jamb Crash AI',
          description:
            'Contact the Jamb Crash AI team for support, feedback, school partnerships and reseller enquiries.',
          minChars: 500,
          body: wrap(`
<h1>Contact Us</h1>
<p>Support, feedback, partnerships and reseller enquiries.</p>
<h2>Email support</h2>
<p>For account issues, payments, bug reports and everything else, email <a href="mailto:support@jambcrash.ai">support@jambcrash.ai</a>. Include your account email and a screenshot where possible — it halves the back-and-forth. We reply within 24 hours on school days and 48 hours at weekends.</p>
<h2>Community channels</h2>
<ul>
  <li><a href="https://whatsapp.com/channel/0029VbBXiJs1nozBfLioDZ1X">WhatsApp Channel</a> — study reminders and announcements.</li>
  <li><a href="https://www.tiktok.com/@jamb.crash.ai">TikTok</a> — quick JAMB tips and walkthroughs.</li>
</ul>
<h2>Schools and resellers</h2>
<p>Want Jamb Crash AI for your school, tutorial centre or as a reseller? Email <a href="mailto:support@jambcrash.ai?subject=School%20partnership">support@jambcrash.ai</a> with the subject "School partnership" and tell us about your students — we offer bulk access and PIN-based enrolment.</p>
<h2>Advertising enquiries</h2>
<p>We show clearly labelled ads on our free tier to keep core practice free for students. For direct advertising enquiries, email <a href="mailto:support@jambcrash.ai?subject=Advertising">support@jambcrash.ai</a> with the subject "Advertising".</p>
`),
        },
        {
          route: '/terms',
          title: 'Terms of Service | Jamb Crash AI',
          description:
            'Terms of service for Jamb Crash AI, covering accounts, subscription plans, acceptable use of the JAMB practice questions, and the AI explanation allowance.',
          minChars: 500,
          body: wrap(`
<h1>Terms of Service</h1>
<p>Last updated: October 2026. By creating an account or using Jamb Crash AI you agree to these terms.</p>
<h2>What the service is</h2>
<p>Jamb Crash AI is a JAMB UTME preparation tool: practice questions, timed mock exams, topic mastery tracking, study materials and AI-assisted explanations. It is a revision aid, not an official JAMB product, and it is not affiliated with the Joint Admissions and Matriculation Board.</p>
<h2>Accounts</h2>
<p>You must provide an accurate email address and keep your password confidential. You are responsible for activity under your account. One person per account — sharing credentials is not permitted, and accounts must not be created with automated tools.</p>
<h2>Subscription plans</h2>
<p>Some features require a paid plan. Prices are shown in Nigerian Naira at checkout and charged through our payment processor; access begins once payment is confirmed, for the duration stated at purchase. Free tiers include a daily allowance of AI explanations that resets each day, and watching a rewarded ad grants additional uses where available. Subscriptions are non-refundable except where required by Nigerian consumer law.</p>
<h2>Acceptable use</h2>
<p>Use the service for your own study and revision. Do not scrape, bulk-download or resell the question bank; do not attempt to bypass usage limits, paywalls or trial limits; do not upload content you do not have the right to share.</p>
<h2>Content and accuracy</h2>
<p>Past questions are reproduced from publicly available UTME past papers for revision purposes. Practice questions, explanations and AI output may occasionally contain errors — always confirm key facts against the official JAMB syllabus and past papers. AI-generated content is study support, not professional, academic or examination advice.</p>
<h2>Availability</h2>
<p>The app is designed to work offline after an initial load, but a network connection is required for sign-in, payments and live AI features. We do not guarantee uninterrupted availability.</p>
<p>Questions about these terms can be sent through the <a href="/contact">contact page</a>.</p>
`),
        },
        {
          route: '/privacy',
          title: 'Privacy Policy | Jamb Crash AI',
          description:
            'How Jamb Crash AI collects, uses and protects your personal data, including the cookies used by Google AdSense to serve ads to free users.',
          minChars: 500,
          body: wrap(`
<h1>Privacy Policy</h1>
<p>Jamb Crash AI is committed to protecting your privacy. This policy explains what we collect, how we use it, and the choices you have.</p>
<h2>Information we collect</h2>
<ul>
  <li><strong>Account data:</strong> your email address and authentication details.</li>
  <li><strong>Study data:</strong> selected subjects, quiz attempts, scores, streaks and time spent studying.</li>
  <li><strong>Payment data:</strong> transaction reference, plan and amount (processed by Paystack — we never store card details).</li>
  <li><strong>Device data:</strong> basic information such as browser type and offline cache status.</li>
</ul>
<h2>How we use your data</h2>
<p>To personalise your study experience and predict your JAMB score, sync progress across devices, enable offline mode, send important service updates, and improve question quality. We do not sell your personal data.</p>
<h2>Data sharing</h2>
<p>We share limited data only with providers who help us run the app — Supabase for storage, Paystack for payments, Google for advertising, and AI providers for study tips. These providers are contractually bound to protect your data.</p>
<h2>Cookies and advertising</h2>
<p>Free users see ads served by Google AdSense. Google and its partners use cookies to serve ads based on your prior visits to this site and other sites on the internet. You can opt out of personalised advertising in <a href="https://www.google.com/settings/ads">Google Ads Settings</a>, or opt out of third-party vendors' use of cookies for personalised advertising at <a href="https://www.aboutads.info/choices/">aboutads.info</a>. Paying users are never shown ads. You can block or delete cookies in your browser settings at any time; the app still works without them.</p>
<h2>Data storage and security</h2>
<p>Your data is stored on Supabase with row-level security enforced. Payments are processed by Paystack over encrypted connections. Passwords are hashed and never stored in plain text.</p>
<h2>Your rights</h2>
<p>You can access, update or delete your account data from Settings, request a full export by emailing us, and withdraw consent for optional processing at any time.</p>
<h2>Contact</h2>
<p>Questions about privacy? Email <a href="mailto:support@jambcrash.ai">support@jambcrash.ai</a>.</p>
`),
        },
      ];

      // ---- write -----------------------------------------------------------
      const written: string[] = [];
      const thin: string[] = [];

      for (const page of pages) {
        const url = `${siteUrl}${page.route === '/' ? '/' : page.route}`;
        let html = shell
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
          .replace(
            /<meta name="description"[^>]*>/,
            `<meta name="description" content="${escapeHtml(page.description)}" />\n    <meta name="robots" content="index, follow" />`,
          )
          .replace(
            /<meta property="og:title"[^>]*>/,
            `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
          )
          .replace(
            /<meta property="og:description"[^>]*>/,
            `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
          )
          .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
          .replace(
            /<meta name="twitter:title"[^>]*>/,
            `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
          )
          .replace(
            /<meta name="twitter:description"[^>]*>/,
            `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
          )
          .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`)
          .replace('<div id="root"></div>', `<div id="root">${page.body}</div>`);

        const visibleChars = stripTags(page.body).replace(/\s+/g, ' ').trim().length;
        if (visibleChars < page.minChars) {
          thin.push(`${page.route} (${visibleChars} visible chars, needs ${page.minChars})`);
        }

        const outPath =
          page.route === '/'
            ? path.join(distDir, 'index.html')
            : path.join(distDir, page.route.replace(/^\//, ''), 'index.html');
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, html, 'utf8');
        written.push(`${page.route} (${visibleChars} chars)`);
      }

      // robots.txt + sitemap.xml come from the same route list and origin as
      // the pages above, so they can never point at a different domain.
      const today = new Date().toISOString().slice(0, 10);
      fs.writeFileSync(
        path.join(distDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
        'utf8',
      );
      fs.writeFileSync(
        path.join(distDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          pages
            .map(
              (page) =>
                `  <url>\n    <loc>${siteUrl}${page.route === '/' ? '/' : page.route}</loc>\n` +
                `    <lastmod>${today}</lastmod>\n` +
                `    <changefreq>${page.route.startsWith('/past-questions') ? 'weekly' : 'monthly'}</changefreq>\n` +
                `    <priority>${page.route === '/' ? '1.0' : page.route === '/past-questions' ? '0.9' : '0.7'}</priority>\n  </url>`,
            )
            .join('\n') +
          `\n</urlset>\n`,
        'utf8',
      );

      for (const line of written) {
        this.info(`[prerender] wrote ${line}`);
      }
      this.info(`[prerender] total questions rendered: ${total}`);

      if (thin.length > 0) {
        throw new Error(
          `[prerender] ${thin.length} page(s) would ship with too little content:\n` +
            thin.map((t) => `  - ${t}`).join('\n') +
            '\n\nAdSense reviews the static HTML. Refusing to emit an empty shell — fix the\n' +
            'content for those routes before deploying.',
        );
      }
    },
  };
}
