import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { EDITORIAL_PAGES, type EditorialPage as EditorialPageData } from '@/data/editorialPages';

/**
 * Renders one of the editorial pages defined in src/data/editorialPages.ts.
 *
 * The same strings are written into the static HTML at build time by
 * scripts/prerender-public-pages.ts, so a crawler sees the full text and a
 * visitor navigating inside the app sees exactly the same thing.
 */
const EditorialPage = ({ route }: { route: string }) => {
  const page: EditorialPageData | undefined = EDITORIAL_PAGES.find((p) => p.route === route);

  useSeo({
    title: page?.title ?? 'Jamb Crash AI',
    description: page?.description ?? '',
    path: route,
  });

  if (!page) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/90 sticky top-0 z-40 backdrop-blur">
        <div className="container max-w-3xl py-4 px-4 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <Link to="/past-questions" className="text-sm font-medium hover:text-primary">
            Past questions
          </Link>
        </div>
      </header>

      <main className="container max-w-3xl px-4 py-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{page.heading}</h1>
        <p className="mt-3 text-muted-foreground">{page.standfirst}</p>
        <div
          className="prose prose-neutral dark:prose-invert mt-8 max-w-none prose-table:text-sm prose-headings:scroll-mt-20"
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      </main>
    </div>
  );
};

export default EditorialPage;
