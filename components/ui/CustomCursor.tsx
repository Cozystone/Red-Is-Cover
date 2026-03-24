"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isPointerFine, setIsPointerFine] = useState(false);
  const [mounted,       setMounted]       = useState(false);
  const [isVisible,     setIsVisible]     = useState(false);
  const [isHovered,     setIsHovered]     = useState(false);
  const isHoveredRef = useRef(false);

  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);
  const springX = useSpring(mouseX, { stiffness: 550, damping: 32 });
  const springY = useSpring(mouseY, { stiffness: 550, damping: 32 });

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(pointer: coarse)");
    setIsPointerFine(!mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsPointerFine(!e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isPointerFine) return;

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t) return;
      const h =
        t.closest("a")             !== null ||
        t.closest("button")        !== null ||
        t.closest("[data-cursor]") !== null;
      if (h !== isHoveredRef.current) {
        isHoveredRef.current = h;
        setIsHovered(h);
      }
    };

    const onLeave = () => setIsVisible(false);

    document.addEventListener("mousemove",  onMove);
    document.addEventListener("mouseover",  onOver);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseover",  onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [isPointerFine, isVisible, mouseX, mouseY]);

  if (!mounted || !isPointerFine) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        zIndex:        9999,
        pointerEvents: "none",
        x:             springX,
        y:             springY,
        // Hotspot: tip of index finger at SVG coords (19, 2) in a 44×54 image
        translateX:    "-19px",
        translateY:    "-2px",
        opacity:       isVisible ? 1 : 0,
        transition:    "opacity 150ms ease",
      }}
    >
      <motion.div
        animate={{ scale: isHovered ? 1.25 : 1.0, rotate: isHovered ? -14 : 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <GloveIcon />
      </motion.div>
    </motion.div>
  );
}

// ── Cartoon white glove — inline SVG, no external file ───────────────────────
// Render order: fingers first → palm on top (covers finger bases) → cuff on top
// This avoids any gap artifacts at finger-palm junctions.

function GloveIcon() {
  return (
    <svg
      viewBox="0 0 44 54"
      width="44"
      height="54"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.65))" }}
    >
      {/* Fingers (behind palm) */}
      <rect x="14" y="2"  width="10" height="27" rx="5"   fill="white" stroke="#1a1a1a" strokeWidth="1.7"/>
      <rect x="24" y="7"  width="9"  height="22" rx="4.5" fill="white" stroke="#1a1a1a" strokeWidth="1.7"/>
      <rect x="33" y="11" width="8"  height="18" rx="4"   fill="white" stroke="#1a1a1a" strokeWidth="1.7"/>
      <rect x="0"  y="17" width="14" height="16" rx="6"   fill="white" stroke="#1a1a1a" strokeWidth="1.7"/>

      {/* Palm — on top, white fill covers finger bases */}
      <rect x="2"  y="26" width="39" height="18" rx="7"   fill="white" stroke="#1a1a1a" strokeWidth="1.7"/>

      {/* Cuff */}
      <ellipse cx="21.5" cy="45" rx="13" ry="5.5"          fill="#ece6db" stroke="#1a1a1a" strokeWidth="1.5"/>
      <rect x="9" y="41" width="25" height="5"              fill="white"   stroke="none"/>

      {/* Knuckle dots */}
      <circle cx="15.5" cy="33" r="1.8" fill="#dcd6cc"/>
      <circle cx="23"   cy="33" r="1.8" fill="#dcd6cc"/>
      <circle cx="30"   cy="33" r="1.8" fill="#dcd6cc"/>

      {/* Cuff button */}
      <circle cx="21.5" cy="46" r="2.8" fill="none" stroke="#b0a898" strokeWidth="1"/>
      <circle cx="21.5" cy="46" r="0.9" fill="#b0a898"/>
    </svg>
  );
}
