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

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9a9a96' }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {right && <span style={{ fontSize: 11, color: '#9a9a96' }}>{right}</span>}
          <span style={{ fontSize: 11, color: '#9a9a96' }}>{open ? '▾' : '▸'}</span>
        </div>
      </button>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  )
}

function ProfileCard({ profile, index }: { profile: ProfileRecommendation, index: number }) {
  const on = Object.entries(profile.settings).filter(([,v])=>v).map(([k])=>SETTING_NAMES[k])
  const off = Object.entries(profile.settings).filter(([,v])=>!v).map(([k])=>SETTING_NAMES[k])

  return (
    <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', background: '#f9f9f7', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Profile {index + 1}: {profile.name}</div>
            <div style={{ fontSize: 12, color: '#6b6b67', marginTop: 2 }}>For: {profile.targetRoles.join(', ')}</div>
          </div>
          {profile.notificationSetting && (
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {profile.notificationSetting} notifications
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {on.map(s => (
            <span key={s} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>✓ {s}</span>
          ))}
          {off.map(s => (
            <span key={s} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: '#f5f5f5', color: '#aaa', border: '1px solid #e5e5e5', textDecoration: 'line-through' }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Rationale */}
      <Section title="Rationale">
        <p style={{ fontSize: 13, color: '#6b6b67', lineHeight: 1.6 }}>{profile.reason}</p>
        {(profile.specialConsiderations || []).map((c, i) => (
          <div key={i} style={{ marginTop: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#854d0e' }}>⚠ {c}</div>
        ))}
      </Section>

      {/* Eligibility Filters */}
      <Section title="Eligibility filters" right={`${(profile.eligibilityFilters||[]).length} rule${(profile.eligibilityFilters||[]).length !== 1 ? 's' : ''}`}>
        {(profile.eligibilityFilters || []).length === 0 ? (
          <p style={{ fontSize: 13, color: '#9a9a96' }}>No eligibility filters — all records eligible by default.</p>
        ) : (profile.eligibilityFilters || []).map((f, i) => (
          <div key={i} style={{ paddingTop: i > 0 ? 12 : 0, marginTop: i > 0 ? 12 : 0, borderTop: i > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', flexShrink: 0 }}>Eligibility</span>
            </div>
            <p style={{ fontSize: 12, color: '#9a9a96', marginBottom: 6 }}>Object: {f.object}</p>
            <code style={{ display: 'block', fontSize: 12, background: '#f5f5f3', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', marginBottom: 6 }}>{f.rule}</code>
            <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#1e40af', lineHeight: 1.5 }}>{f.reason}</div>
          </div>
        ))}
      </Section>

      {/* Ranking Groups */}
      <Section title="Ranking groups" right={`${(profile.rankingGroups||[]).length} group${(profile.rankingGroups||[]).length !== 1 ? 's' : ''}`}>
        {(profile.rankingGroups || []).length === 0 ? (
          <p style={{ fontSize: 13, color: '#9a9a96' }}>No ranking groups — default score-based ranking applies.</p>
        ) : (profile.rankingGroups || []).map((g, i) => (
          <div key={i} style={{ paddingTop: i > 0 ? 12 : 0, marginTop: i > 0 ? 12 : 0, borderTop: i > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{g.name}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#fffbeb', color: '#854d0e', border: '1px solid #fde68a', flexShrink: 0 }}>Ranking</span>
            </div>
            <p style={{ fontSize: 12, color: '#9a9a96', marginBottom: 6 }}>Priority {i + 1} · {g.object} · {g.type}</p>
            <code style={{ display: 'block', fontSize: 12, background: '#f5f5f3', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', marginBottom: 6 }}>{g.condition}</code>
            <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#1e40af', lineHeight: 1.5 }}>{g.reason}</div>
          </div>
        ))}
      </Section>
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

  const totalFilters = results?.profiles.reduce((n,p) => n + (p.eligibilityFilters||[]).length, 0) || 0
  const totalRanking = results?.profiles.reduce((n,p) => n + (p.rankingGroups||[]).length, 0) || 0

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
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px' }}>Configuration recommendations</h1>
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
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Profiles', value: results.profileCount, sub: 'to create' },
              { label: 'Filters', value: totalFilters, sub: 'eligibility rules' },
              { label: 'Ranking', value: totalRanking, sub: 'ranking groups' },
              { label: 'Partner', value: results.partnerConfig?.needed ? 'Yes' : 'No', sub: 'config needed' },
            ].map(c => (
              <div key={c.label} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9a9a96', marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: 11, color: '#9a9a96', marginTop: 4 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Profiles label */}
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9a9a96', marginBottom: 12 }}>Configuration profiles</p>
          {results.profiles.map((p, i) => <ProfileCard key={i} profile={p} index={i} />)}

          {/* Partner config */}
          {results.partnerConfig?.needed && (
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 14, overflow: 'hidden', marginTop: 20, marginBottom: 12 }}>
              <div style={{ padding: '12px 16px', background: '#f9f9f7', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Partner matching configuration</span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: '#fffbeb', color: '#854d0e', border: '1px solid #fde68a' }}>Recommended</span>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {(results.partnerConfig.fieldValues || []).map(v => (
                    <code key={v} style={{ fontSize: 12, background: '#f5f5f3', borderRadius: 6, padding: '3px 8px', fontFamily: 'monospace' }}>{v}</code>
                  ))}
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#1e40af', lineHeight: 1.5, marginBottom: 8 }}>{results.partnerConfig.reason}</div>
                <p style={{ fontSize: 12, color: '#9a9a96', margin: 0 }}>To configure: contact <strong>support@backstory.ai</strong></p>
              </div>
            </div>
          )}

          {/* Global notes */}
          {(results.globalNotes || []).length > 0 && (
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 14, overflow: 'hidden', marginTop: 16 }}>
              <div style={{ padding: '12px 16px', background: '#f9f9f7', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Consultant notes</span>
              </div>
              <div style={{ padding: '0 16px' }}>
                {results.globalNotes.map((n, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < results.globalNotes.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', fontSize: 13, color: '#6b6b67', lineHeight: 1.6 }}>
                    <span style={{ flexShrink: 0 }}>📌</span>
                    <span>{n}</span>
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
