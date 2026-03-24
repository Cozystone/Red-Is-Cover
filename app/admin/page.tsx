'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!isSupabaseConfigured()) {
        // Mock auth fallback
        if (email === 'admin@anseo.world' && password === 'admin2025') {
          // Set a cookie so middleware lets us through
          document.cookie = 'admin-auth=1; path=/; max-age=86400'
          router.push('/admin/dashboard')
        } else {
          setError('Invalid credentials.')
        }
        return
      }

      const { error: authError } = await supabase!.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      router.push('/admin/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#060606',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        cursor: 'default',
      }}
    >
      <div
        style={{
          backgroundColor: '#111111',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '48px',
          maxWidth: '400px',
          width: '90%',
        }}
      >
        {/* Window chrome */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', gap: '5px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'inline-block',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#8A8A8A',
            }}
          >
            ADMIN.ACCESS
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '48px',
            fontWeight: 300,
            color: '#FAF8F5',
            lineHeight: 1,
            marginBottom: '40px',
          }}
        >
          Enter.
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#FAF8F5',
              padding: '12px 16px',
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: '13px',
              outline: 'none',
              borderRadius: 0,
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#D91C1C')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#FAF8F5',
              padding: '12px 16px',
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: '13px',
              outline: 'none',
              borderRadius: 0,
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#D91C1C')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
          />

          {error && (
            <p
              style={{
                fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
                fontSize: '12px',
                color: '#D91C1C',
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#8A1010' : '#D91C1C',
              color: '#ffffff',
              fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '14px',
              border: 'none',
              cursor: loading ? 'default' : 'default',
              transition: 'background-color 0.2s ease',
              marginTop: '8px',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#B51818'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#D91C1C'
            }}
          >
            {loading ? 'ENTERING...' : 'ENTER'}
          </button>
        </form>
      </div>
    </div>
  )
}
