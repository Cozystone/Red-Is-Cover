/* Contact Section — dark void background, centered composition */

export default function Contact() {
  return (
    <section
      id="contact"
      aria-label="Contact"
      style={{
        backgroundColor: "var(--color-void)",
        paddingTop: "clamp(96px, 12vw, 192px)",
        paddingBottom: "clamp(64px, 8vw, 96px)",
        paddingLeft: "var(--page-margin)",
        paddingRight: "var(--page-margin)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        minHeight: "70vh",
        justifyContent: "space-between",
      }}
    >
      {/* ── Main content (centered) ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(28px, 4vw, 48px)",
          flex: 1,
          justifyContent: "center",
          paddingBottom: "clamp(48px, 6vw, 80px)",
        }}
      >
        {/* Section label */}
        <p
          className="reveal-label"
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#666666",
          }}
        >
          Contact
        </p>

        {/* Main heading */}
        <h2
          className="reveal"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif, Georgia, serif",
            fontSize: "clamp(40px, 6vw, 88px)",
            fontWeight: 300,
            lineHeight: 1.1,
            color: "var(--color-ground)",
            letterSpacing: "-0.01em",
          }}
        >
          Begin a conversation.
        </h2>

        {/* Email link */}
        <a
          href="mailto:hello@anseo.world"
          className="contact-email reveal"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif, Georgia, serif",
            fontSize: "clamp(18px, 2.5vw, 28px)",
            fontWeight: 300,
            color: "var(--color-ground)",
            textDecoration: "none",
            position: "relative",
            transitionDelay: "80ms",
          }}
        >
          hello@anseo.world
        </a>

        {/* Social links */}
        <div
          className="reveal"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            transitionDelay: "160ms",
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              color: "#666666",
              letterSpacing: "0.04em",
            }}
          >
            or find me on
          </p>

          <div
            style={{
              display: "flex",
              gap: "32px",
            }}
          >
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link-underline"
              style={{
                fontFamily:
                  "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-ground)",
                textDecoration: "none",
              }}
            >
              Instagram
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link-underline"
              style={{
                fontFamily:
                  "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-ground)",
                textDecoration: "none",
              }}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "24px",
          borderTop: "1px solid rgba(250, 248, 245, 0.08)",
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            letterSpacing: "0.04em",
            color: "#444444",
          }}
        >
          &copy; 2025
        </p>

        <p
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            letterSpacing: "0.04em",
            color: "#444444",
            textAlign: "right",
          }}
        >
          Every object tells a story.
        </p>
      </footer>

      {/* ── Email hover underline in rupture color ─────────────────────── */}
      <style>{`
        .contact-email::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: var(--color-rupture);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform var(--duration-slow) var(--ease-out-expo);
        }
        .contact-email:hover::after {
          transform: scaleX(1);
        }
        .contact-email:hover {
          color: var(--color-ground);
        }
      `}</style>
    </section>
  );
}
