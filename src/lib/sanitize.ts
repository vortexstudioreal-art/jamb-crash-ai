// Strip leftover HTML tags/entities from question text.
// Imported banks occasionally carry markup (<i>, &nbsp;) that would
// otherwise render raw inside quiz cards.
export const stripQuestionHtml = (s: string | null | undefined): string => {
  if (!s) return '';
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};
