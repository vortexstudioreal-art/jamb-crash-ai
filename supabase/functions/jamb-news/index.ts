const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  title: string;
  link: string | null;
  date: string;
  summary: string | null;
  source: string;
}

// Publisher RSS feeds (reliable from edge functions — unlike scraping
// news sites directly, which bot-block datacenter IPs).
const FEEDS = [
  'https://www.bing.com/news/search?format=rss&q=JAMB+UTME+Nigeria',
  'https://punchng.com/feed/',
  'https://www.vanguardngr.com/feed/',
];

const PRIMARY = ['jamb', 'utme', 'post-utme', 'admission'];
const SECONDARY = ['education', 'university', 'polytechnic', 'school', 'exam', 'student', 'waec', 'neco'];

const tag = (xml: string, name: string): string | null => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : null;
};

const fmtDate = (pubDate: string | null): string => {
  if (!pubDate) return 'Recent';
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return 'Recent';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const newsItems: NewsItem[] = [];
    const seen = new Set<string>();

    for (const feed of FEEDS) {
      try {
        const res = await fetch(feed, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
          },
        });
        if (!res.ok) continue;
        const xml = await res.text();
        if (!xml.includes('<item>')) continue;
        const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
        const sourceName = feed.includes('bing.com')
          ? 'Bing News'
          : feed.includes('punch')
            ? 'Punch'
            : 'Vanguard';
        const primary: NewsItem[] = [];
        const secondary: NewsItem[] = [];
        for (const item of items) {
          const title = tag(item, 'title');
          if (!title || title.length < 15 || seen.has(title)) continue;
          seen.add(title);
          const lower = title.toLowerCase();
          const entry: NewsItem = {
            title,
            link: tag(item, 'link'),
            date: fmtDate(tag(item, 'pubDate')),
            summary: null,
            source: sourceName,
          };
          if (PRIMARY.some((k) => lower.includes(k))) primary.push(entry);
          else if (SECONDARY.some((k) => lower.includes(k))) secondary.push(entry);
        }
        // JAMB-specific first, education filler after so the tab is
        // never empty in quiet weeks.
        for (const entry of [...primary, ...secondary]) {
          newsItems.push(entry);
          if (newsItems.length >= 15) break;
        }
      } catch (feedErr) {
        console.error('Feed error:', feed, feedErr);
      }
      if (newsItems.length >= 15) break;
    }

    if (newsItems.length === 0) {
      newsItems.push({
        title: 'Check JAMB Official Website for Latest Updates',
        link: 'https://www.jamb.gov.ng',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        summary: 'Visit the official JAMB website for the most recent announcements and updates regarding UTME registration and examinations.',
        source: 'System',
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        items: newsItems.slice(0, 15),
        fetchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching JAMB news:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        items: [{
          title: 'Unable to fetch news - Check JAMB website directly',
          link: 'https://www.jamb.gov.ng',
          date: 'Now',
          summary: "We're having trouble fetching news. Please visit the JAMB website directly for the latest updates.",
          source: 'System',
        }],
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
