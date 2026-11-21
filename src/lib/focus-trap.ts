"use client";

import { useEffect, type RefObject } from "react";

/**
 * Focus management for modal surfaces (WCAG 2.4.1 / 2.4.3).
 *
 * While `active`, Tab (and Shift+Tab) are trapped inside `ref`, focus is
 * moved into the container on open, and the previously-focused element
 * regains focus when the surface closes.
 */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

function focusableIn(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) =>
      el.offsetParent !== null ||
      el.getClientRects().length > 0 ||
      el === document.activeElement,
  );
}

export function useFocusTrap(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  opts?: { initialFocus?: boolean },
): void {
  const initialFocus = opts?.initialFocus !== false;

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Move focus into the surface (first control, e.g. the close button).
    if (initialFocus) {
      const first = focusableIn(container)[0];
      if (first) first.focus();
      else container.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = focusableIn(container);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (!container.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Restore focus to the trigger that opened the surface.
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [active, ref, initialFocus]);
}

/**
 * True when the user has asked the OS for reduced motion.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Smooth scroll that respects `prefers-reduced-motion` (WCAG 2.3.3) —
 * the CSS kill-switch cannot reach JavaScript scroll calls.
 */
export function scrollIntoViewSafe(el: Element, opts: ScrollIntoViewOptions = {}): void {
  el.scrollIntoView({ ...opts, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}
