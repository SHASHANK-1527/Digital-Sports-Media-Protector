import { useState } from 'react'

export default function AnomalyAlert({ alert }) {
  const [visible, setVisible] = useState(true)
  if (!visible || !alert) return null

  return (
    <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">Alert: {alert.owner_name || 'Asset'} has been detected {alert.detection_count} times in the last 24 hours without authorization</p>
          <p className="mt-2 text-sm text-red-800">This asset may be spreading without authorization.</p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded-full bg-red-200 px-3 py-1 text-sm font-semibold text-red-900"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
