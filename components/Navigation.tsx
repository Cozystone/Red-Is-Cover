"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "WORK", href: "#work" },
  { label: "ARCHIVE", href: "#archive" },
  { label: "ABOUT", href: "#about" },
  { label: "CONTACT", href: "#contact" },
] as const;

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll(); // run once on mount
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
        paddingTop: "20px",
        paddingBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: scrolled
          ? "var(--color-cream)"
          : "transparent",
        borderBottom: scrolled
          ? "1px solid var(--border-subtle)"
          : "1px solid transparent",
        transition: `background-color var(--duration-slow) var(--ease-soft),
                     border-color var(--duration-slow) var(--ease-soft)`,
      }}
    >
      {/* LEFT — Monogram */}
      <a
        href="/"
        aria-label="ANSEO — Home"
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--color-void)",
          textDecoration: "none",
        }}
      >
        ANSEO
      </a>

      {/* CENTER — intentionally empty */}
      <div aria-hidden="true" />

      {/* RIGHT — Nav links */}
      <nav role="navigation" aria-label="Main navigation">
        <ul
          style={{
            display: "flex",
            gap: "32px",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="nav-link-underline"
                style={{
                  fontFamily:
                    "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--color-void)",
                  textDecoration: "none",
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
