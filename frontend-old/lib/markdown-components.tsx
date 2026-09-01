import { AulaCallout } from "@/components/common/aula/aula-callout";
import { MermaidDiagram } from "@/components/common/aula/mermaid-diagram";
import { VideoCard } from "@/components/common/aula/video-card";
import { slugify } from "@/lib/slugify";
import type { Components } from "react-markdown";

function TruthTableCell({ children }: { children: React.ReactNode }) {
  const text = String(children).trim();

  // Exact matches: V/F/1/0
  if (text === "V" || text === "1") {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-[var(--color-success)]/15 text-[var(--color-success)]">
        {text}
      </span>
    );
  }
  if (text === "F" || text === "0") {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-[var(--color-error)]/15 text-[var(--color-error)]">
        {text}
      </span>
    );
  }

  // Contains check mark or CONSISTENTE
  if (
    text.includes("\u2713") ||
    text === "CONSISTENTE" ||
    text === "CONSISTENTE!"
  ) {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-[var(--color-success)]/15 text-[var(--color-success)]">
        {children}
      </span>
    );
  }

  // Contains cross mark or CONTRADICAO
  if (
    text.includes("\u2717") ||
    text === "CONTRADI\u00c7\u00c3O" ||
    text === "CONTRADI\u00c7\u00c3O!"
  ) {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-[var(--color-error)]/15 text-[var(--color-error)]">
        {children}
      </span>
    );
  }

  // Boolean true/false values
  if (text === "true") {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-[var(--color-success)]/15 text-[var(--color-success)]">
        {text}
      </span>
    );
  }
  if (text === "false") {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-[var(--color-error)]/15 text-[var(--color-error)]">
        {text}
      </span>
    );
  }

  return <>{children}</>;
}

export function createMarkdownComponents(
  highlightedCode?: Record<string, string>,
): Components {
  return {
    h2: ({ children }) => {
      const text = extractText(children);
      const id = slugify(text);
      return (
        <h2
          id={id}
          className="text-xl sm:text-2xl font-bold mt-12 mb-4 scroll-mt-20 flex items-center gap-3"
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }) => (
      <h3 className="text-lg font-bold mt-8 mb-3">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="leading-relaxed text-[var(--color-foreground)]/90 mb-4">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="space-y-2 my-4 ml-4 list-disc marker:text-[var(--color-primary)]">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="space-y-2 my-4 ml-4 list-decimal marker:text-[var(--color-primary)]">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed text-[var(--color-foreground)]/90">
        {children}
      </li>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-[var(--color-foreground)]">
        {children}
      </strong>
    ),
    a: ({ href, children }) => {
      if (href && /youtube\.com\/watch|youtu\.be\//.test(href)) {
        return <VideoCard url={href} title={extractText(children)} />;
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-primary)] hover:underline"
        >
          {children}
        </a>
      );
    },
    blockquote: ({ children }) => {
      const text = extractText(children);
      const infoMatch = text.match(/^\[!info\]\s*([\s\S]*)/);
      const sucessoMatch = text.match(/^\[!sucesso\]\s*([\s\S]*)/);
      const alertaMatch = text.match(/^\[!alerta\]\s*([\s\S]*)/);

      if (infoMatch) {
        return <AulaCallout tipo="info">{infoMatch[1].trim()}</AulaCallout>;
      }
      if (sucessoMatch) {
        return (
          <AulaCallout tipo="sucesso">{sucessoMatch[1].trim()}</AulaCallout>
        );
      }
      if (alertaMatch) {
        return <AulaCallout tipo="alerta">{alertaMatch[1].trim()}</AulaCallout>;
      }

      return <AulaCallout tipo="info">{children}</AulaCallout>;
    },
    table: ({ children }) => (
      <div className="overflow-x-auto my-6 rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm font-mono">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-[var(--color-surface)]">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-[var(--color-muted)] font-semibold uppercase tracking-wider text-xs">
        {children}
      </th>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-t border-[var(--color-border)]">{children}</tr>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2.5">
        <TruthTableCell>{children}</TruthTableCell>
      </td>
    ),
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const lang = match ? match[1] : null;

      if (lang === "mermaid") {
        return <MermaidDiagram chart={String(children).trim()} />;
      }

      // Inline code
      if (!lang) {
        return (
          <code
            className="px-1.5 py-0.5 rounded text-sm font-mono bg-[var(--color-code-bg)] text-[var(--color-primary)]"
            {...props}
          >
            {children}
          </code>
        );
      }

      // Code block: check for shiki-highlighted version
      if (highlightedCode) {
        const codeText = String(children).replace(/\n$/, "");
        const key = `${lang}:${codeText}`;
        const html = highlightedCode[key];
        if (html) {
          return (
            <div
              data-highlighted=""
              data-lang={lang}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
      }

      // Fallback: unstyled code block
      return (
        <code className={`${className} block`} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => {
      // If the child is a shiki-highlighted code block, don't wrap in <pre>
      const child = children as React.ReactElement<Record<string, unknown>>;
      if (
        child &&
        typeof child === "object" &&
        "props" in child &&
        child.props["data-highlighted"] !== undefined
      ) {
        return (
          <div className="my-6 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-[var(--color-border)] [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:font-mono">
            {children}
          </div>
        );
      }

      return (
        <pre className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-code-bg)] p-4 overflow-x-auto text-sm leading-relaxed font-mono">
          {children}
        </pre>
      );
    },
  };
}

// Backward-compatible export for components that don't need highlighting
export const markdownComponents: Components = createMarkdownComponents();

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("\n");
  if (typeof node === "object" && node !== null && "props" in node) {
    const element = node as React.ReactElement<{
      children?: React.ReactNode;
    }>;
    return extractText(element.props.children);
  }
  return "";
}
