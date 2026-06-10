'use client'

import React from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Session } from '@/types'

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  pending:   { background: '#fefce8', color: '#854d0e', border: '1px solid #fde68a' },
  submitted: { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' },
  complete:  { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
  error:     { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Awaiting customer',
  submitted: 'Analyzing…',
  complete: 'Ready',
  error: 'Error',
}

export default function Dashboard() {
  const { data: authSession, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Delete this session? This cannot be undone.')) return
    setDeleting(id)
    await fetch('/api/sessions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setSessions(s => s.filter(x => x.id !== id))
    setDeleting(null)
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (authSession) {
      fetch('/api/sessions')
        .then(r => r.json())
        .then(d => { setSessions(d.sessions || []); setLoading(false) })
    }
  }, [authSession])

  if (status === 'loading' || !authSession) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3' }}>
      {/* Topbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: '#1a1a18', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
              <rect x="2" y="2" width="5" height="5" rx="1"/>
              <rect x="9" y="2" width="5" height="5" rx="1"/>
              <rect x="2" y="9" width="5" height="5" rx="1"/>
              <rect x="9" y="9" width="5" height="5" rx="1"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Backstory Discovery</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#9a9a96' }}>{authSession.user?.email}</span>
          <button onClick={() => signOut()} style={{ fontSize: 13, color: '#6b6b67', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Discovery sessions</h1>
            <p style={{ fontSize: 13, color: '#9a9a96', margin: '4px 0 0' }}>Generate a discovery link for each customer</p>
          </div>
          <button
            onClick={() => router.push('/sessions/new')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1a1a18', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            New session
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, padding: '64px 32px', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, background: '#f0f0ee', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" fill="none" stroke="#9a9a96" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a18', margin: '0 0 6px' }}>No sessions yet</p>
            <p style={{ fontSize: 13, color: '#9a9a96', margin: '0 0 20px' }}>Create your first session to get started</p>
            <button
              onClick={() => router.push('/sessions/new')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1a1a18', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              New session
            </button>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 500, color: '#9a9a96', letterSpacing: '0.02em' }}>Customer</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 500, color: '#9a9a96' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 500, color: '#9a9a96' }}>Created</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 500, color: '#9a9a96' }}>Status</th>
                  <th style={{ padding: '12px 20px' }} />
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f9f9f7')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1a1a18' }}>{s.customer_name}</td>
                    <td style={{ padding: '14px 20px', color: '#6b6b67' }}>{s.customer_email}</td>
                    <td style={{ padding: '14px 20px', color: '#9a9a96' }}>
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500, ...STATUS_STYLES[s.status] }}>
                        {STATUS_LABELS[s.status]}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        {s.status === 'pending' && (
                          <button
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/discover/${s.id}`)}
                            style={{ fontSize: 12, color: '#6b6b67', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 7, padding: '6px 12px', background: '#fff', cursor: 'pointer' }}
                          >
                            Copy link
                          </button>
                        )}
                        {s.status === 'complete' && (
                          <button
                            onClick={() => router.push(`/results/${s.id}`)}
                            style={{ fontSize: 12, color: '#fff', background: '#1a1a18', border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer' }}
                          >
                            View results
                          </button>
                        )}
                        {s.status === 'submitted' && (
                          <span style={{ fontSize: 12, color: '#9a9a96' }}>Generating…</span>
                        )}
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={deleting === s.id}
                          style={{ fontSize: 12, color: '#9a9a96', border: 'none', background: 'none', cursor: 'pointer', padding: '6px 4px', opacity: deleting === s.id ? 0.4 : 1 }}
                          title="Delete session"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
