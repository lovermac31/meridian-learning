"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

// Mobile-only navigation drawer for the ecosystem-landing header.
// Visible below the lg breakpoint (≥1024px the desktop nav takes over).
//
// Visual language matches the rest of the ecosystem-landing chrome:
// parchment surface, deep-green text, jurassic-accent orange focus / CTA.
// No framer-motion / AnimatePresence is used — earlier QA in this project
// uncovered React 19 + framer-motion 12 exit-state issues; we use a plain
// conditional render with CSS transitions so unmount is reliable.

const MOBILE_NAV_ID = "ecosystem-mobile-nav";

type NavItem = { label: string; href: string };

// Approved primary nav items. Mirrors the desktop nav inside layout.tsx.
const NAV_ITEMS: NavItem[] = [
  { label: "Academy", href: "/student-academy" },
  { label: "Framework", href: "/school-framework" },
  { label: "DRE", href: "/digital-reasoning-engine" },
  { label: "Interactive Demo", href: "/interactive-demo" },
  { label: "Evidence Policy", href: "/evidence" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const pathname = usePathname();

  const close = () => setIsOpen(false);

  // Auto-close on route change. Skips the initial mount (drawer starts
  // closed) so we don't fire setState unnecessarily.
  const lastPathnameRef = useRef(pathname);
  useEffect(() => {
    if (lastPathnameRef.current !== pathname && isOpen) {
      setIsOpen(false);
    }
    lastPathnameRef.current = pathname;
  }, [pathname, isOpen]);

  // Body scroll lock + initial focus + restore focus on close.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Capture the trigger element at effect-run time so the cleanup
    // function does not depend on a possibly-stale ref reference.
    const triggerAtOpen = triggerRef.current;

    // Move focus into the drawer on next frame so the rendered DOM is
    // ready and the focus ring becomes visible to the user.
    const rafId = window.requestAnimationFrame(() => {
      const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      firstFocusable?.focus();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      document.body.style.overflow = previousOverflow;
      // Restore focus to the hamburger trigger after the drawer is closed.
      triggerAtOpen?.focus();
    };
  }, [isOpen]);

  // Escape + focus trap + click-outside.
  useEffect(() => {
    if (!isOpen) return;

    const getFocusables = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) || [],
      );

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key === "Tab") {
        const focusables = getFocusables();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (drawerRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      close();
    };

    // Defer the mousedown listener to the next macrotask so the same
    // click that opened the drawer is not interpreted as a click outside.
    // This is the same fix that was applied to BotUIChat after Phase 4 QA.
    const timeoutId = window.setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    document.addEventListener("keydown", handleKey);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-controls={MOBILE_NAV_ID}
        aria-label={
          isOpen ? "Close navigation menu" : "Open navigation menu"
        }
        className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 bg-background text-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {isOpen ? (
        <div
          ref={drawerRef}
          id={MOBILE_NAV_ID}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          className="lg:hidden fixed inset-x-4 top-[6.25rem] z-40 rounded-2xl border border-primary/10 bg-background/98 shadow-[0_30px_70px_rgba(11,59,36,0.18)] backdrop-blur-xl"
        >
          <div className="px-5 py-5">
            <h2 id={headingId} className="sr-only">
              Ecosystem navigation
            </h2>

            <nav aria-label="Ecosystem">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className="block rounded-md px-3 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-5 border-t border-primary/10 pt-5">
              <Link
                href="/book-diagnostic"
                onClick={close}
                className={buttonVariants({
                  size: "default",
                  className:
                    "w-full justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent",
                })}
              >
                Book Diagnostic
              </Link>
            </div>

            <div className="mt-4">
              <a
                href="https://www.jurassicenglish.com"
                onClick={close}
                className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-sm font-medium text-foreground/60 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent"
              >
                <span aria-hidden="true">←</span>
                <span>Back to JurassicEnglish.com</span>
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default MobileNav;
