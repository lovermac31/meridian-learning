import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { BookOpen } from "lucide-react";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jurassic English | Level 1: Foundation",
  description: "First Stories. First Thinking. A premium curriculum operating system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground h-full flex flex-col`}
      >
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
            <Link href="/" className="flex items-center gap-2 mr-6 text-primary">
              <BookOpen className="h-6 w-6" />
              <span className="font-heading font-bold text-lg hidden sm:inline-block">
                Jurassic English™ <span className="font-normal text-muted-foreground ml-1">Foundation</span>
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/student" className="transition-colors hover:text-primary/80">Student Demo</Link>
              <Link href="/teacher" className="transition-colors hover:text-primary/80">Teacher Dashboard</Link>
              <Link href="/parent-report" className="transition-colors hover:text-primary/80">Parent Report</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
