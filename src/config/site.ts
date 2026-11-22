import { resolveSupportEmail } from '@/data/supportEmail';

/**
 * Site-wide app configuration derived from build-time env.
 *
 * Components read from here rather than touching `import.meta.env` directly, so
 * there is one place to see (and change) the public support address.
 */
export const SUPPORT_EMAIL = resolveSupportEmail(import.meta.env.VITE_SUPPORT_EMAIL);

/**
 * The origin the site is actually served from.
 *
 * Single source for canonicals, Open Graph URLs, JSON-LD and the share card.
 * A canonical pointing at a different domain makes the crawled page look like a
 * duplicate of a site that does not serve it, which is an AdSense review
 * problem — and `jambcrash.ai` does not resolve at all, so hardcoding it put a
 * dead domain in the structured data.
 */
export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://jamb-crash-ai.vercel.app')
).replace(/\/$/, '');

/** Hostname only, for the share card. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');

