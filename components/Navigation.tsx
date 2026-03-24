"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { num: "01", label: "WORLD",   href: "#world"   },
  { num: "02", label: "WORK",    href: "#work"    },
  { num: "03", label: "ARCHIVE", href: "#archive" },
  { num: "04", label: "ABOUT",   href: "#about"   },
  { num: "05", label: "CONTACT", href: "#contact" },
] as const;

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll while overlay is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* ── Fixed header bar ──────────────────────────────────────────────── */}
      <header
        role="banner"
        style={{
          position:        "fixed",
          top:             0,
          left:            0,
          right:           0,
          zIndex:          200,
          paddingLeft:     "var(--page-margin)",
          paddingRight:    "var(--page-margin)",
          height:          "48px",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "space-between",
          backgroundColor: scrolled ? "rgba(250,248,245,0.95)" : "transparent",
          backdropFilter:  scrolled ? "blur(8px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
          borderBottom:    scrolled
            ? "1px solid rgba(6,6,6,0.1)"
            : "1px solid transparent",
          transition:
            "background-color 560ms cubic-bezier(0.4,0,0.2,1), " +
            "border-color 560ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* LEFT — wordmark */}
        <a
          href="/"
          aria-label="ANSEO — Home"
          style={{
            fontFamily:     "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize:       "11px",
            fontWeight:     500,
            letterSpacing:  "0.2em",
            textTransform:  "uppercase",
            color:          menuOpen ? "#FAF8F5" : "#060606",
            textDecoration: "none",
            position:       "relative",
            zIndex:         210,
            transition:     "color 300ms ease",
          }}
        >
          ANSEO
        </a>

        {/* CENTER — intentionally empty */}
        <div aria-hidden="true" />

        {/* RIGHT — desktop nav links OR mobile hamburger */}
        <div style={{ position: "relative", zIndex: 210 }}>

          {/* Desktop nav — hidden on small screens via inline style + media query */}
          <nav
            role="navigation"
            aria-label="Main navigation"
            className="nav-desktop"
          >
            <ul
              style={{
                display:   "flex",
                gap:       "28px",
                listStyle: "none",
                margin:    0,
                padding:   0,
              }}
            >
              {NAV_LINKS.map(({ num, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="nav-link"
                    style={{
                      fontFamily:     "'DM Sans', 'Helvetica Neue', sans-serif",
                      fontSize:       "10px",
                      fontWeight:     500,
                      letterSpacing:  "0.2em",
                      textTransform:  "uppercase",
                      color:          "#060606",
                      textDecoration: "none",
                      display:        "inline-flex",
                      alignItems:     "baseline",
                      gap:            "5px",
                    }}
                  >
                    <span
                      style={{
                        color:         "#8A8A8A",
                        fontSize:      "8px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {num}
                    </span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="nav-hamburger"
            style={{
              background:     "none",
              border:         "none",
              padding:        "8px",
              display:        "none",
              flexDirection:  "column",
              alignItems:     "flex-end",
              justifyContent: "center",
              gap:            "5px",
            }}
          >
            {/* Top bar */}
            <motion.span
              animate={
                menuOpen
                  ? { rotate: 45, y: 6.5, width: 22 }
                  : { rotate: 0,  y: 0,   width: 22 }
              }
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display:         "block",
                height:          "1.5px",
                width:           22,
                backgroundColor: menuOpen ? "#FAF8F5" : "#060606",
                transformOrigin: "center",
              }}
            />
            {/* Middle bar */}
            <motion.span
              animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                display:         "block",
                height:          "1.5px",
                width:           16,
                backgroundColor: "#060606",
                transformOrigin: "right",
              }}
            />
            {/* Bottom bar */}
            <motion.span
              animate={
                menuOpen
                  ? { rotate: -45, y: -6.5, width: 22 }
                  : { rotate: 0,   y: 0,    width: 22 }
              }
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display:         "block",
                height:          "1.5px",
                width:           22,
                backgroundColor: menuOpen ? "#FAF8F5" : "#060606",
                transformOrigin: "center",
              }}
            />
          </button>
        </div>
      </header>

      {/* ── Mobile full-screen overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {mounted && menuOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)"   }}
            exit={{   opacity: 0, clipPath: "inset(0 0 100% 0)"  }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position:        "fixed",
              inset:           0,
              zIndex:          190,
              backgroundColor: "#060606",
              display:         "flex",
              flexDirection:   "column",
              alignItems:      "flex-start",
              justifyContent:  "center",
              paddingLeft:     "var(--page-margin)",
              paddingRight:    "var(--page-margin)",
            }}
          >
            <nav aria-label="Mobile navigation">
              <ul
                style={{
                  listStyle:     "none",
                  margin:        0,
                  padding:       0,
                  display:       "flex",
                  flexDirection: "column",
                  gap:           "4px",
                }}
              >
                {NAV_LINKS.map(({ num, label, href }, i) => (
                  <motion.li
                    key={label}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay:    0.1 + i * 0.07,
                      duration: 0.5,
                      ease:     [0.16, 1, 0.3, 1],
                    }}
                  >
                    <a
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        fontFamily:     "'Cormorant Garamond', Georgia, serif",
                        fontSize:       "clamp(2rem, 8vw, 3.5rem)",
                        fontWeight:     300,
                        fontStyle:      "normal",
                        color:          "#FAF8F5",
                        textDecoration: "none",
                        lineHeight:     1.15,
                        display:        "inline-flex",
                        alignItems:     "baseline",
                        gap:            "16px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily:    "'DM Sans', sans-serif",
                          fontSize:      "11px",
                          fontWeight:    400,
                          letterSpacing: "0.15em",
                          color:         "rgba(250,248,245,0.3)",
                          alignSelf:     "center",
                        }}
                      >
                        {num}
                      </span>
                      {label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Rupture accent bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position:        "absolute",
                bottom:          "48px",
                left:            "var(--page-margin)",
                width:           "40px",
                height:          "2px",
                background:      "#D91C1C",
                transformOrigin: "left",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Responsive rules ──────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop   { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-desktop   { display: flex !important; }
          .nav-hamburger { display: none !important; }
        }
      `}</style>
    </>
  );
}
