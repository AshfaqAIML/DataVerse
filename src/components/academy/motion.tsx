"use client";

/**
 * Motion primitives for the visual-experience layer.
 *
 * Reveal — a restrained scroll-reveal wrapper. One IntersectionObserver per
 * instance, `once` by default, transform/opacity only (see the `.dv-reveal`
 * rules in globals.css). Reduced-motion users never see the hidden state:
 * the safety override in globals.css forces `.dv-reveal` visible, so this
 * component deliberately does not consult matchMedia itself.
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealTag = "div" | "section" | "li" | "article" | "span";

export function Reveal({
  children,
  className,
  /** Stagger delay in milliseconds (applied only to the transition, never blocking paint). */
  delay = 0,
  as = "div",
  /** Re-hide when scrolled back out. Off by default — restful, not showy. */
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: RevealTag;
  once?: boolean;
}) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  // Always starts hidden on both server and client (identical SSR markup —
  // no hydration mismatch); the observer flips the flag when the element
  // enters the viewport. Reduced-motion users are covered by the CSS
  // safety override, which forces `.dv-reveal` visible regardless.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      // Ancient browser — reveal immediately (async out of the render path).
      const t = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) io.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      // Threshold 0 (any pixel) — a ratio threshold breaks for sections
      // taller than the viewport (an 85-card catalogue grid never reaches 8%
      // visibility, so isIntersecting stays false and it would never reveal).
      // The bottom -8% root margin still holds the reveal until the element
      // is meaningfully on screen, and never finishes it off-viewport.
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [node, once]);

  const Tag = as;
  return (
    <Tag
      ref={setNode}
      data-visible={visible ? "true" : "false"}
      className={cn("dv-reveal", className)}
      style={{ "--dv-reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
