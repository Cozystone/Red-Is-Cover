"use client";

import { useRef, ElementType, ComponentPropsWithoutRef } from "react";
import { motion, useInView } from "framer-motion";

type Variant = "default" | "image" | "label";

// Per-variant hidden → visible keyframes
function getVariants(variant: Variant) {
  switch (variant) {
    case "image":
      return {
        hidden:  { opacity: 0, scale: 0.96 },
        visible: { opacity: 1, scale: 1 },
      };
    case "label":
      return {
        hidden:  { opacity: 0, letterSpacing: "0.3em" },
        visible: { opacity: 1, letterSpacing: "0.18em" },
      };
    case "default":
    default:
      return {
        hidden:  { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0  },
      };
  }
}

// Per-variant transition config
function getTransition(variant: Variant, delay: number) {
  const ease = [0.16, 1, 0.3, 1] as const;

  switch (variant) {
    case "image":
      return { duration: 1.1, ease, delay };
    case "label":
      return { duration: 0.7, ease, delay };
    case "default":
    default:
      return { duration: 0.7, ease, delay };
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

interface ScrollRevealOwnProps {
  /** Stagger delay in seconds */
  delay?: number;
  /** Which set of keyframes to use */
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

type PolymorphicProps<E extends ElementType> = ScrollRevealOwnProps & {
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof ScrollRevealOwnProps | "as">;

type Props<E extends ElementType = "div"> = PolymorphicProps<E>;

// ── Component ──────────────────────────────────────────────────────────────

export default function ScrollReveal<E extends ElementType = "div">({
  as,
  children,
  delay = 0,
  variant = "default",
  className,
  ...rest
}: Props<E>) {
  const ref = useRef<Element>(null);

  const inView = useInView(ref as React.RefObject<Element>, {
    once:   true,
    amount: 0.12,
  });

  const variants   = getVariants(variant);
  const transition = getTransition(variant, delay);

  // motion.create() — correct Framer Motion v12 API for polymorphic elements
  const Tag      = (as ?? "div") as ElementType;
  const MotionTag = motion.create(Tag);

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={transition}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </MotionTag>
  );
}
