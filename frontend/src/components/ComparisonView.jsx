import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ComparisonView({ submittedUrl, originalUrl, similarityScore, matchStart, matchEnd }) {
  const [sliderPos, setSliderPos] = useState(50)
  const segments = 20
  const segmentSize = 100 / segments

  // Color coding for segments
  const getSegmentColor = (index) => {
    const percentage = ((index + 1) / segments) * 100
    if (percentage <= 40) return '#4C9A6A' // Green (safe)
    if (percentage <= 70) return '#FFB020' // Amber (warning)
    return '#E5484D' // Red (danger)
  }

  return (
    <motion.div
      className="border border-dap-border bg-dap-bg/50 backdrop-blur-sm p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="font-mono text-lg font-bold text-dap-text-primary">[COMPARISON_ANALYSIS]</h3>

      {/* Image Slider */}
      <motion.div
        className="mt-6 relative overflow-hidden rounded-lg border border-dap-border aspect-video bg-dap-border/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Original image */}
        {originalUrl ? (
          <img src={originalUrl} alt="Matched original" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-dap-border/30 text-dap-text-secondary font-mono text-sm">
            NO_PREVIEW_AVAILABLE
          </div>
        )}

        {/* Submitted image (overlay) */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
          animate={{ width: `${sliderPos}%` }}
        >
          {submittedUrl ? (
            <img src={submittedUrl} alt="Submitted" className="absolute inset-0 w-full h-full object-cover" style={{ left: `${-(100 - sliderPos)}%` }} />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-dap-border/30 text-dap-text-secondary font-mono text-sm">
              NO_PREVIEW
            </div>
          )}
        </motion.div>

        {/* Slider handle */}
        <motion.div
          className="absolute top-0 bottom-0 w-1 bg-dap-primary cursor-col-resize"
          style={{ left: `${sliderPos}%` }}
          drag="x"
          dragConstraints={{ left: 0, right: 1000 }}
          onDrag={(event, info) => {
            const rect = event.currentTarget.parentElement.getBoundingClientRect()
            const newPos = Math.max(0, Math.min(100, (info.x / rect.width) * 100))
            setSliderPos(newPos)
          }}
          whileHover={{ scaleY: 1.2, opacity: 1 }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 -bottom-2 w-10 flex items-center justify-center">
            <div className="w-full h-1 bg-dap-primary/50 rounded-full" />
          </div>
        </motion.div>

        {/* Labels */}
        <div className="absolute bottom-2 left-2 font-mono text-xs text-white bg-black/50 px-2 py-1">SUBMITTED</div>
        <div className="absolute bottom-2 right-2 font-mono text-xs text-white bg-black/50 px-2 py-1">ORIGINAL</div>
      </motion.div>

      {/* Segmented Similarity Bar */}
      <motion.div
        className="mt-6 space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex justify-between items-center">
          <p className="font-mono text-xs text-dap-text-secondary">[SIMILARITY_ANALYSIS]</p>
          <p className="font-mono text-sm text-dap-primary font-bold">{Math.round(similarityScore)}%</p>
        </div>

        <div className="flex gap-0.5 h-4 bg-dap-border/20 p-1">
          {Array.from({ length: segments }).map((_, index) => {
            const fillPercentage = Math.max(0, Math.min(100, (similarityScore / segmentSize - index) * 100))
            return (
              <motion.div
                key={index}
                className="flex-1"
                style={{
                  backgroundColor: getSegmentColor(index),
                  opacity: fillPercentage > 0 ? fillPercentage / 100 : 0.1,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: fillPercentage > 0 ? fillPercentage / 100 : 0.1 }}
                transition={{ duration: 0.5, delay: index * 0.04 }}
              />
            )
          })}
        </div>

        <div className="flex justify-between font-mono text-xs text-dap-text-secondary">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </motion.div>

      {/* Match timing */}
      {matchStart != null && matchEnd != null && (
        <motion.div
          className="mt-4 border-l-4 border-dap-accent bg-dap-border/20 p-3 font-mono text-xs text-dap-text-secondary"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          [MATCH_FOUND] {new Date(matchStart * 1000).toISOString().substr(11, 8)} → {new Date(matchEnd * 1000).toISOString().substr(11, 8)}
        </motion.div>
      )}
    </motion.div>
  )
}
