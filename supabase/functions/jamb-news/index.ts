const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  title: string;
  link: string | null;
  date: string;
  summary: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching JAMB news from official website...');
    
    // Fetch the JAMB news page
    const response = await fetch('https://www.jamb.gov.ng/news', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch JAMB website:', response.status);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch news from JAMB website',
          items: [] 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    console.log('Received HTML response, length:', html.length);

    // Parse the HTML to extract news items
    const newsItems: NewsItem[] = [];

    // Match news items from the blog list - looking for typical blog patterns
    // The JAMB site uses bloglist-small class for news listings
    const blogListMatch = html.match(/<ul[^>]*class="[^"]*bloglist-small[^"]*"[^>]*>([\s\S]*?)<\/ul>/gi);
    
    if (blogListMatch) {
      for (const list of blogListMatch) {
        // Extract individual list items
        const listItems = list.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
        
        for (const item of listItems) {
          // Extract link and title
          const linkMatch = item.match(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
          const titleMatch = item.match(/<h\d[^>]*>([\s\S]*?)<\/h\d>/i);
          const dateMatch = item.match(/<span[^>]*class="[^"]*info[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
          const summaryMatch = item.match(/<p[^>]*>([\s\S]*?)<\/p>/i);

          const title = titleMatch 
            ? titleMatch[1].replace(/<[^>]*>/g, '').trim()
            : (linkMatch ? linkMatch[2].replace(/<[^>]*>/g, '').trim() : null);

          if (title) {
            newsItems.push({
              title: title,
              link: linkMatch ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `https://www.jamb.gov.ng${linkMatch[1]}`) : null,
              date: dateMatch ? dateMatch[1].replace(/<[^>]*>/g, '').trim() : 'Recent',
              summary: summaryMatch ? summaryMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 200) : null,
            });
          }
        }
      }
    }

    // Also try to extract from other common patterns if bloglist-small doesn't work
    if (newsItems.length === 0) {
      // Try matching article/news cards
      const articleMatches = html.match(/<article[^>]*>([\s\S]*?)<\/article>/gi) || [];
      
      for (const article of articleMatches.slice(0, 10)) {
        const linkMatch = article.match(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
        const titleMatch = article.match(/<h\d[^>]*>([\s\S]*?)<\/h\d>/i);
        const dateMatch = article.match(/(\w+\s*,?\s*\d{4})/i);
        const summaryMatch = article.match(/<p[^>]*>([\s\S]*?)<\/p>/i);

        const title = titleMatch 
          ? titleMatch[1].replace(/<[^>]*>/g, '').trim()
          : (linkMatch ? linkMatch[2].replace(/<[^>]*>/g, '').trim() : null);

        if (title && title.length > 10) {
          newsItems.push({
            title: title,
            link: linkMatch ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `https://www.jamb.gov.ng${linkMatch[1]}`) : null,
            date: dateMatch ? dateMatch[1] : 'Recent',
            summary: summaryMatch ? summaryMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 200) : null,
          });
        }
      }
    }

    // Fallback: Try to find any news-like content with h2/h3 headers that have links
    if (newsItems.length === 0) {
      const headerMatches = html.match(/<h[23][^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>\s*<\/h[23]>/gi) || [];
      
      for (const header of headerMatches.slice(0, 10)) {
        const match = header.match(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
        if (match) {
          const title = match[2].replace(/<[^>]*>/g, '').trim();
          if (title.length > 10) {
            newsItems.push({
              title: title,
              link: match[1].startsWith('http') ? match[1] : `https://www.jamb.gov.ng${match[1]}`,
              date: 'Recent',
              summary: null,
            });
          }
        }
      }
    }

    console.log('Extracted news items:', newsItems.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        items: newsItems,
        source: 'https://www.jamb.gov.ng/news',
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
        items: [] 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
