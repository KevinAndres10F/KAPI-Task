/**
 * RichTextViewer — renders TipTap-serialized HTML as read-only preview.
 * Used inside BentoTaskCard for the description preview area.
 * Content is stripped of block-level HTML and rendered as plain text
 * to keep the card compact.
 */

interface RichTextViewerProps {
  content: string;
  className?: string;
}

/** Strip HTML tags and decode basic entities for compact preview */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?(p|h[1-6]|li|ul|ol|blockquote)[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function RichTextViewer({ content, className = '' }: RichTextViewerProps) {
  if (!content || content === '<p></p>') return null;
  const plain = stripHtml(content);
  if (!plain) return null;
  return <span className={className}>{plain}</span>;
}
