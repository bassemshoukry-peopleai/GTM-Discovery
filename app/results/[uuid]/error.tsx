'use client'

export default function ResultsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, padding: 40, maxWidth: 480, width: '100%' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#991b1b', marginBottom: 8 }}>Results page error</div>
        <pre style={{ fontSize: 12, color: '#6b6b67', background: '#f5f5f3', borderRadius: 8, padding: 12, overflow: 'auto', whiteSpace: 'pre-wrap', marginBottom: 20 }}>
          {error.message}
          {'\n\n'}
          {error.stack}
        </pre>
        <button onClick={reset} style={{ fontSize: 13, background: '#1a1a18', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', cursor: 'pointer' }}>
          Try again
        </button>
      </div>
    </div>
  )
}
