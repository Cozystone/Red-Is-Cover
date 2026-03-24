"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "WORK", num: "01", href: "#work" },
  { label: "ARCHIVE", num: "02", href: "#archive" },
  { label: "ABOUT", num: "03", href: "#about" },
  { label: "CONTACT", num: "04", href: "#contact" },
] as const;

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      role="banner"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingLeft: "var(--page-margin)",
        paddingRight: "var(--page-margin)",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: scrolled ? "var(--color-cream)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--color-void)" : "1px solid transparent",
        transition: `background-color var(--duration-slow) var(--ease-soft),
                     border-color var(--duration-slow) var(--ease-soft)`,
      }}
    >
      {/* LEFT — Monogram */}
      <a
        href="/"
        aria-label="ANSEO — Home"
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--color-void)",
          textDecoration: "none",
        }}
      >
        ANSEO
      </a>

      {/* CENTER — empty */}
      <div aria-hidden="true" />

      {/* RIGHT — Nav links */}
      <nav role="navigation" aria-label="Main navigation">
        <ul
          style={{
            display: "flex",
            gap: "28px",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {NAV_LINKS.map(({ label, num, href }) => (
            <li key={label}>
              <a
                href={href}
                className="nav-link-underline"
                style={{
                  fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-void)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    color: "var(--color-ash)",
                    fontSize: "8px",
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
    </header>
  );
}
