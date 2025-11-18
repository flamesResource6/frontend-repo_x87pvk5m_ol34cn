import { useState } from 'react'

function App() {
  const [resume, setResume] = useState('')
  const [jd, setJd] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const handleTailor = async () => {
    setError('')
    setResult(null)
    if (!resume.trim() || !jd.trim()) {
      setError('Please paste both the resume and the job description.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${backendBase}/api/tailor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resume, job_description: jd, role_title: roleTitle || null }),
      })
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copyTailored = async () => {
    if (!result?.tailored_resume) return
    await navigator.clipboard.writeText(result.tailored_resume)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(59,130,246,0.1),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(14,165,233,0.1),transparent_30%)]" />

      <header className="relative z-10 py-10 text-center">
        <div className="inline-flex items-center gap-3">
          <img src="/flame-icon.svg" alt="Flames" className="w-10 h-10" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Resume Tailoring Engine</h1>
        </div>
        <p className="mt-3 text-blue-200/80">Transforms resumes to match a job description. Never fabricates information.</p>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/60 border border-blue-500/20 rounded-2xl p-5">
            <label className="block text-sm text-blue-200 mb-2">Target role (optional)</label>
            <input
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g., Senior Product Manager"
              className="w-full bg-slate-900/60 border border-slate-600 focus:border-blue-400 rounded-lg p-3 outline-none mb-4"
            />

            <label className="block text-sm text-blue-200 mb-2">Paste resume</label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your full resume text here..."
              rows={14}
              className="w-full bg-slate-900/60 border border-slate-600 focus:border-blue-400 rounded-lg p-3 outline-none font-mono text-sm"
            />
          </div>

          <div className="bg-slate-800/60 border border-blue-500/20 rounded-2xl p-5">
            <label className="block text-sm text-blue-200 mb-2">Paste job description</label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job description here..."
              rows={18}
              className="w-full bg-slate-900/60 border border-slate-600 focus:border-blue-400 rounded-lg p-3 outline-none font-mono text-sm"
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleTailor}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
              >
                {loading ? 'Tailoring…' : 'Tailor Resume'}
              </button>
              <a href="/test" className="px-5 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600">Check Backend</a>
            </div>

            {error && (
              <div className="mt-4 text-red-300 text-sm bg-red-900/30 border border-red-500/30 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800/60 border border-blue-500/20 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Tailored Resume (ATS-friendly)</h2>
                <button onClick={copyTailored} className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded">Copy</button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-6 bg-slate-900/60 p-4 rounded-lg border border-slate-700 max-h-[60vh] overflow-auto">{result.tailored_resume}</pre>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/60 border border-blue-500/20 rounded-2xl p-5">
                <h3 className="font-semibold mb-2">Matched Keywords</h3>
                <p className="text-sm text-blue-200/80">Appearing in your resume and the job description</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(result.matched_keywords || []).map((k) => (
                    <span key={k} className="text-xs bg-emerald-600/30 border border-emerald-500/30 px-2 py-1 rounded">{k}</span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/60 border border-blue-500/20 rounded-2xl p-5">
                <h3 className="font-semibold mb-2">Missing Keywords</h3>
                <p className="text-sm text-blue-200/80">Present in the job description but not detected in your resume</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(result.missing_but_referenced_keywords || []).map((k) => (
                    <span key={k} className="text-xs bg-amber-600/30 border border-amber-500/30 px-2 py-1 rounded">{k}</span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-blue-300/70">Note: We never add content that isn’t in your resume. Consider incorporating relevant keywords only where accurate.</p>
              </div>

              <div className="bg-slate-800/60 border border-blue-500/20 rounded-2xl p-5">
                <h3 className="font-semibold mb-2">ATS Tips</h3>
                <ul className="list-disc list-inside text-sm text-blue-100/90 space-y-1">
                  {(result.ats_tips || []).map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <p className="mt-10 text-center text-blue-300/70 text-sm">This tool reorganizes and highlights existing content only. It never fabricates roles, dates, or achievements.</p>
      </main>
    </div>
  )
}

export default App
