import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import ResultCard from '../components/ResultCard'
import ComparisonView from '../components/ComparisonView'
import SourceIntelligencePanel from '../components/SourceIntelligencePanel'
import { getDetection, getReportUrl } from '../services/api'

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function DetectionResult() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await getDetection(id)
        setResult(response.data)
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Unable to fetch detection result.')
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [id])

  const reportUrl = result ? getReportUrl(id) : ''

  return (
    <div className="min-h-screen bg-dap-bg text-dap-text-primary">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {loading ? (
            /* ── Skeleton ─────────────────────────────────────────────── */
            <div className="space-y-6">
              {[280, 128, 256].map((h, i) => (
                <motion.div
                  key={i}
                  className="animate-pulse bg-dap-border"
                  style={{ height: h }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
          ) : error ? (
            /* ── Error ────────────────────────────────────────────────── */
            <motion.div
              className="border border-dap-danger/30 bg-dap-danger/10 p-6 font-mono text-sm text-dap-danger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ⚠ ERROR: {error}
            </motion.div>
          ) : (
            /* ── Results ──────────────────────────────────────────────── */
            <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show">

              {/* Page header */}
              <motion.div variants={item} className="space-y-1">
                <p className="font-mono text-xs text-dap-primary">[ANALYSIS_COMPLETE]</p>
                <h1 className="font-mono text-2xl font-bold text-dap-text-primary">DETECTION_RESULTS</h1>
              </motion.div>

              {/* Verdict + confidence */}
              <motion.div variants={item}>
                <ResultCard
                  verdict={result.verdict}
                  confidenceScore={result.confidence_score}
                  matchedOwner={result.matched_owner}
                  sportCategory={result.matched_sport_category}
                  uploadedAt={result.matched_upload_date}
                />
              </motion.div>

              {/* Forensic comparison (only when a match exists) */}
              {result.matched_content_id && (
                <motion.div variants={item}>
                  <ComparisonView
                    submittedUrl={result.submitted_url}
                    originalUrl={result.matched_file_url}
                    similarityScore={Math.round((result.similarity_score || 0) * 100)}
                    matchStart={result.timestamp_match_start}
                    matchEnd={result.timestamp_match_end}
                  />
                </motion.div>
              )}

              {/* Source Intelligence Panel */}
              <motion.div variants={item} className="space-y-2">
                <p className="font-mono text-xs text-dap-text-secondary">[SOURCE_INTELLIGENCE]</p>
                <SourceIntelligencePanel
                  data={result.gemini_description}
                  detectionId={result.detection_id}
                  verdict={result.verdict}
                  similarityScore={Math.round((result.similarity_score || 0) * 100)}
                  timestamp={result.detection_timestamp}
                />
              </motion.div>

              {/* Evidence report (Pirated only) */}
              {result.verdict === 'Pirated' && (
                <motion.div
                  variants={item}
                  className="border border-dap-danger/30 bg-dap-danger/5 p-6"
                >
                  <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-dap-danger">
                    [EVIDENCE_REPORT]
                  </h2>
                  <p className="mt-3 font-mono text-xs text-dap-text-secondary">
                    Download PDF for DMCA / platform takedown requests
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <motion.a
                      href={reportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3 border border-dap-danger text-dap-danger hover:bg-dap-danger/10 font-mono text-xs uppercase tracking-wider transition-colors"
                      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(229,72,77,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      [DOWNLOAD_PDF]
                    </motion.a>
                    <motion.button
                      type="button"
                      onClick={() => navigate('/')}
                      className="px-6 py-3 border border-dap-text-secondary text-dap-text-secondary hover:border-dap-primary hover:text-dap-primary font-mono text-xs uppercase tracking-wider transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      [RUN ANOTHER SCAN]
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Run another check (non-pirated) */}
              {result.verdict !== 'Pirated' && (
                <motion.div variants={item} className="flex justify-end">
                  <motion.button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-6 py-3 border border-dap-success text-dap-success hover:bg-dap-success/10 font-mono text-xs uppercase tracking-wider transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    [RUN ANOTHER SCAN]
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
