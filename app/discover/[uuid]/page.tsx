'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FormData } from '@/types'

const STEPS = ['Foundation','Accounts','Opportunities','Contacts & Leads','Technology','Review']
const ROLES = ['AEs / Account Executives','BDRs / SDRs','CSMs / Customer Success','Sales Engineers','Channel / Partner Managers','Renewal Managers','Account Managers']

const EMPTY: FormData = {
  userRoles:[], otherRoles:'', hasGeographies:'', geographies:'', hasSegments:'', segments:'',
  accountOwnerRoles:[], accountOwner:'', usesAccountTeams:[],
  customAccountFields:[], accountTypes:[], accountRecordTypes:[],
  excludeAccountTypes:'', hasPartnerSelling:'', partnerDefinition:'',
  oppCreation:'', usesContactRoles:'', oppsPerAccount:'',
  oppOwnerRoles:[], oppOwner:'', usesOppTeams:'',
  customOppFields:[], oppTypes:[], oppRecordTypes:[], excludeOppTypes:'',
  usesLeads:'', leadEngagerRoles:[], leadCreation:'',
  otherTools:'', sfValidations:'', activityLoggingTools:'',
  activityLoggingToolsDetail:'', manualLogging:'', manualFields:''
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  background: '#fff', fontFamily: 'inherit',
}
const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical', minHeight: 80,
}

function TagInput({ field, data, setData, placeholder }: { field: keyof FormData, data: FormData, setData: (d: FormData) => void, placeholder: string }) {
  const [val, setVal] = useState('')
  const values = (data[field] as string[]) || []
  function add() {
    const v = val.trim().replace(/,$/, '')
    if (v && !values.includes(v)) setData({ ...data, [field]: [...values, v] })
    setVal('')
  }
  return (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, minHeight: 42, cursor: 'text', background: '#fff' }}
      onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}
    >
      {values.map(v => (
        <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f5f5f3', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 5, padding: '2px 8px', fontSize: 12, color: '#6b6b67' }}>
          {v}
          <button type="button" onClick={() => setData({ ...data, [field]: values.filter(x => x !== v) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9a9a96', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
        </span>
      ))}
      <input
        style={{ flex: 1, minWidth: 140, fontSize: 13, outline: 'none', background: 'transparent', border: 'none', color: '#1a1a18', padding: '2px 4px', fontFamily: 'inherit' }}
        placeholder={placeholder}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
      />
    </div>
  )
}

function CheckboxGrid({ options, field, data, setData }: any) {
  const values = (data[field] as string[]) || []
  function toggle(v: string) {
    const next = values.includes(v) ? values.filter((x: string) => x !== v) : [...values, v]
    setData({ ...data, [field]: next })
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {options.map((opt: string) => (
        <label key={opt} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', border: `1px solid ${values.includes(opt) ? '#93c5fd' : 'rgba(0,0,0,0.1)'}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, background: values.includes(opt) ? '#eff6ff' : '#fff' }}>
          <input type="checkbox" checked={values.includes(opt)} onChange={() => toggle(opt)} style={{ marginTop: 2, accentColor: '#1a1a18' }} />
          {opt}
        </label>
      ))}
    </div>
  )
}

function RadioStack({ options, field, data, setData, onSelect }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((opt: string) => (
        <label key={opt} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px', border: `1px solid ${data[field] === opt ? '#93c5fd' : 'rgba(0,0,0,0.1)'}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, background: data[field] === opt ? '#eff6ff' : '#fff' }}>
          <input type="radio" name={field} value={opt} checked={data[field] === opt} onChange={() => { setData({ ...data, [field]: opt }); onSelect && onSelect(opt) }} style={{ marginTop: 2, accentColor: '#1a1a18' }} />
          {opt}
        </label>
      ))}
    </div>
  )
}

function Field({ label, hint, children }: { label: string, hint?: string, children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1a1a18', marginBottom: 8 }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 12, color: '#9a9a96', marginTop: 6 }}>{hint}</p>}
    </div>
  )
}

function Card({ title, desc, children }: { title: string, desc?: string, children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, padding: 20, marginBottom: 12 }}>
      <div style={{ borderBottom: '1px solid rgba(0,0,0,0.07)', paddingBottom: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h2>
        {desc && <p style={{ fontSize: 13, color: '#6b6b67', margin: '4px 0 0' }}>{desc}</p>}
      </div>
      {children}
    </div>
  )
}

export default function DiscoverPage() {
  const { uuid } = useParams() as { uuid: string }
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(EMPTY)
  const [sessionInfo, setSessionInfo] = useState<{ customer_name: string, status: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/discover/${uuid}`)
      .then(r => r.json())
      .then(d => {
        if (d.error || !d.session) { setError('This link is invalid or has expired.'); setLoading(false); return }
        if (d.session.status !== 'pending') { setSubmitted(true); setLoading(false); return }
        setSessionInfo(d.session)
        setLoading(false)
      })
      .catch(() => { setError('Could not load this form. Please try again.'); setLoading(false) })
  }, [uuid])

  const roleOptions = [...(data.userRoles.length ? data.userRoles : ROLES), ...(data.otherRoles ? [data.otherRoles] : []), 'Other']

  async function handleSubmit() {
    setSubmitting(true)
    const res = await fetch(`/api/sessions/${uuid}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData: data }),
    })
    if (res.ok) { setSubmitted(true) }
    else { setError('Submission failed. Please try again.'); setSubmitting(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3' }}>
      <div className="animate-spin" style={{ width: 24, height: 24, border: '2px solid #e5e7eb', borderTopColor: '#374151', borderRadius: '50%' }} />
    </div>
  )

  if (error && !sessionInfo) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3' }}>
      <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, padding: 40, maxWidth: 360, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#6b6b67', margin: 0 }}>{error}</p>
      </div>
    </div>
  )

  if (submitted) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3' }}>
      <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, padding: 48, maxWidth: 360, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="22" height="22" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Thank you!</h1>
        <p style={{ fontSize: 13, color: '#6b6b67', margin: 0, lineHeight: 1.6 }}>Your discovery worksheet has been submitted. Your People.ai consultant will be in touch with next steps.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3' }}>
      {/* Header */}
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
          <span style={{ fontWeight: 600, fontSize: 14 }}>People.ai — GTM Discovery</span>
        </div>
        {sessionInfo && <span style={{ fontSize: 13, color: '#9a9a96' }}>{sessionInfo.customer_name}</span>}
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < step ? '#1a1a18' : i === step ? 'rgba(26,26,24,0.3)' : 'rgba(0,0,0,0.1)' }} />
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#9a9a96', marginBottom: 24 }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, padding: '12px 16px', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        {/* Step 0: Foundation */}
        {step === 0 && <>
          <Card title="Your team" desc="Tell us about the roles that will use People.ai. This helps us understand what configuration profiles are needed.">
            <Field label="Which roles will use Backstory? (select all that apply)">
              <CheckboxGrid options={ROLES} field="userRoles" data={data} setData={setData} />
            </Field>
            <Field label="Other roles not listed">
              <input type="text" value={data.otherRoles} onChange={e => setData({...data, otherRoles: e.target.value})} placeholder="e.g., Overlay specialists…" style={inputStyle} />
            </Field>
          </Card>
          <Card title="Team structure" desc="Geographic and segment splits may require separate matching logic.">
            <Field label="Are users split across multiple geographies or territories?">
              <RadioStack options={['Yes','No']} field="hasGeographies" data={data} setData={setData} onSelect={() => {}} />
            </Field>
            {data.hasGeographies === 'Yes' && <Field label="List geographies / territories">
              <input type="text" value={data.geographies} onChange={e => setData({...data, geographies: e.target.value})} placeholder="e.g., AMER, EMEA, APAC" style={inputStyle} />
            </Field>}
            <Field label="Are users organized by business segment?">
              <RadioStack options={['Yes','No']} field="hasSegments" data={data} setData={setData} onSelect={() => {}} />
            </Field>
            {data.hasSegments === 'Yes' && <Field label="List segments">
              <input type="text" value={data.segments} onChange={e => setData({...data, segments: e.target.value})} placeholder="e.g., Enterprise, Commercial, SMB" style={inputStyle} />
            </Field>}
          </Card>
        </>}

        {/* Step 1: Accounts */}
        {step === 1 && <>
          <Card title="Account ownership" desc="Backstory uses account owner as a key matching signal.">
            <Field label="Who typically owns account records? (select all that apply)">
              <CheckboxGrid options={roleOptions} field="accountOwnerRoles" data={data} setData={setData} />
            </Field>
            {(data.accountOwnerRoles || []).includes('Other') && <Field label="Describe other ownership">
              <input type="text" value={data.accountOwner} onChange={e => setData({...data, accountOwner: e.target.value})} placeholder="e.g., Territory managers…" style={inputStyle} />
            </Field>}
            <Field label="How are users associated with account records in Salesforce? (select all that apply)">
              <CheckboxGrid options={['Standard owner field','Standard Account Teams object','Custom ownership lookup fields','Enterprise Territory Management object']} field="usesAccountTeams" data={data} setData={setData} />
            </Field>
            {(data.usesAccountTeams as string[] || []).includes('Custom ownership lookup fields') && (
              <Field label="Custom lookup fields for account ownership" hint="Include the Salesforce API name (e.g., CSM_Owner__c)">
                <TagInput field="customAccountFields" data={data} setData={setData} placeholder="e.g., CSM_Owner__c — press Enter to add" />
              </Field>
            )}
          </Card>
          <Card title="Account types & record types" desc="These drive eligibility filter configuration.">
            <Field label="List relevant Account Type values used by your sales org">
              <TagInput field="accountTypes" data={data} setData={setData} placeholder="e.g., Customer — press Enter to add" />
            </Field>
            <Field label="List relevant Account Record Types used by your sales org">
              <TagInput field="accountRecordTypes" data={data} setData={setData} placeholder="e.g., Strategic Account — press Enter to add" />
            </Field>
            <Field label="Account types / record types that should NEVER receive auto-logged activities">
              <textarea value={data.excludeAccountTypes} onChange={e => setData({...data, excludeAccountTypes: e.target.value})} placeholder="e.g., Competitor, Internal, Investor…" style={textareaStyle} />
            </Field>
            <Field label="Does your org have a partner / channel selling motion?">
              <RadioStack options={['Yes','No']} field="hasPartnerSelling" data={data} setData={setData} onSelect={() => {}} />
            </Field>
            {data.hasPartnerSelling === 'Yes' && <Field label="How are partner accounts identified in Salesforce?">
              <textarea value={data.partnerDefinition} onChange={e => setData({...data, partnerDefinition: e.target.value})} placeholder='e.g., Account.Type = "Partner" or Account.RecordType = "Channel Partner"' style={textareaStyle} />
            </Field>}
          </Card>
        </>}

        {/* Step 2: Opportunities */}
        {step === 2 && <>
          <Card title="Opportunity structure" desc="Multiple open opportunities per account is the biggest driver of matching complexity.">
            <Field label="How are opportunities created?">
              <RadioStack options={['Manually by reps','Automatically via integration (e.g., Outreach, HubSpot)','Both manual and automatic','Marketing / BDR qualified and converted from Lead']} field="oppCreation" data={data} setData={setData} />
            </Field>
            <Field label="How consistently is the Salesforce Opportunity Contact Roles object used?">
              <RadioStack options={['Yes — consistently populated','Yes — but inconsistently or partially','No — not used']} field="usesContactRoles" data={data} setData={setData} />
            </Field>
            <Field label="How many open opportunities typically exist under a single account at once?">
              <RadioStack options={['1 — one active deal per account','2–3 — a few concurrent','4–10 — many active deals','10+ — large enterprise / land-and-expand']} field="oppsPerAccount" data={data} setData={setData} />
            </Field>
            <Field label="Who owns opportunity records? (select all that apply)">
              <CheckboxGrid options={roleOptions} field="oppOwnerRoles" data={data} setData={setData} />
            </Field>
            {(data.oppOwnerRoles || []).includes('Other') && <Field label="Describe other opportunity ownership">
              <input type="text" value={data.oppOwner} onChange={e => setData({...data, oppOwner: e.target.value})} placeholder="e.g., Territory managers…" style={inputStyle} />
            </Field>}
            <Field label="Are Salesforce Opportunity Teams used?">
              <RadioStack options={['Yes','No','Sometimes — for strategic deals']} field="usesOppTeams" data={data} setData={setData} />
            </Field>
            <Field label="Custom ownership lookup fields on Opportunity records">
              <TagInput field="customOppFields" data={data} setData={setData} placeholder="e.g., Sales_Engineer__c — press Enter to add" />
            </Field>
          </Card>
          <Card title="Opportunity types & record types">
            <Field label="List relevant Opportunity Type values used by your sales org">
              <TagInput field="oppTypes" data={data} setData={setData} placeholder="e.g., New Business — press Enter to add" />
            </Field>
            <Field label="List relevant Opportunity Record Types used by your sales org">
              <TagInput field="oppRecordTypes" data={data} setData={setData} placeholder="e.g., Enterprise Opp — press Enter to add" />
            </Field>
            <Field label="Opportunity types / record types to EXCLUDE from matching">
              <textarea value={data.excludeOppTypes} onChange={e => setData({...data, excludeOppTypes: e.target.value})} placeholder="e.g., Internal Testing, Investor…" style={textareaStyle} />
            </Field>
          </Card>
        </>}

        {/* Step 3: Contacts & Leads */}
        {step === 3 && <>
          <Card title="Lead records" desc="Lead matching behavior significantly affects BDR / SDR profile configuration.">
            <Field label="Are Lead records actively used in Salesforce?">
              <RadioStack options={['Yes','No']} field="usesLeads" data={data} setData={setData} onSelect={() => {}} />
            </Field>
            {data.usesLeads === 'Yes' && <>
              <Field label="Who typically engages with Lead records? (select all that apply)">
                <CheckboxGrid options={roleOptions} field="leadEngagerRoles" data={data} setData={setData} />
              </Field>
              <Field label="How and by whom are lead records created?">
                <textarea value={data.leadCreation} onChange={e => setData({...data, leadCreation: e.target.value})} placeholder="e.g., Inbound from HubSpot forms, BDR manual creation…" style={textareaStyle} />
              </Field>
            </>}
          </Card>
        </>}

        {/* Step 4: Technology */}
        {step === 4 && <>
          <Card title="Technology stack" desc="Understanding your full stack prevents duplicate activity logging.">
            <Field label="Other tools supporting your GTM motion">
              <textarea value={data.otherTools} onChange={e => setData({...data, otherTools: e.target.value})} placeholder="e.g., Outreach, SalesLoft, Gong, Marketo, Clari, LeanData…" style={textareaStyle} />
            </Field>
            <Field label="Does any other tool currently auto-log activities to Salesforce?">
              <RadioStack options={['Yes — another tool handles all activity logging','No — People.ai will be the only source','Both tools will run simultaneously']} field="activityLoggingTools" data={data} setData={setData} onSelect={() => {}} />
            </Field>
            {(data.activityLoggingTools === 'Yes — another tool handles all activity logging' || data.activityLoggingTools === 'Both tools will run simultaneously') && <Field label="Which tool(s) currently log activities?">
              <input type="text" value={data.activityLoggingToolsDetail} onChange={e => setData({...data, activityLoggingToolsDetail: e.target.value})} placeholder="e.g., Outreach, SalesLoft, Einstein Activity Capture…" style={inputStyle} />
            </Field>}
          </Card>
          <Card title="Salesforce configuration">
            <Field label="Are there Salesforce validation rules that may block contact creation?">
              <textarea value={data.sfValidations} onChange={e => setData({...data, sfValidations: e.target.value})} placeholder="e.g., Contacts blocked if duplicate email exists; required fields…" style={textareaStyle} />
            </Field>
            <Field label="Do reps manually log activities in Salesforce?">
              <RadioStack options={["Yes — reps manually log most activities","Partially — some log, others don't","No — all logging is automated"]} field="manualLogging" data={data} setData={setData} />
            </Field>
            <Field label="Key fields that reps update manually in Salesforce">
              <textarea value={data.manualFields} onChange={e => setData({...data, manualFields: e.target.value})} placeholder="e.g., Next Steps, MEDDPICC fields, Close Date, Stage…" style={textareaStyle} />
            </Field>
          </Card>
        </>}

        {/* Step 5: Review */}
        {step === 5 && <>
          <Card title="Review your answers" desc="Confirm before submitting.">
            {[
              { section: 'Roles & structure', rows: [
                ['Roles', [...data.userRoles, data.otherRoles].filter(Boolean).join(', ') || '—'],
                ['Geographies', data.hasGeographies === 'Yes' ? data.geographies || 'Yes' : 'None'],
                ['Segments', data.hasSegments === 'Yes' ? data.segments || 'Yes' : 'None'],
              ]},
              { section: 'Accounts', rows: [
                ['Account owners', (data.accountOwnerRoles||[]).join(', ') || '—'],
                ['Account Teams', data.usesAccountTeams || '—'],
                ['Account Types', data.accountTypes.join(', ') || 'None'],
                ['Record Types', data.accountRecordTypes.join(', ') || 'None'],
                ['Excluded', data.excludeAccountTypes || 'None'],
                ['Partner selling', data.hasPartnerSelling || '—'],
              ]},
              { section: 'Opportunities', rows: [
                ['Creation', data.oppCreation || '—'],
                ['Opp owners', (data.oppOwnerRoles||[]).join(', ') || '—'],
                ['Contact Roles', data.usesContactRoles || '—'],
                ['Opps per account', data.oppsPerAccount || '—'],
                ['Opp Types', data.oppTypes.join(', ') || 'None'],
                ['Excluded', data.excludeOppTypes || 'None'],
              ]},
              { section: 'Leads & technology', rows: [
                ['Leads used', data.usesLeads || '—'],
                ['Lead engagers', (data.leadEngagerRoles||[]).join(', ') || '—'],
                ['Activity logging', data.activityLoggingTools || '—'],
                ['SF validations', data.sfValidations || 'None'],
                ['Manual logging', data.manualLogging || '—'],
              ]},
            ].map(({ section, rows }) => (
              <div key={section} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9a9a96', marginBottom: 8 }}>{section}</div>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <tbody>
                    {rows.map(([label, value]) => (
                      <tr key={label} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <td style={{ padding: '8px 12px 8px 0', color: '#6b6b67', width: '40%' }}>{label}</td>
                        <td style={{ padding: '8px 0', color: '#1a1a18' }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </Card>
        </>}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <button
            onClick={() => { setStep(s => s - 1); window.scrollTo(0, 0) }}
            disabled={step === 0}
            style={{ padding: '10px 20px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, fontSize: 13, fontWeight: 500, background: '#fff', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.3 : 1, fontFamily: 'inherit' }}
          >
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => { setStep(s => s + 1); window.scrollTo(0, 0) }}
              style={{ padding: '10px 24px', background: '#1a1a18', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ padding: '10px 24px', background: '#1a1a18', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.4 : 1, fontFamily: 'inherit' }}
            >
              {submitting ? 'Submitting…' : 'Submit worksheet →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
