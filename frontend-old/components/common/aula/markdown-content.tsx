"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createMarkdownComponents } from "@/lib/markdown-components";
import { useMemo } from "react";

interface MarkdownContentProps {
  content: string;
  highlightedCode?: Record<string, string>;
}

export function MarkdownContent({ content, highlightedCode }: MarkdownContentProps) {
  const components = useMemo(
    () => createMarkdownComponents(highlightedCode),
    [highlightedCode]
  );

  return (
    <div className="prose-aula">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
