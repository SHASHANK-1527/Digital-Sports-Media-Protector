import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import UploadZone from '../components/UploadZone'
import { detectMedia } from '../services/api'

const loadSteps = [
  'Normalizing media...',
  'Generating fingerprint...',
  'Matching against registry...',
  'Analyzing with Gemini...',
]

export default function DetectionPortal() {
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusIndex, setStatusIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) return undefined
    const interval = window.setInterval(() => {
      setStatusIndex((value) => (value + 1) % loadSteps.length)
    }, 900)
    return () => window.clearInterval(interval)
  }, [loading])

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setUrl('')
    setError('')
  }

  const handleUrlChange = (value) => {
    setUrl(value)
    setFile(null)
    setError('')
  }

  const canSubmit = !!file || url.trim().length > 0
  const statusText = loadSteps[statusIndex]

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      if (file) {
        formData.append('file', file)
      } else {
        formData.append('url', url.trim())
      }
      const response = await detectMedia(formData)
      navigate(`/result/${response.data.detection_id}`)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Detection failed. Please try again.')
    } finally {
      setLoading(false)
      setStatusIndex(0)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl bg-white p-10 shadow-xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Public Detection</p>
              <h1 className="mt-6 text-4xl font-semibold text-slate-900">Is this content stolen?</h1>
              <p className="mt-4 max-w-xl text-slate-600">Submit a link or upload a file to check against our official media registry.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <UploadZone
                  accept="image/*,video/*"
                  maxSizeMB={200}
                  onFileSelect={handleFileSelect}
                  onUrlChange={handleUrlChange}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Detecting...' : 'Detect'}
                </button>
                {loading && (
                  <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
                    {statusText}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
