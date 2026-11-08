/**
 * Editorial pages, shared by the React router and the build-time prerenderer.
 *
 * AdSense rejected the site for "low value content" and asked for evidence of
 * "ongoing curation and structural maintenance". A list of questions alone does
 * not show that, so these pages document where the questions come from, how
 * they are checked, how errors are corrected, and give students material that
 * is useful on its own rather than a doorway to a login wall.
 *
 * One source of truth: the prerendered HTML and the client-rendered page cannot
 * drift apart because both read these strings.
 */

export interface EditorialPage {
  /** Route path, e.g. "/jamb-utme-guide". */
  route: string;
  title: string;
  description: string;
  heading: string;
  /** Standfirst paragraph, rendered above the body. */
  standfirst: string;
  /** Body HTML. */
  html: string;
}

const GUIDE_HTML = `
<h2>What the UTME actually is</h2>
<p>The Unified Tertiary Matriculation Examination (UTME) is the computer-based entrance test set by the Joint Admissions and Matriculation Board. Every candidate sits four subjects: English Language, which is compulsory, plus three subjects chosen to match the course they are applying for. The test is taken on a computer at an accredited centre, and the result feeds into that year's admission cut-offs.</p>

<h2>Paper structure</h2>
<table>
  <thead>
    <tr><th>Component</th><th>Questions</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td>English Language</td><td>60</td><td>Comprehension, lexis and structure, oral forms</td></tr>
    <tr><td>Subject 2</td><td>40</td><td>Chosen by the candidate</td></tr>
    <tr><td>Subject 3</td><td>40</td><td>Chosen by the candidate</td></tr>
    <tr><td>Subject 4</td><td>40</td><td>Chosen by the candidate</td></tr>
    <tr><td><strong>Total</strong></td><td><strong>180</strong></td><td>Two hours on the clock</td></tr>
  </tbody>
</table>
<p>That works out to roughly forty seconds per question. Timing, not knowledge, is where most candidates lose marks: the questions are usually familiar, but the clock is not.</p>

<h2>How the score works</h2>
<p>Each of the four subjects is marked out of 100, giving an aggregate out of 400. There is no negative marking, so a blank answer is never better than an educated guess — but a guess made in the last ten seconds of the exam is usually a guess made on the wrong question. Learn to abandon a question that is eating your time and come back to it.</p>

<h2>Using past questions properly</h2>
<p>Reading past questions is passive. Working them under conditions is what moves a score. A method that works:</p>
<ol>
  <li><strong>First pass, untimed.</strong> Work a set of questions with no clock. Mark every question you were unsure about, even the ones you got right.</li>
  <li><strong>Log the misses by topic.</strong> Write down the topic, not the question. Six misses in "electrolysis" is a topic problem, not a bad-luck problem.</li>
  <li><strong>Study the topic, then re-test.</strong> Close the loop within a few days, using fresh questions on the same topic.</li>
  <li><strong>Timed sets.</strong> Once accuracy is steady, add the clock — thirty questions in twenty minutes, then forty in twenty-five.</li>
  <li><strong>Full mocks near the exam.</strong> Four subjects, two hours, no pauses. This is the only way to rehearse the fatigue of question 150.</li>
</ol>

<h2>What you will find on this site</h2>
<p>Every subject below has a free, browsable set of past questions with the correct option marked and an explanation where one exists. Nothing is behind an account. If you want the questions timed, scored and tracked by topic, that is what the app adds — but the raw material is here, open, and it is enough to start.</p>
<p><a href="/past-questions">Browse past questions by subject</a> · <a href="/how-we-curate-questions">How we curate these questions</a></p>
`;

const CURATION_HTML = `
<h2>Where the questions come from</h2>
<p>The questions published on the public pages are transcribed from publicly available UTME past papers. They are not invented, paraphrased or machine-generated. Each item is typed from the paper, then checked against the source before it enters the bank, because transcription errors — a dropped "not", a swapped option, a mislabelled answer — are the most common way a past-question site becomes useless.</p>

<h2>What we check before publishing</h2>
<ul>
  <li><strong>Four options, one answer.</strong> Every question must have exactly four answer options and exactly one of them must be correct. An item that fails this is held back rather than published.</li>
  <li><strong>The answer must exist.</strong> A question whose recorded correct option has no matching option text is rejected. This sounds obvious; it is the failure mode that produces unanswerable questions on scraped sites.</li>
  <li><strong>Duplicates are dropped.</strong> The same question often appears across several papers. Only one copy is published per subject.</li>
  <li><strong>Text is cleaned, not rewritten.</strong> Encoding artefacts and stray markup are repaired. The wording of the question itself is left alone, because the wording is the exam.</li>
  <li><strong>Explanations are added where we have them.</strong> Where no explanation exists, the answer is still shown. We would rather publish a correct answer with no commentary than a confident guess dressed up as an explanation.</li>
</ul>

<h2>What is not published here</h2>
<p>Practice questions written for the app are kept inside the app. The public pages carry past-paper questions only, which is what makes them worth reading and worth citing.</p>

<h2>Corrections</h2>
<p>Question banks go wrong. A wrong answer key is worse than no answer key, because students memorise it. If you find a question with a wrong answer, a garbled option or a duplicate, email <a href="mailto:support@jambcrash.ai?subject=Question%20correction">support@jambcrash.ai</a> with the subject and the question text. Corrections are applied to the bank, and the public page regenerates from the corrected bank on the next deploy.</p>

<h2>How the bank is maintained</h2>
<p>The public pages are generated from the live question bank at build time, not hand-edited, so a correction in the bank cannot leave a stale copy on the site. Questions are reviewed each exam cycle, and new papers are added as they become available. Counts shown on each subject page come from the bank itself rather than a marketing figure.</p>

<h2>Independence</h2>
<p>Jamb Crash AI is not affiliated with, endorsed by or connected to the Joint Admissions and Matriculation Board. Past questions are reproduced for revision purposes. Always confirm syllabus details against official JAMB publications.</p>
<p><a href="/past-questions">Browse the questions</a> · <a href="/contact">Contact us</a></p>
`;

export const EDITORIAL_PAGES: EditorialPage[] = [
  {
    route: '/jamb-utme-guide',
    title: 'JAMB UTME Format, Scoring and How to Use Past Questions | Jamb Crash AI',
    description:
      'How the JAMB UTME is structured: 180 questions across four subjects in two hours, marked out of 400. Plus a practical method for working past questions so the score actually moves.',
    heading: 'JAMB UTME: format, scoring and how to use past questions',
    standfirst:
      'The exam is four subjects and two hours. Most candidates know their subjects and still lose marks to the clock. Here is how the paper is built, how it is scored, and a method for using past questions that does more than reading them.',
    html: GUIDE_HTML,
  },
  {
    route: '/how-we-curate-questions',
    title: 'How We Curate Our JAMB Past Questions | Jamb Crash AI',
    description:
      'Where our UTME past questions come from, the checks every question passes before publication, how corrections are handled, and how the question bank is maintained between exam cycles.',
    heading: 'How we curate these past questions',
    standfirst:
      'A past-question bank is only worth the checks behind it. This page documents where the questions come from, what gets rejected, and how a correction reaches the published page.',
    html: CURATION_HTML,
  },
];
