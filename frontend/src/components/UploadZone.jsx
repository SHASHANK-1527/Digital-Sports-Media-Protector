import { useMemo, useState, useRef } from 'react'

export default function UploadZone({ onFileSelect, onUrlChange, accept, maxSizeMB }) {
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const acceptedTypes = accept.split(',').map((type) => type.trim())

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
    <div className="space-y-4">
      <div
        className={`rounded-3xl border-2 p-8 text-center transition ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'}`}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-lg font-semibold text-slate-900">Drag & drop a file here</p>
        <p className="mt-2 text-sm text-slate-500">or click to select an image or video</p>
        <p className="mt-4 text-xs text-slate-400">Accepted: JPG, PNG, MP4, MOV, WebM — max {maxSizeMB}MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {fileSelectedText && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-700">{fileSelectedText}</p>
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-lg bg-slate-900 px-3 py-1 text-sm font-medium text-white hover:bg-slate-700"
          >
            Remove
          </button>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Or paste a URL</label>
        <input
          type="url"
          placeholder="https://example.com/video.mp4"
          onChange={(event) => {
            setSelectedFile(null)
            onFileSelect(null)
            onUrlChange(event.target.value)
          }}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
