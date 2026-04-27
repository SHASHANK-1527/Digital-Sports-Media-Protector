import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { batchDetect, getReportUrl } from '../services/api'

const badgeClasses = {
  Pirated: 'bg-red-600 text-white',
  Suspicious: 'bg-amber-500 text-slate-900',
  Original: 'bg-green-600 text-white',
  Unknown: 'bg-slate-500 text-white',
  Error: 'bg-slate-500 text-white',
}

export default function BatchMonitor() {
  const [urlsText, setUrlsText] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progressIndex, setProgressIndex] = useState(1)
  const [urlCount, setUrlCount] = useState(0)

  useEffect(() => {
    if (!loading || urlCount === 0) return undefined
    const interval = window.setInterval(() => {
      setProgressIndex((value) => Math.min(value + 1, urlCount))
    }, 700)
    return () => window.clearInterval(interval)
  }, [loading, urlCount])

  const urlLines = urlsText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const isValid = urlLines.length > 0 && urlLines.length <= 10

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError('')
    setResults([])
    setUrlCount(urlLines.length)
    setProgressIndex(1)

    try {
      const response = await batchDetect(urlLines)
      setResults(response.data || [])
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Batch detection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (detectionId) => {
    window.open(getReportUrl(detectionId), '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="space-y-8">
          <div className="rounded-3xl bg-white p-10 shadow-xl">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Batch Monitor</p>
              <h1 className="mt-6 text-4xl font-semibold text-slate-900">Run batch checks across multiple URLs</h1>
              <p className="mt-4 max-w-2xl text-slate-600">
                Paste up to 10 asset URLs, one per line, and run the detection pipeline concurrently for each.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <label className="block text-sm font-medium text-slate-700">Asset URLs</label>
              <textarea
                value={urlsText}
                onChange={(event) => setUrlsText(event.target.value)}
                rows={10}
                placeholder="https://example.com/media1.jpg\nhttps://example.com/media2.mp4"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  {urlLines.length} URL{urlLines.length === 1 ? '' : 's'} pasted · max 10
                </p>
                <button
                  type="submit"
                  disabled={!isValid || loading}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Running Batch Check...' : 'Run Batch Check'}
                </button>
              </div>
              {(error || (!isValid && urlsText.trim().length > 0)) && (
                <p className="text-sm text-red-600">
                  {error || 'Please provide between 1 and 10 URLs, one per line.'}
                </p>
              )}

              {loading && (
                <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
                  Checking {progressIndex} of {urlCount} URL{urlCount === 1 ? '' : 's'}...
                </div>
              )}
            </form>
          </div>

          {results.length > 0 && (
            <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-semibold text-slate-900">Batch results</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-600">
                    <tr>
                      <th className="px-6 py-3">URL</th>
                      <th className="px-6 py-3">Verdict</th>
                      <th className="px-6 py-3">Confidence</th>
                      <th className="px-6 py-3">Matched Owner</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                    {results.map((item, index) => {
                      const verdict = item.verdict || (item.error ? 'Error' : 'Unknown')
                      const badge = badgeClasses[verdict] || badgeClasses.Unknown
                      const confidence = typeof item.confidence_score === 'number' ? `${Math.round(item.confidence_score * 100)}%` : '-'
                      return (
                        <tr key={`${item.url}-${index}`}>
                          <td className="px-6 py-4 max-w-xs truncate">{item.url}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
                              {verdict.toUpperCase()}
                            </span>
                            {item.error && <p className="mt-2 text-xs text-red-600">{item.error}</p>}
                          </td>
                          <td className="px-6 py-4">{confidence}</td>
                          <td className="px-6 py-4">{item.matched_owner || '-'}</td>
                          <td className="px-6 py-4">
                            {item.verdict === 'Pirated' && item.detection_id ? (
                              <button
                                type="button"
                                onClick={() => handleDownload(item.detection_id)}
                                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                              >
                                Download Report
                              </button>
                            ) : (
                              <span className="text-sm text-slate-500">-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
