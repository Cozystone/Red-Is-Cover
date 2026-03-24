/* Manifesto Section — window frame, provocative declarations */

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
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--color-ash)",
          marginBottom: "48px",
        }}
      >
        02 — Philosophy
      </p>

      {/* ── Main heading ───────────────────────────────────────────────── */}
      <h2
        className="reveal"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(36px, 5vw, 72px)",
          fontWeight: 300,
          lineHeight: 1.15,
          color: "var(--color-void)",
          maxWidth: "16em",
          marginBottom: "clamp(56px, 8vw, 96px)",
          letterSpacing: "-0.01em",
        }}
      >
        A search for &ldquo;humanity&rdquo;<br />
        in a cold, accelerating age.
      </h2>

      {/* ── Declaration window ─────────────────────────────────────────── */}
      <div
        className="reveal"
        style={{
          border: "2px solid var(--color-void)",
          marginBottom: "clamp(64px, 8vw, 96px)",
        }}
      >
        {/* Window title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: "1px solid var(--color-void)",
            backgroundColor: "var(--color-void)",
          }}
        >
          <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
            {(["#C41E1E", "#D4C17A", "rgba(255,255,255,0.3)"] as const).map((color, i) => (
              <div
                key={i}
                style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: color }}
              />
            ))}
          </div>
          <span
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: "9px",
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            PHILOSOPHY.TXT
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "9px",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            READ ONLY
          </span>
        </div>

        {/* Declarations */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(16px, 2.5vw, 28px)",
            padding: "clamp(32px, 5vw, 64px) clamp(24px, 4vw, 48px)",
            backgroundColor: "var(--color-ground)",
          }}
        >
          {DECLARATIONS.map(({ text, offset }, i) => (
            <p
              key={text}
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
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
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: 1.85,
            color: "var(--color-void)",
          }}
        >
          I am interested in what it means to remain &ldquo;human&rdquo; — in the age of
          speed, short-form consumption, and endless artificial stimulation.
          I am drawn to tenderness, ritual, memory, and objects that still
          carry warmth. This is not nostalgia. This is resistance.
        </p>
      </div>

      {/* ── Pull quote ─────────────────────────────────────────────────── */}
      <blockquote
        className="reveal"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(18px, 2.5vw, 26px)",
          fontWeight: 300,
          fontStyle: "italic",
          lineHeight: 1.5,
          color: "var(--color-void)",
          borderLeft: "2px solid var(--color-rupture)",
          paddingLeft: "clamp(20px, 3vw, 36px)",
          maxWidth: "40em",
        }}
      >
        &ldquo;Gentleness, but with a clear point of view.&rdquo;
      </blockquote>
    </section>
  );
}
