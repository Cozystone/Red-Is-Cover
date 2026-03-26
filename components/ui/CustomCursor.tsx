"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const innerRef  = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const pos = useRef({ x: -300, y: -300 });
  const cur = useRef({ x: -300, y: -300 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Inject cursor:none via a <style> tag — more reliable than CSS modules
    const style = document.createElement('style')
    style.id = 'cursor-hide'
    style.textContent = `
      *, *::before, *::after,
      a, button, [role="button"], input, select, textarea, label,
      canvas, video, iframe {
        cursor: none !important;
      }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [mounted])

  useEffect(() => {
    if (!mounted) return;

    let raf: number;
    let shown = false;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!shown) {
        shown = true;
        if (cursorRef.current) cursorRef.current.style.opacity = "1";
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t || !innerRef.current) return;
      const isClickable =
        t.closest("a") !== null ||
        t.closest("button") !== null ||
        t.closest("[data-cursor]") !== null;
      innerRef.current.style.transform = isClickable
        ? "scale(1.25) rotate(-14deg)"
        : "scale(1) rotate(0deg)";
    };

    const onLeave = () => {
      shown = false;
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
    };

    const tick = () => {
      const dx = pos.current.x - cur.current.x;
      const dy = pos.current.y - cur.current.y;
      // Snap instantly for fast movements, smooth for slow ones
      const speed = Math.sqrt(dx * dx + dy * dy);
      const factor = speed > 80 ? 1.0 : 0.65;
      cur.current.x += dx * factor;
      cur.current.y += dy * factor;
      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${cur.current.x - 14}px, ${cur.current.y - 4}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        zIndex:        9999,
        pointerEvents: "none",
        opacity:       0,
        transform:     "translate(-300px, -300px)",
        transition:    "opacity 150ms ease",
        willChange:    "transform",
      }}
    >
      <div
        ref={innerRef}
        style={{ transition: "transform 180ms cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cursor-hand.png"
          alt=""
          width={52}
          height={58}
          style={{ display: "block", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.55))" }}
        />
      </div>
    </div>
  );
}
