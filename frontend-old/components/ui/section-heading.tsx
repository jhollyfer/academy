interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  light?: boolean;
}

export function SectionHeading({
  title,
  subtitle,
  className = "",
  light = false,
}: SectionHeadingProps) {
  return (
    <div className={`text-center mb-16 ${className}`}>
      <h2
        className={`text-3xl font-black mb-4 text-balance ${
          light
            ? "text-white"
            : "text-slate-900 dark:text-white"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`max-w-xl mx-auto text-balance ${
            light
              ? "text-white/70"
              : "text-muted dark:text-muted-dark"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
