import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { getAssets } from '../services/api'
import { signOut } from '../services/auth'
import { useAnomalyListener } from '../hooks/useAnomalyListener'
import AnomalyAlert from '../components/AnomalyAlert'
import AssetTable from '../components/AssetTable'

// Count-up number animation component
function CountUpNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let current = 0
    const increment = value / 30
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.round(current))
      }
    }, 30)
    return () => clearInterval(timer)
  }, [value])

  return <>{displayValue}</>
}

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
    <div className="min-h-screen bg-dap-bg px-4 py-10 text-dap-text-primary sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {alerts.length > 0 && <AnomalyAlert alert={alerts[0]} />}

        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <motion.p className="font-mono text-xs text-dap-primary">[ADMIN_CONSOLE_V2]</motion.p>
              <h1 className="font-mono text-3xl font-bold text-dap-text-primary">ASSET MANAGEMENT</h1>
            </div>
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/admin/register"
                  className="inline-block px-6 py-3 border border-dap-accent text-dap-accent hover:bg-dap-accent/10 font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  [REGISTER_ASSET]
                </Link>
              </motion.div>
              <motion.button
                type="button"
                onClick={handleSignOut}
                className="px-6 py-3 border border-dap-text-secondary text-dap-text-secondary hover:border-dap-danger hover:text-dap-danger font-mono text-xs uppercase tracking-wider transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                [LOGOUT]
              </motion.button>
            </motion.div>
          </div>

          {/* Stat cards with colored borders and count-up */}
          <motion.div
            className="grid gap-4 sm:grid-cols-3"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {/* Assets Card */}
            <motion.div
              className="border-l-4 border-dap-primary bg-dap-bg/30 p-6 backdrop-blur-sm"
              style={{ borderLeftColor: '#3A6EA5' }}
              variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
              whileHover={{ translateX: 4 }}
            >
              <p className="font-mono text-xs text-dap-text-secondary uppercase tracking-[0.15em]">[Registered_Assets]</p>
              <motion.p className="mt-3 font-mono text-3xl font-bold text-dap-primary">
                <CountUpNumber value={assets.length} />
              </motion.p>
            </motion.div>

            {/* Detections Card */}
            <motion.div
              className="border-l-4 border-dap-accent bg-dap-bg/30 p-6 backdrop-blur-sm"
              style={{ borderLeftColor: '#FFB020' }}
              variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
              whileHover={{ translateX: 4 }}
            >
              <p className="font-mono text-xs text-dap-text-secondary uppercase tracking-[0.15em]">[Total_Detections]</p>
              <motion.p className="mt-3 font-mono text-3xl font-bold text-dap-accent">
                <CountUpNumber value={totalDetections} />
              </motion.p>
            </motion.div>

            {/* Alerts Card */}
            <motion.div
              className="border-l-4 border-dap-danger bg-dap-bg/30 p-6 backdrop-blur-sm"
              style={{ borderLeftColor: '#E5484D' }}
              variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
              whileHover={{ translateX: 4 }}
            >
              <p className="font-mono text-xs text-dap-text-secondary uppercase tracking-[0.15em]">[Piracy_Alerts]</p>
              <motion.p className="mt-3 font-mono text-3xl font-bold text-dap-danger">
                <CountUpNumber value={alerts.length} />
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Asset Table Section */}
          <motion.div
            className="border border-dap-border bg-dap-bg/30 backdrop-blur-sm p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <h2 className="font-mono text-lg font-bold text-dap-text-primary">[ASSET_REGISTRY]</h2>
                <p className="font-mono text-xs text-dap-text-secondary">
                  {loading ? 'Loading...' : `${assets.length} assets managed by ${ownerName}`}
                </p>
              </div>
            </div>

            {error && (
              <motion.p
                className="mt-4 border border-dap-danger/30 bg-dap-danger/10 p-3 font-mono text-xs text-dap-danger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ⚠ {error}
              </motion.p>
            )}

            {loading ? (
              <div className="mt-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-16 bg-dap-border/20 animate-pulse"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <AssetTable assets={assets} />
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
