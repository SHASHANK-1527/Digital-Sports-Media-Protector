import { useMemo, useState, useRef } from 'react'
import { motion } from 'framer-motion'

export default function UploadZone({ onFileSelect, onUrlChange, accept, maxSizeMB }) {
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be less than ${maxSizeMB}MB.`)
      return
    }
    setError(null)
    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleInputChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    onFileSelect(null)
  }

  const fileSelectedText = useMemo(() => {
    if (!selectedFile) return null
    return `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`
  }, [selectedFile])

  return (
    <div className="space-y-6">
      {/* Circular Radar Scanner */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="relative h-64 w-64 cursor-pointer"
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Outer rings */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 256 256">
            {/* Static rings */}
            <circle cx="128" cy="128" r="120" fill="none" stroke="#1E2530" strokeWidth="1" />
            <circle cx="128" cy="128" r="80" fill="none" stroke="#1E2530" strokeWidth="1" />
            <circle cx="128" cy="128" r="40" fill="none" stroke="#1E2530" strokeWidth="1" />
            
            {/* Grid lines */}
            <line x1="128" y1="8" x2="128" y2="248" stroke="#1E2530" strokeWidth="0.5" />
            <line x1="8" y1="128" x2="248" y2="128" stroke="#1E2530" strokeWidth="0.5" />
          </svg>

          {/* Pulsing rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dap-primary/40"
            animate={dragging ? { scale: [1, 1.2], opacity: [0.4, 0.8] } : { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: dragging ? 0.6 : 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-4 rounded-full border border-dap-primary/30"
            animate={dragging ? { scale: [1, 1.15], opacity: [0.3, 0.6] } : { scale: [1, 1.08, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: dragging ? 0.6 : 1.8, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="absolute inset-8 rounded-full border border-dap-primary/20"
            animate={dragging ? { scale: [1, 1.1], opacity: [0.2, 0.4] } : { scale: [1, 1.05, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: dragging ? 0.6 : 2, repeat: Infinity, delay: 0.4 }}
          />

          {/* Rotating sweep line */}
          <motion.div
            className="absolute inset-0 overflow-hidden rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: dragging ? 1.5 : 3, repeat: Infinity, linear: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dap-primary/40 to-transparent" style={{ width: '2px', left: '50%' }} />
          </motion.div>

          {/* Center upload icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-center"
              animate={dragging ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-4xl text-dap-primary mb-2">⚡</div>
              <p className="font-mono text-xs text-dap-text-secondary">Drop file</p>
            </motion.div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      </motion.div>

      {/* File info */}
      {fileSelectedText && (
        <motion.div
          className="rounded-lg border border-dap-border bg-dap-border/30 px-4 py-3 flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-mono text-sm text-dap-text-primary">{fileSelectedText}</p>
          <motion.button
            type="button"
            onClick={handleRemove}
            className="px-3 py-1 border border-dap-danger text-dap-danger hover:bg-dap-danger/10 transition-colors font-mono text-xs"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✕ Remove
          </motion.button>
        </motion.div>
      )}

      {/* URL Input */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <label className="block font-mono text-xs text-dap-text-secondary">// REMOTE ASSET</label>
        <div className="relative">
          <span className="absolute left-4 top-3 font-mono text-dap-primary">&gt;</span>
          <input
            type="url"
            placeholder="https://example.com/video.mp4"
            onChange={(event) => {
              setSelectedFile(null)
              onFileSelect(null)
              onUrlChange(event.target.value)
            }}
            className="w-full pl-8 pr-4 py-3 font-mono text-sm bg-dap-bg border border-dap-border text-dap-text-primary outline-none transition-colors focus:border-dap-primary focus:ring-1 focus:ring-dap-primary/30"
          />
        </div>
      </motion.div>

      {/* Scan button */}
      <motion.button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-3 border border-dap-primary text-dap-primary font-mono text-sm uppercase tracking-wider hover:bg-dap-primary/10 transition-colors"
        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(58, 110, 165, 0.3)' }}
        whileTap={{ scale: 0.98 }}
      >
        [INITIATE SCAN]
      </motion.button>

      {error && (
        <motion.p
          className="font-mono text-sm text-dap-danger"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ⚠ {error}
        </motion.p>
      )}
    </div>
  )
}
