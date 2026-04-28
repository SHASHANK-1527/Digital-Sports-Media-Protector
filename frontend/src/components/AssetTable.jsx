import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AssetTable({ assets }) {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(assets.length / pageSize))
  const pageAssets = assets.slice((page - 1) * pageSize, page * pageSize)

  return (
    <motion.div
      className="border border-dap-border bg-dap-bg/30 backdrop-blur-sm overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead className="bg-dap-border/20 text-xs uppercase tracking-[0.15em] text-dap-text-secondary border-b border-dap-border">
            <tr>
              <th className="px-4 py-3 text-left">Thumbnail</th>
              <th className="px-4 py-3 text-left">Content_ID</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Sport</th>
              <th className="px-4 py-3 text-left">Uploaded</th>
              <th className="px-4 py-3 text-left">Detections</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dap-border">
            {pageAssets.map((asset, index) => (
              <motion.tr
                key={asset.content_id}
                className="bg-dap-bg/30 hover:bg-dap-border/10 border-l-4 border-dap-primary transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <td className="px-4 py-3">
                  <div className="h-12 w-20 overflow-hidden border border-dap-border/50 bg-dap-border/20">
                    {asset.file_url ? (
                      <img src={asset.file_url} alt={asset.content_id} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-dap-text-secondary">-</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-dap-text-primary break-all">{asset.content_id}</td>
                <td className="px-4 py-3 text-dap-text-primary">{asset.owner_name}</td>
                <td className="px-4 py-3 text-dap-text-primary">{asset.sport_category}</td>
                <td className="px-4 py-3 text-dap-text-secondary">
                  {asset.upload_timestamp ? new Date(asset.upload_timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-4 py-3 text-dap-accent font-bold">{asset.detection_count ?? 0}</td>
                <td className="px-4 py-3">
                  <motion.button
                    className="px-3 py-1 border border-dap-primary text-dap-primary hover:bg-dap-primary/10 text-xs transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    [VIEW]
                  </motion.button>
                </td>
              </motion.tr>
            ))}
            {pageAssets.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center font-mono text-xs text-dap-text-secondary">
                  // no_assets_registered
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <motion.div
        className="flex flex-col gap-3 border-t border-dap-border bg-dap-border/10 px-4 py-3 text-xs text-dap-text-secondary font-mono sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span>page {page} of {totalPages}</span>
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="px-3 py-1 border border-dap-primary text-dap-primary hover:bg-dap-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            whileHover={page > 1 ? { scale: 1.05 } : {}}
            whileTap={page > 1 ? { scale: 0.95 } : {}}
          >
            &lt;
          </motion.button>
          <motion.button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="px-3 py-1 border border-dap-primary text-dap-primary hover:bg-dap-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            whileHover={page < totalPages ? { scale: 1.05 } : {}}
            whileTap={page < totalPages ? { scale: 0.95 } : {}}
          >
            &gt;
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

