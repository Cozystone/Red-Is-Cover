'use client'

import { useRef, ElementType, ComponentPropsWithoutRef } from 'react'
import { motion, useInView } from 'framer-motion'

type Variant = 'default' | 'image' | 'label'

// Build the hidden/visible keyframes for each variant
function getVariants(variant: Variant) {
  switch (variant) {
    case 'image':
      return {
        hidden: {
          opacity: 0,
          scale: 0.97,
        },
        visible: {
          opacity: 1,
          scale: 1,
        },
      }
    case 'label':
      return {
        hidden: {
          opacity: 0,
          letterSpacing: '0.32em',
        },
        visible: {
          opacity: 1,
          letterSpacing: '0.18em',
        },
      }
    case 'default':
    default:
      return {
        hidden: {
          opacity: 0,
          y: 24,
        },
        visible: {
          opacity: 1,
          y: 0,
        },
      }
  }
}

function getTransition(variant: Variant, delay: number) {
  const ease = [0.16, 1, 0.3, 1] as const

  switch (variant) {
    case 'image':
      return {
        duration: 1.2,
        ease,
        delay,
      }
    case 'label':
      return {
        duration: 0.4,
        ease,
        delay,
      }
    case 'default':
    default:
      return {
        duration: 0.7,
        ease,
        delay,
      }
  }
}

interface ScrollRevealOwnProps {
  /** Optional stagger delay in seconds */
  delay?: number
  /** Visual variant controlling which properties animate */
  variant?: Variant
  className?: string
  children: React.ReactNode
}

// Polymorphic props: allow rendering as any HTML element
type PolymorphicProps<E extends ElementType> = ScrollRevealOwnProps & {
  as?: E
} & Omit<ComponentPropsWithoutRef<E>, keyof ScrollRevealOwnProps | 'as'>

// Default element type
type Props<E extends ElementType = 'div'> = PolymorphicProps<E>

export default function ScrollReveal<E extends ElementType = 'div'>({
  as,
  children,
  delay = 0,
  variant = 'default',
  className,
  ...rest
}: Props<E>) {
  const ref = useRef<Element>(null)

  const inView = useInView(ref as React.RefObject<Element>, {
    once: true,
    amount: 0.15,
  })

  const variants = getVariants(variant)
  const transition = getTransition(variant, delay)

  // Construct the motion element with the correct tag
  const Tag = (as ?? 'div') as ElementType
  const MotionTag = motion.create(Tag)

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </MotionTag>
  )
}
