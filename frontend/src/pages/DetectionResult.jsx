import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ResultCard from '../components/ResultCard'
import ComparisonView from '../components/ComparisonView'
import { getDetection, getReportUrl } from '../services/api'

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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl bg-white p-10 shadow-xl">
          {loading ? (
            <div className="space-y-4">
              <div className="h-8 w-64 rounded-full bg-slate-200" />
              <div className="h-6 w-48 rounded-full bg-slate-200" />
              <div className="h-64 rounded-3xl bg-slate-100" />
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
          ) : (
            <div className="space-y-10">
              <ResultCard
                verdict={result.verdict}
                confidenceScore={result.confidence_score}
                matchedOwner={result.matched_owner}
                sportCategory={result.matched_sport_category}
                uploadedAt={result.matched_upload_date}
              />

              {result.matched_content_id && (
                <ComparisonView
                  submittedUrl={result.submitted_url}
                  originalUrl={result.matched_file_url}
                  similarityScore={Math.round((result.similarity_score || 0) * 100)}
                  matchStart={result.timestamp_match_start}
                  matchEnd={result.timestamp_match_end}
                />
              )}

              {result.gemini_description && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <h2 className="text-xl font-semibold text-slate-900">AI Content Analysis</h2>
                  <p className="mt-4 text-slate-700">{result.gemini_description}</p>
                </div>
              )}

              {result.verdict === 'Pirated' && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <h2 className="text-xl font-semibold text-slate-900">Download Evidence Report</h2>
                  <p className="mt-2 text-sm text-slate-600">Use this PDF for DMCA or platform takedown requests.</p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <a
                      href={reportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                      Download PDF
                    </a>
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Run another check
                    </button>
                  </div>
                </div>
              )}

              {result.verdict !== 'Pirated' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Run another check
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
