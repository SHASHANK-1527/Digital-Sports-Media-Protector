export default function ResultCard({ verdict, confidenceScore, matchedOwner, sportCategory, uploadedAt }) {
  const badge = {
    Pirated: 'bg-red-600 text-white',
    Suspicious: 'bg-amber-500 text-slate-900',
    Original: 'bg-green-600 text-white',
    Unknown: 'bg-slate-500 text-white',
  }[verdict] || 'bg-slate-500 text-white'

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${badge}`}>{verdict.toUpperCase()}</p>
          <h2 className="mt-6 text-3xl font-semibold text-slate-900">{Math.round(confidenceScore * 100)}%</h2>
          <p className="mt-2 text-sm text-slate-500">Confidence score</p>
        </div>
        <div className="h-36 w-36 rounded-full border-8 border-slate-100 bg-slate-50 p-6">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-3xl font-bold text-slate-900">
            {Math.round(confidenceScore * 100)}%
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Owner</p>
          <p className="mt-2 text-sm text-slate-900">{matchedOwner || 'Unknown'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Sport</p>
          <p className="mt-2 text-sm text-slate-900">{sportCategory || 'Unknown'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Uploaded</p>
          <p className="mt-2 text-sm text-slate-900">{uploadedAt || 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}
