export default function ComparisonView({ submittedUrl, originalUrl, similarityScore, matchStart, matchEnd }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Side-by-side comparison</h3>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-700">Submitted</p>
          {submittedUrl ? (
            <div className="aspect-video overflow-hidden rounded-2xl bg-slate-900">
              <img src={submittedUrl} alt="Submitted" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-8 text-sm text-slate-500">No submitted preview available.</div>
          )}
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-700">Matched original</p>
          {originalUrl ? (
            <div className="aspect-video overflow-hidden rounded-2xl bg-slate-900">
              <img src={originalUrl} alt="Matched original" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-8 text-sm text-slate-500">No official asset preview available.</div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">Similarity score</p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            style={{ width: `${similarityScore}%` }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
          />
        </div>
        <p className="mt-2 text-sm text-slate-600">{similarityScore}% similarity</p>
      </div>

      {matchStart != null && matchEnd != null && (
        <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
          Match found: {new Date(matchStart * 1000).toISOString().substr(11, 8)} – {new Date(matchEnd * 1000).toISOString().substr(11, 8)}
        </div>
      )}
    </div>
  )
}
