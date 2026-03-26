/* World Section — replaces Manifesto.tsx */
/* Dark near-black background. Bold red accents. */

const DECLARATIONS = [
  'Pure, but not obedient.',
  'Beauty, with a slight fracture.',
  'Warmth inside coldness.',
] as const

export default function World() {
  return (
    <section
      id="world"
      aria-label="World"
      style={{
        backgroundColor: '#060606',
        paddingTop: 'clamp(120px, 14vw, 200px)',
        paddingBottom: 'clamp(120px, 14vw, 200px)',
        paddingLeft: 'var(--page-margin)',
        paddingRight: 'var(--page-margin)',
      }}
    >
      {/* ── Section label — RED ───────────────────────────────────────────── */}
      <p
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#D91C1C',
          marginBottom: '24px',
        }}
      >
        02 — WORLD
      </p>

      {/* ── Thick red horizontal bar ──────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          height: '2px',
          width: '100%',
          backgroundColor: '#D91C1C',
          marginBottom: '64px',
        }}
      />

      {/* ── Main headline ─────────────────────────────────────────────────── */}
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(48px, 7vw, 110px)',
          fontWeight: 300,
          color: '#FAF8F5',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          marginBottom: 'clamp(64px, 8vw, 96px)',
          maxWidth: '20em',
        }}
      >
        A search for{' '}
        <em
          style={{
            fontStyle: 'italic',
            color: '#D91C1C',
          }}
        >
          &ldquo;humanity&rdquo;
        </em>
        <br />
        in a cold,
        <br />
        accelerating age.
      </h2>

      {/* ── Declaration window ────────────────────────────────────────────── */}
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.15)',
          marginBottom: 'clamp(64px, 8vw, 96px)',
        }}
      >
        {/* Window title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 20px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
            {(['#D91C1C', '#C9B55A', 'rgba(255,255,255,0.25)'] as const).map((color, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: '9px',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            DECLARATIONS.TXT
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '9px',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            READ ONLY
          </span>
        </div>

        {/* Declarations content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(16px, 2.5vw, 28px)',
            padding: 'clamp(32px, 5vw, 64px) clamp(24px, 4vw, 48px)',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          {DECLARATIONS.map((text, i) => (
            <p
              key={text}
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(22px, 3.5vw, 48px)',
                fontWeight: 300,
                lineHeight: 1.3,
                color: '#FAF8F5',
                paddingLeft: `calc(${i} * clamp(16px, 3vw, 48px))`,
              }}
            >
              {text}
            </p>
          ))}
        </div>
      </div>

      {/* ── Body paragraph ────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: '50ch',
          marginBottom: 'clamp(40px, 5vw, 64px)',
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: 1.9,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          I am interested in what it means to remain human — in the age of speed,
          short-form consumption, and endless artificial stimulation. I am drawn
          to tenderness, ritual, memory, and objects that still carry warmth.
        </p>
      </div>

      {/* ── Pull quote ────────────────────────────────────────────────────── */}
      <blockquote
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(18px, 2.5vw, 28px)',
          fontWeight: 300,
          fontStyle: 'italic',
          lineHeight: 1.55,
          color: 'rgba(255,255,255,0.8)',
          borderLeft: '3px solid #D91C1C',
          paddingLeft: '32px',
          maxWidth: '40em',
          margin: 0,
        }}
      >
        Gentleness, but with a clear point of view.
      </blockquote>
    </section>
  )
}
