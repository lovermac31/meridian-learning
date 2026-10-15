"use client";

import { useEffect } from "react";

// The header menu is a server-rendered <details>. This adds the keyboard and
// pointer dismissal a menu needs (EXEC-02 C1): Escape closes it and returns
// focus to the toggle; a tap or click outside closes it.
export function HeaderMenuDismiss() {
  useEffect(() => {
    const menu = () => document.querySelector<HTMLDetailsElement>("details[data-site-menu]");
    const onKey = (event: KeyboardEvent) => {
      const el = menu();
      if (event.key !== "Escape" || !el?.open) return;
      el.open = false;
      el.querySelector("summary")?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      const el = menu();
      if (el?.open && !el.contains(event.target as Node)) el.open = false;
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);
  return null;
}
