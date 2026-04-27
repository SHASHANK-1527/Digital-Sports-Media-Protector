import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { getAssets } from '../services/api'
import { signOut } from '../services/auth'
import { useAnomalyListener } from '../hooks/useAnomalyListener'
import AnomalyAlert from '../components/AnomalyAlert'
import AssetTable from '../components/AssetTable'

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/admin')
      } else {
        setUser(currentUser)
      }
    })
    return unsubscribe
  }, [navigate])

  useEffect(() => {
    const fetchAssets = async () => {
      if (!user) return
      setLoading(true)
      setError('')
      try {
        const token = await user.getIdToken()
        const response = await getAssets(token)
        setAssets(response.data.assets || [])
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load assets.')
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [user])

  const ownerName = useMemo(() => user?.displayName || user?.email || '', [user])
  const alerts = useAnomalyListener(ownerName)

  const totalDetections = useMemo(
    () => assets.reduce((sum, asset) => sum + (asset.detection_count || 0), 0),
    [assets]
  )

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {alerts.length > 0 && <AnomalyAlert alert={alerts[0]} />}

        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">Overview of registered assets, alerts, and detections.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/register"
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Register New Asset
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Registered Assets</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{assets.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Detections</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{totalDetections}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Piracy Alerts</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{alerts.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-900">Registered Assets</h2>
          <p className="mt-2 text-sm text-slate-600">Assets registered under your account.</p>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {loading ? (
            <div className="mt-8 rounded-3xl bg-slate-100 p-8 text-center text-slate-500">Loading assets...</div>
          ) : (
            <div className="mt-8">
              <AssetTable assets={assets} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
