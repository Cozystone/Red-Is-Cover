/* Contact Section — dark cinematic ending */

export default function Contact() {
  return (
    <section
      id="contact"
      aria-label="Contact"
      style={{
        position:        'relative',
        backgroundColor: '#060606',
        paddingTop:      'clamp(96px, 12vw, 180px)',
        paddingBottom:   'clamp(48px, 6vw, 80px)',
        paddingLeft:     'var(--page-margin)',
        paddingRight:    'var(--page-margin)',
        minHeight:       '75vh',
        display:         'flex',
        flexDirection:   'column',
        justifyContent:  'space-between',
        overflow:        'hidden',
      }}
    >
      {/* ── Huge background numeral ──────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:    'absolute',
          right:       'calc(var(--page-margin) - 20px)',
          bottom:      '-40px',
          fontFamily:  '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize:    'clamp(200px, 30vw, 420px)',
          fontWeight:  300,
          lineHeight:  1,
          color:       'rgba(217,28,28,0.06)',
          userSelect:  'none',
          pointerEvents: 'none',
        }}
      >
        06
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div>
        {/* Label */}
        <p
          style={{
            fontFamily:    "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize:      '10px',
            fontWeight:    500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color:         '#D91C1C',
            marginBottom:  '48px',
          }}
        >
          06 — CONTACT
        </p>

        {/* Red divider */}
        <div
          aria-hidden="true"
          style={{ height: '1px', width: '100%', backgroundColor: 'rgba(217,28,28,0.25)', marginBottom: '64px' }}
        />

        {/* Headline */}
        <h2
          style={{
            fontFamily:    '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize:      'clamp(3.5rem, 7vw, 9rem)',
            fontWeight:    300,
            lineHeight:    1.0,
            color:         '#FAF8F5',
            letterSpacing: '-0.02em',
            marginBottom:  'clamp(48px, 6vw, 80px)',
          }}
        >
          Begin a<br />
          <em style={{ color: '#D91C1C', fontStyle: 'italic' }}>conversation.</em>
        </h2>

        {/* Email + social row */}
        <div
          style={{
            display:        'flex',
            flexWrap:       'wrap',
            alignItems:     'baseline',
            gap:            '40px',
            marginBottom:   'clamp(64px, 8vw, 96px)',
          }}
        >
          <a
            href="mailto:hello@red-is-cover.world"
            className="contact-email"
            style={{
              fontFamily:    '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize:      'clamp(1.3rem, 2.5vw, 2.2rem)',
              fontWeight:    300,
              color:         '#FAF8F5',
              textDecoration: 'none',
              position:      'relative',
            }}
          >
            hello@red-is-cover.world
          </a>

          <div style={{ display: 'flex', gap: '28px' }}>
            {['Instagram', 'LinkedIn'].map((s) => (
              <a
                key={s}
                href={s === 'Instagram' ? 'https://instagram.com' : 'https://linkedin.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link-underline"
                style={{
                  fontFamily:    "'DM Sans', 'Helvetica Neue', sans-serif",
                  fontSize:      '10px',
                  fontWeight:    500,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color:         'rgba(255,255,255,0.4)',
                  textDecoration: 'none',
                }}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer bar ──────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop:      '1px solid rgba(255,255,255,0.08)',
          paddingTop:     '24px',
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          flexWrap:       'wrap',
          gap:            '12px',
        }}
      >
        <p
          style={{
            fontFamily:    "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize:      '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color:         'rgba(255,255,255,0.25)',
          }}
        >
          © 2025 RED IS COVER
        </p>
        <p
          style={{
            fontFamily:    "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize:      '9px',
            letterSpacing: '0.12em',
            color:         'rgba(255,255,255,0.25)',
          }}
        >
          Every object tells a story.
        </p>
        <p
          style={{
            fontFamily:    "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize:      '9px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         '#D91C1C',
          }}
        >
          ● SEOUL, KR
        </p>
      </footer>

      <style>{`
        .contact-email::after {
          content: '';
          position: absolute;
          bottom: -3px; left: 0;
          width: 100%; height: 1px;
          background: #D91C1C;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 560ms cubic-bezier(0.16,1,0.3,1);
        }
        .contact-email:hover::after { transform: scaleX(1); }
      `}</style>
    </section>
  )
}
