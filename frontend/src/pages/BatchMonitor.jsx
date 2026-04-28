import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { batchDetect, getReportUrl } from '../services/api'

const verdictColors = {
  Pirated: { badge: 'bg-dap-danger', text: 'text-dap-danger' },
  Suspicious: { badge: 'bg-dap-accent', text: 'text-dap-accent' },
  Original: { badge: 'bg-dap-success', text: 'text-dap-success' },
  Unknown: { badge: 'bg-dap-text-secondary', text: 'text-dap-text-secondary' },
  Error: { badge: 'bg-dap-text-secondary', text: 'text-dap-text-secondary' },
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
    <div className="min-h-screen bg-dap-bg text-dap-text-primary">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Input Form */}
          <motion.div
            className="border border-dap-border bg-dap-bg/50 backdrop-blur-sm p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mb-8 space-y-3">
              <p className="font-mono text-xs text-dap-primary">[BATCH_INTELLIGENCE_SCAN]</p>
              <h1 className="font-mono text-3xl font-bold text-dap-text-primary">BATCH_MONITOR</h1>
              <p className="font-mono text-xs text-dap-text-secondary max-w-2xl">
                // submit_up_to_10_urls_for_concurrent_detection
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-mono text-xs text-dap-text-secondary uppercase tracking-[0.15em] mb-2">
                  URL_List
                </label>
                <textarea
                  value={urlsText}
                  onChange={(event) => setUrlsText(event.target.value)}
                  rows={10}
                  placeholder="https://example.com/media1.jpg&#10;https://example.com/media2.mp4"
                  className="w-full bg-dap-bg border border-dap-border px-4 py-4 font-mono text-sm text-dap-text-primary outline-none transition-colors focus:border-dap-primary focus:ring-1 focus:ring-dap-primary/30"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-mono text-xs text-dap-text-secondary">
                  {urlLines.length}/{10} URL{urlLines.length === 1 ? '' : 's'}
                </p>
                <motion.button
                  type="submit"
                  disabled={!isValid || loading}
                  className="px-6 py-3 border border-dap-primary text-dap-primary font-mono text-xs uppercase tracking-wider hover:bg-dap-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={!loading && isValid ? { scale: 1.01, boxShadow: '0 0 30px rgba(58, 110, 165, 0.3)' } : {}}
                  whileTap={!loading && isValid ? { scale: 0.99 } : {}}
                >
                  {loading ? '[SCANNING...]' : '[INITIATE_SCAN]'}
                </motion.button>
              </div>

              {(error || (!isValid && urlsText.trim().length > 0)) && (
                <motion.p
                  className="font-mono text-xs text-dap-danger border border-dap-danger/30 bg-dap-danger/5 p-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ⚠ {error || 'Provide 1-10 URLs, one per line'}
                </motion.p>
              )}

              {loading && (
                <motion.div
                  className="bg-dap-border/20 p-3 border border-dap-border font-mono text-sm text-dap-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  $ scanning {progressIndex}/{urlCount} url{urlCount === 1 ? '' : 's'}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    █
                  </motion.span>
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Results Table */}
          {results.length > 0 && (
            <motion.div
              className="border border-dap-border bg-dap-bg/30 backdrop-blur-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="border-b border-dap-border px-6 py-4">
                <h2 className="font-mono text-lg font-bold text-dap-text-primary">[BATCH_RESULTS]</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-dap-text-secondary font-mono">
                  <thead className="bg-dap-border/20 text-xs uppercase tracking-[0.15em] text-dap-text-secondary border-b border-dap-border">
                    <tr>
                      <th className="px-4 py-3 text-left">URL</th>
                      <th className="px-4 py-3 text-left">Verdict</th>
                      <th className="px-4 py-3 text-left">Confidence</th>
                      <th className="px-4 py-3 text-left">Owner</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dap-border">
                    {results.map((item, index) => {
                      const verdict = item.verdict || (item.error ? 'Error' : 'Unknown')
                      const colors = verdictColors[verdict] || verdictColors.Unknown
                      const confidence = typeof item.confidence_score === 'number' ? `${Math.round(item.confidence_score * 100)}%` : '-'
                      return (
                        <motion.tr
                          key={`${item.url}-${index}`}
                          className="bg-dap-bg/30 hover:bg-dap-border/10 border-l-4"
                          style={{ borderLeftColor: verdict === 'Pirated' ? '#E5484D' : verdict === 'Suspicious' ? '#FFB020' : '#4C9A6A' }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ x: 4 }}
                        >
                          <td className="px-4 py-3 truncate max-w-xs">{item.url}</td>
                          <td className="px-4 py-3">
                            <span className={`font-mono text-xs font-bold ${colors.text}`}>
                              [{verdict.toUpperCase()}]
                            </span>
                            {item.error && <p className="mt-1 text-xs text-dap-danger">{item.error}</p>}
                          </td>
                          <td className="px-4 py-3">{confidence}</td>
                          <td className="px-4 py-3">{item.matched_owner || '-'}</td>
                          <td className="px-4 py-3">
                            {item.verdict === 'Pirated' && item.detection_id ? (
                              <motion.button
                                type="button"
                                onClick={() => handleDownload(item.detection_id)}
                                className="px-3 py-1 border border-dap-danger text-dap-danger hover:bg-dap-danger/10 text-xs transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                [REPORT]
                              </motion.button>
                            ) : (
                              <span className="text-xs text-dap-text-secondary">-</span>
                            )}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
