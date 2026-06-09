'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewSession() {
  const { data: authSession } = useSession()
  const router = useRouter()
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ id: string; link: string } | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCreate() {
    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Both fields are required.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, customerEmail }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong.')
      setLoading(false)
      return
    }

    const link = `${window.location.origin}/discover/${data.session.id}`
    setCreated({ id: data.session.id, link })
    setLoading(false)
  }

  function copyLink() {
    if (!created) return
    navigator.clipboard.writeText(created.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', height: 52, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 8, position: 'sticky', top: 0 }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{ fontSize: 13, color: '#9a9a96', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          ← Back
        </button>
        <span style={{ color: 'rgba(0,0,0,0.2)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>New session</span>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Create discovery session</h1>
        <p style={{ fontSize: 13, color: '#9a9a96', margin: '0 0 32px' }}>
          Enter the customer&apos;s details to generate a unique discovery link.
        </p>

        {!created ? (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, padding: 24 }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, padding: '12px 16px', fontSize: 13, marginBottom: 20 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1a1a18', marginBottom: 6 }}>Customer / company name</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Acme Corp"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1a1a18', marginBottom: 6 }}>Customer contact email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="ops@acme.com"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={loading}
              style={{ width: '100%', background: '#1a1a18', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.4 : 1 }}
            >
              {loading ? 'Creating…' : 'Create session'}
            </button>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Session created</div>
                <div style={{ fontSize: 12, color: '#9a9a96' }}>Send this link to {customerName}</div>
              </div>
            </div>

            <div style={{ background: '#f5f5f3', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b6b67', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{created.link}</span>
              <button
                onClick={copyLink}
                style={{ fontSize: 12, fontWeight: 500, color: '#1a1a18', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <p style={{ fontSize: 12, color: '#9a9a96', marginBottom: 24, lineHeight: 1.6 }}>
              Results will appear in your dashboard once the customer submits.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{ flex: 1, background: '#fff', color: '#1a1a18', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, padding: '9px 16px', fontSize: 13, cursor: 'pointer' }}
              >
                Dashboard
              </button>
              <button
                onClick={() => { setCreated(null); setCustomerName(''); setCustomerEmail('') }}
                style={{ flex: 1, background: '#1a1a18', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                Create another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
