import { Space_Mono } from "next/font/google";

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function CourseLessonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${spaceMono.variable} min-h-screen`}>
      {children}
    </div>
  );
}
