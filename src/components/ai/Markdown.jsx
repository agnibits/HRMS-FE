import { Fragment } from 'react';

/**
 * Minimal, dependency-free markdown renderer for LLM chat output.
 * Handles the patterns models actually emit: **bold**, *italic*, `code`,
 * # headings, - / * bullet lists, 1. numbered lists, and paragraphs.
 */

function renderInline(text) {
  const nodes = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g;
  let last = 0;
  let m;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) {
      nodes.push(<strong key={key++} className="font-semibold">{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('`')) {
      nodes.push(
        <code key={key++} className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.85em] dark:bg-white/10">
          {tok.slice(1, -1)}
        </code>
      );
    } else {
      nodes.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ content = '', className = '' }) {
  const lines = String(content).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let list = null; // { type: 'ul'|'ol', items: [] }

  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);

    if (heading) {
      flushList();
      blocks.push({ type: 'h', text: heading[2] });
    } else if (bullet) {
      if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; }
      list.items.push(bullet[1]);
    } else if (numbered) {
      if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] }; }
      list.items.push(numbered[1]);
    } else if (line.trim() === '') {
      flushList();
      blocks.push({ type: 'gap' });
    } else {
      flushList();
      blocks.push({ type: 'p', text: line });
    }
  }
  flushList();

  return (
    <div className={`space-y-2 ${className}`}>
      {blocks.map((b, i) => {
        if (b.type === 'h')
          return <p key={i} className="text-[0.95em] font-semibold">{renderInline(b.text)}</p>;
        if (b.type === 'p')
          return <p key={i} className="leading-relaxed">{renderInline(b.text)}</p>;
        if (b.type === 'gap') return <Fragment key={i} />;
        const items = b.items.map((it, j) => (
          <li key={j} className="leading-relaxed">{renderInline(it)}</li>
        ));
        return b.type === 'ol' ? (
          <ol key={i} className="list-decimal space-y-1 pl-5">{items}</ol>
        ) : (
          <ul key={i} className="list-disc space-y-1 pl-5 marker:text-surface-400">{items}</ul>
        );
      })}
    </div>
  );
}

export default Markdown;
