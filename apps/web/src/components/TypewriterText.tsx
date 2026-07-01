'use client';

import { useEffect, useRef, useState } from 'react';

export type TypewriterSegment = {
  text: string;
  em?: boolean; // renders amber-coloured <em>
};

interface TypewriterTextProps {
  segments: TypewriterSegment[];
  className?: string;
  speed?: number; // ms per character
  startDelay?: number; // ms before typing begins
  immediate?: boolean; // skip IntersectionObserver — start as soon as mounted
  tag?: 'h1' | 'h2';
}

type Node = { kind: 'text'; content: string; em: boolean } | { kind: 'br' };

export default function TypewriterText({
  segments,
  className,
  speed = 44,
  startDelay = 0,
  immediate = false,
  tag: Tag = 'h1',
}: TypewriterTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [fadeCursor, setFadeCursor] = useState(false);

  // Flatten segments into an array of typed characters
  const chars: { char: string; em: boolean }[] = segments.flatMap(
    ({ text, em = false }) => [...text].map((char) => ({ char, em }))
  );
  const total = chars.length;
  const done = count >= total;

  // Start trigger — either immediate or on scroll into view
  useEffect(() => {
    if (immediate) {
      const t = setTimeout(() => setStarted(true), startDelay);
      return () => clearTimeout(t);
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          setTimeout(() => setStarted(true), startDelay);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Typing loop
  useEffect(() => {
    if (!started || done) return;
    const t = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(t);
  }, [started, count, done, speed]);

  // Fade cursor out 700 ms after typing finishes
  useEffect(() => {
    if (!done || !started) return;
    const t = setTimeout(() => setFadeCursor(true), 700);
    return () => clearTimeout(t);
  }, [done, started]);

  // Build renderable nodes from visible characters
  const nodes: Node[] = [];
  for (const { char, em } of chars.slice(0, count)) {
    if (char === '\n') {
      nodes.push({ kind: 'br' });
    } else {
      const last = nodes[nodes.length - 1];
      if (last && last.kind === 'text' && last.em === em) {
        last.content += char;
      } else {
        nodes.push({ kind: 'text', content: char, em });
      }
    }
  }

  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement & HTMLHeadingElement>}
      className={`relative ${className ?? ''}`}
    >
      {/* Invisible full text — establishes the final height so content below never shifts */}
      <span
        aria-hidden="true"
        className="invisible pointer-events-none select-none"
      >
        {segments.map((seg, si) =>
          seg.text.split('\n').flatMap((part, pi, arr) => [
            seg.em ? (
              <em key={`${si}-${pi}`} className="text-ember not-italic">
                {part}
              </em>
            ) : (
              <span key={`${si}-${pi}`}>{part}</span>
            ),
            ...(pi < arr.length - 1 ? [<br key={`${si}-${pi}-br`} />] : []),
          ])
        )}
      </span>

      {/* Visible typewriter animation, absolutely overlaid */}
      <span className="absolute inset-0">
        {nodes.map((node, i) =>
          node.kind === 'br' ? (
            <br key={i} />
          ) : node.em ? (
            <em key={i} className="text-ember not-italic">
              {node.content}
            </em>
          ) : (
            <span key={i}>{node.content}</span>
          )
        )}

        {started && (
          <span
            aria-hidden="true"
            className={`typewriter-cursor${fadeCursor ? ' typewriter-cursor-fade' : ''}`}
          />
        )}
      </span>
    </Tag>
  );
}
