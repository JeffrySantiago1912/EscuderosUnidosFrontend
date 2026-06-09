import { useRef, useState, DragEvent } from 'react'
import { Upload, File, X, Loader2 } from 'lucide-react'

interface Props {
  mode: 'pdf' | 'image'
  onExtracted: (text: string) => void
  extractFn: (file: File, onProgress?: (pct: number) => void) => Promise<string>
}

export default function FileDropZone({ mode, onExtracted, extractFn }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const accept = mode === 'pdf' ? '.pdf,application/pdf' : 'image/*'
  const label = mode === 'pdf' ? 'PDF' : 'imagen (JPG, PNG, WEBP…)'

  const process = async (f: File) => {
    setFile(f)
    setError(null)
    setLoading(true)
    setProgress(0)
    try {
      const text = await extractFn(f, (pct) => setProgress(pct))
      if (!text) throw new Error('No se pudo extraer texto del archivo')
      onExtracted(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) process(f)
  }

  const clear = () => {
    setFile(null)
    setError(null)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed
                      cursor-pointer transition-all duration-200
                      ${dragging ? 'border-brand-500 bg-brand-50' : 'border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50/40'}`}
        >
          <div className="p-4 rounded-2xl bg-brand-100">
            <Upload className="w-8 h-8 text-brand-700" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">Arrastra aquí tu {label}</p>
            <p className="text-sm text-gray-400 mt-1">o haz clic para seleccionar</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) process(f) }}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-100">
              <File className="w-5 h-5 text-brand-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            {!loading && (
              <button onClick={clear} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {loading && (
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-brand-600 animate-spin shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{mode === 'image' ? 'Reconociendo texto…' : 'Extrayendo texto…'}</span>
                  {mode === 'image' && <span>{progress}%</span>}
                </div>
                {mode === 'image' && (
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
