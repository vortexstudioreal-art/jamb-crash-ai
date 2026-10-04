import { useEffect, useRef } from 'react';

const SITE_URL = 'https://jambcrash.ai';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const SITE_NAME = 'Jamb Crash AI';

interface SeoConfig {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
}

const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setCanonical = (url: string) => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
};

const setJsonLd = (data: object | object[]) => {
  document.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove());
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-seo-jsonld', '');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

export const useSeo = ({ title, description, path, image = DEFAULT_IMAGE, noindex = false, jsonLd }: SeoConfig) => {
  const appliedRef = useRef<string>('');

  useEffect(() => {
    const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : '';
    const key = `${title}|${description}|${path}|${image}|${noindex}|${jsonLdKey}`;
    if (appliedRef.current === key) return;
    appliedRef.current = key;

    const url = `${SITE_URL}${path}`;
    document.title = title;
    upsertMeta('name', 'description', description);
    setCanonical(url);

    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:type', 'website');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);

    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    if (jsonLd) setJsonLd(jsonLd);

    return () => {
      document.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove());
    };
  }, [title, description, path, image, noindex, jsonLd]);
};
