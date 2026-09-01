"use client";

import { useEffect, useState } from "react";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { slugify } from "@/lib/slugify";
import Link from "next/link";

interface AulaSidebarProps {
  courseSlug: string;
  modulo: string;
  titulo: string;
  contentHtml: string;
  currentIndex: number;
  totalAulas: number;
}

interface Heading {
  id: string;
  text: string;
}

function extractHeadings(content: string): Heading[] {
  const headingRegex = /^##\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[1].trim();
    const id = slugify(text);
    headings.push({ id, text });
  }
  return headings;
}

export function AulaSidebar({
  courseSlug,
  modulo,
  titulo,
  contentHtml,
  currentIndex,
  totalAulas,
}: AulaSidebarProps) {
  const progress = useScrollProgress();
  const [activeId, setActiveId] = useState("");
  const headings = extractHeadings(contentHtml);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean);
    elements.forEach((el) => observer.observe(el!));

    return () => observer.disconnect();
  }, [headings]);

  return (
    <aside className="hidden lg:flex lg:flex-col w-72 sticky top-0 h-screen border-r border-[var(--color-border)] overflow-y-auto custom-scrollbar shrink-0">
      <div className="p-8 flex-1">
        {/* Module & lesson title */}
        <div className="mb-8">
          <Link
            href={`/${courseSlug}/lessons`}
            className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] hover:opacity-80 transition-opacity"
          >
            Curriculum
          </Link>
          <h3 className="font-bold text-base mt-1.5 leading-snug">{titulo}</h3>
          <span className="text-xs text-[var(--color-muted)] font-mono mt-1 block">
            {modulo}
          </span>
        </div>

        {/* TOC Navigation */}
        <nav>
          <p className="text-xs font-semibold text-[var(--color-muted)] mb-3 uppercase tracking-wider">
            Nesta página
          </p>
          <ul className="space-y-2.5 text-sm">
            {headings.map((heading) => {
              const isActive = activeId === heading.id;
              return (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    className={`block pl-3 border-l-2 transition-colors duration-200 ${
                      isActive
                        ? "border-[var(--color-primary)] text-[var(--color-primary)] font-medium"
                        : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30"
                    }`}
                  >
                    {heading.text}
                  </a>
                </li>
              );
            })}
            <li>
              <a
                href="#quiz"
                className={`block pl-3 border-l-2 transition-colors duration-200 ${
                  activeId === "quiz"
                    ? "border-[var(--color-primary)] text-[var(--color-primary)] font-medium"
                    : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30"
                }`}
              >
                Quiz
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Progress card */}
      <div className="p-6 border-t border-[var(--color-border)]">
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-[10px] font-bold text-[var(--color-muted)] mb-2 uppercase tracking-wider">
            Seu progresso
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-success)] rounded-full transition-all duration-300"
                style={{ width: `${Math.round((currentIndex / totalAulas) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-[var(--color-muted)]">
              {currentIndex}/{totalAulas}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
