"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          themeVariables: {
            primaryColor: "#6c3fe0",
            primaryTextColor: "#1a1a2e",
            primaryBorderColor: "#6c3fe0",
            lineColor: "#6c3fe0",
            secondaryColor: "#f0ebff",
            tertiaryColor: "#fafafa",
          },
          flowchart: {
            htmlLabels: true,
            curve: "basis",
          },
        });
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        if (!cancelled) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Erro ao renderizar diagrama");
          console.error("Mermaid render error:", err);
        }
      }
    }

    renderChart();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <div className="my-6 p-4 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 text-sm text-[var(--color-error)]">
        {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 p-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-x-auto flex justify-center [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
