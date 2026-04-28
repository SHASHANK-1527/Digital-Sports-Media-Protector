import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import UploadZone from '../components/UploadZone'
import { detectMedia } from '../services/api'

const loadSteps = [
  '> Normalizing media payload...',
  '> Extracting perceptual fingerprint...',
  '> Matching against secure registry...',
  '> Querying Gemini intelligence layer...',
  '> Compiling forensic report...',
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
    }, 1200)
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
    <div className="min-h-screen bg-dap-bg text-dap-text-primary">
      <Navbar />

      {/* Loading overlay */}
      {loading && (
        <motion.div
          className="fixed inset-0 bg-dap-bg/95 z-40 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="space-y-8 text-center">
            {/* Radar animation */}
            <motion.div
              className="h-32 w-32 mx-auto relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, linear: true }}
            >
              <svg className="w-full h-full" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="60" fill="none" stroke="#3A6EA5" strokeWidth="1" opacity="0.3" />
                <circle cx="64" cy="64" r="40" fill="none" stroke="#3A6EA5" strokeWidth="1" opacity="0.3" />
                <circle cx="64" cy="64" r="20" fill="none" stroke="#3A6EA5" strokeWidth="1" opacity="0.3" />
                <line x1="64" y1="4" x2="64" y2="124" stroke="#3A6EA5" strokeWidth="0.5" opacity="0.3" />
                <line x1="4" y1="64" x2="124" y2="64" stroke="#3A6EA5" strokeWidth="0.5" opacity="0.3" />
              </svg>
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, linear: true }}
              >
                <div className="w-1 h-full bg-gradient-to-b from-transparent via-dap-primary to-transparent" style={{ marginLeft: '50%' }} />
              </motion.div>
            </motion.div>

            {/* Typewriter status */}
            <motion.div
              className="font-mono text-lg text-dap-primary"
              key={statusText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-dap-text-secondary">{statusText}</span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                █
              </motion.span>
            </motion.div>

            <p className="font-mono text-xs text-dap-text-secondary">scanning_media_asset...</p>
          </div>
        </motion.div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <motion.div
          className="space-y-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              className="inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="font-mono text-sm text-dap-primary">// SYSTEM INITIALIZED</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl font-bold font-mono text-dap-text-primary">
              MEDIA INTELLIGENCE
              <br />
              <span className="text-dap-primary">CONSOLE</span>
            </h1>

            <motion.p
              className="font-mono text-dap-text-secondary max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              // Detect • Analyze • Protect
            </motion.p>
          </div>

          {/* Main form card */}
          <motion.div
            className="border border-dap-border bg-dap-bg/50 backdrop-blur-sm p-8 max-w-2xl mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <UploadZone
                accept="image/*,video/*"
                maxSizeMB={200}
                onFileSelect={handleFileSelect}
                onUrlChange={handleUrlChange}
              />

              {error && (
                <motion.p
                  className="font-mono text-sm text-dap-danger border border-dap-danger/30 bg-dap-danger/5 p-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ⚠ ERROR: {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full py-3 border border-dap-primary text-dap-primary font-mono text-sm uppercase tracking-wider hover:bg-dap-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={!loading && canSubmit ? { scale: 1.01, boxShadow: '0 0 30px rgba(58, 110, 165, 0.4)' } : {}}
                whileTap={!loading && canSubmit ? { scale: 0.99 } : {}}
              >
                {loading ? '[SCANNING...]' : '[INITIATE SCAN]'}
              </motion.button>
            </form>
          </motion.div>

          {/* Info footer */}
          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="font-mono text-xs text-dap-text-secondary">
              supported_formats: JPG • PNG • MP4 • MOV • WebM
            </p>
            <p className="font-mono text-xs text-dap-text-secondary">
              max_file_size: 200MB
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
