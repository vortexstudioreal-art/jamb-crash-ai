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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching JAMB news from multiple sources...');
    
    const newsItems: NewsItem[] = [];
    
    // Source 1: Try JAMB official website
    try {
      const jambResponse = await fetch('https://www.jamb.gov.ng/news', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      if (jambResponse.ok) {
        const html = await jambResponse.text();
        console.log('JAMB HTML length:', html.length);
        
        // Try multiple parsing strategies for JAMB site
        // Strategy 1: Look for news-item or article patterns
        const newsPatterns = [
          /<div[^>]*class="[^"]*news[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
          /<article[^>]*>([\s\S]*?)<\/article>/gi,
          /<li[^>]*class="[^"]*news[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
        ];

        for (const pattern of newsPatterns) {
          const matches = html.match(pattern) || [];
          for (const match of matches.slice(0, 5)) {
            const titleMatch = match.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
            const linkMatch = match.match(/<a[^>]*href="([^"]*)"[^>]*>/i);
            const dateMatch = match.match(/(\d{1,2}[\s/-]\w+[\s/-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/i);
            const summaryMatch = match.match(/<p[^>]*>([\s\S]*?)<\/p>/i);

            const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : null;
            
            if (title && title.length > 15) {
              newsItems.push({
                title,
                link: linkMatch ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `https://www.jamb.gov.ng${linkMatch[1]}`) : 'https://www.jamb.gov.ng/news',
                date: dateMatch ? dateMatch[1] : 'Recent',
                summary: summaryMatch ? summaryMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 150) : null,
                source: 'JAMB Official',
              });
            }
          }
        }

        // Strategy 2: Look for any links with JAMB-related keywords
        if (newsItems.length === 0) {
          const linkMatches = html.match(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi) || [];
          for (const link of linkMatches.slice(0, 20)) {
            const hrefMatch = link.match(/href="([^"]*)"/i);
            const textMatch = link.match(/>([^<]+)</);
            
            if (hrefMatch && textMatch) {
              const text = textMatch[1].trim();
              const keywords = ['jamb', 'utme', 'registration', 'exam', 'candidate', 'admission', 'result', 'cbr'];
              
              if (text.length > 20 && keywords.some(k => text.toLowerCase().includes(k))) {
                newsItems.push({
                  title: text,
                  link: hrefMatch[1].startsWith('http') ? hrefMatch[1] : `https://www.jamb.gov.ng${hrefMatch[1]}`,
                  date: 'Recent',
                  summary: null,
                  source: 'JAMB Official',
                });
              }
            }
          }
        }
      }
    } catch (jambError) {
      console.error('Error fetching JAMB website:', jambError);
    }

    // Source 2: Try MySchool.ng JAMB news (more frequently updated)
    try {
      const myschoolResponse = await fetch('https://myschool.ng/news/category/jamb', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (myschoolResponse.ok) {
        const html = await myschoolResponse.text();
        console.log('MySchool HTML length:', html.length);

        // Parse MySchool news items
        const articleMatches = html.match(/<article[^>]*>([\s\S]*?)<\/article>/gi) || [];
        
        for (const article of articleMatches.slice(0, 8)) {
          const titleMatch = article.match(/<h[2-4][^>]*class="[^"]*title[^"]*"[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i) ||
                            article.match(/<h[2-4][^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i) ||
                            article.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
          const linkMatch = article.match(/<a[^>]*href="([^"]*)"[^>]*>/i);
          const dateMatch = article.match(/(\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\s/-]\w+[\s/-]\d{4})/i);
          const summaryMatch = article.match(/<p[^>]*class="[^"]*excerpt[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
                               article.match(/<p[^>]*>([\s\S]*?)<\/p>/i);

          const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : null;
          
          if (title && title.length > 10 && !newsItems.some(n => n.title === title)) {
            newsItems.push({
              title,
              link: linkMatch ? linkMatch[1] : 'https://myschool.ng/news/category/jamb',
              date: dateMatch ? dateMatch[1] : 'Recent',
              summary: summaryMatch ? summaryMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 150) : null,
              source: 'MySchool.ng',
            });
          }
        }
      }
    } catch (myschoolError) {
      console.error('Error fetching MySchool:', myschoolError);
    }

    // Source 3: Try Vanguard Education News
    try {
      const vanguardResponse = await fetch('https://www.vanguardngr.com/category/education/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (vanguardResponse.ok) {
        const html = await vanguardResponse.text();
        
        // Look for JAMB-related articles
        const articleMatches = html.match(/<article[^>]*>([\s\S]*?)<\/article>/gi) || [];
        
        for (const article of articleMatches.slice(0, 5)) {
          const titleMatch = article.match(/<h[2-4][^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i);
          const linkMatch = article.match(/<a[^>]*href="([^"]*)"[^>]*>/i);
          
          const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : null;
          
          // Only include JAMB-related news
          if (title && title.length > 15 && 
              (title.toLowerCase().includes('jamb') || 
               title.toLowerCase().includes('utme') ||
               title.toLowerCase().includes('admission'))) {
            newsItems.push({
              title,
              link: linkMatch ? linkMatch[1] : 'https://www.vanguardngr.com/category/education/',
              date: 'Recent',
              summary: null,
              source: 'Vanguard',
            });
          }
        }
      }
    } catch (vanguardError) {
      console.error('Error fetching Vanguard:', vanguardError);
    }

    // If we still have no news, add some fallback recent JAMB updates
    if (newsItems.length === 0) {
      newsItems.push({
        title: "Check JAMB Official Website for Latest Updates",
        link: "https://www.jamb.gov.ng",
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        summary: "Visit the official JAMB website for the most recent announcements and updates regarding UTME registration and examinations.",
        source: "System",
      });
    }

    console.log('Total news items extracted:', newsItems.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        items: newsItems.slice(0, 15), // Limit to 15 items
        sources: ['JAMB Official', 'MySchool.ng', 'Vanguard'],
        fetchedAt: new Date().toISOString()
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
          title: "Unable to fetch news - Check JAMB website directly",
          link: "https://www.jamb.gov.ng",
          date: "Now",
          summary: "We're having trouble fetching news. Please visit the JAMB website directly for the latest updates.",
          source: "System",
        }]
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});