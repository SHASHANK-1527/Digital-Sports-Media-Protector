import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { registerAsset } from '../services/api'
import UploadZone from '../components/UploadZone'

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export default function AdminRegister() {
  const [file, setFile]                   = useState(null)
  const [ownerName, setOwnerName]         = useState('')
  const [sportCategory, setSportCategory] = useState('')
  const [loading, setLoading]             = useState(false)
  const [progress, setProgress]           = useState(0)
  const [error, setError]                 = useState('')
  const [success, setSuccess]             = useState('')
  const navigate = useNavigate()

  /* Auth guard — redirect if not logged in */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin')
      } else {
        setOwnerName(user.displayName || user.email || '')
      }
    })
    return unsubscribe
  }, [navigate])

  /* Fake progress bar while uploading */
  useEffect(() => {
    if (!loading) return
    const interval = window.setInterval(() => {
      setProgress((v) => Math.min(95, v + 8))
    }, 500)
    return () => window.clearInterval(interval)
  }, [loading])

  /* Object URL for preview */
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!file) { setError('Please select an image or video file to register.'); return }
    if (!sportCategory) { setError('Please choose a sport category.'); return }

    const user = auth.currentUser
    if (!user) { navigate('/admin'); return }

    setLoading(true)
    setProgress(10)

    try {
      const idToken  = await user.getIdToken()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('owner_name', ownerName)
      formData.append('sport_category', sportCategory)

      await registerAsset(formData, idToken)
      setProgress(100)
      setSuccess('Asset registered successfully! Redirecting to dashboard...')
      setTimeout(() => navigate('/admin/dashboard'), 1200)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to register asset.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dap-bg px-4 py-10 text-dap-text-primary sm:px-6">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="space-y-8"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Header row */}
          <motion.div
            variants={item}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <p className="font-mono text-xs text-dap-primary">[ASSET_REGISTRATION]</p>
              <h1 className="font-mono text-2xl font-bold text-dap-text-primary">
                REGISTER NEW ASSET
              </h1>
              <p className="font-mono text-xs text-dap-text-secondary">
                // Upload official sports media and register it in the system
              </p>
            </div>

            <motion.button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="self-start px-4 py-2 border border-dap-text-secondary text-dap-text-secondary hover:border-dap-primary hover:text-dap-primary font-mono text-xs uppercase tracking-wider transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← DASHBOARD
            </motion.button>
          </motion.div>

          {/* Form card */}
          <motion.div
            variants={item}
            className="border border-dap-border bg-dap-bg/50 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Fields grid */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-[0.15em] text-dap-text-secondary mb-2">
                    Owner Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 font-mono text-dap-primary text-sm">&gt;</span>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full pl-8 pr-3 py-3 bg-dap-bg border border-dap-border text-dap-text-primary font-mono text-sm outline-none transition-colors focus:border-dap-primary focus:ring-1 focus:ring-dap-primary/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-[0.15em] text-dap-text-secondary mb-2">
                    Sport Category
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 font-mono text-dap-primary text-sm">&gt;</span>
                    <select
                      value={sportCategory}
                      onChange={(e) => setSportCategory(e.target.value)}
                      className="w-full pl-8 pr-3 py-3 bg-dap-bg border border-dap-border text-dap-text-primary font-mono text-sm outline-none transition-colors focus:border-dap-primary focus:ring-1 focus:ring-dap-primary/30 appearance-none"
                    >
                      <option value="" className="bg-dap-bg">Select a category</option>
                      <option value="Football"   className="bg-dap-bg">Football</option>
                      <option value="Basketball" className="bg-dap-bg">Basketball</option>
                      <option value="Cricket"    className="bg-dap-bg">Cricket</option>
                      <option value="Tennis"     className="bg-dap-bg">Tennis</option>
                      <option value="Other"      className="bg-dap-bg">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Upload zone */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-[0.15em] text-dap-text-secondary mb-3">
                  Media File
                </label>
                <UploadZone
                  accept="image/*,video/*"
                  maxSizeMB={200}
                  onFileSelect={setFile}
                  onUrlChange={() => {}}
                />
              </div>

              {/* Preview */}
              {previewUrl && (
                <motion.div
                  className="border border-dap-border bg-dap-bg/30 p-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="font-mono text-xs text-dap-text-secondary mb-3">[FILE_PREVIEW]</p>
                  {file.type.startsWith('image/') ? (
                    <img src={previewUrl} alt="Preview" className="h-56 w-full object-cover" />
                  ) : (
                    <video src={previewUrl} controls className="h-56 w-full bg-black object-contain" />
                  )}
                </motion.div>
              )}

              {/* Progress bar */}
              {loading && (
                <motion.div
                  className="border border-dap-border bg-dap-bg/30 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="font-mono text-xs text-dap-primary mb-3">
                    [UPLOADING] {progress}%
                  </p>
                  <div className="h-1.5 bg-dap-border overflow-hidden">
                    <motion.div
                      className="h-full bg-dap-primary"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Feedback */}
              {error && (
                <motion.p
                  className="font-mono text-xs text-dap-danger border border-dap-danger/30 bg-dap-danger/5 p-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ⚠ {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  className="font-mono text-xs text-dap-success border border-dap-success/30 bg-dap-success/5 p-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ✓ {success}
                </motion.p>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 border border-dap-accent text-dap-accent hover:bg-dap-accent/10 font-mono text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={!loading ? { scale: 1.01, boxShadow: '0 0 24px rgba(255,176,32,0.25)' } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
              >
                {loading ? '[REGISTERING...]' : '[REGISTER ASSET]'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
