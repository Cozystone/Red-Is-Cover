"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  // Whether we have confirmed a pointer:fine device (not touch)
  const [isPointerFine, setIsPointerFine] = useState(false);
  // Only render after mount so SSR never outputs the cursor
  const [mounted, setMounted] = useState(false);
  // Whether the orb is in its expanded hover state
  const [isHovered, setIsHovered] = useState(false);
  // Hide until first mouse movement
  const [isVisible, setIsVisible] = useState(false);

  // Raw mouse position — updated immediately
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smoothed spring values that trail the raw position
  const springX = useSpring(mouseX, { stiffness: 500, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 500, damping: 30 });

  // Use a ref so event handlers always see the latest hovered state
  const isHoveredRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    // Check pointer precision — coarse means touch/stylus without fine pointer
    const mq = window.matchMedia("(pointer: coarse)");
    setIsPointerFine(!mq.matches);

    const onChange = (e: MediaQueryListEvent) => setIsPointerFine(!e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isPointerFine) return;

    function onMouseMove(e: MouseEvent) {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    }

    function onMouseOver(e: MouseEvent) {
      const target = e.target as Element | null;
      if (!target) return;

      const hoverable =
        target.closest("a")                      !== null ||
        target.closest("button")                 !== null ||
        target.closest("[data-cursor]")           !== null ||
        target.closest("[data-cursor='hover']")   !== null;

      if (hoverable !== isHoveredRef.current) {
        isHoveredRef.current = hoverable;
        setIsHovered(hoverable);
      }
    }

    function onMouseLeave() {
      setIsVisible(false);
    }

    document.addEventListener("mousemove",  onMouseMove);
    document.addEventListener("mouseover",  onMouseOver);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    return () => {
      document.removeEventListener("mousemove",  onMouseMove);
      document.removeEventListener("mouseover",  onMouseOver);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [isPointerFine, isVisible, mouseX, mouseY]);

  // Do not render on SSR or touch devices
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
        translateX:     "-50%",
        translateY:     "-50%",
        opacity:        isVisible ? 1 : 0,
        transition:     "opacity 200ms ease",
      }}
    >
      <motion.div
        animate={{
          width:       isHovered ? 36 : 10,
          height:      isHovered ? 36 : 10,
          borderColor: isHovered ? "#D91C1C" : "#060606",
        }}
        transition={{
          width:       { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
          height:      { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
          borderColor: { duration: 0.15, ease: "easeOut" },
        }}
        style={{
          borderRadius:    "50%",
          border:          "1.5px solid #060606",
          backgroundColor: "transparent",
          willChange:      "width, height, border-color",
        }}
      />
    </motion.div>
  );
}
