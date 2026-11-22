/**
 * The public support address.
 *
 * One source of truth for the address shown on the contact page, the privacy
 * policy, the footer and the prerendered HTML. It must be a mailbox that
 * actually receives mail: the previous address (support@jambcrash.ai) pointed at
 * a domain with no DNS record at all, so every support message bounced and the
 * page advertised a contact route that did not exist — a trust problem in its
 * own right, and a misrepresentation risk.
 *
 * Set VITE_SUPPORT_EMAIL to your real address. Until then the fallback is the
 * project owner's mailbox so the site never publishes a dead contact.
 *
 * Kept free of `import.meta.env` so the build-time prerenderer (plain Node) can
 * import the same resolver without Vite's env transform.
 */
export const SUPPORT_EMAIL_FALLBACK = 'vortexstudio.real@gmail.com';

export const resolveSupportEmail = (fromEnv?: string | null): string =>
  (fromEnv || '').trim() || SUPPORT_EMAIL_FALLBACK;
