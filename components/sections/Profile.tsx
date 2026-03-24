/* Profile Section — replaces About.tsx */
/* Dark dossier / coordinates aesthetic */

const DOSSIER_ROWS: { key: string; value: string }[] = [
  { key: 'SUBJECT', value: 'ANSEO' },
  { key: 'STATUS', value: 'Emerging Creative Director' },
  { key: 'BORN', value: '2007, Seoul, Korea' },
  { key: 'SCHOOL', value: 'High School Student' },
  { key: 'MEDIUM', value: 'Visual Concept, Image Direction, Editorial' },
  { key: 'QUESTION', value: 'What does it mean to remain human?' },
  { key: 'LANGUAGE', value: 'Objects, Space, Light, Absence' },
  { key: 'POSITION', value: 'Building a distinct visual world.' },
  { key: 'CURRENTLY', value: 'Searching.' },
]

const BELIEF_STATEMENTS = [
  { text: 'I am not interested in decoration.', indent: '0px' },
  { text: 'I am interested in meaning.', indent: 'clamp(24px, 5vw, 80px)' },
  { text: 'This site is not a portfolio. It is a position.', indent: 'clamp(48px, 10vw, 160px)' },
] as const

export default function Profile() {
  return (
    <section
      id="about"
      aria-label="Profile"
      style={{
        backgroundColor: '#060606',
        paddingTop: 'clamp(120px, 14vw, 200px)',
        paddingBottom: 'clamp(120px, 14vw, 200px)',
        paddingLeft: 'var(--page-margin)',
        paddingRight: 'var(--page-margin)',
      }}
    >
      {/* ── Section label ─────────────────────────────────────────────────── */}
      <p
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#D91C1C',
          marginBottom: '40px',
        }}
      >
        05 — PROFILE
      </p>

      {/* ── Heading ───────────────────────────────────────────────────────── */}
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(4rem, 8vw, 9rem)',
          fontWeight: 300,
          color: '#FAF8F5',
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
          marginBottom: 'clamp(48px, 6vw, 80px)',
        }}
      >
        Subject.
      </h2>

      {/* ── Dossier card ──────────────────────────────────────────────────── */}
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.12)',
          marginBottom: 'clamp(64px, 8vw, 96px)',
          maxWidth: '800px',
        }}
      >
        {/* Window chrome title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 20px',
            backgroundColor: 'rgba(255,255,255,0.04)',
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
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            PROFILE.DOC — CLASSIFIED
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '9px',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.2)',
            }}
          >
            READ ONLY
          </span>
        </div>

        {/* Dossier key-value rows */}
        <div
          style={{
            padding: 'clamp(24px, 4vw, 40px) clamp(20px, 3vw, 36px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
          }}
        >
          {DOSSIER_ROWS.map(({ key, value }, i) => (
            <div
              key={key}
              style={{
                display: 'grid',
                gridTemplateColumns: 'clamp(100px, 20%, 160px) 16px 1fr',
                alignItems: 'baseline',
                gap: '0',
                padding: 'clamp(10px, 1.5vw, 16px) 0',
                borderBottom:
                  i < DOSSIER_ROWS.length - 1
                    ? '1px solid rgba(255,255,255,0.06)'
                    : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#8A8A8A',
                  lineHeight: 1.4,
                }}
              >
                {key}
              </span>
              <span
                aria-hidden="true"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.2)',
                  textAlign: 'center',
                }}
              >
                :
              </span>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(16px, 2vw, 22px)',
                  fontWeight: 300,
                  color: '#FAF8F5',
                  lineHeight: 1.3,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Belief statements ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(16px, 2.5vw, 28px)',
          marginBottom: 'clamp(56px, 7vw, 80px)',
        }}
      >
        {BELIEF_STATEMENTS.map(({ text, indent }) => (
          <p
            key={text}
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.3rem, 2.8vw, 2.4rem)',
              fontWeight: 300,
              color: '#FAF8F5',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              paddingLeft: indent,
            }}
          >
            {text}
          </p>
        ))}
      </div>

      {/* ── Small detail text ─────────────────────────────────────────────── */}
      <p
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: '10px',
          letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
        }}
      >
        Available for select collaboration. Based in Seoul, Korea.
      </p>
    </section>
  )
}
