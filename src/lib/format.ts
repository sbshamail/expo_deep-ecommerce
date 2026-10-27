export const formatMoney = (value: number | null | undefined, symbol = 'Rs') =>
  value == null ? '—' : `${symbol} ${Number(value).toLocaleString('en-US')}`;

export const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

/** "Size: M · Color: Red" from a variant's attributes. */
export const formatAttributes = (attrs: Record<string, string> | null | undefined) =>
  Object.entries(attrs ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');

export const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** The blog backend stores sanitised HTML; mobile edits plain text. */
export const htmlToText = (html: string) =>
  html
    .replace(/<\/(p|h[1-6]|li|div)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Plain text → paragraphs; the first line becomes the heading (= the post title). */
export const textToHtml = (text: string) => {
  const blocks = text
    .split(/\n{2,}|\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  return blocks
    .map((b, i) => (i === 0 && blocks.length > 1 ? `<h2>${escapeHtml(b)}</h2>` : `<p>${escapeHtml(b)}</p>`))
    .join('');
};
