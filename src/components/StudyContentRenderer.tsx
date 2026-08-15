import { Lightbulb, FlaskConical, Calculator, BookMarked, Image } from 'lucide-react';

// ---------------------------------------------------------------------------
// Inline formatter: **bold**, *italic*, `code`
// ---------------------------------------------------------------------------
function applyInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-foreground/90">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-[12px] font-mono text-primary">$1</code>');
}

// ---------------------------------------------------------------------------
// Callout box variants
// ---------------------------------------------------------------------------
const CALLOUT_PATTERNS: Array<{
  match: RegExp;
  label: string;
  Icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}> = [
  {
    match: /^(formula|key formula|law):\s*/i,
    label: 'Formula',
    Icon: Calculator,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  {
    match: /^(note|remember|important|key point):\s*/i,
    label: 'Key Point',
    Icon: Lightbulb,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  {
    match: /^(example|worked example|illustration|sample question):\s*/i,
    label: 'Worked Example',
    Icon: FlaskConical,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  {
    match: /^(did you know|fun fact|trivia):\s*/i,
    label: 'Did You Know?',
    Icon: BookMarked,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  {
    match: /^\[diagram\]:\s*/i,
    label: 'Diagram',
    Icon: Image,
    color: 'text-sky-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
];

function detectCallout(line: string) {
  for (const pattern of CALLOUT_PATTERNS) {
    if (pattern.match.test(line)) {
      const content = line.replace(pattern.match, '');
      return { ...pattern, content };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main renderer
// ---------------------------------------------------------------------------
interface StudyContentRendererProps {
  content: string;
  className?: string;
}

export const StudyContentRenderer = ({ content, className = '' }: StudyContentRendererProps) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let bulletItems: string[] = [];
  let numberedItems: string[] = [];
  let key = 0;

  const flushLists = () => {
    if (bulletItems.length > 0) {
      elements.push(
        <ul key={key++} className="my-3 space-y-2 pl-1">
          {bulletItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: applyInline(item) }} />
            </li>
          ))}
        </ul>
      );
      bulletItems = [];
    }

    if (numberedItems.length > 0) {
      elements.push(
        <ol key={key++} className="my-3 space-y-2 pl-1">
          {numberedItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-extrabold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span dangerouslySetInnerHTML={{ __html: applyInline(item) }} />
            </li>
          ))}
        </ol>
      );
      numberedItems = [];
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    // Empty line = paragraph break
    if (!trimmed) {
      flushLists();
      elements.push(<div key={key++} className="h-1" />);
      return;
    }

    // H1  (#)
    if (/^# /.test(trimmed)) {
      flushLists();
      const text = trimmed.slice(2);
      elements.push(
        <h1
          key={key++}
          className="text-xl font-black text-foreground mt-6 mb-3 pb-2 border-b border-primary/30 flex items-center gap-2"
        >
          <span className="w-1 h-6 rounded bg-primary shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: applyInline(text) }} />
        </h1>
      );
      return;
    }

    // H2 (##)
    if (/^## /.test(trimmed)) {
      flushLists();
      const text = trimmed.slice(3);
      elements.push(
        <h2
          key={key++}
          className="text-lg font-extrabold text-foreground mt-5 mb-2 flex items-center gap-2"
        >
          <span className="w-1 h-5 rounded bg-primary/70 shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: applyInline(text) }} />
        </h2>
      );
      return;
    }

    // H3 (###)
    if (/^### /.test(trimmed)) {
      flushLists();
      const text = trimmed.slice(4);
      elements.push(
        <h3
          key={key++}
          className="text-base font-bold text-foreground mt-4 mb-1.5 flex items-center gap-2"
        >
          <span className="w-0.5 h-4 rounded bg-primary/50 shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: applyInline(text) }} />
        </h3>
      );
      return;
    }

    // Bullet list (* or -)
    if (/^[-*] /.test(trimmed)) {
      if (numberedItems.length > 0) flushLists();
      bulletItems.push(trimmed.slice(2));
      return;
    }

    // Numbered list (1. 2. etc.)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      if (bulletItems.length > 0) flushLists();
      numberedItems.push(numMatch[2]);
      return;
    }

    // Callout boxes (Formula:, Note:, Example:, etc.)
    const callout = detectCallout(trimmed);
    if (callout) {
      flushLists();
      const { label, Icon, color, bg, border, content: calloutContent } = callout;
      elements.push(
        <div
          key={key++}
          className={`my-4 p-4 rounded-2xl ${bg} border ${border} flex items-start gap-3`}
        >
          <div className={`shrink-0 w-8 h-8 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[11px] font-extrabold uppercase tracking-widest ${color} mb-1.5`}>
              {label}
            </p>
            <p
              className="text-sm text-foreground leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: applyInline(calloutContent) }}
            />
          </div>
        </div>
      );
      return;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      flushLists();
      elements.push(<hr key={key++} className="my-4 border-border/50" />);
      return;
    }

    // Regular paragraph
    flushLists();
    elements.push(
      <p
        key={key++}
        className="text-sm text-muted-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: applyInline(trimmed) }}
      />
    );
  });

  flushLists();

  return (
    <div className={`study-content space-y-1 ${className}`}>
      {elements}
    </div>
  );
};
