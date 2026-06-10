'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Session, Recommendations, ProfileRecommendation } from '@/types'

const SETTING_NAMES: Record<string, string> = {
  intakeData:'Intake Data', transcriptIntake:'Transcript Intake', displayData:'Display Data',
  pushData:'Push Data', emailSync:'Email Sync', meetingSync:'Meeting Sync',
  contactCreation:'Contact Creation', contactRoleCreation:'Contact Role Creation'
}

function str(v: any): string {
  return typeof v === 'string' ? v : JSON.stringify(v)
}

function ProfileCard({ profile, index, forceOpen }: { profile: ProfileRecommendation, index: number, forceOpen?: boolean }) {
  const [open, setOpen] = useState(false)
  const isOpen = forceOpen || open
  const settings = profile.settings || {}
  const on = Object.entries(settings).filter(([,v])=>v).map(([k])=>SETTING_NAMES[k]).filter(Boolean)
  const off = Object.entries(settings).filter(([,v])=>!v).map(([k])=>SETTING_NAMES[k]).filter(Boolean)
  const filters = profile.eligibilityFilters || []
  const rankings = profile.rankingGroups || []

  return (
    <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 14, overflow: 'hidden', marginBottom: 8, background: '#fff' }}>
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ width: 28, height: 28, background: '#1a1a18', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#fff' }}>
            {index + 1}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a18' }}>{profile.name}</div>
            <div style={{ fontSize: 12, color: '#9a9a96', marginTop: 1 }}>{(profile.targetRoles || []).join(', ')}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Mini stats */}
          <span style={{ fontSize: 11, color: '#6b6b67', background: '#f5f5f3', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '3px 8px' }}>
            {on.length} features on
          </span>
          <span style={{ fontSize: 11, color: '#6b6b67', background: '#f5f5f3', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '3px 8px' }}>
            {filters.length} filter{filters.length !== 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: 11, color: '#6b6b67', background: '#f5f5f3', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '3px 8px' }}>
            {rankings.length} ranking{rankings.length !== 1 ? 's' : ''}
          </span>
          <svg width="16" height="16" fill="none" stroke="#9a9a96" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>

          {/* Settings */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9a9a96', marginBottom: 10 }}>Feature toggles</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {on.map(s => (
                <span key={s} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>✓ {s}</span>
              ))}
              {off.map(s => (
                <span key={s} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, background: '#f5f5f5', color: '#bbb', border: '1px solid #e5e5e5', textDecoration: 'line-through' }}>{s}</span>
              ))}
            </div>
            {profile.notificationSetting && (
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                  {profile.notificationSetting} notifications
                </span>
              </div>
            )}
          </div>

          {/* Rationale */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9a9a96', marginBottom: 8 }}>Rationale</div>
            <p style={{ fontSize: 13, color: '#6b6b67', lineHeight: 1.6, margin: 0 }}>{str(profile.reason)}</p>
            {(profile.specialConsiderations || []).map((c, i) => (
              <div key={i} style={{ marginTop: 8, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#854d0e' }}>⚠ {str(c)}</div>
            ))}
          </div>

          {/* Eligibility Filters */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9a9a96', marginBottom: 10 }}>
              Eligibility filters <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#bbb' }}>({filters.length})</span>
            </div>
            {filters.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9a9a96', margin: 0 }}>No eligibility filters — all records eligible by default.</p>
            ) : filters.map((f, i) => (
              <div key={i} style={{ background: '#f9f9f7', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '12px 14px', marginBottom: i < filters.length - 1 ? 8 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18' }}>{str(f.name)}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', flexShrink: 0 }}>{str(f.object)}</span>
                </div>
                <code style={{ display: 'block', fontSize: 12, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', marginBottom: 6, color: '#1a1a18' }}>{str(f.rule)}</code>
                <p style={{ fontSize: 12, color: '#6b6b67', margin: 0, lineHeight: 1.5 }}>{str(f.reason)}</p>
              </div>
            ))}
          </div>

          {/* Ranking Groups */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9a9a96', marginBottom: 10 }}>
              Ranking groups <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#bbb' }}>({rankings.length})</span>
            </div>
            {rankings.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9a9a96', margin: 0 }}>No ranking groups — default score-based ranking applies.</p>
            ) : rankings.map((g, i) => (
              <div key={i} style={{ background: '#f9f9f7', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '12px 14px', marginBottom: i < rankings.length - 1 ? 8 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18' }}>{str(g.name)}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#fffbeb', color: '#854d0e', border: '1px solid #fde68a', flexShrink: 0 }}>Priority {i + 1} · {str(g.object)}</span>
                </div>
                <code style={{ display: 'block', fontSize: 12, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', marginBottom: 6, color: '#1a1a18' }}>{str(g.condition)}</code>
                <p style={{ fontSize: 12, color: '#6b6b67', margin: 0, lineHeight: 1.5 }}>{str(g.reason)}</p>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const { data: authSession, status } = useSession()
  const { uuid } = useParams() as { uuid: string }
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [results, setResults] = useState<Recommendations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandAll, setExpandAll] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (!authSession) return
    fetch(`/api/sessions/${uuid}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLoading(false); return }
        setSession(d.session)
        setResults(d.results?.recommendations || null)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load results.'); setLoading(false) })
  }, [authSession, uuid])

  if (loading || status === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3' }}>
      <div className="animate-spin" style={{ width: 24, height: 24, border: '2px solid #e5e7eb', borderTopColor: '#374151', borderRadius: '50%' }} />
    </div>
  )

  const profiles = results?.profiles || []

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3' }}>
      {/* Topbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', height: 52, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: '#1a1a18', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
              <rect x="2" y="2" width="5" height="5" rx="1"/>
              <rect x="9" y="2" width="5" height="5" rx="1"/>
              <rect x="2" y="9" width="5" height="5" rx="1"/>
              <rect x="9" y="9" width="5" height="5" rx="1"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Backstory Discovery</span>
          <span style={{ color: 'rgba(0,0,0,0.2)', margin: '0 2px' }}>/</span>
          <button onClick={() => router.push('/dashboard')} style={{ fontSize: 13, color: '#9a9a96', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Dashboard</button>
          <span style={{ color: 'rgba(0,0,0,0.2)', margin: '0 2px' }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18' }}>{session?.customer_name || 'Results'}</span>
        </div>
        {results && (
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(results, null, 2))}
            style={{ background: '#fff', color: '#1a1a18', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}
          >
            Copy JSON
          </button>
        )}
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, padding: '12px 16px', fontSize: 13, marginBottom: 24 }}>{error}</div>}

        {session && (
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>Configuration recommendations</h1>
            <p style={{ fontSize: 13, color: '#6b6b67', margin: 0 }}>
              For {session.customer_name} ({session.customer_email}) · Submitted {session.submitted_at ? new Date(session.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
            </p>
          </div>
        )}

        {!results && session?.status !== 'complete' && (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: 24, height: 24, border: '2px solid #e5e7eb', borderTopColor: '#374151', borderRadius: '50%', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: '#6b6b67', margin: 0 }}>
              {session?.status === 'pending' ? 'Waiting for the customer to submit their form.' : 'Generating AI recommendations… check back in a moment.'}
            </p>
          </div>
        )}

        {results && <>
          {/* Summary */}
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9a9a96', marginBottom: 4 }}>Profiles proposed</div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{profiles.length}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setExpandAll(e => !e)}
                style={{ fontSize: 12, color: '#6b6b67', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7, padding: '6px 12px', background: '#fff', cursor: 'pointer' }}
              >
                {expandAll ? 'Collapse all' : 'Expand all'}
              </button>
            </div>
          </div>

          {/* Profiles */}
          {profiles.map((p, i) => <ProfileCard key={i} profile={p} index={i} forceOpen={expandAll} />)}

          {/* Partner config */}
          {results.partnerConfig?.needed && (
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 14, overflow: 'hidden', marginTop: 16 }}>
              <div style={{ padding: '14px 20px', background: '#f9f9f7', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Partner matching configuration</span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: '#fffbeb', color: '#854d0e', border: '1px solid #fde68a' }}>Recommended</span>
              </div>
              <div style={{ padding: '14px 20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {(results.partnerConfig.fieldValues || []).map((v: string) => (
                    <code key={v} style={{ fontSize: 12, background: '#f5f5f3', borderRadius: 6, padding: '3px 8px', fontFamily: 'monospace' }}>{v}</code>
                  ))}
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#1e40af', lineHeight: 1.5, marginBottom: 8 }}>{str(results.partnerConfig.reason)}</div>
              </div>
            </div>
          )}

          {/* Global notes */}
          {(results.globalNotes || []).length > 0 && (
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 14, overflow: 'hidden', marginTop: 12 }}>
              <div style={{ padding: '14px 20px', background: '#f9f9f7', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Consultant notes</span>
              </div>
              <div style={{ padding: '0 20px' }}>
                {results.globalNotes.map((n: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < results.globalNotes.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', fontSize: 13, color: '#6b6b67', lineHeight: 1.6 }}>
                    <span style={{ flexShrink: 0 }}>📌</span>
                    <span>{str(n)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>}
      </div>
    </div>
  )
}
