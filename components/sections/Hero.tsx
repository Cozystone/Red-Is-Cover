/* Hero Section — OS window aesthetic, provocative framing */

export default function Hero() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        minHeight: "600px",
        backgroundColor: "var(--color-ground)",
        overflow: "hidden",
        border: "1px solid var(--color-void)",
        margin: "0",
      }}
    >
      {/* ── Window Title Bar ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "var(--page-margin)",
          paddingRight: "var(--page-margin)",
          borderBottom: "1px solid var(--color-void)",
          backgroundColor: "var(--color-ground)",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
          {(["#C41E1E", "#D4C17A", "#9A9A9A"] as const).map((color, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: color,
              }}
            />
          ))}
        </div>

        <p
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--color-void)",
          }}
        >
          RED-IS-COVER.WORLD — CREATIVE DIRECTION — 2025
        </p>

        <p
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: "10px",
            letterSpacing: "0.1em",
            color: "var(--color-ash)",
          }}
        >
          [ OPEN ]
        </p>
      </div>

      {/* ── Symbolic Object ───────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "10%",
          right: "var(--page-margin)",
          width: "clamp(180px, 35vw, 480px)",
          opacity: 0.1,
          pointerEvents: "none",
        }}
      >
        <svg viewBox="0 0 400 520" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
          <line x1="200" y1="220" x2="200" y2="510" stroke="var(--color-void)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="200" cy="160" r="58" stroke="var(--color-void)" strokeWidth="1.5" fill="none" />
          <circle cx="200" cy="160" r="88" stroke="var(--color-void)" strokeWidth="0.75" strokeDasharray="4 8" fill="none" />
          <ellipse cx="200" cy="88" rx="18" ry="38" stroke="var(--color-void)" strokeWidth="1" fill="none" />
          <ellipse cx="200" cy="232" rx="18" ry="38" stroke="var(--color-void)" strokeWidth="1" fill="none" />
          <ellipse cx="128" cy="160" rx="38" ry="18" stroke="var(--color-void)" strokeWidth="1" fill="none" />
          <ellipse cx="272" cy="160" rx="38" ry="18" stroke="var(--color-void)" strokeWidth="1" fill="none" />
          <ellipse cx="147" cy="107" rx="18" ry="38" transform="rotate(-45 147 107)" stroke="var(--color-void)" strokeWidth="0.75" fill="none" />
          <ellipse cx="253" cy="107" rx="18" ry="38" transform="rotate(45 253 107)" stroke="var(--color-void)" strokeWidth="0.75" fill="none" />
          <ellipse cx="147" cy="213" rx="18" ry="38" transform="rotate(45 147 213)" stroke="var(--color-void)" strokeWidth="0.75" fill="none" />
          <ellipse cx="253" cy="213" rx="18" ry="38" transform="rotate(-45 253 213)" stroke="var(--color-void)" strokeWidth="0.75" fill="none" />
          <circle cx="200" cy="160" r="5" fill="var(--color-void)" />
          <path d="M200 360 Q160 330 168 380 Q185 395 200 360Z" stroke="var(--color-void)" strokeWidth="1" fill="none" />
          <path d="M200 400 Q240 370 232 420 Q215 435 200 400Z" stroke="var(--color-void)" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* ── Large decorative quotation mark ──────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "44px",
          left: "var(--page-margin)",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(120px, 18vw, 260px)",
          fontWeight: 300,
          lineHeight: 1,
          color: "var(--color-rupture)",
          opacity: 0.12,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        &#8220;
      </div>

      {/* ── Text Block — bottom-left ──────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "var(--page-margin)",
          maxWidth: "min(740px, 90vw)",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <p
          className="reveal-label"
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--color-ash)",
          }}
        >
          Creative Direction — Visual Concept
        </p>

        <h1
          className="reveal"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(48px, 8vw, 120px)",
            fontWeight: 300,
            lineHeight: 1.0,
            color: "var(--color-void)",
            letterSpacing: "-0.02em",
          }}
        >
          &ldquo;The work of<br />staying human.&rdquo;
        </h1>

        {/* Bottom meta row */}
        <div
          className="reveal"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            transitionDelay: "120ms",
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: "10px",
              letterSpacing: "0.12em",
              color: "var(--color-ash)",
            }}
          >
            Scroll to enter →
          </p>
          <div style={{ height: "1px", flex: 1, backgroundColor: "var(--border-subtle)" }} />
          <p
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: "10px",
              letterSpacing: "0.12em",
              color: "var(--color-ash)",
            }}
          >
            Seoul, KR
          </p>
        </div>
      </div>

      {/* ── Bottom status bar ─────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "var(--page-margin)",
          paddingRight: "var(--page-margin)",
          borderTop: "1px solid var(--color-void)",
        }}
      >
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "9px", letterSpacing: "0.18em", color: "var(--color-ash)", textTransform: "uppercase" }}>
          SECTION 00 — INTRO
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "9px", letterSpacing: "0.12em", color: "var(--color-ash)" }}>
          ● READY
        </p>
      </div>
    </section>
  );
}
