interface QuestionDiagramProps {
  svg: string | null | undefined;
  title?: string;
}

/**
 * Inline SVG diagrams attached to questions (circuits, geometry, charts).
 * The markup comes from AI generation, so it is sanitized before render:
 * scripts, event-handler attributes, and external references are stripped.
 * Returns null when there is nothing safe to show.
 */
export const sanitizeDiagramSvg = (svg: string): string | null => {
  let out = svg.trim();
  if (!/^<svg[\s>]/i.test(out)) return null;
  // Drop scripts and event handlers (onclick, onload, ...).
  out = out.replace(/<script[\s\S]*?<\/script\s*>/gi, '');
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  // Block external references (images, links, use hrefs to remote files).
  out = out.replace(/xlink:href\s*=\s*["']https?:[^"']*["']/gi, 'xlink:href="#blocked"');
  out = out.replace(/(?:href|xlink:href)\s*=\s*["']https?:[^"']*["']/gi, '');
  out = out.replace(/<image[\s\S]*?(?:\/>|<\/image\s*>)/gi, '');
  if (!/^<svg[\s>]/i.test(out)) return null;
  // Cap runaway markup.
  if (out.length > 20000) return null;
  return out;
};

export const QuestionDiagram = ({ svg, title }: QuestionDiagramProps) => {
  if (!svg) return null;
  const clean = sanitizeDiagramSvg(svg);
  if (!clean) return null;
  return (
    <div className="my-3 rounded-xl border border-border bg-white p-3 overflow-x-auto" role="img" aria-label={title || 'Question diagram'}>
      {/* sanitized above — scripts, handlers and remote refs stripped */}
      <div dangerouslySetInnerHTML={{ __html: clean }} className="mx-auto max-w-full [&>svg]:mx-auto [&>svg]:max-w-full [&>svg]:h-auto" />
    </div>
  );
};
