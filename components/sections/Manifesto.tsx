/* Manifesto Section — offset layout, large serif declarations */

const DECLARATIONS = [
  { text: "Pure, but not obedient.", offset: "0px" },
  { text: "Beauty, with a slight fracture.", offset: "clamp(24px, 4vw, 64px)" },
  { text: "Warmth inside coldness.", offset: "clamp(48px, 8vw, 128px)" },
] as const;

export default function Manifesto() {
  return (
    <section
      id="manifesto"
      aria-label="Manifesto"
      style={{
        backgroundColor: "var(--color-ground)",
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
          marginBottom: "48px",
        }}
      >
        Philosophy
      </p>

      {/* ── Main heading ───────────────────────────────────────────────── */}
      <h2
        className="reveal"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif, Georgia, serif",
          fontSize: "clamp(36px, 5vw, 72px)",
          fontWeight: 300,
          lineHeight: 1.15,
          color: "var(--color-void)",
          maxWidth: "16em",
          marginBottom: "clamp(56px, 8vw, 96px)",
          letterSpacing: "-0.01em",
        }}
      >
        A search for humanity
        <br />
        in a cold, accelerating age.
      </h2>

      {/* ── Declaration lines (staggered offset) ──────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "clamp(16px, 2.5vw, 28px)",
          marginBottom: "clamp(64px, 8vw, 96px)",
        }}
      >
        {DECLARATIONS.map(({ text, offset }, i) => (
          <p
            key={text}
            className="reveal"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif, Georgia, serif",
              fontSize: "clamp(28px, 4vw, 52px)",
              fontWeight: 300,
              lineHeight: 1.3,
              color: "var(--color-void)",
              paddingLeft: offset,
              transitionDelay: `${(i + 1) * 80}ms`,
            }}
          >
            {text}
          </p>
        ))}
      </div>

      {/* ── Body paragraph ─────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "52ch",
          marginBottom: "clamp(40px, 5vw, 64px)",
        }}
      >
        <p
          className="reveal"
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: 1.85,
            color: "var(--color-void)",
          }}
        >
          I am interested in what it means to remain human — in the age of
          speed, short-form consumption, and endless artificial stimulation.
          I am drawn to tenderness, ritual, memory, and objects that still
          carry warmth. This is not nostalgia. This is resistance.
        </p>
      </div>

      {/* ── Pull quote ─────────────────────────────────────────────────── */}
      <blockquote
        className="reveal"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif, Georgia, serif",
          fontSize: "clamp(18px, 2.5vw, 26px)",
          fontWeight: 300,
          fontStyle: "italic",
          lineHeight: 1.5,
          color: "var(--color-void)",
          borderLeft: "1px solid var(--border-subtle)",
          paddingLeft: "clamp(20px, 3vw, 36px)",
          maxWidth: "40em",
        }}
      >
        &ldquo;Gentleness, but with a clear point of view.&rdquo;
      </blockquote>
    </section>
  );
}
