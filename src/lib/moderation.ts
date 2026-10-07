// Client-side profanity gate for the study board.
// Keeps the board civil at post time; admins can still delete anything
// that slips through. Not a substitute for moderation — determined
// bypassers (l33t-speak etc.) get caught by admin review.

const BLOCKED = [
  // sexual / explicit
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'porn', 'xxx',
  'masturbat', 'orgasm', 'blowjob', 'handjob', 'nigga', 'nigger',
  // slurs & hate
  'retard', 'faggot', 'dyke', 'tranny', 'kike', 'chink', 'gook',
  // scams & cheating-for-hire
  'expo', 'runs ', 'miracle center', 'miracle centre', 'pay for Admission',
  'admission slot for sale', 'jambito',
  // contact harvesting (common spam vector on student boards)
  // handled by pattern below, not keywords
];

const PHONE_RE = /(\+?234|0)?\s?[789][01]\d\s?\d{3}\s?\d{4}/;
const CONTACT_RE = /(whatsapp|whats app|call me|dm me|text me|telegram|@\w+\s*(on\s*)?(ig|instagram|tiktok|snap))/i;

const wordRe = (w: string) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

export interface CleanCheck {
  ok: boolean;
  reason?: string;
}

export const checkClean = (text: string): CleanCheck => {
  const t = (text || '').toLowerCase();
  for (const w of BLOCKED) {
    if (w.endsWith(' ')) {
      if (t.includes(w.trim())) return { ok: false, reason: 'Blocked phrase detected' };
    } else if (wordRe(w).test(t)) {
      return { ok: false, reason: 'Inappropriate language detected' };
    }
  }
  if (PHONE_RE.test(text) || CONTACT_RE.test(text)) {
    return { ok: false, reason: 'No phone numbers or contact sharing — keep help on the board' };
  }
  return { ok: true };
};

/** Deterministic public alias: anonymous to peers, stable per account. */
export const aliasFor = (email: string): string => {
  let h = 0;
  const s = email.toLowerCase().trim();
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return `Student #${(Math.abs(h) % 9000 + 1000).toString()}`;
};
