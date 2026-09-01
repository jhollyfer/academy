import { TechClassNavbar } from "@/components/tech-class-navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "academy — Plataforma Educacional",
  description:
    "Aulas interativas de programação com quizzes, simuladores e exercícios práticos. Baseado nas aulas do professor André Noel (CETAM).",
  openGraph: {
    title: "academy — Plataforma Educacional",
    description:
      "Aulas interativas de programação com quizzes, simuladores e exercícios práticos.",
    locale: "pt_BR",
    type: "website",
  },
};

// Static inline script to prevent theme flash (FOUC).
// This is a hardcoded string with no user input — safe to use with dangerouslySetInnerHTML.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${nunito.variable} antialiased`}>
        <ThemeProvider>
          <TooltipProvider delayDuration={300}>
            <a
              href="#inicio"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
            >
              Pular para o conteúdo
            </a>
            <TechClassNavbar />
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
