/* Hero Section — 100svh, anchored bottom-left content, symbolic SVG top-right */

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
      }}
    >
      {/* ── Symbolic Object — Minimalist Flower (upper-right) ──────────────── */}
      <div
        className="reveal-image"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "5%",
          right: "var(--page-margin)",
          width: "clamp(200px, 40vw, 560px)",
          opacity: 0.15,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <svg
          viewBox="0 0 400 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto" }}
          aria-hidden="true"
        >
          {/* Stem */}
          <line
            x1="200"
            y1="220"
            x2="200"
            y2="510"
            stroke="var(--color-void)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Center circle */}
          <circle
            cx="200"
            cy="160"
            r="58"
            stroke="var(--color-void)"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Outer thin ring */}
          <circle
            cx="200"
            cy="160"
            r="88"
            stroke="var(--color-void)"
            strokeWidth="0.75"
            strokeDasharray="4 8"
            fill="none"
          />
          {/* Petal top */}
          <ellipse
            cx="200"
            cy="88"
            rx="18"
            ry="38"
            stroke="var(--color-void)"
            strokeWidth="1"
            fill="none"
          />
          {/* Petal bottom */}
          <ellipse
            cx="200"
            cy="232"
            rx="18"
            ry="38"
            stroke="var(--color-void)"
            strokeWidth="1"
            fill="none"
          />
          {/* Petal left */}
          <ellipse
            cx="128"
            cy="160"
            rx="38"
            ry="18"
            stroke="var(--color-void)"
            strokeWidth="1"
            fill="none"
          />
          {/* Petal right */}
          <ellipse
            cx="272"
            cy="160"
            rx="38"
            ry="18"
            stroke="var(--color-void)"
            strokeWidth="1"
            fill="none"
          />
          {/* Diagonal petal top-left */}
          <ellipse
            cx="147"
            cy="107"
            rx="18"
            ry="38"
            transform="rotate(-45 147 107)"
            stroke="var(--color-void)"
            strokeWidth="0.75"
            fill="none"
          />
          {/* Diagonal petal top-right */}
          <ellipse
            cx="253"
            cy="107"
            rx="18"
            ry="38"
            transform="rotate(45 253 107)"
            stroke="var(--color-void)"
            strokeWidth="0.75"
            fill="none"
          />
          {/* Diagonal petal bottom-left */}
          <ellipse
            cx="147"
            cy="213"
            rx="18"
            ry="38"
            transform="rotate(45 147 213)"
            stroke="var(--color-void)"
            strokeWidth="0.75"
            fill="none"
          />
          {/* Diagonal petal bottom-right */}
          <ellipse
            cx="253"
            cy="213"
            rx="18"
            ry="38"
            transform="rotate(-45 253 213)"
            stroke="var(--color-void)"
            strokeWidth="0.75"
            fill="none"
          />
          {/* Inner dot */}
          <circle
            cx="200"
            cy="160"
            r="5"
            fill="var(--color-void)"
          />
          {/* Leaf left */}
          <path
            d="M200 360 Q160 330 168 380 Q185 395 200 360Z"
            stroke="var(--color-void)"
            strokeWidth="1"
            fill="none"
          />
          {/* Leaf right */}
          <path
            d="M200 400 Q240 370 232 420 Q215 435 200 400Z"
            stroke="var(--color-void)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      {/* ── Text Block — bottom-left ──────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "var(--page-margin)",
          maxWidth: "min(680px, 90vw)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Label */}
        <p
          className="reveal-label"
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-ash)",
          }}
        >
          Creative Direction — Visual Concept
        </p>

        {/* Main Statement */}
        <h1
          className="reveal"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif, Georgia, serif",
            fontSize: "clamp(48px, 8vw, 120px)",
            fontWeight: 300,
            lineHeight: 1.05,
            color: "var(--color-void)",
            whiteSpace: "pre-line",
            letterSpacing: "-0.01em",
          }}
        >
          {"The work of\nstaying human."}
        </h1>

        {/* Scroll hint */}
        <p
          className="reveal"
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif, 'Helvetica Neue', sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            letterSpacing: "0.08em",
            color: "var(--color-ash)",
            transitionDelay: "80ms",
          }}
        >
          Scroll to enter →
        </p>
      </div>

      {/* ── Bottom rule ──────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: "var(--border-subtle)",
        }}
      />
    </section>
  );
}
