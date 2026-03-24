"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isPointerFine, setIsPointerFine] = useState(false);
  const [mounted,       setMounted]       = useState(false);
  const [isVisible,     setIsVisible]     = useState(false);
  const [isHovered,     setIsHovered]     = useState(false);
  const isHoveredRef = useRef(false);

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const springX = useSpring(mouseX, { stiffness: 600, damping: 35 });
  const springY = useSpring(mouseY, { stiffness: 600, damping: 35 });

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
      const h = t.closest("a") !== null || t.closest("button") !== null || t.closest("[data-cursor]") !== null;
      if (h !== isHoveredRef.current) { isHoveredRef.current = h; setIsHovered(h); }
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
        position:       "fixed",
        top:            0,
        left:           0,
        zIndex:         9999,
        pointerEvents:  "none",
        x:              springX,
        y:              springY,
        // Hotspot at tip of index finger (top-left of the glove shape)
        translateX:     "-6px",
        translateY:     "-4px",
        opacity:        isVisible ? 1 : 0,
        transition:     "opacity 150ms ease",
      }}
    >
      <motion.div
        animate={{
          scale:  isHovered ? 1.3 : 1.0,
          rotate: isHovered ? -15 : 0,
        }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: "block", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}
      >
        {/* Mickey-style white cartoon glove — inline SVG, no external file */}
        <svg
          viewBox="0 0 44 56"
          width="44"
          height="56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Index finger — extended upward */}
          <path
            d="M16 22 L16 5 Q16 1 19.5 1 Q23 1 23 5 L23 22"
            fill="white" stroke="#1a1a1a" strokeWidth="1.8" strokeLinejoin="round"
          />
          {/* Middle finger — raised slightly */}
          <path
            d="M23 22 L23 8 Q23 5 26 5 Q29 5 29 8 L29 22"
            fill="white" stroke="#1a1a1a" strokeWidth="1.8" strokeLinejoin="round"
          />
          {/* Ring finger */}
          <path
            d="M29 22 L29 11 Q29 8 32 8 Q35 8 35 11 L35 22"
            fill="white" stroke="#1a1a1a" strokeWidth="1.8" strokeLinejoin="round"
          />
          {/* Pinky */}
          <path
            d="M35 22 L35 14 Q35 12 37.5 12 Q40 12 40 14 L40 22"
            fill="white" stroke="#1a1a1a" strokeWidth="1.8" strokeLinejoin="round"
          />
          {/* Thumb — left side */}
          <path
            d="M10 28 Q5 26 5 22 Q5 18 10 18 L16 18"
            fill="white" stroke="#1a1a1a" strokeWidth="1.8" strokeLinejoin="round"
          />
          {/* Palm */}
          <path
            d="M10 18 L10 38 Q10 44 19 44 L32 44 Q41 44 41 38 L41 22 L35 22 L29 22 L23 22 L16 22 L10 22 Z"
            fill="white" stroke="#1a1a1a" strokeWidth="1.8" strokeLinejoin="round"
          />
          {/* Wrist cuff */}
          <ellipse cx="24" cy="46" rx="11" ry="5" fill="#ece8e0" stroke="#1a1a1a" strokeWidth="1.5" />
          {/* Cuff shadow line */}
          <line x1="13" y1="43" x2="35" y2="43" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
          {/* Knuckle dots */}
          <circle cx="20" cy="31" r="1.8" fill="#ddd8d0" />
          <circle cx="27" cy="31" r="1.8" fill="#ddd8d0" />
          <circle cx="34" cy="31" r="1.8" fill="#ddd8d0" />
          {/* Button / stitch on cuff */}
          <circle cx="24" cy="47" r="2.5" fill="none" stroke="#b8b4aa" strokeWidth="1" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
