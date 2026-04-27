import { useState } from 'react'

export default function AssetTable({ assets }) {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(assets.length / pageSize))
  const pageAssets = assets.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3">Thumbnail</th>
              <th className="px-4 py-3">Content ID</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Sport</th>
              <th className="px-4 py-3">Uploaded</th>
              <th className="px-4 py-3">Detection Count</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {pageAssets.map((asset) => (
              <tr key={asset.content_id}>
                <td className="px-4 py-4">
                  <div className="h-14 w-24 overflow-hidden rounded-xl bg-slate-100">
                    {asset.file_url ? (
                      <img src={asset.file_url} alt={asset.content_id} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-500">No preview</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 font-mono text-xs text-slate-700">{asset.content_id}</td>
                <td className="px-4 py-4 text-slate-700">{asset.owner_name}</td>
                <td className="px-4 py-4 text-slate-700">{asset.sport_category}</td>
                <td className="px-4 py-4 text-slate-500">{asset.upload_timestamp ? new Date(asset.upload_timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                <td className="px-4 py-4 text-slate-700">{asset.detection_count ?? 0}</td>
                <td className="px-4 py-4">
                  <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700">
                    View detections
                  </button>
                </td>
              </tr>
            ))}
            {pageAssets.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                  No assets registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
