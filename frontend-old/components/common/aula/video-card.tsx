import { Play } from "lucide-react";

interface VideoCardProps {
  url: string;
  title: string;
}

function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
  );
  return match ? match[1] : null;
}

export function VideoCard({ url, title }: VideoCardProps) {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 my-3 transition-colors hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 no-underline"
    >
      <div className="relative shrink-0 w-32 h-18 rounded-md overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
          <Play className="w-8 h-8 text-white fill-white/90" />
        </div>
      </div>
      <span className="text-sm font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors">
        {title}
      </span>
    </a>
  );
}
