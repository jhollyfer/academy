import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Highlighter | null = null;

const SUPPORTED_LANGS = [
  "typescript",
  "javascript",
  "bash",
  "json",
  "html",
  "css",
] as const;

type SupportedLang = (typeof SUPPORTED_LANGS)[number];

function isSupportedLang(lang: string): lang is SupportedLang {
  return (SUPPORTED_LANGS as readonly string[]).includes(lang);
}

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-dark-default"],
      langs: [...SUPPORTED_LANGS],
    });
  }
  return highlighter;
}

export async function highlightCodeBlocks(
  markdown: string
): Promise<Record<string, string>> {
  const hl = await getHighlighter();
  const map: Record<string, string> = {};
  const regex = /```(\w+)\n([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const lang = match[1];
    const code = match[2].replace(/\n$/, "");

    if (lang === "mermaid") continue;
    if (!isSupportedLang(lang)) continue;

    const key = `${lang}:${code}`;
    if (map[key]) continue;

    try {
      map[key] = hl.codeToHtml(code, {
        lang,
        theme: "github-dark-default",
      });
    } catch {
      // Skip if highlighting fails
    }
  }

  return map;
}
