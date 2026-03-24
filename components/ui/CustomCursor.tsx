"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const innerRef  = useRef<HTMLDivElement>(null);
  const [mounted,       setMounted]       = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(false);

  const pos     = useRef({ x: -300, y: -300 });
  const cur     = useRef({ x: -300, y: -300 });
  const visible = useRef(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(any-pointer: fine)");
    setIsPointerFine(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsPointerFine(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isPointerFine) return;

    let raf: number;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible.current) {
        visible.current = true;
        if (cursorRef.current) cursorRef.current.style.opacity = "1";
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t) return;
      const h =
        t.closest("a")             !== null ||
        t.closest("button")        !== null ||
        t.closest("[data-cursor]") !== null;
      if (innerRef.current) {
        innerRef.current.style.transform = h
          ? "scale(1.25) rotate(-14deg)"
          : "scale(1) rotate(0deg)";
      }
    };

    const onLeave = () => {
      visible.current = false;
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
    };

    const tick = () => {
      cur.current.x += (pos.current.x - cur.current.x) * 0.18;
      cur.current.y += (pos.current.y - cur.current.y) * 0.18;
      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${cur.current.x - 19}px, ${cur.current.y - 2}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    document.addEventListener("mousemove",  onMove);
    document.addEventListener("mouseover",  onOver);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseover",  onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [isPointerFine]);

  if (!mounted || !isPointerFine) return null;

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
        <GloveIcon />
      </div>
    </div>
  );
}

// ── Cartoon white glove — inline SVG ─────────────────────────────────────────

function GloveIcon() {
  return (
    <svg
      viewBox="0 0 44 54"
      width="44"
      height="54"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.65))" }}
    >
      <rect x="14" y="2"  width="10" height="27" rx="5"   fill="white" stroke="#1a1a1a" strokeWidth="1.7"/>
      <rect x="24" y="7"  width="9"  height="22" rx="4.5" fill="white" stroke="#1a1a1a" strokeWidth="1.7"/>
      <rect x="33" y="11" width="8"  height="18" rx="4"   fill="white" stroke="#1a1a1a" strokeWidth="1.7"/>
      <rect x="0"  y="17" width="14" height="16" rx="6"   fill="white" stroke="#1a1a1a" strokeWidth="1.7"/>
      <rect x="2"  y="26" width="39" height="18" rx="7"   fill="white" stroke="#1a1a1a" strokeWidth="1.7"/>
      <ellipse cx="21.5" cy="45" rx="13" ry="5.5"          fill="#ece6db" stroke="#1a1a1a" strokeWidth="1.5"/>
      <rect x="9" y="41" width="25" height="5"              fill="white"   stroke="none"/>
      <circle cx="15.5" cy="33" r="1.8" fill="#dcd6cc"/>
      <circle cx="23"   cy="33" r="1.8" fill="#dcd6cc"/>
      <circle cx="30"   cy="33" r="1.8" fill="#dcd6cc"/>
      <circle cx="21.5" cy="46" r="2.8" fill="none" stroke="#b0a898" strokeWidth="1"/>
      <circle cx="21.5" cy="46" r="0.9" fill="#b0a898"/>
    </svg>
  );
}
