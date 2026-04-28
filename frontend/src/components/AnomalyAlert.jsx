import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AnomalyAlert({ alert }) {
  const [visible, setVisible] = useState(true)
  if (!visible || !alert) return null

  return (
    <motion.div
      className="mb-6 border-l-4 border-dap-danger bg-dap-danger/10 p-4 font-mono text-sm"
      style={{ borderLeftColor: '#E5484D' }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <motion.div
            className="flex items-center gap-2 text-dap-danger"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-lg">🚨</span>
            <span className="font-bold uppercase">[CRITICAL]</span>
          </motion.div>
          <p className="text-dap-text-primary">
            Asset {alert.owner_name || 'UNKNOWN'} spreading without authorization
          </p>
          <p className="text-xs text-dap-text-secondary">
            {alert.detection_count} detections in 24h
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => setVisible(false)}
          className="px-3 py-1 border border-dap-danger text-dap-danger hover:bg-dap-danger/10 transition-colors whitespace-nowrap"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ✕ Dismiss
        </motion.button>
      </div>
    </motion.div>
  )
}

