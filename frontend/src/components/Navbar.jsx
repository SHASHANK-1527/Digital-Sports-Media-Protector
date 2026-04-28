import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar() {
  return (
    <motion.nav 
      className="sticky top-0 z-50 bg-dap-bg border-b border-dap-border"
      style={{ borderLeftWidth: '4px', borderLeftColor: '#3A6EA5' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-mono text-sm font-bold text-dap-text-primary">
            <span className="text-dap-primary">[DAP]</span>
            <span className="hidden sm:inline">//</span>
            <span className="hidden sm:inline">CONSOLE</span>
            <motion.span
              className="text-dap-accent"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              █
            </motion.span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/"
              className="font-mono text-xs sm:text-sm text-dap-text-secondary hover:text-dap-primary transition-colors"
            >
              [SCAN]
            </Link>
            <Link
              to="/batch"
              className="font-mono text-xs sm:text-sm text-dap-text-secondary hover:text-dap-primary transition-colors"
            >
              [BATCH]
            </Link>
            <Link
              to="/admin"
              className="font-mono text-xs sm:text-sm px-3 py-1.5 border border-dap-primary text-dap-primary hover:bg-dap-primary hover:text-dap-bg transition-colors"
            >
              [ADMIN]
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
