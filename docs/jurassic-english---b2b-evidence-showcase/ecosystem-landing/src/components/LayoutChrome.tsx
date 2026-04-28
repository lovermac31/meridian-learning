"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { BotUIChat } from "./BotUIChat";
import { StudentAcademyFooter } from "./StudentAcademyFooter";
import { isSaBotRouteAllowed } from "@/lib/saBotRoutes";

// Client-side chrome wrapper. Decides which footer to render and whether
// the Student Academy bot should mount, based on the current pathname.
// Lives below `<main>` in the root layout so it remains scoped to the
// app shell without affecting page rendering.

function MinimalEcosystemFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-primary/10 bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center mb-6 opacity-90">
          <span className="font-display text-2xl tracking-tight text-primary-foreground">
            Jurassic English
            <span className="text-xs align-top text-jurassic-accent">™</span>
          </span>
        </div>
        <p className="text-primary-foreground/60 text-sm max-w-xl mx-auto mb-8">
          A five-level literature-based learning ecosystem that helps
          students read deeply, speak clearly, write with evidence, and
          think in English.
        </p>
        <div className="flex justify-center gap-6 text-sm text-primary-foreground/60">
          <Link
            href="/evidence"
            className="hover:text-white transition-colors"
          >
            Claims &amp; Evidence Policy
          </Link>
          <span>© {year} Jurassic English™</span>
        </div>
      </div>
    </footer>
  );
}

export function LayoutChrome() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  const isStudentAcademy = isSaBotRouteAllowed(pathname);

  const handleBotNavigate = useCallback(
    (path: string) => {
      // Same-page anchor navigation should use the browser's hash handling
      // so the page scrolls to the heading instead of forcing a re-render.
      if (path.startsWith("/student-academy#") && pathname === "/student-academy") {
        const hashIndex = path.indexOf("#");
        if (hashIndex !== -1) {
          const hash = path.slice(hashIndex);
          window.location.hash = hash;
          return;
        }
      }
      router.push(path);
    },
    [pathname, router],
  );

  return (
    <>
      {isStudentAcademy ? <StudentAcademyFooter /> : <MinimalEcosystemFooter />}
      {isStudentAcademy ? (
        <BotUIChat
          currentPathname={pathname}
          onNavigate={handleBotNavigate}
        />
      ) : null}
    </>
  );
}

export default LayoutChrome;
