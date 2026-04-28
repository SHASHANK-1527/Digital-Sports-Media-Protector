import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { signIn } from '../services/auth'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/admin/dashboard')
      }
    })
    return unsubscribe
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dap-bg px-4 py-10 text-dap-text-primary flex items-center justify-center">
      <motion.div
        className="w-full max-w-md border border-dap-border bg-dap-bg/50 backdrop-blur-sm p-8"
        style={{ borderColor: '#3A6EA5', boxShadow: '0 0 30px rgba(58, 110, 165, 0.2)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4">
          <motion.div
            className="font-mono text-xs text-dap-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            // SECURE_ACCESS_PORTAL
          </motion.div>

          <motion.h1
            className="font-mono text-2xl font-bold text-dap-text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            ADMINISTRATOR
            <br />
            AUTHENTICATION
          </motion.h1>
          
          <motion.p
            className="font-mono text-xs text-dap-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Rights holder credentials required
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <label className="block font-mono text-xs text-dap-text-secondary mb-2">EMAIL</label>
            <div className="relative">
              <span className="absolute left-3 top-3 font-mono text-dap-primary">&gt;</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="pl-8 pr-3 w-full bg-dap-bg border border-dap-border text-dap-text-primary font-mono text-sm py-2 outline-none transition-colors focus:border-dap-primary focus:ring-1 focus:ring-dap-primary/30"
                required
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <label className="block font-mono text-xs text-dap-text-secondary mb-2">PASSWORD</label>
            <div className="relative">
              <span className="absolute left-3 top-3 font-mono text-dap-primary">&gt;</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pl-8 pr-3 w-full bg-dap-bg border border-dap-border text-dap-text-primary font-mono text-sm py-2 outline-none transition-colors focus:border-dap-primary focus:ring-1 focus:ring-dap-primary/30"
                required
              />
            </div>
          </motion.div>

          {error && (
            <motion.p
              className="font-mono text-xs text-dap-danger border border-dap-danger/30 bg-dap-danger/5 p-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ⚠ {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 border border-dap-primary text-dap-primary font-mono text-xs uppercase tracking-wider hover:bg-dap-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={!loading ? { scale: 1.01, boxShadow: '0 0 30px rgba(58, 110, 165, 0.3)' } : {}}
            whileTap={!loading ? { scale: 0.99 } : {}}
          >
            {loading ? '[AUTHENTICATING...]' : '[AUTHENTICATE]'}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => navigate('/admin/register')}
            className="w-full py-2 border border-dap-text-secondary text-dap-text-secondary font-mono text-xs uppercase tracking-wider hover:border-dap-primary hover:text-dap-primary transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Register New Account
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
