'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  // Track whether the cursor is in a hover state
  const [isHovered, setIsHovered] = useState(false)
  // Track whether the cursor is visible at all (hidden until first mouse move)
  const [isVisible, setIsVisible] = useState(false)
  // Track mobile: if window width < 768 we skip rendering entirely
  const [isMobile, setIsMobile] = useState(false)

  // Raw mouse position values
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Smoothed spring values that trail behind the cursor
  const springX = useSpring(mouseX, { stiffness: 400, damping: 28 })
  const springY = useSpring(mouseY, { stiffness: 400, damping: 28 })

  useEffect(() => {
    // Detect mobile on mount and on resize
    function checkMobile() {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return

    function onMouseMove(e: MouseEvent) {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    function onMouseOver(e: MouseEvent) {
      const target = e.target as Element
      if (!target) return

      // Detect hoverable elements: links, buttons, or elements with cursor-hover class
      const isHoverable =
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        target.closest('[data-cursor="hover"]') !== null ||
        target.closest('.cursor-hover') !== null

      setIsHovered(isHoverable)
    }

    function onMouseLeave() {
      setIsVisible(false)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)
    document.documentElement.addEventListener('mouseleave', onMouseLeave)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.documentElement.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [isMobile, isVisible, mouseX, mouseY])

  // On mobile: render nothing
  if (isMobile) return null

  // Cursor dimensions
  const size = isHovered ? 32 : 12

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9999]"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <motion.div
        animate={{
          width: size,
          height: size,
          borderColor: isHovered ? '#C41E1E' : '#0A0A0A',
        }}
        transition={{
          duration: 0.08,
          ease: 'easeOut',
        }}
        style={{
          borderRadius: '50%',
          border: '1px solid #0A0A0A',
          backgroundColor: 'transparent',
          // Ensure crisp rendering
          willChange: 'width, height, border-color',
        }}
      />
    </motion.div>
  )
}
