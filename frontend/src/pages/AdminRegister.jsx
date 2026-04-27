import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { registerAsset } from '../services/api'
import UploadZone from '../components/UploadZone'

export default function AdminRegister() {
  const [file, setFile] = useState(null)
  const [ownerName, setOwnerName] = useState('')
  const [sportCategory, setSportCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

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

  useEffect(() => {
    if (!loading) return
    const interval = window.setInterval(() => {
      setProgress((value) => Math.min(95, value + 10))
    }, 500)
    return () => window.clearInterval(interval)
  }, [loading])

  const previewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : null
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!file) {
      setError('Please select an image or video file to register.')
      return
    }

    if (!sportCategory) {
      setError('Please choose a sport category.')
      return
    }

    const user = auth.currentUser
    if (!user) {
      navigate('/admin')
      return
    }

    setLoading(true)
    setProgress(10)

    try {
      const idToken = await user.getIdToken()
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
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Register New Asset</h1>
            <p className="mt-2 text-sm text-slate-600">Upload official sports media and register it in the system.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Back to dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(event) => setOwnerName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Sport Category</label>
              <select
                value={sportCategory}
                onChange={(event) => setSportCategory(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              >
                <option value="">Select a category</option>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
                <option value="Cricket">Cricket</option>
                <option value="Tennis">Tennis</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">File Upload</label>
            <div className="mt-4">
              <UploadZone
                accept="image/*,video/*"
                maxSizeMB={200}
                onFileSelect={setFile}
                onUrlChange={() => {}}
              />
            </div>
          </div>

          {previewUrl && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              {file.type.startsWith('image/') ? (
                <img src={previewUrl} alt="Preview" className="h-60 w-full rounded-3xl object-cover" />
              ) : (
                <video src={previewUrl} controls className="h-60 w-full rounded-3xl bg-black object-cover" />
              )}
            </div>
          )}

          {loading && (
            <div className="rounded-2xl bg-slate-100 p-4">
              <div className="mb-2 text-sm text-slate-700">Uploading asset...</div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Registering asset...' : 'Register Asset'}
          </button>
        </form>
      </div>
    </div>
  )
}
