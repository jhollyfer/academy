import { type ComponentProps } from "react";

export function Container({
  className = "",
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
