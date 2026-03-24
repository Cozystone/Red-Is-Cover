/* Landing Section — cinematic dark gallery entrance */
/* Replaces Hero.tsx */

import GrassField from '@/components/ui/GrassField'

export default function Landing() {
  return (
    <section
      id="landing"
      aria-label="Landing"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',          // fills the absolute parent in page.tsx
        background: 'linear-gradient(180deg, #B00015 0%, #7A0010 70%, #3A0008 100%)',
        overflow: 'hidden',
      }}
    >
      {/* ── Red vertical bar — left edge ─────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '6px',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 10,
        }}
      />

      {/* ── Window title bar ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 'calc(var(--page-margin) + 6px)',
          paddingRight: 'var(--page-margin)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 5,
        }}
      >
        {/* Left — three dots */}
        <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
          {(['#D91C1C', '#C9B55A', '#8A8A8A'] as const).map((color, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: color,
              }}
            />
          ))}
        </div>

        {/* Center — title */}
        <p
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: '9px',
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          RED-IS-COVER.WORLD — ENTERING
        </p>

        {/* Right — year */}
        <p
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: '9px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          2025
        </p>
      </div>

      {/* ── Flower SVG — top right, ghost white ──────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '8%',
          right: 'var(--page-margin)',
          width: 'clamp(180px, 32vw, 460px)',
          opacity: 0.08,
          pointerEvents: 'none',
          color: 'white',
        }}
      >
        <svg
          viewBox="0 0 400 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: 'auto' }}
        >
          <line x1="200" y1="220" x2="200" y2="510" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="200" cy="160" r="58" stroke="white" strokeWidth="1.5" fill="none" />
          <circle cx="200" cy="160" r="88" stroke="white" strokeWidth="0.75" strokeDasharray="4 8" fill="none" />
          <ellipse cx="200" cy="88" rx="18" ry="38" stroke="white" strokeWidth="1" fill="none" />
          <ellipse cx="200" cy="232" rx="18" ry="38" stroke="white" strokeWidth="1" fill="none" />
          <ellipse cx="128" cy="160" rx="38" ry="18" stroke="white" strokeWidth="1" fill="none" />
          <ellipse cx="272" cy="160" rx="38" ry="18" stroke="white" strokeWidth="1" fill="none" />
          <ellipse cx="147" cy="107" rx="18" ry="38" transform="rotate(-45 147 107)" stroke="white" strokeWidth="0.75" fill="none" />
          <ellipse cx="253" cy="107" rx="18" ry="38" transform="rotate(45 253 107)" stroke="white" strokeWidth="0.75" fill="none" />
          <ellipse cx="147" cy="213" rx="18" ry="38" transform="rotate(45 147 213)" stroke="white" strokeWidth="0.75" fill="none" />
          <ellipse cx="253" cy="213" rx="18" ry="38" transform="rotate(-45 253 213)" stroke="white" strokeWidth="0.75" fill="none" />
          <circle cx="200" cy="160" r="5" fill="white" />
          <path d="M200 360 Q160 330 168 380 Q185 395 200 360Z" stroke="white" strokeWidth="1" fill="none" />
          <path d="M200 400 Q240 370 232 420 Q215 435 200 400Z" stroke="white" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* ── Large decorative quote mark ───────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '44px',
          left: 'calc(var(--page-margin) + 6px)',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(100px, 16vw, 220px)',
          fontWeight: 300,
          lineHeight: 0.8,
          color: 'white',
          opacity: 0.12,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        &#8220;
      </div>

      {/* ── Main content — bottom-left anchor ────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: '22%',
          left: 'calc(var(--page-margin) + 6px)',
          maxWidth: 'min(760px, 88vw)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          zIndex: 5,
        }}
      >
        {/* Top label */}
        <p
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          CREATIVE DIRECTION — VISUAL CONCEPT — SEOUL
        </p>

        {/* Hero headline */}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(56px, 9vw, 140px)',
            fontWeight: 300,
            lineHeight: 1.0,
            color: '#FAF8F5',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          The work of
          <br />
          staying human.
        </h1>

        {/* Bottom meta row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            Scroll to enter →
          </p>
          <div
            style={{
              height: '1px',
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.12)',
            }}
          />
          <p
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            Seoul, KR
          </p>
        </div>
      </div>

      {/* ── Grass field — bottom of section ──────────────────────────────── */}
      <GrassField />

      {/* ── Bottom status bar ─────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 'calc(var(--page-margin) + 6px)',
          paddingRight: 'var(--page-margin)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          zIndex: 5,
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '9px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#8A8A8A',
          }}
        >
          SECTION 00 — ENTRY
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '9px',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          ● READY
        </p>
      </div>
    </section>
  )
}
