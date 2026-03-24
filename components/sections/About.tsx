/* About Section — warm cream background, two-column layout */

export default function About() {
  return (
    <section
      id="about"
      aria-label="About"
      style={{
        backgroundColor: "var(--color-cream)",
        paddingTop: "clamp(96px, 12vw, 192px)",
        paddingBottom: "clamp(96px, 12vw, 192px)",
        paddingLeft: "var(--page-margin)",
        paddingRight: "var(--page-margin)",
      }}
    >
      {/* ── Section label ──────────────────────────────────────────────── */}
      <p
        className="reveal-label"
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--color-ash)",
          marginBottom: "40px",
        }}
      >
        About
      </p>

      {/* ── Heading ────────────────────────────────────────────────────── */}
      <h2
        className="reveal"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif, Georgia, serif",
          fontSize: "clamp(32px, 4.5vw, 64px)",
          fontWeight: 300,
          lineHeight: 1.15,
          color: "var(--color-void)",
          marginBottom: "clamp(48px, 7vw, 80px)",
          maxWidth: "16em",
          letterSpacing: "-0.01em",
        }}
      >
        A person forming
        <br />a distinct visual world.
      </h2>

      {/* ── Two-column layout ──────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "5fr 7fr",
          gap: "clamp(32px, 6vw, 96px)",
          alignItems: "start",
        }}
        className="about-grid"
      >
        {/* Left — decorative number */}
        <div
          className="reveal"
          aria-hidden="true"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif, Georgia, serif",
              fontSize: "clamp(96px, 16vw, 220px)",
              fontWeight: 300,
              lineHeight: 0.85,
              color: "var(--color-ash)",
              opacity: 0.35,
              userSelect: "none",
              letterSpacing: "-0.04em",
            }}
          >
            01
          </span>
        </div>

        {/* Right — body copy */}
        <div
          className="reveal"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            paddingTop: "clamp(8px, 2vw, 24px)",
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: 1.85,
              color: "var(--color-void)",
              maxWidth: "52ch",
            }}
          >
            I am a high school student and emerging creative director based
            in Seoul. My work spans visual concept development, editorial
            direction, and spatial composition.
          </p>

          <p
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: 1.85,
              color: "var(--color-void)",
              maxWidth: "52ch",
            }}
          >
            I am not interested in decoration. I am interested in meaning
            — in the symbolic weight of ordinary objects, in what is implied
            by what is left out, in the emotional charge of negative space.
          </p>

          <p
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: 1.85,
              color: "var(--color-void)",
              maxWidth: "52ch",
            }}
          >
            This site is not a portfolio. It is a position.
          </p>

          {/* Detail line */}
          <p
            className="reveal-label"
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-ash)",
              marginTop: "16px",
              paddingTop: "24px",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            Available for select collaboration
          </p>
        </div>
      </div>

      {/* ── Responsive: stack on small screens ─────────────────────────── */}
      <style>{`
        @media (max-width: 640px) {
          .about-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
