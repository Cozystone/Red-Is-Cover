/* Contact Section — light contrast after dark Profile */
/* Replaces previous Contact.tsx */

export default function Contact() {
  return (
    <section
      id="contact"
      aria-label="Contact"
      style={{
        backgroundColor: '#FAF8F5',
        paddingTop: 'clamp(96px, 12vw, 192px)',
        paddingBottom: 'clamp(64px, 8vw, 96px)',
        paddingLeft: 'var(--page-margin)',
        paddingRight: 'var(--page-margin)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        minHeight: '70vh',
        justifyContent: 'space-between',
      }}
    >
      {/* ── Main content (centered) ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(28px, 4vw, 48px)',
          flex: 1,
          justifyContent: 'center',
          paddingBottom: 'clamp(48px, 6vw, 80px)',
          width: '100%',
        }}
      >
        {/* Section label */}
        <p
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#D91C1C',
          }}
        >
          06 — CONTACT
        </p>

        {/* Main heading */}
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(3rem, 7vw, 8rem)',
            fontWeight: 300,
            lineHeight: 1.05,
            color: '#060606',
            letterSpacing: '-0.02em',
          }}
        >
          Begin a
          <br />
          conversation.
        </h2>

        {/* Decorative red circle */}
        <div
          aria-hidden="true"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '2px solid #D91C1C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: '#D91C1C',
              fontSize: '20px',
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1,
            }}
          >
            →
          </span>
        </div>

        {/* Email link */}
        <a
          href="mailto:hello@anseo.world"
          className="contact-email-new"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(1.2rem, 2.5vw, 2.2rem)',
            fontWeight: 300,
            color: '#060606',
            textDecoration: 'none',
            position: 'relative',
          }}
        >
          hello@anseo.world
        </a>

        {/* Social row */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link-underline"
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#8A8A8A',
              textDecoration: 'none',
            }}
          >
            Instagram
          </a>
          <span
            aria-hidden="true"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '10px',
              color: 'rgba(6,6,6,0.2)',
            }}
          >
            —
          </span>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link-underline"
            style={{
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#8A8A8A',
              textDecoration: 'none',
            }}
          >
            LinkedIn
          </a>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer
        style={{
          width: '100%',
          paddingTop: '32px',
          borderTop: '1px solid rgba(6,6,6,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: '10px',
            fontWeight: 400,
            letterSpacing: '0.08em',
            color: '#8A8A8A',
          }}
        >
          &copy; 2025 ANSEO.
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: '10px',
            fontWeight: 400,
            letterSpacing: '0.08em',
            color: '#8A8A8A',
          }}
        >
          Every object tells a story.
        </p>
      </footer>

      {/* ── Email hover style ───────────────────────────────────────────── */}
      <style>{`
        .contact-email-new::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: #D91C1C;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 560ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .contact-email-new:hover::after {
          transform: scaleX(1);
        }
      `}</style>
    </section>
  )
}
